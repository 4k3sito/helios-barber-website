# Helios Barber

Landing premium + agendamiento de citas para barbería en Monterrey.
La lógica de disponibilidad, slots de 45 min, anti-doble-reserva y sincronización
con Google Calendar la maneja **Cal.com**; este repo es el frontend de marca + dos
proxies que esconden la API key de Cal.com.

## Por qué Cal.com y no un backend custom

Cal.com (open-source) ya resuelve, probado en producción:
- Disponibilidad por barbero (`freebusy`) y bloques de 45 min → es la *duración del event type*.
- **Anti-doble-reserva atómico** — el bug que un freebusy+insert manual no previene.
- Sync bidireccional con Google Calendar (sin Service Account ni domain-wide delegation).
- Confirmaciones por email/recordatorios.

Construir eso a mano eran ~600 líneas de Node/TS + tests de timezone que aquí no existen
porque no hacen falta. (`America/Monterrey` es UTC-6 fijo desde 2022, sin DST.)

## Setup

1. `npm install`
2. Cal.com: crea un event type de **45 min por barbero** → copia cada `eventTypeId` a `lib/config.ts`.
3. `cp .env.example .env.local` y rellena `CAL_API_KEY` + `NEXT_PUBLIC_GA4_ID`.
4. `npm run dev` → http://localhost:3000

## Dónde reemplazar placeholders

| Placeholder | Archivo |
|---|---|
| `CAL_API_KEY`, `NEXT_PUBLIC_GA4_ID` | `.env.local` |
| `eventTypeId` por barbero, fotos, servicios, dirección, redes, mapa | `lib/config.ts` |
| Foto hero / interiores | `components/Hero.tsx` |

## Eventos GA4 (embudo)

`view_booking_widget` → `select_barber` → `select_time` → `booking_completed`
(definidos en `lib/analytics.ts`, disparados desde `components/BookingWidget.tsx`).
