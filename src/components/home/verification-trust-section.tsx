import { Fragment } from "react";
import {
  Activity,
  AlertCircle,
  Award,
  Briefcase,
  ChevronRight,
  ClipboardCheck,
  FileText,
  MapPin,
  Search,
  Shield,
  Star,
  Tag,
  type LucideIcon,
} from "lucide-react";

interface VerificationTrustSectionProps {
  t: (key: string) => string;
}

const REVIEW_ITEMS: { icon: LucideIcon; key: string }[] = [
  { icon: FileText, key: "verificationTrust.reviewItems.0" },
  { icon: Award, key: "verificationTrust.reviewItems.1" },
  { icon: Tag, key: "verificationTrust.reviewItems.2" },
  { icon: Briefcase, key: "verificationTrust.reviewItems.3" },
  { icon: ClipboardCheck, key: "verificationTrust.reviewItems.4" },
  { icon: Star, key: "verificationTrust.reviewItems.5" },
  { icon: MapPin, key: "verificationTrust.reviewItems.6" },
];

const WHY_MATTERS: { icon: LucideIcon; titleKey: string; descKey: string }[] = [
  {
    icon: Activity,
    titleKey: "verificationTrust.whyMatters.0.title",
    descKey: "verificationTrust.whyMatters.0.desc",
  },
  {
    icon: Search,
    titleKey: "verificationTrust.whyMatters.1.title",
    descKey: "verificationTrust.whyMatters.1.desc",
  },
  {
    icon: Shield,
    titleKey: "verificationTrust.whyMatters.2.title",
    descKey: "verificationTrust.whyMatters.2.desc",
  },
];

const TIER_COLORS = ["#94a3b8", "var(--brand-teal)", "var(--brand-teal)", "#9c8bf0"];
const WHO_GETS = [0, 1, 2, 3];

const PANEL_BG = "var(--brand-white)";
const PANEL_BORDER = "1px solid var(--brand-ivory-dark)";
const PANEL_RADIUS = "14px";

export function VerificationTrustSection({ t }: VerificationTrustSectionProps) {
  return (
    <section
      style={{
        background: "var(--brand-ivory)",
        padding: "5rem 0",
        position: "relative",
      }}
    >
      <div className="container-app" style={{ maxWidth: "1120px", margin: "0 auto" }}>
        <Hero t={t} />
        <TierStrip t={t} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3" style={{ marginBottom: "1.25rem" }}>
          <ReviewPanel t={t} />
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <WhyMattersPanel t={t} />
            <WhoGetsPanel t={t} />
          </div>
        </div>

        <ImportantNote t={t} />
      </div>
    </section>
  );
}

function Hero({ t }: { t: (key: string) => string }) {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: "16px",
        padding: "1.75rem 1.85rem 1.6rem",
        background: PANEL_BG,
        border: PANEL_BORDER,
        overflow: "hidden",
        marginBottom: "1.25rem",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: "1.4rem",
          right: "1.4rem",
          height: "2px",
          background:
            "linear-gradient(90deg, var(--brand-teal) 0%, var(--brand-copper) 50%, var(--brand-teal) 100%)",
          opacity: 0.75,
        }}
      />
      <p
        style={{
          margin: "0 0 0.75rem",
          color: "var(--brand-warm-grey)",
          fontSize: "0.74rem",
          fontWeight: 800,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
        }}
      >
        {t("verificationTrust.badge")}
      </p>
      <h2
        style={{
          margin: "0 0 0.85rem",
          fontSize: "clamp(1.6rem, 3.4vw, 2.4rem)",
          fontWeight: 800,
          color: "var(--brand-navy)",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
        }}
      >
        {t("verificationTrust.headlinePrefix")}{" "}
        <span style={{ color: "var(--brand-teal)" }}>{t("verificationTrust.headlineAccent")}</span>
      </h2>
      <p
        style={{
          margin: 0,
          color: "var(--brand-charcoal)",
          lineHeight: 1.75,
          fontSize: "0.95rem",
          maxWidth: "880px",
        }}
      >
        {t("verificationTrust.whyCopy")}
      </p>
    </div>
  );
}

