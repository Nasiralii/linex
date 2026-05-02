"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { registerAction } from "../actions";
import { sanitizeSaudiPhoneInput, transliterateArabic } from "@/lib/utils";
import { HardHat, Eye, EyeOff, Loader2, AlertCircle, Compass, Home } from "lucide-react";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [selectedRole, setSelectedRole] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        // stay on register page if auth check fails
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    formData.set("role", selectedRole);
    
    // Handle Arabic name transliteration
    const fullName = formData.get("fullName") as string;
    if (fullName && /[\u0600-\u06FF]/.test(fullName)) {
      // If the name contains Arabic characters, store the Arabic name and transliterate for the base field
      formData.set("fullNameAr", fullName);
      formData.set("fullName", transliterateArabic(fullName));
    }
    
    const result = await registerAction(formData);
    if (result.success && result.redirectTo) {
      // Full page navigation with `/${locale}${path}` (matches login page): ensures next-intl
      // locale prefix and a fresh request with the new session cookie after register.
      window.location.href = `/${locale}${result.redirectTo}`;
    } else {
      setError(result.error || "An error occurred");
      setLoading(false);
    }
  };

  const roles = [
    { id: "OWNER", icon: Home, label: isRtl ? "مالك مشروع" : "Project Owner", desc: isRtl ? "أبحث عن مقاولين ومهندسين لمشاريعي" : "I'm looking for contractors and engineers" },
    { id: "CONTRACTOR", icon: HardHat, label: isRtl ? "مقاول / مورد" : "Contractor / Supplier", desc: isRtl ? "أبحث عن فرص مشاريع إنشائية" : "I'm looking for construction projects" },
    { id: "ENGINEER", icon: Compass, label: isRtl ? "مهندس" : "Engineer", desc: isRtl ? "مصمم أو مشرف هندسي" : "Designer or Supervisor engineer" },
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: "520px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <img src="/logo.jpg" alt="Rasi" style={{ width: "56px", height: "56px", borderRadius: "var(--radius-2xl)", margin: "0 auto 1rem", boxShadow: "0 4px 14px rgba(42, 123, 136, 0.3)" }} />
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
          {t("title")}
        </h1>
        <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)" }}>{t("subtitle")}</p>
      </div>

      <div className="card" style={{ padding: "2rem" }}>
        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)", marginBottom: "1.5rem", background: "var(--error-light)", color: "var(--error)", fontSize: "0.875rem" }}>
              <AlertCircle style={{ width: "16px", height: "16px", flexShrink: 0 }} /> <span>{error}</span>
            </div>
          )}

          {/* Role Selection — 3 cards */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label>{t("role")} <span style={{ color: "var(--error)" }}>*</span></label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.625rem", marginTop: "0.25rem" }}>
              {roles.map((role) => {
                const isSelected = selectedRole === role.id;
                return (
                  <button key={role.id} type="button" onClick={() => setSelectedRole(role.id)} style={{
                    padding: "1rem 0.75rem", borderRadius: "var(--radius-xl)",
                    border: isSelected ? "2px solid var(--primary)" : "2px solid var(--border-light)",
                    background: isSelected ? "var(--primary-light)" : "var(--surface)",
                    cursor: "pointer", textAlign: "center", transition: "all 200ms ease", fontFamily: "inherit", position: "relative",
                  }}>
                    {isSelected && <div style={{ position: "absolute", top: "-6px", left: "50%", transform: "translateX(-50%)", width: "12px", height: "12px", borderRadius: "50%", background: "var(--primary)", border: "2px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />}
                    <role.icon style={{ width: "28px", height: "28px", margin: "0 auto 0.5rem", color: isSelected ? "var(--primary)" : "var(--text-muted)" }} />
                    <div style={{ fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.25rem", color: isSelected ? "var(--primary)" : "var(--text)" }}>{role.label}</div>
                    <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", lineHeight: 1.3 }}>{role.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* G4: Owner type — Individual vs Company (only for OWNER role) */}
          {selectedRole === "OWNER" && (
            <div style={{ marginBottom: "1.25rem" }}>
              <label>{isRtl ? "نوع الحساب" : "Account Type"} <span style={{ color: "var(--error)" }}>*</span></label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.25rem" }}>
                {[
                  { id: "individual", label: isRtl ? "فرد" : "Individual", icon: "👤" },
                  { id: "company", label: isRtl ? "شركة" : "Company", icon: "🏢" },
                ].map(ot => (
                  <label key={ot.id} style={{
                    display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem",
                    borderRadius: "var(--radius-lg)", cursor: "pointer", fontFamily: "inherit",
                    border: "2px solid var(--border-light)", background: "var(--surface)",
                    fontSize: "0.875rem", fontWeight: 600,
                  }}>
                    <input type="radio" name="ownerType" value={ot.id} defaultChecked={ot.id === "individual"} style={{ accentColor: "var(--primary)" }} />
                    <span>{ot.icon}</span> {ot.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {selectedRole === "OWNER" && (
            <div style={{ marginBottom: "1.25rem" }}>
              <label htmlFor="ownerProjectPreferences">{isRtl ? "تفضيلات المشاريع" : "Project Preferences"}</label>
              <textarea
                id="ownerProjectPreferences"
                name="ownerProjectPreferences"
                placeholder={isRtl ? "مثال: أفضل مشاريع الفلل السكنية، التشطيبات الراقية، أو مشاريع التصميم والتنفيذ" : "e.g. residential villas, premium finishing, or design-build projects"}
                style={{ minHeight: "90px", resize: "vertical" }}
              />
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {isRtl ? "اختياري، لكنه يساعدنا على تهيئة حساب مالك المشروع بشكل أفضل من البداية." : "Optional, but helps tailor the project-owner account from the start."}
              </div>
            </div>
          )}

          {selectedRole === "ENGINEER" && (
            <div style={{ marginBottom: "1.25rem" }}>
              <label>{isRtl ? "التخصص" : "Specialization"} <span style={{ color: "var(--error)" }}>*</span></label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))", gap: "0.5rem", marginTop: "0.25rem" }}>
                {[
                  { id: "DESIGNER", label: isRtl ? "مصمم" : "Designer", icon: "✏️" },
                  { id: "SUPERVISOR", label: isRtl ? "مشرف" : "Supervisor", icon: "🔍" },
                  { id: "BOTH", label: isRtl ? "كلاهما" : "Both", icon: "⭐" },
                ].map(spec => (
                  <label key={spec.id} style={{
                    display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem",
                    borderRadius: "var(--radius-lg)", cursor: "pointer", fontFamily: "inherit",
                    border: "2px solid var(--border-light)", background: "var(--surface)",
                    fontSize: "0.875rem", fontWeight: 600,
                  }}>
                    <input type="radio" name="specialization" value={spec.id} defaultChecked={spec.id === "DESIGNER"} style={{ accentColor: "var(--primary)" }} />
                    <span>{spec.icon}</span> {spec.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Full Name */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="fullName">{selectedRole === "CONTRACTOR" ? (isRtl ? "الاسم الرسمي للشركة / المؤسسة" : "Official Company / Establishment Name") : t("fullName")} <span style={{ color: "var(--error)" }}>*</span></label>
            <input id="fullName" name="fullName" type="text" required placeholder={selectedRole === "CONTRACTOR" ? (isRtl ? "أدخل الاسم الرسمي كما في السجل التجاري" : "Enter the official name as per commercial registration") : (isRtl ? "أدخل اسمك الكامل" : "Enter your full name")} />
            {isRtl && (
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {tCommon("arabicNameSupport")}
              </div>
            )}
            {selectedRole === "CONTRACTOR" && (
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {isRtl ? "يجب أن يكون الحساب باسم شركة أو مؤسسة رسمية." : "Contractor accounts must belong to an official company or establishment."}
              </div>
            )}
          </div>

          {selectedRole === "CONTRACTOR" && (
            <div style={{ marginBottom: "1.25rem" }}>
              <label htmlFor="companyCr">{isRtl ? "رقم السجل التجاري" : "Commercial Registration Number"} <span style={{ color: "var(--error)" }}>*</span></label>
              <input id="companyCr" name="companyCr" type="text" required dir="ltr" placeholder={isRtl ? "مثال: 1010XXXXXX" : "e.g. 1010XXXXXX"} />
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {isRtl ? "سيُستخدم لاحقاً في الربط مع API التحقق والمطابقة." : "This will be used later for verification and API matching."}
              </div>
            </div>
          )}

          {selectedRole !== "CONTRACTOR" && (
            <div style={{ marginBottom: "1.25rem" }}>
              <label htmlFor="publicName">{isRtl ? "الاسم الظاهر للمستخدمين" : "Public Display Name"}</label>
              <input id="publicName" name="publicName" type="text" placeholder={isRtl ? "اسم مختصر يظهر للآخرين" : "Short name visible to others"} />
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {isRtl ? "إذا تُرك فارغاً سيتم استخدام الاسم الأساسي مؤقتاً." : "If left empty, the main name will be used temporarily."}
              </div>
            </div>
          )}

          {(selectedRole === "CONTRACTOR" || selectedRole === "ENGINEER") && (
            <div style={{ marginBottom: "1.25rem" }}>
              <label htmlFor="website">{isRtl ? "الموقع الإلكتروني" : "Website"}</label>
              <input id="website" name="website" type="url" dir="ltr" placeholder="https://example.com" style={{ textAlign: isRtl ? "right" : "left" }} />
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                {isRtl ? "اختياري الآن لكنه يساعد في رفع تقييم الملف الشخصي لاحقاً." : "Optional now, but it helps improve profile score later."}
              </div>
            </div>
          )}

          {/* Gap 12: Phone Number (mandatory) */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="phone">{isRtl ? "رقم الجوال" : "Phone Number"} <span style={{ color: "var(--error)" }}>*</span></label>
            <input id="phone" name="phone" type="tel" required dir="ltr" placeholder="05XXXXXXXX" style={{ textAlign: isRtl ? "right" : "left" }} onChange={(e) => { e.currentTarget.value = sanitizeSaudiPhoneInput(e.currentTarget.value); }} />
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
              {isRtl ? "رقم سعودي فقط وبأرقام إنجليزية." : "Saudi mobile only, using English digits."}
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="email">{t("email")} <span style={{ color: "var(--error)" }}>*</span></label>
            <input id="email" name="email" type="email" required dir="ltr" placeholder="email@example.com" style={{ textAlign: isRtl ? "right" : "left" }} />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="password">{t("password")} <span style={{ color: "var(--error)" }}>*</span></label>
            <div style={{ position: "relative" }}>
              <input id="password" name="password" type={showPassword ? "text" : "password"} required dir="ltr" placeholder="••••••••" style={{ paddingInlineEnd: "3rem", textAlign: isRtl ? "right" : "left" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRtl ? "left" : "right"]: "12px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}>
                {showPassword ? <EyeOff style={{ width: "18px", height: "18px" }} /> : <Eye style={{ width: "18px", height: "18px" }} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "1.75rem" }}>
            <label htmlFor="confirmPassword">{t("confirmPassword")} <span style={{ color: "var(--error)" }}>*</span></label>
            <div style={{ position: "relative" }}>
              <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} required dir="ltr" placeholder="••••••••" style={{ paddingInlineEnd: "3rem", textAlign: isRtl ? "right" : "left" }} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRtl ? "left" : "right"]: "12px", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}>
                {showConfirmPassword ? <EyeOff style={{ width: "18px", height: "18px" }} /> : <Eye style={{ width: "18px", height: "18px" }} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading || !selectedRole} className="btn-primary" style={{ width: "100%", padding: "0.875rem", fontSize: "0.9375rem" }}>
            {loading ? <><Loader2 className="animate-spin" style={{ width: "18px", height: "18px" }} /> {tCommon("loading")}</> : t("submitButton")}
          </button>

          <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            {t("hasAccount")}{" "}
            <Link href="/auth/login" style={{ fontWeight: 600, color: "var(--primary)" }}>
              {t("loginLink")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
