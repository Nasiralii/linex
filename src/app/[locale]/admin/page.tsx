import { getCurrentUser } from "@/lib/auth";
import { redirect } from "@/i18n/routing";
import { getLocale, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { Link } from "@/i18n/routing";
import { logger } from "@/lib/logger";
import AdminHeader from "./admin-header";
import { isFullAccessAdmin } from "@/lib/admin-config";

export const dynamic = "force-dynamic";
import {
  Users, FolderOpen, ShieldCheck, BarChart3,
  FileCheck, AlertTriangle, DollarSign, Clock,
  CheckCircle, XCircle, Eye, Bot, Megaphone, FileText, ArrowRight,
} from "lucide-react";
import AdminDashboardClient from "./dashboard-client";

const SUPPORTED_USER_ROLES = ["OWNER", "CONTRACTOR", "ENGINEER"] as const;
const REVIEWABLE_VERIFICATION_STATUSES = ["PENDING", "DRAFT"] as const;

async function safeCount(query: () => Promise<number>) {
  try {
    return await query();
  } catch (error) {
    console.error("[AdminDashboardPage:safeCount]", error);
    return 0;
  }
}

async function safeRecentUsers() {
  try {
    return await db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        ownerProfile: { select: { verificationStatus: true } },
        contractorProfile: { select: { verificationStatus: true } },
        engineerProfile: { select: { verificationStatus: true } },
      },
    });
  } catch (error) {
    console.error("[AdminDashboardPage:safeRecentUsers]", error);
    return [];
  }
}

