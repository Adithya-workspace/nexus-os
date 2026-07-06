import { LandingNavbar } from "@/components/landing/navbar-landing";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { LiveDemo } from "@/components/landing/live-demo";
import { Architecture } from "@/components/landing/architecture";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { Footer } from "@/components/landing/footer";
import { BackgroundFX } from "@/components/dashboard/background-fx";

export default function LandingPage() {
  return (
    <div className="relative">
      <BackgroundFX />
      <LandingNavbar />
      <Hero />
      <Features />
      <LiveDemo />
      <Architecture />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
}
