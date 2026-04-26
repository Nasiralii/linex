"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { C } from "../lib/constants";

function FooterLink({ children, href = "#" }: { children: React.ReactNode; href?: string }) {
  const [h, setH] = useState(false);
  return (
    <Link
      href={href}
      style={{
        display: "block",
        fontSize: 13,
        marginBottom: 11,
        textDecoration: "none",
        color: h ? "rgba(245,243,239,.85)" : "rgba(245,243,239,.4)",
        transition: "color .2s, paddingLeft .2s",
        paddingLeft: h ? 6 : 0,
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
    >
      {children}
    </Link>
  );
}

export function Footer() {
  const t = useTranslations("landing");
  const locale = useLocale();

  const cols = [
    { title: t("footer.col1.title"), links: [t("footer.col1.link1"), t("footer.col1.link2"), t("footer.col1.link3"), t("footer.col1.link4"), t("footer.col1.link5")] },
    { title: t("footer.col2.title"), links: [t("footer.col2.link1"), t("footer.col2.link2"), t("footer.col2.link3"), t("footer.col2.link4"), t("footer.col2.link5")] },
    { title: t("footer.col3.title"), links: [t("footer.col3.link1"), t("footer.col3.link2"), t("footer.col3.link3"), t("footer.col3.link4"), t("footer.col3.link5")] },
  ];

  return (
    <footer style={{ background: "#0d1829", padding: "60px 16px 40px" }} className="footer-section">
      <style>{`
        @media (min-width: 768px) {
          .footer-section { padding: 72px 24px 44px !important; }
        }
        @media (min-width: 1024px) {
          .footer-section { padding: 88px 48px 44px !important; }
        }
      `}</style>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 40, marginBottom: 48 }} className="footer-grid">
          <style>{`
            @media (min-width: 768px) {
              .footer-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 48px !important; margin-bottom: 60px !important; }
            }
            @media (min-width: 1024px) {
              .footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr !important; gap: 64px !important; margin-bottom: 72px !important; }
            }
          `}</style>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <img src="../logo.jpg" alt="Rasi" style={{ width: 44, height: 44 }} />
              <div>
                <div style={{ color: C.ivory, fontWeight: 700, fontSize: 18 }}>
                  Rasi <span style={{ color: C.copper }}>{t("brand.arabic")}</span>
                </div>
                <div style={{ color: C.warmGrey, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" }}>
                  {t("brand.tagline")}
                </div>
              </div>
            </div>
            <p style={{ color: "rgba(245,243,239,.36)", fontSize: 14, lineHeight: 1.85, maxWidth: 280, marginBottom: 24 }}>
              {t("footer.description")}
            </p>
            <p style={{ color: "rgba(245,243,239,.22)", fontSize: 12, lineHeight: 1.8 }}>
              {t("footer.company")}
              <br />
              {t("footer.location")}
            </p>
          </div>
          {cols.map((col, i) => (
            <div key={i}>
              <h4 style={{ color: C.copper, fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", marginBottom: 22 }}>{col.title}</h4>
              {col.links.map((link, j) => (
                <FooterLink key={j} href={`/${locale}/login`}>
                  {link}
                </FooterLink>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ color: "rgba(245,243,239,.22)", fontSize: 12 }}>{t("footer.copyright", { year: 2026 })}</p>
          <p style={{ color: "rgba(245,243,239,.22)", fontSize: 12 }}>{t("footer.contact")}</p>
        </div>
      </div>
    </footer>
  );
}
