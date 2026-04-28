import { Link } from "@/i18n/routing";
import { CheckCircle2 } from "lucide-react";

interface ProfessionalSupportSectionProps {
  t: (key: string) => string;
}

export function ProfessionalSupportSection({ t }: ProfessionalSupportSectionProps) {
  const whyJoinItems = [0, 1, 2, 3, 4, 5];
  const growthItems = [0, 1, 2];

  return (
    <section
      style={{
        background: "var(--brand-ivory)",
        padding: "4.5rem 0",
      }}
    >
      <div className="container-app" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
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
            {t("twoSided.contractorsTitle")}
            <span style={{ width: "20px", height: "1.5px", background: "#0d7377", display: "inline-block" }} />
          </div>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 700,
              color: "var(--brand-navy)",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              maxWidth: "880px",
              margin: "0 auto 1rem",
            }}
          >
            {t("professionalSection.headline")}
          </h2>
          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--brand-charcoal)",
              lineHeight: 1.8,
              maxWidth: "920px",
              margin: "0 auto",
            }}
          >
            {t("professionalSection.mainCopy")}
          </p>
        </div>

        <div style={{ borderTop: "1px solid var(--brand-ivory-dark)", borderBottom: "1px solid var(--brand-ivory-dark)", padding: "2rem 0" }}>
          <div style={{ paddingBottom: "1.5rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--brand-ivory-dark)" }}>
            <h3 style={{ fontSize: "1.12rem", fontWeight: 700, color: "#0d7377", marginBottom: "0.9rem" }}>
              {t("professionalSection.whyJoinTitle")}
            </h3>
            <div style={{ width: "40px", height: "3px", borderRadius: "999px", background: "#0d7377", marginBottom: "0.75rem" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.75rem 1.25rem" }}>
              {whyJoinItems.map((i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.7rem" }}>
                  <CheckCircle2 style={{ width: "18px", height: "18px", color: "var(--brand-teal)", flexShrink: 0, marginTop: "0.22rem" }} />
                  <p style={{ margin: 0, color: "var(--brand-charcoal)", lineHeight: 1.6, fontSize: "0.94rem" }}>
                    {t(`professionalSection.whyJoin.${i}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem 2rem" }}>
            <div>
              <h3 style={{ fontSize: "1.12rem", fontWeight: 700, color: "#0d7377", marginBottom: "0.9rem" }}>
                {t("professionalSection.contractorsTitle")}
              </h3>
              <div style={{ width: "40px", height: "3px", borderRadius: "999px", background: "#0d7377", marginBottom: "0.75rem" }} />
              <p style={{ margin: 0, color: "var(--brand-charcoal)", lineHeight: 1.7, fontSize: "0.95rem" }}>
                {t("professionalSection.contractorsCopy")}
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "1.12rem", fontWeight: 700, color: "#0d7377", marginBottom: "0.9rem" }}>
                {t("professionalSection.engineersTitle")}
              </h3>
              <div style={{ width: "40px", height: "3px", borderRadius: "999px", background: "#0d7377", marginBottom: "0.75rem" }} />
              <p style={{ margin: 0, color: "var(--brand-charcoal)", lineHeight: 1.7, fontSize: "0.95rem" }}>
                {t("professionalSection.engineersCopy")}
              </p>
            </div>
          </div>

          <div style={{ paddingTop: "1.5rem", marginTop: "1.5rem", borderTop: "1px solid var(--brand-ivory-dark)" }}>
            <h3 style={{ fontSize: "1.12rem", fontWeight: 700, color: "#0d7377", marginBottom: "0.9rem" }}>
              {t("professionalSection.growthTitle")}
            </h3>
            <div style={{ width: "40px", height: "3px", borderRadius: "999px", background: "#0d7377", marginBottom: "0.75rem" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {growthItems.map((i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.7rem" }}>
                  <CheckCircle2 style={{ width: "18px", height: "18px", color: "var(--brand-teal)", flexShrink: 0, marginTop: "0.22rem" }} />
                  <p style={{ margin: 0, color: "var(--brand-charcoal)", lineHeight: 1.6, fontSize: "0.94rem" }}>
                    {t(`professionalSection.growth.${i}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link
            href="/auth/register"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.9rem 1.35rem",
              borderRadius: "12px",
              fontSize: "0.92rem",
              fontWeight: 700,
              textDecoration: "none",
              background: "var(--brand-copper)",
              color: "var(--brand-white)",
            }}
          >
            {t("professionalSection.cta")}
          </Link>
          <p style={{ margin: "0.75rem auto 0", fontSize: "0.85rem", color: "var(--brand-warm-grey)", maxWidth: "760px", lineHeight: 1.6 }}>
            {t("professionalSection.microcopy")}
          </p>
        </div>
      </div>
    </section>
  );
}
