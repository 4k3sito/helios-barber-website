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
 * "Me da igual": a random barber among those free at this time. Uniform on purpose — ranking by
 * open slots always favoured whoever works the longest hours, even on an empty day.
 */
export function pickAnyBarber(option: SlotOption, random: () => number = Math.random): string {
  return option.barberIds[Math.floor(random() * option.barberIds.length)]
}

/** Calendar-day arithmetic on "YYYY-MM-DD" in UTC, so DST and the local clock never shift the day. */
export function addDays(ymd: string, n: number): string {
  const [y, m, d] = ymd.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}
