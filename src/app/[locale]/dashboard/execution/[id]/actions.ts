"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { uploadFile } from "@/lib/storage";

async function getWorkspaceParticipantUserIds(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: {
      owner: { select: { userId: true } },
      award: {
        select: {
          bid: {
            select: {
              contractor: { select: { userId: true } },
              engineer: { select: { userId: true } },
            },
          },
        },
      },
    },
  });

  if (!project?.award) return [] as string[];

  const supervisionAssignment = await db.supervisionRequest.findFirst({
    where: { projectId, status: { in: ["ASSIGNED", "COMPLETED"] }, assignedTo: { not: null } },
    orderBy: { updatedAt: "desc" },
    select: { assignedTo: true },
  });

  return Array.from(
    new Set(
      [
        project.owner.userId,
        project.award.bid?.contractor?.userId,
        project.award.bid?.engineer?.userId,
        supervisionAssignment?.assignedTo || null,
      ].filter(Boolean) as string[],
    ),
  );
}

async function isAuthorizedWorkspaceParticipant(userId: string, projectId: string) {
  const participantIds = await getWorkspaceParticipantUserIds(projectId);
  return participantIds.includes(userId) || (await db.user.findUnique({ where: { id: userId }, select: { role: true } }))?.role === "ADMIN";
}

export async function sendWorkspaceMessage(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const projectId = formData.get("projectId") as string;
  const content = formData.get("content") as string;
  if (!content?.trim()) return;
  try {
    if (!(await isAuthorizedWorkspaceParticipant(user.id, projectId))) return;
    const recipientIds = (await getWorkspaceParticipantUserIds(projectId)).filter((id) => id !== user.id);
    if (recipientIds.length === 0) return;
    await db.message.createMany({
      data: recipientIds.map((receiverId) => ({ senderId: user.id, receiverId, projectId, content: content.trim() })),
    });
  } catch (error) {
    console.error('[sendWorkspaceMessage] DB query failed:', error);
  }
  revalidatePath(`/dashboard/execution/${projectId}`);
}

export async function shareFileMessage(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const projectId = formData.get("projectId") as string;
  const file = formData.get("file") as File;
  if (!file || file.size === 0) return;
  try {
    if (!(await isAuthorizedWorkspaceParticipant(user.id, projectId))) return;
    const uploaded = await uploadFile(file, `workspace/${projectId}`, user.id);
    if (uploaded.error || !uploaded.url) return;

    await db.projectAttachment.create({
      data: {
        projectId,
        fileName: file.name,
        fileUrl: uploaded.url,
        fileSize: file.size,
        mimeType: file.type || null,
      },
    });

    const recipientIds = (await getWorkspaceParticipantUserIds(projectId)).filter((id) => id !== user.id);
    if (recipientIds.length > 0) {
      await db.message.createMany({
        data: recipientIds.map((receiverId) => ({ senderId: user.id, receiverId, projectId, content: `📎 FILE: ${file.name}||${uploaded.url}` })),
      });
      await db.notification.createMany({
        data: recipientIds.map((receiverId) => ({
          userId: receiverId,
          type: "GENERAL",
          title: "New workspace file uploaded",
          titleAr: "تم رفع ملف جديد في مساحة التنفيذ",
          message: `${file.name} was uploaded to the project execution workspace.`,
          messageAr: `تم رفع الملف ${file.name} إلى مساحة تنفيذ المشروع.`,
          link: `/dashboard/execution/${projectId}`,
        })),
      });
    }
    await db.auditLog.create({
      data: { actorId: user.id, action: "FILE_SHARED", entityType: "project", entityId: projectId, metadata: { fileName: file.name, fileUrl: uploaded.url } },
    });
  } catch (error) {
    console.error('[shareFileMessage] DB query failed:', error);
  }
  revalidatePath(`/dashboard/execution/${projectId}`);
}

export async function markCompleteAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const projectId = formData.get("projectId") as string;
  try {
    // Verify the user is the project owner or admin
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { owner: { select: { userId: true } } },
    });
    if (!project || (project.owner.userId !== user.id && user.role !== "ADMIN")) return;
    await db.project.update({ where: { id: projectId }, data: { status: "COMPLETED", completedAt: new Date() } });
    await db.projectStatusHistory.create({
      data: { projectId, fromStatus: "IN_PROGRESS", toStatus: "COMPLETED", changedBy: user.id, reason: "Marked complete" },
    });
  } catch (error) {
    console.error('[markCompleteAction] DB query failed:', error);
  }
  revalidatePath(`/dashboard/execution/${projectId}`);
}

