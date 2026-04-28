import { Heart, BarChart3, Star, ShieldCheck, Scale } from "lucide-react";

interface OurValuesSectionProps {
  t: (key: string) => string;
}

export function OurValuesSection({ t }: OurValuesSectionProps) {
  const icons = [Heart, BarChart3, Star, ShieldCheck, Scale];

  return (
    <section style={{ background: "white", padding: "4rem 0" }}>
      <div className="container-app">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.75rem" }}>
            {t("ourValues.title")}
          </h2>
          <div style={{ width: "48px", height: "4px", borderRadius: "2px", background: "var(--primary)", margin: "0 auto" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", maxWidth: "1100px", margin: "0 auto" }}>
          {[0, 1, 2, 3, 4].map((i) => {
            const Icon = icons[i];
            return (
              <div key={i} style={{ textAlign: "center", padding: "1.75rem 1.25rem" }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "var(--radius-xl)",
                  background: "var(--primary-light)", margin: "0 auto 1rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon style={{ width: "24px", height: "24px", color: "var(--primary)" }} />
                </div>
                <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
                  {t(`ourValues.items.${i}.title`)}
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
                  {t(`ourValues.items.${i}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
