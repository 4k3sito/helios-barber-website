import nodemailer from "nodemailer"
import { CONTACT } from "./config"

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export interface BookingConfirmation {
  clientName: string
  clientEmail: string
  barberName: string
  serviceName: string
  date: string
  time: string
}

export async function sendBookingConfirmation(booking: BookingConfirmation) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return

  const transport = getTransport()
  await transport.sendMail({
    from: `Helios Barber Studio <${process.env.SMTP_USER}>`,
    to: booking.clientEmail,
    subject: "Confirmación de tu cita — Helios Barber Studio",
    text: `Hola ${booking.clientName},

Tu cita quedó confirmada:

Barbero: ${booking.barberName}
Servicio: ${booking.serviceName}
Fecha: ${booking.date}
Hora: ${booking.time}
Ubicación: ${CONTACT.address}

Te esperamos.
Helios Barber Studio`,
  })
}
