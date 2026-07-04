import Link from "next/link";
import { CONTACT } from "@/lib/config";

export const metadata = { title: "Aviso de privacidad · Helios Barber" };

export default function Privacidad() {
  return (
    <main className="mx-auto max-w-[70ch] px-[clamp(20px,5vw,72px)] py-[clamp(72px,11vw,150px)]">
      <Link href="/" className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
        ← Inicio
      </Link>
      <h1 className="mt-8 font-display text-[clamp(32px,5vw,52px)] font-extrabold leading-[1] tracking-[-0.03em] text-cream">
        Aviso de privacidad
      </h1>
      <div className="mt-8 space-y-5 font-body text-base leading-[1.7] text-secondary">
        <p>
          Al agendar una cita en heliosbarber.com te pedimos nombre, teléfono y correo electrónico,
          junto con el barbero, servicio, fecha y hora elegidos.
        </p>
        <p>
          Usamos estos datos únicamente para crear tu cita en el calendario del barbero
          correspondiente y enviarte la confirmación por correo. No vendemos ni compartimos tus
          datos con terceros para publicidad.
        </p>
        <p>
          Este sitio usa Google Analytics para medir de forma anónima cómo se navega la página
          (visitas, secciones más vistas, dispositivo). Google coloca cookies para ello; no
          recopilamos tu nombre ni tus datos de contacto por esta vía. Puedes bloquear estas cookies
          desde la configuración de tu navegador.
        </p>
        <p>
          Para consultar, corregir o eliminar tus datos, escríbenos por WhatsApp al{" "}
          <a href={CONTACT.whatsapp} className="text-accent">{CONTACT.whatsappDisplay}</a>.
        </p>
      </div>
    </main>
  );
}
