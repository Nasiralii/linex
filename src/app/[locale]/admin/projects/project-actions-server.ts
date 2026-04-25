"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function approveProject(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { error: "Unauthorized" };
  try {
    const now = new Date();
    // Gap 6: Set biddingWindowEnd to 30 days from publish
    const biddingWindowEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const existingProject = await db.project.findUnique({ where: { id: projectId }, select: { status: true } });
      if (!existingProject || existingProject.status === "PUBLISHED") {
        revalidatePath("/admin/projects");
        return { success: true };
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
    return { error: "Failed to approve project" };
  }
  revalidatePath("/admin/projects");
  return { success: true };
}

export async function requestEditsAction(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const editNotes = formData.get("editNotes") as string;
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { error: "Unauthorized" };
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
    return { error: "Failed to request edits" };
  }
  revalidatePath("/admin/projects");
  return { success: true };
}

export async function rejectProject(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { error: "Unauthorized" };
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
    return { error: "Failed to reject project" };
  }
  revalidatePath("/admin/projects");
  return { success: true };
}
