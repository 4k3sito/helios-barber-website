// Shared, non-secret config. Barber eventTypeIds come from your Cal.com dashboard
// (one 45-min event type per barber). These IDs are safe to expose to the browser.

export const TIMEZONE = "America/Monterrey"; // fixed UTC-6 year-round (Mexico dropped DST in 2022)

export type Barber = {
  id: string;
  name: string;
  role: string;
  photo: string;
  eventTypeId: number; // Cal.com event type id for this barber's 45-min slot
};

export const BARBERS: Barber[] = [
  {
    id: "diego",
    name: "Diego Salinas",
    role: "Master Barber · Fades",
    photo: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800",
    eventTypeId: Number("[INSERTE_AQUI_EVENT_TYPE_ID_DIEGO]") || 1,
  },
  {
    id: "marco",
    name: "Marco Treviño",
    role: "Senior Barber · Beard",
    photo: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=800",
    eventTypeId: Number("[INSERTE_AQUI_EVENT_TYPE_ID_MARCO]") || 2,
  },
];

export type Service = { name: string; desc: string; price: string; duration: string };

export const SERVICES: Service[] = [
  { name: "Corte Clásico", desc: "Tijera y máquina, lavado y peinado.", price: "$280", duration: "45 min" },
  { name: "Corte + Barba", desc: "Corte completo más perfilado de barba con toalla caliente.", price: "$420", duration: "45 min" },
  { name: "Afeitado Tradicional", desc: "Navaja, espuma caliente y aftershave.", price: "$250", duration: "45 min" },
  { name: "Arreglo de Barba", desc: "Perfilado, recorte y acondicionado.", price: "$200", duration: "45 min" },
];

export const CONTACT = {
  address: "Av. Constitución 123, Centro, Monterrey, N.L.",
  phone: "+52 81 0000 0000",
  hours: [
    { d: "Lun – Vie", h: "10:00 – 20:00" },
    { d: "Sábado", h: "09:00 – 18:00" },
    { d: "Domingo", h: "Cerrado" },
  ],
  instagram: "https://instagram.com/[INSERTE_AQUI_INSTAGRAM]",
  whatsapp: "https://wa.me/[INSERTE_AQUI_WHATSAPP_E164]",
  // Embed URL: Google Maps → Share → Embed a map → copy the src.
  mapEmbedSrc: "https://www.google.com/maps?q=Monterrey,Mexico&output=embed",
};
