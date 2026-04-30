import { BarChart3, Heart, Landmark, Scale, ShieldCheck, Star } from "lucide-react";

interface OurValuesSectionProps {
  t: (key: string) => string;
}

export function OurValuesSection({ t }: OurValuesSectionProps) {
  const icons = [Heart, BarChart3, Star, ShieldCheck, Scale, Landmark];

  return (
    <section className="md:!py-8 !py-2"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, var(--brand-ivory) 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-140px",
          left: "-140px",
          width: "360px",
          height: "360px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(184,115,51,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="container-app" style={{ position: "relative", zIndex: 1 }}>
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
              color: "#0d7377",
              marginBottom: "1rem",
            }}
          >
            <span style={{ width: "20px", height: "1.5px", background: "#0d7377", display: "inline-block" }} />
            {t("ourValues.title")}
            <span style={{ width: "20px", height: "1.5px", background: "#0d7377", display: "inline-block" }} />
          </div>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 700,
              color: "var(--brand-navy)",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            {t("ourValues.title")}
          </h2>
        </div>

        <div
          className="our-values-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1.25rem", margin: "0 auto" }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const Icon = icons[i];
            return (
              <div
                className="our-values-card"
                key={i}
                style={{
                  background: "rgba(255,255,255,0.86)",
                  border: "1px solid rgba(27,42,74,0.08)",
                  borderRadius: "22px",
                  padding: "1.75rem",
                  boxShadow: "0 18px 44px -32px rgba(27,42,74,0.3)",
                  minHeight: "190px",
                }}
              >
                <div style={{
                  width: "54px", height: "54px", borderRadius: "18px",
                  background: "linear-gradient(135deg, #e6f4f1 0%, #d4e8eb 100%)", marginBottom: "1.25rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon style={{ width: "24px", height: "24px", color: "#0d7377" }} />
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--brand-navy)", marginBottom: "0.65rem", letterSpacing: "-0.01em" }}>
                  {t(`ourValues.items.${i}.title`)}
                </h3>
                <p style={{ fontSize: "0.925rem", color: "#475569", lineHeight: 1.7, margin: 0 }}>
                  {t(`ourValues.items.${i}.description`)}
                </p>
              </div>
            );
          })}
        </div>
        <style>{`
          @media (min-width: 1100px) {
            .our-values-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          }
          @media (max-width: 640px) {
            .our-values-grid { gap: 0.75rem !important; }
            .our-values-card { padding: 1rem !important; min-height: 150px !important; border-radius: 16px !important; }
            .our-values-card h3 { font-size: 0.95rem !important; margin-bottom: 0.45rem !important; }
            .our-values-card p { font-size: 0.82rem !important; line-height: 1.45 !important; }
          }
        `}</style>
      </div>
    </section>
  );
}
