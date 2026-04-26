"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { C, IMGS } from "../lib/constants";
import { Reveal } from "../ui";

export function ParallaxQuote() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-80, 80]);
  const t = useTranslations("landing");

  return (
    <section ref={ref} style={{ height: 480, overflow: "hidden", position: "relative" }} className="parallax-section">
      <style>{`
        @media (min-width: 768px) {
          .parallax-section { height: 520px !important; }
        }
        @media (min-width: 1024px) {
          .parallax-section { height: 580px !important; }
        }
      `}</style>
      <motion.div style={{ y, position: "absolute", inset: "-15%" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${IMGS.parallax})`,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
          }}
        />
        <div
          style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg,rgba(27,42,74,.9),rgba(42,123,136,.7))` }}
        />
      </motion.div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          backgroundImage: `linear-gradient(rgba(184,115,51,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(184,115,51,.07) 1px,transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 5,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
          textAlign: "center",
        }}
        className="parallax-content"
      >
        <style>{`
          @media (min-width: 768px) {
            .parallax-content { padding: 0 48px !important; }
          }
        `}</style>
        <Reveal>
          <div className="fd quote-icon" style={{ fontSize: 80, color: C.copper, opacity: 0.22, lineHeight: 0.6, marginBottom: 8 }}>
            <style>{`
              @media (min-width: 768px) {
                .quote-icon { font-size: 120px !important; }
              }
            `}</style>
            &quot;
          </div>
          <blockquote
            className="fd"
            style={{
              fontSize: "clamp(1.5rem,3vw,2.5rem)",
              color: C.ivory,
              fontWeight: 300,
              lineHeight: 1.45,
              maxWidth: 840,
              fontStyle: "italic",
              marginBottom: 28,
            }}
          >
            {t("quote.text")}
          </blockquote>
          <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
            <div style={{ width: 40, height: 1, background: C.copper }} />
            <p style={{ color: C.copper, fontSize: 12, letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 600 }}>
              {t("quote.attribution")}
            </p>
            <div style={{ width: 40, height: 1, background: C.copper }} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
