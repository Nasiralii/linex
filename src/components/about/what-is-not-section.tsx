import { X, AlertCircle } from "lucide-react";

interface WhatIsNotSectionProps {
  t: (key: string) => string;
}

export function WhatIsNotSection({ t }: WhatIsNotSectionProps) {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, var(--brand-ivory) 0%, #f5f0e8 50%, var(--brand-teal-light) 100%)",
        padding: "6rem 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          right: "8%",
          width: "220px",
          height: "220px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(184,115,51,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "5%",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(42,123,136,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow" style={{ position: "relative", zIndex: 1 }}>
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
              color: "var(--brand-copper)",
              marginBottom: "1rem",
              padding: "0.5rem 1rem",
              background: "var(--brand-white)",
              borderRadius: "20px",
              boxShadow: "0 2px 12px rgba(184,115,51,0.12)",
            }}
          >
            <AlertCircle style={{ width: "16px", height: "16px", color: "var(--brand-copper)" }} />
            {t("whatIsNot.title")}
          </div>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 800,
              color: "var(--brand-navy)",
              letterSpacing: "-0.025em",
            }}
          >
            {t("whatIsNot.title")}
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "1.25rem 1.5rem",
                background: "var(--brand-white)",
                borderRadius: "12px",
                border: "1px solid var(--brand-ivory-dark)",
                boxShadow: "0 2px 8px rgba(27,42,74,0.04)",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "rgba(184,115,51,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <X style={{ width: "18px", height: "18px", color: "var(--brand-copper)" }} />
              </div>
              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--brand-charcoal)",
                  margin: 0,
                }}
              >
                {t(`whatIsNot.items.${i}`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
