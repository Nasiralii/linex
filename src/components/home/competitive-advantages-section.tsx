import { Globe, List, Monitor, ShieldCheck, type LucideIcon } from "lucide-react";

interface CompetitiveAdvantagesSectionProps {
  t: (key: string) => string;
}

interface AdvantageItem {
  icon: LucideIcon;
  titleKey: string;
  descKey: string;
}

const ADVANTAGES: AdvantageItem[] = [
  { icon: Monitor, titleKey: "decisionJourney.adv1Title", descKey: "decisionJourney.adv1Desc" },
  { icon: ShieldCheck, titleKey: "decisionJourney.adv2Title", descKey: "decisionJourney.adv2Desc" },
  { icon: List, titleKey: "decisionJourney.adv3Title", descKey: "decisionJourney.adv3Desc" },
  { icon: Globe, titleKey: "decisionJourney.adv4Title", descKey: "decisionJourney.adv4Desc" },
];

export function CompetitiveAdvantagesSection({ t }: CompetitiveAdvantagesSectionProps) {
  return (
    <section
      style={{
        background: "var(--brand-ivory)",
        padding: "5rem 0",
      }}
    >
      <div className="container-app" style={{ maxWidth: "1120px", margin: "0 auto" }}>
        <header style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              fontSize: "0.74rem",
              fontWeight: 800,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--brand-teal)",
              marginBottom: "0.6rem",
            }}
          >
            <span aria-hidden style={{ width: "26px", height: "2px", background: "var(--brand-teal)", display: "inline-block" }} />
            {t("decisionJourney.advantagesEyebrow")}
          </div>
          <h2
            style={{
              fontSize: "clamp(2rem, 5.5vw, 3.4rem)",
              fontWeight: 900,
              color: "var(--brand-navy)",
              margin: 0,
              lineHeight: 1.05,
              letterSpacing: "-0.035em",
            }}
          >
            {t("decisionJourney.advantagesTitle")}
            <span style={{ color: "var(--brand-teal)" }}>.</span>
          </h2>
          <div
            aria-hidden
            style={{
              width: "70px",
              height: "4px",
              background: "linear-gradient(90deg, var(--brand-teal) 0%, var(--brand-copper) 100%)",
              marginTop: "1rem",
              borderRadius: "999px",
            }}
          />
        </header>

        <div
          style={{
            borderRadius: "18px",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "linear-gradient(145deg, var(--brand-navy) 0%, var(--brand-navy-light) 62%, var(--brand-teal-dark) 100%)",
            boxShadow: "0 22px 48px -28px rgba(27,42,74,0.5)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {ADVANTAGES.map((item, idx) => {
              const Icon = item.icon;
              const isLeftCol = idx % 2 === 0;
              const isLastMobile = idx === ADVANTAGES.length - 1;
              const isBottomRowDesktop = idx >= 2;
              const numberLabel = String(idx + 1).padStart(2, "0");
              return (
                <article
                  key={item.titleKey}
                  className={[
                    "relative overflow-hidden",
                    isLastMobile ? "" : "border-b border-white/15",
                    isBottomRowDesktop ? "md:border-b-0" : "",
                    isLeftCol ? "md:border-r md:border-white/15" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    padding: "1.6rem 1.6rem 1.8rem",
                    minHeight: "240px",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      right: "-1.4rem",
                      bottom: "-3.2rem",
                      fontSize: "11rem",
                      fontWeight: 900,
                      lineHeight: 1,
                      letterSpacing: "-0.06em",
                      color: "rgba(255,255,255,0.07)",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    {numberLabel}
                  </span>
                  <p
                    style={{
                      margin: "0 0 1rem",
                      color: "rgba(255,255,255,0.55)",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      letterSpacing: "0.22em",
                      textTransform: "uppercase",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {`${t("decisionJourney.advantageLabel")} ${numberLabel}`}
                  </p>
                  <span
                    aria-hidden
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1rem",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    <Icon aria-hidden style={{ width: "19px", height: "19px", color: "var(--brand-white)" }} />
                  </span>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <h3
                      style={{
                        margin: "0 0 0.6rem",
                        fontSize: "clamp(1.06rem, 1.8vw, 1.18rem)",
                        fontWeight: 800,
                        color: "var(--brand-white)",
                        lineHeight: 1.3,
                      }}
                    >
                      {t(item.titleKey)}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        lineHeight: 1.62,
                        color: "rgba(255,255,255,0.86)",
                        fontSize: "0.95rem",
                        maxWidth: "95%",
                      }}
                    >
                      {t(item.descKey)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
