"use client";

import { useTranslations } from "next-intl";
import { C, IMGS } from "../lib/constants";
import { Reveal, TiltCard } from "../ui";

export function HowItWorks() {
  const t = useTranslations("landing");

  const steps = [
    {
      n: "01",
      title: t("howItWorks.step1.title"),
      ar: t("howItWorks.step1.arabic"),
      desc: t("howItWorks.step1.desc"),
      img: IMGS.step1,
      color: C.copper,
    },
    {
      n: "02",
      title: t("howItWorks.step2.title"),
      ar: t("howItWorks.step2.arabic"),
      desc: t("howItWorks.step2.desc"),
      img: IMGS.step2,
      color: C.teal,
    },
    {
      n: "03",
      title: t("howItWorks.step3.title"),
      ar: t("howItWorks.step3.arabic"),
      desc: t("howItWorks.step3.desc"),
      img: IMGS.step3,
      color: C.gold,
    },
  ];

  return (
    <section id="how-it-works" style={{ background: C.navy, padding: "80px 16px 100px", position: "relative", overflow: "hidden" }} className="how-it-works-section">
      <style>{`
        @media (min-width: 768px) {
          .how-it-works-section { padding: 100px 24px 120px !important; }
        }
        @media (min-width: 1024px) {
          .how-it-works-section { padding: 130px 48px 160px !important; }
        }
      `}</style>
      {/* Dot pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(rgba(184,115,51,.12) 1px,transparent 1px)`,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
        }}
      />
      {/* Glow blobs */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -200,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle,rgba(42,123,136,.15),transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -200,
          right: -100,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle,rgba(184,115,51,.1),transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 88 }}>
            <div className="tag-pill" style={{ display: "inline-flex", marginBottom: 20 }}>
              <span
                style={{
                  color: C.copper,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                }}
              >
                {t("howItWorks.tag")}
              </span>
            </div>
            <h2 className="fd" style={{ fontSize: "clamp(2.2rem,4.5vw,3.8rem)", color: C.ivory, fontWeight: 300, lineHeight: 1.15 }}>
              {t("howItWorks.title.line1")}
              <br />
              <em style={{ fontStyle: "italic" }} className="shimmer-text">
                {t("howItWorks.title.highlight")}
              </em>
            </h2>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }} className="steps-grid">
          <style>{`
            @media (min-width: 768px) {
              .steps-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 24px !important; }
            }
            @media (min-width: 1024px) {
              .steps-grid { grid-template-columns: repeat(3, 1fr) !important; }
            }
          `}</style>
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.15}>
              <TiltCard style={{ borderRadius: 24, overflow: "hidden", height: 450, cursor: "default" }}>
                {/* BG image */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${s.img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                {/* Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(to top,rgba(27,42,74,.97) 40%,rgba(27,42,74,.5) 72%,transparent)`,
                  }}
                />
                {/* Top accent */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${s.color},transparent)` }} />
                {/* Big bg number */}
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -6,
                    fontFamily: "Cormorant Garamond,serif",
                    fontSize: 120,
                    fontWeight: 300,
                    lineHeight: 1,
                    color: `rgba(184,115,51,.07)`,
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                  className="step-bg-num"
                >
                  <style>{`
                    @media (min-width: 1024px) {
                      .step-bg-num { font-size: 160px !important; }
                    }
                  `}</style>
                  {s.n}
                </div>

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    padding: "28px 24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                  className="step-content"
                >
                  <style>{`
                    @media (min-width: 768px) {
                      .step-content { padding: 32px 28px !important; }
                    }
                    @media (min-width: 1024px) {
                      .step-content { padding: 36px 36px !important; }
                    }
                  `}</style>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: `${s.color}22`,
                      border: `1px solid ${s.color}44`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 22,
                    }}
                  >
                    <span className="fd" style={{ color: s.color, fontSize: 21, fontWeight: 600 }}>
                      {s.n}
                    </span>
                  </div>
                  <h3 className="fd" style={{ fontSize: 28, color: C.ivory, fontWeight: 400, marginBottom: 6 }}>
                    {s.title}
                  </h3>
                  <p style={{ color: s.color, fontSize: 13, marginBottom: 16, opacity: 0.9 }}>{s.ar}</p>
                  <p style={{ color: "rgba(245,243,239,.62)", fontSize: 14, lineHeight: 1.75 }}>{s.desc}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.5}>
          <div style={{ textAlign: "center", marginTop: 60 }}>
            <button className="btn-primary">{t("howItWorks.cta")}</button>
          </div>
        </Reveal>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: "100%", height: 80 }}>
          <path d="M0,80 L0,50 Q360,0 720,40 Q1080,80 1440,30 L1440,80 Z" fill={C.ivory} />
        </svg>
      </div>
    </section>
  );
}
