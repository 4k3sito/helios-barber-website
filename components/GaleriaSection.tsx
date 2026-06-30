import Image from "next/image";

const IMAGES = [
  { src: "/uploads/6.jpeg", alt: "Vista general del interior de Helios Barber Studio", className: "row-span-2 h-full w-full rounded-card object-cover aspect-[3/4]", w: 400, h: 600 },
  { src: "/uploads/2.jpeg", alt: "Estación de barbería con espejo e iluminación cálida", className: "w-full rounded-card object-cover aspect-[3/4]", w: 400, h: 400 },
  { src: "/uploads/8.jpeg", alt: "Sillón de barbería vintage en el estudio", className: "w-full rounded-card object-cover aspect-[3/4]", w: 400, h: 400 },
  { src: "/uploads/7.jpeg", alt: "Detalle del área de lavado y styling", className: "row-span-2 h-full w-full rounded-card object-cover aspect-[3/4]", w: 400, h: 600 },
  { src: "/uploads/4.jpeg", alt: "Área de espera con diseño minimalista", className: "col-span-2 w-full rounded-card object-cover aspect-[3/2]", w: 800, h: 400 },
];

export default function GaleriaSection() {
  return (
    <section id="galeria" className="pb-[clamp(20px,4vw,40px)]">
      <div className="mx-auto mb-[clamp(34px,5vw,56px)] max-w-content px-[clamp(20px,5vw,72px)]">
        <div className="flex flex-wrap items-end justify-between gap-[18px]">
          <div>
            <div className="mb-5 flex items-center gap-3.5 font-mono text-xs uppercase tracking-[0.2em] text-bronze section-kicker">
              <span>(04)</span>
              <span className="h-px w-[42px] bg-bronze/50" />
              <span>El espacio</span>
            </div>
            <h2 className="m-0 font-display text-[clamp(46px,8vw,128px)] font-extrabold leading-[.9] tracking-[-0.04em] section-title">
              Galería
            </h2>
          </div>
          <p className="m-0 max-w-[65ch] font-body text-base leading-[1.6] text-secondary">
            Concreto, luz cálida y detalle. Un ambiente diseñado para que la experiencia esté a la
            altura del resultado.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 px-2 md:grid-cols-4" data-gal>
        {IMAGES.map((img) => (
          <Image key={img.src} src={img.src} alt={img.alt} width={img.w} height={img.h} className={img.className} />
        ))}
      </div>
    </section>
  );
}
