import { getCurrentUser } from "@/lib/auth";
import { redirect, Link } from "@/i18n/routing";
import { getLocale } from "next-intl/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
import { revalidatePath } from "next/cache";
import { CheckCircle, XCircle, Clock, Eye, FileText, Phone, MapPin, Tag, Banknote, User, MessageSquare, ChevronDown, ChevronUp, Shield, Star } from "lucide-react";
import { parseProjectMeta, formatProjectBudget } from "@/lib/project-meta";

function formatProjectAttachmentLabel(file: { fileName: string; fileUrl: string }, isRtl: boolean) {
  const source = `${file.fileUrl} ${file.fileName}`.toLowerCase();
  if (source.includes("/drawings/") || source.includes("draw_")) return isRtl ? "مخططات / تصاميم" : "Drawings / Designs";
  if (source.includes("/boq/") || source.includes("boq")) return isRtl ? "جدول الكميات" : "BOQ";
  if (source.includes("/site-photos/") || source.includes("site_")) return isRtl ? "صور الموقع" : "Site Photos";
  if (source.includes("/project-images/") || source.includes("img_")) return isRtl ? "صور المشروع" : "Project Images";
  return isRtl ? "مرفق مشروع" : "Project Attachment";
}

// G11: Admin full project view with ALL details
// G12: Request edits with specific guidance text

async function approveProject(formData: FormData) {
  "use server";
  const projectId = formData.get("projectId") as string;
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return;
  try {
    const now = new Date();
    // Gap 6: Set biddingWindowEnd to 30 days from publish
    const biddingWindowEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const existingProject = await db.project.findUnique({ where: { id: projectId }, select: { status: true } });
      if (!existingProject || existingProject.status === "PUBLISHED") {
        revalidatePath("/admin/projects");
        return;
      }
      await db.project.update({ where: { id: projectId }, data: { status: "PUBLISHED", publishedAt: now, biddingWindowEnd } });
      await db.projectStatusHistory.create({ data: { projectId, fromStatus: "PENDING_REVIEW", toStatus: "PUBLISHED", changedBy: user.id, reason: "Approved by admin" } });
      // G22: Auto-notify matching users on publish
      const project = await db.project.findUnique({ where: { id: projectId }, select: { title: true, titleAr: true, projectType: true, owner: { select: { userId: true } } } });
      if (project) {
        // BUG-11: Notify project owner on approval
        await db.notification.create({
          data: {
            userId: project.owner.userId, type: "PROJECT_APPROVED",
            title: "Your project has been approved!", titleAr: "تم الموافقة على مشروعك!",
            message: `${project.title} is now live on the marketplace.`,
            messageAr: `تم نشر ${project.titleAr || project.title} في السوق.`,
            link: `/marketplace/${projectId}`,
          },
        });

        // BUG-C08: Notify all admins when project is approved/published
        const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
        if (admins.length > 0) {
          await db.notification.createMany({
            data: admins.map((admin) => ({
              userId: admin.id, type: "GENERAL",
              title: "Project approved and published", titleAr: "تم الموافقة على المشروع ونشره",
              message: `${project.title} has been approved and is now live.`,
              messageAr: `تم الموافقة على ${project.titleAr || project.title} وهو الآن متاح.`,
              link: `/admin/projects`,
            })),
          });
        }
      const matchRoles = project.projectType === "CONSTRUCTION_ONLY" ? ["CONTRACTOR"] :
        project.projectType === "DESIGN_ONLY" ? ["ENGINEER"] : ["CONTRACTOR", "ENGINEER"];
      const matchUsers = await db.user.findMany({ where: { role: { in: matchRoles as any }, status: "ACTIVE" }, select: { id: true }, take: 50 });
      for (const u of matchUsers) {
        await db.notification.create({
          data: {
            userId: u.id, type: "GENERAL",
            title: "New project matches your profile!", titleAr: "مشروع جديد يناسب ملفك!",
            message: `${project.title} has been published.`, messageAr: `تم نشر ${project.titleAr || project.title}`,
            link: `/marketplace`,
          },
        });
      }
    }
    // G19: Auto-badge assignment on project publish (uses evaluateUserBadges)
    const owner = await db.project.findUnique({ where: { id: projectId }, select: { owner: { select: { userId: true } } } });
    if (owner?.owner?.userId) {
      const { evaluateUserBadges } = await import("@/lib/badges");
      await evaluateUserBadges(owner.owner.userId).catch(() => {});
    }
  } catch (error) {
    console.error('[approveProject] DB query failed:', error);
  }
  revalidatePath("/admin/projects");
}

