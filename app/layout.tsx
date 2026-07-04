import type { Metadata } from "next";
import { JetBrains_Mono, Lora } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const gaId = process.env.NEXT_PUBLIC_GA_ID;

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

const title = "Helios Barber · Premium Grooming en CDMX";
const description =
  "Barbería premium en Nápoles, Benito Juárez, Ciudad de México. Cortes, barba y afeitado tradicional. Agenda tu cita en línea.";

export const metadata: Metadata = {
  metadataBase: new URL("https://heliosbarber.com"),
  title,
  description,
  openGraph: { title, description, type: "website", locale: "es_MX" },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${mono.variable} ${body.variable}`}>
      <body className="font-body text-body antialiased">
        <a
          href="#top"
          className="fixed left-3 top-3 z-overlay -translate-y-20 rounded-ctl bg-accent px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-ink transition-transform focus:translate-y-0"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
