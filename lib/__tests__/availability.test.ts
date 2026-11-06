import { describe, it, expect } from "vitest"
import { mergeSlots, leastBooked, addDays } from "@/lib/availability"

describe("mergeSlots", () => {
  it("unions every barber's slots in time order, keeping who is free at each", () => {
    const merged = mergeSlots([
      { barberId: "fabian", slots: ["09:00", "10:00", "12:30"] },
      { barberId: "alexis", slots: ["10:00", "11:00"] },
      { barberId: "marlon", slots: [] },
    ])
    expect(merged).toEqual([
      { time: "09:00", barberIds: ["fabian"] },
      { time: "10:00", barberIds: ["fabian", "alexis"] },
      { time: "11:00", barberIds: ["alexis"] },
      { time: "12:30", barberIds: ["fabian"] },
    ])
  })

  it("is empty when nobody has a slot", () => {
    expect(mergeSlots([{ barberId: "fabian", slots: [] }])).toEqual([])
  })
})

describe("leastBooked", () => {
  const day = mergeSlots([
    { barberId: "fabian", slots: ["10:00"] },
    { barberId: "alexis", slots: ["10:00", "11:00", "12:00"] },
    { barberId: "marlon", slots: ["10:00", "11:00"] },
  ])

  it("picks the free barber with the most open slots that day", () => {
    expect(leastBooked(day[0], day)).toBe("alexis")
  })

  it("only picks among barbers free at that time", () => {
    expect(leastBooked({ time: "10:00", barberIds: ["fabian", "marlon"] }, day)).toBe("marlon")
  })

  it("keeps config order on a tie", () => {
    const tie = mergeSlots([
      { barberId: "a", slots: ["10:00"] },
      { barberId: "b", slots: ["10:00"] },
    ])
    expect(leastBooked(tie[0], tie)).toBe("a")
  })
})

describe("addDays", () => {
  it("crosses month and year boundaries", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01")
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01")
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29")
  })

  it("is unaffected by DST changes", () => {
    expect(addDays("2026-03-07", 1)).toBe("2026-03-08")
    expect(addDays("2026-11-01", 14)).toBe("2026-11-15")
  })
})
