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
      accent: "#0d7377",
    },
    {
      icon: Layers,
      title: t("trust.transparentTiers"),
      desc: t("trust.transparentTiersDesc"),
      accent: "#1b2a4a",
    },
    {
      icon: GitCompare,
      title: t("trust.sideBySide"),
      desc: t("trust.sideBySideDesc"),
      accent: "#0d7377",
    },
    {
      icon: FileText,
      title: t("trust.documentedJourney"),
      desc: t("trust.documentedJourneyDesc"),
      accent: "#1b2a4a",
    },
  ];

  return (
    <section style={{ 
      background: "var(--brand-ivory)", 
      padding: "4rem 0",
      overflow: "hidden",
      position: "relative" 
    }}>
      {/* Decorative background element */}
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "-5%",
        width: "40%",
        height: "120%",
        background: "radial-gradient(circle, rgba(13,115,119,0.03) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      <div className="container-app" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#0d7377",
              marginBottom: "0.875rem",
            }}
          >
            <span style={{ width: "20px", height: "1.5px", background: "#0d7377", display: "inline-block" }} />
            {t("trust.title")}
            <span style={{ width: "20px", height: "1.5px", background: "#0d7377", display: "inline-block" }} />
          </div>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 700,
              color: "var(--brand-navy)",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
            }}
          >
            {t("trust.title")}
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
          alignItems: "start"
        }}>
          {pillars.map((item, i) => (
            <div
              key={i}
              className="trust-card"
              style={{
                background: "var(--brand-white)",
                padding: "2.5rem",
                borderRadius: "24px",
                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                marginTop: i % 2 === 0 ? "0" : "2rem", // Staggered effect
                boxShadow: "0 20px 40px -15px rgba(27,42,74,0.08)",
                border: "1px solid rgba(27,42,74,0.03)",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem"
              }}
            >
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, #e6f4f1 0%, #d4e8eb 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: "rotate(-5deg)"
              }}>
                <item.icon size={32} color="#0d7377" strokeWidth={1.5} />
              </div>

              <div>
                <h3 style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "var(--brand-navy)",
                  marginBottom: "0.75rem"
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: "0.95rem",
                  color: "#4a5568",
                  lineHeight: 1.6,
                  margin: 0
                }}>
                  {item.desc}
                </p>
              </div>

              {/* Minimalist interactive indicator */}
              <div style={{
                marginTop: "auto",
                width: "30px",
                height: "2px",
                background: item.accent,
                opacity: 0.3
              }} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .trust-card:hover {
          transform: translateY(-10px) scale(1.02);
          box-shadow: 0 30px 60px -12px rgba(27,42,74,0.12);
          border-color: #0d737740;
        }
        @media (max-width: 768px) {
          .trust-card { margin-top: 0 !important; }
        }
      `}</style>
    </section>
  );
}