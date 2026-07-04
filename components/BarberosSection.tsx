import Image from "next/image";
import { BARBERS } from "@/lib/config";

export default function BarberosSection() {
  return (
    <section id="barberos" className="mx-auto max-w-content px-[clamp(20px,5vw,72px)] py-[clamp(72px,11vw,150px)]">
      <div className="mb-[clamp(40px,6vw,68px)] flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="mb-5 flex items-center gap-3.5 font-mono text-xs uppercase tracking-[0.2em] text-accent section-kicker">
            <span>(03)</span>
            <span className="h-px w-[42px] bg-accent/50" />
            <span>El equipo</span>
          </div>
          <h2 className="m-0 font-display text-[clamp(46px,8vw,128px)] font-extrabold leading-[.9] tracking-[-0.04em] section-title">
            Barberos
          </h2>
        </div>
        <p className="m-0 max-w-[65ch] font-body text-base leading-[1.6] text-secondary">
          Manos especializadas. Cada barbero domina una técnica que define su firma.
        </p>
      </div>

      <div className="grid gap-[clamp(18px,2.4vw,30px)] md:grid-cols-3" data-team>
        {BARBERS.map((b, i) => (
          <div key={b.id} data-barber-card>
            <div className="relative aspect-[3/4] overflow-hidden rounded-card">
              <Image src={b.photo} alt={b.name} fill sizes="33vw" className="object-cover" />
              <span className="absolute left-3 top-3 rounded-ctl bg-ink/55 px-[9px] py-[5px] font-mono text-xs uppercase tracking-[0.18em] text-accent backdrop-blur-sm">
                0{i + 1}
              </span>
            </div>
            <div className="mt-5 flex items-baseline justify-between gap-2.5">
              <h3 className="m-0 font-display text-[clamp(24px,2.4vw,32px)] font-bold tracking-[-0.02em]">
                {b.name}
              </h3>
              <span className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.14em] text-accent">
                {b.role}
              </span>
            </div>
            <p className="mt-3 max-w-[65ch] font-body text-base leading-[1.65] text-tertiary">
              {b.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
