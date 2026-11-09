import { BARBERS, BARBERIA_SERVICES, CONTACT } from "@/lib/config";

// Answers are built from config so prices/hours never drift from the services list.
// Used by FaqSection (visible) and its FAQPage JSON-LD — Google requires both to match.

const svc = (id: string) => BARBERIA_SERVICES.find((s) => s.id === id);
const priceOf = (id: string) => svc(id)?.price ?? "";
const opens = BARBERS.map((b) => b.hours.start).sort()[0];
const closes = BARBERS.map((b) => b.hours.end).sort().at(-1);
const cheapest = BARBERIA_SERVICES.reduce((a, b) =>
  Number(a.price.replace(/\D/g, "")) <= Number(b.price.replace(/\D/g, "")) ? a : b,
);

export const FAQ: { q: string; a: string }[] = [
  {
    q: "¿Dónde está Helios Barbershop?",
    a: `Estamos en ${CONTACT.address}, a pasos del World Trade Center (WTC). Atendemos a clientes de Nápoles, Del Valle, Ampliación Nápoles y toda la alcaldía Benito Juárez.`,
  },
  {
    q: "¿Cuál es el horario de la barbería?",
    a: `Abrimos todos los días de ${opens} a ${closes} h. El horario de cada barbero puede variar; en la sección de reservas ves en tiempo real los horarios disponibles.`,
  },
  {
    q: "¿Cuánto cuesta un corte de cabello?",
    a: `El corte de pelo cuesta ${priceOf("corte")} MXN, corte + barba ${priceOf("corte-barba")} MXN y corte de niño ${priceOf("corte-nino")} MXN. Nuestros servicios van desde ${cheapest.price} MXN (${cheapest.name.toLowerCase()}). Todos los precios incluyen I.V.A.`,
  },
  {
    q: "¿Cómo agendo una cita?",
    a: `Reserva en línea en esta página: eliges barbero, servicio y horario en menos de un minuto. También puedes agendar por WhatsApp al ${CONTACT.whatsappDisplay}.`,
  },
  {
    q: "¿Hacen fade y diseño de barba?",
    a: `Sí. Hacemos desvanecidos (fade), cortes a tijera y navaja, y diseño y perfilado de barba desde ${priceOf("barba")} MXN. Puedes elegir al barbero especialista en la técnica que buscas.`,
  },
  {
    q: "¿Hacen cortes para niño?",
    a: `Sí, el corte de niño cuesta ${priceOf("corte-nino")} MXN y dura aproximadamente ${svc("corte-nino")?.duration}.`,
  },
  {
    q: "¿Puedo cancelar o cambiar mi cita?",
    a: "Sí. Avísanos por WhatsApp con la mayor anticipación posible para poder ofrecer el horario a otro cliente.",
  },
];
