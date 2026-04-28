import { Link } from "@/i18n/routing";
import {
  Building2, Search, BarChart3, ShieldCheck,
  MessageSquare, FileText, Star,
} from "lucide-react";

export default async function ServicesPage() {

  const services = [
    {
      num: "01",
      icon: Building2,
      title: "Project Posting",
      color: "#2A7B88",
      bg: "#E8F4F6",
      desc: "We help project owners present their request professionally: project type, location, scope of work, estimated budget, timeline, and supporting files.",
      note: "The clearer the brief, the more accurate the offers.",
    },
    {
      num: "02",
      icon: Search,
      title: "Qualified Proposals",
      color: "#B87333",
      bg: "#F5EDE6",
      desc: "Instead of random outreach, your project reaches contractors and engineers whose specialization matches the work, so the offers you receive are worth comparing.",
      note: null,
    },
    {
      num: "03",
      icon: BarChart3,
      title: "Structured Comparison",
      color: "#2563eb",
      bg: "#eff6ff",
      desc: "A unified comparison dashboard surfaces the real differences between offers: total price, timeline, track record, prior ratings, and profile completeness.",
      note: null,
    },
    {
      num: "04",
      icon: ShieldCheck,
      title: "Verification & Qualification",
      color: "#059669",
      bg: "#ecfdf5",
      desc: "Contractor and engineer profiles are reviewed against published criteria: legal information, specialization, prior work, and fit with the project type.",
      note: "Verification is the condition for competing — not a marketing label.",
    },
    {
      num: "05",
      icon: MessageSquare,
      title: "Structured Communication",
      color: "#7c3aed",
      bg: "#f5f3ff",
      desc: "In-platform messaging supports questions, clarifications, and detail reviews before award — all conversations are documented in the project context.",
      note: null,
    },
    {
      num: "06",
      icon: FileText,
      title: "Documentation & Contracts",
      color: "#dc2626",
      bg: "#fef2f2",
      desc: "Tools to document scope, offers, and correspondence, plus support for clear contract drafting before execution begins.",
      note: "Documentation reduces disputes downstream.",
    },
    {
      num: "07",
      icon: Star,
      title: "Ratings & Reputation",
      color: "#B87333",
      bg: "#F5EDE6",
      desc: "After the engagement closes, ratings build a clear professional record for contractors and engineers — equipping future owners to make better-informed decisions.",
      note: null,
    },
  ];

  return (
    <div>

      {/* ========== HERO ========== */}
      <section style={{
        background: "linear-gradient(135deg, #1C5963 0%, #2A7B88 40%, #3A8B98 70%, #4A9BA8 100%)",
        position: "relative",
        overflow: "hidden",
        minHeight: "52vh",
        display: "flex",
        alignItems: "center",
      }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: "-120px", left: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

        <div className="container-app" style={{ position: "relative", zIndex: 1, padding: "6rem 2rem 5rem", width: "100%" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>

            <div style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.5rem 1.25rem", borderRadius: "var(--radius-full)",
              background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.95)",
              fontSize: "0.8125rem", fontWeight: 600, marginBottom: "2rem",
              backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.2)",
            }}>
              <ShieldCheck style={{ width: "15px", height: "15px" }} />
              7 Services
            </div>

            <h1 style={{
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)", fontWeight: 800,
              color: "white", lineHeight: 1.1, letterSpacing: "-0.03em",
              margin: "0 0 1.25rem",
            }}>
              Services designed to support the contracting decision —
              <span style={{ display: "block", fontStyle: "italic", fontWeight: 400, opacity: 0.85 }}>
                before execution begins.
              </span>
            </h1>

            <div style={{ width: "36px", height: "2px", background: "rgba(255,255,255,0.3)", margin: "0 auto", borderRadius: "2px" }} />
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40px", background: "var(--bg)", borderRadius: "40px 40px 0 0" }} />
      </section>

      {/* ========== SERVICES GRID ========== */}
      <section style={{ background: "var(--bg)", padding: "3rem 0 1rem" }}>
        <div className="container-app">

          {/* Etimad-style: numbered list with strong left border, clean data layout */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0", maxWidth: "1100px", margin: "0 auto" }}>
            {services.map((s, i) => (
              <div key={i} className="card" style={{
                padding: "0",
                marginBottom: "1rem",
                overflow: "hidden",
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                borderLeft: `4px solid ${s.color}`,
                transition: "box-shadow 0.2s, transform 0.2s",
              }}>
                {/* Number column */}
                <div style={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  padding: "2rem 0",
                  background: s.bg,
                  borderRight: "1px solid var(--border-light)",
                  gap: "0.5rem",
                }}>
                  <div style={{
                    width: "40px", height: "40px", borderRadius: "50%",
                    background: s.color, display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 2px 8px ${s.color}40`,
                  }}>
                    <s.icon style={{ width: "18px", height: "18px", color: "white" }} />
                  </div>
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: s.color, letterSpacing: "0.1em" }}>
                    {s.num}
                  </span>
                </div>

                {/* Content column */}
                <div style={{ padding: "1.75rem 2rem" }}>
                  <h3 style={{
                    fontSize: "1.125rem", fontWeight: 700,
                    color: "var(--text)", marginBottom: "0.5rem",
                  }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)", lineHeight: 1.75, margin: 0 }}>
                    {s.desc}
                  </p>
                  {s.note && (
                    <p style={{
                      fontSize: "0.875rem", color: s.color,
                      marginTop: "0.625rem", fontStyle: "italic",
                      fontWeight: 500,
                    }}>
                      {s.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========== SCOPE NOTE ========== */}
      <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)", padding: "3rem 0" }}>
        <div className="container-app" style={{ maxWidth: "860px", margin: "0 auto" }}>
          <div className="card" style={{
            padding: "2rem 2.5rem",
            borderLeft: "4px solid var(--accent)",
            display: "flex", alignItems: "flex-start", gap: "1.25rem",
          }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "var(--radius-lg)",
              background: "rgba(184,115,51,0.1)", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ShieldCheck style={{ width: "20px", height: "20px", color: "var(--accent)" }} />
            </div>
            <div>
              <h4 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem", letterSpacing: "0.02em" }}>
                Scope of Platform
              </h4>
              <p style={{ fontSize: "0.9375rem", color: "var(--text-muted)", lineHeight: 1.8, margin: 0 }}>
                Rasi&apos;s role ends at award. The platform does not manage execution, track milestones, or intervene in the contractual relationship between owner and awarded party. The contractual relationship begins directly between the parties from the moment of award.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section style={{
        background: "linear-gradient(135deg, #1C5963 0%, #2A7B88 50%, #3A8B98 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div className="container-app" style={{ position: "relative", zIndex: 1, padding: "4rem 1.5rem", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.625rem", fontWeight: 700, color: "white", marginBottom: "0.75rem" }}>
            Ready to post your project?
          </h2>
          <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.72)", maxWidth: "460px", margin: "0 auto 2rem", lineHeight: 1.75 }}>
            Start with a clear brief. Receive qualified offers. Compare on one dashboard. Award with confidence.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/register" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.875rem 2rem", borderRadius: "var(--radius-lg)",
              fontSize: "1rem", fontWeight: 700, textDecoration: "none",
              background: "var(--accent)", color: "white",
              boxShadow: "0 4px 14px rgba(184, 115, 51, 0.4)",
            }}>
              <Building2 style={{ width: "20px", height: "20px" }} />
              Post Your Project
            </Link>
            <Link href="/marketplace" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.875rem 2rem", borderRadius: "var(--radius-lg)",
              fontSize: "1rem", fontWeight: 600, textDecoration: "none",
              color: "white", border: "2px solid rgba(255,255,255,0.25)",
              background: "rgba(255,255,255,0.08)",
            }}>
              <Search style={{ width: "20px", height: "20px" }} />
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
