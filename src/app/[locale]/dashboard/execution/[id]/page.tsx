import { getCurrentUser } from "@/lib/auth";
import { redirect, Link } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { FolderOpen, CheckCircle, ArrowLeft, Users, Shield, Star } from "lucide-react";
import { FileList } from "@/components/execution/file-list";
import { WorkspaceChat } from "@/components/execution/workspace-chat";
// import { MilestoneTracker } from "@/components/execution/milestone-tracker";
import { markCompleteAction, submitProgressUpdate } from "./actions";

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
        owner: { select: { userId: true, fullName: true } },
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

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1C5963, #2A7B88)", padding: "2rem 0" }}>
        <div className="container-app">
          <Link href="/dashboard" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8125rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <ArrowLeft style={{ width: "14px", height: "14px" }} /> {isRtl ? "العودة للوحة التحكم" : "Back to Dashboard"}
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginTop: "0.5rem" }}>{isRtl ? "منطقة التنفيذ" : "Execution Workspace"}</h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.7)" }}>{isRtl ? (project.titleAr || project.title) : project.title}</p>
        </div>
      </div>
      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
          <div className="card" style={{ padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>{project.award.awardedAmount?.toLocaleString()}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{isRtl ? "قيمة العقد (ر.س)" : "Contract Value (SAR)"}</div>
          </div>
          <div className="card" style={{ padding: "1.25rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--accent)" }}>{project.status.replace(/_/g, " ")}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{isRtl ? "حالة المشروع" : "Project Status"}</div>
          </div>
          <div className="card" style={{ padding: "1.25rem", textAlign: "center" }}>
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
        <div className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem", border: "1px solid rgba(37,99,235,0.2)", background: "#eff6ff" }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* <MilestoneTracker milestones={milestones} isRtl={isRtl} /> */}
          <div className="card" style={{ padding: "1.5rem" }}>
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
            <div className="card" style={{ padding: "1.25rem", display: "flex", alignItems: "center" }}>
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
          <div className="card" style={{ padding: "1.5rem", marginTop: "1.5rem", border: "2px solid var(--primary)", textAlign: "center" }}>
            <CheckCircle style={{ width: "32px", height: "32px", color: "var(--primary)", margin: "0 auto 0.5rem" }} />
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--primary)" }}>{isRtl ? "تم إتمام المشروع بنجاح! 🎉" : "Project Completed! 🎉"}</h3>
            {project.completedAt && <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{new Date(project.completedAt).toLocaleDateString()}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
