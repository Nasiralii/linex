"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { loginAction } from "../actions";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === "ar";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/me", { credentials: "same-origin" })
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (cancelled || !data?.role) return;
        const redirectTo = data.role === "ADMIN" ? "/admin" : "/dashboard";
        window.location.replace(`/${locale}${redirectTo}`);
      })
      .catch(() => {
        // stay on login page if auth check fails
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (result.success && result.redirectTo) {
        window.location.href = `/${locale}${result.redirectTo}`;
      } else {
        setError(result.error || (isRtl ? "البريد الإلكتروني أو كلمة المرور غير صحيحة" : "Invalid email or password"));
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(isRtl ? "خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً." : "Server connection error. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: "440px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <img src="/logo.jpg" alt="Rasi" style={{ width: "56px", height: "56px", borderRadius: "var(--radius-2xl)", margin: "0 auto 1rem", boxShadow: "0 4px 14px rgba(42, 123, 136, 0.3)" }} />
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
          {t("title")}
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)" }}>{t("subtitle")}</p>
      </div>

      {/* Card */}
      <div className="card" style={{ padding: "2rem" }}>
        <form onSubmit={handleSubmit}>

          {error && (
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem",
              borderRadius: "var(--radius-lg)", marginBottom: "1.5rem",
              background: "var(--error-light)", color: "var(--error)", fontSize: "0.875rem",
            }}>
              <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="email">{t("email")}</label>
            <input id="email" name="email" type="email" required dir="ltr" autoComplete="email"
              placeholder="email@example.com" style={{ textAlign: isRtl ? "right" : "left" }} />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
              <label htmlFor="password" style={{ marginBottom: 0 }}>{t("password")}</label>
              <Link href="/auth/forgot-password" style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--primary)" }}>
                {t("forgotPassword")}
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input id="password" name="password" type={showPassword ? "text" : "password"}
                required dir="ltr" autoComplete="current-password" placeholder="••••••••"
                style={{ paddingInlineEnd: "3rem", textAlign: isRtl ? "right" : "left" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", top: "50%", transform: "translateY(-50%)",
                  [isRtl ? "left" : "right"]: "12px",
                  background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px",
                }}>
                {showPassword ? <EyeOff style={{ width: "18px", height: "18px" }} /> : <Eye style={{ width: "18px", height: "18px" }} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn-primary"
            style={{ width: "100%", padding: "0.875rem", fontSize: "0.9375rem" }}>
            {loading ? (
              <><Loader2 className="animate-spin" style={{ width: "18px", height: "18px" }} /> {tCommon("loading")}</>
            ) : t("submitButton")}
          </button>

          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            {t("noAccount")}{" "}
            <Link href="/auth/register" style={{ fontWeight: 600, color: "var(--primary)" }}>
              {t("registerLink")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
