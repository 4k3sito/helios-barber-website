import { FAQ } from "@/lib/faq";

export default function FaqSection() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <section id="preguntas" className="mx-auto max-w-content px-[clamp(20px,5vw,72px)] py-[clamp(72px,11vw,150px)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <div className="grid gap-[clamp(34px,6vw,90px)] lg:grid-cols-[1fr_1.45fr]" data-grid>
        <div>
          <div className="mb-5 flex items-center gap-3.5 font-mono text-xs uppercase tracking-[0.2em] text-accent section-kicker">
            <span>(07)</span>
            <span className="h-px w-[42px] bg-accent/50" />
            <span>Dudas</span>
          </div>
          <h2 className="m-0 font-display text-[clamp(40px,6vw,88px)] font-extrabold leading-[.92] tracking-[-0.04em] section-title">
            Preguntas frecuentes
          </h2>
        </div>
        <div>
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group border-b border-white/10 py-5 first:border-t">
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 font-body text-[clamp(17px,1.6vw,20px)] font-bold tracking-[-0.01em] text-cream [&::-webkit-details-marker]:hidden">
                <h3 className="m-0 text-[inherit] font-[inherit]">{q}</h3>
                <span aria-hidden className="font-mono text-sm text-accent transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="m-0 mt-3 max-w-[65ch] font-body text-base leading-[1.7] text-secondary">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
