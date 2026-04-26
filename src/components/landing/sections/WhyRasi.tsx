"use client";

import { useTranslations } from "next-intl";
import { C, IMGS } from "../lib/constants";
import { Reveal, TiltCard } from "../ui";

export function WhyRasi() {
  const t = useTranslations("landing");

  const cards = [
    {
      title: t("whyRasi.card1.title"),
      ar: t("whyRasi.card1.arabic"),
      desc: t("whyRasi.card1.desc"),
      img: IMGS.why1,
      color: C.copper,
    },
    {
      title: t("whyRasi.card2.title"),
      ar: t("whyRasi.card2.arabic"),
      desc: t("whyRasi.card2.desc"),
      img: IMGS.why2,
      color: C.teal,
    },
    {
      title: t("whyRasi.card3.title"),
      ar: t("whyRasi.card3.arabic"),
      desc: t("whyRasi.card3.desc"),
      img: IMGS.why3,
      color: C.gold,
    },
    {
      title: t("whyRasi.card4.title"),
      ar: t("whyRasi.card4.arabic"),
      desc: t("whyRasi.card4.desc"),
      img: IMGS.why4,
      color: C.tealLt,
    },
  ];

  return (
    <section style={{ background: C.ivory, padding: "80px 16px 100px", position: "relative", overflow: "hidden" }} className="why-rasi-section">
      <style>{`
        @media (min-width: 768px) {
          .why-rasi-section { padding: 100px 24px 120px !important; }
        }
        @media (min-width: 1024px) {
          .why-rasi-section { padding: 120px 48px 140px !important; }
        }
      `}</style>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
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
                {t("whyRasi.tag")}
              </span>
            </div>
            <h2 className="fd !text-black" style={{ fontSize: "clamp(2.2rem,4.5vw,3.8rem)", color: C.ivory, fontWeight: 300 }}>
              {t("whyRasi.title.line1")}
              <br />
              <em style={{ fontStyle: "italic" }} className="grad-text">
                {t("whyRasi.title.highlight")}
              </em>
            </h2>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
          {cards.map((c, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <TiltCard style={{ borderRadius: 24, overflow: "hidden", height: 440, cursor: "default" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${c.img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(to top,${C.navy}f7 50%,${C.navy}aa 78%,${C.navy}44)`,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 90,
                    height: 90,
                    background: `radial-gradient(circle at 100% 0%,${c.color}44,transparent 70%)`,
                  }}
                />
                <div
                  style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${c.color},transparent)` }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    padding: "28px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: `${c.color}22`,
                      border: `1px solid ${c.color}44`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: c.color }} />
                  </div>
                  <h3 className="fd" style={{ fontSize: 22, color: C.ivory, fontWeight: 500, marginBottom: 5 }}>
                    {c.title}
                  </h3>
                  <p style={{ color: c.color, fontSize: 12, marginBottom: 12, opacity: 0.9 }}>{c.ar}</p>
                  <p style={{ color: "rgba(245,243,239,.6)", fontSize: 13, lineHeight: 1.72 }}>{c.desc}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
