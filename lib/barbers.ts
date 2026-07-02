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
    calendarId: process.env.GCAL_FABIAN_ID || "alexitokunsito777@gmail.com",
    timeZone: "America/Mexico_City",
    hours: { start: "09:00", end: "19:00" },
    slotDurationMin: 30,
  },
  {
    id: "alexis",
    name: "Alexis",
    title: "Tijera & Textura",
    photo: "/uploads/Alexis.jpeg",
    calendarId: process.env.GCAL_ALEXIS_ID || "alexitokunsito777@gmail.com",
    timeZone: "America/Mexico_City",
    hours: { start: "10:00", end: "19:00" },
    slotDurationMin: 30,
  },
  {
    id: "less",
    name: "Less",
    title: "Rizos & Color",
    photo: "/uploads/Less.jpeg",
    calendarId: process.env.GCAL_LESS_ID || "alexitokunsito777@gmail.com",
    timeZone: "America/Mexico_City",
    hours: { start: "09:00", end: "17:00" },
    slotDurationMin: 30,
  },
]
