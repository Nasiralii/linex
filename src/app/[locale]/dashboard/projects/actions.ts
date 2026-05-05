"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateProjectSuggestion } from "@/lib/ai";
import { generateSlug } from "@/lib/utils";
import { uploadFile } from "@/lib/storage";
import { parseProjectMeta, stringifyProjectMeta, type ProjectContact } from "@/lib/project-meta";

const PROJECT_SUBMISSION_TIMEOUT_MS = 120_000;

function withTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  return Promise.race<T>([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

function sanitizeContacts(raw: string | null) {
  if (!raw) return [] as ProjectContact[];
  try {
    return (JSON.parse(raw) as ProjectContact[])
      .filter((contact) => contact?.name?.trim() || contact?.phone?.trim())
      .map((contact) => ({
        name: contact.name?.trim() || "",
        phone: contact.phone?.trim() || "",
        email: contact.email?.trim() || "",
      }));
  } catch {
    return [] as ProjectContact[];
  }
}

// ============================================================================
// Create Project
// ============================================================================
export async function createProjectAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "OWNER") {
      return { success: false, error: "Unauthorized" };
    }

    const ownerProfile = await db.ownerProfile.findUnique({
      where: { userId: user.id },
    });
    if (!ownerProfile) {
      return { success: false, error: "Owner profile not found" };
    }

    const title = formData.get("title") as string;
    const titleAr = formData.get("titleAr") as string;
    const description = formData.get("description") as string;
    const descriptionAr = formData.get("descriptionAr") as string;
    const categoryId = formData.get("categoryId") as string;
    const locationId = formData.get("locationId") as string;
    const budgetMin = parseFloat(formData.get("budgetMin") as string) || 0;
    const budgetMax = parseFloat(formData.get("budgetMax") as string) || 0;
    const scopeSummary = formData.get("scopeSummary") as string;
    const projectType = (formData.get("projectType") as string) || "CONSTRUCTION_ONLY";
    // Gap 3: Handle file count (files uploaded via client-side FormData)
    const fileCount = parseInt(formData.get("fileCount") as string) || 0;
    const propertyType = formData.get("propertyType") as string;
    const requiredStartDate = formData.get("requiredStartDate") as string;
    const deadline = formData.get("deadline") as string;
    const action = formData.get("action") as string; // "draft" or "submit"
    const projectId = (formData.get("projectId") as string) || "";
    const neighborhood = (formData.get("neighborhood") as string) || "";
    const addressName = (formData.get("addressName") as string) || "";
    const city = (formData.get("city") as string) || "";
    const detailedAddress = (formData.get("detailedAddress") as string) || "";
    const specifications = (formData.get("specifications") as string) || "";
    const contacts = sanitizeContacts((formData.get("contacts") as string) || null);
    const estimatedBudget = parseFloat(formData.get("estimatedBudget") as string) || budgetMax || budgetMin || 0;
    const selectedTradesRaw = formData.get("selectedTrades") as string;
    const selectedTrades = selectedTradesRaw ? (JSON.parse(selectedTradesRaw) as string[]).filter(Boolean) : [];
    const removedAttachmentIdsRaw = (formData.get("removedAttachmentIds") as string) || "[]";
    const removedAttachmentIds = removedAttachmentIdsRaw ? (JSON.parse(removedAttachmentIdsRaw) as string[]).filter(Boolean) : [];
    const targetStatus = action === "submit" ? "PENDING_REVIEW" : "DRAFT";
    const effectiveTitle = title || titleAr || "draft-project";

    // BUG-02: Block project creation until account is admin-approved
    if (ownerProfile.verificationStatus !== "VERIFIED") {
      return { success: false, error: "You cannot create a project until your account is approved by admin" };
    }

    if (action === "submit") {
      if (!title || !description) {
        return { success: false, error: "Title and description are required" };
      }

      if (!titleAr?.trim()) {
        return { success: false, error: "Arabic title is required" };
      }

      if (!projectType) {
        return { success: false, error: "Project type is required" };
      }

      if (selectedTrades.length === 0) {
        return { success: false, error: "Please select at least one project category" };
      }

      if (!neighborhood && !addressName.trim() && !detailedAddress.trim()) {
        return { success: false, error: "Project location is required" };
      }

      if (contacts.length === 0 || contacts.some((contact) => !contact.name || !contact.phone)) {
        return { success: false, error: "At least one complete contact person is required" };
      }

      if (fileCount < 1) {
        return { success: false, error: "At least one attachment is required before submission" };
      }

      if (!requiredStartDate) {
        return { success: false, error: "Expected start date is required" };
      }
      if (!deadline) {
        return { success: false, error: "Last date to accept offers is required" };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDateObj = new Date(requiredStartDate);
      startDateObj.setHours(0, 0, 0, 0);
      const deadlineObj = new Date(deadline);
      deadlineObj.setHours(0, 0, 0, 0);

      if (Number.isNaN(startDateObj.getTime()) || Number.isNaN(deadlineObj.getTime())) {
        return { success: false, error: "Invalid project dates" };
      }
      if (startDateObj.getTime() < today.getTime()) {
        return { success: false, error: "Expected start date must be today or a future date" };
      }
      if (deadlineObj.getTime() < startDateObj.getTime()) {
        return { success: false, error: "Last date to accept offers must be on or after expected start date" };
      }
    } else if (!title && !titleAr && !description && !specifications && !projectType && selectedTrades.length === 0) {
      return { success: false, error: "Nothing to save yet" };
    }

    const meta = stringifyProjectMeta({
      estimatedBudget: estimatedBudget || null,
      neighborhood,
      addressName,
      city,
      detailedAddress,
      specifications,
      contacts,
    });

    const slug = generateSlug(effectiveTitle) + "-" + Date.now().toString(36);

    const existingDraft = projectId
      ? await db.project.findFirst({ where: { id: projectId, ownerId: ownerProfile.id, status: { in: ["DRAFT", "CHANGES_REQUESTED"] } } })
      : null;

    const project = existingDraft
      ? await db.project.update({
          where: { id: existingDraft.id },
          data: {
            title,
            titleAr: titleAr || null,
            description,
            descriptionAr: descriptionAr || null,
            scopeSummary: meta,
            categoryId: categoryId || null,
            locationId: locationId || null,
            budgetMin: estimatedBudget || null,
            budgetMax: estimatedBudget || null,
            projectType,
            propertyType: propertyType || null,
            requiredStartDate: requiredStartDate
              ? new Date(requiredStartDate)
              : existingDraft.requiredStartDate,
            deadline: deadline
              ? new Date(deadline)
              : existingDraft.deadline,
            status: targetStatus,
          },
        })
      : await db.project.create({
          data: {
            ownerId: ownerProfile.id,
            title: title || titleAr || "Untitled draft",
            titleAr: titleAr || null,
            slug,
            description: description || "Draft in progress",
            descriptionAr: descriptionAr || null,
            scopeSummary: meta,
            categoryId: categoryId || null,
            locationId: locationId || null,
            budgetMin: estimatedBudget || null,
            budgetMax: estimatedBudget || null,
            projectType,
            propertyType: propertyType || null,
            requiredStartDate: requiredStartDate ? new Date(requiredStartDate) : null,
            deadline: deadline ? new Date(deadline) : null,
            status: targetStatus,
          },
        });

    if (existingDraft) {
      await db.projectTrade.deleteMany({ where: { projectId: project.id } });
      if (removedAttachmentIds.length > 0) {
        await db.projectAttachment.deleteMany({
          where: { projectId: project.id, id: { in: removedAttachmentIds } },
        });
      }
    }

    // Persist uploaded attachments to storage + DB
    const uploadGroups = [
      { prefix: "img_", folder: "project-images" },
      { prefix: "draw_", folder: "drawings" },
      { prefix: "boq_", folder: "boq" },
      { prefix: "site_", folder: "site-photos" },
    ];

    const filesToUpload = uploadGroups.flatMap((group) =>
      Array.from(formData.entries())
        .filter(([key, value]) => (key.startsWith(group.prefix) || key.includes(`_${group.prefix}`)) && value instanceof File && value.size > 0)
        .map(([, value]) => ({ file: value as File, folder: group.folder })),
    );

    const uploadResults = await Promise.all(
      filesToUpload.map(async ({ file, folder }, index) => {
        const uploaded = await withTimeout(
          uploadFile(file, `projects/${project.id}/${folder}`, user.id),
          PROJECT_SUBMISSION_TIMEOUT_MS,
          `Upload timed out for ${file.name}`,
        );

        if (uploaded.error || !uploaded.url) {
          return { success: false as const, fileName: file.name, error: uploaded.error || "Upload failed" };
        }

        return {
          success: true as const,
          data: {
            projectId: project.id,
            fileName: file.name,
            fileUrl: uploaded.url,
            fileSize: file.size,
            mimeType: file.type || null,
            sortOrder: index,
          },
        };
      }),
    );

    const failedUploads = uploadResults.filter((result) => !result.success);
    if (filesToUpload.length > 0 && failedUploads.length > 0) {
      return {
        success: false,
        error: `Some attachments failed to upload: ${failedUploads.map((item) => `${item.fileName}${item.error ? ` (${item.error})` : ""}`).join(", ")}`,
      };
    }

    const existingAttachmentCount = existingDraft ? await db.projectAttachment.count({ where: { projectId: project.id } }) : 0;
    const successfulUploads = uploadResults.filter((result) => result.success).map((result, index) => ({
      ...result.data,
      sortOrder: existingAttachmentCount + index,
    }));
    if (successfulUploads.length > 0) {
      await db.projectAttachment.createMany({ data: successfulUploads });
    }

    // Save additional selected categories as project trades
    const selectedCategoriesRaw = formData.get("selectedCategories") as string;
    if (selectedCategoriesRaw) {
      try {
        const selectedIds: string[] = JSON.parse(selectedCategoriesRaw);
        const allCats = await db.category.findMany({ where: { id: { in: selectedIds } } });
        for (const cat of allCats) {
          await db.projectTrade.create({
            data: { projectId: project.id, tradeName: cat.name, tradeNameAr: cat.nameAr },
          });
        }
      } catch {}
    }

    if (selectedTrades.length > 0) {
      await db.projectTrade.createMany({
        data: selectedTrades.map((tradeName) => ({
          projectId: project.id,
          tradeName,
          tradeNameAr: tradeName,
        })),
        skipDuplicates: true,
      });
    }

    // Log status history
    await db.projectStatusHistory.create({
      data: {
        projectId: project.id,
        toStatus: targetStatus,
        changedBy: user.id,
        reason: action === "submit"
          ? existingDraft?.status === "CHANGES_REQUESTED"
            ? "Project updated and resubmitted for review"
            : "Submitted for review"
          : existingDraft
            ? "Draft updated"
            : "Draft created",
      },
    });

    if (action === "submit") {
      const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
      if (admins.length > 0) {
        await db.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            type: "GENERAL",
            title: existingDraft?.status === "CHANGES_REQUESTED" ? "Project resubmitted" : "New project submitted",
            titleAr: existingDraft?.status === "CHANGES_REQUESTED" ? "تمت إعادة إرسال المشروع" : "تم إرسال مشروع جديد",
            message: existingDraft?.status === "CHANGES_REQUESTED"
              ? `${title} was updated and resubmitted for review.`
              : `${title} was submitted and is awaiting review.`,
            messageAr: existingDraft?.status === "CHANGES_REQUESTED"
              ? `${titleAr || title} تم تحديثه وإعادة إرساله للمراجعة.`
              : `${titleAr || title} تم إرساله وينتظر المراجعة.`,
            link: "/admin/projects",
          })),
        });
      }
    }

    return {
      success: true,
      projectId: project.id,
      redirectTo: action === "submit" ? "/dashboard/projects?submitted=1" : "/dashboard/projects?saved=draft",
      status: action === "submit" ? "PENDING_REVIEW" : "DRAFT",
    };
  } catch (error) {
    console.error("Create project error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create project",
    };
  }
}

