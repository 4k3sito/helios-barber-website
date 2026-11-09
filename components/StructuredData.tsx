import { BARBERS, BARBERIA_SERVICES, CONTACT } from "@/lib/config";

const BASE = "https://heliosbarber.com";

// schema.org has no BarberShop type — HairSalon (→ HealthAndBeautyBusiness → LocalBusiness) is the closest. Lets Google tie the site to the Maps listing and show prices/hours.
// Keep address/phone identical to the Google Business Profile (NAP consistency).
export default function StructuredData() {
  const opens = BARBERS.map((b) => b.hours.start).sort()[0];
  const closes = BARBERS.map((b) => b.hours.end).sort().at(-1);

  const data = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "@id": `${BASE}/#barbershop`,
    name: "Helios Barbershop",
    url: BASE,
    image: [`${BASE}/uploads/3.jpeg`, `${BASE}/uploads/1.jpeg`, `${BASE}/uploads/6.jpeg`],
    logo: `${BASE}/assets/sun-light.png`,
    description:
      "Barbería premium en Nápoles, Benito Juárez, Ciudad de México. Corte de cabello, fade, diseño de barba y ceja.",
    telephone: CONTACT.whatsappDisplay.replace(/\s/g, ""),
    priceRange: "$150 - $650 MXN",
    currenciesAccepted: "MXN",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Dakota 95, Local 15, 2.º piso",
      addressLocality: "Ciudad de México",
      addressRegion: "CDMX",
      postalCode: "03810",
      addressCountry: "MX",
    },
    hasMap: CONTACT.addressUrl,
    areaServed: ["Nápoles", "Ampliación Nápoles", "Del Valle", "Insurgentes Mixcoac", "Benito Juárez"],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens,
        closes,
      },
    ],
    sameAs: [CONTACT.instagram, CONTACT.tiktok],
    potentialAction: {
      "@type": "ReserveAction",
      target: `${BASE}/#agendar`,
      result: { "@type": "Reservation", name: "Cita en Helios Barbershop" },
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Servicios de barbería",
      itemListElement: BARBERIA_SERVICES.map((s) => ({
        "@type": "Offer",
        price: s.price.replace(/[^0-9.]/g, ""),
        priceCurrency: "MXN",
        itemOffered: { "@type": "Service", name: s.name, description: `${s.name} (${s.duration})` },
      })),
    },
    employee: BARBERS.map((b) => ({ "@type": "Person", name: b.name, jobTitle: `Barbero · ${b.role}` })),
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here: all values come from our own config, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
