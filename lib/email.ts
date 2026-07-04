import nodemailer from "nodemailer"
import { CONTACT } from "./config"

function getTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
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
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return

  const transport = getTransport()
  await transport.sendMail({
    from: `Helios Barber Studio <${process.env.GMAIL_USER}>`,
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
