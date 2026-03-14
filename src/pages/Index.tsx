import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsBar from "@/components/landing/StatsBar";
import BirthChartPreview from "@/components/landing/BirthChartPreview";
import HowItWorks from "@/components/landing/HowItWorks";
import PortalPreview from "@/components/landing/PortalPreview";
import AccompanimentSection from "@/components/landing/AccompanimentSection";
import Testimonials from "@/components/landing/Testimonials";
import WhoIsThisFor from "@/components/landing/WhoIsThisFor";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import NotesSection from "@/components/landing/NotesSection";
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
        <StatsBar />
        <BirthChartPreview />
        <HowItWorks />
        <PortalPreview />
        <AccompanimentSection />
        <Testimonials />
        <WhoIsThisFor />
        <PricingSection />
        <FAQSection />
        <NotesSection />
        <FinalCTA />
        <Footer />
      </div>
    </main>
  );
};

export default Index;
