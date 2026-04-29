import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Scale, Shield, AlertTriangle, FileText, ChevronRight } from "lucide-react";

const CLAUSE_ICONS: Record<number, string> = {
  1: "📘", 2: "✅", 3: "🔒", 4: "👤", 5: "📋",
  6: "🎖️", 7: "📁", 8: "💳", 9: "🚫", 10: "©️",
  11: "📤", 12: "⛔", 13: "🔐", 14: "⚠️", 15: "📉",
  16: "🛡️", 17: "🌪️", 18: "⚖️", 19: "🔄", 20: "🔗",
  21: "📄", 22: "📬", 23: "🤝", 24: "🌐",
};

const EN_CLAUSES = [
  { n: 1,  title: "Definitions",                       important: false },
  { n: 2,  title: "Acceptance of Terms",               important: false },
  { n: 3,  title: "Platform Role and Limitations",     important: true  },
  { n: 4,  title: "User Eligibility and Registration", important: false },
  { n: 5,  title: "User Categories and Obligations",   important: false },
  { n: 6,  title: "Verification and Qualification",    important: false },
  { n: 7,  title: "Project Posting and Proposals",     important: false },
  { n: 8,  title: "Fees and Payments",                 important: false },
  { n: 9,  title: "Non-Circumvention",                 important: true  },
  { n: 10, title: "Intellectual Property",             important: false },
  { n: 11, title: "User Content and License",          important: false },
  { n: 12, title: "Prohibited Activities",             important: false },
  { n: 13, title: "Account Suspension and Termination", important: false },
  { n: 14, title: "Disclaimers and Warranties",        important: false },
  { n: 15, title: "Limitation of Liability",           important: true  },
  { n: 16, title: "Indemnification",                   important: false },
  { n: 17, title: "Force Majeure",                     important: false },
  { n: 18, title: "Governing Law and Dispute Resolution", important: true },
  { n: 19, title: "Modifications to Terms",            important: false },
  { n: 20, title: "Severability",                      important: false },
  { n: 21, title: "Entire Agreement",                  important: false },
  { n: 22, title: "Notices and Communications",        important: false },
  { n: 23, title: "Assignment",                        important: false },
  { n: 24, title: "Language",                          important: false },
];

const AR_CLAUSES = [
  { n: 1,  title: "التعريفات",                          important: false },
  { n: 2,  title: "قبول الشروط",                        important: false },
  { n: 3,  title: "دور المنصة وحدودها",                 important: true  },
  { n: 4,  title: "أهلية المستخدم والتسجيل",           important: false },
  { n: 5,  title: "فئات المستخدمين والتزاماتهم",       important: false },
  { n: 6,  title: "التحقق والتأهيل",                    important: false },
  { n: 7,  title: "طرح المشاريع والعروض",              important: false },
  { n: 8,  title: "الرسوم والمدفوعات",                  important: false },
  { n: 9,  title: "عدم التحايل",                        important: true  },
  { n: 10, title: "الملكية الفكرية",                    important: false },
  { n: 11, title: "محتوى المستخدم والترخيص",           important: false },
  { n: 12, title: "الأنشطة المحظورة",                   important: false },
  { n: 13, title: "تعليق وإنهاء الحساب",               important: false },
  { n: 14, title: "إخلاء المسؤولية والضمانات",         important: false },
  { n: 15, title: "تحديد المسؤولية",                    important: true  },
  { n: 16, title: "التعويض",                            important: false },
  { n: 17, title: "القوة القاهرة",                      important: false },
  { n: 18, title: "القانون الحاكم وحل النزاعات",       important: true  },
  { n: 19, title: "تعديل الشروط",                       important: false },
  { n: 20, title: "انفصال البنود",                      important: false },
  { n: 21, title: "الاتفاقية الكاملة",                 important: false },
  { n: 22, title: "الإشعارات والمراسلات",              important: false },
  { n: 23, title: "التنازل",                            important: false },
  { n: 24, title: "اللغة",                              important: false },
];

