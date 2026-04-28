interface AboutHeroSectionProps {
  t: (key: string) => string;
}

export function AboutHeroSection({ t }: AboutHeroSectionProps) {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, var(--brand-navy) 0%, var(--brand-navy-light) 50%, var(--brand-teal) 100%)",
        padding: "8rem 0 6rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(184,115,51,0.08) 0%, transparent 35%),
            radial-gradient(circle at 80% 70%, rgba(42,123,136,0.1) 0%, transparent 40%)
          `,
        }}
      />

      <div className="container-app" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 800,
              color: "var(--brand-white)",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            {t("hero.headline")}
          </h1>
        </div>
      </div>

      {/* Curved bottom edge */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "var(--brand-ivory)",
          clipPath: "ellipse(75% 100% at 50% 100%)",
        }}
      />
    </section>
  );
}
