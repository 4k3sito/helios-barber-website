"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BARBERS } from "@/lib/config";

type Override = { dayOff: true } | { start: string; end: string };
type Overrides = Record<string, Record<string, Override>>;
type Draft = { dayOff: boolean; start: string; end: string };
type Hours = { start: string; end: string };

const DAYS_AHEAD = 28;
const TIME_ZONE = "America/Mexico_City";
const keyOf = (barberId: string, date: string) => `${barberId}|${date}`;

// ponytail: reuse the CDMX-local "today" pattern from app/api/book/route.ts —
// new Date().toISOString() reads UTC and silently skips "today" after 6pm CDMX.
function dateRange(n: number) {
  const out: string[] = [];
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: TIME_ZONE }));
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
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

/** What is stored for this day: the override if any, else the barber's regular hours. */
function savedDraft(override: Override | undefined, hours: Hours): Draft {
  if (override && "dayOff" in override) return { dayOff: true, ...hours };
  return { dayOff: false, ...(override ?? hours) };
}

function sameDraft(a: Draft, b: Draft) {
  return a.dayOff === b.dayOff && (a.dayOff || (a.start === b.start && a.end === b.end));
}

export default function AdminSchedulePage() {
  const router = useRouter();
  const dates = useMemo(() => dateRange(DAYS_AHEAD), []);
  const [barberId, setBarberId] = useState(BARBERS[0].id);
  const [overrides, setOverrides] = useState<Overrides>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  // Unsaved edits live beside the saved overrides, keyed by barber+day, so saving one day or
  // switching barber never resets another day's pending change (it used to: rows were rebuilt
  // from the saved overrides after every save, silently unchecking an unsaved "Cerrado").
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [savedAt, setSavedAt] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const savedFor = (bId: string, date: string) =>
    savedDraft(overrides[bId]?.[date], BARBERS.find((b) => b.id === bId)!.hours);
  const isDirty = (bId: string, date: string) => {
    const draft = drafts[keyOf(bId, date)];
    return !!draft && !sameDraft(draft, savedFor(bId, date));
  };
  const dirtyKeys = Object.keys(drafts).filter((k) => {
    const [bId, date] = k.split("|");
    return isDirty(bId, date);
  });
  const hasUnsaved = dirtyKeys.length > 0;

  useEffect(() => {
    fetch("/api/admin/schedule")
      .then(async (r) => {
        if (!r.ok) throw new Error(r.status === 401 ? "Sesión expirada: vuelve a entrar." : `Error ${r.status}`);
        const d = await r.json();
        setOverrides(d.overrides || {});
      })
      .catch((e) => setLoadError(e instanceof Error ? e.message : "No se pudieron cargar los horarios."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!hasUnsaved) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // older WebViews / Samsung Internet only prompt with this set
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsaved]);

  function updateRow(date: string, patch: Partial<Draft>) {
    const key = keyOf(barberId, date);
    setDrafts((d) => ({ ...d, [key]: { ...(d[key] ?? savedFor(barberId, date)), ...patch } }));
    setSavedAt((s) => ({ ...s, [key]: 0 }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  async function save(date: string) {
    const bId = barberId;
    const key = keyOf(bId, date);
    const row = drafts[key] ?? savedFor(bId, date);
    if (!row.dayOff && (!row.start || !row.end || row.start >= row.end)) {
      setErrors((e) => ({ ...e, [key]: "No se guardó. Revisa el horario: la entrada debe ser antes de la salida." }));
      return;
    }
    const hours = BARBERS.find((b) => b.id === bId)!.hours;
    const isCustom = !row.dayOff && (row.start !== hours.start || row.end !== hours.end);
    const body = row.dayOff
      ? { barberId: bId, date, dayOff: true }
      : isCustom
        ? { barberId: bId, date, start: row.start, end: row.end }
        : { barberId: bId, date };

    setSaving((s) => ({ ...s, [key]: true }));
    setErrors((e) => ({ ...e, [key]: "" }));
    try {
      const res = await fetch("/api/admin/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(res.status === 401 ? "Sesión expirada: vuelve a entrar y guarda de nuevo." : data.error ?? `Error ${res.status}`);
      }
      setOverrides((all) => {
        const forBarber = { ...all[bId] };
        if (row.dayOff) forBarber[date] = { dayOff: true };
        else if (isCustom) forBarber[date] = { start: row.start, end: row.end };
        else delete forBarber[date];
        return { ...all, [bId]: forBarber };
      });
      setDrafts((d) => {
        if (d[key] !== drafts[key]) return d; // edited again while saving: keep the newer draft
        const rest = { ...d };
        delete rest[key];
        return rest;
      });
      setSavedAt((s) => ({ ...s, [key]: Date.now() }));
    } catch (e) {
      // Keep the draft: the change is still pending, and the row says why it didn't stick
      setErrors((er) => ({ ...er, [key]: `No se guardó. ${e instanceof Error ? e.message : ""}`.trim() }));
    } finally {
      setSaving((s) => ({ ...s, [key]: false }));
    }
  }

  async function logout() {
    if (hasUnsaved && !window.confirm("Tienes cambios sin guardar. ¿Salir de todos modos?")) return;
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
      <div className="mb-8 flex flex-wrap gap-2 sm:max-w-md">
        {BARBERS.map((b) => (
          <button
            key={b.id}
            onClick={() => setBarberId(b.id)}
            className={`flex-1 rounded-ctl border px-4 py-3 font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
              b.id === barberId ? "border-accent text-accent" : "border-border hover:border-cream"
            }`}
          >
            {b.name}
            {dirtyKeys.some((k) => k.startsWith(`${b.id}|`)) && <span className="ml-1 text-accent" aria-label="cambios sin guardar">•</span>}
          </button>
        ))}
      </div>

      {hasUnsaved && (
        <p role="status" className="mb-4 font-mono text-xs uppercase tracking-[0.12em] text-accent">
          Tienes cambios sin guardar: pulsa “Guardar” en cada día marcado.
        </p>
      )}
      {loadError && <p role="alert" className="mb-4 font-mono text-sm text-accent">{loadError}</p>}

      {loadError ? (
        <button
          onClick={() => window.location.reload()}
          className="rounded-ctl border border-accent px-5 py-3 font-mono text-xs uppercase tracking-[0.12em] text-accent"
        >
          Reintentar
        </button>
      ) : loading ? (
        <div className="grid gap-2" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-ctl bg-border/40" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-card border border-border">
          {dates.map((date, i) => {
            const key = keyOf(barberId, date);
            const row = drafts[key] ?? savedFor(barberId, date);
            const dirty = isDirty(barberId, date);
            const isOverridden = !!overrides[barberId]?.[date];
            return (
              <div
                key={date}
                className={`flex flex-wrap items-center gap-x-5 gap-y-3 p-4 ${i > 0 ? "border-t border-border" : ""} ${dirty ? "bg-accent/[0.06]" : ""}`}
              >
                <div className="w-28 shrink-0 font-mono text-sm capitalize text-body">{fmtDate(date)}</div>

                <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-tertiary">
                  <input
                    type="checkbox"
                    checked={row.dayOff}
                    disabled={saving[key]}
                    onChange={(e) => updateRow(date, { dayOff: e.target.checked })}
                    className="size-4 accent-accent"
                  />
                  Cerrado
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={row.start}
                    disabled={row.dayOff || saving[key]}
                    onChange={(e) => updateRow(date, { start: e.target.value })}
                    className="rounded-ctl border border-border bg-ink px-2 py-2 font-mono text-sm text-body [color-scheme:dark] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40"
                  />
                  <span className="text-tertiary">–</span>
                  <input
                    type="time"
                    value={row.end}
                    disabled={row.dayOff || saving[key]}
                    onChange={(e) => updateRow(date, { end: e.target.value })}
                    className="rounded-ctl border border-border bg-ink px-2 py-2 font-mono text-sm text-body [color-scheme:dark] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40"
                  />
                </div>

                {dirty ? (
                  <span className="font-mono text-2xs uppercase tracking-[0.14em] text-accent">Sin guardar</span>
                ) : isOverridden && (
                  <span className="font-mono text-2xs uppercase tracking-[0.14em] text-accent">Modificado</span>
                )}

                <button
                  onClick={() => save(date)}
                  // Nothing pending: a click would re-send the stored state, or clear an override
                  disabled={saving[key] || !dirty}
                  className={`ml-auto rounded-ctl border px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors disabled:opacity-50 ${
                    dirty ? "border-accent bg-accent text-ink hover:opacity-82" : "border-border hover:border-cream"
                  }`}
                >
                  {saving[key] ? "Guardando…" : savedAt[key] && !dirty ? "Guardado" : "Guardar"}
                </button>
                {errors[key] && (
                  <p role="alert" className="basis-full font-mono text-xs text-accent">{errors[key]}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
