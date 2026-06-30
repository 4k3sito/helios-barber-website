import { describe, it, expect } from "vitest"
import { generateSlots, type BusySlot } from "@/lib/google-calendar"

function date(day = "2026-06-25") {
  return new Date(day + "T12:00:00")
}

describe("generateSlots", () => {
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
