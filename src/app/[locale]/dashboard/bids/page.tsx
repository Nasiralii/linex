import { getCurrentUser } from "@/lib/auth";
import { redirect, Link } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { BarChart3, ArrowLeft, Clock, CheckCircle, XCircle, Star, Award, Send, Hammer } from "lucide-react";
import { extractStoredBidRankingSnapshot, isStoredBidRankingSnapshotFresh } from "@/lib/bid-ranking-policy";

// G17: My Bids dashboard page — contractors/engineers track all their bids

export default async function MyBidsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user || (user.role !== "CONTRACTOR" && user.role !== "ENGINEER")) return redirect({ href: "/dashboard", locale });
  const isRtl = locale === "ar";
  const params = await searchParams;
  const statusFilter = params.status || "ALL";

  let profileId: string | null = null;
  let bids: any[] = [];
  const rankingMap: Record<string, any> = {};
  try {
    if (user.role === "CONTRACTOR") {
      const p = await db.contractorProfile.findUnique({ where: { userId: user.id } });
      profileId = p?.id || null;
    } else {
      const p = await db.engineerProfile.findUnique({ where: { userId: user.id } });
      profileId = p?.id || null;
    }

    if (profileId) {
      const bidWhere: any = user.role === "CONTRACTOR" ? { contractorId: profileId } : { engineerId: profileId };
      if (statusFilter !== "ALL") bidWhere.status = statusFilter;
      bids = await db.bid.findMany({
        where: bidWhere,
        orderBy: { createdAt: "desc" },
        include: {
          project: { select: { id: true, title: true, titleAr: true, status: true, projectType: true, budgetMin: true } },
        },
      });

      const rankingLogs = await db.auditLog.findMany({
        where: { action: "BID_RANKED", entityType: "bid", entityId: { in: bids.map((b) => b.id) } },
        orderBy: { createdAt: "desc" },
        select: { entityId: true, metadata: true, createdAt: true },
      });

      for (const log of rankingLogs) {
        if (!rankingMap[log.entityId]) {
          const snapshot = extractStoredBidRankingSnapshot(log.metadata);
          if (snapshot && isStoredBidRankingSnapshotFresh(log.createdAt)) {
            rankingMap[log.entityId] = { ...snapshot, rankedAt: log.createdAt };
          }
        }
      }
    }
  } catch (error) {
    console.error('[MyBidsPage] DB query failed:', error);
  }

  const statusColors: Record<string, string> = {
    SUBMITTED: "info", SHORTLISTED: "warning", AWARDED: "success", REJECTED: "error", WITHDRAWN: "default", DRAFT: "default",
  };

  const statusLabels: Record<string, { en: string; ar: string }> = {
    SUBMITTED: { en: "Submitted", ar: "مُقدم" },
    SHORTLISTED: { en: "Shortlisted", ar: "قائمة مختصرة" },
    AWARDED: { en: "Awarded!", ar: "فائز!" },
    REJECTED: { en: "Rejected", ar: "مرفوض" },
    WITHDRAWN: { en: "Withdrawn", ar: "مسحوب" },
    DRAFT: { en: "Draft", ar: "مسودة" },
  };
  const filteredBids = statusFilter === "ALL" ? bids : bids.filter((b: any) => b.status === statusFilter);

  // G21: Count total bids per project for anonymous ranking
  const projectBidCounts: Record<string, number> = {};
  try {
    for (const bid of filteredBids) {
      if (!projectBidCounts[bid.projectId]) {
        projectBidCounts[bid.projectId] = await db.bid.count({ where: { projectId: bid.projectId } });
      }
    }
  } catch (error) {
    console.error('[MyBidsPage] bid count query failed:', error);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1C5963, #2A7B88)", padding: "2rem 0" }}>
        <div className="container-app">
          <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8125rem", textDecoration: "none" }}>
            ← {isRtl ? "العودة" : "Back"}
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <BarChart3 style={{ width: "24px", height: "24px" }} />
            {isRtl ? "عروضي" : "My Bids"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
            {statusFilter === "AWARDED"
              ? (isRtl ? `${filteredBids.length} عرض فائز` : `${filteredBids.length} won bids`)
              : (isRtl ? `${filteredBids.length} عرض مقدم` : `${filteredBids.length} bids submitted`)}
          </p>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {[
            { key: "ALL", label: isRtl ? "الكل" : "All", count: bids.length, color: "var(--text)" },
            { key: "SUBMITTED", label: isRtl ? "مُقدمة" : "Submitted", count: bids.filter(b => b.status === "SUBMITTED").length, color: "var(--info)" },
            { key: "SHORTLISTED", label: isRtl ? "قائمة مختصرة" : "Shortlisted", count: bids.filter(b => b.status === "SHORTLISTED").length, color: "var(--accent)" },
            { key: "AWARDED", label: isRtl ? "فائزة" : "Won", count: bids.filter(b => b.status === "AWARDED").length, color: "var(--primary)" },
            { key: "REJECTED", label: isRtl ? "مرفوضة" : "Rejected", count: bids.filter(b => b.status === "REJECTED").length, color: "var(--error)" },
          ].map((s, i) => (
            <Link
              key={i}
              href={s.key === "ALL" ? "/dashboard/bids" : `/dashboard/bids?status=${s.key}`}
              className="card"
              style={{
                padding: "1rem",
                textAlign: "center",
                textDecoration: "none",
                border: statusFilter === s.key ? `1px solid ${s.color}` : "1px solid var(--border-light)",
                background: statusFilter === s.key ? "var(--surface-2)" : "var(--surface)",
              }}
            >
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{s.label}</div>
            </Link>
          ))}
        </div>
        {statusFilter !== "ALL" && (
          <div style={{ marginBottom: "0.75rem" }}>
            <Link href="/dashboard/bids" style={{ fontSize: "0.8125rem", color: "var(--primary)", textDecoration: "none", fontWeight: 700 }}>
              {isRtl ? "عرض كل العروض" : "Show all bids"}
            </Link>
          </div>
        )}

        {filteredBids.length === 0 ? (
          <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
            <Send style={{ width: "40px", height: "40px", color: "var(--text-muted)", margin: "0 auto 0.75rem" }} />
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
              {isRtl ? "لم تقدم أي عروض بعد" : "No bids submitted yet"}
            </h3>
            <Link href="/marketplace" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex", padding: "0.5rem 1.5rem", fontSize: "0.875rem" }}>
              {isRtl ? "تصفح المشاريع" : "Browse Projects"}
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {filteredBids.map((bid: any) => (
              <div
                key={bid.id}
                className="card"
                style={{
                  padding: "1rem 1.125rem",
                  border: "1px solid var(--border-light)",
                  background: "linear-gradient(180deg, #ffffff, #fcfdfd)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.25rem" }}>
                      {isRtl ? (bid.project?.titleAr || bid.project?.title) : bid.project?.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", fontSize: "0.79rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
                      <span>{bid.project?.projectType?.replace(/_/g, " ")}</span>
                      <span>•</span>
                      <span>
                        {isRtl ? "تاريخ التقديم:" : "Submitted:"}{" "}
                        {new Date(bid.createdAt).toLocaleDateString(isRtl ? "ar-SA" : "en-SA")}
                      </span>
                      {/* G21: Show anonymous ranking info */}
                      <span>•</span>
                      <span>
                        {isRtl
                          ? `إجمالي العروض على المشروع: ${projectBidCounts[bid.projectId] || 0}`
                          : `Total bids on this project: ${projectBidCounts[bid.projectId] || 0}`}
                      </span>
                      {bid.aiScore && <span>• AI Score: {bid.aiScore}/100</span>}
                      {rankingMap[bid.id]?.confidence && <span>• {isRtl ? `الثقة: ${rankingMap[bid.id].confidence}` : `Confidence: ${rankingMap[bid.id].confidence}`}</span>}
                      {rankingMap[bid.id]?.usedFallbacks?.length > 0 && <span>• {isRtl ? `بدائل التقييم: ${rankingMap[bid.id].usedFallbacks.length}` : `Ranking fallbacks: ${rankingMap[bid.id].usedFallbacks.length}`}</span>}
                    </div>
                    <div style={{ marginTop: "0.5rem" }}>
                      <Link href={`/marketplace/${bid.projectId}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textDecoration: "none" }}>
                        {isRtl ? "عرض المشروع" : "View Project"}
                      </Link>
                    </div>
                  </div>
                  <div style={{ textAlign: "end" }}>
                    <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--primary)", marginBottom: "0.25rem" }}>
                      {bid.amount?.toLocaleString()} {isRtl ? "ر.س" : "SAR"}
                    </div>
                      <span className={`chip chip-${statusColors[bid.status] || "default"}`} style={{ fontSize: "0.6875rem" }}>
                      {isRtl ? statusLabels[bid.status]?.ar : statusLabels[bid.status]?.en || bid.status}
                    </span>
                      {bid.status === "AWARDED" && (
                        <div style={{ marginTop: "0.5rem" }}>
                          <Link href={`/dashboard/execution/${bid.projectId}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 700, color: "#B87333", textDecoration: "none" }}>
                            <Hammer style={{ width: "14px", height: "14px" }} />
                            {isRtl ? "عرض المشروع المرسّى" : "Open Awarded Project"}
                          </Link>
                        </div>
                      )}
                    {bid.status !== "AWARDED" && rankingMap[bid.id]?.rankedAt && (
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        {isRtl ? "آخر تقييم للنظام:" : "Last ranking update:"}{" "}
                        {new Date(rankingMap[bid.id].rankedAt).toLocaleDateString(isRtl ? "ar-SA" : "en-SA")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
