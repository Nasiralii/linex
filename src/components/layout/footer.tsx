"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Mail, MapPin } from "lucide-react";
import { PUBLIC_CONTENT_PAGES } from "@/lib/content-pages";

export function Footer() {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const year = new Date().getFullYear();

  return (
    <footer style={{
      background: "#1a2332",
      borderTop: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div className="container-app !px-2 md:!px-4" style={{ padding: "3rem 0" }}>
        <div className="grid md:grid-cols-3 grid-cols-2 gap-4">
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <img src="/logo.jpg" alt="Rasi" style={{ width: "36px", height: "36px" }} />
              <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "white" }}>
                {isRtl ? "راسي" : "Rasi"}
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", maxWidth: "320px", lineHeight: 1.7, marginBottom: "1rem" }}>
              {tCommon("tagline")}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)" }}>
                <Mail style={{ width: "14px", height: "14px" }} /> info@rasi.sa
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "rgba(255,255,255,0.4)" }}>
                <MapPin style={{ width: "14px", height: "14px" }} /> {isRtl ? "المملكة العربية السعودية" : "Saudi Arabia"}
              </span>
            </div>
          </div>

          {/* Content Links */}
          <div>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {isRtl ? "صفحات الموقع" : "Site Pages"}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <Link href="/" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color 150ms ease" }}>
                {t("homepage")}
              </Link>
              <Link href="/blog" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color 150ms ease" }}>
                {isRtl ? "المدونة" : "Blog"}
              </Link>
              {PUBLIC_CONTENT_PAGES.map((page) => (
                <Link key={page.key} href={`/${page.slug}` as never} style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color 150ms ease" }}>
                  {page.key === "about-us" ? t("about") :
                    page.key === "services" ? t("services") :
                    page.key === "for-project-owners" ? t("owners") :
                    page.key === "for-contractors-engineers" ? t("contractors") :
                    page.key === "how-it-works" ? t("howItWorks") :
                    page.key === "competitive-advantages" ? t("advantages") :
                    page.key === "verification-qualification" ? t("verification") :
                    page.key === "faq" ? t("faq") :
                    page.key === "partners" ? t("partners") :
                    t("contact")}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "rgba(255,255,255,0.8)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t("contact")}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <Link href="/marketplace" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
                {isRtl ? "سوق المشاريع" : "Marketplace"}
              </Link>
              <Link href="/auth/register" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
                {isRtl ? "إنشاء حساب" : "Register"}
              </Link>
              <Link href="/terms-and-conditions" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
                {isRtl ? "الشروط والأحكام" : "Terms & Conditions"}
              </Link>
              <Link href="/privacy-policy" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>
                {isRtl ? "سياسة الخصوصية" : "Privacy Policy"}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          marginTop: "2.5rem", paddingTop: "1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          textAlign: "center",
        }}>
          <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>
            {t("copyright", { year: year.toString() })}
          </p>
        </div>
      </div>
    </footer>
  );
}