async function requestEditsAction(formData: FormData) {
  "use server";
  const projectId = formData.get("projectId") as string;
  const editNotes = formData.get("editNotes") as string;
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return;
  try {
    await db.project.update({ where: { id: projectId }, data: { status: "CHANGES_REQUESTED", rejectionReason: editNotes || "Please review and update your project" } });
    await db.projectStatusHistory.create({ data: { projectId, fromStatus: "PENDING_REVIEW", toStatus: "CHANGES_REQUESTED", changedBy: user.id, reason: editNotes } });
    const project = await db.project.findUnique({ where: { id: projectId }, select: { owner: { select: { userId: true } } } });
    if (project?.owner?.userId) {
      await db.notification.create({
        data: {
          userId: project.owner.userId, type: "PROJECT_CHANGES_REQUESTED",
          title: "Changes requested for your project", titleAr: "مطلوب تعديلات على مشروعك",
          message: editNotes || "Admin requested changes", messageAr: editNotes || "طلب المسؤول تعديلات",
          link: `/dashboard/projects/new?draft=${projectId}`,
        },
      });
    }
  } catch (error) {
    console.error('[requestEditsAction] DB query failed:', error);
  }
  revalidatePath("/admin/projects");
}

async function rejectProject(formData: FormData) {
  "use server";
  const projectId = formData.get("projectId") as string;
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return;
  try {
    const project = await db.project.findUnique({ where: { id: projectId }, select: { title: true, titleAr: true, owner: { select: { userId: true } } } });
    await db.project.update({ where: { id: projectId }, data: { status: "CANCELLED" } });
    await db.projectStatusHistory.create({ data: { projectId, fromStatus: "PENDING_REVIEW", toStatus: "CANCELLED", changedBy: user.id, reason: "Rejected by admin" } });
    // BUG-11: Notify project owner on rejection
    if (project?.owner?.userId) {
      await db.notification.create({
        data: {
          userId: project.owner.userId, type: "PROJECT_REJECTED",
          title: "Your project was rejected", titleAr: "تم رفض مشروعك",
          message: `${project.title} was rejected by admin. Please review and resubmit.`,
          messageAr: `تم رفض ${project.titleAr || project.title} من قبل الإدارة. يرجى المراجعة وإعادة الإرسال.`,
          link: `/dashboard/projects`,
        },
      });
    }
  } catch (error) {
    console.error('[rejectProject] DB query failed:', error);
  }
  revalidatePath("/admin/projects");
}

