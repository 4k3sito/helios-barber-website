import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import StudioSection from "@/components/StudioSection";
import ServicesSection from "@/components/ServicesSection";
import BarberosSection from "@/components/BarberosSection";
import GaleriaSection from "@/components/GaleriaSection";
import BookingWidget from "@/components/BookingWidget";
import Footer from "@/components/Footer";
import Animations from "@/components/Animations";

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-ink" style={{ "--gold": "#b8895a" } as React.CSSProperties}>
      <Animations />
      <Nav />
      <Hero />
      <Marquee />
      <StudioSection />
      <ServicesSection />
      <BarberosSection />
      <GaleriaSection />
      <BookingWidget />
      <Footer />
    </div>
  );
}
