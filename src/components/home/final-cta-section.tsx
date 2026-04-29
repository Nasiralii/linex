import { Link } from "@/i18n/routing";
import { Building2, Award, HardHat, Globe, TrendingUp } from "lucide-react";

interface FinalCtaSectionProps {
  t: (key: string) => string;
  showOwnerCta: boolean;
  ownerCtaHref: string;
}

export function FinalCtaSection({ t, showOwnerCta, ownerCtaHref }: FinalCtaSectionProps) {
  const whyRasiItems = [
    { icon: HardHat, text: t("whyRasi.constructionOnly"), bg: "var(--brand-copper-light)", color: "#0d7377" },
    { icon: Award, text: t("whyRasi.qualification"), bg: "var(--brand-teal-light)", color: "#0d7377" },
    { icon: TrendingUp, text: t("whyRasi.transparent"), bg: "#e8ecf4", color: "#0d7377" },
    { icon: Globe, text: t("whyRasi.saudiMarket"), bg: "var(--brand-ivory)", color: "#0d7377" },
  ];

  return (
    <section
      style={{
        background: "var(--brand-teal)",
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
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.025,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
      {/* Decorative ring */}
      <div
        style={{
          position: "absolute",
          bottom: "-140px",
          right: "-140px",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      />

      <div
        className="container-app"
        id="why-rasi"
        style={{
          position: "relative",
          zIndex: 1,
          padding: "5.5rem 2rem",
          textAlign: "center",
        }}
      >
        {/* Why Rasi */}
        <div style={{ marginBottom: "3rem" }}>
          <h2
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 700,
              color: "var(--brand-white)",
              marginBottom: "2rem",
              letterSpacing: "-0.02em",
            }}
          >
            {t("whyRasi.title")}
          </h2>
          <div
            className="why-rasi-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "1.5rem",
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            {whyRasiItems.map((item, i) => (
              <div
                key={i}
                className={`why-rasi-card rounded-xl ${i === 0 ? "md:rounded-br-3xl" : i === 1 ? "md:rounded-bl-3xl" : i === 2 ? "md:rounded-tr-3xl" : "md:rounded-tl-3xl"}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1.25rem 1.5rem",
                  background: item.bg,
                  boxShadow: "0 4px 24px rgba(27,42,74,0.12)",
                  border: "1px solid var(--brand-ivory-dark)",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    background: "var(--brand-white)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <item.icon style={{ width: "22px", height: "22px", color: item.color }} />
                </div>
                <span
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    color: "var(--brand-charcoal)",
                    lineHeight: 1.5,
                    textAlign: "left",
                  }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Primary CTAs */}
        <div
          style={{
            display: "flex",
            gap: "0.875rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "0.75rem",
          }}
        >
          {showOwnerCta && (
            <Link
             className="hover:scale-105 why-rasi-cta"
              href={ownerCtaHref as "/auth/register" | "/dashboard/projects/new"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.9375rem 1.25rem",
                borderRadius: "10px",
                fontSize: "0.9375rem",
                  transition: "all 200ms ease",
                fontWeight: 500,
                textDecoration: "none",
                background: "var(--brand-copper)",
                color: "var(--brand-white)",
                boxShadow: "0 4px 20px rgba(184,115,51,0.4), inset 0 1px 0 rgba(255,255,255,0.12)",
                letterSpacing: "0.01em",
              }}
            >
              <Building2 style={{ width: "18px", height: "18px" }} />
              {t("whyRasi.postProject")}
            </Link>
          )}
          <Link
           className="hover:scale-105 why-rasi-cta"
            href="/auth/register?role=contractor"
            style={{
              display: "inline-flex",
                transition: "all 200ms ease",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.9375rem 1.25rem",
              borderRadius: "10px",
              fontSize: "0.9375rem",
              fontWeight: 500,
              textDecoration: "none",
              color: "var(--brand-white)",
              border: "1.5px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(4px)",
            }}
          >
            <Award style={{ width: "18px", height: "18px" }} />
            {t("whyRasi.joinProfessional")}
          </Link>
        </div>

        {/* Microcopy */}
        <p
          style={{
            fontSize: "0.8125rem",
            color: "rgba(255,255,255,0.5)",
            margin: 0,
          }}
        >
          {t("whyRasi.microcopy")}
        </p>
      </div>
      <style>{`
        @media (min-width: 768px) and (max-width: 1024px) {
          .why-rasi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 1rem !important;
            max-width: 100% !important;
          }
          .why-rasi-card {
            padding: 1rem 1.1rem !important;
          }
        }
        @media (max-width: 767px) {
          .why-rasi-grid {
            grid-template-columns: 1fr !important;
            gap: 0.9rem !important;
            max-width: 100% !important;
          }
          .why-rasi-card {
            padding: 1rem !important;
            gap: 0.75rem !important;
          }
          .why-rasi-cta {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </section>
  );
}
