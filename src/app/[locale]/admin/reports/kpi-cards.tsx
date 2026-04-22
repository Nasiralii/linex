"use client";
import { useEffect, useState, useRef } from "react";
import { DollarSign, FolderOpen, Users, Star, TrendingUp, TrendingDown } from "lucide-react";

function useCountUp(target: number, dur = 1600) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, dur]);
  return { val, ref };
}

const SPARKS = [[4,6,5,7,8,6,9],[3,5,4,6,5,7,8],[5,4,6,7,5,8,9],[6,5,3,4,6,5,7]];

function Card({ title, value, icon: Icon, trend, trendLabel, gradient, glow, delay, isCur, sparkIdx, isRtl, onClick, active }: {
  title: string; value: number; icon: any; trend: string; trendLabel: string;
  gradient: string; glow: string; delay: number; isCur: boolean; sparkIdx: number; isRtl: boolean;
  onClick?: () => void;
  active?: boolean;
}) {
  const { val, ref } = useCountUp(value);
  const [h, setH] = useState(false);
  const display = isCur ? `${val.toLocaleString()} SAR` : val.toLocaleString();
  const bars = SPARKS[sparkIdx] || SPARKS[0];

  return (
    <div ref={ref} onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: gradient, borderRadius: 20, padding: "1.5rem 1.25rem", color: "#fff",
      position: "relative", overflow: "hidden", cursor: "pointer",
      animation: `fadeSlideUp 0.6s ease forwards ${delay}s`,
      opacity: 0,
      transition: "transform 0.35s ease, box-shadow 0.35s ease",
      transform: h ? "translateY(-6px)" : "translateY(0)",
      boxShadow: active ? `0 0 0 3px rgba(255,255,255,0.45), 0 12px 40px ${glow}` : h ? `0 12px 40px ${glow}` : "0 4px 24px rgba(0,0,0,0.08)",
    }}>
      {/* Decorative circles */}
      <div style={{ position: "absolute", top: -30, [isRtl ? "left" : "right"]: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
      <div style={{ position: "absolute", bottom: -40, [isRtl ? "right" : "left"]: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, position: "relative", zIndex: 1 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.3)" }}>
          <Icon style={{ width: 22, height: 22 }} />
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          background: trend === "up" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)",
          padding: "3px 10px", borderRadius: 20, fontSize: "0.6875rem", fontWeight: 600,
        }}>
          {trend === "up" ? <TrendingUp style={{ width: 12, height: 12 }} /> : <TrendingDown style={{ width: 12, height: 12 }} />}
          {trendLabel}
        </div>
      </div>

      <div style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: 4, letterSpacing: "-1px", position: "relative", zIndex: 1, lineHeight: 1.1 }}>
        {display}
      </div>
      <div style={{ fontSize: "0.875rem", opacity: 0.8, marginBottom: 12, position: "relative", zIndex: 1 }}>{title}</div>

      {/* Mini sparkline */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 24, position: "relative", zIndex: 1 }}>
        {bars.map((v, i) => (
          <div key={i} style={{
            flex: 1, height: `${(v / 9) * 100}%`, background: "rgba(255,255,255,0.3)",
            borderRadius: 2, transition: `height 0.4s ease ${i * 0.05}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

interface KPIData { totalRevenue: number; activeProjects: number; totalUsers: number; avgBidScore: number }

export default function KPICards({ data, revenue, isRtl, selectedKey, onSelect }: { data: KPIData; revenue: any; isRtl: boolean; selectedKey?: string; onSelect?: (key: string) => void }) {
  const cards = [
    { key: "totalRevenue", title: isRtl ? "إجمالي الإيرادات" : "Total Revenue", value: data.totalRevenue, icon: DollarSign,
      trend: "up", trendLabel: "↑12%", gradient: "linear-gradient(135deg, #0f6b57, #0a4e41)",
      glow: "rgba(15,107,87,0.35)", isCur: true, sparkIdx: 0 },
    { key: "activeProjects", title: isRtl ? "المشاريع النشطة" : "Active Projects", value: data.activeProjects, icon: FolderOpen,
      trend: "up", trendLabel: "↑8%", gradient: "linear-gradient(135deg, #c58b2a, #a06d1e)",
      glow: "rgba(197,139,42,0.35)", isCur: false, sparkIdx: 1 },
    { key: "totalUsers", title: isRtl ? "المستخدمين" : "Registered Users", value: data.totalUsers, icon: Users,
      trend: "up", trendLabel: "↑15%", gradient: "linear-gradient(135deg, #2563eb, #1d4ed8)",
      glow: "rgba(37,99,235,0.35)", isCur: false, sparkIdx: 2 },
    { key: "avgBidScore", title: isRtl ? "تقييم العروض" : "Avg Bid Score", value: data.avgBidScore, icon: Star,
      trend: data.avgBidScore >= 50 ? "up" : "down",
      trendLabel: data.avgBidScore >= 50 ? "↑ Good" : "↓ Low",
      gradient: "linear-gradient(135deg, #0d9488, #0f766e)",
      glow: "rgba(13,148,136,0.35)", isCur: false, sparkIdx: 3 },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem", marginBottom: "2rem" }}>
      {cards.map((c, i) => {
        const { key, ...cardProps } = c;
        return <Card key={key} {...cardProps} delay={i * 0.1} isRtl={isRtl} active={selectedKey === key} onClick={() => onSelect?.(key)} />;
      })}
    </div>
  );
}
