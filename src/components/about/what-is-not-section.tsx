export function WhatIsNotSection() {
  return (
    <section style={{ background: "var(--bg)", padding: "4rem 0" }}>
      <div className="container-app" style={{ maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.75rem" }}>
            What Rasi Is Not
          </h2>
          <div style={{ width: "48px", height: "4px", borderRadius: "2px", background: "var(--accent)", margin: "0 auto" }} />
        </div>

        <div className="card" style={{ padding: "2rem 2.5rem" }}>
          {[
            "Not a contracting company.",
            "Does not execute construction work directly.",
            "Does not guarantee project outcomes — the contractual relationship remains between the owner and the awarded party.",
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: "1rem",
              padding: "1rem 0",
              borderBottom: i < 2 ? "1px solid var(--border-light)" : "none",
            }}>
              <div style={{
                width: "24px", height: "24px", borderRadius: "50%", flexShrink: 0,
                background: "rgba(184,115,51,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginTop: "1px",
              }}>
                <div style={{ width: "8px", height: "2px", background: "var(--accent)", borderRadius: "1px" }} />
              </div>
              <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
