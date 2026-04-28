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
      <section
        style={{
          background: "linear-gradient(150deg, var(--brand-navy) 0%, var(--brand-navy-light) 55%, var(--brand-teal-dark) 100%)",
          padding: "4rem 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              radial-gradient(circle at 85% 25%, rgba(184,115,51,0.1) 0%, transparent 40%),
              radial-gradient(circle at 10% 75%, rgba(42,123,136,0.15) 0%, transparent 45%)
            `,
          }}
        />

        <div className="container-app" style={{ position: "relative", zIndex: 1 }}>
          <p
            style={{
              fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)",
              fontWeight: 500,
              color: "var(--brand-white)",
              textAlign: "center",
              maxWidth: "800px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            {t("tagline")}
          </p>
        </div>
      </section>
    </div>
  );
}
