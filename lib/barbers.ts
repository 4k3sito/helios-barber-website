export interface Barber {
  id: string
  name: string
  title: string
  photo: string
  calendarId: string
  timeZone: string
  hours: { start: string; end: string } // "09:00", "18:00"
  slotDurationMin: number
}

export const barbers: Barber[] = [
  {
    id: "alex",
    name: "Ake",
    title: "Master Barber",
    photo: "/barbers/alex.jpg",
    // ponytail: testing with a shared Gmail calendar
    calendarId: "alexitokunsito777@gmail.com",
    timeZone: "America/Chicago",
    hours: { start: "09:00", end: "19:00" },
    slotDurationMin: 30,
  },
  {
    id: "marco",
    name: "Marco",
    title: "Style Specialist",
    photo: "/barbers/marco.jpg",
    calendarId: process.env.GCAL_MARCO_ID || "primary",
    timeZone: "America/Chicago",
    hours: { start: "10:00", end: "19:00" },
    slotDurationMin: 30,
  },
  {
    id: "sarah",
    name: "Sarah",
    title: "Senior Stylist",
    photo: "/barbers/sarah.jpg",
    calendarId: process.env.GCAL_SARAH_ID || "primary",
    timeZone: "America/Chicago",
    hours: { start: "09:00", end: "17:00" },
    slotDurationMin: 30,
  },
]
