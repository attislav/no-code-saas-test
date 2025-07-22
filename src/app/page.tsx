import { HeroSection } from "@/features/landing/hero-section";
import { FeaturesSection } from "@/features/features-section";
import { PricingPreview } from "@/features/pricing-preview";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <PricingPreview />
    </>
  );
}