export default async function TermsAndConditionsPage() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("legal.terms"),
  ]);
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const clauses = isAr ? AR_CLAUSES : EN_CLAUSES;

  return (
    <main
      dir={dir}
      style={{
        background: "linear-gradient(180deg, var(--brand-ivory) 0%, var(--brand-white) 60%, var(--brand-ivory) 100%)",
        minHeight: "100vh",
        paddingBottom: "5rem",
      }}
    >
      {/* ── Hero ── */}
      <div
        style={{
          background: "linear-gradient(145deg, color-mix(in srgb, var(--primary) 72%, #0f172a) 0%, color-mix(in srgb, var(--primary) 88%, #0b1720) 100%)",
          padding: "4rem 0 3rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* bg grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "52px 52px", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-120px", insetInlineEnd: "-100px",
          width: "360px", height: "360px", borderRadius: "999px",
          background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="container-app" style={{ position: "relative", zIndex: 1 }}>
          {/* breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <Link href="/" style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>
              {isAr ? "الرئيسية" : "Home"}
            </Link>
            <ChevronRight size={12} color="rgba(255,255,255,0.35)" style={{ transform: isAr ? "scaleX(-1)" : undefined }} />
            <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.85)" }}>
              {isAr ? "الشروط والأحكام" : "Terms & Conditions"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "1.2rem", flexWrap: "wrap" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px", flexShrink: 0,
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Scale size={26} color="white" strokeWidth={1.6} />
            </div>
            <div>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: "0.4rem" }}>
                {isAr ? "راسي · الوثيقة القانونية ٢ من ٣" : "Rasi Legal · Document 2 of 3"}
              </div>
              <h1 style={{ margin: 0, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, color: "#fff", letterSpacing: "-0.025em", lineHeight: 1.15 }}>
                {isAr ? "الشروط والأحكام" : "Terms & Conditions"}
              </h1>
              <p style={{ margin: "0.65rem 0 0", color: "rgba(255,255,255,0.72)", fontSize: "0.92rem", lineHeight: 1.6, maxWidth: "640px" }}>
                {isAr
                  ? "اتفاقية ملزِمة بينك وبين شركة إنفورميشن تيكنولوجي إنتجريتد سلوشنز · الرقم الوطني: ٧٠٥٤٠٤٤٦٦٩ · الرياض · ٢٠٢٦"
                  : "Binding agreement between you and Information Technology Integrated Solutions Co. · UNN: 7054044669 · Riyadh · 2026"}
              </p>
            </div>
          </div>

          {/* meta pills */}
          <div style={{ display: "flex", gap: "0.6rem", marginTop: "2rem", flexWrap: "wrap" }}>
            {[
              isAr ? "حماية قصوى" : "Maximum Shield",
              isAr ? "متوافقة مع أنظمة المملكة" : "Saudi Law-Compliant",
              isAr ? "آخر تحديث: ٢٠٢٦" : "Last Updated: 2026",
            ].map((pill) => (
              <span key={pill} style={{
                display: "inline-flex", alignItems: "center",
                padding: "0.3rem 0.75rem", borderRadius: "999px",
                background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)",
                fontSize: "0.72rem", fontWeight: 600, color: "rgba(255,255,255,0.88)",
                letterSpacing: "0.04em",
              }}>
                {pill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container-app" style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {/* ── Binding Agreement Banner ── */}
        <div style={{
          borderRadius: "16px", padding: "1.1rem 1.4rem",
          background: "linear-gradient(135deg, rgba(184,115,51,0.08) 0%, rgba(184,115,51,0.04) 100%)",
          border: "1px solid rgba(184,115,51,0.3)",
          display: "flex", gap: "0.9rem", alignItems: "flex-start",
        }}>
          <AlertTriangle size={20} color="var(--brand-copper)" style={{ flexShrink: 0, marginTop: "0.15rem" }} />
          <div>
            <p style={{ margin: "0 0 0.3rem", fontWeight: 800, fontSize: "0.82rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--brand-copper)" }}>
              {isAr ? "اتفاقية ملزِمة — يُرجى القراءة بعناية" : "BINDING AGREEMENT — READ CAREFULLY"}
            </p>
            <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.7, color: "var(--brand-charcoal)" }}>
              {isAr
                ? "باستخدامك راسي بأي صورة — تسجيلاً، أو تصفُّحاً، أو طرحاً لمشروع، أو تقديم عرض، أو غير ذلك — فإنك تُقرُّ بأنك قرأت هذه الشروط، وفهمتها، ووافقت على الالتزام بها بالكامل. إذا لم توافق، يجب عليك عدم استخدام المنصة."
                : "By accessing or using Rasi in any manner — registering, browsing, posting a project, submitting an offer, or otherwise — you confirm that you have read, understood, and agreed to be bound by these Terms in full. If you do not agree, you must not use the platform."}
            </p>
          </div>
        </div>

        {/* ── Two-column layout: TOC sidebar + content ── */}
        <div className="legal-doc-layout">

          {/* Sidebar TOC */}
          <aside className="legal-doc-toc" style={{ alignSelf: "start", position: "sticky", top: "6rem" }}>
            <div style={{
              background: "var(--brand-white)", borderRadius: "16px",
              border: "1px solid var(--brand-ivory-dark)",
              boxShadow: "0 12px 32px -20px rgba(27,42,74,0.14)",
              padding: "1.25rem 1rem",
              maxHeight: "calc(100vh - 8rem)",
              overflowY: "auto",
            }}>
              <p style={{ margin: "0 0 0.85rem", fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--brand-teal)" }}>
                {isAr ? "فهرس البنود" : "Table of Contents"}
              </p>
              <nav style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                {clauses.map((c) => (
                  <a
                    key={c.n}
                    href={`#clause-${c.n}`}
                    className={`legal-doc-toc-link${c.important ? " legal-doc-toc-link--key" : ""}`}
                  >
                    <span style={{
                      width: "20px", height: "20px", borderRadius: "6px", flexShrink: 0,
                      background: c.important ? "rgba(13,115,119,0.12)" : "var(--brand-ivory)",
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.6rem", fontWeight: 800, color: c.important ? "var(--brand-teal)" : "var(--brand-warm-grey)",
                    }}>
                      {c.n}
                    </span>
                    {c.title}
                    {c.important && <span style={{ marginInlineStart: "auto", fontSize: "0.55rem", padding: "0.1rem 0.35rem", borderRadius: "999px", background: "rgba(13,115,119,0.12)", color: "var(--brand-teal)", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                      {isAr ? "مهم" : "KEY"}
                    </span>}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main clauses content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

            {/* Platform role callout */}
            <div style={{
              borderRadius: "14px", padding: "1.1rem 1.25rem",
              background: "linear-gradient(135deg, rgba(13,115,119,0.06) 0%, rgba(13,115,119,0.03) 100%)",
              border: "1.5px solid rgba(13,115,119,0.22)",
              display: "flex", gap: "0.85rem", alignItems: "flex-start",
            }}>
              <Shield size={19} color="var(--brand-teal)" style={{ flexShrink: 0, marginTop: "0.1rem" }} />
              <div>
                <p style={{ margin: "0 0 0.3rem", fontWeight: 800, fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--brand-teal)" }}>
                  {isAr ? "بند جوهري · دور المنصة" : "CORE CLAUSE · Platform Role"}
                </p>
                <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.65, color: "var(--brand-charcoal)" }}>
                  {isAr
                    ? "دور المنصة محصور حصراً في تسهيل الربط. المنصة ليست مقاولاً، وليست مشرفاً، ولا تضمن أي نتيجة."
                    : "The platform's role is strictly limited to facilitating connections. The platform is NOT a contractor, NOT a supervisor, and NOT a guarantor of any outcome."}
                </p>
              </div>
            </div>

            {/* Clause cards */}
            {clauses.map((c) => (
              <div
                key={c.n}
                id={`clause-${c.n}`}
                style={{
                  borderRadius: "16px",
                  background: "var(--brand-white)",
                  border: c.important ? "1.5px solid rgba(13,115,119,0.28)" : "1px solid var(--brand-ivory-dark)",
                  boxShadow: c.important ? "0 10px 30px -18px rgba(13,115,119,0.25)" : "0 6px 20px -16px rgba(27,42,74,0.14)",
                  overflow: "hidden",
                }}
              >
                {/* Clause header */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.85rem",
                  padding: "1rem 1.25rem",
                  borderBottom: "1px solid var(--brand-ivory-dark)",
                  background: c.important ? "linear-gradient(135deg, rgba(13,115,119,0.05) 0%, transparent 100%)" : "var(--brand-ivory)",
                }}>
                  <span style={{
                    width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                    background: c.important ? "var(--brand-teal)" : "var(--brand-white)",
                    border: c.important ? "none" : "1px solid var(--brand-ivory-dark)",
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1rem",
                  }}>
                    {CLAUSE_ICONS[c.n] ?? "📌"}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      margin: 0,
                      fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: c.important ? "var(--brand-teal)" : "var(--brand-warm-grey)",
                    }}>
                      {isAr ? `البند ${c.n}` : `Clause ${c.n}`}
                    </p>
                    <h3 style={{
                      margin: "0.1rem 0 0",
                      fontSize: "0.98rem", fontWeight: 800,
                      color: "var(--brand-navy)", letterSpacing: "-0.01em",
                    }}>
                      {c.title}
                    </h3>
                  </div>
                  {c.important && (
                    <span style={{
                      padding: "0.22rem 0.6rem", borderRadius: "999px",
                      background: "rgba(13,115,119,0.12)", color: "var(--brand-teal)",
                      fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}>
                      {isAr ? "بند مهم" : "Key Clause"}
                    </span>
                  )}
                </div>

                {/* Clause body — translated content */}
                <div style={{ padding: "1rem 1.25rem" }}>
                  <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.8, color: "var(--brand-charcoal)" }}>
                    {t(`clause_${c.n}`)}
                  </p>
                </div>
              </div>
            ))}

            {/* Footer note */}
            <div style={{
              borderRadius: "14px", padding: "1rem 1.2rem",
              background: "var(--brand-ivory)", border: "1px solid var(--brand-ivory-dark)",
              display: "flex", gap: "0.75rem", alignItems: "flex-start",
            }}>
              <FileText size={17} color="var(--brand-warm-grey)" style={{ flexShrink: 0, marginTop: "0.15rem" }} />
              <p style={{ margin: 0, fontSize: "0.82rem", lineHeight: 1.65, color: "var(--brand-warm-grey)" }}>
                {isAr
                  ? "نهاية الوثيقة الثانية — الشروط والأحكام. راجع الوثيقة الثالثة — سياسة الخصوصية. شركة إنفورميشن تيكنولوجي إنتجريتد سلوشنز · الرياض ٢٠٢٦"
                  : "End of Document 2 — Terms & Conditions. See Document 3 — Privacy Policy. Information Technology Integrated Solutions Co. · Riyadh 2026"}
              </p>
            </div>

            {/* Back button */}
            <div style={{ display: "flex", justifyContent: isAr ? "flex-start" : "flex-end" }}>
              <Link
                href="/"
                style={{
                  textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.8rem 1.4rem", borderRadius: "12px",
                  background: "var(--brand-copper)", color: "var(--brand-white)",
                  fontWeight: 700, fontSize: "0.9rem",
                  boxShadow: "0 8px 22px -8px rgba(184,115,51,0.5)",
                }}
              >
                {isAr ? "العودة للرئيسية" : "Back to Homepage"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
