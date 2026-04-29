interface DecisionJourneySectionProps {
  t: (key: string) => string;
}

interface JourneyItem {
  titleKey: string;
  descKey: string;
}

const STEPS: JourneyItem[] = [
  { titleKey: "decisionJourney.step1Title", descKey: "decisionJourney.step1Desc" },
  { titleKey: "decisionJourney.step2Title", descKey: "decisionJourney.step2Desc" },
  { titleKey: "decisionJourney.step3Title", descKey: "decisionJourney.step3Desc" },
];

const TEAL_LINE = "linear-gradient(180deg, rgba(13,115,119,0.55) 0%, rgba(13,115,119,0.2) 100%)";

export function DecisionJourneySection({ t }: DecisionJourneySectionProps) {
  return (
    <section
      style={{
        background: "linear-gradient(180deg, var(--brand-white) 0%, var(--brand-ivory) 100%)",
        padding: "5rem 0",
        borderTop: "1px solid var(--brand-ivory-dark)",
      }}
    >
      <div className="container-app" style={{ maxWidth: "1120px", margin: "0 auto" }}>
        <SectionHeader t={t} />
        <Timeline t={t} />
        <AfterAwardStrip t={t} />
      </div>
    </section>
  );
}

function SectionHeader({ t }: { t: (key: string) => string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "2.6rem" }}>
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
          marginBottom: "0.85rem",
        }}
      >
        <span aria-hidden style={{ width: "20px", height: "1.5px", background: "var(--brand-teal)", display: "inline-block" }} />
        {t("decisionJourney.badge")}
        <span aria-hidden style={{ width: "20px", height: "1.5px", background: "var(--brand-teal)", display: "inline-block" }} />
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
  );
}

function Timeline({ t }: { t: (key: string) => string }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        margin: "0 0 1.8rem",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "20px",
          top: "16px",
          bottom: "20px",
          width: "2px",
          background: TEAL_LINE,
        }}
      />
      {STEPS.map((step, idx) => {
        const isLast = idx === STEPS.length - 1;
        return (
          <article
            key={step.titleKey}
            style={{
              display: "grid",
              gridTemplateColumns: "44px 1fr",
              gap: "1rem",
              alignItems: "start",
              marginBottom: isLast ? 0 : "1.35rem",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "999px",
                background: "linear-gradient(135deg, #ffffff 0%, #f4fbfb 100%)",
                border: "2px solid rgba(13,115,119,0.52)",
                color: "var(--brand-teal)",
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
                borderBottom: isLast ? "none" : "1px dashed rgba(13,115,119,0.18)",
                paddingBottom: isLast ? 0 : "1.15rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                <h3 style={{ margin: 0, color: "var(--brand-navy)", fontSize: "1.06rem", fontWeight: 700 }}>
                  {t(step.titleKey)}
                </h3>
              </div>
              <p
                style={{
                  margin: 0,
                  color: "var(--brand-charcoal)",
                  lineHeight: 1.7,
                  fontSize: "0.95rem",
                }}
              >
                {t(step.descKey)}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function AfterAwardStrip({ t }: { t: (key: string) => string }) {
  return (
    <div
      style={{
        width: "100%",
        margin: 0,
        borderRadius: "14px",
        padding: "1rem",
        border: "1px solid rgba(13,115,119,0.2)",
        background: "linear-gradient(135deg, rgba(13,115,119,0.05) 0%, var(--brand-white) 68%)",
        display: "flex",
        gap: "0.85rem",
        alignItems: "flex-start",
        boxShadow: "0 14px 30px -24px rgba(27,42,74,0.35)",
      }}
    >
      <p style={{ margin: 0, color: "var(--brand-charcoal)", lineHeight: 1.7, fontSize: "0.93rem" }}>
        <strong>{t("decisionJourney.afterAwardTitle")} </strong>
        {t("decisionJourney.afterAward")}
      </p>
    </div>
  );
}
