import { Eye, Target } from "lucide-react";

interface VisionMissionSectionProps {
  t: (key: string) => string;
}

export function VisionMissionSection({ t }: VisionMissionSectionProps) {
  return (
    <section style={{
      background: "linear-gradient(135deg, #1C5963 0%, #2A7B88 50%, #3A8B98 100%)",
      position: "relative", overflow: "hidden", padding: "5rem 0",
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", width: "100%" }}>
          {[
            { icon: Eye, label: t("vision.title"), text: t("vision.description") },
            { icon: Target, label: t("mission.title"), text: t("mission.description") },
          ].map((item, i) => (
            <div key={i} style={{
              padding: "clamp(2rem, 4vw, 3rem)",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: "24px",
              boxShadow: "0 24px 60px -34px rgba(0,0,0,0.45)",
            }}>
              <div style={{
                width: "56px", height: "56px", borderRadius: "18px",
                background: "rgba(255,255,255,0.14)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "1.5rem",
              }}>
                <item.icon style={{ width: "26px", height: "26px", color: "white" }} />
              </div>
              <h2 style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", fontWeight: 800, letterSpacing: "-0.025em", color: "white", marginBottom: "1rem" }}>
                {item.label}
              </h2>
              <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.8, margin: 0 }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
