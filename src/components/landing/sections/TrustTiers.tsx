"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { C } from "../lib/constants";
import { Reveal } from "../ui";

export function TrustTiers() {
  const [active, setActive] = useState(1);
  const t = useTranslations("landing");

  const tiers = [
    {
      n: "01",
      name: t("trustTiers.tier1.name"),
      ar: t("trustTiers.tier1.arabic"),
      color: C.warmGrey,
      desc: t("trustTiers.tier1.desc"),
      perks: [t("trustTiers.tier1.perk1"), t("trustTiers.tier1.perk2"), t("trustTiers.tier1.perk3")],
    },
    {
      n: "02",
      name: t("trustTiers.tier2.name"),
      ar: t("trustTiers.tier2.arabic"),
      color: C.teal,
      desc: t("trustTiers.tier2.desc"),
      perks: [t("trustTiers.tier2.perk1"), t("trustTiers.tier2.perk2"), t("trustTiers.tier2.perk3")],
    },
    {
      n: "03",
      name: t("trustTiers.tier3.name"),
      ar: t("trustTiers.tier3.arabic"),
      color: C.copper,
      desc: t("trustTiers.tier3.desc"),
      perks: [t("trustTiers.tier3.perk1"), t("trustTiers.tier3.perk2"), t("trustTiers.tier3.perk3")],
    },
    {
      n: "04",
      name: t("trustTiers.tier4.name"),
      ar: t("trustTiers.tier4.arabic"),
      color: C.gold,
      desc: t("trustTiers.tier4.desc"),
      perks: [t("trustTiers.tier4.perk1"), t("trustTiers.tier4.perk2"), t("trustTiers.tier4.perk3")],
    },
  ];

  const reviewItems = [
    t("trustTiers.review1"),
    t("trustTiers.review2"),
    t("trustTiers.review3"),
    t("trustTiers.review4"),
  ];

  return (
   <section style={{ background:C.charcoal,padding:"140px 52px 180px",position:"relative",overflow:"hidden" }}>
      <style>{`
        @media (min-width: 768px) {
          .trust-tiers-section { padding: 100px 24px 120px !important; }
        }
        @media (min-width: 1024px) {
          .trust-tiers-section { padding: 130px 48px 160px !important; }
        }
        @media (max-width: 1024px) {
          .tiers-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .sticky-content { position: relative !important; top: 0 !important; }
        }
      `}</style>
      {/* huge bg text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          fontFamily: "Cormorant Garamond,serif",
          fontSize: "22vw",
          fontWeight: 300,
          color: "rgba(255,255,255,.02)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          userSelect: "none",
          letterSpacing: "-.05em",
        }}
      >
        RASI
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 80, alignItems: "start" }} className="tiers-grid">
          <div style={{ position: "sticky", top: 120 }} className="sticky-content">
            <Reveal>
              <div className="tag-pill" style={{ display: "inline-flex", marginBottom: 24 }}>
                <span
                  style={{
                    color: C.copper,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: ".18em",
                    textTransform: "uppercase",
                  }}
                >
                  {t("trustTiers.tag")}
                </span>
              </div>
              <h2
                className="fd"
                style={{
                  fontSize: "clamp(2rem,4vw,3.4rem)",
                  color: C.ivory,
                  fontWeight: 300,
                  lineHeight: 1.2,
                  marginBottom: 24,
                }}
              >
                {t("trustTiers.title.line1")}
                <br />
                <em style={{ fontStyle: "italic", color: C.copper }}>{t("trustTiers.title.highlight")}</em>
              </h2>
              <p style={{ color: "rgba(245,243,239,.52)", lineHeight: 1.82, fontSize: 15, marginBottom: 40 }}>
                {t("trustTiers.description")}
              </p>
              <div
                style={{
                  background: "rgba(245,243,239,.04)",
                  border: "1px solid rgba(245,243,239,.08)",
                  borderRadius: 20,
                  padding: "28px",
                }}
              >
                <p style={{ color: C.copper, fontSize: 11, letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 16 }}>
                  {t("trustTiers.reviewTitle")}
                </p>
                {reviewItems.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        background: `${C.teal}22`,
                        border: `1px solid ${C.teal}44`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span style={{ color: "rgba(245,243,239,.58)", fontSize: 13, lineHeight: 1.65 }}>{r}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {tiers.map((t, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <motion.div
                  onClick={() => setActive(i)}
                  whileHover={{ x: 6 }}
                  style={{
                    borderRadius: 20,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: `1px solid ${active === i ? t.color + "55" : "rgba(255,255,255,.06)"}`,
                    background: active === i ? `linear-gradient(135deg,rgba(27,42,74,.6),rgba(27,42,74,.3))` : "rgba(255,255,255,.03)",
                    transition: "all .3s",
                  }}
                >
                  <div
                    style={{
                      height: 3,
                      background: active === i ? `linear-gradient(90deg,${t.color},${t.color}33)` : "transparent",
                      transition: "background .3s",
                    }}
                  />
                  <div style={{ padding: "24px 28px", display: "flex", gap: 20, alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        flexShrink: 0,
                        background: active === i ? `${t.color}22` : "rgba(255,255,255,.05)",
                        border: `1.5px solid ${active === i ? t.color + "55" : "rgba(255,255,255,.08)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all .3s",
                      }}
                    >
                      <span className="fd" style={{ color: active === i ? t.color : C.warmGrey, fontSize: 20, fontWeight: 600 }}>
                        {t.n}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 6 }}>
                        <span style={{ color: C.ivory, fontWeight: 600, fontSize: 17 }}>{t.name}</span>
                        <span style={{ color: t.color, fontSize: 13, opacity: 0.8 }}>— {t.ar}</span>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.color, marginLeft: "auto" }} />
                      </div>
                      <p style={{ color: "rgba(245,243,239,.5)", fontSize: 13, lineHeight: 1.65, marginBottom: active === i ? 16 : 0 }}>
                        {t.desc}
                      </p>
                      <AnimatePresence>
                        {active === i && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            style={{ overflow: "hidden" }}
                          >
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 4 }}>
                              {t.perks.map((p, j) => (
                                <span
                                  key={j}
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    letterSpacing: ".1em",
                                    textTransform: "uppercase",
                                    padding: "5px 14px",
                                    borderRadius: 60,
                                    background: `${t.color}18`,
                                    color: t.color,
                                    border: `1px solid ${t.color}33`,
                                  }}
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: "100%", height: 80 }}>
          <path d="M0,0 L1440,80 L0,80 Z" fill={C.ivory} />
        </svg>
      </div>
    </section>
  );
}
