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