function TierStrip({ t }: { t: (key: string) => string }) {
  return (
    <div
      style={{
        borderRadius: PANEL_RADIUS,
        border: PANEL_BORDER,
        background: PANEL_BG,
        padding: "1rem 0.6rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        gap: "0.4rem",
        marginBottom: "1.25rem",
        flexWrap: "wrap",
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <Fragment key={i}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", minWidth: "80px" }}>
            <span
              aria-hidden
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "999px",
                background: `color-mix(in srgb, ${TIER_COLORS[i]} 16%, white)`,
                border: `1px solid color-mix(in srgb, ${TIER_COLORS[i]} 44%, transparent)`,
                color: TIER_COLORS[i],
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.85rem",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ color: "var(--brand-charcoal)", fontSize: "0.86rem", fontWeight: 600 }}>
              {t(`verificationTrust.tiers.${i}.name`)}
            </span>
          </div>
          {i < 3 && (
            <ChevronRight
              aria-hidden
              style={{ width: "16px", height: "16px", color: "var(--brand-warm-grey)", flexShrink: 0 }}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}

function ReviewPanel({ t }: { t: (key: string) => string }) {
  return (
    <div
      style={{
        borderRadius: PANEL_RADIUS,
        border: PANEL_BORDER,
        background: PANEL_BG,
        padding: "1.4rem 1.45rem",
      }}
    >
      <Eyebrow label={t("verificationTrust.reviewTitle")} />
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {REVIEW_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <span
                aria-hidden
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  background: "var(--brand-ivory)",
                  border: "1px solid var(--brand-ivory-dark)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "0.05rem",
                }}
              >
                <Icon style={{ width: "14px", height: "14px", color: "var(--brand-teal)" }} aria-hidden />
              </span>
              <span style={{ color: "var(--brand-charcoal)", lineHeight: 1.55, fontSize: "0.94rem" }}>
                {t(item.key)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function WhyMattersPanel({ t }: { t: (key: string) => string }) {
  return (
    <div
      style={{
        borderRadius: PANEL_RADIUS,
        border: PANEL_BORDER,
        background: PANEL_BG,
        padding: "1.4rem 1.45rem",
      }}
    >
      <h3 style={{ margin: "0 0 0.85rem", color: "var(--brand-navy)", fontSize: "1rem", fontWeight: 800 }}>
        {t("verificationTrust.whyMattersTitle")}
      </h3>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {WHY_MATTERS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <span
                aria-hidden
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "8px",
                  background: "var(--brand-ivory)",
                  border: "1px solid var(--brand-ivory-dark)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "0.1rem",
                }}
              >
                <Icon style={{ width: "14px", height: "14px", color: "var(--brand-teal)" }} aria-hidden />
              </span>
              <div>
                <p style={{ margin: "0 0 0.18rem", color: "var(--brand-navy)", fontSize: "0.94rem", fontWeight: 700 }}>
                  {t(item.titleKey)}
                </p>
                <p style={{ margin: 0, color: "var(--brand-charcoal)", fontSize: "0.86rem", lineHeight: 1.55 }}>
                  {t(item.descKey)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function WhoGetsPanel({ t }: { t: (key: string) => string }) {
  return (
    <div
      style={{
        borderRadius: PANEL_RADIUS,
        border: PANEL_BORDER,
        background: PANEL_BG,
        padding: "1.4rem 1.45rem",
      }}
    >
      <h3 style={{ margin: "0 0 0.85rem", color: "var(--brand-navy)", fontSize: "1rem", fontWeight: 800 }}>
        {t("verificationTrust.whoGetsTitle")}
      </h3>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.55rem" }}>
        {WHO_GETS.map((i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span
              aria-hidden
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "999px",
                background: TIER_COLORS[i],
                flexShrink: 0,
              }}
            />
            <span style={{ color: "var(--brand-charcoal)", fontSize: "0.92rem" }}>
              {t(`verificationTrust.whoGets.${i}`)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ImportantNote({ t }: { t: (key: string) => string }) {
  return (
    <>
      <Eyebrow label={t("verificationTrust.tiersTitle")} />
      <div
        style={{
          borderRadius: PANEL_RADIUS,
          border: PANEL_BORDER,
          background: PANEL_BG,
          borderLeft: "3px solid var(--brand-teal)",
          padding: "1.15rem 1.45rem",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            color: "var(--brand-teal)",
            fontSize: "0.74rem",
            fontWeight: 800,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: "0.55rem",
          }}
        >
          <AlertCircle aria-hidden style={{ width: "14px", height: "14px" }} />
          {t("verificationTrust.noteTitle")}
        </div>
        <p style={{ margin: 0, color: "var(--brand-charcoal)", lineHeight: 1.7, fontSize: "0.94rem" }}>
          {t("verificationTrust.noteCopy")}{" "}
          <strong style={{ color: "var(--brand-navy)" }}>{t("verificationTrust.noteEmphasis")}</strong>
        </p>
      </div>
    </>
  );
}

function Eyebrow({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        color: "var(--brand-warm-grey)",
        fontSize: "0.72rem",
        fontWeight: 800,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        marginBottom: "0.85rem",
      }}
    >
      <span aria-hidden style={{ width: "18px", height: "1.5px", background: "var(--brand-ivory-dark)", display: "inline-block" }} />
      {label}
    </div>
  );
}