export async function getOwnerDraftProjectAction() {
  const user = await getCurrentUser();
  if (!user || user.role !== "OWNER") return { success: false, draft: null };

  const ownerProfile = await db.ownerProfile.findUnique({ where: { userId: user.id } });
  if (!ownerProfile) return { success: false, draft: null };

  const draft = await db.project.findFirst({
    where: { ownerId: ownerProfile.id, status: "DRAFT" },
    include: {
      attachments: true,
      requiredTrades: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!draft) return { success: true, draft: null };

  return {
    success: true,
    draft: {
      ...draft,
      meta: parseProjectMeta(draft.scopeSummary),
    },
  };
}

// BUG-V02: Load specific project by ID (for Edit & Resubmit)
export async function getOwnerProjectAction(projectId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "OWNER") return { success: false, project: null };

  const ownerProfile = await db.ownerProfile.findUnique({ where: { userId: user.id } });
  if (!ownerProfile) return { success: false, project: null };

  const project = await db.project.findFirst({
    where: { id: projectId, ownerId: ownerProfile.id },
    include: {
      attachments: true,
      requiredTrades: true,
    },
  });

  if (!project) return { success: false, project: null };

  return {
    success: true,
    project: {
      ...project,
      meta: parseProjectMeta(project.scopeSummary),
    },
  };
}

export async function getOwnerProjectAttachmentsAction(projectId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "OWNER") return { success: false, attachments: [] as any[] };

  const ownerProfile = await db.ownerProfile.findUnique({ where: { userId: user.id } });
  if (!ownerProfile) return { success: false, attachments: [] as any[] };

  const project = await db.project.findFirst({
    where: { id: projectId, ownerId: ownerProfile.id },
    select: { id: true },
  });

  if (!project) return { success: false, attachments: [] as any[] };

  const attachments = await db.projectAttachment.findMany({
    where: { projectId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, fileName: true, fileUrl: true, createdAt: true },
  });

  return { success: true, attachments };
}

