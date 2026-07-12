import { google } from "googleapis"
import { createHash } from "crypto"
import { CONTACT } from "./config"

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

function addDays(date: string, days: number) {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

// ponytail: a bare "YYYY-MM-DDTHH:MM:SS" is parsed as the SERVER's local time, not the
// barber's. Production runs UTC, so an unlabeled "20:00" became 8pm UTC (2pm CDMX) — 6h off
// from what it should mean, silently colliding with unrelated bookings 6h earlier. Appending
// the real offset for the barber's zone fixes the comparison regardless of server TZ.
function tzOffset(date: Date, timeZone: string): string {
  const part = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName")?.value
  return !part || part === "GMT" ? "+00:00" : part.slice(3)
}

function localDateTime(date: string, time: string, timeZone: string) {
  // Noon avoids shifting the intended calendar day when the server runs in UTC.
  const reference = new Date(`${date}T12:00:00Z`)
  return `${date}T${time}:00${tzOffset(reference, timeZone)}`
}

/** RFC 3339 bounds for a complete calendar day in the barber's timezone. */
export function getCalendarDayBounds(date: Date, timeZone: string) {
  const day = toDateString(date)
  return {
    timeMin: localDateTime(day, "00:00", timeZone),
    timeMax: localDateTime(addDays(day, 1), "00:00", timeZone),
  }
}

export interface BusySlot {
  start: string
  end: string
}

export async function getBusySlots(
  calendarId: string,
  date: Date,
  timeZone: string
): Promise<BusySlot[]> {
  if (!calendarId) return []

  const cal = getCalendar()
  const { timeMin, timeMax } = getCalendarDayBounds(date, timeZone)

  const res = await cal.freebusy.query({
    requestBody: {
      timeMin,
      timeMax,
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

  // ponytail: compute "now" in the barber's timezone for lead-time cutoff. Must compare
  // dates in that same timezone too — comparing against a UTC "today" flips over at UTC
  // midnight (e.g. 6pm in America/Mexico_City), wrongly treating tomorrow as today and
  // blocking every slot once the barber's closing time has passed in UTC terms.
  let cutoffMinutes = 0
  const nowLocal = timeZone
    ? new Date(new Date().toLocaleString("en-US", { timeZone }))
    : new Date()
  const todayStr = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, "0")}-${String(nowLocal.getDate()).padStart(2, "0")}`
  if (leadTimeHours > 0 && toDateString(date) === todayStr) {
    cutoffMinutes = nowLocal.getHours() * 60 + nowLocal.getMinutes() + leadTimeHours * 60
  }

  // ponytail: step by slotMin (grid granularity) but block using durationMin
  // (the actual service length), so a long service can't overlap the next appointment
  for (let m = openMinutes; m + durationMin <= closeMinutes; m += slotMin) {
    // Skip slots that start before the cutoff (today only)
    if (cutoffMinutes > 0 && m < cutoffMinutes) continue

    const h = Math.floor(m / 60)
    const min = m % 60
    const offset = timeZone ? tzOffset(date, timeZone) : ""
    const startIso = `${toDateString(date)}T${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}:00${offset}`

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

/**
 * A deterministic Calendar event id makes a duplicate submission for the exact
 * same barber/date/time fail at Google Calendar instead of creating two events.
 * Google accepts lowercase base32hex characters; a SHA-256 hex digest satisfies it.
 */
export function bookingEventId(booking: Pick<Booking, "barberId" | "date" | "time">) {
  const source = `${booking.barberId}:${booking.date}:${booking.time}`
  return `h${createHash("sha256").update(source).digest("hex")}`
}

export async function createCalendarEvent(
  calendarId: string,
  booking: Booking,
  eventId: string = bookingEventId(booking)
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
      id: eventId,
      summary: `✂️ ${booking.clientName} - ${booking.barberName} (${booking.serviceName})`,
      description: `Name: ${booking.clientName}\nEmail: ${booking.clientEmail}\nPhone: ${booking.clientPhone}\nService: ${booking.serviceName}`,
      location: CONTACT.address,
      start: { dateTime: startDateTime, timeZone: booking.timeZone },
      end: { dateTime: endDateTime, timeZone: booking.timeZone },
    },
  })
}
