// Server-only Cal.com API v2 client. Keeps CAL_API_KEY out of the browser.
// Docs: https://cal.com/docs/api-reference/v2

import "server-only";
import { TIMEZONE } from "./config";

const BASE = "https://api.cal.com/v2";
const API_KEY = process.env.CAL_API_KEY; // set in .env.local

function headers(apiVersion: string): HeadersInit {
  if (!API_KEY) throw new Error("CAL_API_KEY is not set");
  return {
    Authorization: `Bearer ${API_KEY}`,
    "cal-api-version": apiVersion,
    "Content-Type": "application/json",
  };
}

// Returns ISO start strings (with -06:00 offset) for the given local day.
export async function getSlots(eventTypeId: number, date: string): Promise<string[]> {
  const url = new URL(`${BASE}/slots`);
  url.searchParams.set("eventTypeId", String(eventTypeId));
  url.searchParams.set("start", date); // YYYY-MM-DD
  url.searchParams.set("end", date);
  url.searchParams.set("timeZone", TIMEZONE);

  const res = await fetch(url, { headers: headers("2024-09-04"), cache: "no-store" });
  if (!res.ok) throw new Error(`Cal slots ${res.status}: ${await res.text()}`);

  // Shape: { status, data: { "YYYY-MM-DD": [{ start: ISO }, ...] } }
  const json = (await res.json()) as { data?: Record<string, { start: string }[]> };
  const day = json.data?.[date] ?? [];
  return day.map((s) => s.start);
}

export type BookingInput = {
  eventTypeId: number;
  start: string; // ISO from getSlots
  name: string;
  phone: string;
  email: string;
};

export async function createBooking(input: BookingInput): Promise<{ uid: string }> {
  const res = await fetch(`${BASE}/bookings`, {
    method: "POST",
    headers: headers("2024-08-13"),
    cache: "no-store",
    body: JSON.stringify({
      start: input.start,
      eventTypeId: input.eventTypeId,
      attendee: {
        name: input.name,
        email: input.email,
        phoneNumber: input.phone,
        timeZone: TIMEZONE,
        language: "es",
      },
    }),
  });
  if (!res.ok) throw new Error(`Cal booking ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { data?: { uid?: string } };
  return { uid: json.data?.uid ?? "" };
}
