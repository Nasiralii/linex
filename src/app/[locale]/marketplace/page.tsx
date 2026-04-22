import { getTranslations, getLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { db } from "@/lib/db";
import { Search, FolderOpen, X } from "lucide-react";
import { ProjectCard } from "@/components/marketplace/project-card";
import { SidebarFilters } from "@/components/marketplace/sidebar-filters";
import { calculateMatchScore } from "@/lib/match-score";
import { getUserMatchProfile } from "@/lib/user-profile";

export const dynamic = "force-dynamic";

/** Gap 3: Role-based project type visibility */
function getAllowedTypes(role: string): string[] | null {
  if (role === "ENGINEER") return ["DESIGN_ONLY", "DESIGN_AND_CONSTRUCTION"];
  if (role === "CONTRACTOR") return ["CONSTRUCTION_ONLY", "DESIGN_AND_CONSTRUCTION"];
  return null; // OWNER/ADMIN see all
}

const VALID_PROJECT_TYPES = ["CONSTRUCTION_ONLY", "DESIGN_ONLY", "DESIGN_AND_CONSTRUCTION"] as const;

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<{ category?: string; search?: string; type?: string }> }) {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) return redirect({ href: "/auth/login", locale });
  const params = await searchParams;
  const [t, tProject, tCommon] = await Promise.all([getTranslations("marketplace"), getTranslations("project"), getTranslations("common")]);
  const isRtl = locale === "ar";

  let projects: any[] = [];
  let categories: any[] = [];
  try {
    categories = await db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });

    // Build WHERE — Gap 3: role-based visibility
    const where: any = { status: { in: ["PUBLISHED", "BIDDING"] } };
    const allowed = getAllowedTypes(user.role);
    const validType = params.type && VALID_PROJECT_TYPES.includes(params.type as (typeof VALID_PROJECT_TYPES)[number]) ? params.type : undefined;
    const requestedTypeAllowed = validType && (!allowed || allowed.includes(validType));
    if (requestedTypeAllowed) where.projectType = validType;
    else if (allowed) where.projectType = { in: allowed };

    const validCategoryId = params.category && categories.some((c: any) => c.id === params.category) ? params.category : undefined;
    if (validCategoryId) where.categoryId = validCategoryId;

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { titleAr: { contains: params.search, mode: "insensitive" } },
        { description: { contains: params.search, mode: "insensitive" } },
      ];
    }

    projects = await db.project.findMany({ where, orderBy: { publishedAt: "desc" }, include: { category: { select: { name: true, nameAr: true } }, location: { select: { name: true, nameAr: true } }, _count: { select: { bids: true } } } });
  } catch (error) {
    console.error('[MarketplacePage] DB query failed:', error);
  }

  // Gap 1: Smart match scores
  let profile: any = null;
  const scores: Record<string, number> = {};
  try {
    profile = await getUserMatchProfile(user.id, user.role);
    if (profile) {
      for (const p of projects) {
        scores[p.id] = calculateMatchScore(profile, { id: p.id, categoryId: p.categoryId, locationId: p.locationId, budgetMin: p.budgetMin, budgetMax: p.budgetMax, projectType: p.projectType }).score;
      }
    }
  } catch (error) {
    console.error('[MarketplacePage] match scoring failed:', error);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #0a4e41, #0f6b57)", padding: "2.5rem 0 2rem" }}>
        <div className="container-app">
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>{t("title")}</h1>
          <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.7)", marginBottom: "1.5rem" }}>{t("subtitle")}</p>
          <form method="GET" style={{ display: "flex", gap: "0.75rem", maxWidth: "640px" }}>
            {params.category && <input type="hidden" name="category" value={params.category} />}
            <div style={{ flex: 1, position: "relative" }}>
              <Search style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: isRtl ? "auto" : "1rem", left: isRtl ? "1rem" : "auto", width: "20px", height: "20px", color: "var(--text-muted)" }} />
              <input type="text" name="search" defaultValue={params.search || ""} placeholder={t("searchPlaceholder")} style={{ width: "100%", padding: "0.75rem 3rem 0.75rem 1rem", borderRadius: "var(--radius-lg)", border: "none", fontSize: "0.9375rem", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: "0.75rem 1.5rem", fontSize: "0.875rem" }}>{tCommon("search")}</button>
          </form>
        </div>
      </div>
      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        {(params.category || params.search) && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{isRtl ? "تصفية نشطة:" : "Active filters:"}</span>
            {params.category && (() => { const cat = categories.find((c: any) => c.id === params.category); return cat ? (
              <a href={`/${locale}/marketplace${params.search ? `?search=${params.search}` : ""}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.25rem 0.625rem", borderRadius: "var(--radius-full)", background: "var(--primary-light)", color: "var(--primary)", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none" }}>
                {isRtl ? cat.nameAr : cat.name} <X style={{ width: "12px", height: "12px" }} />
              </a>) : null; })()}
            {params.search && (
              <a href={`/${locale}/marketplace${params.category ? `?category=${params.category}` : ""}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.25rem 0.625rem", borderRadius: "var(--radius-full)", background: "var(--info-light)", color: "var(--info)", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none" }}>
                &quot;{params.search}&quot; <X style={{ width: "12px", height: "12px" }} />
              </a>)}
            <a href={`/${locale}/marketplace`} style={{ fontSize: "0.75rem", color: "var(--error)", fontWeight: 600 }}>{t("filters.clearAll")}</a>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] items-start gap-8">
          <SidebarFilters params={params} locale={locale} isRtl={isRtl} filtersTitle={t("filters.title")} filtersClearAll={t("filters.clearAll")} categories={categories} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 500 }}>{t("results", { count: projects.length.toString() })}</span>
            </div>
            {projects.length === 0 ? (
              <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                <FolderOpen style={{ width: "48px", height: "48px", color: "var(--text-muted)", margin: "0 auto 1rem" }} />
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>{t("noProjects")}</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  {params.category || params.search || params.type
                    ? (isRtl ? "جرّب إزالة الفلاتر أو البحث لمشاهدة جميع المشاريع المتاحة." : "Try clearing filters or search to view all available projects.")
                    : (isRtl ? "لم يتم نشر أي مشاريع بعد." : "No projects published yet.")}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {projects.map((p: any) => <ProjectCard key={p.id} project={p} isRtl={isRtl} isAdmin={user.role === "ADMIN"} matchScore={scores[p.id] ?? null} tProject={(k) => tProject(k)} tCommon={(k) => tCommon(k)} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
