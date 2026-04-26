"use client";

import { GlobalStyles } from "@/components/landing/lib/styles";
import { MagneticCursor } from "@/components/landing/ui";
import {
  Navbar,
  Hero,
  StatsStrip,
  HowItWorks,
  TwoAudiences,
  Marquee,
  TrustTiers,
  WhyRasi,
  ParallaxQuote,
  CTASection,
  Footer,
} from "@/components/landing/sections";

export function LandingContent() {
  return (
    <>
      <GlobalStyles />
      <MagneticCursor />
      <Navbar />
      <main>
        <Hero />
        <StatsStrip />
        <HowItWorks />
        <TwoAudiences />
        <Marquee />
        <TrustTiers />
        <WhyRasi />
        <ParallaxQuote />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
