import { NextResponse } from "next/server"
import { barbers } from "@/lib/barbers"
import { createCalendarEvent } from "@/lib/google-calendar"
import { LEAD_TIME_HOURS, ALL_SERVICES } from "@/lib/config"

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

    // Server-side lead-time check: reject bookings that start too soon
    const [h, m] = time.split(":").map(Number)
    const slotMinutes = h * 60 + m
    const today = new Date().toISOString().slice(0, 10)
    if (date === today) {
      const nowLocal = new Date(new Date().toLocaleString("en-US", { timeZone: barber.timeZone }))
      const nowMinutes = nowLocal.getHours() * 60 + nowLocal.getMinutes()
      if (slotMinutes < nowMinutes + LEAD_TIME_HOURS * 60) {
        return NextResponse.json(
          { error: `Este horario ya no está disponible. Elige al menos ${LEAD_TIME_HOURS} horas después.` },
          { status: 409 }
        )
      }
    }

    await createCalendarEvent(barber.calendarId, {
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
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Booking failed"
    const detail = e && typeof e === "object" && "response" in e
      ? JSON.stringify((e as { response?: { data?: unknown } }).response?.data)
      : ""
    console.error("Book error:", message, detail)
    return NextResponse.json({ error: message, detail }, { status: 500 })
  }
}
