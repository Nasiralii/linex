import { CheckCircle2, ClipboardList, FileSearch, Gavel } from "lucide-react";

interface DecisionJourneySectionProps {
  t: (key: string) => string;
}

export function DecisionJourneySection({ t }: DecisionJourneySectionProps) {
  const steps = [
    {
      icon: ClipboardList,
      title: t("decisionJourney.step1Title"),
      description: t("decisionJourney.step1Desc"),
    },
    {
      icon: FileSearch,
      title: t("decisionJourney.step2Title"),
      description: t("decisionJourney.step2Desc"),
    },
    {
      icon: Gavel,
      title: t("decisionJourney.step3Title"),
      description: t("decisionJourney.step3Desc"),
    },
  ];

  return (
    <section
      style={{
        background: "linear-gradient(180deg, var(--brand-white) 0%, var(--brand-ivory) 100%)",
        padding: "5rem 0",
        borderTop: "1px solid var(--brand-ivory-dark)",
      }}
    >
      <div className="container-app" style={{ maxWidth: "1120px", margin: "0 auto" }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: "2.6rem",
          }}
        >
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
              marginBottom: "0.85rem",
            }}
          >
            <span style={{ width: "20px", height: "1.5px", background: "#0d7377", display: "inline-block" }} />
            {t("decisionJourney.badge")}
            <span style={{ width: "20px", height: "1.5px", background: "#0d7377", display: "inline-block" }} />
          </div>
          <h2
            style={{
              fontSize: "clamp(1.6rem, 3.5vw, 2.3rem)",
              fontWeight: 800,
              color: "var(--brand-navy)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              margin: "0 0 0.85rem",
            }}
          >
            {t("decisionJourney.headline")}
          </h2>
        </div>

        <div
          style={{
            position: "relative",
            maxWidth: "920px",
            margin: "0 auto 1.8rem",
            paddingLeft: "0.3rem",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "19px",
              top: "16px",
              bottom: "20px",
              width: "2px",
              background: "linear-gradient(180deg, rgba(13,115,119,0.55) 0%, rgba(13,115,119,0.2) 100%)",
            }}
          />
          {steps.map((step, idx) => (
            <article
              key={step.title}
              style={{
                display: "grid",
                gridTemplateColumns: "52px 1fr",
                gap: "1rem",
                alignItems: "start",
                marginBottom: idx < steps.length - 1 ? "1.35rem" : 0,
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "999px",
                  background: "linear-gradient(135deg, #ffffff 0%, #f4fbfb 100%)",
                  border: "2px solid rgba(13,115,119,0.52)",
                  color: "#0d7377",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  zIndex: 1,
                  marginTop: "0.22rem",
                  boxShadow: "0 0 0 4px var(--brand-white)",
                }}
              >
                {idx + 1}
              </div>
              <div
                style={{
                  borderBottom: idx < steps.length - 1 ? "1px dashed rgba(13,115,119,0.18)" : "none",
                  paddingBottom: idx < steps.length - 1 ? "1.15rem" : 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.5rem" }}>
                  <span
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "999px",
                      background: "rgba(13,115,119,0.14)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "999px",
                        background: "linear-gradient(135deg, #ffffff 0%, #f4fbfb 100%)",
                        border: "1.8px solid rgba(13,115,119,0.7)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <step.icon style={{ width: "12px", height: "12px", color: "#0d7377" }} />
                    </span>
                  </span>
                  <h3 style={{ margin: 0, color: "var(--brand-navy)", fontSize: "1.06rem", fontWeight: 700 }}>{step.title}</h3>
                </div>
                <p
                  style={{
                    margin: 0,
                    color: "var(--brand-charcoal)",
                    lineHeight: 1.7,
                    fontSize: "0.95rem",
                    maxWidth: "740px",
                  }}
                >
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div
          style={{
            maxWidth: "920px",
            margin: "0 auto",
            borderRadius: "14px",
            padding: "1rem 1rem",
            border: "1px solid rgba(13,115,119,0.2)",
            background: "linear-gradient(135deg, rgba(13,115,119,0.05) 0%, #ffffff 68%)",
            display: "flex",
            gap: "0.75rem",
            alignItems: "flex-start",
            boxShadow: "0 14px 30px -24px rgba(27,42,74,0.35)",
          }}
        >
          <span
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "999px",
              background: "rgba(13,115,119,0.14)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              marginTop: "0.05rem",
            }}
          >
            <span
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "999px",
                background: "linear-gradient(135deg, #ffffff 0%, #f4fbfb 100%)",
                border: "2px solid rgba(13,115,119,0.7)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 style={{ width: "13px", height: "13px", color: "#0d7377" }} />
            </span>
          </span>
          <p style={{ margin: 0, color: "var(--brand-charcoal)", lineHeight: 1.7, fontSize: "0.93rem" }}>
            <strong>{t("decisionJourney.afterAwardTitle")} </strong>
            {t("decisionJourney.afterAward")}
          </p>
        </div>
      </div>
    </section>
  );
}
