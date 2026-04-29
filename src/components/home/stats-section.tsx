import { FolderOpen, Users, BarChart3, Trophy } from "lucide-react";

interface StatsSectionProps {
  t: (key: string) => string;
}

export function StatsSection({ t }: StatsSectionProps) {
  const stats = [
    { icon: FolderOpen, value: "500+", label: t("stats.projects"), color: "#0d7377", bg: "linear-gradient(135deg, #e6f4f1 0%, #d4e8eb 100%)" },
    { icon: Users, value: "200+", label: t("stats.contractors"), color: "#0d7377", bg: "linear-gradient(135deg, #e6f4f1 0%, #d4e8eb 100%)" },
    { icon: BarChart3, value: "1,200+", label: t("stats.bids"), color: "#0d7377", bg: "linear-gradient(135deg, #e6f4f1 0%, #d4e8eb 100%)" },
    { icon: Trophy, value: "350+", label: t("stats.awards"), color: "#0d7377", bg: "linear-gradient(135deg, #e6f4f1 0%, #d4e8eb 100%)" },
  ];

  return (
    <section className="bg-(--brand-ivory) !py-8 md:!py-20">
      <div className="container-app">
        <div
          className="grid grid-cols-2 md:grid-cols-4"
          style={{
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
                  fontWeight: 500,
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
                  color: "black",
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
