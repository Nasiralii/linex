"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { C, IMGS } from "../lib/constants";

export function Hero() {
  const [idx, setIdx] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const { scrollY } = useScroll();
  const yPar = useTransform(scrollY, [0, 700], [0, 180]);
  const fade = useTransform(scrollY, [0, 500], [1, 0]);
  const yScale = useTransform(scrollY, [0, 500], [1, 1.06]);
  const t = useTranslations("landing");
  const locale = useLocale();

  useEffect(() => {
    const t = setInterval(() => {
      setPrev(idx);
      setIdx((i) => (i + 1) % IMGS.hero.length);
    }, 6000);
    return () => clearInterval(t);
  }, [idx]);

  const words = [t("hero.word1"), t("hero.word2"), t("hero.word3")];
  const [wIdx, setWIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setWIdx((i) => (i + 1) % words.length), 2800);
    return () => clearInterval(t);
  }, [words.length, t]);

  return (
    <section style={{ position: "relative", height: "100vh", minHeight: "100dvh", overflow: "hidden", background: C.navy }}>
      {/* Prev slide fades out */}
      <AnimatePresence>
        {prev !== null && (
          <motion.div
            key={`prev-${prev}`}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              backgroundImage: `url(${IMGS.hero[prev]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
      </AnimatePresence>

      {/* Current slide scales in */}
      <motion.div
        key={`curr-${idx}`}
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
        style={{ position: "absolute", inset: 0, zIndex: 2 }}
      >
        <motion.div style={{ y: yPar, scale: yScale, position: "absolute", inset: "-15%" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${IMGS.hero[idx]})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </motion.div>
      </motion.div>

      {/* Gradient layers */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          background: `linear-gradient(112deg,rgba(27,42,74,.93) 0%,rgba(27,42,74,.5) 55%,rgba(42,123,136,.25) 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          background: `radial-gradient(ellipse at 80% 50%,rgba(184,115,51,.09),transparent 60%)`,
        }}
      />

      {/* Grid lines */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 4,
          opacity: 0.05,
          backgroundImage: `linear-gradient(rgba(184,115,51,1) 1px,transparent 1px),linear-gradient(90deg,rgba(184,115,51,1) 1px,transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Orbit rings - hidden on mobile */}
      {[
        { s: 560, op: 0.1, dur: 55 },
        { s: 360, op: 0.07, dur: 38, ccw: true },
        { s: 200, op: 0.15, dur: 24 },
      ].map((r, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            right: "6%",
            width: r.s,
            height: r.s,
            marginTop: -r.s / 2,
            border: `1px solid rgba(184,115,51,${r.op})`,
            borderRadius: "50%",
            animation: `${r.ccw ? "rotateCCW" : "rotateSlow"} ${r.dur}s linear infinite`,
            zIndex: 4,
            pointerEvents: "none",
          }}
          className="orbit-ring"
        >
          <style>{`
            @media (max-width: 768px) {
              .orbit-ring { display: none !important; }
            }
          `}</style>
        </div>
      ))}

      {/* Floating dot grid - hidden on mobile */}
      <div style={{ position: "absolute", bottom: "18%", right: "10%", zIndex: 5, opacity: 0.3 }} className="dot-grid">
        <style>{`
          @media (max-width: 768px) {
            .dot-grid { display: none !important; }
          }
        `}</style>
        {Array.from({ length: 5 }).map((_, row) => (
          <div key={row} style={{ display: "flex", gap: 14, marginBottom: 14 }}>
            {Array.from({ length: 5 }).map((_, col) => (
              <div
                key={col}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: C.copper,
                  animation: `floatY ${2 + (row + col) * 0.2}s ease-in-out infinite`,
                  animationDelay: `${(row + col) * 0.15}s`,
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity: fade, position: "relative", zIndex: 10, height: "100%", display: "flex", alignItems: "center" }}
      >
        <div style={{ maxWidth: 1340, margin: "0 auto", padding: "0 24px", width: "100%" }}>
          <style>{`
            @media (min-width: 768px) {
              .hero-content { padding: 0 48px; }
            }
          `}</style>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9 }}
            style={{ marginBottom: 20 }}
          >
            <div className="tag-pill">
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ width: 7, height: 7, borderRadius: "50%", background: C.copper }}
              />
              <span
                style={{
                  color: C.copper,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                }}
              >
                {t("hero.tagline")}
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <div style={{ overflow: "hidden", marginBottom: 4 }}>
            <motion.h1
              className="fd"
              initial={{ y: 120 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.3, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: "clamp(2rem,5vw,5rem)",
                fontWeight: 300,
                color: C.ivory,
                lineHeight: 1.1,
                letterSpacing: "-.02em",
              }}
            >
              {t("hero.title.line1")}
              <br />
              {t("hero.title.line2")}{" "}
            </motion.h1>
          </div>

          {/* Word swap */}
          <div
            style={{ overflow: "hidden", marginBottom: 20, height: "auto", minHeight: "clamp(2.5rem,6vw,4rem)", display: "flex", alignItems: "center" }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={wIdx}
                className="fd shimmer-text"
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -80, opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: "clamp(1.8rem,4.5vw,4rem)",
                  fontWeight: 300,
                  fontStyle: "italic",
                  display: "block",
                }}
              >
                {words[wIdx]}
              </motion.span>
            </AnimatePresence>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.9 }}
            style={{
              fontSize: "clamp(.9rem,1.3vw,1.1rem)",
              color: C.ivoryDim,
              fontWeight: 300,
              lineHeight: 1.7,
              maxWidth: 520,
              marginBottom: 32,
            }}
          >
            {t("hero.description")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start", width: "100%" }}
          >
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", width: "100%" }}>
              <Link
                href="/auth/register"
                className="btn-primary"
                style={{ fontSize: 13, padding: "16px 46px", textDecoration: "none", display: "inline-block" }}
              >
                {t("hero.cta.postProject")}
              </Link>
              <Link
                href="/auth/register"
                className="btn-ghost"
                style={{ fontSize: 13, padding: "15px 46px", textDecoration: "none", display: "inline-block" }}
              >
                {t("hero.cta.joinPro")}
              </Link>
            </div>
            <p style={{ color: "rgba(245,243,239,.5)", fontSize: 12, marginTop: 8 }}>
              {t("hero.microcopy")}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Slide dots */}
      <div style={{ position: "absolute", bottom: 48, left: "50%", transform: "translateX(-50%)", zIndex: 20, display: "flex", gap: 8 }}>
        {IMGS.hero.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => {
              setPrev(idx);
              setIdx(i);
            }}
            animate={{ width: i === idx ? 36 : 8, background: i === idx ? C.copper : "rgba(255,255,255,.3)" }}
            style={{ height: 8, borderRadius: 4, border: "none", cursor: "pointer" }}
          />
        ))}
      </div>

      {/* Wave */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ width: "100%", height: 100 }}>
          <path d="M0,100 L0,60 Q180,20 360,50 Q540,80 720,45 Q900,10 1080,50 Q1260,90 1440,55 L1440,100 Z" fill={C.ivory} />
        </svg>
      </div>
    </section>
  );
}
