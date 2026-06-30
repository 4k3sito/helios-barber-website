"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const ITEMS = [
  "Corte",
  "Barba",
  "Color",
  "Desvanecidos",
  "Diseño de ceja",
  "Experiencia premium",
];

/** Genera N repeticiones con separador ◆ entre cada item */
function repeatItems(n: number) {
  const all: string[] = [];
  for (let i = 0; i < n; i++) {
    for (const item of ITEMS) {
      all.push(item);
    }
  }
  return all;
}

/** Construye el texto plano con separadores */
function buildText(items: string[]) {
  return items
    .map((t, i) => (i < items.length - 1 ? `${t}  ✦  ` : t))
    .join("");
}

export default function Marquee() {
  const container = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 4 copias → -50% = exactamente 2 copias de desplazamiento → reset invisible
    gsap.fromTo(
      track.current,
      { xPercent: 0 },
      {
        xPercent: -50,
        duration: 32,
        ease: "none",
        repeat: -1,
      },
    );
  }, { scope: container });

  return (
    <div
      ref={container}
      className="relative overflow-hidden border-y border-bronze/20 bg-gradient-to-r from-bronze/10 via-bronze/6 to-bronze/10 py-4"
    >
      {/* Fade edges for ribbon effect */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-ink to-transparent" />
      {/* Subtle top/bottom shine lines */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-bronze/30 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-bronze/30 to-transparent" />

      <div
        ref={track}
        className="w-max whitespace-nowrap font-mono text-xs uppercase tracking-[0.28em] text-bronze"
        aria-hidden
      >
        {buildText(repeatItems(4))}
      </div>
    </div>
  );
}
