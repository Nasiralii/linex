import { ArrowRight, Building2, HardHat } from "lucide-react";

interface TwoSidedSnapshotSectionProps {
  t: (key: string) => string;
}

export function TwoSidedSnapshotSection({ t }: TwoSidedSnapshotSectionProps) {
  const sides = [
    {
      icon: Building2,
      title: t("twoSided.ownersTitle"),
      desc: t("twoSided.ownersDesc"),
      accent: "#b87333",
      bg: "linear-gradient(135deg, rgba(184,115,51,0.12) 0%, rgba(184,115,51,0.04) 100%)",
    },
    {
      icon: HardHat,
      title: t("twoSided.contractorsTitle"),
      desc: t("twoSided.contractorsDesc"),
      accent: "#0d7377",
      bg: "linear-gradient(135deg, rgba(13,115,119,0.12) 0%, rgba(13,115,119,0.04) 100%)",
    },
  ];

  return (
    <section
      style={{
        background: "var(--brand-ivory)",
        padding: "4.5rem 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "auto -120px -180px auto",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background: "rgba(13,115,119,0.06)",
          pointerEvents: "none",
        }}
      />

      <div className="container-app" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
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
            {t("twoSided.title")}
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
            {t("twoSided.title")}
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
            maxWidth: "960px",
            margin: "0 auto",
          }}
        >
          {sides.map((side) => (
            <article
              key={side.title}
              style={{
                background: "var(--brand-white)",
                borderRadius: "24px",
                border: "1px solid var(--brand-ivory-dark)",
                boxShadow: "0 20px 40px -18px rgba(27,42,74,0.16)",
                padding: "2rem",
                minHeight: "260px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: side.bg,
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "18px",
                    background: "var(--brand-white)",
                    border: `1px solid ${side.accent}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <side.icon style={{ width: "28px", height: "28px", color: side.accent }} />
                </div>

                <h3
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 700,
                    color: "var(--brand-navy)",
                    marginBottom: "0.875rem",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {side.title}
                </h3>
                <p style={{ color: "#334155", fontSize: "1rem", lineHeight: 1.7, margin: 0 }}>
                  {side.desc}
                </p>
              </div>

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  marginTop: "2rem",
                  color: side.accent,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ width: "32px", height: "2px", background: side.accent, display: "inline-block" }} />
                <ArrowRight style={{ width: "18px", height: "18px" }} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
