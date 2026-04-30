import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import {
  HeroSection,
  HowItWorksSection,
  TwoSidedSnapshotSection,
  TrustPillarsSection,
  FinalCtaSection,
  OwnerSupportSection,
  ProfessionalSupportSection,
  CompetitiveAdvantagesSection,
  VerificationTrustSection,
  PartnersSection,
  FaqSection,
} from "@/components/home";
import {
  WhoWeAreSection,
  WhatDeliversSection,
  VisionMissionSection,
  OurStorySection,
  OurValuesSection,
} from "@/components/about";

export default async function HomePage() {
  const [t, tCommon, tAbout, user] = await Promise.all([
    getTranslations("home"),
    getTranslations("common"),
    getTranslations("about"),
    getCurrentUser(),
  ]);

  const showOwnerCta = !user || user.role === "OWNER";
  const ownerCtaHref = !user ? "/auth/register" : "/dashboard/projects/new";

  return (
    <div className="bg-(--brand-ivory)">
      <HeroSection
        t={t}
        tCommon={tCommon}
        showOwnerCta={showOwnerCta}
        ownerCtaHref={ownerCtaHref}
      />

      <HowItWorksSection t={t} />

      <TwoSidedSnapshotSection t={t} />

      <TrustPillarsSection />

      <FinalCtaSection
        t={t}
        showOwnerCta={showOwnerCta}
        ownerCtaHref={ownerCtaHref}
      />

      {/* About Us Sections */}
      <WhoWeAreSection t={tAbout} />
      <VisionMissionSection t={tAbout} />
      <OurStorySection t={tAbout} />
      <OurValuesSection t={tAbout} />
      <WhatDeliversSection />
      <OwnerSupportSection t={t} showOwnerCta={showOwnerCta} ownerCtaHref={ownerCtaHref} />
      <ProfessionalSupportSection t={t} />
      <CompetitiveAdvantagesSection t={t} />
      <VerificationTrustSection t={t} />
      <PartnersSection t={t} />
      <FaqSection t={t} />
    </div>
  );
}