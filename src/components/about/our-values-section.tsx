import { Heart, BarChart3, Star, ShieldCheck, Scale } from "lucide-react";

export function OurValuesSection() {
  return (
    <section style={{ background: "var(--surface)", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)", padding: "4rem 0" }}>
      <div className="container-app">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.75rem" }}>
            Our Values
          </h2>
          <div style={{ width: "48px", height: "4px", borderRadius: "2px", background: "var(--primary)", margin: "0 auto" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", maxWidth: "1100px", margin: "0 auto" }}>
          {[
            { icon: Heart,      label: "Trust First",      desc: "Every feature is built on a foundation of verified trust." },
            { icon: BarChart3,  label: "Transparency",     desc: "Full visibility on information, criteria, and offers." },
            { icon: Star,       label: "Professionalism",  desc: "Projects and profiles presented with clarity and precision." },
            { icon: ShieldCheck,label: "Quality",          desc: "Rigorous qualification of every professional on the platform." },
            { icon: Scale,      label: "Neutrality",       desc: "We equip the owner to choose — we never recommend a specific party." },
          ].map((v, i) => (
            <div key={i} style={{ textAlign: "center", padding: "1.75rem 1.25rem" }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "var(--radius-xl)",
                background: "var(--primary-light)", margin: "0 auto 1rem",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <v.icon style={{ width: "24px", height: "24px", color: "var(--primary)" }} />
              </div>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
                {v.label}
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
