import { Link } from "@/i18n/routing";
import { CheckCircle2 } from "lucide-react";

interface OwnerSupportSectionProps {
  t: (key: string) => string;
  showOwnerCta: boolean;
  ownerCtaHref: string;
}

export function OwnerSupportSection({ t, showOwnerCta, ownerCtaHref }: OwnerSupportSectionProps) {
  const helpItems = [0, 1, 2, 3, 4];
  const projectTypes = [0, 1, 2, 3, 4, 5, 6];
  const features = [0, 1, 2, 3];

  return (
    <section
      style={{
        background: "var(--brand-white)",
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
            {t("twoSided.ownersTitle")}
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
            {t("ownerSection.headline")}
          </h2>
          <p
            style={{
              fontSize: "1.05rem",
              color: "var(--brand-charcoal)",
              lineHeight: 1.8,
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            {t("ownerSection.mainCopy")}
          </p>
        </div>

        <div
          style={{
            marginTop: "2.25rem",
            borderBottom: "1px solid var(--brand-ivory-dark)",
            padding: "2rem 0",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem 2rem",
            }}
          >
            {[
              { title: t("ownerSection.howWeHelpTitle"), items: helpItems, key: "helpItems" },
              { title: t("ownerSection.projectTypesTitle"), items: projectTypes, key: "projectTypes" },
              { title: t("ownerSection.featuresTitle"), items: features, key: "features" },
            ].map((group, idx) => (
              <div key={group.title} style={{ paddingRight: idx < 2 ? "0.25rem" : 0 }}>
                <h3 style={{ fontSize: "1.12rem", fontWeight: 700, color: "#0d7377", marginBottom: "0.9rem" }}>
                  {group.title}
                </h3>
                <div
                  style={{
                    width: "40px",
                    height: "3px",
                    borderRadius: "999px",
                    background: "#0d7377",
                    marginBottom: "0.75rem",
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {group.items.map((i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.7rem" }}>
                      <CheckCircle2 style={{ width: "18px", height: "18px", color: "var(--brand-teal)", flexShrink: 0, marginTop: "0.22rem" }} />
                      <p style={{ margin: 0, color: "var(--brand-charcoal)", lineHeight: 1.6, fontSize: "0.94rem" }}>
                        {t(`ownerSection.${group.key}.${i}`)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {showOwnerCta && (
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <Link
              href={ownerCtaHref as "/auth/register" | "/dashboard/projects/new"}
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
              {t("ownerSection.cta")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
