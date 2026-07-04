"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#estudio", label: "Estudio" },
    { href: "#servicios", label: "Servicios" },
    { href: "#barberos", label: "Barberos" },
    { href: "#galeria", label: "Galería" },
    { href: "#contacto", label: "Contacto" },
  ];

  return (
    <>
      <nav
        className={`fixed inset-x-0 top-0 z-nav flex items-center justify-between px-[clamp(20px,5vw,72px)] py-4 transition-colors duration-400 ${
          scrolled
            ? "border-b border-white/8 bg-ink/95 backdrop-blur-md"
            : "bg-ink/60 backdrop-blur-sm"
        }`}
      >
        <a href="#top" className="flex items-center gap-3">
          <Image src="/assets/sun-light.png" alt="Helios" width={34} height={34} className="size-[34px]" />
          <span className="font-display text-lg font-bold tracking-[0.32em] pl-[0.32em]">HELIOS</span>
        </a>
        <div className="flex items-center gap-[38px]">
          <div className="hidden items-center gap-[34px] font-mono text-xs uppercase tracking-[0.16em] text-secondary lg:flex">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors duration-250 hover:text-accent">
                {l.label}
              </a>
            ))}
          </div>
          <a
            href="#agendar"
            className="hidden rounded-ctl bg-accent px-5 py-3 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-opacity hover:opacity-82 lg:inline-block"
          >
            Reservar
          </a>
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Menú"
            className="flex flex-col gap-[5px] bg-none border-0 p-1.5 cursor-pointer lg:hidden"
          >
            <span className="block h-[1.5px] w-6 bg-cream" />
            <span className="block h-[1.5px] w-6 bg-cream" />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-overlay flex flex-col bg-ink/97 backdrop-blur-md px-[clamp(20px,6vw,72px)] py-6">
          <div className="flex items-center justify-between">
            <Image src="/assets/sun-light.png" alt="Helios" width={34} height={34} className="size-[34px]" />
            <button onClick={() => setMenuOpen(false)} aria-label="Cerrar" className="bg-none border-0 text-cream text-3xl cursor-pointer leading-none">
              ×
            </button>
          </div>
          <div className="mt-[7vh] flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-white/8 py-3 font-display text-3xl font-bold tracking-[-0.01em]"
              >
                {l.label}
              </a>
            ))}
          </div>
          <a
            href="#agendar"
            onClick={() => setMenuOpen(false)}
            className="mt-auto rounded-ctl bg-accent py-4 text-center font-mono text-xs uppercase tracking-[0.14em] text-ink"
          >
            Reservar
          </a>
        </div>
      )}
    </>
  );
}
