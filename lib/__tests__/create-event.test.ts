import { describe, it, expect, vi, beforeEach } from "vitest"

const insert = vi.fn()
const get = vi.fn()

vi.mock("googleapis", () => ({
  google: {
    auth: { GoogleAuth: class {} },
    calendar: () => ({ events: { insert, get } }),
  },
}))

const { createCalendarEvent, bookingEventId } = await import("@/lib/google-calendar")

const booking = {
  barberId: "fabian",
  date: "2026-09-01",
  time: "10:00",
  clientName: "Ana",
  clientEmail: "ana@example.com",
  clientPhone: "",
  slotDurationMin: 55,
  timeZone: "America/Mexico_City",
  barberName: "Fabián",
  serviceName: "Corte de Pelo",
}
const duplicateId = () => Object.assign(new Error("The requested identifier already exists."), { code: 409 })

describe("createCalendarEvent", () => {
  beforeEach(() => {
    insert.mockReset()
    get.mockReset()
  })

  it("rebooks a slot whose previous appointment was deleted (id tombstone)", async () => {
    insert.mockRejectedValueOnce(duplicateId()).mockResolvedValueOnce({})
    get.mockResolvedValue({ data: { status: "cancelled" } })

    await createCalendarEvent("cal", booking)

    const ids = insert.mock.calls.map((c) => c[0].requestBody.id)
    expect(ids[0]).toBe(bookingEventId(booking))
    expect(ids[1]).toMatch(new RegExp(`^${ids[0]}[0-9a-f]{8}$`))
  })

  it("frees the hour an appointment was moved away from", async () => {
    insert.mockRejectedValueOnce(duplicateId()).mockResolvedValueOnce({})
    // Dragged in Google Calendar: same event, same id, now two hours earlier.
    get.mockResolvedValue({ data: { status: "confirmed", start: { dateTime: "2026-09-01T08:00:00-06:00" } } })

    await createCalendarEvent("cal", booking)

    const ids = insert.mock.calls.map((c) => c[0].requestBody.id)
    expect(ids[1]).toMatch(new RegExp(`^${bookingEventId(booking)}[0-9a-f]{8}$`))
  })

  it("still refuses a live duplicate whose start is expressed in UTC", async () => {
    insert.mockRejectedValueOnce(duplicateId())
    // Same instant as the requested 10:00 America/Mexico_City slot, written as "Z" — Google
    // returns both shapes, so a wall-clock comparison would wrongly read this as moved.
    get.mockResolvedValue({ data: { status: "confirmed", start: { dateTime: "2026-09-01T16:00:00Z" } } })

    await expect(createCalendarEvent("cal", booking)).rejects.toThrow(/already exists/)
    expect(insert).toHaveBeenCalledTimes(1)
  })

  it("refuses when the existing event cannot be read", async () => {
    insert.mockRejectedValueOnce(duplicateId())
    get.mockRejectedValue(new Error("network"))

    await expect(createCalendarEvent("cal", booking)).rejects.toThrow(/already exists/)
    expect(insert).toHaveBeenCalledTimes(1)
  })
})
