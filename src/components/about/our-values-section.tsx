import { Shield, Eye, Award, Gem, Scale } from "lucide-react";

interface OurValuesSectionProps {
  t: (key: string) => string;
}

export function OurValuesSection({ t }: OurValuesSectionProps) {
  const values = [
    { icon: Shield, color: "var(--brand-teal)", bg: "var(--brand-teal-light)" },
    { icon: Eye, color: "var(--brand-navy)", bg: "#e8ecf4" },
    { icon: Award, color: "var(--brand-copper)", bg: "var(--brand-copper-light)" },
    { icon: Gem, color: "#B85C38", bg: "#fdf2ef" },
    { icon: Scale, color: "var(--brand-teal-dark)", bg: "#e0f0f2" },
  ];

  return (
    <section style={{ background: "var(--brand-ivory)", padding: "5rem 0" }}>
      <div className="container-app">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
              fontWeight: 800,
              color: "var(--brand-navy)",
              letterSpacing: "-0.02em",
            }}
          >
            {t("ourValues.title")}
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          {values.map((value, i) => (
            <div
              key={i}
              style={{
                background: "var(--brand-white)",
                padding: "1.75rem",
                borderRadius: "16px",
                border: "1px solid var(--brand-ivory-dark)",
                textAlign: "center",
                boxShadow: "0 2px 12px rgba(27,42,74,0.04)",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: value.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                }}
              >
                <value.icon style={{ width: "24px", height: "24px", color: value.color }} />
              </div>
              <h4
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  color: "var(--brand-navy)",
                  marginBottom: "0.5rem",
                }}
              >
                {t(`ourValues.items.${i}.title`)}
              </h4>
              <p
                style={{
                  fontSize: "0.875rem",
                  lineHeight: 1.5,
                  color: "var(--brand-warm-grey)",
                  margin: 0,
                }}
              >
                {t(`ourValues.items.${i}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
