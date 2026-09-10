export interface Barber {
  id: string
  name: string
  title: string
  photo: string
  calendarId: string
  timeZone: string
  hours: { start: string; end: string }
  slotDurationMin: number
}

export const barbers: Barber[] = [
  {
    id: "fabian",
    name: "Fabián",
    title: "Fade & Barba",
    photo: "/uploads/Fabian.jpeg",
    calendarId: process.env.GCAL_FABIAN_ID || "fabianmejiamendoza8@gmail.com",
    timeZone: "America/Mexico_City",
    hours: { start: "09:00", end: "19:00" },
    slotDurationMin: 30,
  },
  {
    id: "alexis",
    name: "Alexis",
    title: "Tijera & Textura",
    photo: "/uploads/Alexis.jpeg",
    calendarId: process.env.GCAL_ALEXIS_ID || "moyalexk50@gmail.com",
    timeZone: "America/Mexico_City",
    hours: { start: "10:00", end: "19:00" },
    slotDurationMin: 30,
  },
  // Marlon is on the team grid (lib/config.ts) but has no entry here until he shares his
  // calendar with the service account — the API routes only know barbers listed in this array.
  // {
  //   id: "marlon",
  //   name: "Marlon",
  //   title: "Tijera & Navaja",
  //   photo: "/uploads/Marlon.jpeg",
  //   calendarId: process.env.GCAL_MARLON_ID || "marlonblack1205@gmail.com",
  //   timeZone: "America/Mexico_City",
  //   hours: { start: "10:00", end: "19:00" },
  //   slotDurationMin: 30,
  // },
]

// Owner's calendar — every booking is mirrored here too, so one calendar shows all barbers' schedules.
export const OWNER_CALENDAR_ID = process.env.GCAL_OWNER_ID || "leitoramlo55@gmail.com"
