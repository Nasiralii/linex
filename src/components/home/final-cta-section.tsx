import { Link } from "@/i18n/routing";
import { Building2, Award, HardHat, Globe, TrendingUp } from "lucide-react";

interface FinalCtaSectionProps {
  t: (key: string) => string;
  showOwnerCta: boolean;
  ownerCtaHref: string;
}

export function FinalCtaSection({ t, showOwnerCta, ownerCtaHref }: FinalCtaSectionProps) {
  const whyRasiItems = [
    { icon: HardHat, text: t("whyRasi.constructionOnly"), bg: "var(--brand-copper-light)", color: "var(--brand-copper)" },
    { icon: Award, text: t("whyRasi.qualification"), bg: "var(--brand-teal-light)", color: "var(--brand-teal)" },
    { icon: TrendingUp, text: t("whyRasi.transparent"), bg: "#e8ecf4", color: "var(--brand-navy)" },
    { icon: Globe, text: t("whyRasi.saudiMarket"), bg: "var(--brand-ivory)", color: "var(--brand-copper-dark)" },
  ];

  return (
    <section
      style={{
        background: "linear-gradient(150deg, var(--brand-navy) 0%, var(--brand-navy-light) 55%, var(--brand-teal-dark) 100%)",
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1.25rem 1.5rem",
                  background: item.bg,
                  borderRadius: "12px",
                  boxShadow: "0 4px 24px rgba(27,42,74,0.12)",
                  border: "1px solid var(--brand-ivory-dark)",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "var(--brand-white)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(27,42,74,0.08)",
                  }}
                >
                  <item.icon style={{ width: "22px", height: "22px", color: item.color }} />
                </div>
                <span
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 600,
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
              href={ownerCtaHref as "/auth/register" | "/dashboard/projects/new"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "1rem 2.25rem",
                borderRadius: "10px",
                fontSize: "0.9375rem",
                fontWeight: 700,
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
            href="/auth/register?role=contractor"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "1rem 2.25rem",
              borderRadius: "10px",
              fontSize: "0.9375rem",
              fontWeight: 600,
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
    </section>
  );
}
