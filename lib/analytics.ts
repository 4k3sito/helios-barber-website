// GA4 funnel events. Initialization lives in app/layout.tsx via next/script.

type GtagEvent =
  | "view_booking_widget"
  | "select_barber"
  | "select_time"
  | "booking_completed";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: GtagEvent, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event, params);
}
