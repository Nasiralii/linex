import { BookOpen, History } from "lucide-react";

interface OurStorySectionProps {
  t: (key: string) => string;
}

export function OurStorySection({ t }: OurStorySectionProps) {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, var(--brand-white) 0%, var(--brand-ivory) 50%, #f0ede8 100%)",
        padding: "6rem 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "8%",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(184,115,51,0.07) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "10%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(42,123,136,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="container-narrow" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--brand-copper)",
              marginBottom: "0.875rem",
            }}
          >
            <span style={{ width: "20px", height: "1.5px", background: "var(--brand-copper)", display: "inline-block" }} />
            {t("ourStory.title")}
            <span style={{ width: "20px", height: "1.5px", background: "var(--brand-copper)", display: "inline-block" }} />
          </div>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg, var(--brand-ivory) 0%, var(--brand-white) 100%)",
            padding: "3rem",
            borderRadius: "20px",
            border: "1px solid var(--brand-ivory-dark)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-20px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "var(--brand-white)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(27,42,74,0.12)",
              border: "2px solid var(--brand-ivory-dark)",
            }}
          >
            <BookOpen style={{ width: "22px", height: "22px", color: "var(--brand-copper)" }} />
          </div>

          <p
            style={{
              fontSize: "clamp(1.0625rem, 2vw, 1.25rem)",
              lineHeight: 1.9,
              color: "var(--brand-charcoal)",
              textAlign: "center",
              margin: "1rem 0 0",
            }}
          >
            {t("ourStory.description")}
          </p>
        </div>
      </div>
    </section>
  );
}
