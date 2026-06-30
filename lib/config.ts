export interface Barber {
  id: string;
  name: string;
  role: string;
  photo: string;
  desc: string;
  calendarId: string;
  timeZone: string;
  hours: { start: string; end: string };
  slotDurationMin: number;
}

export const BARBERS: Barber[] = [
  {
    id: "fabian",
    name: "Fabián",
    role: "Fade & Barba",
    photo: "/uploads/Fabian.jpeg",
    desc: "Experto en desvanecidos impecables y diseño de barba personalizado.",
    calendarId: process.env.GCAL_FABIAN_ID || "primary",
    timeZone: "America/Monterrey",
    hours: { start: "09:00", end: "19:00" },
    slotDurationMin: 30,
  },
  {
    id: "alexis",
    name: "Alexis",
    role: "Tijera & Textura",
    photo: "/uploads/Alexis.jpeg",
    desc: "Especialista en cortes a tijera y técnicas de texturización de alta precisión.",
    calendarId: process.env.GCAL_ALEXIS_ID || "primary",
    timeZone: "America/Monterrey",
    hours: { start: "10:00", end: "19:00" },
    slotDurationMin: 30,
  },
  {
    id: "less",
    name: "Less",
    role: "Rizos & Color",
    photo: "/uploads/Less.jpeg",
    desc: "Especialista en cortes a tijera, rizos y diseños de color.",
    calendarId: process.env.GCAL_LESS_ID || "primary",
    timeZone: "America/Monterrey",
    hours: { start: "09:00", end: "17:00" },
    slotDurationMin: 30,
  },
];

export interface Service {
  name: string;
  duration: string;
  price: string;
}

export const BARBERIA_SERVICES: Service[] = [
  { name: "Corte de Pelo", duration: "55 min", price: "$400" },
  { name: "Corte + Barba", duration: "1:20 hrs", price: "$600" },
  { name: "Diseño y Perfilado de Barba", duration: "40 min", price: "$300" },
  { name: "Diseño y Limpieza de Ceja", duration: "15 min", price: "$150" },
  { name: "Corte + Ceja", duration: "1:05 hrs", price: "$500" },
  { name: "Corte + Barba + Ceja", duration: "1:40 hrs", price: "$650" },
];

export const COLOR_SERVICES: Service[] = [
  { name: "Tinte", duration: "1:30 hrs", price: "$600" },
  { name: "Decoloración", duration: "1:15 hrs", price: "$600" },
  { name: "Decoloración + Tinte", duration: "2:00 hrs", price: "$1,100" },
];

export const CONTACT = {
  whatsapp: "https://wa.me/525523333188",
  whatsappDisplay: "+52 55 2333 3188",
  instagram: "https://instagram.com/helios_barber",
  instagramDisplay: "@helios_barber",
  tiktok: "https://tiktok.com/@helios.barber.stu",
  tiktokDisplay: "@helios.barber.stu",
};

// ponytail: slots closer than this to "now" are hidden (avoids rushed bookings)
export const LEAD_TIME_HOURS = 2;
