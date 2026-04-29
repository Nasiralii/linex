import { ArrowRight, Building2, CheckCircle2, HardHat } from "lucide-react";
import Link from "next/link";

interface TwoSidedSnapshotSectionProps {
  t: (key: string) => string;
}

const OWNER_BULLETS = [
  "ownerBullet1",
  "ownerBullet2",
  "ownerBullet3",
];

const PRO_BULLETS = [
  "proBullet1",
  "proBullet2",
  "proBullet3",
];

export function TwoSidedSnapshotSection({ t }: TwoSidedSnapshotSectionProps) {
  const sides = [
    {
      icon: Building2,
      eyebrow: t("ownerSection.badge"),
      title: t("twoSided.ownersTitle"),
      desc: t("twoSided.ownersDesc"),
      bullets: OWNER_BULLETS,
      cta: t("ownerSection.cta"),
      href: "/auth/register?role=owner",
      accent: "#b87333",
      cardBg: "linear-gradient(135deg, rgba(184,115,51,0.22) 0%, rgba(184,115,51,0.07) 55%, rgba(248,244,240,0.6) 100%)",
      cardBorder: "rgba(184,115,51,0.2)",
      image: "/project-owner.jpg",
    },
    {
      icon: HardHat,
      eyebrow: t("professionalSection.badge"),
      title: t("twoSided.contractorsTitle"),
      desc: t("twoSided.contractorsDesc"),
      bullets: PRO_BULLETS,
      cta: t("professionalSection.cta"),
      href: "/auth/register?role=professional",
      accent: "#4a8c97",
      cardBg: "linear-gradient(135deg, rgba(74,140,151,0.22) 0%, rgba(74,140,151,0.07) 55%, rgba(240,247,248,0.6) 100%)",
      cardBorder: "rgba(74,140,151,0.2)",
      image: "/engineer.jpg",
    },
  ];

  return (
    <section
      className="!py-8"
      style={{
        background: "var(--brand-ivory)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle Background Decoration */}
      <div aria-hidden style={{
        position: "absolute", bottom: "-100px", right: "-80px",
        width: "320px", height: "320px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(184,115,51,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div aria-hidden style={{
        position: "absolute", top: "-80px", left: "-60px",
        width: "280px", height: "280px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(74,140,151,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="container-app" style={{ position: "relative", zIndex: 1 }}>

        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.4rem 1rem", borderRadius: "999px",
            background: "rgba(74,140,151,0.08)", border: "1px solid rgba(74,140,151,0.15)",
            fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#4a8c97", marginBottom: "1rem",
          }}>
            <span style={{ width: "12px", height: "2px", background: "#4a8c97", display: "inline-block" }} />
            {t("twoSided.title")}
            <span style={{ width: "12px", height: "2px", background: "#4a8c97", display: "inline-block" }} />
          </div>
          <h2 style={{
            fontSize: "clamp(2rem, 4vw, 2.75rem)",
            fontWeight: 700, color: "var(--brand-navy)",
            letterSpacing: "-0.03em", lineHeight: 1.1, margin: 0,
          }}>
            {t("twoSided.headline")}
          </h2>
        </div>

        {/* Cards Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: "2rem", width: "100%" }}
        >
          {sides.map((side) => (
            <article
              key={side.title}
              className="!p-6 md:!p-10"
              style={{
                background: side.cardBg,
                borderRadius: "32px",
                border: `1px solid ${side.cardBorder}`,
                boxShadow: "0 25px 50px -12px rgba(27,42,74,0.12)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                minHeight: "380px",
              }}
            >
              {/* Background photo for owners card */}
              {side.image && (
                <>
                  <div aria-hidden style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `url(${side.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: 0.20,
                    pointerEvents: "none",
                    zIndex: 0,
                  }} />
                  <div aria-hidden style={{
                    position: "absolute", inset: 0,
                    background: side.cardBg,
                    pointerEvents: "none",
                    zIndex: 1,
                  }} />
                </>
              )}

              <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", height: "100%", gap: "1.5rem" }}>

                {/* Icon & Label */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{
                    width: "56px", height: "56px", borderRadius: "16px",
                    background: "#fff",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    <side.icon style={{ width: "26px", height: "26px", color: side.accent }} />
                  </div>
                  <span style={{
                    fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.06em",
                    textTransform: "uppercase", color: side.accent,
                  }}>
                    {side.eyebrow}
                  </span>
                </div>

                {/* Title & Desc */}
                <div>
                  <h3 style={{
                    fontSize: "1.6rem", fontWeight: 600,
                    color: "var(--brand-navy)", marginBottom: "0.75rem",
                    letterSpacing: "-0.025em",
                  }}>
                    {side.title}
                  </h3>
                  <p style={{ color: "#475569", fontSize: "1rem", lineHeight: 1.7, margin: 0 }}>
                    {side.desc}
                  </p>
                </div>

                {/* Bullets */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {side.bullets.map((key) => (
                    <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <CheckCircle2 style={{ width: "18px", height: "18px", color: side.accent, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.9rem", color: "#334155", fontWeight: 500, lineHeight: 1.5 }}>
                        {t(`twoSided.${key}`)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
                  <Link
                    href={side.href}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "0.6rem",
                      fontSize: "0.95rem", fontWeight: 800, color: side.accent,
                      textDecoration: "none",
                    }}
                  >
                    {side.cta}
                    <ArrowRight style={{ width: "18px", height: "18px" }} />
                  </Link>
                </div>

              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
