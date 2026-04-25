import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { BarChart3 } from "lucide-react";
import DashboardClient from "./dashboard-client";
import { isFullAccessAdmin } from "@/lib/admin-config";

export const dynamic = "force-dynamic";

const SUPPORTED_USER_ROLES = ["OWNER", "CONTRACTOR", "ENGINEER"] as const;
const REVIEWABLE_VERIFICATION_STATUSES = ["PENDING", "DRAFT"] as const;

async function safeValue<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    console.error("[AdminReportsPage:safeValue]", error);
    return fallback;
  }
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user || user.role !== "ADMIN") return redirect({ href: "/dashboard", locale });
  if (!isFullAccessAdmin(user.email)) return redirect({ href: "/admin/users", locale });
  const isRtl = locale === "ar";
  const params = await searchParams;

  // Date range filter
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const dateFrom = params.from ? new Date(params.from) : defaultFrom;
  const dateTo = params.to ? new Date(params.to) : now;

  let projects: any[] = [], walletTx: any[] = [], bids: any[] = [], bidRankingLogs: any[] = [];
  let userCounts = { owners: 0, contractors: 0, engineers: 0 };
  let totalUsers = 0;
  let verifiedCount = 0, pendingCount = 0;
  let topPerformers: any[] = [];

  [projects, walletTx, bids, totalUsers, userCounts.owners, userCounts.contractors, userCounts.engineers, verifiedCount, pendingCount, topPerformers, bidRankingLogs] =
    await Promise.all([
      safeValue(() => db.project.findMany({
        orderBy: { createdAt: "desc" }, take: 100,
        include: {
          owner: { select: { fullName: true, companyName: true } },
          bids: { select: { amount: true, status: true, aiScore: true, contractor: { select: { companyName: true, ratingAverage: true, reviewCount: true } } } },
          award: { select: { awardedAmount: true, contractor: { select: { companyName: true } } } },
          _count: { select: { bids: true } },
        },
      }), [] as any[]),
      safeValue(() => db.walletTransaction.findMany({
        where: { status: "completed", createdAt: { gte: dateFrom, lte: dateTo } },
        select: { type: true, amount: true, purpose: true, createdAt: true },
      }), [] as any[]),
      safeValue(() => db.bid.findMany({ select: { aiScore: true, amount: true, status: true } }), [] as any[]),
      safeValue(() => db.user.count({ where: { role: { in: [...SUPPORTED_USER_ROLES] } } }), 0),
      safeValue(() => db.user.count({ where: { role: "OWNER" } }), 0),
      safeValue(() => db.user.count({ where: { role: "CONTRACTOR" } }), 0),
      safeValue(() => db.user.count({ where: { role: "ENGINEER" } }), 0),
      safeValue(() => db.contractorProfile.count({ where: { verificationStatus: "VERIFIED" } }), 0),
      safeValue(() => db.user.count({
        where: {
          OR: [
            { role: "OWNER", ownerProfile: { is: { verificationStatus: { in: [...REVIEWABLE_VERIFICATION_STATUSES] } } } },
            { role: "CONTRACTOR", contractorProfile: { is: { verificationStatus: { in: [...REVIEWABLE_VERIFICATION_STATUSES] } } } },
            { role: "ENGINEER", engineerProfile: { is: { verificationStatus: { in: [...REVIEWABLE_VERIFICATION_STATUSES] } } } },
          ],
        },
      }), 0),
      safeValue(() => db.contractorProfile.findMany({
        where: { verificationStatus: "VERIFIED" },
        orderBy: { ratingAverage: "desc" }, take: 10,
        select: { companyName: true, ratingAverage: true, reviewCount: true, _count: { select: { awards: true } } },
      }), [] as any[]),
      safeValue(() => db.auditLog.findMany({
        where: { action: "BID_RANKED", entityType: "bid" },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: { entityId: true, metadata: true, createdAt: true },
      }), [] as any[]),
    ]);

  const latestRankingByBid = new Map<string, any>();
  for (const log of bidRankingLogs) {
    if (!latestRankingByBid.has(log.entityId)) latestRankingByBid.set(log.entityId, log.metadata);
  }

  totalUsers = userCounts.owners + userCounts.contractors + userCounts.engineers;

  // Revenue by source
  const rev = {
    krasat: walletTx.filter(t => t.purpose === "KRASAT").reduce((s, t) => s + t.amount, 0),
    supervision: walletTx.filter(t => ["SUPERVISION_REQUEST_FEE", "SUPERVISION_BID_PACK", "SUPERVISION_WIN_FEE"].includes(t.purpose)).reduce((s, t) => s + t.amount, 0),
    contracts: walletTx.filter(t => t.purpose === "CONTRACT_FEE").reduce((s, t) => s + t.amount, 0),
    platformFees: walletTx.filter(t => t.purpose === "PLATFORM_FEE").reduce((s, t) => s + t.amount, 0),
  };
  const totalRevenue = rev.krasat + rev.supervision + rev.contracts + rev.platformFees;

  // Monthly revenue (last 6 months)
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const monthTx = walletTx.filter(t => t.createdAt >= d && t.createdAt < end);
    return {
      month: d.toLocaleString(isRtl ? "ar" : "en", { month: "short" }),
      total: monthTx.reduce((s, t) => s + t.amount, 0),
      krasat: monthTx.filter(t => t.purpose === "KRASAT").reduce((s, t) => s + t.amount, 0),
      supervision: monthTx.filter(t => ["SUPERVISION_REQUEST_FEE", "SUPERVISION_BID_PACK", "SUPERVISION_WIN_FEE"].includes(t.purpose)).reduce((s, t) => s + t.amount, 0),
      contracts: monthTx.filter(t => t.purpose === "CONTRACT_FEE").reduce((s, t) => s + t.amount, 0),
      fees: monthTx.filter(t => t.purpose === "PLATFORM_FEE").reduce((s, t) => s + t.amount, 0),
    };
  });

  // Pipeline counts
  const pipeline = ["DRAFT","PUBLISHED","BIDDING","AWARDED","IN_PROGRESS","COMPLETED"].map(s => ({
    status: s,
    count: projects.filter(p => p.status === s).length,
    projects: projects.filter(p => p.status === s).map(p => ({ id: p.id, title: isRtl ? (p.titleAr || p.title) : p.title })),
  }));

  // Average bid score
  const scoredBids = bids.filter(b => b.aiScore !== null);
  const avgBidScore = scoredBids.length > 0 ? Math.round(scoredBids.reduce((s, b) => s + (b.aiScore || 0), 0) / scoredBids.length) : 0;

  // Active projects
  const activeProjects = projects.filter(p => ["PUBLISHED","BIDDING","AWARDED","IN_PROGRESS"].includes(p.status)).length;

  // Table data
  const tableProjects = projects.slice(0, 30).map((p: any) => ({
    id: p.id, title: p.title, titleAr: p.titleAr,
    owner: p.owner?.fullName || p.owner?.companyName || "—",
    type: p.projectType, status: p.status, bidsCount: p._count?.bids || 0,
    awardAmount: p.award?.awardedAmount || null,
    awardContractor: p.award?.contractor?.companyName || null,
    createdAt: new Date(p.createdAt).toLocaleDateString(isRtl ? "ar" : "en"),
    bids: (p.bids || []).map((b: any) => ({
      company: b.contractor?.companyName || "—", amount: b.amount || 0,
      status: b.status, score: b.aiScore || 0,
      confidence: latestRankingByBid.get(b.id)?.confidence || null,
      fallbackCount: Array.isArray(latestRankingByBid.get(b.id)?.usedFallbacks) ? latestRankingByBid.get(b.id).usedFallbacks.length : 0,
      missingCount: Array.isArray(latestRankingByBid.get(b.id)?.missingCoreFields) ? latestRankingByBid.get(b.id).missingCoreFields.length : 0,
      note: Array.isArray(latestRankingByBid.get(b.id)?.explanationsEn) ? latestRankingByBid.get(b.id).explanationsEn[0] || null : null,
      rankedAt: latestRankingByBid.get(b.id)?.createdAt || null,
    })),
  }));

  const performers = topPerformers.map((p: any, i: number) => ({
    rank: i + 1, name: p.companyName || "—",
    rating: p.ratingAverage || 0, projects: p._count?.awards || 0, reviews: p.reviewCount || 0,
  }));

  const drilldowns = {
    totalUsers: [
      ...Array.from({ length: userCounts.owners }, (_, i) => ({ label: `${isRtl ? "مالك" : "Owner"} ${i + 1}`, sublabel: isRtl ? "حساب مالك مشروع" : "Owner account" })),
      ...Array.from({ length: userCounts.contractors }, (_, i) => ({ label: `${isRtl ? "مقاول" : "Contractor"} ${i + 1}`, sublabel: isRtl ? "حساب مقاول" : "Contractor account" })),
      ...Array.from({ length: userCounts.engineers }, (_, i) => ({ label: `${isRtl ? "مهندس" : "Engineer"} ${i + 1}`, sublabel: isRtl ? "حساب مهندس" : "Engineer account" })),
    ],
    activeProjects: projects
      .filter((project) => ["PUBLISHED", "BIDDING", "AWARDED", "IN_PROGRESS"].includes(project.status))
      .slice(0, 20)
      .map((project) => ({ label: isRtl ? project.titleAr || project.title : project.title, sublabel: `${project.status} · ${project._count?.bids || 0} ${isRtl ? "عرض" : "bids"}` })),
    totalRevenue: monthlyRevenue.map((month) => ({ label: month.month, sublabel: `${month.total.toLocaleString()} SAR` })),
    avgBidScore: scoredBids.slice(0, 20).map((bid, index) => ({ label: `${isRtl ? "عرض" : "Bid"} ${index + 1}`, sublabel: `${bid.aiScore || 0}` })),
  };

  return (
    <div style={{ background: "linear-gradient(180deg, #f5f2ea 0%, #fafafa 50%, #ffffff 100%)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "2rem 0" }}>
        <div className="container-app" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BarChart3 style={{ width: 24, height: 24 }} />
              {isRtl ? "لوحة التحليلات والتقارير" : "Analytics & Reports Dashboard"}
            </h1>
            <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
              {isRtl ? "نظرة شاملة على أداء المنصة — بيانات حيّة" : "Complete platform performance overview — live data"}
            </p>
          </div>
        </div>
      </div>
      <div className="container-app" style={{ padding: "1.5rem" }}>
        <DashboardClient
          isRtl={isRtl}
          kpi={{ totalRevenue, activeProjects, totalUsers, avgBidScore }}
          revenue={rev}
          monthlyRevenue={monthlyRevenue}
          users={{ ...userCounts, verified: verifiedCount, pending: pendingCount }}
          pipeline={pipeline}
          projects={tableProjects}
          performers={performers}
          drilldowns={drilldowns}
        />
      </div>
    </div>
  );
}