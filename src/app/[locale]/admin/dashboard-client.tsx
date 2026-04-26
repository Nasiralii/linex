"use client";

import { useMemo, useState } from "react";
import { DollarSign, FolderOpen, ShieldCheck, Users, Clock, BarChart3 } from "lucide-react";

interface DrillItem {
  label: string;
  sublabel: string;
}

interface AdminDashboardClientProps {
  isRtl: boolean;
  stats: {
    totalUsers: number;
    totalProjects: number;
    verifiedContractors: number;
    totalAwards: number;
    pendingProjects: number;
    pendingVerifications: number;
    totalOwners: number;
    totalContractors: number;
    totalEngineers: number;
    publishedProjects: number;
    totalBids: number;
    totalCategories: number;
    totalLocations: number;
  };
  recentUsers: { id: string; email: string; role: string; status: string; createdAt: string; ownerProfile?: { verificationStatus?: string }; contractorProfile?: { verificationStatus?: string }; engineerProfile?: { verificationStatus?: string } }[];
  drilldowns: {
    totalUsers: DrillItem[];
    totalProjects: DrillItem[];
    verifiedContractors: DrillItem[];
    totalAwards: DrillItem[];
    pendingProjects: DrillItem[];
    pendingVerifications: DrillItem[];
    totalOwners: DrillItem[];
    totalContractors: DrillItem[];
    totalEngineers: DrillItem[];
    publishedProjects: DrillItem[];
    totalBids: DrillItem[];
    totalCategories: DrillItem[];
    totalLocations: DrillItem[];
  };
}

type DrillKey = keyof AdminDashboardClientProps["drilldowns"];

const KPI_CONFIG = [
  { key: "totalUsers", icon: Users, color: "#2563eb", bg: "#eff6ff" },
  { key: "totalProjects", icon: FolderOpen, color: "#2A7B88", bg: "#E8F4F6" },
  { key: "verifiedContractors", icon: ShieldCheck, color: "#7c3aed", bg: "#f5f3ff" },
  { key: "totalAwards", icon: DollarSign, color: "#B87333", bg: "#F5EDE6" },
] as const;

const DETAIL_TITLES: Record<string, { en: string; ar: string }> = {
  totalUsers: { en: "Registered Users Details", ar: "تفاصيل المستخدمين" },
  totalProjects: { en: "Projects Details", ar: "تفاصيل المشاريع" },
  verifiedContractors: { en: "Verified Contractors", ar: "المقاولون الموثقون" },
  totalAwards: { en: "Awards Details", ar: "تفاصيل الترسيات" },
  pendingProjects: { en: "Pending Projects", ar: "المشاريع المعلقة" },
  pendingVerifications: { en: "Pending Verifications", ar: "طلبات التحقق المعلقة" },
  totalOwners: { en: "Owners", ar: "ملاك المشاريع" },
  totalContractors: { en: "Contractors", ar: "المقاولون" },
  totalEngineers: { en: "Engineers", ar: "المهندسون" },
  publishedProjects: { en: "Published Projects", ar: "المشاريع المنشورة" },
  totalBids: { en: "Submitted Bids", ar: "العروض المقدمة" },
  totalCategories: { en: "Categories", ar: "التصنيفات" },
  totalLocations: { en: "Locations", ar: "المواقع" },
};

