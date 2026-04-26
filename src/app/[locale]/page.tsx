import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { getCurrentUser } from "@/lib/auth";
import { getContentPageByKey } from "@/lib/content-page-service";
import {
  Building2, Search, FileCheck, Award, Rocket,
  ShieldCheck, BarChart3, Headphones, Users,
  FolderOpen, Trophy, ArrowLeft, ArrowRight,
  CheckCircle, ChevronRight,
} from "lucide-react";

export default async function HomePage() {
  const [t, tCommon, user, homepageContent] = await Promise.all([
    getTranslations("home"),
    getTranslations("common"),
    getCurrentUser(),
    getContentPageByKey("homepage"),
  ]);

  const showOwnerCta = !user || user.role === "OWNER";
  const ownerCtaHref = !user ? "/auth/register" : "/dashboard/projects/new";

  return (
    <div>
      {/* ========== HERO ========== */}
      <section style={{
        background: "linear-gradient(135deg, #1C5963 0%, #2A7B88 40%, #3A8B98 70%, #4A9BA8 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative shapes */}
        <div style={{
          position: "absolute", top: "-80px", right: "-80px",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }} />
        <div style={{
          position: "absolute", bottom: "-120px", left: "-60px",
          width: "300px", height: "300px", borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
        }} />
        <div style={{
          position: "absolute", top: "50%", right: "10%",
          width: "200px", height: "200px", borderRadius: "50%",
          background: "rgba(184, 115, 51, 0.1)",
        }} />

        <div className="container-app" style={{ position: "relative", zIndex: 1, padding: "5rem 1.5rem 4.5rem" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.5rem 1.25rem", borderRadius: "var(--radius-full)",
              background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)",
              fontSize: "0.8125rem", fontWeight: 500, marginBottom: "1.5rem",
              backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)",
            }}>
              <ShieldCheck style={{ width: "16px", height: "16px" }} />
              {tCommon("tagline")}
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)", fontWeight: 800,
              color: "white", marginBottom: "1.25rem", lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}>
              {t("hero.title")}
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: "1.125rem", color: "rgba(255,255,255,0.75)",
              maxWidth: "560px", margin: "0 auto 2.5rem", lineHeight: 1.7,
            }}>
              {t("hero.subtitle")}
            </p>

            {/* CTA */}
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              {showOwnerCta && (
                <Link href={ownerCtaHref as "/auth/register" | "/dashboard/projects/new"} style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.875rem 2rem", borderRadius: "var(--radius-lg)",
                  fontSize: "1rem", fontWeight: 700, textDecoration: "none",
                  background: "var(--accent)", color: "white",
                  boxShadow: "0 4px 14px rgba(184, 115, 51, 0.4)",
                  transition: "all 200ms ease",
                }}>
                  <Building2 style={{ width: "20px", height: "20px" }} />
                  {t("hero.ownerCta")}
                </Link>
              )}
              <Link href="/marketplace" style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "0.875rem 2rem", borderRadius: "var(--radius-lg)",
                fontSize: "1rem", fontWeight: 600, textDecoration: "none",
                color: "white", border: "2px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(4px)",
                transition: "all 200ms ease",
              }}>
                <Search style={{ width: "20px", height: "20px" }} />
                {t("hero.contractorCta")}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "40px",
          background: "var(--bg)",
          borderRadius: "40px 40px 0 0",
        }} />
      </section>

      {/* ========== STATS ========== */}
      <section style={{ background: "var(--bg)", padding: "1rem 0 3rem" }}>
        <div className="container-app">
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem",
            maxWidth: "900px", margin: "0 auto",
          }}>
            {[
              { icon: FolderOpen, value: "500+", label: t("stats.projects"), color: "#2A7B88" },
              { icon: Users, value: "200+", label: t("stats.contractors"), color: "#2563eb" },
              { icon: BarChart3, value: "1,200+", label: t("stats.bids"), color: "#B87333" },
              { icon: Trophy, value: "350+", label: t("stats.awards"), color: "#7c3aed" },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "var(--radius-xl)",
                  background: `${s.color}10`, margin: "0 auto 0.75rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <s.icon style={{ width: "24px", height: "24px", color: s.color }} />
                </div>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text)", lineHeight: 1, marginBottom: "0.25rem" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 500 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)", padding: "4rem 0" }}>
        <div className="container-app">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.75rem" }}>
              {t("howItWorks.title")}
            </h2>
            <div style={{ width: "48px", height: "4px", borderRadius: "2px", background: "var(--accent)", margin: "0 auto" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", maxWidth: "1000px", margin: "0 auto" }}>
            {[
              { icon: FolderOpen, title: t("howItWorks.step1Title"), desc: t("howItWorks.step1Desc"), num: "1" },
              { icon: FileCheck, title: t("howItWorks.step2Title"), desc: t("howItWorks.step2Desc"), num: "2" },
              { icon: Award, title: t("howItWorks.step3Title"), desc: t("howItWorks.step3Desc"), num: "3" },
              { icon: Rocket, title: t("howItWorks.step4Title"), desc: t("howItWorks.step4Desc"), num: "4" },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
                {/* Step number */}
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: "var(--primary)", color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.875rem", fontWeight: 700, margin: "0 auto 1rem",
                  boxShadow: "0 2px 8px rgba(42, 123, 136, 0.3)",
                }}>
                  {step.num}
                </div>
                {/* Icon */}
                <div style={{
                  width: "56px", height: "56px", borderRadius: "var(--radius-xl)",
                  background: "var(--primary-light)", margin: "0 auto 1rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <step.icon style={{ width: "28px", height: "28px", color: "var(--primary)" }} />
                </div>
                <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TRUST ========== */}
      <section style={{ background: "var(--bg)", padding: "4rem 0" }}>
        <div className="container-app">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.75rem" }}>
              {t("trust.title")}
            </h2>
            <div style={{ width: "48px", height: "4px", borderRadius: "2px", background: "var(--primary)", margin: "0 auto" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem", maxWidth: "960px", margin: "0 auto" }}>
            {[
              { icon: ShieldCheck, title: t("trust.verification"), desc: t("trust.verificationDesc"), color: "#2A7B88", bg: "#E8F4F6" },
              { icon: BarChart3, title: t("trust.structured"), desc: t("trust.structuredDesc"), color: "#B87333", bg: "#F5EDE6" },
              { icon: Headphones, title: t("trust.support"), desc: t("trust.supportDesc"), color: "#2563eb", bg: "#eff6ff" },
            ].map((item, i) => (
              <div key={i} className="card" style={{ padding: "2rem 1.5rem", textAlign: "center" }}>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "var(--radius-2xl)",
                  background: item.bg, margin: "0 auto 1.25rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <item.icon style={{ width: "32px", height: "32px", color: item.color }} />
                </div>
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA BAND ========== */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border-light)", padding: "3rem 0" }}>
        <div className="container-narrow">
          <div className="card" style={{ padding: "2rem" }}>
            <h3 style={{ marginBottom: "0.75rem" }}>{homepageContent.title}</h3>
            {(homepageContent.excerptAr || homepageContent.excerpt) && (
              <p style={{ marginBottom: "1rem", color: "var(--text-muted)" }}>{homepageContent.excerpt}</p>
            )}
            <p style={{ whiteSpace: "pre-wrap" }}>{homepageContent.content}</p>
          </div>
        </div>
      </section>

      <section style={{
        background: "linear-gradient(135deg, #1C5963 0%, #2A7B88 50%, #3A8B98 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-60px", right: "-60px",
          width: "200px", height: "200px", borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }} />
        <div className="container-app" style={{ position: "relative", zIndex: 1, padding: "4rem 1.5rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", marginBottom: "0.75rem" }}>
            {t("hero.title")}
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.7)", maxWidth: "500px", margin: "0 auto 2rem" }}>
            {t("hero.subtitle")}
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            {showOwnerCta && (
              <Link href={ownerCtaHref as "/auth/register" | "/dashboard/projects/new"} style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "0.875rem 2rem", borderRadius: "var(--radius-lg)",
                fontSize: "1rem", fontWeight: 700, textDecoration: "none",
                background: "var(--accent)", color: "white",
                boxShadow: "0 4px 14px rgba(184, 115, 51, 0.4)",
              }}>
                <Building2 style={{ width: "20px", height: "20px" }} />
                {t("hero.ownerCta")}
              </Link>
            )}
            <Link href="/marketplace" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.875rem 2rem", borderRadius: "var(--radius-lg)",
              fontSize: "1rem", fontWeight: 600, textDecoration: "none",
              color: "white", border: "2px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.08)",
            }}>
              <Search style={{ width: "20px", height: "20px" }} />
              {t("hero.contractorCta")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
