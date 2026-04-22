"use client";
import { useState, useEffect, useRef } from "react";

interface Props {
  revenue: { krasat: number; supervision: number; contracts: number; platformFees: number };
  monthlyRevenue: { month: string; total: number; krasat: number; supervision: number; contracts: number; fees: number }[];
  isRtl: boolean;
}

export default function RevenueCharts({ revenue, monthlyRevenue, isRtl }: Props) {
  const [hovBar, setHovBar] = useState<number | null>(null);
  const [hovSeg, setHovSeg] = useState<number | null>(null);
  const [anim, setAnim] = useState(false);
  const [donutAnim, setDonutAnim] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setAnim(true); setTimeout(() => setDonutAnim(true), 400); obs.disconnect(); }
    }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const maxBar = Math.max(...monthlyRevenue.map(m => m.total), 1);
  const sources = [
    { label: isRtl ? "كراسات" : "Krasat", value: revenue.krasat, color: "#0f6b57" },
    { label: isRtl ? "إشراف" : "Supervision", value: revenue.supervision, color: "#2563eb" },
    { label: isRtl ? "عقود" : "Contracts", value: revenue.contracts, color: "#c58b2a" },
    { label: isRtl ? "رسوم المنصة" : "Platform Fees", value: revenue.platformFees, color: "#7c3aed" },
  ];
  const totalRev = sources.reduce((s, r) => s + r.value, 0) || 1;

  let cumPct = 0;
  const gradParts = sources.map(s => {
    const pct = (s.value / totalRev) * 100;
    const seg = `${s.color} ${cumPct}% ${cumPct + pct}%`;
    cumPct += pct;
    return seg;
  }).join(", ");

  const glass = { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderRadius: 20, padding: "1.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.6)" };
  const secHead = { fontSize: "1.125rem", fontWeight: 700 as const, color: "#1a2332", marginBottom: "1.5rem", display: "flex" as const, alignItems: "center" as const, gap: "0.5rem" };

  return (
    <div ref={ref} style={{ display: "flex", gap: "1.25rem", marginBottom: "2rem" }}>
      {/* Bar Chart */}
      <div style={{ ...glass, flex: "0 0 60%" }}>
        <h3 style={secHead}>
          <span style={{ width: 4, height: 20, borderRadius: 2, background: "linear-gradient(to bottom, #c58b2a, #a06d1e)", display: "inline-block" }} />
          {isRtl ? "الإيرادات الشهرية" : "Monthly Revenue"}
        </h3>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 200, padding: "0 4px" }}>
          {monthlyRevenue.map((m, i) => {
            const h = (m.total / maxBar) * 175;
            const isHov = hovBar === i;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}
                onMouseEnter={() => setHovBar(i)} onMouseLeave={() => setHovBar(null)}>
                <div style={{
                  width: "100%", maxWidth: 52, height: anim ? h : 0, minHeight: m.total > 0 ? 8 : 0,
                  background: isHov ? "linear-gradient(to top, #14a085, #3dd9b5)" : "linear-gradient(to top, #0f6b57, #14a085)",
                  borderRadius: "8px 8px 0 0",
                  transition: `height 0.9s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.1}s, background 0.3s ease`,
                  cursor: "pointer",
                  boxShadow: isHov ? "0 -6px 20px rgba(15,107,87,0.35)" : `0 -2px ${Math.max(4, h * 0.06)}px rgba(15,107,87,0.15)`,
                }} />
                <span style={{ fontSize: "0.6875rem", color: "#6b7280", marginTop: 8, fontWeight: 500 }}>{m.month}</span>
                {isHov && (
                  <div style={{
                    position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)",
                    background: "linear-gradient(135deg, #1a2332, #2d3748)", color: "#fff",
                    padding: "10px 14px", borderRadius: 12, fontSize: "0.6875rem", whiteSpace: "nowrap",
                    zIndex: 50, marginBottom: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                    animation: "fadeSlideUp 0.2s ease forwards",
                  }}>
                    <div style={{ fontWeight: 800, fontSize: "0.875rem", marginBottom: 6, color: "#3dd9b5" }}>{m.total.toLocaleString()} SAR</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <span>◆ {isRtl ? "كراسات" : "Krasat"}: {m.krasat.toLocaleString()}</span>
                      <span>◆ {isRtl ? "إشراف" : "Supervision"}: {m.supervision.toLocaleString()}</span>
                      <span>◆ {isRtl ? "عقود" : "Contracts"}: {m.contracts.toLocaleString()}</span>
                      <span>◆ {isRtl ? "رسوم" : "Fees"}: {m.fees.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Donut Chart */}
      <div style={{ ...glass, flex: "0 0 calc(40% - 1.25rem)", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <h3 style={{ ...secHead, alignSelf: "flex-start" }}>
          <span style={{ width: 4, height: 20, borderRadius: 2, background: "linear-gradient(to bottom, #c58b2a, #a06d1e)", display: "inline-block" }} />
          {isRtl ? "مصادر الإيرادات" : "Revenue Sources"}
        </h3>
        <div style={{
          width: 180, height: 180, borderRadius: "50%", position: "relative", margin: "0 auto 20px",
          background: donutAnim ? `conic-gradient(${gradParts})` : `conic-gradient(#e5e7eb 0% 100%)`,
          transition: "background 1.2s ease", transform: hovSeg !== null ? "scale(1.05)" : "scale(1)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}>
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.97)",
            display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.05)",
          }}>
            <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "#1a2332" }}>{totalRev.toLocaleString()}</div>
            <div style={{ fontSize: "0.625rem", color: "#6b7280", fontWeight: 600 }}>SAR</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
          {sources.map((s, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
              padding: "6px 10px", borderRadius: 10, transition: "all 0.25s",
              background: hovSeg === i ? `${s.color}12` : "transparent",
              border: hovSeg === i ? `1px solid ${s.color}30` : "1px solid transparent",
            }} onMouseEnter={() => setHovSeg(i)} onMouseLeave={() => setHovSeg(null)}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: s.color, boxShadow: `0 2px 6px ${s.color}40` }} />
                <span style={{ fontSize: "0.8125rem", color: "#374151", fontWeight: 500 }}>{s.label}</span>
              </div>
              <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1a2332" }}>{s.value.toLocaleString()} SAR</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
