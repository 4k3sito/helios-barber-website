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
    timeZone: "America/Mexico_City",
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
    timeZone: "America/Mexico_City",
    hours: { start: "10:00", end: "19:00" },
    slotDurationMin: 30,
  },
  {
    id: "less",
    name: "Less",
    role: "Tijera & Rizos",
    photo: "/uploads/Less.jpeg",
    desc: "Especialista en cortes a tijera y rizos.",
    calendarId: process.env.GCAL_LESS_ID || "primary",
    timeZone: "America/Mexico_City",
    hours: { start: "09:00", end: "17:00" },
    slotDurationMin: 30,
  },
];

export interface Service {
  id: string;
  name: string;
  duration: string;
  durationMin: number;
  price: string;
}

export const BARBERIA_SERVICES: Service[] = [
  { id: "corte", name: "Corte de Pelo", duration: "40 min", durationMin: 40, price: "$400" },
  { id: "corte-nino", name: "Corte de Niño", duration: "35 min", durationMin: 35, price: "$300" },
  { id: "corte-barba", name: "Corte + Barba", duration: "1 hora", durationMin: 60, price: "$600" },
  { id: "barba", name: "Diseño y Perfilado de Barba", duration: "30 min", durationMin: 30, price: "$300" },
  { id: "ceja", name: "Diseño y Limpieza de Ceja", duration: "15 min", durationMin: 15, price: "$150" },
  { id: "corte-ceja", name: "Corte + Ceja", duration: "45 min", durationMin: 45, price: "$500" },
  { id: "corte-barba-ceja", name: "Corte + Barba + Ceja", duration: "1:40 hrs", durationMin: 100, price: "$650" },
];

export const ALL_SERVICES: Service[] = [...BARBERIA_SERVICES];

export const CONTACT = {
  whatsapp: "https://wa.me/525523333188",
  whatsappDisplay: "+52 55 2333 3188",
  instagram: "https://instagram.com/helios_barber",
  instagramDisplay: "@helios_barber",
  tiktok: "https://tiktok.com/@helios.barber.stu",
  tiktokDisplay: "@helios.barber.stu",
  address: "Dakota 95, Nápoles, Benito Juárez, Ciudad de México",
  addressUrl: "https://maps.google.com/?q=Dakota+95,+Napoles,+Benito+Juarez,+Ciudad+de+Mexico",
};

// ponytail: 0 disables the cutoff — owner books last-minute walk-ins himself, don't block him
export const LEAD_TIME_HOURS = 0;
