import { FolderOpen, FileCheck, Award, Rocket } from "lucide-react";

interface HowItWorksSectionProps {
  t: (key: string) => string;
}

export function HowItWorksSection({ t }: HowItWorksSectionProps) {
  const steps = [
    { icon: FolderOpen, title: t("howItWorks.step1Title"), desc: t("howItWorks.step1Desc"), num: "1" },
    { icon: FileCheck, title: t("howItWorks.step2Title"), desc: t("howItWorks.step2Desc"), num: "2" },
    { icon: Award, title: t("howItWorks.step3Title"), desc: t("howItWorks.step3Desc"), num: "3" },
    { icon: Rocket, title: t("howItWorks.step4Title"), desc: t("howItWorks.step4Desc"), num: "4" },
  ];

  return (
    <section
      style={{
        background: "var(--brand-white)",
        borderTop: `1px solid ${"var(--brand-ivory-dark)"}`,
        borderBottom: `1px solid ${"var(--brand-ivory-dark)"}`,
        padding: "5rem 0",
      }}
    >
      <div className="container-app">
        {/* Section header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
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
            {t("howItWorks.title")}
            <span style={{ width: "20px", height: "1.5px", background: "var(--brand-copper)", display: "inline-block" }} />
          </div>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 800,
              color: "var(--brand-navy)",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
            }}
          >
            {t("howItWorks.title")}
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2rem",
            maxWidth: "1040px",
            margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Connector line (desktop only, decorative) */}
          <div
            style={{
              position: "absolute",
              top: "40px",
              left: "calc(12.5% + 28px)",
              right: "calc(12.5% + 28px)",
              height: "1px",
              background: `linear-gradient(90deg, ${"var(--brand-teal)"}, ${"var(--brand-copper)"})`,
              opacity: 0.2,
              pointerEvents: "none",
            }}
          />

          {steps.map((step, i) => (
            <div key={i} style={{ textAlign: "center", padding: "0 0.5rem", position: "relative" }}>
              {/* Step bubble */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: i === 0 ? "var(--brand-copper)" : i === 3 ? "var(--brand-teal)" : "var(--brand-navy)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  boxShadow: `0 4px 16px ${i === 0 ? "rgba(184,115,51,0.35)" : i === 3 ? "rgba(42,123,136,0.35)" : "rgba(27,42,74,0.3)"}`,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <step.icon style={{ width: "24px", height: "24px", color: "var(--brand-white)" }} />
                {/* Number badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "var(--brand-ivory-dark)",
                    border: `2px solid ${"var(--brand-ivory-dark)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.6875rem",
                    fontWeight: 800,
                    color: "var(--brand-navy)",
                  }}
                >
                  {step.num}
                </div>
              </div>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--brand-navy)",
                  marginBottom: "0.625rem",
                  letterSpacing: "-0.01em",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--brand-warm-grey)",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
