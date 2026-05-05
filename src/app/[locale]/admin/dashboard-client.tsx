"use client";

import { useEffect, useMemo, useState } from "react";
import { DollarSign, FolderOpen, ShieldCheck, Users, Clock, BarChart3 } from "lucide-react";

interface DrillItem {
  label: string;
  sublabel: string;
  href?: string;
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
  approvedActiveUsers: { id: string; email: string; role: string; createdAt: string; ownerProfile?: { verificationStatus?: string }; contractorProfile?: { verificationStatus?: string }; engineerProfile?: { verificationStatus?: string } }[];
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

export default function AdminDashboardClient({ isRtl, stats, recentUsers, approvedActiveUsers, drilldowns }: AdminDashboardClientProps) {
  const [selectedKey, setSelectedKey] = useState<DrillKey | null>(null);
  const [detailPage, setDetailPage] = useState(1);
  const DETAIL_PAGE_SIZE = 12;
  const [approvedPage, setApprovedPage] = useState(1);
  const [approvedRoleFilter, setApprovedRoleFilter] = useState<"ALL" | "OWNER" | "CONTRACTOR" | "ENGINEER">("ALL");
  const APPROVED_PAGE_SIZE = 8;

  const kpis = useMemo(() => ([
    { ...KPI_CONFIG[0], label: isRtl ? "إجمالي المستخدمين" : "Total Users", value: stats.totalUsers },
    { ...KPI_CONFIG[1], label: isRtl ? "إجمالي المشاريع" : "Total Projects", value: stats.totalProjects },
    { ...KPI_CONFIG[2], label: isRtl ? "مقاولون موثقون" : "Verified Contractors", value: stats.verifiedContractors },
    { ...KPI_CONFIG[3], label: isRtl ? "إجمالي الترسيات" : "Total Awards", value: stats.totalAwards },
  ]), [isRtl, stats]);

  const detailItems = selectedKey ? (drilldowns[selectedKey] || []) : [];
  const totalDetailPages = Math.max(1, Math.ceil(detailItems.length / DETAIL_PAGE_SIZE));
  const safeDetailPage = Math.min(detailPage, totalDetailPages);
  const pagedDetailItems = detailItems.slice((safeDetailPage - 1) * DETAIL_PAGE_SIZE, safeDetailPage * DETAIL_PAGE_SIZE);
  const detailPageItems: Array<number | "ellipsis"> = [];
  const detailStartPage = Math.min(safeDetailPage, Math.max(1, totalDetailPages - 1));
  const filteredApprovedUsers = approvedRoleFilter === "ALL"
    ? approvedActiveUsers
    : approvedActiveUsers.filter((u) => u.role === approvedRoleFilter);
  const approvedTotalPages = Math.max(1, Math.ceil(filteredApprovedUsers.length / APPROVED_PAGE_SIZE));
  const safeApprovedPage = Math.min(approvedPage, approvedTotalPages);
  const pagedApprovedUsers = filteredApprovedUsers.slice((safeApprovedPage - 1) * APPROVED_PAGE_SIZE, safeApprovedPage * APPROVED_PAGE_SIZE);
  const approvedPageItems: Array<number | "ellipsis"> = [];
  const approvedStartPage = Math.min(safeApprovedPage, Math.max(1, approvedTotalPages - 1));

  if (totalDetailPages <= 2) {
    detailPageItems.push(1);
    if (totalDetailPages === 2) detailPageItems.push(2);
  } else if (detailStartPage >= totalDetailPages - 1) {
    detailPageItems.push(1, "ellipsis", totalDetailPages - 1, totalDetailPages);
  } else {
    detailPageItems.push(detailStartPage);
    if (detailStartPage + 1 <= totalDetailPages) detailPageItems.push(detailStartPage + 1);
    detailPageItems.push("ellipsis", totalDetailPages);
  }

  if (approvedTotalPages <= 2) {
    approvedPageItems.push(1);
    if (approvedTotalPages === 2) approvedPageItems.push(2);
  } else if (approvedStartPage >= approvedTotalPages - 1) {
    approvedPageItems.push(1, "ellipsis", approvedTotalPages - 1, approvedTotalPages);
  } else {
    approvedPageItems.push(approvedStartPage);
    if (approvedStartPage + 1 <= approvedTotalPages) approvedPageItems.push(approvedStartPage + 1);
    approvedPageItems.push("ellipsis", approvedTotalPages);
  }

  useEffect(() => {
    setDetailPage(1);
  }, [selectedKey]);

  useEffect(() => {
    if (detailPage > totalDetailPages) setDetailPage(totalDetailPages);
  }, [detailPage, totalDetailPages]);

  useEffect(() => {
    if (approvedPage > approvedTotalPages) setApprovedPage(approvedTotalPages);
  }, [approvedPage, approvedTotalPages]);
  useEffect(() => {
    setApprovedPage(1);
  }, [approvedRoleFilter]);

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
            ) : pagedDetailItems.map((item, index) => {
              const row = (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    padding: "0.75rem 0.875rem",
                    borderRadius: 12,
                    background: "#faf9f6",
                    border: "1px solid #ece7dc",
                  }}
                >
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1a2332" }}>{item.label}</span>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{item.sublabel}</span>
                </div>
              );

