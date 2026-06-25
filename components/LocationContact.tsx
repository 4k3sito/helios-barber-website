import { CONTACT } from "@/lib/config";

export default function LocationContact() {
  return (
    <section id="contacto" className="mx-auto max-w-content px-6 py-24 sm:py-32">
      <h2 className="mb-12 font-display text-4xl font-bold sm:text-5xl">Ubicación &amp; Contacto</h2>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-line">
          <iframe
            title="Mapa de Helios Barber"
            src={CONTACT.mapEmbedSrc}
            className="h-80 w-full lg:h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="mb-1 text-sm uppercase tracking-widest text-bronze">Dirección</h3>
            <p className="text-lg">{CONTACT.address}</p>
          </div>

          <div>
            <h3 className="mb-2 text-sm uppercase tracking-widest text-bronze">Horarios</h3>
            <ul className="space-y-1">
              {CONTACT.hours.map((h) => (
                <li key={h.d} className="flex justify-between border-b border-line py-2 text-cream">
                  <span>{h.d}</span>
                  <span className="tabular-nums text-muted">{h.h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="rounded-full border border-line px-5 py-2.5 text-sm hover:border-bronze">
              {CONTACT.phone}
            </a>
            <a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-5 py-2.5 text-sm hover:border-bronze">
              Instagram
            </a>
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-full border border-line px-5 py-2.5 text-sm hover:border-bronze">
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
