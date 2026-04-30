import { Link } from "@/i18n/routing";
import { Building2, Search, ShieldCheck } from "lucide-react";
import { HeroNetworkAnimation } from "@/components/home/hero-network-animation";

interface HeroSectionProps {
  t: (key: string) => string;
  tCommon: (key: string) => string;
  showOwnerCta: boolean;
  ownerCtaHref: string;
}

export function HeroSection({ t, tCommon, showOwnerCta, ownerCtaHref }: HeroSectionProps) {
  const stats = [
    { value: "500+", label: t("stats.projects") },
    { value: "200+", label: t("stats.contractors") },
    { value: "1,200+", label: t("stats.bids") },
    { value: "350+", label: t("stats.awards") },
  ];

  return (
    <section
      style={{
        background: "linear-gradient(135deg, #1C5963 0%, #2A7B88 40%, #3A8B98 70%, #4A9BA8 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative shapes */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-120px",
          left: "-60px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "10%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "rgba(184, 115, 51, 0.1)",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          opacity: 0.035,
         
        }}
      />

      {/* Decorative rings */}
      <div
        style={{
          position: "absolute",
          top: "-120px",
          right: "-120px",
          zIndex: 0,
          width: "520px",
          height: "520px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-60px",
          right: "-60px",
          zIndex: 0,
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-100px",
          left: "-80px",
          zIndex: 0,
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          border: "1px solid rgba(184,115,51,0.08)",
        }}
      />

      <div
        className="container-app mx-auto"
        style={{
          position: "relative",
          zIndex: 1,
          padding: "clamp(3.4rem, 9vw, 5.2rem) 1rem clamp(3.4rem, 7vw, 4.2rem)",
        }}
      >
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            {/* Eyebrow badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 1rem 0.4rem 0.5rem",
                borderRadius: "100px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
                backdropFilter: "blur(8px)",
                color: "rgba(255,255,255,0.88)",
                fontSize: "0.8125rem",
                fontWeight: 500,
                marginBottom: "2rem",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "var(--brand-copper)",
                  flexShrink: 0,
                }}
              >
                <ShieldCheck style={{ width: "12px", height: "12px", color: "white" }} />
              </span>
              {tCommon("tagline")}
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: "clamp(2rem, 7vw, 3.35rem)",
                fontWeight: 700,
                color: "var(--brand-white)",
                lineHeight: 1.14,
                letterSpacing: "-0.03em",
                marginBottom: "1.15rem",
                maxWidth: "780px",
              }}
            >
              {t("hero.title")}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "clamp(1rem, 2.8vw, 1.1875rem)",
                color: "rgba(255,255,255,0.78)",
                lineHeight: 1.7,
                fontWeight: 400,
                maxWidth: "860px",
              }}
            >
              {t("hero.subtitle")}
            </p>

            {/* Intro paragraph */}
            {t("hero.intro") && (
              <div
                className="hidden"
                style={{
                  width: "min(100%, 680px)",
                  padding: "1.25rem 0",
                  marginLeft: "auto",
                  marginRight: "auto",
                  marginBottom: "1.5rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "rgba(255,255,255,0.80)",
                    lineHeight: 1.8,
                    margin: 0,
                    fontStyle: "italic",
                  }}
                >
                  {t("hero.intro")}
                </p>
              </div>
            )}

            {/* CTA row */}
            <div className="lg:mt-0 !mt-3" style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap" }}>
          {showOwnerCta && (
            <Link
              className="w-full justify-center hover:scale-105 sm:w-auto"
              href={ownerCtaHref as "/auth/register" | "/dashboard/projects/new"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.625rem",
                padding: "0.9375rem 1.25rem",
                borderRadius: "10px",
                fontSize: "0.9375rem",
                fontWeight: 700,
                textDecoration: "none",
                background: "#b77733",
                color: "var(--brand-white)",
                border: "1.5px solid rgba(255,255,255,0.2)",
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.16)`,
                transition: "all 200ms ease",
                letterSpacing: "0.01em",
              }}
            >
              <Building2 style={{ width: "18px", height: "18px" }} />
              {t("hero.ownerCta")}
            </Link>
          )}
          <Link
            className="w-full justify-center hover:scale-105 sm:w-auto"
            href="/marketplace"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.625rem",
              padding: "0.9375rem 1.25rem",
              borderRadius: "10px",
              fontSize: "0.9375rem",
              fontWeight: 700,
              textDecoration: "none",
              color: "var(--brand-white)",
              border: "1.5px solid rgba(255,255,255,0.34)",
              background: "rgba(64, 162, 182, 0.2)",
              backdropFilter: "blur(4px)",
              transition: "all 200ms ease",
            }}
          >
            <Search style={{ width: "18px", height: "18px" }} />
            {t("hero.contractorCta")}
          </Link>
            </div>
            <p
              style={{
                margin: "0.85rem 0 0",
                fontSize: "0.72rem",
                color: "rgba(255,255,255,0.88)",
                lineHeight: 1.5,
              }}
            >
              {t("hero.microcopy")}
            </p>
          </div>

          <div className="mt-3 lg:mt-0">
            <HeroNetworkAnimation />
          </div>
        </div>

        <div style={{ marginTop: "1.45rem",paddingBottom: "1.2rem", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: "1.2rem" }}>
          <div className="grid-cols-2 lg:text-start text-center grid md:grid-cols-4 gap-2"
           
          >
            {stats.map((s) => (
              <div key={s.label} style={{ minWidth: 0 }}>
                <div style={{ color: "#fff", fontSize: "clamp(1.25rem, 3vw, 2rem)", fontWeight: 800, lineHeight: 1.05 }}>
                  {s.value}
                </div>
                <div style={{ color: "rgba(255,255,255,0.85)", fontSize: "clamp(0.76rem, 1.8vw, 1rem)", marginTop: "0.18rem" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Curved bottom edge */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "56px",
          background: "var(--brand-ivory)",
          borderRadius: "48px 48px 0 0",
        }}
      />
    </section>
  );
}
