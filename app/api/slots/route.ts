import { NextResponse } from "next/server"
import { barbers } from "@/lib/barbers"
import { getBusySlots, generateSlots } from "@/lib/google-calendar"
import { LEAD_TIME_HOURS, ALL_SERVICES } from "@/lib/config"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const barberId = searchParams.get("barberId")
  const dateStr = searchParams.get("date")
  const serviceId = searchParams.get("serviceId")

  if (!barberId || !dateStr || !serviceId) {
    return NextResponse.json({ error: "barberId, date and serviceId required" }, { status: 400 })
  }

  // ponytail: no DB lookup, barbers/services are static config
  const barber = barbers.find((b) => b.id === barberId)
  if (!barber) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 })
  }
  const service = ALL_SERVICES.find((s) => s.id === serviceId)
  if (!service) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 })
  }

  const date = new Date(dateStr + "T12:00:00")
  const busy = await getBusySlots(barber.calendarId, date)
  const slots = generateSlots(
    busy,
    barber.hours,
    barber.slotDurationMin,
    date,
    LEAD_TIME_HOURS,
    barber.timeZone,
    service.durationMin
  )

  return NextResponse.json({ slots })
}
