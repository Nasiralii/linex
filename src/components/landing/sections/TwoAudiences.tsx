"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { C, IMGS } from "../lib/constants";
import { Reveal } from "../ui";

export function TwoAudiences() {
  const [hov, setHov] = useState<string | null>(null);
  const t = useTranslations("landing");
  const locale = useLocale();

  const cards = [
    {
      id: "owners",
      title: t("audiences.owners.title"),
      ar: t("audiences.owners.arabic"),
      img: IMGS.owners,
      accent: C.copper,
      cta: t("audiences.owners.cta"),
      headline: t("audiences.owners.headline"),
      desc: t("audiences.owners.desc"),
      items: [t("audiences.owners.item1"), t("audiences.owners.item2"), t("audiences.owners.item3"), t("audiences.owners.item4")],
      link: `/${locale}/login?register=true`,
    },
    {
      id: "pros",
      title: t("audiences.pros.title"),
      ar: t("audiences.pros.arabic"),
      img: IMGS.pros,
      accent: C.teal,
      cta: t("audiences.pros.cta"),
      headline: t("audiences.pros.headline"),
      desc: t("audiences.pros.desc"),
      items: [t("audiences.pros.item1"), t("audiences.pros.item2"), t("audiences.pros.item3"), t("audiences.pros.item4")],
      link: `/${locale}/login?register=true&type=contractor`,
    },
  ];

  return (
    <section id="owners" style={{ background: C.ivory, padding: "80px 16px 100px" }} className="audiences-section">
      <style>{`
        @media (min-width: 768px) {
          .audiences-section { padding: 100px 24px 120px !important; }
        }
        @media (min-width: 1024px) {
          .audiences-section { padding: 120px 48px 140px !important; }
          .audience-card { min-height: 600px !important; border-radius: 28px !important; }
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
                {t("audiences.tag")}
              </span>
            </div>
            <h2 className="fd" style={{ fontSize: "clamp(2.2rem,4.5vw,3.8rem)", color: C.navy, fontWeight: 300 }}>
              {t("audiences.title.line1")}
              <br />
              <em style={{ fontStyle: "italic" }} className="grad-text">
                {t("audiences.title.highlight")}
              </em>
            </h2>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }} className="audiences-grid">
          <style>{`
            @media (min-width: 1024px) {
              .audiences-grid { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }
            }
            @media (min-width: 768px) {
              .audiences-grid { grid-template-columns: 1fr 1fr; gap: 24px; }
            }
          `}</style>
          {cards.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.15}>
              <motion.div
                onHoverStart={() => setHov(c.id)}
                onHoverEnd={() => setHov(null)}
                animate={{ y: hov === c.id ? -8 : 0 }}
                style={{
                  borderRadius: 24,
                  overflow: "hidden",
                  position: "relative",
                  minHeight: 500,
                  cursor: "default",
                  boxShadow: hov === c.id ? `0 40px 80px rgba(0,0,0,.22)` : `0 8px 32px rgba(0,0,0,.1)`,
                  transition: "box-shadow .4s",
                }}
                className="audience-card"
              >
                {/* Image */}
                <motion.div
                  animate={{ scale: hov === c.id ? 1.06 : 1 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${c.img})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                {/* Overlays */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(to top,rgba(27,42,74,.97) 45%,rgba(27,42,74,.3) 80%,transparent)`,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 180,
                    height: 180,
                    background: `radial-gradient(circle at 0 0,${c.accent}33,transparent 70%)`,
                  }}
                />
                <div
                  style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${c.accent},transparent)` }}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    padding: "44px 44px 48px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                  }}
                >
                  <motion.div
                    animate={{ scale: hov === c.id ? 1.1 : 1 }}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      background: `${c.accent}22`,
                      border: `1.5px solid ${c.accent}55`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 24,
                    }}
                  >
                    {i === 0 ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth="1.5">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c.accent} strokeWidth="1.5">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M6 20v-2a6 6 0 0112 0v2" />
                      </svg>
                    )}
                  </motion.div>
                  <h3 className="fd" style={{ fontSize: "clamp(1.6rem,2.5vw,2.2rem)", color: C.ivory, fontWeight: 400, marginBottom: 6 }}>
                    {c.title}
                  </h3>
                  <p style={{ color: c.accent, fontSize: 13, marginBottom: 12, opacity: 0.9 }}>{c.ar}</p>
                  <p style={{ color: C.ivory, fontSize: 17, fontWeight: 500, lineHeight: 1.5, marginBottom: 12, maxWidth: 380 }}>
                    {c.headline}
                  </p>
                  <p style={{ color: "rgba(245,243,239,.65)", fontSize: 14, lineHeight: 1.75, marginBottom: 24, maxWidth: 380 }}>{c.desc}</p>
                  <ul style={{ listStyle: "none", marginBottom: 36 }}>
                    {c.items.map((item, j) => (
                      <motion.li
                        key={j}
                        initial={{ opacity: 0, x: -10 }}
                        animate={hov === c.id ? { opacity: 1, x: 0 } : { opacity: 0.7, x: 0 }}
                        transition={{ delay: j * 0.06 }}
                        style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(245,243,239,.8)", fontSize: 14, marginBottom: 9 }}
                      >
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: c.accent, flexShrink: 0 }} />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                  <Link
                    href={c.link}
                    className="btn-primary"
                    style={{ width: "fit-content", background: `linear-gradient(135deg,${c.accent},${c.accent}cc)`, textDecoration: "none" }}
                  >
                    {c.cta}
                  </Link>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
