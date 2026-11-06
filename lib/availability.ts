export interface SlotOption {
  time: string
  barberIds: string[]
}

/** Merges each barber's free slots into one time-ordered list, keeping who is free at each time. */
export function mergeSlots(perBarber: { barberId: string; slots: string[] }[]): SlotOption[] {
  const byTime = new Map<string, string[]>()
  for (const { barberId, slots } of perBarber) {
    for (const time of slots) byTime.set(time, [...(byTime.get(time) ?? []), barberId])
  }
  // "HH:MM" is zero-padded, so string order is time order
  return [...byTime]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, barberIds]) => ({ time, barberIds }))
}

/**
 * "Me da igual": the barber free at this time who has the most open slots that day,
 * so clients without a preference spread toward whoever is least booked.
 */
export function leastBooked(option: SlotOption, day: SlotOption[]): string {
  const openSlots = (id: string) => day.filter((o) => o.barberIds.includes(id)).length
  return option.barberIds.reduce((best, id) => (openSlots(id) > openSlots(best) ? id : best))
}

/** Calendar-day arithmetic on "YYYY-MM-DD" in UTC, so DST and the local clock never shift the day. */
export function addDays(ymd: string, n: number): string {
  const [y, m, d] = ymd.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}
