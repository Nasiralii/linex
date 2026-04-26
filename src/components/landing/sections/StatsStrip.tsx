"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { C } from "../lib/constants";
import { Reveal, Counter } from "../ui";

export function StatsStrip() {
  const t = useTranslations("landing");

  const stats = [
    { n: 500, s: "+", label: t("stats.projects"), icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg> },
    { n: 200, s: "+", label: t("stats.pros"), icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
    { n: 1200, s: "+", label: t("stats.bids"), icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { n: 350, s: "+", label: t("stats.awards"), icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> },
  ];

  return (
    <section style={{ background: C.ivory, padding: "0 52px 80px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, borderRadius: 28, overflow: "hidden", boxShadow: "0 24px 80px rgba(17,27,46,.1)" }}>
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <motion.div whileHover={{ y: -4 }} style={{
                padding: "44px 36px",
                background: i % 2 === 0 ? "#fff" : C.navyMid,
                position: "relative", overflow: "hidden",
                borderRight: i < 3 ? `1px solid ${i % 2 === 0 ? "rgba(17,27,46,.06)" : "rgba(255,255,255,.06)"}` : "none",
                transition: "transform .3s",
              }}>
                {/* BG number watermark */}
                <div style={{
                  position: "absolute", bottom: -24, right: -8,
                  fontFamily: "Cormorant Garamond,serif", fontSize: 110, fontWeight: 300, lineHeight: 1,
                  color: i % 2 === 0 ? "rgba(17,27,46,.035)" : "rgba(184,115,51,.07)",
                  pointerEvents: "none", userSelect: "none",
                }}>{s.n}</div>

                <div style={{ color: i % 2 === 0 ? C.copper : "rgba(184,115,51,.8)", marginBottom: 18 }}>{s.icon}</div>
                <div className="fd" style={{ fontSize: "clamp(2.4rem,4.5vw,3.6rem)", fontWeight: 300, lineHeight: 1, color: C.copper, marginBottom: 10 }}>
                  <Counter target={s.n} suffix={s.s} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: ".14em", textTransform: "uppercase", color: i % 2 === 0 ? C.warmGrey : "rgba(246,243,238,.45)" }}>
                  {s.label}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
