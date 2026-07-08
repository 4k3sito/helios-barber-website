# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start dev server (Next.js 14 App Router)
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint (next/core-web-vitals)
- `npm test` — Run all Vitest tests once
- `npm run test:watch` — Run tests in watch mode
- `npm run test -- lib/__tests__/slots.test.ts` — Run a single test file

## Architecture

**Next.js 14 App Router** single-page site for Helios Barber Studio (Ciudad de México, MX). Availability is computed in-memory from Google Calendar free/busy queries — Calendar remains the source of truth for bookings. A Supabase (Postgres) database (`lib/db.ts`) stores schedule overrides and a record copy of each appointment; see `schema.sql`. No state management library, just React hooks.

### Key directories

| Path | Role |
|------|------|
| `app/` | App Router pages + API route handlers |
| `components/` | All React components (composable sections for the SPA) |
| `lib/` | Business logic, config, Google Calendar integration |
| `lib/__tests__/` | Vitest unit tests |
| `public/uploads/` | Static images referenced by components |
| `helios/` | Original image assets (not served directly) |

### Data flow: booking

1. `BookingWidget.tsx` (client) calls `GET /api/slots?barberId=X&date=YYYY-MM-DD`
2. `app/api/slots/route.ts` reads `lib/barbers.ts` for calendar IDs, calls `lib/google-calendar.ts` to query free/busy via `googleapis`, computes available 30-min slots within working hours (minus 2h lead time)
3. User submits → `POST /api/book` → validates lead time → creates Calendar event via service account

### Important: data duplication

Barber config exists in two places with different shapes:

- **`lib/config.ts`** — Public data consumed by UI components (fields: `id`, `name`, `role`, `desc`, `photo`). This is the source of truth for what users see.
- **`lib/barbers.ts`** — Backend data consumed by API routes (fields: `id`, `name`, `title`, `calendarId`). Loads calendar IDs from `GCAL_*_ID` env vars.

Both describe the same 3 barbers (Fabian, Alexis, Less). Keep them in sync when adding/removing barbers.

### Env vars (`.env.local`)

| Var | Purpose |
|-----|---------|
| `GCAL_CLIENT_EMAIL` | Service account email |
| `GCAL_PRIVATE_KEY_BASE64` | Base64-encoded RSA private key (avoids multi-line PEM issues) |
| `GCAL_FABIAN_ID`, `GCAL_ALEXIS_ID`, `GCAL_LESS_ID` | Google Calendar IDs per barber |
| `ADMIN_PASSWORD` | Shared password gating `/admin/schedule` (owner-only schedule editor) |
| `SUPABASE_URL`, `SUPABASE_API_KEY` | Supabase project URL + service_role key (server-only, bypasses RLS — never the anon key). Must also be set in hPanel's Node.js App env vars, since `.env.local` isn't deployed (deploy is GitHub push → Hostinger auto-redeploy) |

See `SETUP.md` for Google Cloud setup steps (service account, Calendar API enablement, calendar sharing).

### Owner schedule overrides (`/admin/schedule`)

Lets the owner mark a barber's day off, or override that day's hours, for the next 4 weeks. Gated by `middleware.ts` (password → SHA-256 cookie, see `ADMIN_PASSWORD`). Overrides are stored in the `schedule_overrides` Supabase table (see `lib/db.ts` / `schema.sql`), written via `lib/schedule-overrides.ts`. Both `app/api/slots/route.ts` and `app/api/book/route.ts` read overrides via `getEffectiveHours()` so a day-off/hours change is enforced server-side, not just hidden in the UI.

### Appointments table

`app/api/book/route.ts` also inserts a row into the `appointments` table after the Calendar event is created — a record/reporting copy only. Google Calendar stays the source of truth for availability (see "Data flow: booking" above); if the DB insert fails, the booking still succeeds since the Calendar event already exists.

### Styling

- Tailwind CSS with custom theme in `tailwind.config.ts` (colors: ink/surface/bronze/cream, fonts: Lora/JetBrains Mono)
- GSAP 3 + ScrollTrigger for scroll animations in `components/Animations.tsx` (respects `prefers-reduced-motion`)
- Responsive breakpoints at 860px (mobile nav collapse)

### Components

All under `components/`. Client components (`"use client"`): `Nav`, `Marquee`, `BookingWidget`, `Animations`. Others are server components. The home page `app/page.tsx` composes them in sequence: Nav → Hero → Marquee → StudioSection → ServicesSection → BarberosSection → GaleriaSection → BookingWidget → Footer.
