"use client"

import { useState, FormEvent } from "react"
import { barbers } from "@/lib/barbers"

type Step = "barber" | "date" | "slots" | "form" | "done"

export default function BookingPage() {
  const [step, setStep] = useState<Step>("barber")
  const [barberId, setBarberId] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [slots, setSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", email: "", phone: "" })

  const barber = barbers.find((b) => b.id === barberId)

  async function loadSlots(date: string) {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/slots?barberId=${barberId}&date=${date}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load slots")
      setSlots(data.slots)
      setSelectedSlot("")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
    setLoading(false)
  }

  async function handleBook(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId,
          date: selectedDate,
          time: selectedSlot,
          clientName: form.name,
          clientEmail: form.email,
          clientPhone: form.phone,
        }),
      })
      const text = await res.text()
      if (!text) throw new Error("Booking failed (no response)")
      const data = JSON.parse(text)
      if (!res.ok) throw new Error(data.error || "Booking failed")
      setStep("done")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    }
    setLoading(false)
  }

  // ponytail: today's date as min for <input type="date">
  const today = new Date().toISOString().slice(0, 10)

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-2xl px-4 py-12">
        {/* Header */}
        <h1 className="text-3xl font-bold tracking-tight">Helios Barber</h1>
        <p className="mt-1 text-zinc-400">Book your next cut.</p>

        <div className="mt-8 space-y-8">
          {/* Step indicator — ponytail: three dots, no animation lib */}
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            {["barber", "date", "slots", "form"].map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                <span
                  className={`flex size-7 items-center justify-center rounded-full text-xs font-medium ${
                    step === s || (["done"].includes(step) && i <= ["barber", "date", "slots", "form"].indexOf(s))
                      ? "bg-amber-500 text-black"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {i + 1}
                </span>
                {i < 3 && <span className="h-px w-6 bg-zinc-800" />}
              </span>
            ))}
          </div>

          {error && (
            <div className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Step 1: Pick a barber */}
          {step === "barber" && (
            <section>
              <h2 className="mb-4 text-lg font-medium">Choose your barber</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {barbers.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setBarberId(b.id)
                      setStep("date")
                    }}
                    className="group rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left transition hover:border-amber-600/50 hover:bg-zinc-800/50"
                  >
                    {/* ponytail: colored circle avatar, no image loading */}
                    <div className="mb-3 size-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-800" />
                    <div className="font-medium">{b.name}</div>
                    <div className="text-sm text-zinc-500">{b.title}</div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Step 2: Pick a date */}
          {step === "date" && (
            <section>
              <h2 className="mb-4 text-lg font-medium">
                Pick a date with <span className="text-amber-400">{barber?.name}</span>
              </h2>
              <input
                type="date"
                min={today}
                value={selectedDate}
                onChange={(e) => {
                  const d = e.target.value
                  setSelectedDate(d)
                  if (d) loadSlots(d)
                }}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 focus:border-amber-500 focus:outline-none [color-scheme:dark]"
              />
              {loading && <p className="mt-3 text-sm text-zinc-500">Checking availability...</p>}
              {selectedDate && !loading && slots.length > 0 && (
                <button
                  onClick={() => setStep("slots")}
                  className="mt-4 rounded-lg bg-amber-500 px-6 py-2 font-medium text-black transition hover:bg-amber-400"
                >
                  {slots.length} slots available &rarr;
                </button>
              )}
              {selectedDate && !loading && slots.length === 0 && (
                <p className="mt-3 text-sm text-zinc-500">No available slots this day.</p>
              )}
            </section>
          )}

          {/* Step 3: Pick a time */}
          {step === "slots" && (
            <section>
              <h2 className="mb-4 text-lg font-medium">
                Pick a time &mdash;{" "}
                <span className="text-amber-400">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </h2>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {slots.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedSlot(t)
                      setStep("form")
                    }}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm transition hover:border-amber-600/50 hover:bg-zinc-800/50"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Step 4: Your info */}
          {step === "form" && (
            <section>
              <h2 className="mb-4 text-lg font-medium">
                Confirm with{" "}
                <span className="text-amber-400">
                  {barber?.name} &mdash; {selectedSlot} on{" "}
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </h2>
              <form onSubmit={handleBook} className="space-y-4">
                <input
                  placeholder="Your name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-amber-500 px-6 py-3 font-medium text-black transition hover:bg-amber-400 disabled:opacity-50"
                >
                  {loading ? "Booking..." : "Confirm appointment"}
                </button>
              </form>
            </section>
          )}

          {/* Done */}
          {step === "done" && (
            <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">
              <div className="mb-4 text-4xl">✂️</div>
              <h2 className="text-xl font-medium">You&apos;re booked!</h2>
              <p className="mt-2 text-zinc-400">
                {barber?.name} will see you{" "}
                {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}{" "}
                at {selectedSlot}.
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                A calendar event has been added. See you soon.
              </p>
              <button
                onClick={() => {
                  setStep("barber")
                  setBarberId("")
                  setSelectedDate("")
                  setSlots([])
                  setSelectedSlot("")
                  setForm({ name: "", email: "", phone: "" })
                }}
                className="mt-6 rounded-lg border border-zinc-700 px-6 py-2 text-sm transition hover:bg-zinc-800"
              >
                Book another
              </button>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}
