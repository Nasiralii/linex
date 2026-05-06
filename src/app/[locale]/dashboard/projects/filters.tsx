"use client";

import { useRouter, useSearchParams } from "next/navigation";

const FILTERS = [
  { key: "ALL", ar: "الكل", en: "All" },
  { key: "DRAFT", ar: "المسودات", en: "Drafts" },
  { key: "PENDING_REVIEW", ar: "قيد المراجعة", en: "Under Review" },
  { key: "BIDDING", ar: "مفتوح للعروض", en: "Bidding" },
  // { key: "AWARDED", ar: "مُرسى", en: "Awarded" }, // Disabled: award now maps to completed flow.
  { key: "IN_PROGRESS", ar: "قيد التنفيذ", en: "In Progress" },
  { key: "COMPLETED", ar: "مكتمل", en: "Completed" },
  { key: "EXPIRED", ar: "منتهية", en: "Expired" },
  { key: "CANCELLED", ar: "المرفوضة", en: "Rejected" },
];

export function ProjectFilters({ activeStatus, locale }: { activeStatus: string; locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRtl = locale === "ar";

  const handleFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "ALL") params.delete("status");
    else params.set("status", key);
    router.push(`?${params.toString()}`);
  };

  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: "0.5rem",
      marginBottom: "1.5rem", paddingBottom: "1rem",
      borderBottom: "1px solid var(--border-light)",
    }}>
      {FILTERS.map((f) => {
        const isActive = activeStatus === f.key;
        return (
          <button
            key={f.key}
            onClick={() => handleFilter(f.key)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "var(--radius-full)",
              fontSize: "0.8125rem",
              fontWeight: isActive ? 700 : 500,
              color: isActive ? "white" : "var(--text-secondary)",
              background: isActive ? "var(--primary)" : "var(--surface-2)",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
          >
            {isRtl ? f.ar : f.en}
          </button>
        );
      })}
    </div>
  );
}
