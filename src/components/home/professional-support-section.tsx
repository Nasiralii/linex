import { Link } from "@/i18n/routing";
import { CheckCircle2 } from "lucide-react";

interface ProfessionalSupportSectionProps {
  t: (key: string) => string;
}

export function ProfessionalSupportSection({ t }: ProfessionalSupportSectionProps) {
  const whyJoinItems = [0, 1, 2, 3, 4, 5];
  const growthItems = [0, 1, 2];

  return (
    <section className="md:!py-8 !py-4"
      id="professionals"
      style={{
        background: "var(--brand-ivory)",
      }}
    >
      <div className="container-app">
        <div
          style={{
            marginBottom: "2rem",
            borderRadius: "26px",
            padding: "clamp(1.5rem, 4vw, 2.25rem)",
            background: "var(--brand-teal)",
            boxShadow: "0 24px 60px -28px rgba(27,42,74,0.45)",
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
              color: "rgba(255,255,255,0.86)",
              marginBottom: "1rem",
            }}
          >
            <span style={{ width: "22px", height: "1.5px", background: "rgba(255,255,255,0.86)", display: "inline-block" }} />
            {t("twoSided.contractorsTitle")}
            <span style={{ width: "22px", height: "1.5px", background: "rgba(255,255,255,0.86)", display: "inline-block" }} />
          </div>
          <h2 className="!text-2xl md:!text-4xl"
            style={{
              fontWeight: 700,
              color: "var(--brand-white)",
              letterSpacing: "-0.025em",
              lineHeight: 1.15,
              maxWidth: "900px",
              margin: "0 0 1rem",
            }}
          >
            {t("professionalSection.headline")}
          </h2>
          <p
            style={{
              fontSize: "1.05rem",
              color: "rgba(255,255,255,0.92)",
              lineHeight: 1.8,
              maxWidth: "940px",
              margin: 0,
            }}
          >
            {t("professionalSection.mainCopy")}
          </p>
        </div>

        <div style={{ borderTop: "1px solid var(--brand-ivory-dark)", borderBottom: "1px solid var(--brand-ivory-dark)", padding: "2rem 0" }}>
          <div
            style={{
              padding: "1.5rem",
              marginBottom: "1.5rem",
              borderRadius: "20px",
              border: "1px solid rgba(13,115,119,0.14)",
              background: "linear-gradient(135deg, #ffffff 0%, #f7fbfb 100%)",
              boxShadow: "0 16px 40px -30px rgba(27,42,74,0.3)",
            }}
          >
            <h3 style={{ fontSize: "1.12rem", fontWeight: 700, color: "#0d7377", marginBottom: "0.9rem" }}>
              {t("professionalSection.whyJoinTitle")}
            </h3>
            <div style={{ width: "40px", height: "3px", borderRadius: "999px", background: "#0d7377", marginBottom: "0.75rem" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.75rem 1.25rem" }}>
              {whyJoinItems.map((i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.7rem" }}>
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "999px",
                      background: "rgba(13,115,119,0.12)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "0.18rem",
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 style={{ width: "14px", height: "14px", color: "var(--brand-teal)" }} />
                  </span>
                  <p style={{ margin: 0, color: "var(--brand-charcoal)", lineHeight: 1.6, fontSize: "0.94rem" }}>
                    {t(`professionalSection.whyJoin.${i}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem 2rem" }}>
            <div
              style={{
                borderRadius: "20px",
                border: "1px solid rgba(13,115,119,0.14)",
                background: "linear-gradient(145deg, #ffffff 0%, #f8fbfb 100%)",
                boxShadow: "0 16px 40px -30px rgba(27,42,74,0.3)",
                padding: "1.4rem",
              }}
            >
              <h3 style={{ fontSize: "1.12rem", fontWeight: 700, color: "#0d7377", marginBottom: "0.9rem" }}>
                {t("professionalSection.contractorsTitle")}
              </h3>
              <div style={{ width: "40px", height: "3px", borderRadius: "999px", background: "#0d7377", marginBottom: "0.75rem" }} />
              <p style={{ margin: 0, color: "var(--brand-charcoal)", lineHeight: 1.7, fontSize: "0.95rem" }}>
                {t("professionalSection.contractorsCopy")}
              </p>
            </div>

            <div
              style={{
                borderRadius: "20px",
                border: "1px solid rgba(13,115,119,0.14)",
                background: "linear-gradient(145deg, #ffffff 0%, #f8fbfb 100%)",
                boxShadow: "0 16px 40px -30px rgba(27,42,74,0.3)",
                padding: "1.4rem",
              }}
            >
              <h3 style={{ fontSize: "1.12rem", fontWeight: 700, color: "#0d7377", marginBottom: "0.9rem" }}>
                {t("professionalSection.engineersTitle")}
              </h3>
              <div style={{ width: "40px", height: "3px", borderRadius: "999px", background: "#0d7377", marginBottom: "0.75rem" }} />
              <p style={{ margin: 0, color: "var(--brand-charcoal)", lineHeight: 1.7, fontSize: "0.95rem" }}>
                {t("professionalSection.engineersCopy")}
              </p>
            </div>
          </div>

          <div
            style={{
              padding: "1.5rem",
              marginTop: "1.5rem",
              borderRadius: "20px",
              border: "1px solid rgba(13,115,119,0.14)",
              background: "linear-gradient(135deg, #ffffff 0%, #f7fbfb 100%)",
              boxShadow: "0 16px 40px -30px rgba(27,42,74,0.3)",
            }}
          >
            <h3 style={{ fontSize: "1.12rem", fontWeight: 700, color: "#0d7377", marginBottom: "0.9rem" }}>
              {t("professionalSection.growthTitle")}
            </h3>
            <div style={{ width: "40px", height: "3px", borderRadius: "999px", background: "#0d7377", marginBottom: "0.75rem" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {growthItems.map((i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.7rem" }}>
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      borderRadius: "999px",
                      background: "rgba(13,115,119,0.12)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginTop: "0.18rem",
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle2 style={{ width: "14px", height: "14px", color: "var(--brand-teal)" }} />
                  </span>
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
