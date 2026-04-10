import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ExtraServicesLandingSection from "@/components/landing/ExtraServicesLandingSection";
import CarlosBioSection from "@/components/landing/CarlosBioSection";
import WhoIsThisFor from "@/components/landing/WhoIsThisFor";
import PortalPreview from "@/components/landing/PortalPreview";
import BirthChartPreview from "@/components/landing/BirthChartPreview";
import PricingSection from "@/components/landing/PricingSection";
import Testimonials from "@/components/landing/Testimonials";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import FloatingOrbs from "@/components/landing/FloatingOrbs";
import GoldDustParticles from "@/components/landing/GoldDustParticles";

const Index = () => {
  return (
    <main className="bg-gradient-dark h-full overflow-x-hidden relative">
      <FloatingOrbs />
      <GoldDustParticles />
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <ExtraServicesLandingSection />
        <CarlosBioSection variant="landing" id="experiencia" />
        <WhoIsThisFor />
        <PortalPreview />
        <BirthChartPreview />
        <PricingSection />
        <Testimonials />
        <FAQSection />
        <FinalCTA />
        <Footer />
      </div>
    </main>
  );
};

export default Index;
