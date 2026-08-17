import { Hero } from "@/components/landing/hero";
import { TrustStrip } from "@/components/landing/trust-strip";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PricingTeaser } from "@/components/landing/pricing-teaser";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Features />
      <HowItWorks />
      <PricingTeaser />
      <Faq />
      <FinalCta />
    </>
  );
}
