"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin/schedule");
      router.refresh();
    } else {
      setStatus("error");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-card border border-border bg-surface p-[clamp(22px,4vw,38px)]"
      >
        <h1 className="font-display text-xl font-extrabold tracking-[-0.02em]">Acceso administrador</h1>
        <label className="mb-4 mt-6 block">
          <span className="mb-1.5 block font-mono text-xs uppercase tracking-[0.16em] text-tertiary">
            Contraseña
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setStatus("idle");
            }}
            autoFocus
            className="w-full rounded-ctl border border-border bg-ink px-4 py-3 font-body text-body focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent min-h-[48px]"
          />
        </label>
        {status === "error" && (
          <p role="alert" className="mb-4 font-mono text-sm text-accent">
            Contraseña incorrecta.
          </p>
        )}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full rounded-ctl bg-accent py-4 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-opacity hover:opacity-82 disabled:opacity-50 min-h-[48px]"
        >
          {status === "loading" ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}
