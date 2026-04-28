
interface WhoWeAreSectionProps {
  t: (key: string) => string;
}

export function WhoWeAreSection({ t }: WhoWeAreSectionProps) {
  return (
    <section
   
      style={{
        background: "linear-gradient(135deg, var(--brand-ivory) 0%, #f0ede8 50%, var(--brand-copper-light) 100%)",
        padding: "3rem 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background elements */}
     
      <div
        style={{
        
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(42,123,136,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="container-app w-full" style={{ position: "relative", zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
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
              fontWeight: 500,
              color: "var(--brand-navy)",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
            }}
          >
            {t("whoWeAre.title")}
          </h2>
        </div>

        {/* Two Column Layout - Image + Content */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "3rem", maxWidth: "1200px", margin: "0 auto", alignItems: "center" }}>
          {/* Image Side */}
          <div
            style={{
              position: "relative",
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 12px 40px rgba(13,115,119,0.15)",
            }}
          >
            {/* Who We Are Image */}
            <img
              src="/who.jpg"
              alt="Rasi Saudi Construction Platform"
              style={{
                width: "100%",
                height: "auto",
                aspectRatio: "4/3",
                objectFit: "cover",
                display: "block",
              }}
            />
            
            {/* Image caption */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "1rem 1.5rem",
                background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                color: "white",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.25rem" }}>🏗️</span>
                <span>{t("whoWeAre.imageCaption")}</span>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "var(--brand-navy)",
                marginBottom: "1rem",
                lineHeight: 1.3,
              }}
            >
              {t("whoWeAre.headline")}
            </h3>
            <p
              style={{
                fontSize: "1rem",
                lineHeight: 1.8,
                color: "black",
                marginBottom: "1.5rem",
              }}
            >
              {t("whoWeAre.description")}
            </p>

            {/* Key highlights */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0d7377", flexShrink: 0 }} />
                <span style={{ fontSize: "0.9375rem", color: "var(--brand-charcoal)" }}>{t("whoWeAre.point1")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0d7377", flexShrink: 0 }} />
                <span style={{ fontSize: "0.9375rem", color: "var(--brand-charcoal)" }}>{t("whoWeAre.point2")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0d7377", flexShrink: 0 }} />
                <span style={{ fontSize: "0.9375rem", color: "var(--brand-charcoal)" }}>{t("whoWeAre.point3")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
