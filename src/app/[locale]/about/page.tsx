import { getTranslations } from "next-intl/server";
import {
  AboutHeroSection,
  WhoWeAreSection,
  WhatDeliversSection,
  WhatIsNotSection,
  VisionMissionSection,
  OurStorySection,
  OurValuesSection,
} from "@/components/about";

export default async function AboutPage() {
  const t = await getTranslations("about");

  return (
    <div className="bg-(--brand-ivory)">
      <AboutHeroSection t={t} />
      <WhoWeAreSection t={t} />
      <WhatDeliversSection t={t} />
      <WhatIsNotSection t={t} />
      <VisionMissionSection t={t} />
      <OurStorySection t={t} />
      <OurValuesSection t={t} />

      {/* Tagline / CTA Section */}
      <section className="relative overflow-hidden py-12 md:py-16 bg-linear-to-br from-(--brand-navy) via-(--brand-navy-light) to-(--brand-teal-dark)">
        {/* Background texture */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 85% 25%, rgba(184,115,51,0.1) 0%, transparent 40%),
              radial-gradient(circle at 10% 75%, rgba(42,123,136,0.15) 0%, transparent 45%)
            `,
          }}
        />

        <div className="container-app relative z-10 px-4 md:px-6">
          <p className="text-lg md:text-xl lg:text-2xl font-medium text-(--brand-white) text-center max-w-3xl mx-auto leading-relaxed">
            {t("tagline")}
          </p>
        </div>
      </section>
    </div>
  );
}
