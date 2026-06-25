import { describe, it, expect } from "vitest"
import { barbers } from "@/lib/barbers"

describe("barbers config", () => {
  it("has at least one barber", () => {
    expect(barbers.length).toBeGreaterThan(0)
  })

  it("every barber has required fields", () => {
    for (const b of barbers) {
      expect(b.id).toBeTruthy()
      expect(b.name).toBeTruthy()
      expect(b.title).toBeTruthy()
      expect(b.calendarId).toBeDefined()
      expect(b.timeZone).toBeTruthy()
      expect(b.hours.start).toMatch(/^\d{2}:\d{2}$/)
      expect(b.hours.end).toMatch(/^\d{2}:\d{2}$/)
      expect(b.slotDurationMin).toBeGreaterThan(0)
    }
  })

  it("every barber has a unique id", () => {
    const ids = barbers.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("hours start is before hours end", () => {
    for (const b of barbers) {
      const [sh, sm] = b.hours.start.split(":").map(Number)
      const [eh, em] = b.hours.end.split(":").map(Number)
      expect(sh * 60 + sm).toBeLessThan(eh * 60 + em)
    }
  })
})
