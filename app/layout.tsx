import type { Metadata } from "next";
import { JetBrains_Mono, Lora } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

const body = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Helios Barber · Premium Grooming en CDMX",
  description:
    "Barbería premium en Nápoles, Benito Juárez, Ciudad de México. Cortes, barba y afeitado tradicional. Agenda tu cita en línea.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${mono.variable} ${body.variable}`}>
      <body className="font-body text-body antialiased">
        {children}
      </body>
    </html>
  );
}
