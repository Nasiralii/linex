"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { useState } from "react";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "440px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <img src="/logo.jpg" alt="Rasi" style={{ width: "56px", height: "56px", borderRadius: "var(--radius-2xl)", margin: "0 auto 1rem", boxShadow: "0 4px 14px rgba(42, 123, 136, 0.3)" }} />
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
          {t("title")}
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)" }}>{t("subtitle")}</p>
      </div>

      <div className="card" style={{ padding: "2rem" }}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <CheckCircle style={{ width: "48px", height: "48px", color: "var(--success)", margin: "0 auto 1rem" }} />
            <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              {t("success")}
            </p>
            <Link href="/auth/login" style={{ fontWeight: 600, color: "var(--primary)" }}>
              {t("backToLogin")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="email">{t("email")}</label>
              <input id="email" name="email" type="email" required dir="ltr"
                placeholder="email@example.com" style={{ textAlign: isRtl ? "right" : "left" }} />
            </div>
            <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.875rem", fontSize: "0.9375rem" }}>
              <Mail style={{ width: "18px", height: "18px" }} /> {t("submitButton")}
            </button>
            <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
              <Link href="/auth/login" style={{ fontWeight: 600, color: "var(--primary)" }}>
                {t("backToLogin")}
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
