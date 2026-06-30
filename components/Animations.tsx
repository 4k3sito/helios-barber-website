"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Animations() {
  const once = useRef(false);

  useEffect(() => {
    if (once.current) return;
    once.current = true;

    // Respect prefers-reduced-motion: skip all animations
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      ScrollTrigger.refresh();
      return;
    }

    let ctx = gsap.context(() => {
      // ── Hero ──────────────────────────────────────────
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Nav slides down
      tl.from("nav", { y: -40, opacity: 0, duration: 0.6 }, 0);

      // Hero kicker
      tl.from(".hero-kicker", { y: 30, opacity: 0, duration: 0.7 }, 0.15);

      // Hero title "Helios" — scales up from slightly larger + fades
      tl.from(".hero-title", {
        scale: 1.12,
        opacity: 0,
        duration: 1.1,
        ease: "power2.out",
      }, 0.25);

      // Hero subtitle paragraph
      tl.from(".hero-sub", { y: 40, opacity: 0, duration: 0.8 }, 0.55);

      // Scroll indicator
      tl.from(".hero-scroll", { y: 20, opacity: 0, duration: 0.6 }, 0.75);

      // ── Section kickers (01–06) ──────────────────────
      gsap.utils.toArray<HTMLElement>(".section-kicker").forEach((el) => {
        const parent = el.closest("section") || el.parentElement;
        if (!parent) return;
        ScrollTrigger.create({
          trigger: parent,
          start: "top 82%",
          onEnter: () => {
            gsap.fromTo(el, { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
          },
          once: true,
        });
      });

      // ── Section titles ────────────────────────────────
      gsap.utils.toArray<HTMLElement>(".section-title").forEach((el) => {
        const parent = el.closest("section") || el.parentElement;
        if (!parent) return;
        ScrollTrigger.create({
          trigger: parent,
          start: "top 78%",
          onEnter: () => {
            gsap.fromTo(el, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" });
          },
          once: true,
        });
      });

      // ── Studio text blocks ────────────────────────────
      ScrollTrigger.create({
        trigger: "#estudio",
        start: "top 75%",
        onEnter: () => {
          gsap.fromTo("#estudio h2", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" });
          gsap.fromTo("#estudio p", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.15 });
          gsap.fromTo("#estudio img", { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.3 });
          // Stats counters
          gsap.utils.toArray<HTMLElement>(".stat-num").forEach((el, i) => {
            const target = parseInt(el.dataset.target || el.textContent || "0", 10);
            const isPct = el.textContent?.includes("%");
            const isNum = !isPct;
            gsap.fromTo(
              el,
              { textContent: 0 },
              {
                textContent: target,
                duration: 1.2,
                delay: 0.4 + i * 0.15,
                ease: "power2.out",
                snap: { textContent: isNum ? 1 : 0.1 },
                onUpdate: function () {
                  const val = (this as any).targets()[0];
                  if (isPct) {
                    val.textContent = Math.round(Number(val.textContent)) + "%";
                  }
                },
              }
            );
          });
        },
        once: true,
      });

      // ── Service rows stagger ──────────────────────────
      ScrollTrigger.create({
        trigger: "#servicios",
        start: "top 72%",
        onEnter: () => {
          gsap.fromTo(
            "#servicios .service-row",
            { x: -30, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.06 }
          );
          gsap.fromTo("#servicios .cta-card", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.3 });
        },
        once: true,
      });

      // ── Barber cards stagger ──────────────────────────
      ScrollTrigger.create({
        trigger: "#barberos",
        start: "top 75%",
        onEnter: () => {
          gsap.fromTo(
            "#barberos [data-barber-card]",
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.12 }
          );
        },
        once: true,
      });

      // ── Gallery stagger ───────────────────────────────
      ScrollTrigger.create({
        trigger: "#galeria",
        start: "top 78%",
        onEnter: () => {
          gsap.fromTo(
            "#galeria img",
            { scale: 0.92, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.07 }
          );
        },
        once: true,
      });

      // ── Booking widget ────────────────────────────────
      ScrollTrigger.create({
        trigger: "#agendar",
        start: "top 80%",
        onEnter: () => {
          gsap.fromTo("#agendar .section-kicker", { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
          gsap.fromTo("#agendar h2", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.1 });
          gsap.fromTo("#agendar .booking-card", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.25 });
        },
        once: true,
      });

      // ── Footer ────────────────────────────────────────
      ScrollTrigger.create({
        trigger: "#contacto",
        start: "top 82%",
        onEnter: () => {
          gsap.fromTo("#contacto h2", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" });
          gsap.fromTo("#contacto .contact-row", { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.08, delay: 0.2 });
        },
        once: true,
      });

      // ── Refresh ScrollTrigger after layout settles ────
      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return null;
}