export async function submitProgressUpdate(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const projectId = formData.get("projectId") as string;
  const update = formData.get("progressUpdate") as string;
  if (!update?.trim()) return;
  try {
    if (!(await isAuthorizedWorkspaceParticipant(user.id, projectId))) return;
    const recipientIds = (await getWorkspaceParticipantUserIds(projectId)).filter((id) => id !== user.id);
    if (recipientIds.length === 0) return;
    await db.message.createMany({
      data: recipientIds.map((receiverId) => ({ senderId: user.id, receiverId, projectId, content: `📋 Progress Update: ${update.trim()}` })),
    });
  } catch (error) {
    console.error('[submitProgressUpdate] DB query failed:', error);
  }
  revalidatePath(`/dashboard/execution/${projectId}`);
}

export async function submitExecutionReviewAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !["OWNER", "CONTRACTOR", "ENGINEER"].includes(user.role)) return;

  const projectId = formData.get("projectId") as string;
  const rating = parseInt(formData.get("rating") as string);
  const comment = (formData.get("comment") as string) || "";

  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: {
        status: true,
        owner: { select: { userId: true, id: true } },
        award: {
          select: {
            contractorId: true,
            engineerId: true,
            bid: {
              select: {
                contractor: { select: { userId: true } },
                engineer: { select: { userId: true } },
              },
            },
          },
        },
      },
    });

    if (!project || !["COMPLETED", "AWARDED"].includes(project.status) || !project.award) return;

    const awardedUserId = project.award.bid?.contractor?.userId || project.award.bid?.engineer?.userId || null;
    const isOwnerReviewer = user.role === "OWNER" && project.owner?.userId === user.id;
    const isAwardedReviewer = ["CONTRACTOR", "ENGINEER"].includes(user.role) && !!awardedUserId && user.id === awardedUserId;
    if (!isOwnerReviewer && !isAwardedReviewer) return;

    const subjectUserId = isOwnerReviewer ? awardedUserId : project.owner?.userId;
    if (!subjectUserId) return;

    const existing = await db.review.findFirst({
      where: { projectId, authorUserId: user.id },
      select: { id: true },
    });
    if (existing) return;

    const ownerProfile = await db.ownerProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
    const safeRating = Math.min(5, Math.max(1, Number.isFinite(rating) ? rating : 0));
    if (!safeRating) return;

    await db.review.create({
      data: {
        projectId,
        authorId: isOwnerReviewer ? ownerProfile?.id || null : null,
        subjectId: isOwnerReviewer ? (project.award.contractorId || null) : null,
        authorUserId: user.id,
        subjectUserId,
        rating: safeRating,
        comment: comment.trim() || null,
      },
    });

    if (project.award.contractorId && subjectUserId === awardedUserId) {
      const reviews = await db.review.findMany({
        where: {
          OR: [{ subjectId: project.award.contractorId }, { subjectUserId }],
        },
        select: { rating: true },
      });
      const avg = reviews.reduce((sum, item) => sum + item.rating, 0) / Math.max(1, reviews.length);
      await db.contractorProfile.update({
        where: { id: project.award.contractorId },
        data: { ratingAverage: avg, reviewCount: reviews.length },
      });
    }

    if (project.award.engineerId && subjectUserId === awardedUserId) {
      const reviews = await db.review.findMany({
        where: { subjectUserId },
        select: { rating: true },
      });
      const avg = reviews.reduce((sum, item) => sum + item.rating, 0) / Math.max(1, reviews.length);
      await db.engineerProfile.update({
        where: { id: project.award.engineerId },
        data: { ratingAverage: avg, reviewCount: reviews.length },
      });
    }

    await db.notification.create({
      data: {
        userId: subjectUserId,
        type: "REVIEW_SUBMITTED",
        title: "You received a new project rating",
        titleAr: "تلقيت تقييماً جديداً على مشروعك",
        message: `${isOwnerReviewer ? "The project owner" : "The awarded party"} submitted a ${safeRating}/5 rating.`,
        messageAr: `${isOwnerReviewer ? "قام مالك المشروع" : "قام الطرف المنفذ"} بإرسال تقييم ${safeRating}/5.`,
        link: `/dashboard/execution/${projectId}`,
      },
    });
  } catch (error) {
    console.error("[submitExecutionReviewAction] DB query failed:", error);
  }

  revalidatePath(`/dashboard/execution/${projectId}`);
  revalidatePath(`/marketplace/${projectId}`);
}
