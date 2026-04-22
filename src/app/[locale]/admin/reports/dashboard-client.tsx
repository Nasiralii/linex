"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import KPICards from "./kpi-cards";
import RevenueCharts from "./revenue-charts";
import PipelineChart from "./pipeline-chart";
import DrillDownTable from "./drill-down-table";

export interface DashboardProps {
  isRtl: boolean;
  kpi: { totalRevenue: number; activeProjects: number; totalUsers: number; avgBidScore: number };
  revenue: { krasat: number; supervision: number; contracts: number; platformFees: number };
  monthlyRevenue: { month: string; total: number; krasat: number; supervision: number; contracts: number; fees: number }[];
  users: { owners: number; contractors: number; engineers: number; verified: number; pending: number };
  pipeline: { status: string; count: number; projects: { id: string; title: string }[] }[];
  projects: {
    id: string; title: string; titleAr?: string; owner: string; type: string;
    status: string; bidsCount: number; awardAmount: number | null;
    awardContractor: string | null; createdAt: string;
    bids: { company: string; amount: number; status: string; score: number; confidence?: string | null; fallbackCount?: number; missingCount?: number; note?: string | null; rankedAt?: string | null }[];
  }[];
  performers: { rank: number; name: string; rating: number; projects: number; reviews: number }[];
  drilldowns?: {
    totalUsers: { label: string; sublabel: string }[];
    activeProjects: { label: string; sublabel: string }[];
    totalRevenue: { label: string; sublabel: string }[];
    avgBidScore: { label: string; sublabel: string }[];
  };
}

type Period = "month" | "quarter" | "year" | "all";

export default function DashboardClient(props: DashboardProps) {
  const [period, setPeriod] = useState<Period>("all");
  const [selectedKpi, setSelectedKpi] = useState<keyof NonNullable<DashboardProps["drilldowns"]> | null>(null);
  const { isRtl } = props;
  const pathname = usePathname();

  const periods: { key: Period; en: string; ar: string }[] = [
    { key: "month", en: "This Month", ar: "هذا الشهر" },
    { key: "quarter", en: "This Quarter", ar: "هذا الربع" },
    { key: "year", en: "This Year", ar: "هذا العام" },
    { key: "all", en: "All Time", ar: "الكل" },
  ];

  const Section = ({ title, titleAr, children }: { title: string; titleAr: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: "0.5rem" }}>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#1a2332", marginBottom: "1.25rem", paddingBottom: 8,
        borderBottom: "3px solid transparent", borderImage: "linear-gradient(90deg, #c58b2a, #a06d1e, transparent) 1" }}>
        {isRtl ? titleAr : title}
      </h2>
      {children}
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Date Range Filter */}
      <div className="flex flex-wrap gap-3 mb-8 items-center"
        style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", padding: "12px 16px", borderRadius: 16,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(255,255,255,0.8)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1a2332" }}>
            {isRtl ? "من:" : "From:"}
          </label>
          <input type="date" id="dateFrom" style={{
            padding: "6px 12px", borderRadius: 8, fontSize: "0.8125rem", border: "1px solid #d1d5db",
            background: "white", cursor: "pointer",
          }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#1a2332" }}>
            {isRtl ? "إلى:" : "To:"}
          </label>
          <input type="date" id="dateTo" style={{
            padding: "6px 12px", borderRadius: 8, fontSize: "0.8125rem", border: "1px solid #d1d5db",
            background: "white", cursor: "pointer",
          }} />
        </div>
        <button onClick={() => {
          const from = (document.getElementById("dateFrom") as HTMLInputElement)?.value;
          const to = (document.getElementById("dateTo") as HTMLInputElement)?.value;
          const params = new URLSearchParams();
          if (from) params.set("from", from);
          if (to) params.set("to", to);
          window.location.href = `${pathname}?${params.toString()}`;
        }} style={{
          padding: "8px 20px", borderRadius: 20, fontSize: "0.8125rem", fontWeight: 600,
          border: "none", cursor: "pointer", transition: "all 0.3s ease",
          background: "linear-gradient(135deg, #0f6b57, #0a4e41)", color: "#fff",
          boxShadow: "0 4px 12px rgba(15,107,87,0.3)",
        }}>
          {isRtl ? "تطبيق" : "Apply"}
        </button>
        <button onClick={() => {
          window.location.href = pathname;
        }} style={{
          padding: "8px 20px", borderRadius: 20, fontSize: "0.8125rem", fontWeight: 600,
          border: "1px solid #d1d5db", cursor: "pointer", transition: "all 0.3s ease",
          background: "transparent", color: "#6b7280",
        }}>
          {isRtl ? "إعادة تعيين" : "Reset"}
        </button>
      </div>

      <Section title="Key Performance Indicators" titleAr="مؤشرات الأداء الرئيسية">
        <KPICards data={props.kpi} revenue={props.revenue} isRtl={isRtl} selectedKey={selectedKpi || undefined} onSelect={(key) => setSelectedKpi((prev) => prev === key as any ? null : key as any)} />
        {selectedKpi && props.drilldowns?.[selectedKpi] && (
          <div className="card" style={{ padding: "1.25rem", marginTop: "-0.75rem", marginBottom: "1.5rem", border: "1px solid var(--border-light)" }}>
            <div style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#1a2332", marginBottom: "0.75rem" }}>
              {selectedKpi === "totalUsers"
                ? (isRtl ? "تفاصيل المستخدمين" : "Users Details")
                : selectedKpi === "activeProjects"
                  ? (isRtl ? "تفاصيل المشاريع النشطة" : "Active Projects Details")
                  : selectedKpi === "totalRevenue"
                    ? (isRtl ? "تفاصيل الإيرادات" : "Revenue Details")
                    : (isRtl ? "تفاصيل تقييم العروض" : "Bid Score Details")}
            </div>
            <div style={{ display: "grid", gap: "0.5rem" }}>
              {props.drilldowns[selectedKpi].length === 0 ? (
                <div style={{ fontSize: "0.8125rem", color: "#6b7280" }}>{isRtl ? "لا توجد بيانات" : "No data available"}</div>
              ) : props.drilldowns[selectedKpi].map((item, index) => (
                <div key={`${selectedKpi}-${index}`} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "0.75rem 0.875rem", borderRadius: 12, background: "#faf9f6", border: "1px solid #ece7dc" }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1a2332" }}>{item.label}</span>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{item.sublabel}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section title="Revenue Analytics" titleAr="تحليلات الإيرادات">
        <RevenueCharts revenue={props.revenue} monthlyRevenue={props.monthlyRevenue} isRtl={isRtl} />
      </Section>

      <Section title="Pipeline & Users" titleAr="خط سير المشاريع والمستخدمين">
        <PipelineChart pipeline={props.pipeline} users={props.users} isRtl={isRtl} />
      </Section>

      <Section title="Projects & Top Performers" titleAr="المشاريع وأفضل المقاولين">
        <DrillDownTable projects={props.projects} performers={props.performers} isRtl={isRtl} />
      </Section>
    </>
  );
}
