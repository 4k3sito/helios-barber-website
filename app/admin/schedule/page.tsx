"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BARBERS } from "@/lib/config";

type Override = { dayOff: true } | { start: string; end: string };
type Overrides = Record<string, Record<string, Override>>;
type RowState = { dayOff: boolean; start: string; end: string; saving: boolean; savedAt: number };

const DAYS_AHEAD = 28;

function dateRange(n: number) {
  const out: string[] = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    out.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return out;
}

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function AdminSchedulePage() {
  const router = useRouter();
  const dates = useMemo(() => dateRange(DAYS_AHEAD), []);
  const [barberId, setBarberId] = useState(BARBERS[0].id);
  const [overrides, setOverrides] = useState<Overrides>({});
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Record<string, RowState>>({});

  const barber = BARBERS.find((b) => b.id === barberId)!;

  useEffect(() => {
    fetch("/api/admin/schedule")
      .then((r) => r.json())
      .then((d) => setOverrides(d.overrides || {}))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const next: Record<string, RowState> = {};
    for (const date of dates) {
      const o = overrides[barberId]?.[date];
      if (o && "dayOff" in o) {
        next[date] = { dayOff: true, start: barber.hours.start, end: barber.hours.end, saving: false, savedAt: 0 };
      } else if (o) {
        next[date] = { dayOff: false, start: o.start, end: o.end, saving: false, savedAt: 0 };
      } else {
        next[date] = { dayOff: false, start: barber.hours.start, end: barber.hours.end, saving: false, savedAt: 0 };
      }
    }
    setRows(next);
  }, [barberId, overrides, dates, barber.hours.start, barber.hours.end]);

  function updateRow(date: string, patch: Partial<RowState>) {
    setRows((r) => ({ ...r, [date]: { ...r[date], ...patch } }));
  }

  async function save(date: string) {
    const row = rows[date];
    updateRow(date, { saving: true });
    const isCustom = !row.dayOff && (row.start !== barber.hours.start || row.end !== barber.hours.end);
    const body = row.dayOff
      ? { barberId, date, dayOff: true }
      : isCustom
        ? { barberId, date, start: row.start, end: row.end }
        : { barberId, date };

    const res = await fetch("/api/admin/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setOverrides((all) => {
        const forBarber = { ...all[barberId] };
        if (row.dayOff) forBarber[date] = { dayOff: true };
        else if (isCustom) forBarber[date] = { start: row.start, end: row.end };
        else delete forBarber[date];
        return { ...all, [barberId]: forBarber };
      });
      updateRow(date, { saving: false, savedAt: Date.now() });
    } else {
      updateRow(date, { saving: false });
    }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <main className="mx-auto min-h-screen max-w-content px-[clamp(20px,5vw,72px)] py-[clamp(40px,8vw,80px)]">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-xl font-extrabold tracking-[-0.02em] sm:text-2xl">Horarios</h1>
        <button
          onClick={logout}
          className="font-mono text-xs uppercase tracking-[0.14em] text-tertiary transition-colors hover:text-body"
        >
          Salir
        </button>
      </div>

      <div className="mb-3 mt-8 font-mono text-xs uppercase tracking-[0.16em] text-tertiary">Barbero</div>
      <div className="mb-8 grid grid-cols-3 gap-2 sm:max-w-md">
        {BARBERS.map((b) => (
          <button
            key={b.id}
            onClick={() => setBarberId(b.id)}
            className={`rounded-ctl border px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
              b.id === barberId ? "border-accent text-accent" : "border-border hover:border-cream"
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-2" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-ctl bg-border/40" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-border">
          {dates.map((date, i) => {
            const row = rows[date];
            if (!row) return null;
            const isOverridden = !!overrides[barberId]?.[date];
            return (
              <div
                key={date}
                className={`flex flex-wrap items-center gap-x-5 gap-y-3 p-4 ${i > 0 ? "border-t border-border" : ""}`}
              >
                <div className="w-28 shrink-0 font-mono text-sm capitalize text-body">{fmtDate(date)}</div>

                <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-tertiary">
                  <input
                    type="checkbox"
                    checked={row.dayOff}
                    onChange={(e) => updateRow(date, { dayOff: e.target.checked, savedAt: 0 })}
                    className="size-4 accent-accent"
                  />
                  Cerrado
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={row.start}
                    disabled={row.dayOff}
                    onChange={(e) => updateRow(date, { start: e.target.value, savedAt: 0 })}
                    className="rounded-ctl border border-border bg-ink px-2 py-2 font-mono text-sm text-body [color-scheme:dark] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40"
                  />
                  <span className="text-tertiary">–</span>
                  <input
                    type="time"
                    value={row.end}
                    disabled={row.dayOff}
                    onChange={(e) => updateRow(date, { end: e.target.value, savedAt: 0 })}
                    className="rounded-ctl border border-border bg-ink px-2 py-2 font-mono text-sm text-body [color-scheme:dark] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40"
                  />
                </div>

                {isOverridden && (
                  <span className="font-mono text-2xs uppercase tracking-[0.14em] text-accent">Modificado</span>
                )}

                <button
                  onClick={() => save(date)}
                  disabled={row.saving}
                  className="ml-auto rounded-ctl border border-border px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors hover:border-cream disabled:opacity-50"
                >
                  {row.saving ? "Guardando…" : row.savedAt ? "Guardado" : "Guardar"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
