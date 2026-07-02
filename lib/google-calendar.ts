import { google } from "googleapis"

// ponytail: base64-encoded PEM avoids multi-line env var headaches
function getCredentials() {
  const b64 = process.env.GCAL_PRIVATE_KEY_BASE64
  if (b64) {
    return {
      client_email: process.env.GCAL_CLIENT_EMAIL,
      private_key: Buffer.from(b64, "base64").toString("utf8"),
    }
  }
  // Fallback: multi-line from .env with \\n replacement
  return {
    client_email: process.env.GCAL_CLIENT_EMAIL,
    private_key: (process.env.GCAL_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  }
}

function getCalendar() {
  const creds = getCredentials()
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  })
  return google.calendar({ version: "v3", auth })
}

function toDateString(d: Date) {
  return d.toISOString().slice(0, 10)
}

export interface BusySlot {
  start: string
  end: string
}

export async function getBusySlots(
  calendarId: string,
  date: Date
): Promise<BusySlot[]> {
  if (!calendarId) return []

  const cal = getCalendar()
  const day = toDateString(date)

  const res = await cal.freebusy.query({
    requestBody: {
      timeMin: `${day}T00:00:00Z`,
      timeMax: `${day}T23:59:59Z`,
      items: [{ id: calendarId }],
    },
  })

  return (res.data.calendars?.[calendarId]?.busy || []).map((b) => ({
    start: b.start || "",
    end: b.end || "",
  }))
}

export function generateSlots(
  busy: BusySlot[],
  hours: { start: string; end: string },
  slotMin: number,
  date: Date,
  leadTimeHours: number = 0,
  timeZone?: string,
  durationMin: number = slotMin
): string[] {
  const slots: string[] = []
  const [openH, openM] = hours.start.split(":").map(Number)
  const [closeH, closeM] = hours.end.split(":").map(Number)
  const openMinutes = openH * 60 + openM
  const closeMinutes = closeH * 60 + closeM

  // ponytail: compute "now" in the barber's timezone for lead-time cutoff
  let cutoffMinutes = 0
  const todayStr = toDateString(new Date())
  if (leadTimeHours > 0 && toDateString(date) === todayStr) {
    const nowLocal = timeZone
      ? new Date(new Date().toLocaleString("en-US", { timeZone }))
      : new Date()
    cutoffMinutes = nowLocal.getHours() * 60 + nowLocal.getMinutes() + leadTimeHours * 60
  }

  // ponytail: step by slotMin (grid granularity) but block using durationMin
  // (the actual service length), so a long service can't overlap the next appointment
  for (let m = openMinutes; m + durationMin <= closeMinutes; m += slotMin) {
    // Skip slots that start before the cutoff (today only)
    if (cutoffMinutes > 0 && m < cutoffMinutes) continue

    const h = Math.floor(m / 60)
    const min = m % 60
    const startIso = `${toDateString(date)}T${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:00`

    const startMs = new Date(startIso).getTime()
    const endMs = startMs + durationMin * 60_000

    const overlaps = busy.some(
      (b) =>
        new Date(b.start).getTime() < endMs &&
        new Date(b.end).getTime() > startMs
    )
    if (!overlaps) {
      slots.push(
        `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`
      )
    }
  }

  return slots
}

export interface Booking {
  barberId: string
  date: string
  time: string
  clientName: string
  clientEmail: string
  clientPhone: string
  slotDurationMin: number
  timeZone: string
  barberName: string
  serviceName: string
}

export async function createCalendarEvent(
  calendarId: string,
  booking: Booking
) {
  const cal = getCalendar()
  const startDateTime = `${booking.date}T${booking.time}:00`

  // ponytail: compute end time as a local-time string, not via toISOString
  const [h, m] = booking.time.split(":").map(Number)
  const totalMin = h * 60 + m + booking.slotDurationMin
  const endH = Math.floor(totalMin / 60)
  const endM = totalMin % 60
  const endDateTime = `${booking.date}T${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`

  await cal.events.insert({
    calendarId,
    requestBody: {
      summary: `✂️ ${booking.clientName} - ${booking.barberName} (${booking.serviceName})`,
      description: `Name: ${booking.clientName}\nEmail: ${booking.clientEmail}\nPhone: ${booking.clientPhone}\nService: ${booking.serviceName}`,
      start: { dateTime: startDateTime, timeZone: booking.timeZone },
      end: { dateTime: endDateTime, timeZone: booking.timeZone },
    },
  })
}