              if (!item.href) {
                return <div key={`${selectedKey}-${index}`}>{row}</div>;
              }

              return (
                <a
                  key={`${selectedKey}-${index}`}
                  href={item.href}
                  style={{ textDecoration: "none", color: "inherit", display: "block" }}
                >
                  {row}
                </a>
              );
            })}
          </div>
          {detailItems.length > DETAIL_PAGE_SIZE && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "0.875rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setDetailPage((prev) => Math.max(1, prev - 1))}
                disabled={safeDetailPage <= 1}
                style={{
                  pointerEvents: safeDetailPage <= 1 ? "none" : "auto",
                  opacity: safeDetailPage <= 1 ? 0.5 : 1,
                  textDecoration: "none",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--primary)",
                  border: "1px solid var(--border-light)",
                  background: "var(--surface)",
                  borderRadius: "var(--radius-full)",
                  padding: "0.375rem 0.75rem",
                }}
              >
                {isRtl ? "السابق" : "Previous"}
              </button>
              {detailPageItems.map((item, idx) => {
                if (item === "ellipsis") {
                  return (
                    <span key={`detail-ellipsis-${idx}`} style={{ fontSize: "0.8125rem", color: "var(--text-muted)", padding: "0 0.25rem" }}>
                      ...
                    </span>
                  );
                }

                const isActive = item === safeDetailPage;
                return (
                  <button
                    key={`detail-page-${item}`}
                    type="button"
                    onClick={() => setDetailPage(item)}
                    aria-current={isActive ? "page" : undefined}
                    style={{
                      minWidth: "34px",
                      height: "34px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8125rem",
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? "white" : "var(--text)",
                      background: isActive ? "var(--primary)" : "var(--surface)",
                      border: isActive ? "1px solid var(--primary)" : "1px solid var(--border-light)",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    {item}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setDetailPage((prev) => Math.min(totalDetailPages, prev + 1))}
                disabled={safeDetailPage >= totalDetailPages}
                style={{
                  pointerEvents: safeDetailPage >= totalDetailPages ? "none" : "auto",
                  opacity: safeDetailPage >= totalDetailPages ? 0.5 : 1,
                  textDecoration: "none",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--primary)",
                  border: "1px solid var(--border-light)",
                  background: "var(--surface)",
                  borderRadius: "var(--radius-full)",
                  padding: "0.375rem 0.75rem",
                }}
              >
                {isRtl ? "التالي" : "Next"}
              </button>
            </div>
          )}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-4">
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

        <div className="card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>
              {isRtl ? "المستخدمون النشطون المعتمدون" : "Approved Active Users"}
            </h3>
            <select
              value={approvedRoleFilter}
              onChange={(e) => setApprovedRoleFilter(e.target.value as "ALL" | "OWNER" | "CONTRACTOR" | "ENGINEER")}
              style={{ padding: "0.375rem 0.625rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-light)", background: "var(--surface)", color: "var(--text)", fontSize: "0.8125rem" }}
            >
              <option value="ALL">{isRtl ? "الكل" : "All roles"}</option>
              <option value="OWNER">{isRtl ? "مالك مشروع" : "Owner"}</option>
              <option value="CONTRACTOR">{isRtl ? "مقاول" : "Contractor"}</option>
              <option value="ENGINEER">{isRtl ? "مهندس" : "Engineer"}</option>
            </select>
          </div>
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
                {pagedApprovedUsers.map((u) => {
                  const verificationStatus = u.ownerProfile?.verificationStatus || u.contractorProfile?.verificationStatus || u.engineerProfile?.verificationStatus || "ACTIVE";
                  return (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "0.75rem 1rem", color: "var(--text)" }}>{u.email}</td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span className={`chip chip-${u.role === "OWNER" ? "info" : u.role === "CONTRACTOR" ? "success" : "warning"}`} style={{ fontSize: "0.6875rem" }}>
                          {u.role === "OWNER" ? (isRtl ? "مالك مشروع" : "Owner") : u.role === "CONTRACTOR" ? (isRtl ? "مقاول" : "Contractor") : (isRtl ? "مهندس" : "Engineer")}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span className="chip chip-success" style={{ fontSize: "0.6875rem" }}>{verificationStatus}</span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", color: "var(--text-muted)" }}>{u.createdAt}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredApprovedUsers.length > APPROVED_PAGE_SIZE && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "0.875rem", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setApprovedPage((prev) => Math.max(1, prev - 1))}
                disabled={safeApprovedPage <= 1}
                style={{
                  pointerEvents: safeApprovedPage <= 1 ? "none" : "auto",
                  opacity: safeApprovedPage <= 1 ? 0.5 : 1,
                  textDecoration: "none",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--primary)",
                  border: "1px solid var(--border-light)",
                  background: "var(--surface)",
                  borderRadius: "var(--radius-full)",
                  padding: "0.375rem 0.75rem",
                }}
              >
                {isRtl ? "السابق" : "Previous"}
              </button>
              {approvedPageItems.map((item, idx) => {
                if (item === "ellipsis") {
                  return (
                    <span key={`approved-ellipsis-${idx}`} style={{ fontSize: "0.8125rem", color: "var(--text-muted)", padding: "0 0.25rem" }}>
                      ...
                    </span>
                  );
                }

                const isActive = item === safeApprovedPage;
                return (
                  <button
                    key={`approved-page-${item}`}
                    type="button"
                    onClick={() => setApprovedPage(item)}
                    aria-current={isActive ? "page" : undefined}
                    style={{
                      minWidth: "34px",
                      height: "34px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8125rem",
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? "white" : "var(--text)",
                      background: isActive ? "var(--primary)" : "var(--surface)",
                      border: isActive ? "1px solid var(--primary)" : "1px solid var(--border-light)",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    {item}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setApprovedPage((prev) => Math.min(approvedTotalPages, prev + 1))}
                disabled={safeApprovedPage >= approvedTotalPages}
                style={{
                  pointerEvents: safeApprovedPage >= approvedTotalPages ? "none" : "auto",
                  opacity: safeApprovedPage >= approvedTotalPages ? 0.5 : 1,
                  textDecoration: "none",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--primary)",
                  border: "1px solid var(--border-light)",
                  background: "var(--surface)",
                  borderRadius: "var(--radius-full)",
                  padding: "0.375rem 0.75rem",
                }}
              >
                {isRtl ? "التالي" : "Next"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
