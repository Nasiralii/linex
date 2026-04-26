"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { C } from "../lib/constants";
import { Reveal } from "../ui";

export function CTASection() {
  const t = useTranslations("landing");
  const locale = useLocale();

  return (
    <section style={{ background: C.navy, padding: "100px 16px 80px", position: "relative", overflow: "hidden" }} className="cta-section">
      <style>{`
        @media (min-width: 768px) {
          .cta-section { padding: 120px 24px 100px !important; }
        }
        @media (min-width: 1024px) {
          .cta-section { padding: 140px 48px 120px !important; }
        }
      `}</style>
      <div
        style={{
          position: "absolute",
          top: -250,
          left: -250,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle,rgba(42,123,136,.15),transparent 65%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle,rgba(184,115,51,.12),transparent 65%)`,
          pointerEvents: "none",
        }}
      />
      {[200, 320, 440].map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: s,
            height: s,
            marginLeft: -s / 2,
            marginTop: -s / 2,
            border: `1px solid rgba(184,115,51,${0.18 - i * 0.04})`,
            borderRadius: "50%",
            animation: `${i % 2 === 0 ? "rotateSlow" : "rotateCCW"} ${30 + i * 15}s linear infinite`,
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
      ))}
      <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 10 }}>
        <Reveal>
          <div className="tag-pill" style={{ display: "inline-flex", marginBottom: 28 }}>
            <span
              style={{
                color: C.copper,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: ".18em",
                textTransform: "uppercase",
              }}
            >
              {t("cta.tag")}
            </span>
          </div>
          <h2
            className="fd"
            style={{
              fontSize: "clamp(2.5rem,5.5vw,5rem)",
              color: C.ivory,
              fontWeight: 300,
              lineHeight: 1.1,
              marginBottom: 24,
              letterSpacing: "-.02em",
            }}
          >
            {t("cta.title.line1")}
            <br />
            <em style={{ fontStyle: "italic" }} className="shimmer-text">
              {t("cta.title.highlight")}
            </em>
          </h2>
          <p style={{ color: "rgba(245,243,239,.6)", fontSize: 17, lineHeight: 1.75, maxWidth: 480, margin: "0 auto 56px" }}>
            {t("cta.description")}
          </p>
          <div style={{ display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
            <Link
              href={`/${locale}/login?register=true`}
              className="btn-primary"
              style={{ padding: "17px 52px", fontSize: 14, textDecoration: "none", display: "inline-block" }}
            >
              {t("cta.button1")}
            </Link>
            <Link
              href={`/${locale}/login?register=true&type=contractor`}
              className="btn-ghost"
              style={{ padding: "16px 52px", fontSize: 14, textDecoration: "none", display: "inline-block" }}
            >
              {t("cta.button2")}
            </Link>
          </div>
          <p style={{ color: "rgba(245,243,239,.25)", fontSize: 12, letterSpacing: ".08em" }}>{t("cta.footer")}</p>
        </Reveal>
      </div>
    </section>
  );
}
