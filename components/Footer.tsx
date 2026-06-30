import Image from "next/image";
import { CONTACT } from "@/lib/config";

export default function Footer() {
  const rows = [
    { href: CONTACT.whatsapp, label: "WhatsApp", value: CONTACT.whatsappDisplay },
    { href: CONTACT.instagram, label: "Instagram", value: CONTACT.instagramDisplay },
    { href: CONTACT.tiktok, label: "TikTok", value: CONTACT.tiktokDisplay },
  ];

  return (
    <footer id="contacto" className="mt-[clamp(40px,6vw,80px)] border-t border-white/8 bg-ink-2 px-[clamp(20px,5vw,72px)] pt-[clamp(72px,11vw,150px)]">
      <div className="mx-auto max-w-content">
        <div className="grid items-end gap-[clamp(34px,6vw,80px)] lg:grid-cols-[1.4fr_1fr]" data-grid>
          <div>
            <div className="mb-[26px] flex items-center gap-3.5 font-mono text-xs uppercase tracking-[0.2em] text-bronze section-kicker">
              <span>(05)</span>
              <span className="h-px w-[42px] bg-bronze/50" />
              <span>Reserva tu cita</span>
            </div>
            <h2 className="m-0 font-display text-[clamp(40px,6.5vw,104px)] font-extrabold leading-[.92] tracking-[-0.04em]">
              Proyecta tu<br />mejor versión.
            </h2>
            <a
              href={CONTACT.whatsapp}
              target="_blank"
              rel="noopener"
              className="mt-[38px] inline-flex items-center gap-3 rounded-ctl bg-bronze px-[26px] py-4 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-opacity hover:opacity-82"
            >
              Agendar por WhatsApp →
            </a>
          </div>
          <div className="flex flex-col gap-0.5">
            {rows.map((r) => (
              <a
                key={r.label}
                href={r.href}
                target="_blank"
                rel="noopener"
                className="group flex items-center justify-between border-t border-white/10 py-5 transition-[padding] duration-300 hover:pl-3 contact-row"
              >
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-tertiary">{r.label}</span>
                <span className="font-display text-[clamp(16px,1.6vw,20px)] font-bold">{r.value}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-[clamp(56px,8vw,110px)] flex flex-wrap items-center justify-between gap-6 border-t border-white/8 px-0 py-[30px]">
          <div className="flex items-center gap-3.5">
            <Image src="/assets/sun-gold.png" alt="Helios" width={40} height={40} className="size-10" />
            <div>
              <div className="font-display text-lg font-bold tracking-[0.3em] pl-[0.3em]">HELIOS</div>
              <div className="mt-1 font-mono text-xs uppercase tracking-[0.18em] text-tertiary">Barber Studio</div>
            </div>
          </div>
          <div className="text-right font-mono text-xs uppercase tracking-[0.12em] text-tertiary">
            © 2026 Helios Barber Studio<br />
            Transformamos imagen en presencia
          </div>
        </div>
      </div>
    </footer>
  );
}