// ============================================================================
// AI Project Assistant
// ============================================================================
export async function aiProjectAssistAction(userInput: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const suggestion = await generateProjectSuggestion(userInput);
    return { success: true, suggestion };
  } catch (error) {
    console.error("AI assist error:", error);
    return { success: false, error: "AI assistant is temporarily unavailable" };
  }
}

// ============================================================================
// Get Categories & Locations for form
// ============================================================================
export async function getFormData() {
  const [categories, locations] = await Promise.all([
    db.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.location.findMany({ where: { isActive: true, type: "city" }, orderBy: { sortOrder: "asc" } }),
  ]);
  return { categories, locations };
}

// ============================================================================
// AI Title Translation (Arabic ↔ English)
// ============================================================================
export async function aiTranslateTitleAction(title: string, fromLang: "ar" | "en") {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const targetLang = fromLang === "ar" ? "English" : "Arabic";
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `You are a construction project title translator. Translate the following project title to ${targetLang}. Return ONLY the translated title, nothing else.` },
        { role: "user", content: title },
      ],
      max_tokens: 100,
      temperature: 0.3,
    });

    const translated = response.choices[0]?.message?.content?.trim() || "";
    return { success: true, translated };
  } catch (error) {
    console.error("AI translate error:", error);
    return { success: false, error: "Translation failed" };
  }
}