export default function AdminDashboardClient({ isRtl, stats, recentUsers, drilldowns }: AdminDashboardClientProps) {
  const [selectedKey, setSelectedKey] = useState<DrillKey | null>(null);

  const kpis = useMemo(() => ([
    { ...KPI_CONFIG[0], label: isRtl ? "إجمالي المستخدمين" : "Total Users", value: stats.totalUsers },
    { ...KPI_CONFIG[1], label: isRtl ? "إجمالي المشاريع" : "Total Projects", value: stats.totalProjects },
    { ...KPI_CONFIG[2], label: isRtl ? "مقاولون موثقون" : "Verified Contractors", value: stats.verifiedContractors },
    { ...KPI_CONFIG[3], label: isRtl ? "إجمالي الترسيات" : "Total Awards", value: stats.totalAwards },
  ]), [isRtl, stats]);

  const detailItems = selectedKey ? (drilldowns[selectedKey] || []) : [];

  const statTiles = [
    { key: "totalOwners" as DrillKey, label: isRtl ? "ملاك مشاريع" : "Owners", value: stats.totalOwners },
    { key: "totalContractors" as DrillKey, label: isRtl ? "مقاولون" : "Contractors", value: stats.totalContractors },
    { key: "totalEngineers" as DrillKey, label: isRtl ? "مهندسون" : "Engineers", value: stats.totalEngineers },
    { key: "publishedProjects" as DrillKey, label: isRtl ? "مشاريع منشورة" : "Published", value: stats.publishedProjects },
    { key: "totalBids" as DrillKey, label: isRtl ? "عروض مقدمة" : "Bids", value: stats.totalBids },
    { key: "totalCategories" as DrillKey, label: isRtl ? "تصنيفات" : "Categories", value: stats.totalCategories },
    { key: "totalLocations" as DrillKey, label: isRtl ? "مواقع" : "Locations", value: stats.totalLocations },
  ];

  const pendingTiles = [
    { key: "pendingProjects" as DrillKey, label: isRtl ? "مشاريع بانتظار المراجعة" : "Projects awaiting review", value: stats.pendingProjects, color: "var(--warning)" },
    { key: "pendingVerifications" as DrillKey, label: isRtl ? "مستخدمون بانتظار التحقق" : "Users awaiting verification", value: stats.pendingVerifications, color: "var(--info)" },
  ];

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
        {kpis.map((kpi) => (
          <button
            key={kpi.key}
            onClick={() => setSelectedKey((prev) => (prev === kpi.key ? null : kpi.key))}
            className="card"
            style={{
              padding: "1.5rem",
              textAlign: isRtl ? "right" : "left",
              cursor: "pointer",
              border: selectedKey === kpi.key ? "2px solid var(--primary)" : "1px solid var(--border-light)",
              background: selectedKey === kpi.key ? "linear-gradient(180deg, #ffffff, #f8fbff)" : "white",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-xl)", background: kpi.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <kpi.icon style={{ width: "22px", height: "22px", color: kpi.color }} />
              </div>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.25rem", fontWeight: 500 }}>{kpi.label}</div>
          </button>
        ))}
      </div>

      {selectedKey && (
        <div className="card" style={{ padding: "1.25rem", marginBottom: "2rem", border: "1px solid var(--border-light)" }}>
          <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.75rem" }}>
            {isRtl ? DETAIL_TITLES[selectedKey].ar : DETAIL_TITLES[selectedKey].en}
          </div>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {detailItems.length === 0 ? (
              <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{isRtl ? "لا توجد بيانات متاحة" : "No details available"}</div>
            ) : detailItems.map((item, index) => (
              <div key={`${selectedKey}-${index}`} style={{ display: "flex", justifyContent: "space-between", gap: "1rem", padding: "0.75rem 0.875rem", borderRadius: 12, background: "#faf9f6", border: "1px solid #ece7dc" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1a2332" }}>{item.label}</span>
                <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{item.sublabel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Clock style={{ width: "18px", height: "18px", color: "var(--accent)" }} />
            {isRtl ? "إجراءات معلقة" : "Pending Actions"}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {pendingTiles.map((item) => (
              <button
                key={item.key}
                onClick={() => setSelectedKey((prev) => (prev === item.key ? null : item.key))}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.75rem 1rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)",
                  border: selectedKey === item.key ? `1px solid ${item.color}` : "1px solid transparent", cursor: "pointer", textAlign: isRtl ? "right" : "left",
                }}
              >
                <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{item.label}</span>
                <span style={{ padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", background: `${item.color}15`, color: item.color, fontSize: "0.875rem", fontWeight: 700 }}>{item.value}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <BarChart3 style={{ width: "18px", height: "18px", color: "var(--primary)" }} />
            {isRtl ? "إحصائيات المنصة" : "Platform Stats"}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {statTiles.map((stat) => (
              <button
                key={stat.key}
                onClick={() => setSelectedKey((prev) => (prev === stat.key ? null : stat.key))}
                style={{
                  padding: "0.75rem", borderRadius: "var(--radius-md)", background: selectedKey === stat.key ? "#eef6ff" : "var(--surface-2)", textAlign: "center",
                  border: selectedKey === stat.key ? "1px solid #bfdbfe" : "1px solid transparent", cursor: "pointer",
                }}
              >
                <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text)" }}>{stat.value}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{stat.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>
          {isRtl ? "آخر المستخدمين المسجلين" : "Recent Users"}
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "0.75rem 1rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)", fontWeight: 600 }}>{isRtl ? "البريد الإلكتروني" : "Email"}</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)", fontWeight: 600 }}>{isRtl ? "الدور" : "Role"}</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)", fontWeight: 600 }}>{isRtl ? "الحالة" : "Status"}</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)", fontWeight: 600 }}>{isRtl ? "التاريخ" : "Date"}</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--text)" }}>{u.email}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span className={`chip chip-${u.role === "OWNER" ? "info" : u.role === "CONTRACTOR" ? "success" : "warning"}`} style={{ fontSize: "0.6875rem" }}>
                      {u.role === "OWNER" ? (isRtl ? "مالك مشروع" : "Owner") : u.role === "CONTRACTOR" ? (isRtl ? "مقاول" : "Contractor") : (isRtl ? "مهندس" : "Engineer")}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span className={`chip chip-${(u.ownerProfile?.verificationStatus || u.contractorProfile?.verificationStatus || u.engineerProfile?.verificationStatus || u.status) === "VERIFIED" ? "success" : (u.ownerProfile?.verificationStatus || u.contractorProfile?.verificationStatus || u.engineerProfile?.verificationStatus || u.status) === "PENDING" ? "warning" : "default"}`} style={{ fontSize: "0.6875rem" }}>
                      {u.ownerProfile?.verificationStatus || u.contractorProfile?.verificationStatus || u.engineerProfile?.verificationStatus || u.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{u.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
