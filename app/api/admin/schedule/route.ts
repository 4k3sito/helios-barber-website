import { NextResponse } from "next/server"
import { barbers } from "@/lib/barbers"
import { getAllOverrides, setOverride, clearOverride } from "@/lib/schedule-overrides"

export async function GET() {
  return NextResponse.json({ overrides: getAllOverrides() })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { barberId, date, dayOff, start, end } = body

  if (!barberId || !date || !barbers.find((b) => b.id === barberId)) {
    return NextResponse.json({ error: "barberId inválido" }, { status: 400 })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date inválida" }, { status: 400 })
  }

  if (dayOff) {
    setOverride(barberId, date, { dayOff: true })
  } else if (start && end) {
    if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end) || start >= end) {
      return NextResponse.json({ error: "Horario inválido" }, { status: 400 })
    }
    setOverride(barberId, date, { start, end })
  } else {
    clearOverride(barberId, date)
  }

  return NextResponse.json({ success: true })
}
