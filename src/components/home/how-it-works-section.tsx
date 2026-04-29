import { Award, FileCheck, FolderOpen } from "lucide-react";

interface HowItWorksSectionProps {
  t: (key: string) => string;
}

export function HowItWorksSection({ t }: HowItWorksSectionProps) {
  const steps = [
    { icon: FolderOpen, title: t("howItWorks.step1Title"), desc: t("howItWorks.step1Desc"), num: "1" },
    { icon: FileCheck, title: t("howItWorks.step2Title"), desc: t("howItWorks.step2Desc"), num: "2" },
    { icon: Award, title: t("howItWorks.step3Title"), desc: t("howItWorks.step3Desc"), num: "3" },
  ];

  return (
    <section id="how-it-works" className="!py-8"
     
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
              color: "var(--brand-teal)",
              marginBottom: "0.875rem",
            }}
          >
            <span style={{ width: "20px", height: "1.5px", background: "var(--brand-teal)", display: "inline-block" }} />
            {t("howItWorks.title")}
            <span style={{ width: "20px", height: "1.5px", background: "var(--brand-teal)", display: "inline-block" }} />
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
            {t("howItWorks.shortVersion")}
          </h2>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{
            gap: "2rem",
            maxWidth: "980px",
            margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Desktop horizontal connector — runs icon-center to icon-center across 3 equal cols */}
          <div
            className="hidden md:block absolute"
            style={{
              top: "27px",
              left: "calc(100% / 6)",
              right: "calc(100% / 6)",
              height: "2px",
              borderRadius: "999px",
              background: "linear-gradient(90deg, var(--brand-teal), rgba(74,140,151,0.4))",
              zIndex: 0,
            }}
          />

          {/* Mobile vertical connector — inset-inline-start follows icon side in both LTR and RTL */}
          <div
            className="md:hidden absolute"
            style={{
              insetInlineStart: "27px",
              top: "56px",
              bottom: "56px",
              width: "2px",
              borderRadius: "999px",
              background: "linear-gradient(180deg, var(--brand-teal), rgba(74,140,151,0.3))",
              zIndex: 0,
            }}
          />

          {steps.map((step, i) => (
            <div
              key={i}
              style={{ position: "relative", zIndex: 1 }}
            >
              {/* Mobile: icon-left + text-right row | Desktop: centered column */}
              <div className="flex md:flex-col md:items-center md:text-center items-start gap-4 md:gap-0">

                {/* Step bubble */}
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "var(--brand-teal)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 4px 16px rgba(74,140,151,0.35)",
                    position: "relative",
                    zIndex: 2,
                    marginBottom: "0",
                  }}
                  className="md:mb-6 md:mx-auto"
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
                      background: "var(--brand-white)",
                      border: "2px solid var(--brand-teal)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6875rem",
                      fontWeight: 800,
                      color: "var(--brand-teal)",
                    }}
                  >
                    {step.num}
                  </div>
                </div>

                {/* Text */}
                <div className="!pt-4 !md:pt-0">
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "var(--brand-navy)",
                      marginBottom: "0.4rem",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#475569",
                      lineHeight: 1.65,
                      margin: 0,
                    }}
                  >
                    {step.desc}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
