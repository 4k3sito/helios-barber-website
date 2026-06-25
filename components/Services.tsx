import { SERVICES } from "@/lib/config";

export default function Services() {
  return (
    <section id="servicios" className="mx-auto max-w-content px-6 py-24 sm:py-32">
      <div className="mb-14 flex items-end justify-between gap-6">
        <h2 className="font-display text-4xl font-bold sm:text-5xl">Servicios</h2>
        <p className="hidden max-w-xs text-right text-sm text-muted sm:block">
          Cada servicio incluye consulta y acabado. Bloques de 45 minutos.
        </p>
      </div>

      <ul className="divide-y divide-line border-y border-line">
        {SERVICES.map((s) => (
          <li key={s.name} className="grid grid-cols-[1fr_auto] items-baseline gap-4 py-6">
            <div>
              <h3 className="font-display text-xl font-medium">{s.name}</h3>
              <p className="mt-1 text-sm text-muted">{s.desc}</p>
            </div>
            <div className="text-right">
              <span className="font-display text-xl text-bronze tabular-nums">{s.price}</span>
              <span className="block text-xs text-muted">{s.duration}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
