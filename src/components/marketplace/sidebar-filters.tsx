"use client";

import { useState } from "react";

interface SidebarFiltersProps {
  params: { category?: string; search?: string; type?: string };
  locale: string;
  isRtl: boolean;
  filtersTitle: string;
  filtersClearAll: string;
  categories: Array<{ id: string; name: string; nameAr: string; slug?: string | null }>;
}

const TYPE_TABS = [
  { key: "", labelAr: "الكل", labelEn: "All" },
  { key: "CONSTRUCTION_ONLY", labelAr: "مقاولات", labelEn: "Construction" },
  { key: "DESIGN_ONLY", labelAr: "تصميم", labelEn: "Design" },
  { key: "DESIGN_AND_CONSTRUCTION", labelAr: "تصميم وتنفيذ", labelEn: "Design & Construction" },
];

function buildHref(locale: string, overrides: Record<string, string | undefined>, base: Record<string, string | undefined>) {
  const merged = { ...base, ...overrides };
  const qs = Object.entries(merged).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join("&");
  return `/${locale}/marketplace${qs ? `?${qs}` : ""}`;
}

function FilterContent({ params, locale, isRtl, filtersTitle, filtersClearAll, categories, onClose }: {
  params: SidebarFiltersProps["params"];
  locale: string;
  isRtl: boolean;
  filtersTitle: string;
  filtersClearAll: string;
  categories: SidebarFiltersProps["categories"];
  onClose?: () => void;
}) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>
          {filtersTitle}
        </h3>
        {onClose && (
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
              <line x1="18" x2="6" y1="6" y2="18" /><line x1="6" x2="18" y1="6" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Project Type Tabs */}
      <div style={{ display: "grid", gap: "0.375rem", marginBottom: "1rem" }}>
        {TYPE_TABS.map((t) => (
          <a key={t.key} href={buildHref(locale, { type: t.key || undefined }, { search: params.search })} style={{
            flex: 1, padding: "0.375rem", borderRadius: "var(--radius-md)", fontSize: "0.6875rem",
            fontWeight: 600, textAlign: "center", textDecoration: "none", transition: "all 150ms",
            background: params.type === t.key || (!params.type && !t.key) ? "var(--primary)" : "var(--surface-2)",
            color: params.type === t.key || (!params.type && !t.key) ? "white" : "var(--text-muted)",
          }}>
            {isRtl ? t.labelAr : t.labelEn}
          </a>
        ))}
      </div>

      {/* DB-backed Categories */}
      <div style={{ marginBottom: "0.75rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text)", padding: "0.375rem 0" }}>
          {isRtl ? "التخصصات" : "Categories"}
        </div>
        {categories.map((cat) => {
          const isActive = params.category === cat.id;
          const href = isActive
            ? buildHref(locale, { category: undefined }, { search: params.search, type: params.type })
            : buildHref(locale, { category: cat.id }, { search: params.search, type: params.type });
          return (
            <a key={cat.id} href={href} style={{
              display: "block", padding: "0.375rem 0.5rem",
              borderRadius: "var(--radius-md)", fontSize: "0.8125rem", fontWeight: 500,
              textDecoration: "none", transition: "all 150ms ease",
              color: isActive ? "var(--primary)" : "var(--text-secondary)",
              background: isActive ? "var(--primary-light)" : "transparent",
            }}>
              {isRtl ? cat.nameAr : cat.name}
            </a>
          );
        })}
      </div>

      {(params.category || params.type) && (
        <a href={`/${locale}/marketplace`} style={{
          display: "block", marginTop: "0.5rem", padding: "0.5rem",
          borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
          textAlign: "center", fontSize: "0.75rem", fontWeight: 500,
          color: "var(--text-muted)", textDecoration: "none",
        }}>
          {filtersClearAll}
        </a>
      )}
    </>
  );
}

export function SidebarFilters({ params, locale, isRtl, filtersTitle, filtersClearAll, categories }: SidebarFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden" style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-lg)",
            background: "var(--primary)",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" />
            <line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" />
            <line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" />
            <line x1="1" x2="7" y1="14" y2="14" /><line x1="9" x2="15" y1="8" y2="8" /><line x1="17" x2="23" y1="16" y2="16" />
          </svg>
          {filtersTitle}
        </button>
        
        {isOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 1000,
            }}
            onClick={() => setIsOpen(false)}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "var(--surface)",
                overflowY: "auto",
                padding: "1.5rem",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <FilterContent params={params} locale={locale} isRtl={isRtl} filtersTitle={filtersTitle} filtersClearAll={filtersClearAll} categories={categories} onClose={() => setIsOpen(false)} />
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block" style={{ width: "280px", flexShrink: 0 }}>
        <div className="card" style={{ padding: "1.25rem", position: "sticky", top: "96px" }}>
          <FilterContent params={params} locale={locale} isRtl={isRtl} filtersTitle={filtersTitle} filtersClearAll={filtersClearAll} categories={categories} />
        </div>
      </aside>
    </>
  );
}
