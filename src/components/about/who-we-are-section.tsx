import { CheckCircle2, XCircle } from "lucide-react";

interface WhoWeAreSectionProps {
  t: (key: string) => string;
}

export function WhoWeAreSection({ t }: WhoWeAreSectionProps) {
  const deliverItems = [0, 1, 2, 3];
  const notItems = [0, 1, 2, 3];

  return (
    <section
      id="about"
      style={{
        background: "linear-gradient(180deg, var(--brand-ivory) 0%, #f5f1ea 100%)",
        padding: "5rem 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-160px",
          right: "-160px",
          width: "420px",
          height: "420px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(13,115,119,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="container-app w-full" style={{ position: "relative", zIndex: 1 }}>
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
            {t("whoWeAre.title")}
            <span style={{ width: "20px", height: "1.5px", background: "#0d7377", display: "inline-block" }} />
          </div>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 700,
              color: "var(--brand-navy)",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              margin: "0 auto",
              maxWidth: "760px",
            }}
          >
            {t("whoWeAre.headline")}
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", maxWidth: "1180px", margin: "0 auto", alignItems: "stretch" }}>
          <div
            style={{
              position: "relative",
              borderRadius: "28px",
              overflow: "hidden",
              boxShadow: "0 24px 60px -28px rgba(27,42,74,0.35)",
              border: "1px solid rgba(27,42,74,0.08)",
              minHeight: "360px",
            }}
          >
            <img
              src="/who.jpg"
              alt="Rasi Saudi Construction Platform"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "1.25rem 1.5rem",
                background: "linear-gradient(transparent, rgba(17,29,51,0.78))",
                color: "white",
                fontSize: "0.875rem",
                fontWeight: 600,
                letterSpacing: "0.01em",
              }}
            >
              {t("whoWeAre.imageCaption")}
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.74)",
              border: "1px solid rgba(27,42,74,0.08)",
              borderRadius: "28px",
              padding: "clamp(2rem, 4vw, 3rem)",
              boxShadow: "0 24px 60px -32px rgba(27,42,74,0.28)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "3px",
                borderRadius: "999px",
                background: "#0d7377",
                marginBottom: "1.25rem",
              }}
            />
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "var(--brand-navy)",
                marginBottom: "1rem",
                letterSpacing: "-0.02em",
              }}
            >
              {t("whoWeAre.title")}
            </h3>
            <p
              style={{
                fontSize: "1.05rem",
                lineHeight: 1.8,
                color: "#1f2937",
                margin: 0,
              }}
            >
              {t("whoWeAre.description")}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
            maxWidth: "1180px",
            margin: "2rem auto 0",
          }}
        >
          <div
            style={{
              background: "var(--brand-white)",
              border: "1px solid rgba(13,115,119,0.12)",
              borderRadius: "24px",
              padding: "2rem",
              boxShadow: "0 18px 44px -30px rgba(27,42,74,0.32)",
            }}
          >
            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--brand-navy)", marginBottom: "1.35rem" }}>
              {t("whatDelivers.title")}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {deliverItems.map((i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
                  <CheckCircle2 style={{ width: "22px", height: "22px", color: "#0d7377", flexShrink: 0, marginTop: "0.15rem" }} />
                  <p style={{ margin: 0, color: "var(--brand-charcoal)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                    {t(`whatDelivers.summaryItems.${i}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "var(--brand-white)",
              border: "1px solid rgba(220,38,38,0.12)",
              borderRadius: "24px",
              padding: "2rem",
              boxShadow: "0 18px 44px -30px rgba(27,42,74,0.32)",
            }}
          >
            <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--brand-navy)", marginBottom: "1.35rem" }}>
              {t("whatIsNot.title")}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {notItems.map((i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem" }}>
                  <XCircle style={{ width: "22px", height: "22px", color: "#dc2626", flexShrink: 0, marginTop: "0.15rem" }} />
                  <p style={{ margin: 0, color: "var(--brand-charcoal)", fontSize: "0.95rem", lineHeight: 1.7 }}>
                    {t(`whatIsNot.items.${i}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
