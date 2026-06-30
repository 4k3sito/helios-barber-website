import Image from "next/image";

export default function StudioSection() {
  return (
    <section id="estudio" className="mx-auto max-w-content px-[clamp(20px,5vw,72px)] py-[clamp(72px,11vw,150px)]">
      <div className="mb-10 flex items-center gap-3.5 font-mono text-xs uppercase tracking-[0.2em] text-bronze section-kicker">
        <span>(01)</span>
        <span className="h-px w-[42px] bg-bronze/50" />
        <span>El estudio</span>
      </div>
      <div className="grid items-center gap-[clamp(34px,6vw,90px)] lg:grid-cols-[1.45fr_1fr]" data-grid>
        <div>
          <h2 className="m-0 font-display text-[clamp(28px,3.7vw,52px)] font-bold leading-[1.12] tracking-[-0.025em] text-balance section-title">
            Una barbería para quienes entienden que la imagen es una extensión de su identidad.
          </h2>
          <p className="mt-8 max-w-[65ch] font-body text-base leading-[1.7] text-secondary">
            Cada servicio combina precisión técnica, atención personalizada y una experiencia premium
            diseñada hasta el último detalle. Nuestro compromiso no es únicamente lograr un gran
            resultado, sino hacer que cada cliente salga proyectando la mejor versión de sí mismo.
          </p>
          <div className="mt-12 flex flex-wrap gap-12">
            {[
              { n: "03", label: "Barberos expertos" },
              { n: "09", label: "Servicios de estudio" },
              { n: "100%", label: "Cita personalizada" },
            ].map((s) => (
              <div key={s.n}>
                <div className="font-display text-[clamp(34px,4vw,52px)] font-extrabold tracking-[-0.03em] stat-num" data-target={s.n.replace("%", "")}>
                  {s.n}
                </div>
                <div className="mt-1.5 font-mono text-xs uppercase tracking-[0.16em] text-tertiary">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative">
          <Image
            src="/uploads/1.jpeg"
            alt="Interior del estudio"
            width={600}
            height={750}
            className="w-full rounded-card object-cover aspect-[4/5]"
          />
          <Image
            src="/assets/sun-gold.png"
            alt=""
            width={64}
            height={64}
            className="absolute -bottom-[26px] -left-[26px] size-16 rounded-full border border-bronze/40 bg-ink p-3.5"
          />
        </div>
      </div>
    </section>
  );
}
