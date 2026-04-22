import { CheckCircle, Clock, Milestone } from "lucide-react";

interface MilestoneItem { name: string; done: boolean; date: Date | null }

export function MilestoneTracker({ milestones, isRtl }: { milestones: MilestoneItem[]; isRtl: boolean }) {
  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Milestone style={{ width: "18px", height: "18px", color: "var(--accent)" }} />
        {isRtl ? "مراحل المشروع" : "Milestone Tracking"}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {milestones.map((m, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: m.done ? "var(--primary)" : "var(--surface-2)", border: m.done ? "none" : "2px solid var(--border)" }}>
              {m.done ? <CheckCircle style={{ width: "16px", height: "16px", color: "white" }} /> : <Clock style={{ width: "14px", height: "14px", color: "var(--text-muted)" }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: m.done ? "var(--text)" : "var(--text-muted)" }}>{m.name}</div>
              {m.date && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date(m.date).toLocaleDateString()}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
