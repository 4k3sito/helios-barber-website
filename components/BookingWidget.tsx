"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BARBERS, TIMEZONE, type Barber } from "@/lib/config";
import { track } from "@/lib/analytics";

const fmtTime = new Intl.DateTimeFormat("es-MX", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIMEZONE,
});

const today = () => new Date().toISOString().slice(0, 10);

type Status = "idle" | "loading" | "success" | "error";

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

  // GA4: fire once when the widget scrolls into view.
  const seen = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !seen.current) {
          seen.current = true;
          track("view_booking_widget");
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Fetch slots whenever barber+date are set (step 3).
  useEffect(() => {
    if (step !== 3 || !barber) return;
    let active = true;
    setSlotsStatus("loading");
    setSlot(null);
    fetch(`/api/slots?eventTypeId=${barber.eventTypeId}&date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setSlots(d.slots ?? []);
        setSlotsStatus("idle");
      })
      .catch(() => active && setSlotsStatus("error"));
    return () => {
      active = false;
    };
  }, [step, barber, date]);

  function pickBarber(b: Barber) {
    setBarber(b);
    track("select_barber", { barber: b.id });
    setStep(2);
  }

  function pickSlot(s: string) {
    setSlot(s);
    track("select_time", { barber: barber?.id, start: s });
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
        body: JSON.stringify({ eventTypeId: barber.eventTypeId, start: slot, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error");
      setSubmit("success");
      track("booking_completed", { barber: barber.id, start: slot });
    } catch (err) {
      setSubmit("error");
      setError(err instanceof Error ? err.message : "No se pudo reservar");
    }
  }

  return (
    <section id="agendar" ref={rootRef} className="mx-auto max-w-content px-6 py-24 sm:py-32">
      <h2 className="mb-2 font-display text-4xl font-bold sm:text-5xl">Agenda tu cita</h2>
      <Steps step={step} />

      <div className="mt-10 rounded-2xl border border-line bg-surface p-6 sm:p-8">
        {/* STEP 1 — Barber */}
        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {BARBERS.map((b) => (
              <button
                key={b.id}
                onClick={() => pickBarber(b)}
                className="group flex items-center gap-4 rounded-xl border border-line p-4 text-left transition-colors duration-200 hover:border-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze"
              >
                <Image src={b.photo} alt={b.name} width={64} height={64} className="h-16 w-16 rounded-full object-cover" />
                <span>
                  <span className="block font-display text-lg">{b.name}</span>
                  <span className="block text-sm text-muted">{b.role}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2 — Date */}
        {step === 2 && (
          <div className="max-w-sm">
            <label htmlFor="date" className="mb-2 block text-sm text-muted">
              Elige el día
            </label>
            <input
              id="date"
              type="date"
              min={today()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-line bg-ink px-4 py-3 text-cream [color-scheme:dark] focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze"
            />
            <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} />
          </div>
        )}

        {/* STEP 3 — Slots */}
        {step === 3 && (
          <div>
            <p className="mb-4 text-sm text-muted">
              Horarios para <span className="text-cream">{barber?.name}</span> · {date}
            </p>
            {slotsStatus === "loading" && <SlotSkeleton />}
            {slotsStatus === "error" && <p className="text-bronze">No se pudo cargar. Intenta de nuevo.</p>}
            {slotsStatus === "idle" && slots.length === 0 && (
              <p className="text-muted">Sin horarios libres este día. Prueba otra fecha.</p>
            )}
            {slotsStatus === "idle" && slots.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => pickSlot(s)}
                    className="rounded-lg border border-line py-3 text-sm tabular-nums transition-colors duration-200 hover:border-bronze hover:text-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze"
                  >
                    {fmtTime.format(new Date(s))}
                  </button>
                ))}
              </div>
            )}
            <Nav onBack={() => setStep(2)} />
          </div>
        )}

        {/* STEP 4 — Form / confirmation */}
        {step === 4 && submit !== "success" && (
          <form onSubmit={book} className="max-w-sm">
            <p className="mb-4 text-sm text-muted">
              {barber?.name} · {date} · <span className="text-cream">{slot && fmtTime.format(new Date(slot))}</span>
            </p>
            <Field label="Nombre" value={form.name} onChange={(v) => setForm({ ...form, name: v })} autoComplete="name" />
            <Field
              label="Teléfono"
              type="tel"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              autoComplete="tel"
            />
            <Field
              label="Email (para tu confirmación)"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              autoComplete="email"
            />
            {submit === "error" && (
              <p role="alert" className="mb-3 text-sm text-bronze">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submit === "loading"}
              className="mt-2 w-full rounded-full bg-bronze py-4 font-medium text-ink transition-transform duration-200 hover:scale-[1.02] disabled:opacity-50"
            >
              {submit === "loading" ? "Reservando…" : "Confirmar cita"}
            </button>
            <button type="button" onClick={() => setStep(3)} className="mt-3 w-full text-sm text-muted hover:text-cream">
              ← Cambiar horario
            </button>
          </form>
        )}

        {step === 4 && submit === "success" && (
          <div className="py-6 text-center">
            <p className="font-display text-2xl text-bronze">¡Cita confirmada!</p>
            <p className="mt-2 text-muted">
              Te esperamos {date} a las {slot && fmtTime.format(new Date(slot))} con {barber?.name}.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function Steps({ step }: { step: number }) {
  const labels = ["Barbero", "Fecha", "Horario", "Datos"];
  return (
    <ol className="flex gap-2 text-xs text-muted" aria-label="Progreso">
      {labels.map((l, i) => (
        <li key={l} className={`flex items-center gap-2 ${i + 1 === step ? "text-bronze" : ""}`}>
          <span className={`grid h-5 w-5 place-items-center rounded-full border ${i + 1 <= step ? "border-bronze text-bronze" : "border-line"}`}>
            {i + 1}
          </span>
          <span className="hidden sm:inline">{l}</span>
          {i < labels.length - 1 && <span aria-hidden className="text-line">·</span>}
        </li>
      ))}
    </ol>
  );
}

function Nav({ onBack, onNext }: { onBack?: () => void; onNext?: () => void }) {
  return (
    <div className="mt-6 flex gap-3">
      {onBack && (
        <button onClick={onBack} className="rounded-full border border-line px-6 py-2.5 text-sm hover:border-cream">
          ← Atrás
        </button>
      )}
      {onNext && (
        <button onClick={onNext} className="rounded-full bg-cream px-6 py-2.5 text-sm font-medium text-ink hover:opacity-90">
          Continuar →
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <input
        type={type}
        required
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line bg-ink px-4 py-3 text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-bronze"
      />
    </label>
  );
}

function SlotSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-11 animate-pulse rounded-lg bg-line/40" />
      ))}
    </div>
  );
}
