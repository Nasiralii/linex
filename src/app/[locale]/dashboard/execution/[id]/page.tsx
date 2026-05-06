import { getCurrentUser } from "@/lib/auth";
import { redirect, Link } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { FolderOpen, CheckCircle, ArrowLeft, Users, Shield, Star } from "lucide-react";
import { FileList } from "@/components/execution/file-list";
import { WorkspaceChat } from "@/components/execution/workspace-chat";
import { parseProjectMeta } from "@/lib/project-meta";
// import { MilestoneTracker } from "@/components/execution/milestone-tracker";
import { markCompleteAction, submitExecutionReviewAction, submitProgressUpdate } from "./actions";

function dedupeWorkspaceMessages(messages: any[]) {
  const deduped: any[] = [];
  const seen = new Set<string>();

  for (const msg of messages) {
    const createdAt = new Date(msg.createdAt).getTime();
    const bucket = Math.floor(createdAt / 2000);
    const key = [msg.senderId, msg.projectId, msg.content, bucket].join("::");

    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(msg);
  }

  return deduped;
}

export default async function ExecutionWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) return redirect({ href: "/auth/login", locale });
  const isRtl = locale === "ar";

  let project: any = null;
  let messages: any[] = [];
  let contractorProfileId: string | null = null;
  let engineerProfileId: string | null = null;
  let supervisorUserId: string | null = null;
  let supervisorProfile: any = null;
  try {
    if (user.role === "CONTRACTOR") {
      contractorProfileId = (await db.contractorProfile.findUnique({ where: { userId: user.id }, select: { id: true } }))?.id || null;
    }
    if (user.role === "ENGINEER") {
      engineerProfileId = (await db.engineerProfile.findUnique({ where: { userId: user.id }, select: { id: true } }))?.id || null;
    }
    supervisorUserId = (await db.supervisionRequest.findFirst({
      where: { projectId: id, status: { in: ["ASSIGNED", "COMPLETED"] }, assignedTo: { not: null } },
      orderBy: { updatedAt: "desc" },
      select: { assignedTo: true },
    }))?.assignedTo || null;

    if (supervisorUserId) {
      supervisorProfile = await db.engineerProfile.findUnique({
        where: { userId: supervisorUserId },
        select: {
          userId: true,
          fullName: true,
          fullNameAr: true,
          specialization: true,
          yearsExperience: true,
          ratingAverage: true,
          reviewCount: true,
        },
      });
    }

    project = await db.project.findUnique({
      where: { id },
      include: {
        category: { select: { name: true, nameAr: true } },
        location: { select: { name: true, nameAr: true } },
        requiredTrades: { select: { tradeName: true, tradeNameAr: true } },
        owner: { select: { userId: true, fullName: true, companyName: true } },
        reviews: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            author: { select: { fullName: true } },
            authorUser: { select: { email: true } },
          },
        },
        bids: {
          orderBy: { submittedAt: "desc" },
          select: {
            id: true,
            amount: true,
            estimatedDuration: true,
            proposalText: true,
            status: true,
            contractor: { select: { companyName: true, companyNameAr: true, userId: true } },
            engineer: { select: { fullName: true, fullNameAr: true, userId: true } },
          },
        },
        award: {
          select: {
            contractorId: true,
            engineerId: true,
            awardedAmount: true,
            bid: {
              select: {
                contractor: { select: { userId: true, companyName: true } },
                engineer: { select: { userId: true, fullName: true } },
              },
            },
          },
        },
        attachments: { orderBy: { createdAt: "asc" } },
      },
    });
  } catch (error) {
    console.error('[ExecutionWorkspacePage] DB query failed:', error);
    return (
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)" }}>{isRtl ? "حدث خطأ" : "Something went wrong"}</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>{isRtl ? "تعذر تحميل المشروع. تأكد من صحة الرابط." : "Could not load project. Please check the URL."}</p>
        <Link href="/dashboard" style={{ color: "var(--primary)", marginTop: "1rem", display: "inline-block" }}>{isRtl ? "العودة للوحة التحكم" : "Back to Dashboard"}</Link>
      </div>
    );
  }
  if (!project || !project.award || !["AWARDED", "IN_PROGRESS", "COMPLETED"].includes(project.status)) {
    return (
      <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)" }}>{isRtl ? "المشروع غير موجود" : "Project Not Found"}</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>{isRtl ? "لم يتم العثور على المشروع أو لم يتم ترسيته بعد." : "Project not found or not yet awarded."}</p>
        <Link href="/dashboard" style={{ color: "var(--primary)", marginTop: "1rem", display: "inline-block" }}>{isRtl ? "العودة للوحة التحكم" : "Back to Dashboard"}</Link>
      </div>
    );
  }

  const isOwner = project.owner.userId === user.id;
  const isAwardedContractor =
    (project.award.bid?.contractor?.userId === user.id) ||
    (!!contractorProfileId && project.award.contractorId === contractorProfileId);
  const isAwardedEngineer =
    (project.award.bid?.engineer?.userId === user.id) ||
    (!!engineerProfileId && project.award.engineerId === engineerProfileId);
  const isSupervisor = !!supervisorUserId && supervisorUserId === user.id;

  if (!isOwner && !isAwardedContractor && !isAwardedEngineer && !isSupervisor && user.role !== "ADMIN") return notFound();

  try {
    messages = await db.message.findMany({ where: { projectId: id }, orderBy: { createdAt: "asc" }, include: { sender: { select: { email: true, role: true } } }, take: 100 });
    messages = dedupeWorkspaceMessages(messages);
  } catch (error) {
    console.error('[ExecutionWorkspacePage] messages query failed:', error);
  }
  const awardedPartyName = project.award.bid?.contractor?.companyName || project.award.bid?.engineer?.fullName || "";
  const awardedPartyUserId = project.award.bid?.contractor?.userId || project.award.bid?.engineer?.userId || null;
  const canSeeAllBids = isOwner || user.role === "ADMIN";
  const visibleBids = canSeeAllBids
    ? project.bids
    : project.bids.filter(
        (bid: any) =>
          (bid.contractor?.userId && bid.contractor.userId === awardedPartyUserId) ||
          (bid.engineer?.userId && bid.engineer.userId === awardedPartyUserId) ||
          bid.status === "AWARDED"
      );
  const projectMeta = parseProjectMeta(project.scopeSummary);
  const displayCategory = project.category?.name
    ? (isRtl ? (project.category.nameAr || project.category.name) : project.category.name)
    : (project.projectType?.replace(/_/g, " ") || "—");
  const displayLocation = project.location?.name
    ? (isRtl ? (project.location.nameAr || project.location.name) : project.location.name)
    : [projectMeta.city, projectMeta.neighborhood, projectMeta.addressName].filter(Boolean).join(" • ") || "—";

  // Milestone tracking intentionally disabled for now.
  // const milestones = [
  //   { name: isRtl ? "ترسية المشروع" : "Project Awarded", done: true, date: project.awardedAt },
  //   { name: isRtl ? "بدء التنفيذ" : "Execution Started", done: ["IN_PROGRESS", "COMPLETED"].includes(project.status), date: null },
  //   { name: isRtl ? "اكتمال 25%" : "25% Complete", done: false, date: null },
  //   { name: isRtl ? "اكتمال 50%" : "50% Complete", done: false, date: null },
  //   { name: isRtl ? "اكتمال 75%" : "75% Complete", done: false, date: null },
  //   { name: isRtl ? "التسليم النهائي" : "Final Delivery", done: project.status === "COMPLETED", date: project.completedAt },
  // ];

  // Gap 2: file versioning data
  const files = project.attachments.map((a: any) => ({
    id: a.id, fileName: a.fileName, fileUrl: a.fileUrl, fileSize: a.fileSize,
    createdAt: a.createdAt.toISOString(), uploaderName: isOwner ? (isRtl ? "المالك" : "Owner") : awardedPartyName,
  }));
  const cardBase: React.CSSProperties = {
    padding: "1.25rem",
    borderRadius: "16px",
    border: "1px solid rgba(15, 23, 42, 0.08)",
    background: "linear-gradient(180deg, #ffffff, #fbfdff)",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  };
  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "1.02rem",
    fontWeight: 800,
    color: "var(--text)",
    marginBottom: "0.85rem",
    letterSpacing: "-0.01em",
  };
  const bidStatusTone: Record<string, { bg: string; color: string }> = {
    AWARDED: { bg: "#dcfce7", color: "#166534" },
    SHORTLISTED: { bg: "#dbeafe", color: "#1d4ed8" },
    SUBMITTED: { bg: "#f3f4f6", color: "#374151" },
    REJECTED: { bg: "#fee2e2", color: "#b91c1c" },
    WITHDRAWN: { bg: "#f3f4f6", color: "#6b7280" },
  };
  let hasReviewed = false;
  let canReview = false;
  let reviewTargetName = "";
  let reviewTargetRoleLabel = "";
  if (["COMPLETED", "AWARDED"].includes(project.status) && project.award) {
    const isAwardedParty = isAwardedContractor || isAwardedEngineer;
    const reviewTargetUserId = isOwner ? awardedPartyUserId : isAwardedParty ? project.owner?.userId : null;
    if (reviewTargetUserId) {
      const existingReview = await db.review.findFirst({
        where: { projectId: id, authorUserId: user.id },
        select: { id: true },
      });
      hasReviewed = !!existingReview;
      canReview = !hasReviewed;
      if (isOwner) {
        reviewTargetName = awardedPartyName;
        reviewTargetRoleLabel = project.award.bid?.contractor?.userId ? (isRtl ? "المقاول" : "Contractor") : (isRtl ? "المهندس" : "Engineer");
      } else {
        reviewTargetName = project.owner?.fullName || "";
        reviewTargetRoleLabel = isRtl ? "المالك" : "Owner";
      }
    }
  }

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(120deg, #123d45 0%, #1f6a77 50%, #2A7B88 100%)", padding: "2.25rem 0 2rem 0" }}>
        <div className="container-app">
          <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8125rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <ArrowLeft style={{ width: "14px", height: "14px" }} /> {isRtl ? "العودة للوحة التحكم" : "Back to Dashboard"}
          </Link>
          <h1 style={{ fontSize: "1.65rem", fontWeight: 900, color: "white", marginTop: "0.5rem", letterSpacing: "-0.01em" }}>{isRtl ? "منطقة التنفيذ" : "Execution Workspace"}</h1>
          <p style={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.78)", maxWidth: "900px" }}>{isRtl ? (project.titleAr || project.title) : project.title}</p>
        </div>
      </div>
      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.85rem", marginBottom: "1.25rem" }}>
          <div style={{ ...cardBase, textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>{project.award.awardedAmount?.toLocaleString()}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{isRtl ? "قيمة العقد (ر.س)" : "Contract Value (SAR)"}</div>
          </div>
          <div style={{ ...cardBase, textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent)" }}>{project.status.replace(/_/g, " ")}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{isRtl ? "حالة المشروع" : "Project Status"}</div>
          </div>
          <div style={{ ...cardBase, textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--info)" }}><Users style={{ width: "24px", height: "24px", display: "inline" }} /></div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {isOwner ? (
                <>
                  {isRtl ? "المُرسى عليه:" : "Awarded:"}{" "}
                  {awardedPartyUserId ? (
                    <Link href={`/profile/${awardedPartyUserId}`} style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 700 }}>
                      {awardedPartyName || (isRtl ? "غير متوفر" : "N/A")}
                    </Link>
                  ) : <span style={{ color: "var(--text)", fontWeight: 700 }}>{awardedPartyName || (isRtl ? "غير متوفر" : "N/A")}</span>}
                </>
              ) : (
                <>
                  {isRtl ? "المالك:" : "Owner:"}{" "}
                  <Link
                    href={`/profile/${project.owner.userId}`}
                    style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 700 }}
                  >
                    {project.owner.fullName || (isRtl ? "المالك" : "Owner")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        <div style={{ ...cardBase, marginBottom: "1rem", border: "1px solid rgba(37,99,235,0.18)", background: "linear-gradient(180deg, #eff6ff, #f6f9ff)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <Shield style={{ width: "18px", height: "18px", color: "#2563eb" }} />
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", margin: 0 }}>
                  {isRtl ? "المشرف المعين" : "Assigned Supervisor"}
                </h3>
              </div>
              {supervisorProfile ? (
                <>
                  <Link
                    href={`/profile/${supervisorProfile.userId}`}
                    style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#1d4ed8", textDecoration: "none" }}
                  >
                    {isRtl ? (supervisorProfile.fullNameAr || supervisorProfile.fullName) : supervisorProfile.fullName}
                  </Link>
                  <div style={{ marginTop: "0.35rem", fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                    {isRtl ? `التخصص: ${supervisorProfile.specialization}` : `Specialization: ${supervisorProfile.specialization}`}
                    {supervisorProfile.yearsExperience ? ` • ${isRtl ? `الخبرة: ${supervisorProfile.yearsExperience} سنة` : `${supervisorProfile.yearsExperience} years experience`}` : ""}
                    {typeof supervisorProfile.ratingAverage === "number" ? ` • ${isRtl ? `التقييم: ${supervisorProfile.ratingAverage.toFixed(1)}` : `Rating: ${supervisorProfile.ratingAverage.toFixed(1)}`}` : ""}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                  {isRtl ? "لا يوجد مشرف معيّن على هذا المشروع حتى الآن." : "No supervisor is assigned to this project yet."}
                </div>
              )}
            </div>
            {supervisorProfile?.reviewCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8125rem", color: "#1d4ed8", fontWeight: 700 }}>
                <Star style={{ width: "14px", height: "14px" }} />
                {supervisorProfile.reviewCount} {isRtl ? "مراجعات" : "reviews"}
              </div>
            )}
          </div>
        </div>
        <div style={{ ...cardBase, marginBottom: "1rem" }}>
          <h3 style={sectionTitleStyle}>{isRtl ? "ملخص سريع" : "Quick Snapshot"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.6rem" }}>
            {[
              { k: isRtl ? "الحالة" : "Status", v: project.status.replace(/_/g, " ") },
              { k: isRtl ? "النوع" : "Type", v: project.projectType?.replace(/_/g, " ") || "—" },
              { k: isRtl ? "تاريخ النشر" : "Published", v: project.publishedAt ? new Date(project.publishedAt).toLocaleDateString() : "—" },
              ...((isOwner || user.role === "ADMIN")
                ? [{ k: isRtl ? "الميزانية" : "Budget", v: `${project.budgetMin?.toLocaleString() || "—"} - ${project.budgetMax?.toLocaleString() || "—"} ${project.currency || "SAR"}` }]
                : []),
            ].map((item, idx) => (
              <div key={idx} style={{ borderRadius: "12px", background: "var(--surface-2)", padding: "0.65rem 0.75rem" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>{item.k}</div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>{item.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ ...cardBase, marginBottom: "1rem" }}>
          <h3 style={sectionTitleStyle}>{isRtl ? "تفاصيل المشروع" : "Project Details"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(140px, 220px) 1fr", gap: "0.75rem 1rem", alignItems: "start" }}>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{isRtl ? "المواصفات" : "Specifications"}</div>
            <div style={{ fontSize: "0.84rem", color: "var(--text)", lineHeight: 1.7 }}>
              {isRtl
                ? (project.scopeSummaryAr || projectMeta.specifications || "—")
                : (projectMeta.specifications || "—")}
            </div>

            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{isRtl ? "تاريخ البدء" : "Start Date"}</div>
            <div style={{ fontSize: "0.84rem", color: "var(--text)" }}>
              {project.requiredStartDate ? new Date(project.requiredStartDate).toLocaleDateString(isRtl ? "ar-SA" : "en-SA") : "—"}
            </div>

            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{isRtl ? "تاريخ الانتهاء" : "End Date"}</div>
            <div style={{ fontSize: "0.84rem", color: "var(--text)" }}>
              {project.deadline ? new Date(project.deadline).toLocaleDateString(isRtl ? "ar-SA" : "en-SA") : "—"}
            </div>

            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{isRtl ? "ملف المالك" : "Owner Profile"}</div>
            <div style={{ fontSize: "0.84rem", color: "var(--text)" }}>
              <Link href={`/profile/${project.owner.userId}`} style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 700 }}>
                {project.owner.fullName || project.owner.companyName || (isRtl ? "المالك" : "Owner")}
              </Link>
            </div>

            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{isRtl ? "التصنيف" : "Category"}</div>
            <div style={{ fontSize: "0.84rem", color: "var(--text)" }}>
              {displayCategory}
            </div>

            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{isRtl ? "الموقع" : "Location"}</div>
            <div style={{ fontSize: "0.84rem", color: "var(--text)" }}>
              {displayLocation}
            </div>

            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{isRtl ? "التخصصات" : "Trades"}</div>
            <div style={{ fontSize: "0.84rem", color: "var(--text)" }}>
              {project.requiredTrades?.length > 0
                ? project.requiredTrades.map((t: any) => (isRtl ? (t.tradeNameAr || t.tradeName) : t.tradeName)).join(", ")
                : "—"}
            </div>

            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{isRtl ? "جهات الاتصال" : "Contact Persons"}</div>
            <div style={{ fontSize: "0.84rem", color: "var(--text)" }}>
              {projectMeta.contacts?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                  {projectMeta.contacts.map((contact: any, idx: number) => (
                    <div key={`${contact.name || "contact"}-${idx}`} style={{ padding: "0.5rem 0.65rem", border: "1px solid rgba(15,23,42,0.08)", borderRadius: "10px", background: "#f8fafc" }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)" }}>
                        {contact.name || (isRtl ? `جهة اتصال ${idx + 1}` : `Contact ${idx + 1}`)}
                      </div>
                      <div style={{ marginTop: "0.2rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        <span dir="ltr">{contact.phone || "—"}</span>
                        {contact.email ? (
                          <>
                            {" • "}
                            <span dir="ltr">{contact.email}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                "—"
              )}
            </div>
          </div>
        </div>
        {project.reviews?.length > 0 && (
          <div style={{ ...cardBase, marginBottom: "1rem" }}>
            <h3 style={sectionTitleStyle}>{isRtl ? "التقييمات" : "Reviews"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {project.reviews.map((review: any) => (
                <div key={review.id} style={{ padding: "0.8rem", borderRadius: "12px", border: "1px solid rgba(15,23,42,0.06)", background: "#f8fafc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text)" }}>
                      {review.author?.fullName || review.authorUser?.email || (isRtl ? "مستخدم" : "User")}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {"★".repeat(Math.max(1, Math.min(5, review.rating || 0)))} ({review.rating}/5) • {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {review.comment && (
                    <div style={{ marginTop: "0.35rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      {review.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {visibleBids?.length > 0 && (
          <div style={{ ...cardBase, marginBottom: "1rem" }}>
            <h3 style={sectionTitleStyle}>{isRtl ? `العروض المقدمة (${visibleBids.length})` : `Submitted Bids (${visibleBids.length})`}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {visibleBids.map((bid: any) => {
                const bidder = bid.contractor || bid.engineer;
                const bidderName = bid.contractor
                  ? (isRtl ? (bid.contractor.companyNameAr || bid.contractor.companyName) : bid.contractor.companyName)
                  : (isRtl ? (bid.engineer?.fullNameAr || bid.engineer?.fullName) : bid.engineer?.fullName);
                return (
                  <div key={bid.id} style={{ padding: "0.85rem", borderRadius: "12px", border: "1px solid rgba(15,23,42,0.07)", background: "linear-gradient(180deg, #ffffff, #f8fafc)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontSize: "0.8125rem", color: "var(--text)" }}>
                        {bidder?.userId ? (
                          <Link href={`/profile/${bidder.userId}`} style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 700 }}>
                            {bidderName || (isRtl ? "غير متوفر" : "N/A")}
                          </Link>
                        ) : (
                          <span style={{ fontWeight: 700 }}>{bidderName || (isRtl ? "غير متوفر" : "N/A")}</span>
                        )}
                        <span
                          style={{
                            marginInlineStart: "0.5rem",
                            padding: "0.12rem 0.45rem",
                            borderRadius: "999px",
                            fontSize: "0.67rem",
                            fontWeight: 700,
                            background: (bidStatusTone[bid.status] || { bg: "#f3f4f6" }).bg,
                            color: (bidStatusTone[bid.status] || { color: "#374151" }).color,
                          }}
                        >
                          {bid.status}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "var(--primary)" }}>
                        {bid.amount?.toLocaleString()} SAR
                        {bid.estimatedDuration ? ` • ${bid.estimatedDuration} ${isRtl ? "يوم" : "days"}` : ""}
                      </div>
                    </div>
                    {bid.proposalText && (
                      <div style={{ marginTop: "0.35rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        {bid.proposalText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {(canReview || hasReviewed) && (
          <div style={{ ...cardBase, marginBottom: "1rem", border: canReview ? "2px solid var(--accent)" : "1px solid var(--success)" }}>
            {canReview ? (
              <>
                <h3 style={sectionTitleStyle}>
                  {isRtl
                    ? `قيّم ${reviewTargetRoleLabel || "الطرف الآخر"}${reviewTargetName ? `: ${reviewTargetName}` : ""}`
                    : `Rate ${reviewTargetRoleLabel || "the other party"}${reviewTargetName ? `: ${reviewTargetName}` : ""}`}
                </h3>
                <form action={submitExecutionReviewAction}>
                  <input type="hidden" name="projectId" value={id} />
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.35rem", display: "block" }}>
                      {isRtl ? "التقييم" : "Rating"} *
                    </label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {[1, 2, 3, 4, 5].map((v) => (
                        <label key={v} style={{ cursor: "pointer" }}>
                          <input type="radio" name="rating" value={v} required style={{ display: "none" }} />
                          <Star style={{ width: "24px", height: "24px", color: "var(--accent)" }} />
                          <span style={{ display: "block", textAlign: "center", fontSize: "0.7rem", color: "var(--text-muted)" }}>{v}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.35rem", display: "block" }}>
                      {isRtl ? "تعليق" : "Comment"}
                    </label>
                    <textarea name="comment" style={{ minHeight: "76px", resize: "vertical" }} placeholder={isRtl ? "شاركنا تجربتك..." : "Share your experience..."} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: "0.65rem 1.2rem", fontSize: "0.8125rem" }}>
                    <Star style={{ width: "14px", height: "14px" }} /> {isRtl ? "إرسال التقييم" : "Submit Review"}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ fontSize: "0.8125rem", color: "var(--success)" }}>
                {isRtl ? "تم إرسال تقييمك لهذا المشروع." : "Your rating for this project was submitted."}
              </div>
            )}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1rem" }}>
          {/* <MilestoneTracker milestones={milestones} isRtl={isRtl} /> */}
          <div style={{ ...cardBase, padding: "1.35rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FolderOpen style={{ width: "18px", height: "18px", color: "var(--primary)" }} /> {isRtl ? "ملفات المشروع" : "Project Files"}
            </h3>
            <FileList files={files} isRtl={isRtl} />
          </div>
          <WorkspaceChat messages={messages} userId={user.id} projectId={id} isRtl={isRtl} embedded />
        </div>
        {project.status !== "COMPLETED" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", marginTop: "1.5rem" }}>
            {/* <div className="card" style={{ padding: "1.25rem" }}>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, marginBottom: "0.75rem" }}>📋 {isRtl ? "تحديث التقدم" : "Submit Progress Update"}</h3>
              <form action={submitProgressUpdate} style={{ display: "flex", gap: "0.5rem" }}>
                <input type="hidden" name="projectId" value={id} />
                <input type="text" name="progressUpdate" placeholder={isRtl ? "وصف التقدم..." : "Describe progress..."} required style={{ flex: 1 }} />
                <button type="submit" className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}>{isRtl ? "إرسال" : "Send"}</button>
              </form>
            </div> */}
            <div style={{ ...cardBase, display: "flex", alignItems: "center" }}>
              <form action={markCompleteAction}>
                <input type="hidden" name="projectId" value={id} />
                <button type="submit" className="btn-primary" style={{ padding: "0.75rem 1.5rem", fontSize: "0.875rem" }}>
                  <CheckCircle style={{ width: "16px", height: "16px" }} /> {isRtl ? "إتمام المشروع" : "Mark Complete"}
                </button>
              </form>
            </div>
          </div>
        )}
        {project.status === "COMPLETED" && (
          <div style={{ ...cardBase, padding: "1.5rem", marginTop: "1rem", border: "1px solid rgba(42,123,136,0.35)", background: "linear-gradient(180deg, #ecfeff, #f7fffe)", textAlign: "center" }}>
            <CheckCircle style={{ width: "32px", height: "32px", color: "var(--primary)", margin: "0 auto 0.5rem" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--primary)" }}>{isRtl ? "تم إتمام المشروع بنجاح! 🎉" : "Project Completed! 🎉"}</h3>
            {project.completedAt && <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{new Date(project.completedAt).toLocaleDateString()}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
