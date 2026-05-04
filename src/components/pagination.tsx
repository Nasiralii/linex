import { Link } from "@/i18n/routing";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
  locale: string;
}

export function Pagination({ currentPage, totalPages, hrefForPage, locale }: PaginationProps) {
  if (totalPages <= 1) return null;
  const isRtl = locale === "ar";
  const items: Array<number | "ellipsis"> = [];
  const startPage = Math.min(currentPage, Math.max(1, totalPages - 1));

  if (totalPages <= 2) {
    items.push(1);
    if (totalPages === 2) items.push(2);
  } else if (startPage >= totalPages - 1) {
    items.push(1, "ellipsis", totalPages - 1, totalPages);
  } else {
    items.push(startPage);
    if (startPage + 1 <= totalPages) items.push(startPage + 1);
    items.push("ellipsis", totalPages);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
      <Link
        href={currentPage > 1 ? hrefForPage(currentPage - 1) : hrefForPage(1)}
        aria-disabled={currentPage <= 1}
        style={{
          pointerEvents: currentPage <= 1 ? "none" : "auto",
          opacity: currentPage <= 1 ? 0.5 : 1,
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
      </Link>

      {items.map((item, idx) => {
        if (item === "ellipsis") {
          return (
            <span key={`ellipsis-${idx}`} style={{ fontSize: "0.8125rem", color: "var(--text-muted)", padding: "0 0.25rem" }}>
              ...
            </span>
          );
        }

        const isActive = item === currentPage;
        return (
          <Link
            key={`page-${item}`}
            href={hrefForPage(item)}
            aria-current={isActive ? "page" : undefined}
            style={{
              textDecoration: "none",
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
          </Link>
        );
      })}

      <Link
        href={currentPage < totalPages ? hrefForPage(currentPage + 1) : hrefForPage(totalPages)}
        aria-disabled={currentPage >= totalPages}
        style={{
          pointerEvents: currentPage >= totalPages ? "none" : "auto",
          opacity: currentPage >= totalPages ? 0.5 : 1,
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
      </Link>
    </div>
  );
}
