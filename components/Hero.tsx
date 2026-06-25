import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative flex min-h-dvh items-end overflow-hidden">
      {/* ponytail: swap this Unsplash placeholder for a full-bleed interior photo of the shop */}
      <Image
        src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2000"
        alt="Interior de Helios Barber"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />

      <div className="relative mx-auto w-full max-w-content px-6 pb-20 sm:pb-28">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-bronze">Premium Grooming · Monterrey</p>
        <h1 className="max-w-3xl font-display text-5xl font-bold leading-[1.05] sm:text-7xl">
          El corte que mereces, sin esperas.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          Barbería de autor. Agenda en línea, elige tu barbero y llega a tu hora.
        </p>
        <a
          href="#agendar"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-bronze px-8 py-4 font-medium text-ink transition-transform duration-200 hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bronze"
        >
          Agendar Cita
        </a>
      </div>
    </section>
  );
}
