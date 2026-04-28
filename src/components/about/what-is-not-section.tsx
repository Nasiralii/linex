interface WhatIsNotSectionProps {
  t: (key: string) => string;
}

export function WhatIsNotSection({ t }: WhatIsNotSectionProps) {
  return (
    <section style={{ padding: "4rem 0" }}>
      <div className="container-app" style={{ maxWidth: "860px", margin: "0 auto" }}>
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
              marginBottom: "1rem",
            }}
          >
            <span style={{ width: "20px", height: "1.5px", background: "#0d7377", display: "inline-block" }} />
            {t("whatIsNot.title")}
            <span style={{ width: "20px", height: "1.5px", background: "#0d7377", display: "inline-block" }} />
          </div>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 500,
              color: "var(--brand-navy)",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
            }}
          >
            {t("whatIsNot.title")}
          </h2>
        </div>

        <div className="card" style={{ padding: "2rem 2.5rem" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: "1rem",
              padding: "1rem 0",
              borderBottom: i < 2 ? "1px solid var(--border-light)" : "none",
            }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginTop: "1px",
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: "#dc2626" }}>
                  <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
                {t(`whatIsNot.items.${i}`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
