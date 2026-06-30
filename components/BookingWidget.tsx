"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BARBERS, type Barber } from "@/lib/config";

const today = () => new Date().toISOString().slice(0, 10);

type Status = "idle" | "loading" | "success" | "error";

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function BookingWidget() {
  const [step, setStep] = useState(1);
  const [barber, setBarber] = useState<Barber | null>(null);
  const [date, setDate] = useState(today());
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsStatus, setSlotsStatus] = useState<Status>("idle");
  const [slot, setSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [submit, setSubmit] = useState<Status>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (step !== 3 || !barber) return;
    let active = true;
    setSlotsStatus("loading");
    setSlot(null);
    fetch(`/api/slots?barberId=${barber.id}&date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setSlots(d.slots ?? []);
        setSlotsStatus("idle");
      })
      .catch(() => active && setSlotsStatus("error"));
    return () => { active = false; };
  }, [step, barber, date]);

  function pickBarber(b: Barber) {
    setBarber(b);
    setStep(2);
  }

  function pickSlot(s: string) {
    setSlot(s);
    setStep(4);
  }

  async function book(e: React.FormEvent) {
    e.preventDefault();
    if (!barber || !slot) return;
    setSubmit("loading");
    setError("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barberId: barber.id, date, time: slot, clientName: form.name, clientEmail: form.email, clientPhone: form.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setSubmit("success");
    } catch (err) {
      setSubmit("error");
      setError(err instanceof Error ? err.message : "No se pudo reservar");
    }
  }

  return (
    <section id="agendar" className="mx-auto w-full max-w-content px-[clamp(20px,5vw,72px)] py-[clamp(72px,11vw,150px)]">
      <div className="mb-5 flex items-center gap-3.5 font-mono text-xs uppercase tracking-[0.2em] text-bronze section-kicker">
        <span>(06)</span>
        <span className="h-px w-[42px] bg-bronze/50" />
        <span>Reserva tu cita</span>
      </div>
      <h2 className="font-display text-[clamp(40px,7vw,76px)] font-extrabold leading-[.92] tracking-[-0.03em]">
        Agenda tu cita
      </h2>

      <ol className="mt-7 flex gap-3 font-mono text-xs uppercase tracking-[0.14em] text-tertiary" aria-label="Progreso">
        {["Barbero", "Fecha", "Horario", "Datos"].map((l, i) => {
          const n = i + 1;
          const active = n === step || (n === 4 && step === 5);
          return (
            <li key={l} className={`flex items-center gap-2 ${active ? "text-bronze" : ""}`}>
              <span className={`grid size-6 place-items-center rounded-ctl border text-xs ${n <= step ? "border-bronze text-bronze" : "border-border"}`}>
                {n}
              </span>
              <span className="hidden sm:inline">{l}</span>
              {i < 3 && <span className="ml-1 hidden h-px w-5 bg-border sm:block" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-9 rounded-card border border-border bg-surface p-[clamp(22px,4vw,38px)] booking-card">
        {/* STEP 1 — Barber */}
        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {BARBERS.map((b, i) => (
              <button
                key={b.id}
                onClick={() => pickBarber(b)}
                className="group flex items-center gap-4 rounded-ctl border border-border p-4 text-left transition-colors duration-200 hover:border-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze"
              >
                <Image src={b.photo} alt={b.name} width={72} height={72} className="size-[72px] rounded-ctl object-cover" />
                <span className="min-w-0">
                  <span className="mb-1 block font-mono text-xs uppercase tracking-[0.16em] text-tertiary">0{i + 1}</span>
                  <span className="block font-display text-lg font-bold tracking-[-0.01em]">{b.name}</span>
                  <span className="mt-0.5 block font-mono text-xs uppercase tracking-[0.12em] text-bronze">{b.role}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2 — Date */}
        {step === 2 && (
          <div className="max-w-sm">
            <label htmlFor="date" className="mb-2 block font-mono text-xs uppercase tracking-[0.16em] text-tertiary">Elige el día</label>
            <input
              id="date"
              type="date"
              min={today()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-ctl border border-border bg-ink px-4 py-3 font-mono text-body [color-scheme:dark] focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze"
            />
            <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} />
          </div>
        )}

        {/* STEP 3 — Slots */}
        {step === 3 && (
          <div>
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.14em] text-tertiary">
              Horarios para <span className="text-bronze">{barber?.name}</span> · {fmtDate(date)}
            </p>
            {slotsStatus === "loading" && <SlotSkeleton />}
            {slotsStatus === "error" && <p className="font-mono text-sm text-bronze">No se pudo cargar. Intenta de nuevo.</p>}
            {slotsStatus === "idle" && slots.length === 0 && <p className="text-secondary">Sin horarios libres este día. Prueba otra fecha.</p>}
            {slotsStatus === "idle" && slots.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => pickSlot(s)}
                    className="rounded-ctl border border-border py-3 font-mono text-sm tabular-nums transition-colors duration-200 hover:border-bronze hover:text-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze min-h-[44px]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <Nav onBack={() => setStep(2)} />
          </div>
        )}

        {/* STEP 4 — Form */}
        {step === 4 && submit !== "success" && (
          <form onSubmit={book} className="max-w-sm">
            <p className="mb-5 font-mono text-xs uppercase tracking-[0.14em] text-tertiary">
              {barber?.name} · {fmtDate(date)} · <span className="text-bronze">{slot}</span>
            </p>
            <Field label="Nombre" value={form.name} onChange={(v) => setForm({ ...form, name: v })} autoComplete="name" />
            <Field label="Teléfono" type="tel" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} autoComplete="tel" />
            <Field label="Email (para tu confirmación)" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} autoComplete="email" />
            {submit === "error" && <p role="alert" className="mb-3 font-mono text-sm text-bronze">{error}</p>}
            <button
              type="submit"
              disabled={submit === "loading"}
              className="mt-2 w-full rounded-ctl bg-bronze py-4 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-opacity hover:opacity-82 disabled:opacity-50 min-h-[48px]"
            >
              {submit === "loading" ? "Reservando…" : "Confirmar cita"}
            </button>
            <button type="button" onClick={() => setStep(3)} className="mt-3 w-full py-3 font-mono text-xs uppercase tracking-[0.12em] text-tertiary transition-colors hover:text-body min-h-[44px]">
              ← Cambiar horario
            </button>
          </form>
        )}

        {/* SUCCESS */}
        {step === 4 && submit === "success" && (
          <div className="py-8 text-center">
            <Image src="/assets/sun-gold.png" alt="" width={44} height={44} className="mx-auto mb-[18px] size-11" />
            <p className="font-display text-3xl font-bold tracking-[-0.02em] text-bronze">¡Cita confirmada!</p>
            <p className="mt-3 font-body text-base text-secondary">
              Te esperamos {fmtDate(date)} a las {slot} con {barber?.name}.
            </p>
            <button
              onClick={() => { setStep(1); setSlot(null); setSubmit("idle"); setForm({ name: "", phone: "", email: "" }); }}
              className="mt-[26px] rounded-ctl border border-border px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] transition-colors hover:border-cream min-h-[44px]"
            >
              Agendar otra
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Nav({ onBack, onNext }: { onBack?: () => void; onNext?: () => void }) {
  return (
    <div className="mt-6 flex gap-3">
      {onBack && (
        <button onClick={onBack} className="rounded-ctl border border-border px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-body transition-colors hover:border-cream min-h-[44px]">
          ← Atrás
        </button>
      )}
      {onNext && (
        <button onClick={onNext} className="rounded-ctl bg-cream px-6 py-3 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-opacity hover:opacity-82 min-h-[44px]">
          Continuar →
        </button>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", autoComplete }: { label: string; value: string; onChange: (v: string) => void; type?: string; autoComplete?: string }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block font-mono text-xs uppercase tracking-[0.16em] text-tertiary">{label}</span>
      <input
        type={type}
        required
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-ctl border border-border bg-ink px-4 py-3 font-body text-body focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze min-h-[48px]"
      />
    </label>
  );
}

function SlotSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-11 animate-pulse rounded-ctl bg-border/40" />
      ))}
    </div>
  );
}
