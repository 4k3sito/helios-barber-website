import { NextResponse } from "next/server"
import { barbers } from "@/lib/barbers"
import { createCalendarEvent } from "@/lib/google-calendar"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { barberId, date, time, clientName, clientEmail, clientPhone } = body

    if (!barberId || !date || !time || !clientName || !clientEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const barber = barbers.find((b) => b.id === barberId)
    if (!barber) {
      return NextResponse.json({ error: "Barber not found" }, { status: 404 })
    }

    await createCalendarEvent(barber.calendarId, {
      barberId,
      date,
      time,
      clientName,
      clientEmail,
      clientPhone: clientPhone || "",
      slotDurationMin: barber.slotDurationMin,
      timeZone: barber.timeZone,
      barberName: barber.name,
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
