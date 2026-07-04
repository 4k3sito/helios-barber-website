import Image from "next/image";
import { BARBERIA_SERVICES, COLOR_SERVICES } from "@/lib/config";

function ServiceRow({ name, duration, price }: { name: string; duration: string; price: string }) {
  return (
    <div className="flex items-baseline border-b border-[#14110f]/20 py-5 last:border-0 service-row">
      <span className="whitespace-nowrap font-body text-[clamp(17px,1.7vw,21px)] font-bold tracking-[-0.01em]">
        {name}
      </span>
      <span className="mx-3.5 flex-1 translate-y-[-5px] border-b border-dotted border-[#a0988e]" />
      <span className="mr-[18px] whitespace-nowrap font-mono text-xs tracking-[0.08em] text-[#4a4540]">
        {duration}
      </span>
      <span className="whitespace-nowrap font-body text-[clamp(17px,1.7vw,21px)] font-bold">{price}</span>
    </div>
  );
}

export default function ServicesSection() {
  return (
    <section id="servicios" className="bg-[#e4e1db] px-[clamp(20px,5vw,72px)] py-[clamp(72px,11vw,150px)] text-[#14110f]">
      <div className="mx-auto max-w-content">
        <div className="mb-[clamp(40px,6vw,72px)] flex flex-wrap items-end justify-between gap-[22px]">
          <div>
            <div className="mb-5 flex items-center gap-3.5 font-mono text-xs uppercase tracking-[0.2em] text-accent section-kicker">
              <span>(02)</span>
              <span className="h-px w-[42px] bg-accent/60" />
              <span>Carta de servicios</span>
            </div>
            <h2 className="m-0 font-display text-[clamp(46px,8vw,128px)] font-extrabold leading-[.9] tracking-[-0.04em] section-title">
              Servicios
            </h2>
          </div>
          <p className="m-0 max-w-[65ch] font-mono text-xs uppercase leading-[1.7] tracking-[0.06em] text-[#4a4540]">
            Precios en MXN · incluyen I.V.A. y pueden cambiar sin previo aviso.
          </p>
        </div>

        <div className="grid gap-[clamp(34px,6vw,84px)] lg:grid-cols-[1.5fr_1fr]" data-grid>
          {/* Barbería */}
          <div>
            <div className="border-b border-[#14110f]/20 pb-[18px] mb-2 font-mono text-xs uppercase tracking-[0.22em] text-[#4a4540]">
              Barbería
            </div>
            {BARBERIA_SERVICES.map((s) => (
              <ServiceRow key={s.name} {...s} />
            ))}
          </div>

          {/* Color + CTA */}
          <div>
            <div className="border-b border-[#14110f]/20 pb-[18px] mb-2 font-mono text-xs uppercase tracking-[0.22em] text-[#4a4540]">
              Color
            </div>
            {COLOR_SERVICES.map((s) => (
              <ServiceRow key={s.name} {...s} />
            ))}

            <div className="mt-[34px] rounded-card bg-surface p-7 text-secondary cta-card">
              <Image src="/assets/sun-light.png" alt="" width={38} height={38} className="mb-4 size-[38px]" />
              <div className="font-body text-[clamp(18px,1.6vw,22px)] font-bold leading-[1.3] tracking-[-0.01em] text-cream">
                ¿Listo para tu cita?
              </div>
              <p className="my-3 font-body text-sm leading-[1.6] text-tertiary">
                Reserva por WhatsApp y agenda con el barbero de tu preferencia.
              </p>
              <a
                href="#agendar"
                className="inline-block rounded-ctl bg-accent px-[22px] py-3 font-mono text-xs uppercase tracking-[0.14em] text-ink"
              >
                Reservar ahora →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
