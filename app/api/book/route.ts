import { NextResponse } from "next/server"
import { barbers, OWNER_CALENDAR_ID } from "@/lib/barbers"
import { createCalendarEvent, generateSlots, getBusySlots } from "@/lib/google-calendar"
import { sendBookingConfirmation } from "@/lib/email"
import { LEAD_TIME_HOURS, ALL_SERVICES } from "@/lib/config"
import { getEffectiveHours } from "@/lib/schedule-overrides"
import { supabase } from "@/lib/db"

// Google Calendar allows overlapping events. Serialize attempts for one barber and
// day inside this running instance, then verify Calendar again immediately before
// inserting the event. The deterministic event id below also protects exact-slot
// duplicates if two requests reach separate instances at the same time.
const bookingQueues = new Map<string, Promise<void>>()

async function withBookingLock<T>(key: string, callback: () => Promise<T>): Promise<T> {
  const previous = bookingQueues.get(key) ?? Promise.resolve()
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  const queue = previous.then(() => gate)
  bookingQueues.set(key, queue)

  await previous
  try {
    return await callback()
  } finally {
    release()
    void queue.then(() => {
      if (bookingQueues.get(key) === queue) bookingQueues.delete(key)
    })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { barberId, serviceId, date, time, clientName, clientEmail, clientPhone } = body

    if (!barberId || !serviceId || !date || !time || !clientName || !clientEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const barber = barbers.find((b) => b.id === barberId)
    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 })
    }
    // ponytail: duration comes from server config, never trust a client-sent value
    const service = ALL_SERVICES.find((s) => s.id === serviceId)
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 })
    }

    // Server-side schedule check: reject bookings on a day off or outside that day's hours
    const [h, m] = time.split(":").map(Number)
    const slotMinutes = h * 60 + m
    const hours = await getEffectiveHours(barber, barberId, date)
    if (!hours) {
      return NextResponse.json({ error: "Este barbero no atiende ese día." }, { status: 409 })
    }
    const [openH, openM] = hours.start.split(":").map(Number)
    const [closeH, closeM] = hours.end.split(":").map(Number)
    if (
      slotMinutes < openH * 60 + openM ||
      slotMinutes + service.durationMin > closeH * 60 + closeM
    ) {
      return NextResponse.json({ error: "Ese horario está fuera del horario disponible." }, { status: 409 })
    }

    // Server-side lead-time check: reject bookings that start too soon.
    // Compare "today" in the barber's own timezone, not UTC — otherwise this flips
    // over at UTC midnight (6pm in America/Mexico_City) and misjudges tomorrow as today.
    const nowLocal = new Date(new Date().toLocaleString("en-US", { timeZone: barber.timeZone }))
    const today = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, "0")}-${String(nowLocal.getDate()).padStart(2, "0")}`
    if (date === today) {
      const nowMinutes = nowLocal.getHours() * 60 + nowLocal.getMinutes()
      if (slotMinutes < nowMinutes + LEAD_TIME_HOURS * 60) {
        return NextResponse.json(
          { error: `Este horario ya no está disponible. Elige al menos ${LEAD_TIME_HOURS} horas después.` },
          { status: 409 }
        )
      }
    }

    const eventDetails = {
      barberId,
      date,
      time,
      clientName,
      clientEmail,
      clientPhone: clientPhone || "",
      slotDurationMin: service.durationMin,
      timeZone: barber.timeZone,
      barberName: barber.name,
      serviceName: service.name,
    }

    return await withBookingLock(`${barberId}:${date}`, async () => {
      // The page can be stale while another client books. Calendar is the source
      // of truth, so check it again at the last possible moment before insertion.
      const bookingDate = new Date(`${date}T12:00:00Z`)
      const busy = await getBusySlots(barber.calendarId, bookingDate, barber.timeZone)
      const availableSlots = generateSlots(
        busy,
        hours,
        barber.slotDurationMin,
        bookingDate,
        LEAD_TIME_HOURS,
        barber.timeZone,
        service.durationMin
      )
      if (!availableSlots.includes(time)) {
        return NextResponse.json(
          { error: "Este horario acaba de ser reservado. Elige otro horario." },
          { status: 409 }
        )
      }

      try {
        await createCalendarEvent(barber.calendarId, eventDetails)
      } catch (e) {
        const status = e && typeof e === "object" && "response" in e
          ? (e as { response?: { status?: number } }).response?.status
          : undefined
        if (status === 409) {
          return NextResponse.json(
            { error: "Este horario acaba de ser reservado. Elige otro horario." },
            { status: 409 }
          )
        }
        throw e
      }

      // ponytail: Calendar is still the source of truth for availability; this row is just a record.
      // Don't fail the booking if the DB insert hiccups — the appointment already exists on Calendar.
      const { error: insertError } = await supabase.from("appointments").insert({
        barber_id: barberId,
        service_id: serviceId,
        date,
        time,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone || null,
      })
      if (insertError) console.error("Appointment DB insert failed:", insertError.message)

      // ponytail: mirror onto the owner's calendar so one place shows every barber's schedule;
      // don't fail the booking if the owner hasn't shared his calendar with the service account yet
      try {
        await createCalendarEvent(OWNER_CALENDAR_ID, eventDetails)
      } catch (e) {
        console.error("Owner calendar mirror failed:", e instanceof Error ? e.message : e)
      }

      // ponytail: the booking already succeeded via Calendar; don't fail the request if the email hiccups
      try {
        await sendBookingConfirmation({
          clientName,
          clientEmail,
          barberName: barber.name,
          serviceName: service.name,
          date,
          time,
        })
      } catch (e) {
        console.error("Confirmation email failed:", e instanceof Error ? e.message : e)
      }

      return NextResponse.json({ success: true })
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Booking failed"
    const detail = e && typeof e === "object" && "response" in e
      ? JSON.stringify((e as { response?: { data?: unknown } }).response?.data)
      : ""
    console.error("Book error:", message, detail)
    return NextResponse.json({ error: message, detail }, { status: 500 })
  }
}
