"use client";

const STATUS_CONFIG: Record<string, { ar: string; en: string; color: string; bg: string }> = {
  DRAFT: { ar: "مسودة", en: "Draft", color: "#6b7280", bg: "#f3f4f6" },
  PENDING_REVIEW: { ar: "قيد المراجعة", en: "Under Review", color: "#d97706", bg: "#fef3c7" },
  CHANGES_REQUESTED: { ar: "تعديلات مطلوبة", en: "Changes Requested", color: "#dc2626", bg: "#fee2e2" },
  PUBLISHED: { ar: "منشور", en: "Published", color: "#0f6b57", bg: "#e8f5f0" },
  BIDDING: { ar: "مفتوح للعروض", en: "Bidding", color: "#2563eb", bg: "#dbeafe" },
  AWARDED: { ar: "مُرسى", en: "Awarded", color: "#7c3aed", bg: "#f5f3ff" },
  IN_PROGRESS: { ar: "قيد التنفيذ", en: "In Progress", color: "#c58b2a", bg: "#fdf4e4" },
  COMPLETED: { ar: "مكتمل", en: "Completed", color: "#059669", bg: "#d1fae5" },
  ARCHIVED: { ar: "مؤرشف", en: "Archived", color: "#6b7280", bg: "#f3f4f6" },
  CANCELLED: { ar: "ملغي", en: "Cancelled", color: "#dc2626", bg: "#fee2e2" },
};

export function ProjectStatusChip({ status, locale }: { status: string; locale: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  const isRtl = locale === "ar";
  return (
    <span style={{
      display: "inline-block",
      padding: "0.125rem 0.625rem",
      borderRadius: "var(--radius-full)",
      fontSize: "0.75rem",
      fontWeight: 600,
      color: cfg.color,
      background: cfg.bg,
    }}>
      {isRtl ? cfg.ar : cfg.en}
    </span>
  );
}