export default async function AdminProjectsPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user || user.role !== "ADMIN") return redirect({ href: "/auth/login", locale });
  const isRtl = locale === "ar";

  let projects: any[] = [];
  try {
    projects = await db.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        owner: { select: { fullName: true, companyName: true, phone: true, userId: true } },
        category: { select: { name: true, nameAr: true } },
        location: { select: { name: true, nameAr: true } },
        attachments: { select: { fileName: true, fileUrl: true } },
        bids: {
          orderBy: { submittedAt: "desc" },
          include: {
            contractor: { select: { companyName: true, companyNameAr: true, verificationStatus: true } },
            attachments: { select: { fileName: true, fileUrl: true } },
          },
        },
        requiredTrades: { select: { tradeName: true, tradeNameAr: true } },
        _count: { select: { bids: true } },
        statusHistory: {
          where: { toStatus: "PENDING_REVIEW" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
        supervisionRequests: {
          where: { status: { in: ["ASSIGNED", "COMPLETED"] }, assignedTo: { not: null } },
          orderBy: { updatedAt: "desc" },
          take: 1,
          include: {
            bids: {
              where: { status: "AWARDED" },
              include: {
                engineer: {
                  select: {
                    userId: true,
                    fullName: true,
                    fullNameAr: true,
                    specialization: true,
                    yearsExperience: true,
                    ratingAverage: true,
                    reviewCount: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error('[AdminProjectsPage] DB query failed:', error);
  }

  const pending = projects.filter(p => p.status === "PENDING_REVIEW");
  const others = projects.filter(p => p.status !== "PENDING_REVIEW");

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1a2332, #2d3748)", padding: "2rem 0" }}>
        <div className="container-app">
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>
            {isRtl ? "مراجعة المشاريع" : "Project Review Queue"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.6)" }}>
            {isRtl ? `${pending.length} بانتظار المراجعة` : `${pending.length} pending review`}
          </p>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        {/* Pending Projects */}
        {pending.length > 0 && (
          <>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>
              <Clock style={{ width: "16px", height: "16px", display: "inline", color: "var(--accent)" }} /> {isRtl ? "بانتظار المراجعة" : "Pending Review"} ({pending.length})
            </h3>
            {pending.map((project: any) => {
              const meta = parseProjectMeta(project.scopeSummary);
                const assignedSupervisor = project.supervisionRequests?.[0]?.bids?.[0]?.engineer || null;
              return (
              <div key={project.id} className="card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
                    {isRtl ? (project.titleAr || project.title) : project.title}
                  </h3>
                  <span className="chip chip-warning" style={{ fontSize: "0.6875rem" }}>{isRtl ? "قيد المراجعة" : "Pending Review"}</span>
                </div>
                {/* G11: Full detail view */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1rem", fontSize: "0.8125rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--text-muted)" }}>
                    <User style={{ width: "14px", height: "14px" }} /> {project.owner?.fullName || project.owner?.companyName}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--text-muted)" }}>
                    <Phone style={{ width: "14px", height: "14px" }} /> {project.owner?.phone || "—"}
                  </div>
                  {project.category && <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--text-muted)" }}>
                    <Tag style={{ width: "14px", height: "14px" }} /> {isRtl ? project.category.nameAr : project.category.name}
                  </div>}
                  {project.location && <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--text-muted)" }}>
                    <MapPin style={{ width: "14px", height: "14px" }} /> {isRtl ? project.location.nameAr : project.location.name}
                  </div>}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--primary)", fontWeight: 700 }}>
                    <Banknote style={{ width: "14px", height: "14px" }} /> {formatProjectBudget(meta.estimatedBudget, project.budgetMax)} {isRtl ? "ر.س" : "SAR"}
                  </div>
                  <div style={{ color: "var(--text-muted)" }}>
                    {isRtl ? "النوع:" : "Type:"} {project.projectType === "DESIGN_ONLY" ? (isRtl ? "تصميم فقط" : "Design Only") : project.projectType === "DESIGN_AND_CONSTRUCTION" ? (isRtl ? "تصميم وتنفيذ" : "Design & Construction") : (isRtl ? "تنفيذ فقط" : "Construction Only")}
                  </div>
                  <div style={{ color: "var(--text-muted)" }}>
                    {isRtl ? "تاريخ التقديم:" : "Submitted:"} {project.statusHistory?.[0]?.createdAt
                      ? new Date(project.statusHistory[0].createdAt).toLocaleDateString(isRtl ? "ar-SA" : "en-US")
                      : new Date(project.createdAt).toLocaleDateString(isRtl ? "ar-SA" : "en-US")}
                  </div>
                </div>
                {(meta.neighborhood || meta.addressName || meta.detailedAddress) && (
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                    <strong>{isRtl ? "الموقع التفصيلي:" : "Detailed location:"}</strong> {[meta.neighborhood, meta.addressName, meta.city, meta.detailedAddress].filter(Boolean).join(" — ")}
                  </div>
                )}
                {meta.contacts.length > 0 && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.25rem" }}>{isRtl ? "جهات الاتصال:" : "Contact persons:"}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {meta.contacts.map((contact, idx) => (
                        <div key={idx} style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                          {contact.name} — {contact.phone}{contact.email ? ` — ${contact.email}` : ""}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Description */}
                <div style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)", marginBottom: "0.75rem", fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                  {(isRtl ? (project.descriptionAr || project.description) : project.description)?.substring(0, 500)}
                </div>
                {/* Trades */}
                {project.requiredTrades?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem", marginBottom: "0.75rem" }}>
                    {project.requiredTrades.map((t: any, i: number) => (
                      <span key={i} className="chip" style={{ fontSize: "0.6875rem" }}>{isRtl ? t.tradeNameAr : t.tradeName}</span>
                    ))}
                  </div>
                )}
                {/* Files */}
                {project.attachments?.length > 0 && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.25rem" }}>{isRtl ? "الملفات:" : "Files:"}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                      {project.attachments.map((f: any, i: number) => (
                        <a key={i} href={f.fileUrl} target="_blank" rel="noopener" style={{
                          display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.6875rem",
                          padding: "0.25rem 0.5rem", borderRadius: "var(--radius-md)", background: "var(--primary-light)",
                          color: "var(--primary)", textDecoration: "none",
                        }}>
                          <FileText style={{ width: "10px", height: "10px" }} /> {formatProjectAttachmentLabel(f, isRtl)}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ marginBottom: "0.75rem", padding: "0.75rem", borderRadius: "var(--radius-md)", background: "#eff6ff", border: "1px solid rgba(37,99,235,0.18)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", fontWeight: 700, color: "#1d4ed8", marginBottom: "0.35rem" }}>
                    <Shield style={{ width: "14px", height: "14px" }} />
                    {isRtl ? "المشرف المعيّن" : "Assigned Supervisor"}
                  </div>
                  {assignedSupervisor ? (
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                      <Link href={`/profile/${assignedSupervisor.userId}`} style={{ color: "var(--text)", fontWeight: 700, textDecoration: "none" }}>
                        {isRtl ? (assignedSupervisor.fullNameAr || assignedSupervisor.fullName) : assignedSupervisor.fullName}
                      </Link>
                      {` • ${isRtl ? `التخصص: ${assignedSupervisor.specialization}` : `Specialization: ${assignedSupervisor.specialization}`}`}
                      {assignedSupervisor.yearsExperience ? ` • ${isRtl ? `الخبرة: ${assignedSupervisor.yearsExperience} سنة` : `${assignedSupervisor.yearsExperience} years`}` : ""}
                      {typeof assignedSupervisor.ratingAverage === "number" ? ` • ${isRtl ? `التقييم: ${assignedSupervisor.ratingAverage.toFixed(1)}` : `Rating: ${assignedSupervisor.ratingAverage.toFixed(1)}`}` : ""}
                      {assignedSupervisor.reviewCount > 0 ? ` • ${assignedSupervisor.reviewCount} ${isRtl ? "مراجعات" : "reviews"}` : ""}
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                      {isRtl ? "لا يوجد مشرف معيّن لهذا المشروع حتى الآن." : "No supervisor is assigned to this project yet."}
                    </div>
                  )}
                </div>
                {project.bids?.length > 0 && (
                  <div style={{ marginBottom: "0.75rem" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                      {isRtl ? "العروض المقدمة:" : "Submitted bids:"}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {project.bids.map((bid: any) => (
                        <div key={bid.id} style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "0.25rem" }}>
                            <strong style={{ fontSize: "0.8125rem", color: "var(--text)" }}>
                              {isRtl ? (bid.contractor?.companyNameAr || bid.contractor?.companyName) : bid.contractor?.companyName}
                            </strong>
                            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--primary)" }}>
                              {bid.amount?.toLocaleString()} {isRtl ? "ر.س" : "SAR"}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                            {isRtl ? "المدة المتوقعة:" : "Estimated duration:"} {bid.estimatedDuration || "—"} {isRtl ? "يوم" : "days"}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                            {bid.proposalText || (isRtl ? "لا توجد تفاصيل إضافية" : "No additional proposal details")}
                          </div>
                          {bid.attachments?.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginTop: "0.5rem" }}>
                              {bid.attachments.map((attachment: any) => (
                                <a key={attachment.fileUrl} href={attachment.fileUrl} target="_blank" rel="noopener" style={{ fontSize: "0.6875rem", color: "var(--primary)", textDecoration: "none" }}>
                                  <FileText style={{ width: "10px", height: "10px", display: "inline", marginInlineEnd: "0.25rem" }} />
                                  {isRtl ? "مرفق العرض" : "Bid Attachment"}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* G12: Actions with edit request text input */}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "end", borderTop: "1px solid var(--border-light)", paddingTop: "0.75rem" }}>
                  <form action={approveProject} style={{ display: "inline" }}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.8125rem" }}>
                      <CheckCircle style={{ width: "14px", height: "14px" }} /> {isRtl ? "موافقة ونشر" : "Approve & Publish"}
                    </button>
                  </form>
                  <form action={requestEditsAction} style={{ flex: 1, display: "flex", gap: "0.375rem" }}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <label htmlFor={`edit-notes-${project.id}`} style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}>
                      {isRtl ? "ملاحظات طلب التعديل" : "Edit request notes"}
                    </label>
                    <input id={`edit-notes-${project.id}`} type="text" name="editNotes" placeholder={isRtl ? "ملاحظات التعديل المطلوبة..." : "Specify what needs to be changed..."} style={{ flex: 1, fontSize: "0.8125rem" }} />
                    <button type="submit" style={{
                      padding: "0.5rem 1rem", fontSize: "0.8125rem", borderRadius: "var(--radius-md)",
                      border: "1px solid var(--accent)", background: "var(--accent-light)", color: "var(--accent)",
                      cursor: "pointer", fontFamily: "inherit", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem", whiteSpace: "nowrap",
                    }}>
                      <MessageSquare style={{ width: "14px", height: "14px" }} /> {isRtl ? "طلب تعديل" : "Request Edit"}
                    </button>
                  </form>
                  <form action={rejectProject} style={{ display: "inline" }}>
                    <input type="hidden" name="projectId" value={project.id} />
                    <button type="submit" style={{
                      padding: "0.5rem 1rem", fontSize: "0.8125rem", borderRadius: "var(--radius-md)",
                      border: "1px solid var(--error)", background: "var(--error-light)", color: "var(--error)",
                      cursor: "pointer", fontFamily: "inherit", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem",
                    }}>
                      <XCircle style={{ width: "14px", height: "14px" }} /> {isRtl ? "رفض" : "Reject"}
                    </button>
                  </form>
                </div>
              </div>
              );
            })}
          </>
        )}

        {/* Other projects */}
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem", marginTop: "1.5rem" }}>
          {isRtl ? "جميع المشاريع" : "All Projects"} ({others.length})
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                <th style={{ padding: "0.5rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)" }}>{isRtl ? "العنوان" : "Title"}</th>
                <th style={{ padding: "0.5rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)" }}>{isRtl ? "المالك" : "Owner"}</th>
                <th style={{ padding: "0.5rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)" }}>{isRtl ? "الحالة" : "Status"}</th>
                <th style={{ padding: "0.5rem", textAlign: isRtl ? "right" : "left", color: "var(--text-muted)" }}>{isRtl ? "العروض" : "Bids"}</th>
              </tr>
            </thead>
            <tbody>
              {others.map((p: any) => {
                const assignedSupervisor = p.supervisionRequests?.[0]?.bids?.[0]?.engineer || null;
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <td style={{ padding: "0.5rem", color: "var(--text)" }}>{isRtl ? (p.titleAr || p.title) : p.title}</td>
                    <td style={{ padding: "0.5rem", color: "var(--text-muted)" }}>{p.owner?.fullName || p.owner?.companyName}</td>
                    <td style={{ padding: "0.5rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <span className="chip" style={{ fontSize: "0.6875rem", width: "fit-content" }}>{p.status === "CHANGES_REQUESTED" ? (isRtl ? "تعديلات مطلوبة" : "Changes Requested") : p.status === "CANCELLED" ? (isRtl ? "مرفوض / ملغي" : "Rejected / Cancelled") : p.status === "PUBLISHED" ? (isRtl ? "منشور" : "Published") : p.status}</span>
                        <span style={{ fontSize: "0.6875rem", color: assignedSupervisor ? "#1d4ed8" : "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                          <Shield style={{ width: "11px", height: "11px" }} />
                          {assignedSupervisor ? (
                            <Link href={`/profile/${assignedSupervisor.userId}`} style={{ color: "inherit", textDecoration: "none" }}>
                              {isRtl ? (assignedSupervisor.fullNameAr || assignedSupervisor.fullName) : assignedSupervisor.fullName}
                            </Link>
                          ) : (isRtl ? "لا يوجد مشرف" : "No supervisor")}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "0.5rem", color: "var(--text-muted)" }}>{p._count?.bids || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
