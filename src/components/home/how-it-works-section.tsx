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
        borderTop: `1px solid var(--brand-ivory-dark)`,
        borderBottom: `1px solid var(--brand-ivory-dark)`,
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
              color: "#0d7377",
              marginBottom: "0.875rem",
            }}
          >
            <span style={{ width: "20px", height: "1.5px", background: "#0d7377", display: "inline-block" }} />
            {t("howItWorks.title")}
            <span style={{ width: "20px", height: "1.5px", background: "#0d7377", display: "inline-block" }} />
          </div>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 700,
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
          {/* Desktop horizontal connector line - matched to icon color */}
          <div 
            className="hidden md:block absolute" 
            style={{ 
              top: "28px", 
              left: "12%", 
              right: "12%", 
              height: "1px", 
              background: "#0d7377", 
              opacity: 0.3,
              zIndex: 0 
            }} 
          />
          
          {/* Mobile vertical connector line - matched to icon color */}
          <div 
            className="md:hidden absolute" 
            style={{ 
              left: "50%", 
              top: "28px", 
              bottom: "150px", 
              width: "1px", 
              background: "#0d7377", 
              opacity: 0.3, 
              transform: "translateX(-50%)",
              zIndex: 0 
            }} 
          />

          {steps.map((step, i) => (
            <div 
              key={i} 
              style={{ 
                textAlign: "center", 
                padding: "0 0.5rem", 
                position: "relative", 
                zIndex: 1 
              }}
            >
              {/* Step bubble */}
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "#0d7377", // Restored to your original color
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem",
                  boxShadow: "0 4px 16px rgba(13,115,119,0.35)",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <step.icon style={{ width: "24px", height: "24px", color: "white" }} />
                
                {/* Number badge */}
                <div
                  style={{
                    position: "absolute",
                    top: "-6px",
                    right: "6px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "var(--brand-copper)",
                    border: "2px solid #0d7377",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.6875rem",
                    fontWeight: 800,
                    color: "white",
                  }}
                >
                  {step.num}
                </div>
              </div>

              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 500,
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
                  color: "black",
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