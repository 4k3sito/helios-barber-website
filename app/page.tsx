import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import StudioSection from "@/components/StudioSection";
import ServicesSection from "@/components/ServicesSection";
import BarberosSection from "@/components/BarberosSection";
import GaleriaSection from "@/components/GaleriaSection";
import BookingWidget from "@/components/BookingWidget";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import WhatsAppFab from "@/components/WhatsAppFab";
import Animations from "@/components/Animations";
import StructuredData from "@/components/StructuredData";

// ponytail: without this Next stamps static pages with `s-maxage=31536000`, and Hostinger's CDN
// honoured it — a deploy on 2026-09-07 was still serving the page built on 2026-09-02 (age 4.6d),
// so barbers and prices changed on the origin but not for visitors. One hour is plenty for a page
// that only changes when we deploy. Already-cached copies still need one manual purge in hPanel.
export const revalidate = 3600

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-ink">
      <StructuredData />
      <Animations />
      <Nav />
      <Hero />
      <Marquee />
      <StudioSection />
      <ServicesSection />
      <BarberosSection />
      <GaleriaSection />
      <BookingWidget />
      <FaqSection />
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
