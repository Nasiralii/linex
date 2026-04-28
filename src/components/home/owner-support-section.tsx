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
        background: "linear-gradient(180deg, var(--brand-white) 0%, var(--brand-ivory) 100%)",
        padding: "5rem 0",
      }}
    >
      <div className="container-app" style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
            alignItems: "start",
          }}
        >
          <div
            className="lg:sticky lg:top-4"
            style={{
              background: "var(--brand-teal)",
              color: "var(--brand-white)",
              borderRadius: "24px",
              padding: "clamp(1.25rem, 4vw, 2rem)",
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
                color: "rgba(255,255,255,0.82)",
                marginBottom: "0.75rem",
              }}
            >
              <span style={{ width: "18px", height: "1.5px", background: "rgba(255,255,255,0.8)", display: "inline-block" }} />
              {t("twoSided.ownersTitle")}
            </div>
            <h2
              style={{
                fontSize: "clamp(1.4rem, 5vw, 2.15rem)",
                fontWeight: 800,
                color: "var(--brand-white)",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                marginBottom: "1rem",
              }}
            >
              {t("ownerSection.headline")}
            </h2>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.9)", lineHeight: 1.75, fontSize: "0.95rem" }}>
              {t("ownerSection.mainCopy")}
            </p>

            {showOwnerCta && (
              <div style={{ marginTop: "1.5rem" }}>
                <Link
                  href={ownerCtaHref as "/auth/register" | "/dashboard/projects/new"}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.85rem 1.2rem",
                    borderRadius: "10px",
                    fontSize: "0.9rem",
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

          <div
            style={{
              background: "var(--brand-white)",
              border: "1px solid var(--brand-ivory-dark)",
              borderRadius: "24px",
              padding: "clamp(1rem, 3.5vw, 1.5rem)",
            }}
          >
            {[
              { title: t("ownerSection.howWeHelpTitle"), items: helpItems, key: "helpItems" },
              { title: t("ownerSection.projectTypesTitle"), items: projectTypes, key: "projectTypes" },
              { title: t("ownerSection.featuresTitle"), items: features, key: "features" },
            ].map((group, idx) => (
              <div
                key={group.title}
                style={{
                  padding: "1rem 0",
                  borderBottom: idx < 2 ? "1px solid var(--brand-ivory-dark)" : "none",
                }}
              >
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--brand-navy)", marginBottom: "0.75rem" }}>
                  {group.title}
                </h3>
                <div
                  style={{
                    width: "48px",
                    height: "2px",
                    borderRadius: "999px",
                    background: "#0d7377",
                    marginBottom: "0.75rem",
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {group.items.map((i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.7rem" }}>
                      <CheckCircle2 style={{ width: "18px", height: "18px", color: "var(--brand-teal)", flexShrink: 0, marginTop: "0.22rem" }} />
                      <p style={{ margin: 0, color: "var(--brand-charcoal)", lineHeight: 1.65, fontSize: "0.94rem" }}>
                        {t(`ownerSection.${group.key}.${i}`)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
