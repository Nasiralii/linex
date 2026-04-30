"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { Mail, MapPin, Linkedin, Instagram, Facebook, Twitter } from "lucide-react";

const COMPANY_ADDRESS = "3286 al khaboob st, Al Malqa, Riyadh 13521";

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.8rem" }}>
              <img src="/logo.jpg" alt="Rasi" style={{ width: "40px", height: "40px" }} />
              <span style={{ fontSize: "2rem", fontWeight: 700, color: "white", lineHeight: 1 }}>
                {isRtl ? "راسي" : "Rasi"}
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.58)", lineHeight: 1.7, marginBottom: "1rem" }}>
              {tCommon("tagline")}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
              <a href="#" aria-label="LinkedIn" style={{ color: "rgba(255,255,255,0.6)" }}><Linkedin size={17} /></a>
              <a href="#" aria-label="X" style={{ color: "rgba(255,255,255,0.6)" }}><Twitter size={17} /></a>
              <a href="#" aria-label="Instagram" style={{ color: "rgba(255,255,255,0.6)" }}><Instagram size={17} /></a>
              <a href="#" aria-label="Facebook" style={{ color: "rgba(255,255,255,0.6)" }}><Facebook size={17} /></a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "0.78rem", fontWeight: 800, color: "rgba(255,255,255,0.78)", marginBottom: "0.9rem", textTransform: "uppercase", letterSpacing: "0.09em" }}>
              {isRtl ? "صفحات الموقع" : "Site Pages"}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              <Link href="/" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.78)", textDecoration: "none" }}>{t("homepage")}</Link>
              <Link href="/blog" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.78)", textDecoration: "none" }}>{isRtl ? "المدونة" : "Blog"}</Link>
              <Link href="/about" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.78)", textDecoration: "none" }}>{t("about")}</Link>
              <Link href="/how-it-works" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.78)", textDecoration: "none" }}>{t("howItWorks")}</Link>
              <Link href="/competitive-advantages" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.78)", textDecoration: "none" }}>{t("advantages")}</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "0.78rem", fontWeight: 800, color: "rgba(255,255,255,0.78)", marginBottom: "0.9rem", textTransform: "uppercase", letterSpacing: "0.09em" }}>
              {isRtl ? "الموارد" : "Resources"}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
              <Link href="/marketplace" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.78)", textDecoration: "none" }}>{isRtl ? "سوق المشاريع" : "Marketplace"}</Link>
              <Link href="/auth/register" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.78)", textDecoration: "none" }}>{isRtl ? "إنشاء حساب" : "Register"}</Link>
              <Link href="/verification-qualification" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.78)", textDecoration: "none" }}>{t("verification")}</Link>
              <Link href="/faq" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.78)", textDecoration: "none" }}>{t("faq")}</Link>
              <Link href="/partners" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.78)", textDecoration: "none" }}>{t("partners")}</Link>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "0.78rem", fontWeight: 800, color: "rgba(255,255,255,0.78)", marginBottom: "0.9rem", textTransform: "uppercase", letterSpacing: "0.09em" }}>
              {isRtl ? "اتصل بنا" : "Contact Us"}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", marginBottom: "0.7rem" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.72)" }}>
                <Mail style={{ width: "14px", height: "14px" }} /> info@rasi.sa
              </span>
              <span style={{ display: "flex", alignItems: "flex-start", gap: "0.45rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.4 }}>
                <MapPin style={{ width: "14px", height: "14px", marginTop: "0.1rem" }} /> {COMPANY_ADDRESS}
              </span>
            </div>
            <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.2)", marginBottom: "0.6rem" }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3621.6511406272916!2d46.61465517595099!3d24.807396547377802!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f099afbbf0687%3A0x92b1f4d667607e0a!2z2LTYsdmD2Kkg2LXYsdmI2K0g2KfZhNir2YLYqQ!5e0!3m2!1sen!2ssa!4v1777544970746!5m2!1sen!2ssa"
                width="100%"
                height="110"
                style={{ border: 0, display: "block" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Rasi footer map"
              />
            </div>
            <a
              href="https://maps.google.com/?q=24.807396547377802,46.61465517595099"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                width: "100%",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.35)",
                color: "rgba(255,255,255,0.9)",
                textDecoration: "none",
                borderRadius: "8px",
                padding: "0.45rem 0.7rem",
                fontSize: "0.78rem",
                fontWeight: 700,
              }}
            >
              {isRtl ? "الحصول على الاتجاهات" : "Get Directions"}
            </a>
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
          <div style={{ marginTop: "0.45rem", display: "inline-flex", alignItems: "center", gap: "0.7rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/terms-and-conditions" style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
              {isRtl ? "الشروط والأحكام" : "Terms & Conditions"}
            </Link>
            <span style={{ color: "rgba(255,255,255,0.28)" }}>|</span>
            <Link href="/privacy-policy" style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>
              {isRtl ? "سياسة الخصوصية" : "Privacy Policy"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}