import { Eye, Target } from "lucide-react";

export function VisionMissionSection() {
  return (
    <section style={{
      background: "linear-gradient(135deg, #1C5963 0%, #2A7B88 50%, #3A8B98 100%)",
      position: "relative", overflow: "hidden", padding: "4rem 0",
    }}>
      <div style={{
        position: "absolute", top: "-60px", right: "-60px",
        width: "200px", height: "200px", borderRadius: "50%",
        background: "rgba(255,255,255,0.04)",
      }} />
      <div style={{
        position: "absolute", bottom: "-80px", left: "-40px",
        width: "260px", height: "260px", borderRadius: "50%",
        background: "rgba(255,255,255,0.03)",
      }} />

      <div className="container-app" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", maxWidth: "960px", margin: "0 auto" }}>
          {[
            {
              icon: Eye,
              label: "Vision",
              text: "To be the most trusted digital infrastructure in Saudi Arabia for organizing the construction professional selection decision.",
            },
            {
              icon: Target,
              label: "Mission",
              text: "To enable project owners to reach qualified options, and serious contractors and engineers to reach real opportunities, through a platform founded on verification, transparency, and fair comparison.",
            },
          ].map((item, i) => (
            <div key={i} style={{
              padding: "2.5rem",
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "var(--radius-xl)",
            }}>
              <div style={{
                width: "52px", height: "52px", borderRadius: "var(--radius-xl)",
                background: "rgba(255,255,255,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1.25rem",
              }}>
                <item.icon style={{ width: "26px", height: "26px", color: "white" }} />
              </div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: "0.75rem" }}>
                {item.label}
              </div>
              <p style={{ fontSize: "1rem", color: "white", lineHeight: 1.75, margin: 0 }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
