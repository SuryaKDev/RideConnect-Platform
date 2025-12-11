import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedRoutes from "@/components/FeaturedRoutes";
import HowItWorks from "@/components/HowItWorks";
import CarShowcase from "@/components/CarShowcase";
import Benefits from "@/components/Benefits";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <Hero />
      <FeaturedRoutes />
      <HowItWorks />
      <CarShowcase />
      <Benefits />
      <CTA />
      <Footer />
    </main>
  );
};

export default Index;
