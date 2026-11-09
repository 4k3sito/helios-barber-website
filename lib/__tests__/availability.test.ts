import { describe, it, expect } from "vitest"
import { mergeSlots, pickAnyBarber, addDays } from "@/lib/availability"

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

describe("pickAnyBarber", () => {
  const option = { time: "10:00", barberIds: ["fabian", "alexis", "marlon", "roger"] }

  it("only ever picks a barber free at that time, across the whole random range", () => {
    expect(pickAnyBarber(option, () => 0)).toBe("fabian")
    expect(pickAnyBarber(option, () => 0.5)).toBe("marlon")
    expect(pickAnyBarber(option, () => 0.999999)).toBe("roger")
    expect(pickAnyBarber({ time: "09:00", barberIds: ["fabian"] }, () => 0.9)).toBe("fabian")
  })

  it("spreads evenly instead of favouring one barber", () => {
    // Sweep the random range uniformly: each barber must get exactly a quarter
    const n = 400
    const counts: Record<string, number> = {}
    for (let i = 0; i < n; i++) {
      const id = pickAnyBarber(option, () => (i + 0.5) / n)
      counts[id] = (counts[id] ?? 0) + 1
    }
    expect(counts).toEqual({ fabian: 100, alexis: 100, marlon: 100, roger: 100 })
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
