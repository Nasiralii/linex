import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Link } from "@/i18n/routing";
import { Plus, ExternalLink, Hammer, Edit3, Send, Trash2 } from "lucide-react";
import { ProjectStatusChip } from "./status-chip";
import { ProjectFilters } from "./filters";
import { parseProjectMeta, formatProjectBudget } from "@/lib/project-meta";
import { Pagination } from "@/components/pagination";

const TYPE_LABELS: Record<string, { ar: string; en: string }> = {
  DESIGN_ONLY: { ar: "تصميم", en: "Design" },
  CONSTRUCTION_ONLY: { ar: "تنفيذ", en: "Construction" },
  DESIGN_AND_CONSTRUCTION: { ar: "تصميم وتنفيذ", en: "Design & Construction" },
};

export default async function MyProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; submitted?: string; saved?: string; page?: string; hasBids?: string }>;
}) {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) return redirect({ href: "/auth/login", locale });
  if (user.role !== "OWNER") return redirect({ href: "/dashboard", locale });

  const isRtl = locale === "ar";
  const params = await searchParams;
  const filterStatus = params.status || "ALL";
  const showSubmittedNotice = params.submitted === "1";
  const showDraftSavedNotice = params.saved === "draft";
  const onlyWithBids = params.hasBids === "1";
  const page = Math.max(1, Number(params.page || "1") || 1);
  const PAGE_SIZE = 8;

  let projects: any[] = [];
  let totalProjects = 0;
  try {
    const ownerProfile = await db.ownerProfile.findUnique({ where: { userId: user.id } });
    if (ownerProfile) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const where: any = { ownerId: ownerProfile.id };
      if (filterStatus === "EXPIRED") {
        where.status = { in: ["PUBLISHED", "BIDDING"] };
        where.OR = [
          { deadline: { lt: todayStart } },
          { AND: [{ deadline: null }, { biddingWindowEnd: { lt: todayStart } }] },
        ];
      } else if (filterStatus !== "ALL") {
        where.status = filterStatus;
      }
      if (onlyWithBids) {
        where.bids = { some: {} };
        if (filterStatus !== "EXPIRED") {
          where.status = { not: "AWARDED" };
        }
      }
      totalProjects = await db.project.count({ where });
      projects = await db.project.findMany({
        where,
        include: { _count: { select: { bids: true } }, category: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      });
    }
  } catch (error) {
    console.error("[MyProjectsPage] DB query failed:", error);
  }
  const totalPages = Math.max(1, Math.ceil(totalProjects / PAGE_SIZE));
  const pageHref = (target: number) => {
    const qp = new URLSearchParams();
    if (filterStatus !== "ALL") qp.set("status", filterStatus);
    if (onlyWithBids) qp.set("hasBids", "1");
    if (showSubmittedNotice) qp.set("submitted", "1");
    if (showDraftSavedNotice) qp.set("saved", "draft");
    if (target > 1) qp.set("page", String(target));
    const qs = qp.toString();
    return qs ? `/dashboard/projects?${qs}` : "/dashboard/projects";
  };

  const fmt = (n: number | null | undefined) =>
    n != null ? n.toLocaleString(isRtl ? "ar-SA" : "en-SA") : "—";

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1C5963, #2A7B88)", padding: "2rem 0" }}>
        <div className="container-app" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", margin: 0 }}>
            {isRtl ? "مشاريعي" : "My Projects"}
            <span style={{ fontSize: "0.875rem", fontWeight: 400, opacity: 0.7, marginInlineStart: "0.75rem" }}>
              ({totalProjects})
            </span>
          </h1>
          <Link href="/dashboard/projects/new" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "white", color: "#2A7B88", fontWeight: 700, fontSize: "0.875rem", padding: "0.625rem 1.25rem", borderRadius: "var(--radius-lg)" }}>
            <Plus style={{ width: "16px", height: "16px" }} />
            {isRtl ? "مشروع جديد" : "New Project"}
          </Link>
        </div>
      </div>

      <div className="container-app" style={{ padding: "1.5rem" }}>
        {(showSubmittedNotice || showDraftSavedNotice) && (
          <div className="card" style={{ padding: "1rem 1.25rem", marginBottom: "1rem", border: "1px solid var(--success)", background: "rgba(16, 185, 129, 0.08)", color: "var(--success)" }}>
            {showSubmittedNotice
              ? (isRtl ? "تم إرسال مشروعك بنجاح وبدأت عملية مراجعة الإدارة." : "Your project was submitted successfully and the admin review process has started.")
              : (isRtl ? "تم حفظ المشروع كمسودة بنجاح." : "Your project draft was saved successfully.")}
          </div>
        )}

        {/* Filter Tabs */}
        <ProjectFilters activeStatus={filterStatus} locale={locale} />

        {/* Project List */}
        {projects.length === 0 ? (
          <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
            {isRtl ? "لا توجد مشاريع" : "No projects found"}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {projects.map((p) => {
              const title = isRtl ? (p.titleAr || p.title) : p.title;
              const type = TYPE_LABELS[p.projectType] || TYPE_LABELS.CONSTRUCTION_ONLY;
              const showExec = p.status === "AWARDED" || p.status === "IN_PROGRESS";
              const meta = parseProjectMeta(p.scopeSummary);
              return (
                <div key={p.id} className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--text)", margin: 0, marginBottom: "0.375rem" }}>{title}</h3>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                        <ProjectStatusChip status={p.status} locale={locale} />
                        <span style={{ background: "var(--surface-2)", padding: "0.125rem 0.5rem", borderRadius: "var(--radius-full)" }}>
                          {isRtl ? type.ar : type.en}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                    <span>📅 {new Date(p.createdAt).toLocaleDateString(isRtl ? "ar-SA" : "en-SA")}</span>
                    <span>📨 {p._count.bids} {isRtl ? "عرض" : "bids"}</span>
                    <span>💰 {formatProjectBudget(meta.estimatedBudget, p.budgetMax)} {p.currency}</span>
                  </div>
                  <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    {/* BUG-PO08: Action buttons for DRAFT and CHANGES_REQUESTED */}
                    {p.status === "DRAFT" && (
                      <>
                        <Link href={`/dashboard/projects/new?draft=${p.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: 600, color: "var(--primary)", textDecoration: "none" }}>
                          <Edit3 style={{ width: "14px", height: "14px" }} /> {isRtl ? "متابعة التعديل" : "Continue Editing"}
                        </Link>
                        <Link href={`/dashboard/projects/new?draft=${p.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: 600, color: "var(--success)", textDecoration: "none" }}>
                          <Send style={{ width: "14px", height: "14px" }} /> {isRtl ? "إرسال للمراجعة" : "Submit for Review"}
                        </Link>
                      </>
                    )}
                    {p.status === "CHANGES_REQUESTED" && (
                      <Link href={`/dashboard/projects/new?draft=${p.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>
                        <Edit3 style={{ width: "14px", height: "14px" }} /> {isRtl ? "تعديل وإعادة الإرسال" : "Edit & Resubmit"}
                      </Link>
                    )}
                    <Link href={`/marketplace/${p.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: 600, color: "var(--primary)", textDecoration: "none" }}>
                      <ExternalLink style={{ width: "14px", height: "14px" }} /> {isRtl ? "عرض في السوق" : "View in Marketplace"}
                    </Link>
                    {showExec && (
                      <Link href={`/dashboard/execution/${p.id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: 600, color: "#B87333", textDecoration: "none" }}>
                        <Hammer style={{ width: "14px", height: "14px" }} /> {isRtl ? "متابعة التنفيذ" : "Execution Workspace"}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
            <Pagination currentPage={page} totalPages={totalPages} hrefForPage={pageHref} locale={locale} />
          </div>
        )}
      </div>
    </div>
  );
}
