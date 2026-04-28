import { FolderOpen, BarChart3, Shield, FileText, Sparkles } from "lucide-react";

interface WhatDeliversSectionProps {
  t: (key: string) => string;
}

export function WhatDeliversSection({ t }: WhatDeliversSectionProps) {
  const items = [
    { icon: FolderOpen, color: "var(--brand-teal)", bg: "linear-gradient(135deg, var(--brand-teal-light) 0%, #d4e8eb 100%)", borderColor: "var(--brand-teal)" },
    { icon: BarChart3, color: "var(--brand-navy)", bg: "linear-gradient(135deg, #e8ecf4 0%, #dce4ed 100%)", borderColor: "var(--brand-navy)" },
    { icon: Shield, color: "var(--brand-copper)", bg: "linear-gradient(135deg, var(--brand-copper-light) 0%, #ebe0d4 100%)", borderColor: "var(--brand-copper)" },
    { icon: FileText, color: "#B85C38", bg: "linear-gradient(135deg, #fdf2ef 0%, #f5e0d8 100%)", borderColor: "#B85C38" },
  ];

  return (
    <section
      style={{
        background: "linear-gradient(180deg, var(--brand-white) 0%, var(--brand-ivory) 100%)",
        padding: "6rem 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "10%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(42,123,136,0.06) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(184,115,51,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="container-app" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--brand-teal)",
              marginBottom: "1rem",
              padding: "0.5rem 1rem",
              background: "var(--brand-white)",
              borderRadius: "20px",
              boxShadow: "0 2px 12px rgba(42,123,136,0.12)",
            }}
          >
            <Sparkles style={{ width: "16px", height: "16px", color: "var(--brand-teal)" }} />
            {t("whatDelivers.title")}
          </div>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 800,
              color: "var(--brand-navy)",
              letterSpacing: "-0.025em",
            }}
          >
            {t("whatDelivers.title")}
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                background: item.bg,
                padding: "2rem",
                borderRadius: "16px",
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
                  marginBottom: "1rem",
                  boxShadow: "0 2px 8px rgba(27,42,74,0.08)",
                }}
              >
                <item.icon style={{ width: "24px", height: "24px", color: item.color }} />
              </div>
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  color: "var(--brand-charcoal)",
                  margin: 0,
                }}
              >
                {t(`whatDelivers.items.${i}`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
