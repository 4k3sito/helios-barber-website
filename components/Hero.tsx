import Image from "next/image";

export default function Hero() {
  return (
    <header id="top" className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/uploads/3.jpeg"
          alt="Interior Helios"
          fill
          priority
          sizes="100vw"
          className="animate-[kb_10s_cubic-bezier(.2,.6,.2,1)_forwards] object-cover object-[78%_center]"
        />
      </div>
      <div className="absolute inset-0 z-1 bg-[linear-gradient(180deg,rgba(13,12,11,.5)_0%,rgba(13,12,11,.06)_22%,rgba(13,12,11,.02)_46%,rgba(13,12,11,.5)_78%,rgba(13,12,11,.94)_100%)]" />

      {/* editorial inset frame */}
      <div className="pointer-events-none absolute inset-[clamp(14px,2.2vw,28px)] z-2 border border-cream/[0.22]" />

      {/* top row: kicker + index tag */}
      <div className="relative z-3 flex items-start justify-between gap-5 px-[clamp(38px,6vw,88px)] pt-[clamp(112px,14vh,164px)]">
        <div className="font-mono text-[11px] uppercase leading-normal tracking-[0.26em] text-bronze hero-kicker">
          Est. 2026<br />Estudio de barbería &amp; peluquería
        </div>
        <div className="text-right font-mono text-[11px] uppercase leading-normal tracking-[0.2em] text-secondary">
          N.01 — Interior<br /><span className="text-tertiary">Nápoles, CDMX</span>
        </div>
      </div>

      {/* bottom: statement + CTA, in the frame's empty lower-left */}
      <div className="relative z-3 mt-auto flex flex-wrap items-end justify-between gap-8 px-[clamp(38px,6vw,88px)] pb-[clamp(48px,6.5vw,80px)]">
        <div className="max-w-[56ch]">
          <div className="mb-[22px] h-px w-14 bg-bronze" />
          <h1 className="m-0 text-balance font-display text-[clamp(30px,4.4vw,58px)] font-bold leading-[1.14] tracking-[-0.025em] text-cream hero-title">
            Transformamos imagen en <span className="text-bronze">presencia</span>.
          </h1>
          <p className="m-0 mt-5 max-w-[46ch] font-body text-[clamp(14px,1.15vw,16px)] leading-[1.65] text-secondary hero-sub">
            Precisión técnica y experiencia premium para el hombre que entiende la imagen como identidad.
          </p>
          <a
            href="#servicios"
            className="mt-[30px] inline-flex items-center gap-2.5 rounded-ctl bg-bronze px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink transition-opacity hover:opacity-82"
          >
            Ver servicios ↓
          </a>
        </div>
      </div>
    </header>
  );
}