async function safeItems<T>(query: () => Promise<T[]>) {
  try {
    return await query();
  } catch (error) {
    console.error("[AdminDashboardPage:safeItems]", error);
    return [] as T[];
  }
}

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();

  if (!user) {
    logger.warn("Admin dashboard redirected to login", { action: "AUTH_ROUTE_REDIRECT_TO_LOGIN", entityType: "auth", route: "/admin" });
    return redirect({ href: "/auth/login", locale });
  }
  if (user.role !== "ADMIN") return redirect({ href: "/dashboard", locale });

  const t = await getTranslations("admin");
  const isRtl = locale === "ar";
  const isFullAccess = isFullAccessAdmin(user.email);

  // Fetch stats with error handling
  let totalUsers = 0, totalOwners = 0, totalContractors = 0, totalEngineers = 0, totalProjects = 0;
  let pendingProjects = 0, publishedProjects = 0, pendingVerifications = 0, verifiedContractors = 0;
  let totalBids = 0, totalAwards = 0, totalCategories = 0, totalLocations = 0;
  let recentUsers: any[] = [];
  let recentProjects: any[] = [];
  let verifiedContractorItems: any[] = [];
  let pendingProjectItems: any[] = [];
  let pendingVerificationUsers: any[] = [];
  let awardItems: any[] = [];
  let ownerItems: any[] = [];
  let contractorItems: any[] = [];
  let engineerItems: any[] = [];
  let allUserItems: any[] = [];
  let publishedProjectItems: any[] = [];
  let bidItems: any[] = [];
  let categoryItems: any[] = [];
  let locationItems: any[] = [];

  [
    totalOwners,
    totalContractors,
    totalEngineers,
    totalProjects,
    pendingProjects,
    publishedProjects,
    pendingVerifications,
    verifiedContractors,
    totalBids,
    totalAwards,
    totalCategories,
    totalLocations,
    recentUsers,
    recentProjects,
    verifiedContractorItems,
    pendingProjectItems,
    pendingVerificationUsers,
    awardItems,
    ownerItems,
    contractorItems,
    engineerItems,
    allUserItems,
    publishedProjectItems,
    bidItems,
    categoryItems,
    locationItems,
  ] = await Promise.all([
    safeCount(() => db.user.count({ where: { role: "OWNER" } })),
    safeCount(() => db.user.count({ where: { role: "CONTRACTOR" } })),
    safeCount(() => db.user.count({ where: { role: "ENGINEER" } })),
    safeCount(() => db.project.count()),
    safeCount(() => db.project.count({ where: { status: "PENDING_REVIEW" } })),
    safeCount(() => db.project.count({ where: { status: "PUBLISHED" } })),
    safeCount(() => db.user.count({
      where: {
        OR: [
          { role: "OWNER", ownerProfile: { is: { verificationStatus: { in: [...REVIEWABLE_VERIFICATION_STATUSES] } } } },
          { role: "CONTRACTOR", contractorProfile: { is: { verificationStatus: { in: [...REVIEWABLE_VERIFICATION_STATUSES] } } } },
          { role: "ENGINEER", engineerProfile: { is: { verificationStatus: { in: [...REVIEWABLE_VERIFICATION_STATUSES] } } } },
        ],
      },
    })),
    safeCount(() => db.contractorProfile.count({ where: { verificationStatus: "VERIFIED" } })),
    safeCount(() => db.bid.count()),
    safeCount(() => db.award.count()),
    safeCount(() => db.category.count()),
    safeCount(() => db.location.count()),
    safeItems(() => db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      where: { role: { in: [...SUPPORTED_USER_ROLES] } },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        ownerProfile: { select: { verificationStatus: true } },
        contractorProfile: { select: { verificationStatus: true } },
        engineerProfile: { select: { verificationStatus: true } },
      },
    })),
    safeItems(() => db.project.findMany({ take: 20, orderBy: { createdAt: "desc" }, select: { id: true, title: true, titleAr: true, status: true, _count: { select: { bids: true } } } })),
    safeItems(() => db.contractorProfile.findMany({ take: 20, where: { verificationStatus: "VERIFIED" }, orderBy: { verifiedAt: "desc" }, select: { id: true, companyName: true, companyNameAr: true, city: true } })),
    safeItems(() => db.project.findMany({ take: 20, where: { status: "PENDING_REVIEW" }, orderBy: { createdAt: "desc" }, select: { id: true, title: true, titleAr: true, status: true } })),
    safeItems(() => db.user.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      where: {
        OR: [
          { role: "OWNER", ownerProfile: { is: { verificationStatus: { in: [...REVIEWABLE_VERIFICATION_STATUSES] } } } },
          { role: "CONTRACTOR", contractorProfile: { is: { verificationStatus: { in: [...REVIEWABLE_VERIFICATION_STATUSES] } } } },
          { role: "ENGINEER", engineerProfile: { is: { verificationStatus: { in: [...REVIEWABLE_VERIFICATION_STATUSES] } } } },
        ],
      },
      select: { id: true, email: true, role: true },
    })),
    safeItems(() => db.award.findMany({ take: 20, orderBy: { awardedAt: "desc" }, select: { id: true, awardedAmount: true, project: { select: { title: true, titleAr: true } } } })),
    safeItems(() => db.user.findMany({ take: 20, where: { role: "OWNER" }, orderBy: { createdAt: "desc" }, select: { id: true, email: true } })),
    safeItems(() => db.user.findMany({ take: 20, where: { role: "CONTRACTOR" }, orderBy: { createdAt: "desc" }, select: { id: true, email: true } })),
    safeItems(() => db.user.findMany({ take: 20, where: { role: "ENGINEER" }, orderBy: { createdAt: "desc" }, select: { id: true, email: true } })),
    safeItems(() => db.user.findMany({
      orderBy: { createdAt: "desc" },
      where: { role: { in: [...SUPPORTED_USER_ROLES] } },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        ownerProfile: { select: { verificationStatus: true } },
        contractorProfile: { select: { verificationStatus: true } },
        engineerProfile: { select: { verificationStatus: true } },
      },
    })),
    safeItems(() => db.project.findMany({ take: 20, where: { status: "PUBLISHED" }, orderBy: { publishedAt: "desc" }, select: { id: true, title: true, titleAr: true } })),
    safeItems(() => db.bid.findMany({ take: 20, orderBy: { createdAt: "desc" }, select: { id: true, amount: true, project: { select: { title: true, titleAr: true } } } })),
    safeItems(() => db.category.findMany({ take: 20, orderBy: { sortOrder: "asc" }, select: { id: true, name: true, nameAr: true } })),
    safeItems(() => db.location.findMany({ take: 20, orderBy: { sortOrder: "asc" }, select: { id: true, name: true, nameAr: true } })),
  ]);

  totalUsers = totalOwners + totalContractors + totalEngineers;

  const drilldowns = {
    totalUsers: allUserItems.map((u) => {
      const vs = u.ownerProfile?.verificationStatus || u.contractorProfile?.verificationStatus || u.engineerProfile?.verificationStatus || u.status;
      return { label: u.email, sublabel: `${u.role} · ${vs}` };
    }),
    totalProjects: recentProjects.map((p) => ({ label: isRtl ? p.titleAr || p.title : p.title, sublabel: `${p.status} · ${(p as any)._count?.bids || 0} ${isRtl ? "عرض" : "bids"}` })),
    verifiedContractors: verifiedContractorItems.map((c) => ({ label: isRtl ? c.companyNameAr || c.companyName : c.companyName, sublabel: c.city || (isRtl ? "بدون مدينة" : "No city") })),
    totalAwards: awardItems.map((a) => ({ label: isRtl ? a.project?.titleAr || a.project?.title : a.project?.title || "—", sublabel: `${a.awardedAmount?.toLocaleString() || 0} ${isRtl ? "ر.س" : "SAR"}` })),
    pendingProjects: pendingProjectItems.map((p) => ({ label: isRtl ? p.titleAr || p.title : p.title, sublabel: p.status })),
    pendingVerifications: pendingVerificationUsers.map((u) => ({ label: u.email, sublabel: u.role })),
    totalOwners: ownerItems.map((u) => ({ label: u.email, sublabel: isRtl ? "مالك مشروع" : "Owner" })),
    totalContractors: contractorItems.map((u) => ({ label: u.email, sublabel: isRtl ? "مقاول" : "Contractor" })),
    totalEngineers: engineerItems.map((u) => ({ label: u.email, sublabel: isRtl ? "مهندس" : "Engineer" })),
    publishedProjects: publishedProjectItems.map((p) => ({ label: isRtl ? p.titleAr || p.title : p.title, sublabel: isRtl ? "منشور" : "Published" })),
    totalBids: bidItems.map((b) => ({ label: isRtl ? b.project?.titleAr || b.project?.title : b.project?.title || "—", sublabel: `${b.amount?.toLocaleString() || 0} ${isRtl ? "ر.س" : "SAR"}` })),
    totalCategories: categoryItems.map((c) => ({ label: isRtl ? c.nameAr : c.name, sublabel: isRtl ? "تصنيف" : "Category" })),
    totalLocations: locationItems.map((l) => ({ label: isRtl ? l.nameAr : l.name, sublabel: isRtl ? "موقع" : "Location" })),
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <AdminHeader
        title={t("dashboard")}
        subtitle={isRtl ? "مرحباً بك في لوحة تحكم الإدارة" : "Welcome to the admin control panel"}
        isRtl={isRtl}
      />

      {/* Admin Navigation */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border-light)", padding: "0.75rem 0" }}>
        <div className="container-app" style={{ display: "grid", gap: "0.875rem" }}>
          {isFullAccess ? (
            // Full access admin - show all navigation
            [
              {
                title: isRtl ? "الإحصائيات والحوكمة" : "Statistics & Governance",
                items: [
                  { href: "/admin" as const, icon: BarChart3, label: isRtl ? "الإحصائيات" : "Statistics", color: "#1a2332" },
                  { href: "/admin/reports" as const, icon: BarChart3, label: isRtl ? "التقارير" : "Reports", color: "#059669" },
                  { href: "/admin/audit" as const, icon: FileText, label: isRtl ? "سجل العمليات" : "Audit Log", color: "#B87333" },
                  { href: "/admin/audit/auth" as const, icon: ShieldCheck, label: isRtl ? "حوادث المصادقة" : "Auth Incidents", color: "#dc2626" },
                  { href: "/admin/content" as const, icon: FileText, label: isRtl ? "إدارة المحتوى" : "Content Management", color: "#7c3aed" },
                ],
              },
              {
                title: isRtl ? "المستخدمون" : "Users",
                items: [
                  { href: "/admin/users" as const, icon: Users, label: isRtl ? "المستخدمون" : "Users", color: "#2563eb" },
                  { href: "/admin/engineers" as const, icon: ShieldCheck, label: isRtl ? "المهندسون" : "Engineers", color: "#2A7B88" },
                ],
              },
              {
                title: isRtl ? "العمليات والمنصة" : "Operations & Platform",
                items: [
                  { href: "/admin/projects" as const, icon: FolderOpen, label: isRtl ? "المشاريع" : "Projects", color: "#2A7B88" },
                  { href: "/admin/disputes" as const, icon: AlertTriangle, label: isRtl ? "النزاعات" : "Disputes", color: "#f59e0b" },
                  { href: "/admin/reviews" as const, icon: Eye, label: isRtl ? "التقييمات" : "Reviews", color: "#8b5cf6" },
                  { href: "/admin/refunds" as const, icon: DollarSign, label: isRtl ? "المبالغ المستردة" : "Refunds", color: "#dc2626" },
                  { href: "/admin/agents" as const, icon: Bot, label: isRtl ? "وكلاء AI" : "AI Agents", color: "#7c3aed" },
                  { href: "/admin/ai-hub" as const, icon: Bot, label: isRtl ? "مركز AI" : "AI Hub", color: "#5b21b6" },
                  { href: "/admin/marketing" as const, icon: Megaphone, label: isRtl ? "التسويق" : "Marketing", color: "#e11d48" },
                ],
              },
            ].map((group, gi) => (
              <div key={gi}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.5rem" }}>{group.title}</div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {group.items.map((nav, i) => (
                    <Link key={i} href={nav.href} style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.625rem 1rem", borderRadius: "var(--radius-lg)",
                      fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none",
                      color: "var(--text-secondary)", background: "var(--surface-2)",
                      border: "1px solid var(--border-light)", transition: "all 150ms ease",
                    }}>
                      <nav.icon style={{ width: "16px", height: "16px", color: nav.color }} />
                      {nav.label}
                      <ArrowRight style={{ width: "12px", height: "12px", color: "var(--text-muted)" }} />
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Regular admin - show only Users and Projects
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <Link href="/admin/users" style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.625rem 1rem", borderRadius: "var(--radius-lg)",
                fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none",
                color: "var(--text-secondary)", background: "var(--surface-2)",
                border: "1px solid var(--border-light)", transition: "all 150ms ease",
              }}>
                <Users style={{ width: "16px", height: "16px", color: "#2563eb" }} />
                {isRtl ? "المستخدمون" : "Users"}
                <ArrowRight style={{ width: "12px", height: "12px", color: "var(--text-muted)" }} />
              </Link>
              <Link href="/admin/projects" style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.625rem 1rem", borderRadius: "var(--radius-lg)",
                fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none",
                color: "var(--text-secondary)", background: "var(--surface-2)",
                border: "1px solid var(--border-light)", transition: "all 150ms ease",
              }}>
                <FolderOpen style={{ width: "16px", height: "16px", color: "#2A7B88" }} />
                {isRtl ? "المشاريع" : "Projects"}
                <ArrowRight style={{ width: "12px", height: "12px", color: "var(--text-muted)" }} />
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        <AdminDashboardClient
          isRtl={isRtl}
          stats={{
            totalUsers,
            totalProjects,
            verifiedContractors,
            totalAwards,
            pendingProjects,
            pendingVerifications,
            totalOwners,
            totalContractors,
            totalEngineers,
            publishedProjects,
            totalBids,
            totalCategories,
            totalLocations,
          }}
          recentUsers={recentUsers.map((u) => ({
            ...u,
            createdAt: new Date(u.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US"),
          }))}
          drilldowns={drilldowns}
        />
      </div>
    </div>
  );
}
