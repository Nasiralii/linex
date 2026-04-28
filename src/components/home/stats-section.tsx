import { FolderOpen, Users, BarChart3, Trophy } from "lucide-react";

interface StatsSectionProps {
  t: (key: string) => string;
}

export function StatsSection({ t }: StatsSectionProps) {
  const stats = [
    { icon: FolderOpen, value: "500+", label: t("stats.projects"), color: "var(--brand-teal)", bg: "linear-gradient(135deg, var(--brand-teal-light) 0%, #d4e8eb 100%)" },
    { icon: Users, value: "200+", label: t("stats.contractors"), color: "var(--brand-navy)", bg: "linear-gradient(135deg, #e8ecf4 0%, #dce4ed 100%)" },
    { icon: BarChart3, value: "1,200+", label: t("stats.bids"), color: "var(--brand-copper)", bg: "linear-gradient(135deg, var(--brand-copper-light) 0%, #ebe0d4 100%)" },
    { icon: Trophy, value: "350+", label: t("stats.awards"), color: "#B85C38", bg: "linear-gradient(135deg, #fdf2ef 0%, #f5e0d8 100%)" },
  ];

  return (
    <section style={{ background: "var(--brand-ivory)", padding: "5rem 0" }}>
      <div className="container-app">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "1px",
            maxWidth: "960px",
            margin: "0 auto",
            background: "var(--brand-ivory-dark)",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 2px 24px rgba(27,42,74,0.08)",
            border: "1px solid var(--brand-ivory-dark)",
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                background: "var(--brand-white)",
                padding: "2rem 1.5rem",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: s.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.25rem",
                }}
              >
                <s.icon style={{ width: "24px", height: "24px", color: s.color }} />
              </div>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "var(--brand-charcoal)",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--brand-warm-grey)",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
