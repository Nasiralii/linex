import { Handshake, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { PartnerLogosCarousel } from "@/components/home/partner-logos-carousel";

interface PartnersSectionProps {
  t: (key: string) => string;
}

export function PartnersSection({ t }: PartnersSectionProps) {
  const partnerItems = [
    { src: "/ITIS.png", label: "ITIS" },
    { src: "/soroh-theqa.png", label: "Soroh Theqa" },
  ];
  return (
    <section
      id="partners"
      style={{
        position: "relative",
        background:
          "linear-gradient(180deg, var(--brand-ivory) 0%, var(--brand-white) 50%, var(--brand-ivory) 100%)",
        padding: "clamp(2.25rem, 6vw, 2rem) 0 clamp(2.75rem, 7vw, 5rem)",
        borderTop: "1px solid var(--brand-ivory-dark)",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-100px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "900px",
          height: "900px",
          borderRadius: "999px",
          background:
            "radial-gradient(circle, rgba(42,123,136,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div className="container-app" style={{ position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "2.75rem", maxWidth: "800px", marginInline: "auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.74rem",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--brand-teal)",
              padding: "0.4rem 0.9rem",
              borderRadius: "999px",
              background: "rgba(42,123,136,0.08)",
              border: "1px solid rgba(42,123,136,0.2)",
              marginBottom: "1.2rem",
            }}
          >
            <Handshake style={{ width: "13px", height: "13px" }} />
            {t("partnersSection.badge")}
          </div>
          <h2
            style={{
              margin: "0 0 1rem",
              color: "var(--brand-navy)",
              fontWeight: 700,
              letterSpacing: "-0.025em",
              fontSize: "clamp(2.05rem, 4.2vw, 3rem)",
              lineHeight: 1.15,
            }}
          >
            {t("partnersSection.headline")}
          </h2>
          <p
            style={{
              margin: "0 0 1.25rem",
              color: "var(--brand-charcoal)",
              fontSize: "1.08rem",
              lineHeight: 1.8,
            }}
          >
            {t("partnersSection.copy")}
          </p>
          <p
            style={{
              margin: 0,
              color: "var(--brand-warm-grey)",
              fontSize: "0.98rem",
              lineHeight: 1.68,
            }}
          >
            {t("partnersSection.gridSubtitle")}
          </p>
        </div>

        <PartnerLogosCarousel items={partnerItems} />

        <div
          style={{
            padding: "1.85rem 2rem",
            borderRadius: "20px",
            background: "linear-gradient(155deg, var(--brand-teal) 0%, #0a5a5d 100%)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 22px 48px -28px rgba(13,115,119,0.55)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: "-80px",
              right: "-80px",
              width: "240px",
              height: "240px",
              borderRadius: "999px",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)",
            }}
          />
          <div
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            style={{ position: "relative" }}
          >
            <div style={{ maxWidth: "640px" }}>
              <p
                style={{
                  margin: "0 0 0.45rem",
                  color: "rgba(255,255,255,0.78)",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                {t("partnersSection.modelLabel")}
              </p>
              <h3
                style={{
                  margin: "0 0 0.65rem",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "clamp(1.15rem, 2.8vw, 1.35rem)",
                  lineHeight: 1.28,
                  letterSpacing: "-0.02em",
                }}
              >
                {t("partnersSection.modelTitle")}
              </h3>
              <p style={{ margin: 0, color: "rgba(255,255,255,0.88)", fontSize: "0.9rem", lineHeight: 1.68 }}>
                {t("partnersSection.modelDesc")}
              </p>
            </div>
            <Link
              href="/#faq-contact-section"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.6rem",
                padding: "0.9rem 1.35rem",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                border: "1.5px solid rgba(255,255,255,0.45)",
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none",
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "background 160ms ease, border-color 160ms ease, transform 160ms ease",
              }}
            >
              {t("partnersSection.cta")}
              <ArrowRight style={{ width: "15px", height: "15px" }} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
