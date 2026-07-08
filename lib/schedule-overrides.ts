import { supabase } from "@/lib/db"

export type ScheduleOverride = { dayOff: true } | { start: string; end: string }
type OverridesByDate = Record<string, ScheduleOverride>
type OverridesByBarber = Record<string, OverridesByDate>

interface OverrideRow {
  barber_id: string
  date: string
  day_off: boolean
  start_time: string | null
  end_time: string | null
}

function toOverride(row: OverrideRow): ScheduleOverride {
  return row.day_off ? { dayOff: true } : { start: row.start_time!.slice(0, 5), end: row.end_time!.slice(0, 5) }
}

export async function getAllOverrides(): Promise<OverridesByBarber> {
  const { data, error } = await supabase.from("schedule_overrides").select("*")
  if (error) throw error
  const result: OverridesByBarber = {}
  for (const row of (data ?? []) as OverrideRow[]) {
    result[row.barber_id] = { ...result[row.barber_id], [row.date]: toOverride(row) }
  }
  return result
}

export async function getOverride(barberId: string, date: string): Promise<ScheduleOverride | undefined> {
  const { data, error } = await supabase
    .from("schedule_overrides")
    .select("*")
    .eq("barber_id", barberId)
    .eq("date", date)
    .maybeSingle()
  if (error) throw error
  return data ? toOverride(data as OverrideRow) : undefined
}

export async function setOverride(barberId: string, date: string, override: ScheduleOverride) {
  const dayOff = "dayOff" in override
  const { error } = await supabase.from("schedule_overrides").upsert(
    {
      barber_id: barberId,
      date,
      day_off: dayOff,
      start_time: dayOff ? null : override.start,
      end_time: dayOff ? null : override.end,
    },
    { onConflict: "barber_id,date" }
  )
  if (error) throw error
}

export async function clearOverride(barberId: string, date: string) {
  const { error } = await supabase.from("schedule_overrides").delete().eq("barber_id", barberId).eq("date", date)
  if (error) throw error
}

/** Effective working hours for a barber on a date: null means the barber is off. */
export async function getEffectiveHours(
  barber: { hours: { start: string; end: string } },
  barberId: string,
  date: string
): Promise<{ start: string; end: string } | null> {
  const override = await getOverride(barberId, date)
  if (!override) return barber.hours
  if ("dayOff" in override) return null
  return override
}
