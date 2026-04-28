import { Target, Compass } from "lucide-react";

interface VisionMissionSectionProps {
  t: (key: string) => string;
}

export function VisionMissionSection({ t }: VisionMissionSectionProps) {
  return (
    <section
      style={{
        background: "linear-gradient(180deg, var(--brand-ivory) 0%, var(--brand-white) 50%, var(--brand-ivory) 100%)",
        padding: "6rem 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "3%",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(42,123,136,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "5%",
          width: "280px",
          height: "280px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(184,115,51,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="container-app" style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "2rem",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          {/* Vision */}
          <div
            style={{
              background: "var(--brand-white)",
              padding: "2.5rem",
              borderRadius: "20px",
              border: "1px solid var(--brand-ivory-dark)",
              boxShadow: "0 4px 24px rgba(27,42,74,0.06)",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, var(--brand-teal-light) 0%, #d4e8eb 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem",
              }}
            >
              <Target style={{ width: "28px", height: "28px", color: "var(--brand-teal)" }} />
            </div>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--brand-navy)",
                marginBottom: "1rem",
              }}
            >
              {t("vision.title")}
            </h3>
            <p
              style={{
                fontSize: "1rem",
                lineHeight: 1.7,
                color: "var(--brand-charcoal)",
                margin: 0,
              }}
            >
              {t("vision.description")}
            </p>
          </div>

          {/* Mission */}
          <div
            style={{
              background: "var(--brand-white)",
              padding: "2.5rem",
              borderRadius: "20px",
              border: "1px solid var(--brand-ivory-dark)",
              boxShadow: "0 4px 24px rgba(27,42,74,0.06)",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, var(--brand-copper-light) 0%, #ebe0d4 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem",
              }}
            >
              <Compass style={{ width: "28px", height: "28px", color: "var(--brand-copper)" }} />
            </div>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--brand-navy)",
                marginBottom: "1rem",
              }}
            >
              {t("mission.title")}
            </h3>
            <p
              style={{
                fontSize: "1rem",
                lineHeight: 1.7,
                color: "var(--brand-charcoal)",
                margin: 0,
              }}
            >
              {t("mission.description")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
