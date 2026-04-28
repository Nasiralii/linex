import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import {
  HeroSection,
  StatsSection,
  HowItWorksSection,
  TrustPillarsSection,
  FinalCtaSection,
} from "@/components/home";
import {
  WhoWeAreSection,
  WhatDeliversSection,
  WhatIsNotSection,
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

      <StatsSection t={t} />

      <HowItWorksSection t={t} />

      <TrustPillarsSection t={t} />

      <FinalCtaSection
        t={t}
        showOwnerCta={showOwnerCta}
        ownerCtaHref={ownerCtaHref}
      />

      {/* About Us Sections */}
      <WhoWeAreSection t={tAbout} />
      <WhatIsNotSection t={tAbout} />
      <VisionMissionSection t={tAbout} />
      <OurStorySection t={tAbout} />
      <OurValuesSection t={tAbout} />
      <WhatDeliversSection t={tAbout} />
    </div>
  );
}