import { BadgeCheck, Layers, GitCompare, FileText } from "lucide-react";

interface TrustPillarsSectionProps {
  t: (key: string) => string;
}

export function TrustPillarsSection({ t }: TrustPillarsSectionProps) {
  const pillars = [
    {
      icon: BadgeCheck,
      title: t("trust.verifiedProfiles"),
      desc: t("trust.verifiedProfilesDesc"),
      accent: "var(--brand-teal)",
      bg: "linear-gradient(135deg, var(--brand-teal-light) 0%, #d4e8eb 100%)",
    },
    {
      icon: Layers,
      title: t("trust.transparentTiers"),
      desc: t("trust.transparentTiersDesc"),
      accent: "var(--brand-copper)",
      bg: "linear-gradient(135deg, var(--brand-copper-light) 0%, #ebe0d4 100%)",
    },
    {
      icon: GitCompare,
      title: t("trust.sideBySide"),
      desc: t("trust.sideBySideDesc"),
      accent: "var(--brand-navy)",
      bg: "linear-gradient(135deg, #e8ecf4 0%, #dce4ed 100%)",
    },
    {
      icon: FileText,
      title: t("trust.documentedJourney"),
      desc: t("trust.documentedJourneyDesc"),
      accent: "#B85C38",
      bg: "linear-gradient(135deg, #fdf2ef 0%, #f5e0d8 100%)",
    },
  ];

  return (
    <section style={{ background: "var(--brand-ivory)", padding: "5rem 0" }}>
      <div className="container-app">
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--brand-teal)",
              marginBottom: "0.875rem",
            }}
          >
            <span style={{ width: "20px", height: "1.5px", background: "var(--brand-teal)", display: "inline-block" }} />
            {t("trust.title")}
            <span style={{ width: "20px", height: "1.5px", background: "var(--brand-teal)", display: "inline-block" }} />
          </div>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 800,
              color: "var(--brand-navy)",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
            }}
          >
            {t("trust.title")}
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
            maxWidth: "1140px",
            margin: "0 auto",
            alignItems: "stretch",
          }}
        >
          {pillars.map((item, i) => (
            <div
              key={i}
              style={{
                background: "var(--brand-white)",
                border: "1px solid var(--brand-ivory-dark)",
                borderRadius: "16px",
                padding: "2.25rem 1.75rem",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 1px 12px rgba(27,42,74,0.06)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Top accent line */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: item.accent,
                  borderRadius: "16px 16px 0 0",
                }}
              />

              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "16px",
                  background: item.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                  boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8), 0 2px 8px rgba(27,42,74,0.08)",
                }}
              >
                <item.icon style={{ width: "28px", height: "28px", color: item.accent }} />
              </div>

              <h3
                style={{
                  fontSize: "1.0625rem",
                  fontWeight: 700,
                  color: "var(--brand-charcoal)",
                  marginBottom: "0.625rem",
                  letterSpacing: "-0.01em",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--brand-warm-grey)",
                  lineHeight: 1.72,
                  margin: 0,
                  flex: 1,
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
