"use client";
import { useState, useEffect, useRef } from "react";

interface PipelineStage { status: string; count: number; projects: { id: string; title: string }[] }
interface Props {
  pipeline: PipelineStage[];
  users: { owners: number; contractors: number; engineers: number; verified: number; pending: number };
  isRtl: boolean;
}

const SL: Record<string, { en: string; ar: string }> = {
  DRAFT: { en: "Draft", ar: "مسودة" }, PUBLISHED: { en: "Published", ar: "منشور" },
  BIDDING: { en: "Bidding", ar: "مناقصة" }, AWARDED: { en: "Awarded", ar: "مرسّى" },
  IN_PROGRESS: { en: "In Progress", ar: "قيد التنفيذ" }, COMPLETED: { en: "Completed", ar: "مكتمل" },
};
const FUNNEL_COLORS = [
  "linear-gradient(135deg, #b8e6d8, #8fd4c0)", "linear-gradient(135deg, #7dd3bc, #5ec4a6)",
  "linear-gradient(135deg, #4cc9a0, #30b889)", "linear-gradient(135deg, #2db882, #1fa06e)",
  "linear-gradient(135deg, #0f9b6b, #0d845b)", "linear-gradient(135deg, #2A7B88, #1C5963)",
];

export default function PipelineChart({ pipeline, users, isRtl }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hovRole, setHovRole] = useState<number | null>(null);
  const [anim, setAnim] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setAnim(true); obs.disconnect(); } }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const totalP = pipeline.reduce((s, p) => s + p.count, 0) || 1;
  const total = users.owners + users.contractors + users.engineers || 1;
  const roles = [
    { label: isRtl ? "ملّاك" : "Owners", count: users.owners, color: "#2A7B88", icon: "👤" },
    { label: isRtl ? "مقاولين" : "Contractors", count: users.contractors, color: "#B87333", icon: "🏗" },
    { label: isRtl ? "مهندسين" : "Engineers", count: users.engineers, color: "#2563eb", icon: "⚙️" },
  ];
  const maxR = Math.max(...roles.map(r => r.count), 1);

  const glass = { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderRadius: 20, padding: "1.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.6)" };
  const secHead = { fontSize: "1.125rem", fontWeight: 700 as const, color: "#1a2332", marginBottom: "1.5rem", display: "flex" as const, alignItems: "center" as const, gap: "0.5rem" };
  const chartHeight = 220;

  return (
    <div ref={ref} style={{ display: "flex", gap: "1.25rem", marginBottom: "2rem", flexWrap: "wrap" as const }}>
      {/* Funnel */}
      <div style={{ ...glass, flex: "2 1 500px", minWidth: "400px" }}>
        <h3 style={secHead}>
          <span style={{ width: 4, height: 20, borderRadius: 2, background: "linear-gradient(to bottom, #B87333, #8C5A28)", display: "inline-block" }} />
          {isRtl ? "خط سير المشاريع" : "Project Pipeline"}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {pipeline.map((stage, i) => {
            const widthPct = Math.max(20, 100 - i * 14);
            const isExp = expanded === stage.status;
            const lbl = SL[stage.status] || { en: stage.status, ar: stage.status };
            return (
              <div key={stage.status}>
                <div onClick={() => setExpanded(isExp ? null : stage.status)} style={{
                  display: "flex", alignItems: "center", cursor: "pointer", gap: 12,
                  opacity: anim ? 1 : 0, transform: anim ? "translateX(0)" : "translateX(-30px)",
                  transition: `all 0.6s ease ${i * 0.1}s`,
                }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", width: 80, flexShrink: 0, textAlign: isRtl ? "right" : "left" }}>
                    {isRtl ? lbl.ar : lbl.en}
                  </span>
                  <div style={{ flex: 1, display: "flex", justifyContent: isRtl ? "flex-end" : "flex-start" }}>
                    <div style={{
                      width: `${widthPct}%`, height: 40, background: FUNNEL_COLORS[i],
                      borderRadius: i === 0 ? "12px 12px 8px 8px" : i === 5 ? "8px 8px 12px 12px" : 8,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      transition: "all 0.3s ease",
                      boxShadow: `0 2px 8px rgba(42,123,136,${0.05 + i * 0.03})`,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.35)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.8125rem", fontWeight: 800, color: i >= 3 ? "#fff" : "#1a2332",
                      }}>{stage.count}</div>
                      <span style={{ fontSize: "0.6875rem", color: i >= 3 ? "rgba(255,255,255,0.8)" : "#374151", fontWeight: 500 }}>
                        {Math.round((stage.count / totalP) * 100)}%
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: "0.6875rem", color: "#9ca3af", transition: "transform 0.3s", transform: isExp ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                </div>
                <div style={{
                  maxHeight: isExp && stage.projects.length > 0 ? 200 : 0, overflow: "hidden",
                  transition: "max-height 0.4s ease, opacity 0.3s ease", opacity: isExp ? 1 : 0,
                  marginLeft: isRtl ? 0 : 92, marginRight: isRtl ? 92 : 0,
                }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 0" }}>
                    {stage.projects.map(p => (
                      <span key={p.id} style={{ padding: "4px 12px", borderRadius: 12, background: "#f5f2ea", fontSize: "0.6875rem", color: "#374151", border: "1px solid #e5e7eb" }}>{p.title}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Users by Role */}
      <div style={{ ...glass, flex: "1 1 350px", minWidth: "300px" }}>
        <h3 style={secHead}>
          <span style={{ width: 4, height: 20, borderRadius: 2, background: "linear-gradient(to bottom, #B87333, #8C5A28)", display: "inline-block" }} />
          {isRtl ? "المستخدمين حسب الدور" : "Users by Role"}
        </h3>
        <div style={{
          display: "grid",
          gridTemplateRows: `${chartHeight}px auto`,
          gap: 12,
          marginTop: 8,
          marginBottom: 16,
        }}>
          <div style={{
            display: "flex",
            alignItems: "end",
            justifyContent: "space-around",
            height: chartHeight,
            padding: "1rem 8px 0.5rem",
            borderBottom: "1px solid #eef2f7",
            overflow: "hidden",
          }}>
          {roles.map((r, i) => {
            const h = Math.max((r.count / maxR) * 120, r.count > 0 ? 24 : 0);
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "end", position: "relative", width: 72, height: "100%" }}
                onMouseEnter={() => setHovRole(i)} onMouseLeave={() => setHovRole(null)}>
                <div style={{
                  width: 48, height: anim ? h : 0, borderRadius: "10px 10px 0 0",
                  background: `linear-gradient(to top, ${r.color}, ${r.color}cc)`,
                  transition: `height 0.9s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.15}s`,
                  boxShadow: hovRole === i ? `0 -4px 16px ${r.color}40` : "none",
                }} />
              </div>
            );
          })}
        </div>
          <div style={{ display: "flex", justifyContent: "space-around", gap: 8, padding: "0 8px" }}>
            {roles.map((r, i) => (
              <div key={i} style={{ width: 72, textAlign: "center" }}>
                <div style={{ fontSize: "1rem", marginBottom: 4 }}>{r.icon}</div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, minHeight: 18 }}>{r.label}</div>
                <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1a2332", lineHeight: 1.2 }}>{r.count}</div>
                <div style={{ fontSize: "0.625rem", color: "#9ca3af" }}>{Math.round((r.count / total) * 100)}%</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
          <span style={{ fontSize: "0.6875rem", color: "#6b7280" }}>
            {isRtl ? "موثّقين" : "Verified"}: <strong style={{ color: "#2A7B88" }}>{users.verified}</strong>
          </span>
          <span style={{ fontSize: "0.6875rem", color: "#6b7280" }}>
            {isRtl ? "معلّقين" : "Pending"}: <strong style={{ color: "#B87333" }}>{users.pending}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
