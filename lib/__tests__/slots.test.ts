import { describe, it, expect } from "vitest"
import { bookingEventId, generateSlots, getCalendarDayBounds, type BusySlot } from "@/lib/google-calendar"

function date(day = "2026-06-25") {
  return new Date(day + "T12:00:00")
}

describe("generateSlots", () => {
  it("uses the full local calendar day when querying Google Calendar", () => {
    expect(getCalendarDayBounds(date("2026-07-08"), "America/Mexico_City")).toEqual({
      timeMin: "2026-07-08T00:00:00-06:00",
      timeMax: "2026-07-09T00:00:00-06:00",
    })
  })

  it("blocks an evening CDMX booking returned by Google Calendar", () => {
    const busy: BusySlot[] = [
      // 18:00–19:00 in CDMX on July 8 (midnight to 1am UTC on July 9).
      { start: "2026-07-09T00:00:00Z", end: "2026-07-09T01:00:00Z" },
    ]
    const slots = generateSlots(
      busy,
      { start: "17:00", end: "19:00" },
      30,
      date("2026-07-08"),
      0,
      "America/Mexico_City",
      30
    )

    expect(slots).toEqual(["17:00", "17:30"])
  })

  it("creates the same Calendar event id for the same barber and time", () => {
    const booking = { barberId: "alexis", date: "2026-07-08", time: "10:30" }
    expect(bookingEventId(booking)).toBe(bookingEventId(booking))
    expect(bookingEventId(booking)).toMatch(/^h[0-9a-f]{64}$/)
    expect(bookingEventId(booking)).not.toBe(bookingEventId({ ...booking, time: "11:00" }))
  })

  it("returns all slots when nothing is busy", () => {
    const slots = generateSlots([], { start: "09:00", end: "17:00" }, 60, date())
    expect(slots).toEqual([
      "09:00", "10:00", "11:00", "12:00",
      "13:00", "14:00", "15:00", "16:00",
    ])
  })

  it("skips slots that overlap with busy periods", () => {
    const busy: BusySlot[] = [
      { start: "2026-06-25T10:00:00", end: "2026-06-25T11:30:00" },
    ]
    const slots = generateSlots(busy, { start: "09:00", end: "12:00" }, 30, date())
    // 09:00, 09:30 available; 10:00 and 10:30 blocked; 11:00 blocked (ends 11:30, slot 11:00-11:30 overlaps); 11:30 available
    expect(slots).toEqual(["09:00", "09:30", "11:30"])
  })

  it("excludes a slot that exactly touches a busy period start", () => {
    const busy: BusySlot[] = [
      { start: "2026-06-25T10:00:00", end: "2026-06-25T11:00:00" },
    ]
    const slots = generateSlots(busy, { start: "09:00", end: "12:00" }, 30, date())
    expect(slots).toEqual(["09:00", "09:30", "11:00", "11:30"])
  })

  it("handles multiple busy periods", () => {
    const busy: BusySlot[] = [
      { start: "2026-06-25T10:00:00", end: "2026-06-25T10:30:00" },
      { start: "2026-06-25T14:00:00", end: "2026-06-25T15:00:00" },
    ]
    const slots = generateSlots(busy, { start: "09:00", end: "17:00" }, 30, date())
    expect(slots).toContain("09:00")
    expect(slots).toContain("10:30")
    expect(slots).not.toContain("10:00")
    expect(slots).not.toContain("14:00")
    expect(slots).not.toContain("14:30")
    expect(slots).toContain("15:00")
    expect(slots).toContain("16:30")
  })

  it("returns empty array when full day is busy", () => {
    const busy: BusySlot[] = [
      { start: "2026-06-25T09:00:00", end: "2026-06-25T17:00:00" },
    ]
    const slots = generateSlots(busy, { start: "09:00", end: "17:00" }, 30, date())
    expect(slots).toEqual([])
  })

  it("respects different slot durations", () => {
    const slots = generateSlots([], { start: "09:00", end: "11:00" }, 60, date())
    expect(slots).toEqual(["09:00", "10:00"])
  })

  it("handles irregular hours", () => {
    const slots = generateSlots([], { start: "10:30", end: "15:15" }, 30, date())
    // 10:30 + 30min steps until 15:15, last start = 14:30 (14:30+30min = 15:00 <= 15:15)
    expect(slots).toEqual([
      "10:30", "11:00", "11:30", "12:00",
      "12:30", "13:00", "13:30", "14:00", "14:30",
    ])
  })

  describe("service duration (durationMin)", () => {
    it("blocks slots where a longer service would overlap a busy period", () => {
      const busy: BusySlot[] = [
        { start: "2026-06-25T10:30:00", end: "2026-06-25T11:00:00" },
      ]
      // 30-min grid, but each appointment takes 80min (e.g. Corte + Barba)
      const slots = generateSlots(busy, { start: "09:00", end: "13:00" }, 30, date(), 0, undefined, 80)
      // 09:30 would run 09:30-10:50, overlapping the 10:30-11:00 busy block -> blocked
      expect(slots).not.toContain("09:30")
      // 09:00 runs 09:00-10:20, clear of the busy block -> available
      expect(slots).toContain("09:00")
      // 11:00 runs 11:00-12:20, clear -> available
      expect(slots).toContain("11:00")
    })

    it("excludes a start time whose service duration would run past closing", () => {
      const slots = generateSlots([], { start: "09:00", end: "10:00" }, 30, date(), 0, undefined, 45)
      expect(slots).toEqual(["09:00"])
    })

    it("defaults durationMin to slotMin when omitted (backward compatible)", () => {
      const slots = generateSlots([], { start: "09:00", end: "10:00" }, 30, date())
      expect(slots).toEqual(["09:00", "09:30"])
    })
  })

  describe("timezone-aware overlap check", () => {
    it("does not let a same-day-earlier booking phantom-block a slot 6h later (UTC-6 zones)", () => {
      // Real booking at 14:30 CDMX (America/Mexico_City, UTC-6) -> Google reports it as 20:30Z-21:25Z.
      // A naive (offset-less) candidate for "20:00" gets parsed as 20:00 UTC = 2pm CDMX,
      // which wrongly overlaps this busy block. With the timezone fix it must not.
      const busy: BusySlot[] = [{ start: "2026-07-08T20:30:00Z", end: "2026-07-08T21:25:00Z" }]
      const slots = generateSlots(
        busy,
        { start: "12:00", end: "21:00" },
        30,
        new Date("2026-07-08T12:00:00"),
        0,
        "America/Mexico_City",
        55
      )
      expect(slots).toContain("20:00")
    })
  })

  describe("lead time", () => {
    it("leadTimeHours=0 does not filter (backward compatible)", () => {
      const slots = generateSlots([], { start: "09:00", end: "11:00" }, 30, date(), 0)
      expect(slots).toEqual(["09:00", "09:30", "10:00", "10:30"])
    })

    it("does not filter future dates even with high lead time", () => {
      // "2026-12-25" is in the future → no cutoff applied
      const future = new Date("2026-12-25T12:00:00")
      const slots = generateSlots([], { start: "09:00", end: "17:00" }, 60, future, 99)
      expect(slots).toEqual([
        "09:00", "10:00", "11:00", "12:00",
        "13:00", "14:00", "15:00", "16:00",
      ])
    })
  })
})
