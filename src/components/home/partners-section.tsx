import {
  Building2,
  HardHat,
  Home,
  Cpu,
  Landmark,
  GraduationCap,
  Target,
  Sparkles,
  Network,
  TrendingUp,
  ArrowRight,
  Handshake,
} from "lucide-react";
import { Link } from "@/i18n/routing";

interface PartnersSectionProps {
  t: (key: string) => string;
}

const PARTNER_TYPES = [
  { icon: Building2, key: "who1" },
  { icon: HardHat, key: "who2" },
  { icon: Home, key: "who3" },
  { icon: Cpu, key: "who4" },
  { icon: Landmark, key: "who5" },
  { icon: GraduationCap, key: "who6" },
] as const;

const WHY_REASONS = [
  { icon: Target, titleKey: "why1Title", descKey: "why1Desc" },
  { icon: Sparkles, titleKey: "why2Title", descKey: "why2Desc" },
  { icon: Network, titleKey: "why3Title", descKey: "why3Desc" },
  { icon: TrendingUp, titleKey: "why4Title", descKey: "why4Desc" },
] as const;

export function PartnersSection({ t }: PartnersSectionProps) {
  return (
    <section
      id="partners"
      style={{
        position: "relative",
        background: "linear-gradient(180deg, var(--brand-ivory) 0%, var(--brand-white) 50%, var(--brand-ivory) 100%)",
        padding: "6rem 0",
        borderTop: "1px solid var(--brand-ivory-dark)",
        overflow: "hidden",
      }}
    >
      {/* Decorative background mesh */}
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
          background: "radial-gradient(circle, rgba(42,123,136,0.06) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      <div className="container-app" style={{ position: "relative" }}>
        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem", maxWidth: "780px", marginInline: "auto" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.74rem",
              fontWeight: 800,
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
              fontWeight: 900,
              letterSpacing: "-0.025em",
              fontSize: "clamp(1.9rem, 4vw, 2.8rem)",
              lineHeight: 1.15,
            }}
          >
            {t("partnersSection.headline")}
          </h2>
          <p
            style={{
              margin: 0,
              color: "var(--brand-charcoal)",
              fontSize: "1rem",
              lineHeight: 1.75,
            }}
          >
            {t("partnersSection.copy")}
          </p>
        </div>

        {/* ── Who Can Partner — horizontal pill grid ── */}
        <div style={{ marginBottom: "3.5rem" }}>
          <p
            style={{
              margin: "0 0 1.2rem",
              color: "var(--brand-warm-grey)",
              fontSize: "0.74rem",
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            {t("partnersSection.whoTitle")}
          </p>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            style={{
              gap: "0.8rem",
            }}
          >
            {PARTNER_TYPES.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.85rem",
                    padding: "0.95rem 1.1rem",
                    borderRadius: "14px",
                    background: "var(--brand-white)",
                    border: "1px solid var(--brand-ivory-dark)",
                    boxShadow: "0 4px 16px -12px rgba(27,42,74,0.12)",
                    transition: "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
                  }}
                >
                  <span
                    style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, rgba(42,123,136,0.14) 0%, rgba(42,123,136,0.06) 100%)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      position: "relative",
                    }}
                  >
                    <Icon style={{ width: "17px", height: "17px", color: "var(--brand-teal)" }} />
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: "-6px",
                        right: "-6px",
                        width: "18px",
                        height: "18px",
                        borderRadius: "999px",
                        background: "var(--brand-navy)",
                        color: "#fff",
                        fontSize: "0.62rem",
                        fontWeight: 800,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {idx + 1}
                    </span>
                  </span>
                  <p style={{ margin: 0, color: "var(--brand-navy)", fontSize: "0.9rem", lineHeight: 1.45, fontWeight: 600 }}>
                    {t(`partnersSection.${p.key}`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Why Partner — 2x2 grid + Partnership Model side panel ── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3"
          style={{ gap: "1.5rem", marginBottom: "3rem" }}
        >
          {/* Left: Why Partner 2x2 */}
          <div
            className="lg:col-span-2"
            style={{
              padding: "2rem",
              borderRadius: "20px",
              background: "var(--brand-white)",
              border: "1px solid var(--brand-ivory-dark)",
              boxShadow: "0 16px 48px -32px rgba(27,42,74,0.18)",
            }}
          >
            <p
              style={{
                margin: "0 0 1.4rem",
                color: "var(--brand-teal)",
                fontSize: "0.72rem",
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              {t("partnersSection.whyTitle")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "1.4rem" }}>
              {WHY_REASONS.map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.titleKey} style={{ display: "flex", gap: "0.85rem" }}>
                    <span
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: "var(--brand-teal)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon style={{ width: "16px", height: "16px", color: "#fff" }} />
                    </span>
                    <div>
                      <p style={{ margin: "0 0 0.3rem", color: "var(--brand-navy)", fontWeight: 800, fontSize: "0.95rem", letterSpacing: "-0.01em" }}>
                        {t(`partnersSection.${r.titleKey}`)}
                      </p>
                      <p style={{ margin: 0, color: "var(--brand-charcoal)", fontSize: "0.86rem", lineHeight: 1.65 }}>
                        {t(`partnersSection.${r.descKey}`)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Partnership Model + CTA */}
          <div
            style={{
              padding: "2rem",
              borderRadius: "20px",
              background:
                "linear-gradient(155deg, var(--brand-teal) 0%, #0a5a5d 100%)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 22px 48px -28px rgba(13,115,119,0.55)",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
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
            <p
              style={{
                margin: "0 0 0.7rem",
                color: "rgba(255,255,255,0.78)",
                fontSize: "0.7rem",
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                position: "relative",
              }}
            >
              {t("partnersSection.modelLabel")}
            </p>
            <h3
              style={{
                margin: "0 0 0.7rem",
                color: "#fff",
                fontWeight: 800,
                fontSize: "1.3rem",
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
                position: "relative",
              }}
            >
              {t("partnersSection.modelTitle")}
            </h3>
            <div
              style={{
                width: "32px",
                height: "3px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.65)",
                marginBottom: "1rem",
                position: "relative",
              }}
            />
            <p
              style={{
                margin: "0 0 1.8rem",
                color: "rgba(255,255,255,0.85)",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                position: "relative",
              }}
            >
              {t("partnersSection.modelDesc")}
            </p>

            {/* CTA — translucent fill that reads as part of the teal card */}
            <Link
              href="/#faq-contact-section"
              style={{
                marginTop: "auto",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.6rem",
                padding: "0.85rem 1.2rem",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                border: "1.5px solid rgba(255,255,255,0.45)",
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none",
                position: "relative",
                transition:
                  "background 160ms ease, border-color 160ms ease, transform 160ms ease",
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
