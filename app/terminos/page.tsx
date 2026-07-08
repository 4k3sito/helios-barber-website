import Link from "next/link";

export const metadata = { title: "Términos de servicio · Helios Barber" };

export default function Terminos() {
  return (
    <main className="mx-auto max-w-[70ch] px-[clamp(20px,5vw,72px)] py-[clamp(72px,11vw,150px)]">
      <Link href="/" className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
        ← Inicio
      </Link>
      <h1 className="mt-8 font-display text-[clamp(32px,5vw,52px)] font-extrabold leading-[1] tracking-[-0.03em] text-cream">
        Términos de servicio
      </h1>
      <div className="mt-8 space-y-5 font-body text-base leading-[1.7] text-secondary">
        <p>
          Al reservar, el horario queda apartado exclusivamente para ti con el barbero elegido.
        </p>
        <p>
          Si necesitas cancelar o cambiar tu cita, avísanos por WhatsApp con la mayor anticipación
          posible para poder ofrecer el horario a otro cliente.
        </p>
        <p>
          Los precios mostrados están en pesos mexicanos (MXN), incluyen I.V.A. y pueden cambiar
          sin previo aviso.
        </p>
      </div>
    </main>
  );
}
