import fs from "fs"
import path from "path"

export type ScheduleOverride = { dayOff: true } | { start: string; end: string }
type OverridesByDate = Record<string, ScheduleOverride>
type OverridesByBarber = Record<string, OverridesByDate>

// ponytail: JSON file on disk, no DB. Needs a persistent (non-serverless) host and a
// writable `data/` dir that survives redeploys — swap for a KV/DB if that stops holding.
const FILE_PATH = path.join(process.cwd(), "data", "schedule-overrides.json")

function readAll(): OverridesByBarber {
  try {
    return JSON.parse(fs.readFileSync(FILE_PATH, "utf8"))
  } catch {
    return {}
  }
}

function writeAll(data: OverridesByBarber) {
  fs.mkdirSync(path.dirname(FILE_PATH), { recursive: true })
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2))
}

export function getAllOverrides(): OverridesByBarber {
  return readAll()
}

export function getOverride(barberId: string, date: string): ScheduleOverride | undefined {
  return readAll()[barberId]?.[date]
}

export function setOverride(barberId: string, date: string, override: ScheduleOverride) {
  const all = readAll()
  all[barberId] = { ...all[barberId], [date]: override }
  writeAll(all)
}

export function clearOverride(barberId: string, date: string) {
  const all = readAll()
  if (!all[barberId]) return
  delete all[barberId][date]
  writeAll(all)
}

/** Effective working hours for a barber on a date: null means the barber is off. */
export function getEffectiveHours(
  barber: { hours: { start: string; end: string } },
  barberId: string,
  date: string
): { start: string; end: string } | null {
  const override = getOverride(barberId, date)
  if (!override) return barber.hours
  if ("dayOff" in override) return null
  return override
}
