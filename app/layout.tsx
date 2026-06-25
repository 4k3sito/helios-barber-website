import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-display" });
const sans = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-sans" });

const GA_ID = process.env.NEXT_PUBLIC_GA4_ID; // e.g. G-XXXXXXXXXX

export const metadata: Metadata = {
  title: "Helios Barber · Premium Grooming en Monterrey",
  description: "Barbería premium en Monterrey. Cortes, barba y afeitado tradicional. Agenda tu cita en línea.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans">
        {children}
        {GA_ID ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
