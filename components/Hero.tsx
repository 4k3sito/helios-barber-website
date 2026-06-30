import Image from "next/image";

export default function Hero() {
  return (
    <header id="top" className="relative flex min-h-dvh flex-col justify-end overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/uploads/3.jpeg"
          alt="Interior Helios"
          fill
          priority
          sizes="100vw"
          className="animate-[kb_9s_cubic-bezier(.2,.6,.2,1)_forwards] object-cover"
        />
      </div>
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-ink/72 via-ink/30 via-60% to-ink/95" />
      <div
        className="relative z-2 w-full bg-gradient-to-b from-black/35 via-black/20 to-transparent px-[clamp(20px,5vw,72px)] pb-[clamp(34px,5vw,64px)] pt-[clamp(30px,4vw,48px)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)] [mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)]"
      >
        <div className="mb-6 font-mono text-xs uppercase tracking-[0.26em] text-bronze hero-kicker">
          Est. 2026 — Estudio de barbería &amp; peluquería
        </div>
        <h1 className="m-0 font-display text-[clamp(82px,18vw,300px)] font-extrabold leading-[.82] tracking-[-0.045em] hero-title">
          Helios
        </h1>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-8">
          <p className="m-0 max-w-[65ch] font-body text-[clamp(17px,2vw,22px)] leading-[1.55] text-secondary hero-sub">
            Transformamos imagen en{" "}
            <span className="text-bronze">presencia</span>. Precisión técnica y
            experiencia premium para el hombre que entiende la imagen como
            identidad.
          </p>
          <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-tertiary animate-[fadeInOut_2s_ease-in-out_infinite] hero-scroll">
            <span>Desliza</span>
            <span className="block h-px w-[34px] bg-tertiary" />
          </div>
        </div>
      </div>
    </header>
  );
}
