import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-ink px-6 text-center">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent">404</span>
      <h1 className="font-display text-[clamp(32px,6vw,64px)] font-extrabold leading-[.95] tracking-[-0.03em] text-cream">
        Esta página no existe.
      </h1>
      <p className="max-w-[46ch] font-body text-base leading-[1.6] text-secondary">
        Puede que el enlace esté roto o la página se haya movido.
      </p>
      <Link
        href="/"
        className="rounded-ctl bg-accent px-6 py-3.5 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-opacity hover:opacity-82"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
