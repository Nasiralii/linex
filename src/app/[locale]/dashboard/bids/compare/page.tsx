import { getCurrentUser } from "@/lib/auth";
import { redirect, Link } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { Star, ArrowLeft, Award, Clock, Banknote, ShieldCheck, BarChart3 } from "lucide-react";
import { awardProjectAction, shortlistBidAction } from "@/app/[locale]/marketplace/actions";
import { revalidatePath } from "next/cache";
import { rankBidWithPolicy, extractStoredBidRankingSnapshot, isStoredBidRankingSnapshotFresh } from "@/lib/bid-ranking-policy";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

// Gap 8: Bid comparison side-by-side (3 shortlisted)

async function awardAction(formData: FormData) {
  "use server";
  const projectId = formData.get("projectId") as string;
  const bidId = formData.get("bidId") as string;
  await awardProjectAction(projectId, bidId);
  revalidatePath("/dashboard/bids/compare");
}

export default async function BidComparisonPage({ searchParams }: { searchParams: Promise<{ projectId?: string }> }) {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user || user.role !== "OWNER") return redirect({ href: "/dashboard", locale });
  const isRtl = locale === "ar";

  const params = await searchParams;
  const projectId = params.projectId;
  if (!projectId) return redirect({ href: "/dashboard", locale });

  // Show all bids for this project, but keep shortlisted bids first
  let bids: any[] = [];
  let project: any = null;
  const rankingMap: Record<string, any> = {};
  try {
    bids = await db.bid.findMany({
      where: { projectId },
      include: {
        contractor: {
          select: {
            companyName: true, companyNameAr: true, ratingAverage: true, reviewCount: true,
            yearsInBusiness: true, teamSize: true, verificationStatus: true,
          },
        },
        engineer: {
          select: {
            fullName: true, fullNameAr: true, ratingAverage: true, reviewCount: true,
            yearsExperience: true, verificationStatus: true, specialization: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    project = await db.project.findUnique({ where: { id: projectId }, select: { title: true, titleAr: true, budgetMin: true, budgetMax: true } });

    if (project) {
      const rankingLogs = await db.auditLog.findMany({
        where: { action: "BID_RANKED", entityType: "bid", entityId: { in: bids.map((b) => b.id) } },
        orderBy: { createdAt: "desc" },
        select: { entityId: true, metadata: true, createdAt: true },
      });

      const latestSnapshots = new Map<string, any>();
      for (const log of rankingLogs) {
        if (!latestSnapshots.has(log.entityId)) {
          const snapshot = extractStoredBidRankingSnapshot(log.metadata);
          latestSnapshots.set(log.entityId, snapshot && isStoredBidRankingSnapshotFresh(log.createdAt) ? snapshot : null);
        }
      }

      for (const bid of bids) {
        rankingMap[bid.id] = latestSnapshots.get(bid.id) || await rankBidWithPolicy({
          bid: {
            id: bid.id,
            amount: bid.amount,
            estimatedDuration: bid.estimatedDuration,
            proposalText: bid.proposalText,
            submittedAt: bid.submittedAt,
            aiScore: bid.aiScore,
            contractor: {
              companyName: bid.contractor?.companyName || bid.engineer?.fullName,
              companyNameAr: bid.contractor?.companyNameAr || bid.engineer?.fullNameAr,
              ratingAverage: bid.contractor?.ratingAverage || bid.engineer?.ratingAverage,
              reviewCount: bid.contractor?.reviewCount || bid.engineer?.reviewCount,
              yearsInBusiness: bid.contractor?.yearsInBusiness,
              yearsExperience: bid.engineer?.yearsExperience,
              verificationStatus: bid.contractor?.verificationStatus || bid.engineer?.verificationStatus,
              specialization: bid.engineer?.specialization,
            },
          },
          project: {
            id: projectId,
            title: project.title,
            titleAr: project.titleAr,
            budgetMin: project.budgetMin,
            budgetMax: project.budgetMax,
          },
        });
      }
      bids = [...bids].sort((a, b) => {
        const shortlistDelta = Number(b.status === "SHORTLISTED") - Number(a.status === "SHORTLISTED");
        if (shortlistDelta !== 0) return shortlistDelta;
        return (rankingMap[b.id]?.totalScore || 0) - (rankingMap[a.id]?.totalScore || 0);
      });
    }
  } catch (error) {
    console.error('[BidComparisonPage] DB query failed:', error);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1C5963, #2A7B88)", padding: "2rem 0" }}>
        <div className="container-app">
          <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8125rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <ArrowLeft style={{ width: "14px", height: "14px" }} /> {isRtl ? "العودة" : "Back"}
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <BarChart3 style={{ width: "24px", height: "24px" }} />
            {isRtl ? "مقارنة العروض" : "Bid Comparison"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
            {isRtl ? (project?.titleAr || project?.title) : project?.title}
          </p>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        {bids.length === 0 ? (
          <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ fontSize: "1rem", color: "var(--text-muted)" }}>
              {isRtl ? "لا توجد عروض لهذا المشروع حتى الآن." : "No bids are available for this project yet."}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${bids.length}, 1fr)`, gap: "1.5rem" }}>
            {bids.map((bid: any, index: number) => (
              <div key={bid.id} className="card" style={{ padding: "1.5rem", border: index === 0 ? "2px solid var(--primary)" : "1px solid var(--border-light)" }}>
                {index === 0 && (
                  <div style={{ background: "var(--primary)", color: "white", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.6875rem", fontWeight: 700, display: "inline-block", marginBottom: "0.75rem" }}>
                    {isRtl ? "الأعلى تقييماً" : "Top Ranked"}
                  </div>
                )}
                {bid.status === "SHORTLISTED" && (
                  <div style={{ background: "var(--info-light)", color: "var(--info)", padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", fontSize: "0.6875rem", fontWeight: 700, display: "inline-block", marginBottom: "0.75rem", marginInlineStart: index === 0 ? "0.5rem" : 0 }}>
                    {isRtl ? "في القائمة المختصرة" : "Shortlisted"}
                  </div>
                )}

                {/* Company */}
                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
                  {isRtl ? (bid.contractor?.companyNameAr || bid.engineer?.fullNameAr || bid.contractor?.companyName || bid.engineer?.fullName) : (bid.contractor?.companyName || bid.engineer?.fullName)}
                </h3>

                {/* Rating */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", gap: "2px" }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} style={{ width: "14px", height: "14px", fill: s <= Math.round(bid.contractor?.ratingAverage || bid.engineer?.ratingAverage || 0) ? "var(--accent)" : "none", color: s <= Math.round(bid.contractor?.ratingAverage || bid.engineer?.ratingAverage || 0) ? "var(--accent)" : "var(--border)" }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>({bid.contractor?.reviewCount || bid.engineer?.reviewCount || 0})</span>
                  {(bid.contractor?.verificationStatus === "VERIFIED" || bid.engineer?.verificationStatus === "VERIFIED") && (
                    <ShieldCheck style={{ width: "14px", height: "14px", color: "var(--primary)" }} />
                  )}
                </div>

                {/* Key Metrics */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  <div style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", background: "var(--primary-light)", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
                      <Banknote style={{ width: "16px", height: "16px", color: "var(--primary)" }} />
                      <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>{bid.amount?.toLocaleString()}</span>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--primary)" }}>{isRtl ? "ر.س" : "SAR"}</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                    <div style={{ padding: "0.5rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)", textAlign: "center" }}>
                      <Clock style={{ width: "14px", height: "14px", color: "var(--text-muted)", margin: "0 auto 0.25rem", display: "block" }} />
                      <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>{bid.estimatedDuration || "—"}</div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{isRtl ? "يوم" : "days"}</div>
                    </div>
                    <div style={{ padding: "0.5rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)", textAlign: "center" }}>
                      <Award style={{ width: "14px", height: "14px", color: "var(--text-muted)", margin: "0 auto 0.25rem", display: "block" }} />
                      <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>{bid.contractor?.yearsInBusiness || bid.engineer?.yearsExperience || "—"}</div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{isRtl ? "سنوات" : "years"}</div>
                    </div>
                  </div>

                  {rankingMap[bid.id] && (
                    <div style={{ padding: "0.5rem", borderRadius: "var(--radius-md)", background: "var(--accent-light)", textAlign: "center" }}>
                      <div style={{ fontSize: "0.6875rem", color: "var(--accent)", fontWeight: 600 }}>{isRtl ? "التقييم النهائي" : "Final Score"}</div>
                      <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--accent)" }}>{rankingMap[bid.id].totalScore}/100</div>
                      <div style={{ fontSize: "0.625rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                        {isRtl ? `الثقة: ${rankingMap[bid.id].confidence}` : `Confidence: ${rankingMap[bid.id].confidence}`}
                      </div>
                    </div>
                  )}
                </div>

                {rankingMap[bid.id]?.explanationsEn?.length > 0 && (
                  <div style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                      {isRtl ? "أسباب التقييم" : "Ranking Notes"}
                    </div>
                    <ul style={{ margin: 0, paddingInlineStart: "1rem", fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {(isRtl ? rankingMap[bid.id].explanationsAr : rankingMap[bid.id].explanationsEn).slice(0, 3).map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Proposal */}
                <div style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)", marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem" }}>{isRtl ? "تفاصيل العرض" : "Proposal"}</div>
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {bid.proposalText?.substring(0, 200) || (isRtl ? "لا توجد تفاصيل" : "No details")}
                  </p>
                </div>

                {/* Award button */}
                <form action={awardAction}>
                  <input type="hidden" name="projectId" value={projectId} />
                  <input type="hidden" name="bidId" value={bid.id} />
                  <ConfirmSubmitButton
                    label={isRtl ? "ترسية هذا العرض" : "Award This Bid"}
                    confirmMessage={isRtl ? "هل أنت متأكد من ترسية هذا العرض؟ سيتم رفض بقية العروض تلقائياً." : "Are you sure you want to award this bid? All other bids will be rejected automatically."}
                    className="btn-primary"
                    style={{ width: "100%", padding: "0.75rem", fontSize: "0.875rem" }}
                    icon={<Award style={{ width: "16px", height: "16px" }} />}
                  />
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
