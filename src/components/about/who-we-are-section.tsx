import { Building2 } from "lucide-react";

interface WhoWeAreSectionProps {
  t: (key: string) => string;
}

export function WhoWeAreSection({ t }: WhoWeAreSectionProps) {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, var(--brand-ivory) 0%, #f0ede8 50%, var(--brand-copper-light) 100%)",
        padding: "6rem 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background elements */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "5%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(184,115,51,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(42,123,136,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
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
              boxShadow: "0 2px 12px rgba(184,115,51,0.15)",
            }}
          >
            <Building2 style={{ width: "16px", height: "16px", color: "var(--brand-copper)" }} />
            {t("whoWeAre.title")}
          </div>
        </div>

        <div
          style={{
            background: "var(--brand-white)",
            padding: "3rem",
            borderRadius: "24px",
            boxShadow: "0 8px 40px rgba(27,42,74,0.08)",
            border: "1px solid var(--brand-ivory-dark)",
            position: "relative",
          }}
        >
          {/* Top accent line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100px",
              height: "4px",
              background: "linear-gradient(90deg, var(--brand-copper) 0%, var(--brand-teal) 100%)",
              borderRadius: "0 0 2px 2px",
            }}
          />

          <p
            style={{
              fontSize: "clamp(1.125rem, 2vw, 1.375rem)",
              lineHeight: 1.8,
              color: "var(--brand-charcoal)",
              textAlign: "center",
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            {t("whoWeAre.description")}
          </p>
        </div>
      </div>
    </section>
  );
}
