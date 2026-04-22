import { getCurrentUser } from "@/lib/auth";
import { redirect, Link } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { generateMatchRecommendations, analyzeContractorProfile } from "@/lib/ai";
import { logger } from "@/lib/logger";
import {
  FolderOpen, FileCheck, Clock, Award, Plus, ArrowUpRight,
  BarChart3, ShieldCheck, Sparkles, Star, TrendingUp, AlertCircle,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) {
    logger.warn("Dashboard redirected to login", { action: "AUTH_ROUTE_REDIRECT_TO_LOGIN", entityType: "auth", route: "/dashboard" });
    return redirect({ href: "/auth/login", locale });
  }

  const isRtl = locale === "ar";
  const isOwner = user.role === "OWNER";
  const isContractor = user.role === "CONTRACTOR";
  const isEngineer = user.role === "ENGINEER";
  const isAdmin = user.role === "ADMIN";

  if (isAdmin) return redirect({ href: "/admin", locale });

  // Fetch real data based on role
  let projectCount = 0, bidCount = 0, awardCount = 0;
  let aiMatches: any[] = [];
  let profileAnalysis: any = null;
  let contractorProfile: any = null;
  let engineerProfile: any = null;
  let awardedWorkspaceProjects: any[] = [];
  let supervisorWorkspaceProjects: any[] = [];

  try {
  if (isOwner) {
    const ownerProfile = await db.ownerProfile.findUnique({ where: { userId: user.id } });
    if (ownerProfile) {
      projectCount = await db.project.count({ where: { ownerId: ownerProfile.id } });
      bidCount = await db.bid.count({ where: { project: { ownerId: ownerProfile.id } } });
    }
  }

  if (isContractor) {
    contractorProfile = await db.contractorProfile.findUnique({
      where: { userId: user.id },
      include: { categories: { include: { category: true } }, locations: { include: { location: true } }, documents: true },
    });

    if (contractorProfile) {
      bidCount = await db.bid.count({ where: { contractorId: contractorProfile.id } });
      awardCount = await db.award.count({ where: { contractorId: contractorProfile.id } });
      awardedWorkspaceProjects = await db.bid.findMany({
        where: { contractorId: contractorProfile.id, status: "AWARDED" },
        include: { project: { select: { id: true, title: true, titleAr: true, status: true } } },
        orderBy: { updatedAt: "desc" },
        take: 5,
      });

      // AI Smart Matching — get recommended projects
      try {
        const availableProjects = await db.project.findMany({
          where: { status: { in: ["PUBLISHED", "BIDDING"] } },
          include: { category: true, location: true },
          take: 20,
        });

        if (availableProjects.length > 0 && contractorProfile.companyName) {
          aiMatches = await generateMatchRecommendations(
            {
              companyName: contractorProfile.companyName,
              description: contractorProfile.description || "",
              categories: contractorProfile.categories?.map((c: any) => c.category?.name) || [],
              locations: contractorProfile.locations?.map((l: any) => l.location?.name) || [],
              yearsInBusiness: contractorProfile.yearsInBusiness || 0,
              teamSize: contractorProfile.teamSize || 0,
            },
            availableProjects.map((p: any) => ({
              id: p.id, title: p.title, description: p.description,
              category: p.category?.name || "", location: p.location?.name || "",
              budgetMin: p.budgetMin || 0, budgetMax: p.budgetMax || 0,
            }))
          );
        }
      } catch (e) { console.error("AI matching error:", e); }

      // AI Profile Analysis
      try {
        profileAnalysis = await analyzeContractorProfile({
          companyName: contractorProfile.companyName,
          description: contractorProfile.description,
          yearsInBusiness: contractorProfile.yearsInBusiness,
          teamSize: contractorProfile.teamSize,
          categories: contractorProfile.categories?.map((c: any) => c.category?.name) || [],
          locations: contractorProfile.locations?.map((l: any) => l.location?.name) || [],
          documentsCount: contractorProfile.documents?.length || 0,
        });
      } catch (e) { console.error("AI profile analysis error:", e); }
    }
  }

  if (isEngineer) {
    engineerProfile = await db.engineerProfile.findUnique({
      where: { userId: user.id },
      include: { documents: true },
    });

    if (engineerProfile) {
      bidCount = await db.bid.count({ where: { contractorId: engineerProfile.id } });
      awardCount = await db.award.count({ where: { contractorId: engineerProfile.id } });
      awardedWorkspaceProjects = await db.bid.findMany({
        where: { engineerId: engineerProfile.id, status: "AWARDED" },
        include: { project: { select: { id: true, title: true, titleAr: true, status: true } } },
        orderBy: { updatedAt: "desc" },
        take: 5,
      });

      supervisorWorkspaceProjects = await (db as any).supervisionRequest.findMany({
        where: { assignedTo: user.id, status: { in: ["ASSIGNED", "COMPLETED"] } },
        include: {
          project: { select: { id: true, title: true, titleAr: true, status: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      });
    }
  }
  } catch (error) {
    console.error('[DashboardPage] DB query failed:', error);
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a4e41, #0f6b57)", padding: "2rem 0" }}>
        <div className="container-app">
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginBottom: "0.25rem" }}>
            {isRtl ? "مرحباً بك" : "Welcome back"} 👋
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>
            {user.email} • <span style={{ background: "rgba(255,255,255,0.15)", padding: "0.125rem 0.5rem", borderRadius: "var(--radius-full)", fontSize: "0.75rem" }}>
            {isAdmin ? (isRtl ? "مدير النظام" : "Admin") : isOwner ? (isRtl ? "مالك مشروع" : "Project Owner") : isEngineer ? (isRtl ? "مهندس" : "Engineer") : (isRtl ? "مقاول" : "Contractor")}
            </span>
          </p>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {(isOwner ? [
            { icon: FolderOpen, label: isRtl ? "مشاريعي" : "My Projects", value: projectCount, color: "#0f6b57", bg: "#e8f5f0", link: "/dashboard/projects" as const },
            { icon: FileCheck, label: isRtl ? "العروض المستلمة" : "Bids Received", value: bidCount, color: "#c58b2a", bg: "#fdf4e4" },
            { icon: Award, label: isRtl ? "الترسيات" : "Awards", value: awardCount, color: "#7c3aed", bg: "#f5f3ff" },
            { icon: Clock, label: isRtl ? "قيد التنفيذ" : "In Progress", value: 0, color: "#2563eb", bg: "#eff6ff" },
          ] : [
            { icon: BarChart3, label: isRtl ? "عروضي" : "My Bids", value: bidCount, color: "#0f6b57", bg: "#e8f5f0" },
            { icon: Award, label: isRtl ? "مشاريع فائزة" : "Won", value: awardCount, color: "#c58b2a", bg: "#fdf4e4" },
            { icon: Sparkles, label: isRtl ? "توصيات AI" : "AI Matches", value: aiMatches.length, color: "#7c3aed", bg: "#f5f3ff" },
            { icon: ShieldCheck, label: isRtl ? "حالة التحقق" : "Verification", value: (isEngineer ? engineerProfile?.verificationStatus : contractorProfile?.verificationStatus) === "VERIFIED" ? "✓" : "—", color: "#2563eb", bg: "#eff6ff" },
          ]).map((stat: any, i) => {
            const card = (
              <div key={i} className="card" style={{ padding: "1.25rem", cursor: stat.link ? "pointer" : undefined }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-xl)", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
                  <stat.icon style={{ width: "20px", height: "20px", color: stat.color }} />
                </div>
                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{stat.label}</div>
              </div>
            );
            return stat.link ? <Link key={i} href={stat.link} style={{ textDecoration: "none" }}>{card}</Link> : card;
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {/* Quick Actions */}
          <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>
              {isRtl ? "إجراءات سريعة" : "Quick Actions"}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {isOwner && (
                <Link href="/dashboard/projects/new" className="btn-primary" style={{ textDecoration: "none", justifyContent: "center" }}>
                  <Plus style={{ width: "16px", height: "16px" }} />
                  {isRtl ? "إنشاء مشروع جديد" : "Create New Project"}
                </Link>
              )}
              <Link href="/marketplace" className="btn-secondary" style={{ textDecoration: "none", justifyContent: "center" }}>
                <ArrowUpRight style={{ width: "16px", height: "16px" }} />
                {isRtl ? "تصفح السوق" : "Browse Marketplace"}
              </Link>
              <Link href="/dashboard/notifications" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)", fontSize: "0.875rem", fontWeight: 500, color: "var(--text-secondary)", textDecoration: "none" }}>
                {isRtl ? "📬 الإشعارات" : "📬 Notifications"}
              </Link>
              <Link href="/dashboard/wallet" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem", borderRadius: "var(--radius-md)", background: "#ecfdf5", fontSize: "0.875rem", fontWeight: 700, color: "#0f6b57", textDecoration: "none" }}>
                💳 {isRtl ? "المحفظة" : "Wallet"}
              </Link>
              {!isAdmin && (
                <Link href="/dashboard/supervision" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem", borderRadius: "var(--radius-md)", background: "#eff6ff", fontSize: "0.875rem", fontWeight: 700, color: "#2563eb", textDecoration: "none" }}>
                  👷 {isRtl ? "طلبات الإشراف" : "Supervision Requests"}
                </Link>
              )}
              {!isOwner && awardCount > 0 && (
                <Link href="/dashboard/bids" style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem", borderRadius: "var(--radius-md)", background: "#fdf4e4", fontSize: "0.875rem", fontWeight: 700, color: "#c58b2a", textDecoration: "none" }}>
                  🛠️ {isRtl ? "المشاريع المرسّاة ومساحة التنفيذ" : "Awarded Projects & Execution Workspace"}
                </Link>
              )}
            </div>
          </div>

          {/* AI Profile Analysis (for contractors) */}
          {isContractor && profileAnalysis && (
            <div className="card" style={{ padding: "1.5rem", border: "2px solid var(--accent)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Sparkles style={{ width: "20px", height: "20px", color: "var(--accent)" }} />
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>
                  {isRtl ? "تحليل ملفك بالذكاء الاصطناعي" : "AI Profile Analysis"}
                </h3>
              </div>

              {/* Score */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: `conic-gradient(var(--primary) ${profileAnalysis.completenessScore * 3.6}deg, var(--border-light) 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 800, color: "var(--primary)" }}>
                    {profileAnalysis.completenessScore}%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>
                    {isRtl ? "اكتمال الملف" : "Profile Completeness"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {profileAnalysis.completenessScore >= 80 ? (isRtl ? "ملف قوي!" : "Strong profile!") : (isRtl ? "يمكن تحسينه" : "Room for improvement")}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {(isRtl ? profileAnalysis.suggestionsAr : profileAnalysis.suggestions)?.slice(0, 3).map((s: string, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                  <TrendingUp style={{ width: "14px", height: "14px", color: "var(--accent)", flexShrink: 0, marginTop: "2px" }} />
                  {s}
                </div>
              ))}
            </div>
          )}

          {!isOwner && (awardedWorkspaceProjects.length > 0 || supervisorWorkspaceProjects.length > 0) && (
            <div className="card" style={{ padding: "1.5rem", border: "2px solid #c58b2a" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>
                {isRtl ? "مساحة التنفيذ للمشاريع المرسّاة" : "Execution Workspace for Awarded Projects"}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {awardedWorkspaceProjects.map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/dashboard/execution/${item.project.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      padding: "0.875rem 1rem",
                      borderRadius: "var(--radius-lg)",
                      background: "var(--surface-2)",
                      textDecoration: "none",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)" }}>
                        {isRtl ? (item.project.titleAr || item.project.title) : item.project.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {isRtl ? "جميع أدوات التنفيذ متاحة هنا" : "All execution tools are available here"}
                      </div>
                    </div>
                    <div style={{ color: "#c58b2a", fontSize: "0.8125rem", fontWeight: 700 }}>
                      {isRtl ? "دخول مساحة التنفيذ" : "Open Workspace"}
                    </div>
                  </Link>
                ))}
                {supervisorWorkspaceProjects.map((item: any) => (
                  <Link
                    key={`supervisor-${item.id}`}
                    href={`/dashboard/execution/${item.project.id}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      padding: "0.875rem 1rem",
                      borderRadius: "var(--radius-lg)",
                      background: "#eff6ff",
                      textDecoration: "none",
                      border: "1px solid rgba(37,99,235,0.18)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)" }}>
                        {isRtl ? (item.project.titleAr || item.project.title) : item.project.title}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {isRtl ? "مُعين كمشرف على هذا المشروع" : "Assigned as supervisor on this project"}
                      </div>
                    </div>
                    <div style={{ color: "#2563eb", fontSize: "0.8125rem", fontWeight: 700 }}>
                      {isRtl ? "دخول مساحة التنفيذ" : "Open Workspace"}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Owner placeholder for second column */}
          {isOwner && (
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>
                {isRtl ? "نصائح" : "Tips"}
              </h3>
              <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
                {isRtl ? "💡 أضف تفاصيل واضحة لمشروعك لتحصل على عروض أفضل من المقاولين. كلما كان الوصف أكثر تفصيلاً، كانت العروض أدق." : "💡 Add clear details to your project to get better bids from contractors. The more detailed the description, the more accurate the bids."}
              </div>
            </div>
          )}
        </div>

        {/* AI Recommended Projects (for contractors) */}
        {isContractor && aiMatches.length > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <Sparkles style={{ width: "20px", height: "20px", color: "var(--accent)" }} />
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
                {isRtl ? "مشاريع موصى بها لك بالذكاء الاصطناعي" : "AI-Recommended Projects for You"}
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
              {aiMatches.slice(0, 6).map((match: any, i: number) => (
                <Link key={i} href={`/marketplace/${match.projectId}`} className="card" style={{ padding: "1.25rem", textDecoration: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", background: "var(--primary-light)", padding: "0.2rem 0.5rem", borderRadius: "var(--radius-full)" }}>
                      {match.score}% {isRtl ? "تطابق" : "match"}
                    </span>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[1,2,3,4,5].map(s => <Star key={s} style={{ width: "12px", height: "12px", color: s <= Math.round(match.score/20) ? "var(--accent)" : "var(--border)" }} />)}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                    {(isRtl ? match.reasonsAr : match.reasons)?.join(" • ")}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
