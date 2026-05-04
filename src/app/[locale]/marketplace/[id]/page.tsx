import { getTranslations, getLocale } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { redirect, Link } from "@/i18n/routing";
import { db } from "@/lib/db";
import { notFound, redirect as nextRedirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { MapPin, Calendar, Tag, Banknote, User, Clock, ArrowRight, Send, CheckCircle, Lock, Star, MessageSquare, Eye, Timer, HardHat, FileText, Shield } from "lucide-react";
import { getUserBadges } from "@/lib/badges";
import { BadgeDisplay } from "@/components/badge-display";
import { awardProjectAction, shortlistBidAction, purchaseKrasat, refreshProjectBidRankings } from "../actions";
import { createKrasatPayment } from "@/lib/payment";
import { uploadFile } from "@/lib/storage";
import { Wallet } from "lucide-react";
import { parseProjectMeta } from "@/lib/project-meta";
import { rankBidWithPolicy, extractStoredBidRankingSnapshot, isStoredBidRankingSnapshotFresh } from "@/lib/bid-ranking-policy";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";

const STATUS_LABELS: Record<string, { ar: string; en: string }> = {
  DRAFT: { ar: "مسودة", en: "Draft" },
  PENDING_REVIEW: { ar: "قيد المراجعة", en: "Under Review" },
  CHANGES_REQUESTED: { ar: "تعديلات مطلوبة", en: "Changes Requested" },
  PUBLISHED: { ar: "منشور", en: "Published" },
  BIDDING: { ar: "مفتوح للعروض", en: "Bidding" },
  AWARDED: { ar: "مُرسى", en: "Awarded" },
  IN_PROGRESS: { ar: "قيد التنفيذ", en: "In Progress" },
  COMPLETED: { ar: "مكتمل", en: "Completed" },
  ARCHIVED: { ar: "مؤرشف", en: "Archived" },
  CANCELLED: { ar: "ملغي", en: "Cancelled" },
  SUBMITTED: { ar: "مُقدم", en: "Submitted" },
  SHORTLISTED: { ar: "في القائمة المختصرة", en: "Shortlisted" },
  REJECTED: { ar: "مرفوض", en: "Rejected" },
  WITHDRAWN: { ar: "مسحوب", en: "Withdrawn" },
};

function labelStatus(status: string, isRtl: boolean) {
  const item = STATUS_LABELS[status];
  return item ? (isRtl ? item.ar : item.en) : status;
}

function formatProjectAttachmentLabel(file: { fileName: string; fileUrl: string }, isRtl: boolean) {
  const source = `${file.fileUrl} ${file.fileName}`.toLowerCase();
  if (source.includes("/drawings/") || source.includes("draw_")) return isRtl ? "مخططات / تصاميم" : "Drawings / Designs";
  if (source.includes("/boq/") || source.includes("boq")) return isRtl ? "جدول الكميات" : "BOQ";
  if (source.includes("/site-photos/") || source.includes("site_")) return isRtl ? "صور الموقع" : "Site Photos";
  if (source.includes("/project-images/") || source.includes("img_")) return isRtl ? "صور المشروع" : "Project Images";
  return isRtl ? "مرفق مشروع" : "Project Attachment";
}

function displayAttachmentFileName(fileName: string) {
  const value = String(fileName || "");
  return value.replace(/^[0-9a-fA-F]{8}-[0-9a-fA-F-]{27}_(.+)$/i, "$1");
}

// ============================================================================
// Server Actions
// ============================================================================

// Bid submission action
async function submitBidAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user || (user.role !== "CONTRACTOR" && user.role !== "ENGINEER")) return;

  const projectId = formData.get("projectId") as string;
  try {
    let profileId: string | null = null;
    let bidderField: "contractorId" | "engineerId" = "contractorId";
    if (user.role === "CONTRACTOR") {
      const contractor = await db.contractorProfile.findUnique({ where: { userId: user.id } });
      if (!contractor || contractor.verificationStatus !== "VERIFIED") return;
      profileId = contractor.id;
    } else {
      const engineer = await db.engineerProfile.findUnique({ where: { userId: user.id } });
      if (!engineer || engineer.verificationStatus !== "VERIFIED") return;
      profileId = engineer.id;
      bidderField = "engineerId";
    }

    const amount = parseFloat(formData.get("amount") as string);
    const proposalText = formData.get("proposalText") as string;
    const estimatedDuration = parseInt(formData.get("estimatedDuration") as string) || null;

    const existing = bidderField === "contractorId"
      ? await db.bid.findUnique({ where: { projectId_contractorId: { projectId, contractorId: profileId! } } })
      : await db.bid.findUnique({ where: { projectId_engineerId: { projectId, engineerId: profileId! } } });
    if (existing) return;

    // Gap 6: Check bidding deadline
    const proj = await db.project.findUnique({ where: { id: projectId }, select: { biddingWindowEnd: true } });
    if (proj?.biddingWindowEnd && new Date() > new Date(proj.biddingWindowEnd)) return;

    const bid = await db.bid.create({
      data: {
        projectId,
        contractorId: bidderField === "contractorId" ? profileId! : null,
        engineerId: bidderField === "engineerId" ? profileId! : null,
        amount, proposalText, estimatedDuration,
        status: "SUBMITTED", submittedAt: new Date(),
      },
    });

    const attachmentEntries = Array.from(formData.entries()).filter(
      ([key, value]) => key === "bidAttachment" && value instanceof File && value.size > 0,
    ) as [string, File][];

    for (const [, file] of attachmentEntries) {
      const uploaded = await uploadFile(file, `bids/${bid.id}/attachments`, user.id);
      if (uploaded.error || !uploaded.url) continue;
      await db.bidAttachment.create({
        data: {
          bidId: bid.id,
          fileName: file.name,
          fileUrl: uploaded.url,
          fileSize: file.size,
          mimeType: file.type || null,
        },
      });
    }

    await db.auditLog.create({
      data: { actorId: user.id, action: "BID_SUBMITTED", entityType: "bid", entityId: projectId, metadata: { amount } },
    });

    // Gap 5: Evaluate badges after bid submission
    const { evaluateUserBadges } = await import("@/lib/badges");
    evaluateUserBadges(user.id).catch(() => {});

    const project = await db.project.findUnique({ where: { id: projectId }, include: { owner: { select: { userId: true } } } });
    if (project) {
      await db.notification.create({
        data: {
          userId: project.owner.userId, type: "BID_RECEIVED",
          title: "New bid received", titleAr: "تم استلام عرض جديد",
          message: `New bid of ${amount} SAR on ${project.title}`,
          messageAr: `عرض جديد بقيمة ${amount} ريال على ${project.titleAr || project.title}`,
          link: `/dashboard`,
        },
      });

      await refreshProjectBidRankings(projectId);
    }
  } catch (error) {
    console.error('[submitBidAction] DB query failed:', error);
  }

  revalidatePath(`/marketplace/${projectId}`);
}

// Gap 2: Krasat purchase action (100 SAR)
async function purchaseKrasatAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) return;

  const projectId = formData.get("projectId") as string;
  const locale = (formData.get("locale") as string) || "ar";

  try {
    const existing = await db.krasatPurchase.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } },
    });
    if (existing) return;

    const session = await createKrasatPayment(
      user.id,
      projectId,
      user.email,
      user.email.split("@")[0],
      locale,
    );

    if (session.paymentUrl) {
      nextRedirect(session.paymentUrl);
    } else if (session.error) {
      console.error('[purchaseKrasatAction] Payment session error:', session.error);
    }
  } catch (error) {
    console.error('[purchaseKrasatAction] DB query failed:', error);
  }

  revalidatePath(`/marketplace/${projectId}`);
}

// Gap 5: Submit review action
async function submitReviewAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user || user.role !== "OWNER") return;

  const projectId = formData.get("projectId") as string;
  const rating = parseInt(formData.get("rating") as string);
  const comment = formData.get("comment") as string;

  try {
    const ownerProfile = await db.ownerProfile.findUnique({ where: { userId: user.id } });
    if (!ownerProfile) return;

    const award = await db.award.findUnique({ where: { projectId }, select: { contractorId: true } });
    if (!award?.contractorId) return;

    const existing = await db.review.findUnique({ where: { projectId_authorId: { projectId, authorId: ownerProfile.id } } });
    if (existing) return;

    await db.review.create({
      data: {
        projectId, authorId: ownerProfile.id, subjectId: award.contractorId,
        rating: Math.min(5, Math.max(1, rating)), comment,
      },
    });

    // Update contractor average rating
    const reviews = await db.review.findMany({ where: { subjectId: award.contractorId } });
    const avg = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
    await db.contractorProfile.update({
      where: { id: award.contractorId },
      data: { ratingAverage: avg, reviewCount: reviews.length },
    });

    // Gap 5: Re-evaluate contractor badges after new review
    const contractor = await db.contractorProfile.findUnique({ where: { id: award.contractorId }, select: { userId: true } });
    if (contractor) {
      const { evaluateUserBadges } = await import("@/lib/badges");
      evaluateUserBadges(contractor.userId).catch(() => {});
    }
  } catch (error) {
    console.error('[submitReviewAction] DB query failed:', error);
  }

  revalidatePath(`/marketplace/${projectId}`);
}

// Gap 4: Send message action
async function sendMessageAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) return redirect({ href: "/auth/login", locale });

  const receiverId = formData.get("receiverId") as string;
  const projectId = formData.get("projectId") as string;
  const content = formData.get("content") as string;

  if (!projectId || !receiverId || !content?.trim()) {
    return redirect({ href: `/marketplace/${projectId || ""}`, locale });
  }

  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { userId: true } },
        bids: {
          select: {
            contractor: { select: { userId: true } },
            engineer: { select: { userId: true } },
          },
        },
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

    if (!project) return notFound();

    const allowedParticipants = new Set(
      [
        project.owner?.userId,
        ...project.bids.flatMap((bid: any) => [bid.contractor?.userId, bid.engineer?.userId]),
        project.award?.bid?.contractor?.userId,
        project.award?.bid?.engineer?.userId,
      ].filter(Boolean) as string[],
    );

    if (!allowedParticipants.has(user.id) || !allowedParticipants.has(receiverId) || user.id === receiverId) {
      return redirect({ href: `/marketplace/${projectId}`, locale });
    }

    await db.message.create({
      data: { senderId: user.id, receiverId, projectId, content: content.trim() },
    });

    await db.notification.create({
      data: {
        userId: receiverId,
        type: "GENERAL",
        title: "New project message",
        titleAr: "رسالة جديدة على المشروع",
        message: `You received a new message about ${project?.title || "a project"}`,
        messageAr: `لديك رسالة جديدة بخصوص ${project?.titleAr || project?.title || "المشروع"}`,
        link: `/marketplace/${projectId}`,
      },
    });
  } catch (error) {
    console.error('[sendMessageAction] DB query failed:', error);
  }

  revalidatePath(`/marketplace/${projectId}`);
  return redirect({ href: `/marketplace/${projectId}`, locale });
}

// Gap 6: Extend bidding deadline action (owner only)
async function extendDeadlineAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user || user.role !== "OWNER") return;

  const projectId = formData.get("projectId") as string;
  const extraDays = parseInt(formData.get("extraDays") as string) || 14;

  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { owner: { select: { userId: true } } },
    });
    if (!project || project.owner.userId !== user.id) return;

    const currentEnd = project.biddingWindowEnd || new Date();
    const newEnd = new Date(Math.max(currentEnd.getTime(), Date.now()) + extraDays * 24 * 60 * 60 * 1000);

    await db.project.update({ where: { id: projectId }, data: { biddingWindowEnd: newEnd } });
    await db.auditLog.create({
      data: { actorId: user.id, action: "BIDDING_DEADLINE_EXTENDED", entityType: "project", entityId: projectId, metadata: { extraDays, newEnd: newEnd.toISOString() } },
    });
  } catch (error) {
    console.error('[extendDeadlineAction] DB query failed:', error);
  }

  revalidatePath(`/marketplace/${projectId}`);
}

// Helper: Calculate wallet balance
async function getWalletBalance(userId: string): Promise<number> {
  const transactions = await db.walletTransaction.findMany({
    where: { userId, status: "completed" },
  });
  let balance = 0;
  for (const tx of transactions) {
    if (tx.type === "FUND") balance += tx.amount;
    else if (tx.type === "DEDUCT") balance -= tx.amount;
  }
  return Math.max(0, balance);
}

// Wallet-based Krasat purchase action (deduct from wallet balance)
async function purchaseKrasatFromWalletAction(formData: FormData) {
  "use server";
  const user = await getCurrentUser();
  if (!user) return;

  const projectId = formData.get("projectId") as string;

  try {
    const existing = await db.krasatPurchase.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } },
    });
    if (existing) return;

    // Check wallet balance
    const balance = await getWalletBalance(user.id);
    if (balance < 100) return;

    // Create Krasat purchase
    await db.krasatPurchase.create({
      data: { userId: user.id, projectId, amount: 100, status: "completed" },
    });

    // Deduct from wallet
    await db.walletTransaction.create({
      data: {
        userId: user.id, type: "DEDUCT", amount: 100,
        purpose: "KRASAT", referenceId: projectId, status: "completed",
      },
    });

    // Audit log
    await db.auditLog.create({
      data: { actorId: user.id, action: "KRASAT_PURCHASED", entityType: "project", entityId: projectId, metadata: { amount: 100, method: "wallet" } },
    });
  } catch (error) {
    console.error('[purchaseKrasatFromWalletAction] DB query failed:', error);
  }

  revalidatePath(`/marketplace/${projectId}`);
}

// ============================================================================
// Page Component
// ============================================================================
export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const locale = await getLocale();
  if (!user) return redirect({ href: "/auth/login", locale });

  const tCommon = await getTranslations("common");
  const tBid = await getTranslations("bid");
  const isRtl = locale === "ar";

  let project: any = null;
  let canBid = false;
  let existingBid: any = null;
  let hasKrasat = false;
  let messages: any[] = [];
  let hasReviewed = false;
  let canReview = false;
  let bidBlockReason: "APPROVAL" | "SPECIALTY" | "CLOSED" | null = null;
  const bidderBadgesMap: Record<string, string[]> = {};
  const bidRankingMap: Record<string, any> = {};
  let isOwner = false;
  let supervisionRequest: any = null;
  let contractRecord: any = null;
  const isContractor = user.role === "CONTRACTOR";
  const isEngineer = user.role === "ENGINEER";
  const isAdmin = user.role === "ADMIN";
  let walletBalance = 0;

  const isProjectVisibleToRole = (role: string, projectType: string) => {
    if (role === "ENGINEER") return projectType === "DESIGN_ONLY" || projectType === "DESIGN_AND_CONSTRUCTION";
    if (role === "CONTRACTOR") return projectType === "CONSTRUCTION_ONLY" || projectType === "DESIGN_AND_CONSTRUCTION";
    return true;
  };

  try {
    project = await db.project.findUnique({
      where: { id },
      include: {
        category: true,
        location: true,
        attachments: { select: { id: true, fileName: true, fileUrl: true } },
        owner: { select: { id: true, fullName: true, companyName: true, userId: true } },
      },
    });
  } catch (error) {
    console.error('[ProjectDetailPage] DB query failed:', error);
  }

  if (!project) return notFound();

  if ((user.role === "ENGINEER" || user.role === "CONTRACTOR") && !isProjectVisibleToRole(user.role, project.projectType)) {
    return notFound();
  }

  project.bids = [];
  project.requiredTrades = [];
  project.award = null;
  project.reviews = [];
  project.attachments = project.attachments || [];

  try {
    const [bids, requiredTrades, award, reviews] = await Promise.all([
      db.bid.findMany({
        where: { projectId: id },
        include: {
          contractor: {
            select: {
              companyName: true,
              companyNameAr: true,
              ratingAverage: true,
              verificationStatus: true,
              userId: true,
            },
          },
          engineer: {
            select: {
              fullName: true,
              fullNameAr: true,
              ratingAverage: true,
              verificationStatus: true,
              userId: true,
              yearsExperience: true,
              reviewCount: true,
              specialization: true,
            },
          },
          attachments: {
            select: {
              id: true,
              fileName: true,
              fileUrl: true,
            },
          },
        },
        orderBy: { submittedAt: "desc" },
      }).catch((error) => {
        console.error('[ProjectDetailPage] bids query failed:', error);
        return [] as any[];
      }),
      db.projectTrade.findMany({ where: { projectId: id } }).catch((error) => {
        console.error('[ProjectDetailPage] requiredTrades query failed:', error);
        return [] as any[];
      }),
      db.award.findUnique({
        where: { projectId: id },
        select: {
          contractorId: true,
          engineerId: true,
          bid: {
            select: {
              contractor: { select: { userId: true, companyName: true } },
              engineer: { select: { userId: true, fullName: true } },
            },
          },
        },
      }).catch((error) => {
        console.error('[ProjectDetailPage] award query failed:', error);
        return null;
      }),
      db.review.findMany({
        where: { projectId: id },
        include: { author: { select: { fullName: true } } },
      }).catch((error) => {
        console.error('[ProjectDetailPage] reviews query failed:', error);
        return [] as any[];
      }),
    ]);

    project.bids = bids;
    project.requiredTrades = requiredTrades;
    project.award = award;
    project.reviews = reviews;
  } catch (error) {
    console.error('[ProjectDetailPage] related data loading failed:', error);
  }

  isOwner = user.role === "OWNER" && project.owner?.userId === user.id;

  try {
    if (isContractor) {
      const contractor = await db.contractorProfile.findUnique({ where: { userId: user.id } });
      if (contractor) {
        const canContractorBidType = project.projectType === "CONSTRUCTION_ONLY" || project.projectType === "DESIGN_AND_CONSTRUCTION";
        canBid = contractor.verificationStatus === "VERIFIED" && ["PUBLISHED", "BIDDING"].includes(project.status) && canContractorBidType;
        existingBid = project.bids.find((b: any) => b.contractorId === contractor.id);
        if (contractor.verificationStatus !== "VERIFIED") bidBlockReason = "APPROVAL";
        else if (!canContractorBidType) bidBlockReason = "SPECIALTY";
      }
    }

    if (isEngineer) {
      const engineer = await db.engineerProfile.findUnique({ where: { userId: user.id } });
      if (engineer) {
        // Engineers can bid on DESIGN_ONLY and DESIGN_AND_CONSTRUCTION projects
        const isDesignProject = project.projectType === "DESIGN_ONLY";
        const isDesignAndConstruction = project.projectType === "DESIGN_AND_CONSTRUCTION";
        canBid = engineer.verificationStatus === "VERIFIED" && ["PUBLISHED", "BIDDING"].includes(project.status) && (isDesignProject || isDesignAndConstruction) && user.status === "ACTIVE";
        existingBid = project.bids.find((b: any) => b.engineerId === engineer.id);
        if (engineer.verificationStatus !== "VERIFIED") bidBlockReason = "APPROVAL";
        else if (!(isDesignProject || isDesignAndConstruction)) bidBlockReason = "SPECIALTY";
      }
    }

    // G2: Check if user account is pending approval
    if (user.status === "SUSPENDED" && (isContractor || isEngineer)) {
      canBid = false;
      bidBlockReason = "APPROVAL";
    }

    // Gap 2: Check Krasat purchase (for contractors/engineers only — owners see everything)
    hasKrasat = isOwner || isAdmin;
    if (!hasKrasat) {
      const purchase = await db.krasatPurchase.findUnique({
        where: { userId_projectId: { userId: user.id, projectId: id } },
      });
      hasKrasat = !!purchase;
    }

    // Gap 4: Load messages for this project
    messages = await db.message.findMany({
      where: {
        projectId: id,
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { email: true, role: true } },
      },
      take: 50,
    });

    // Gap 5: Check if review already submitted
    if (isOwner && project.status === "COMPLETED" && project.award) {
      const ownerProfile = await db.ownerProfile.findUnique({ where: { userId: user.id } });
      if (ownerProfile) {
        const existingReview = await db.review.findUnique({
          where: { projectId_authorId: { projectId: id, authorId: ownerProfile.id } },
        });
        hasReviewed = !!existingReview;
        canReview = !hasReviewed;
      }
    }

    // Gap 6: Check bidding deadline
    const biddingExpired = project.biddingWindowEnd && new Date() > new Date(project.biddingWindowEnd);
    if (biddingExpired) {
      if (canBid) canBid = false;
      bidBlockReason = "CLOSED";
    }

    // Gap 5: Fetch badges for bid contractors (for owner/admin view)
    if ((isOwner || isAdmin) && project.bids.length > 0) {
      const rankingLogs = await db.auditLog.findMany({
        where: { action: "BID_RANKED", entityType: "bid", entityId: { in: project.bids.map((b: any) => b.id) } },
        orderBy: { createdAt: "desc" },
        select: { entityId: true, metadata: true, createdAt: true },
      });
      const latestSnapshots = new Map<string, any>();
      for (const log of rankingLogs) {
        if (!latestSnapshots.has(log.entityId)) {
          const snapshot = extractStoredBidRankingSnapshot(log.metadata);
          latestSnapshots.set(log.entityId, snapshot && isStoredBidRankingSnapshotFresh(log.createdAt) ? snapshot : null);
        }
      }

      const bidderIds = project.bids.map((b: any) => b.contractor?.userId || b.engineer?.userId).filter(Boolean);
      const allBadges = await db.userBadge.findMany({
        where: { userId: { in: bidderIds }, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
        select: { userId: true, badge: true },
      });
      for (const b of allBadges) {
        if (!bidderBadgesMap[b.userId]) bidderBadgesMap[b.userId] = [];
        bidderBadgesMap[b.userId].push(b.badge);
      }

      for (const bid of project.bids) {
        bidRankingMap[bid.id] = latestSnapshots.get(bid.id) || await rankBidWithPolicy({
          bid: {
            id: bid.id,
            amount: bid.amount,
            estimatedDuration: bid.estimatedDuration,
            proposalText: bid.proposalText,
            submittedAt: bid.submittedAt,
            aiScore: bid.aiScore,
            contractor: {
              companyName: bid.contractor?.companyName || bid.engineer?.fullName,
              companyNameAr: bid.contractor?.companyNameAr || bid.engineer?.fullNameAr,
              ratingAverage: bid.contractor?.ratingAverage || bid.engineer?.ratingAverage,
              reviewCount: bid.contractor?.reviewCount || bid.engineer?.reviewCount || 0,
              yearsExperience: bid.engineer?.yearsExperience,
              verificationStatus: bid.contractor?.verificationStatus || bid.engineer?.verificationStatus,
              specialization: bid.engineer?.specialization,
            },
          },
          project: {
            id: project.id,
            title: project.title,
            titleAr: project.titleAr,
            description: project.description,
            descriptionAr: project.descriptionAr,
            budgetMin: project.budgetMin,
            budgetMax: project.budgetMax,
            projectType: project.projectType,
            publishedAt: project.publishedAt,
          },
        });
      }

      project.bids = [...project.bids].sort((a: any, b: any) => (bidRankingMap[b.id]?.totalScore || 0) - (bidRankingMap[a.id]?.totalScore || 0));
    }

    // Fetch wallet balance for contractors/engineers (for Krasat payment)
    if (!isOwner && !isAdmin) {
      walletBalance = await getWalletBalance(user.id);
    }

    if (isOwner && project.status === "AWARDED") {
      const [existingSupervisionRequest, existingContract] = await Promise.all([
        db.supervisionRequest.findFirst({
          where: { projectId: id, requestedBy: user.id },
          orderBy: { createdAt: "desc" },
        }).catch(() => null),
        db.contract.findFirst({
          where: { projectId: id },
          orderBy: { createdAt: "desc" },
        }).catch(() => null),
      ]);

      supervisionRequest = existingSupervisionRequest;
      contractRecord = existingContract;
    }
  } catch (error) {
    console.error('[ProjectDetailPage] secondary DB queries failed:', error);
    hasKrasat = isOwner || isAdmin;
  }

  // Determine Q&A recipient
  let qaRecipientId: string | null = null;
  if (isOwner && (project.award?.bid?.contractor?.userId || project.award?.bid?.engineer?.userId)) {
    qaRecipientId = project.award.bid.contractor?.userId || project.award.bid.engineer?.userId;
  } else if (isOwner && messages.length > 0) {
    const latestCounterparty = [...messages].reverse().find((msg: any) => (msg.senderId === user.id ? msg.receiverId : msg.senderId) !== user.id);
    if (latestCounterparty) {
      qaRecipientId = latestCounterparty.senderId === user.id ? latestCounterparty.receiverId : latestCounterparty.senderId;
    }
  } else if (isOwner && project.bids.length === 1 && (project.bids[0]?.contractor?.userId || project.bids[0]?.engineer?.userId)) {
    qaRecipientId = project.bids[0].contractor?.userId || project.bids[0].engineer?.userId;
  } else if ((isContractor || isEngineer) && project.owner?.userId) {
    qaRecipientId = project.owner.userId;
  }

  const getBidderDisplay = (bid: any) => {
    const isEngineerBid = !!bid.engineer;
    const userId = bid.contractor?.userId || bid.engineer?.userId || null;
    const name = bid.contractor?.companyName || bid.engineer?.fullName || (isRtl ? "مقدم عرض" : "Bidder");
    const nameAr = bid.contractor?.companyNameAr || bid.engineer?.fullNameAr || name;
    const ratingAverage = bid.contractor?.ratingAverage || bid.engineer?.ratingAverage || 0;
    const reviewCount = bid.contractor?.reviewCount || bid.engineer?.reviewCount || 0;
    const verificationStatus = bid.contractor?.verificationStatus || bid.engineer?.verificationStatus || null;
    const yearsValue = bid.contractor?.yearsInBusiness || bid.engineer?.yearsExperience || null;
    const yearsLabel = isRtl ? "سنوات خبرة" : "Years experience";
    const roleLabel = isEngineerBid ? (isRtl ? "مهندس" : "Engineer") : (isRtl ? "مقاول" : "Contractor");
    return { userId, name, nameAr, ratingAverage, reviewCount, verificationStatus, yearsValue, yearsLabel, roleLabel };
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "calc(100vh - 64px)" }}>
      <div style={{ background: "linear-gradient(135deg, #1C5963, #2A7B88)", padding: "2rem 0" }}>
        <div className="container-app">
          <Link href="/marketplace" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8125rem", textDecoration: "none" }}>
            ← {isRtl ? "العودة للسوق" : "Back to Marketplace"}
          </Link>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", marginTop: "0.5rem" }}>
            {isRtl ? (project.titleAr || project.title) : project.title}
          </h1>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <span style={{ padding: "0.25rem 0.75rem", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,0.15)", color: "white", fontSize: "0.75rem", fontWeight: 600 }}>
              {project.projectType === "DESIGN_ONLY" ? (isRtl ? "تصميم فقط" : "Design Only") :
               project.projectType === "DESIGN_AND_CONSTRUCTION" ? (isRtl ? "تصميم وتنفيذ" : "Design & Construction") :
               (isRtl ? "تنفيذ فقط" : "Construction Only")}
            </span>
          </div>
        </div>
      </div>

      <div className="container-app" style={{ padding: "2rem 1.5rem" }}>
        <div className="md:grid md:grid-cols-2" style={{gap: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          {/* Main Content */}
          <div>
            {/* Meta */}
            <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", marginBottom: "1rem" }}>
                {project.category && <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}><Tag style={{ width: "16px", height: "16px" }} />{isRtl ? project.category.nameAr : project.category.name}</span>}
                {project.location && <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}><MapPin style={{ width: "16px", height: "16px" }} />{isRtl ? project.location.nameAr : project.location.name}</span>}
                {project.requiredStartDate && <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}><Clock style={{ width: "16px", height: "16px" }} />{isRtl ? `تاريخ البدء: ${new Date(project.requiredStartDate).toLocaleDateString()}` : `Start: ${new Date(project.requiredStartDate).toLocaleDateString()}`}</span>}
                {project.deadline && <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}><Calendar style={{ width: "16px", height: "16px" }} />{new Date(project.deadline).toLocaleDateString()}</span>}
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                  <User style={{ width: "16px", height: "16px", color: "var(--text-secondary)" }} />
                  {hasKrasat ? (
                    <Link href={`/profile/${project.owner?.userId}`} style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
                      {project.owner?.companyName || project.owner?.fullName}
                    </Link>
                  ) : (
                    <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>
                      {isRtl ? "المالك (مخفي حتى الدفع)" : "Owner (hidden until payment)"}
                    </span>
                  )}
                </span>
              </div>

              {/* G1: Budget hidden from bidders — only admin and project owner can see */}
              {(isOwner || isAdmin) && (project.budgetMin || project.budgetMax) && (
                <div style={{ display: "inline-flex", alignItems: "baseline", gap: "0.25rem", padding: "0.625rem 1.25rem", borderRadius: "var(--radius-lg)", background: "var(--primary-light)", marginBottom: "1rem" }}>
                  <Banknote style={{ width: "18px", height: "18px", color: "var(--primary)" }} />
                  <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)", margin: "0 0.375rem" }}>
                    {project.budgetMin?.toLocaleString()}{project.budgetMax ? ` - ${project.budgetMax.toLocaleString()}` : ""}
                  </span>
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--primary)" }}>{tCommon("sar")}</span>
                </div>
              )}
            </div>

            {/* ============================================ */}
            {/* Gap 2: Krasat Gate — Blur description until paid */}
            {/* ============================================ */}
            <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.75rem" }}>
                {isRtl ? "وصف المشروع" : "Project Description"}
              </h3>

              {hasKrasat ? (
                <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {isRtl ? (project.descriptionAr || project.description) : project.description}
                </p>
              ) : (
                <>
                  {/* Blurred preview */}
                  <div style={{ marginBottom: "1rem" }}>
                    <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap", filter: "blur(6px)", userSelect: "none", pointerEvents: "none", maxHeight: "150px", overflow: "hidden", margin: 0 }}>
                      {isRtl ? (project.descriptionAr || project.description) : project.description}
                    </p>
                  </div>

                  {/* Inline unlock card */}
                  <div style={{
                    background: "var(--surface)", padding: "1.5rem 2rem", borderRadius: "var(--radius-xl)",
                    textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.12)", border: "2px solid var(--accent)",
                    maxWidth: "380px", width: "100%", margin: "0 auto",
                  }}>
                        <Lock style={{ width: "32px", height: "32px", color: "var(--accent)", margin: "0 auto 0.75rem" }} />
                        <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" }}>
                          {isRtl ? "كراسات — فتح تفاصيل المشروع" : "Krasat — Unlock Project Details"}
                        </h4>
                        <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                          {isRtl ? "ادفع 100 ريال سعودي لعرض الوصف الكامل والمواصفات" : "Pay 100 SAR to view full description & specifications"}
                        </p>

                        {user.role !== "CONTRACTOR" && user.role !== "ENGINEER" ? (
                          <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", fontWeight: 600, margin: 0 }}>
                            {isRtl ? "فقط المقاول أو المهندس يمكنه رؤية التفاصيل." : "Only contractors and engineers can see the details."}
                          </p>
                        ) : (
                          <>
                            {/* Wallet Balance Display */}
                            <div style={{
                              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                              padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)",
                              background: walletBalance >= 100 ? "var(--primary-light)" : "var(--surface-2)",
                              marginBottom: "1rem",
                            }}>
                              <Wallet style={{ width: "18px", height: "18px", color: "var(--primary)" }} />
                              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>
                                {isRtl ? "رصيد المحفظة:" : "Wallet Balance:"}
                              </span>
                              <span style={{
                                fontSize: "1rem", fontWeight: 800,
                                color: walletBalance >= 100 ? "var(--primary)" : "var(--error)",
                              }}>
                                {walletBalance.toLocaleString()} {isRtl ? "ر.س" : "SAR"}
                              </span>
                            </div>

                            {walletBalance >= 100 ? (
                              <form action={purchaseKrasatFromWalletAction}>
                                <input type="hidden" name="projectId" value={project.id} />
                                <button type="submit" className="btn-primary" style={{ padding: "0.75rem 2rem", fontSize: "0.875rem", width: "100%" }}>
                                  <Wallet style={{ width: "16px", height: "16px" }} />
                                  {isRtl ? "ادفع من المحفظة — 100 ر.س" : "Pay from Wallet — 100 SAR"}
                                </button>
                              </form>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <p style={{ fontSize: "0.75rem", color: "var(--error)", fontWeight: 600, margin: 0 }}>
                                  {isRtl
                                    ? `رصيدك الحالي (${walletBalance.toLocaleString()} ر.س) غير كافٍ. اشحن محفظتك أو ادفع بالبطاقة.`
                                    : `Your current balance (${walletBalance.toLocaleString()} SAR) is insufficient. Top up your wallet or pay by card.`}
                                </p>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                  <Link
                                    href="/dashboard/wallet"
                                    style={{
                                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                                      padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)",
                                      border: "2px solid var(--primary)", background: "var(--surface)",
                                      color: "var(--primary)", fontSize: "0.8125rem", fontWeight: 600,
                                      textDecoration: "none", cursor: "pointer",
                                    }}
                                  >
                                    <Wallet style={{ width: "14px", height: "14px" }} />
                                    {isRtl ? "شحن المحفظة" : "Top Up Wallet"}
                                  </Link>
                                  <form action={purchaseKrasatAction} style={{ flex: 1 }}>
                                    <input type="hidden" name="projectId" value={project.id} />
                                    <input type="hidden" name="locale" value={locale} />
                                    <button type="submit" className="btn-primary" style={{
                                      padding: "0.75rem 1rem", fontSize: "0.8125rem", width: "100%",
                                      display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                                    }}>
                                      <Eye style={{ width: "14px", height: "14px" }} />
                                      {isRtl ? "ادفع بالبطاقة" : "Pay with Card"}
                                    </button>
                                  </form>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                  </div>
                </>
              )}
            </div>

            {/* ============================================ */}
            {/* Gap 5: Reviews Section */}
            {/* ============================================ */}
            {project.reviews && project.reviews.length > 0 && (
              <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>
                  {isRtl ? "التقييمات" : "Reviews"}
                </h3>
                {project.reviews.map((review: any) => (
                  <div key={review.id} style={{ padding: "1rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", gap: "2px" }}>
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} style={{ width: "16px", height: "16px", fill: s <= review.rating ? "var(--accent)" : "none", color: s <= review.rating ? "var(--accent)" : "var(--border)" }} />
                        ))}
                      </div>
                      <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{review.author?.fullName}</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    {review.comment && <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}

            {hasKrasat && parseProjectMeta(project.scopeSummary).specifications && (
              <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.75rem" }}>
                  {isRtl ? "المواصفات الفنية" : "Specifications"}
                </h3>
                <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                  {parseProjectMeta(project.scopeSummary).specifications}
                </p>
              </div>
            )}

            {hasKrasat && project.attachments?.length > 0 && (
              <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.75rem" }}>
                  {isRtl ? "مستندات المشروع" : "Project Documents"}
                </h3>
                {Object.entries(
                  project.attachments.reduce((acc: Record<string, any[]>, file: any) => {
                    const label = formatProjectAttachmentLabel(file, isRtl);
                    if (!acc[label]) acc[label] = [];
                    acc[label].push(file);
                    return acc;
                  }, {})
                ).map(([label, files]) => (
                  <div key={label} style={{ marginBottom: "0.75rem" }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.35rem" }}>
                      {label}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", paddingInlineStart: "0.5rem" }}>
                      {(files as any[]).map((file: any, idx: number) => (
                        <div key={file.id} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
                          <span style={{ color: "var(--text-muted)", minWidth: "1.25rem" }}>{idx + 1}.</span>
                          <a href={file.fileUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "none" }}>
                            {displayAttachmentFileName(file.fileName)}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Gap 5: Review Form (Owner, completed project) */}
            {canReview && (
              <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem", border: "2px solid var(--accent)" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Star style={{ width: "18px", height: "18px", color: "var(--accent)" }} />
                  {isRtl ? "قيّم المقاول" : "Rate the Contractor"}
                </h3>
                <form action={submitReviewAction}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.5rem", display: "block" }}>
                      {isRtl ? "التقييم" : "Rating"} *
                    </label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {[1,2,3,4,5].map(v => (
                        <label key={v} style={{ cursor: "pointer" }}>
                          <input type="radio" name="rating" value={v} required style={{ display: "none" }} />
                          <Star style={{ width: "28px", height: "28px", color: "var(--accent)" }} />
                          <span style={{ display: "block", textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>{v}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label>{isRtl ? "تعليق" : "Comment"}</label>
                    <textarea name="comment" style={{ minHeight: "80px", resize: "vertical" }} placeholder={isRtl ? "شاركنا تجربتك..." : "Share your experience..."} />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: "0.75rem 1.5rem", fontSize: "0.875rem" }}>
                    <Star style={{ width: "16px", height: "16px" }} /> {isRtl ? "إرسال التقييم" : "Submit Review"}
                  </button>
                </form>
              </div>
            )}

            {/* ============================================ */}
            {/* Gap 4: Q&A Messaging UI */}
            {/* ============================================ */}
            {hasKrasat && (qaRecipientId || messages.length > 0) && (
              <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <MessageSquare style={{ width: "18px", height: "18px", color: "var(--primary)" }} />
                  {isRtl ? "الرسائل والأسئلة" : "Q&A Messages"}
                </h3>

                {/* Message list */}
                <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {messages.length === 0 ? (
                    <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textAlign: "center", padding: "1rem" }}>
                      {isRtl ? "لا توجد رسائل بعد. ابدأ المحادثة!" : "No messages yet. Start the conversation!"}
                    </p>
                  ) : (
                    messages.map((msg: any) => {
                      const isMine = msg.senderId === user.id;
                      return (
                        <div key={msg.id} style={{
                          maxWidth: "75%", padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)",
                          alignSelf: isMine ? "flex-end" : "flex-start",
                          background: isMine ? "var(--primary)" : "var(--surface-2)",
                          color: isMine ? "white" : "var(--text)",
                        }}>
                          <div style={{ fontSize: "0.6875rem", marginBottom: "0.25rem", opacity: 0.7 }}>
                            {msg.sender?.email} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div style={{ fontSize: "0.875rem", lineHeight: 1.5 }}>{msg.content}</div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Send message form */}
                {qaRecipientId ? (
                  <form action={sendMessageAction} style={{ display: "flex", gap: "0.5rem" }}>
                    <input type="hidden" name="receiverId" value={qaRecipientId} />
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="text" name="content" placeholder={isRtl ? "اكتب رسالتك..." : "Type your message..."} required style={{ flex: 1 }} />
                    <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1rem", flexShrink: 0 }}>
                      <Send style={{ width: "16px", height: "16px" }} />
                    </button>
                  </form>
                ) : (
                  <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
                    {isRtl ? "يمكنك عرض الرسائل الحالية، وسيتم تفعيل الرد عند تحديد الطرف المقابل للمحادثة." : "You can view the current messages. Replying will be enabled once a conversation counterpart is identified."}
                  </p>
                )}
              </div>
            )}

            {/* Bids (visible to owner/admin) */}
            {(isOwner || isAdmin) && project.bids.length > 0 && (
              <div className="card" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>
                  {isRtl ? `العروض المقدمة (${project.bids.length})` : `Submitted Bids (${project.bids.length})`}
                </h3>
                <div style={{
                  marginBottom: "1rem",
                  padding: "0.875rem 1rem",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                }}>
                  {isRtl
                    ? "هنا تظهر نتائج نظام التقييم والترتيب لكل عرض: درجة الترتيب والثقة تحت كل عرض."
                    : "This is where the bid scoring system appears: each bid shows its rank score and confidence below the proposal."}
                </div>
                <div className="flex flex-col gap-4">
                  {project.bids.map((bid: any) => (
                    <div className="md:flex" key={bid.id} style={{ padding: "1rem", borderRadius: "var(--radius-md)", background: "var(--surface-2)", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                      {(() => {
                        const bidder = getBidderDisplay(bid);
                        return (
                      <div>
                        <div style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                          {bidder.userId ? (
                            <Link href={`/profile/${bidder.userId}`} style={{ color: "var(--primary)", textDecoration: "none" }}>
                              {isRtl ? bidder.nameAr : bidder.name}
                            </Link>
                          ) : (
                            <span style={{ color: "var(--text)" }}>{isRtl ? bidder.nameAr : bidder.name}</span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                          {bidder.ratingAverage > 0 && (
                            <div style={{ display: "flex", gap: "2px" }}>
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} style={{ width: "12px", height: "12px", fill: s <= Math.round(bidder.ratingAverage) ? "var(--accent)" : "none", color: s <= Math.round(bidder.ratingAverage) ? "var(--accent)" : "var(--border)" }} />
                              ))}
                            </div>
                          )}
                          {bidder.reviewCount > 0 && <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>({bidder.reviewCount})</span>}
                          <span className="chip chip-default" style={{ fontSize: "0.6875rem" }}>{bidder.roleLabel}</span>
                          {bidder.verificationStatus === "VERIFIED" && <span className="chip chip-success" style={{ fontSize: "0.6875rem" }}>{isRtl ? "موثق" : "Verified"}</span>}
                          <span className={`chip chip-${bid.status === "SHORTLISTED" ? "info" : bid.status === "AWARDED" ? "success" : "default"}`} style={{ fontSize: "0.6875rem" }}>
                            {labelStatus(bid.status, isRtl)}
                          </span>
                        </div>
                        {/* Gap 5: Show bidder badges */}
                        {bidder.userId && bidderBadgesMap[bidder.userId]?.length > 0 && (
                          <div style={{ marginBottom: "0.25rem" }}>
                            <BadgeDisplay badges={bidderBadgesMap[bidder.userId] as any} locale={locale} size="sm" />
                          </div>
                        )}
                        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
                          {bid.proposalText || (isRtl ? "لا توجد تفاصيل عرض" : "No proposal details")}
                        </div>
                        {bidder.yearsValue ? (
                          <div style={{ marginTop: "0.35rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                            <strong>{bidder.yearsLabel}:</strong> {bidder.yearsValue}
                          </div>
                        ) : null}
                        {bid.attachments?.length > 0 && (
                          <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                              {isRtl ? "المرفقات الداعمة" : "Supporting Documents"}
                            </div>
                            {bid.attachments.map((file: any) => (
                              <a
                                key={file.id}
                                href={file.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: "var(--primary)", textDecoration: "none", fontSize: "0.8125rem", fontWeight: 600 }}
                              >
                                {displayAttachmentFileName(file.fileName)}
                              </a>
                            ))}
                          </div>
                        )}
                        {bidRankingMap[bid.id] ? (
                          <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                            <strong>{isRtl ? "الترتيب:" : "Rank score:"}</strong> {bidRankingMap[bid.id].totalScore}/100 • {isRtl ? "الثقة" : "confidence"}: {bidRankingMap[bid.id].confidence}
                          </div>
                        ) : (
                          <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--error)" }}>
                            {isRtl ? "لم يتم إنشاء نتيجة الترتيب لهذا العرض بعد." : "No ranking result has been generated for this bid yet."}
                          </div>
                        )}
                      </div>
                        );
                      })()}
                      <div style={{ textAlign: "end" }}>
                        <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--primary)" }}>{bid.amount?.toLocaleString()} {tCommon("sar")}</div>
                        {bid.estimatedDuration && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{bid.estimatedDuration} {isRtl ? "يوم" : "days"}</div>}
                        {isOwner && ["PUBLISHED", "BIDDING"].includes(project.status) && bid.status !== "AWARDED" && (
                          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", justifyContent: "flex-end" }}>
                            {project.bids.length > 1 && bid.status !== "SHORTLISTED" && (
                              <form action={async () => { "use server"; await shortlistBidAction(bid.id); }}>
                                <button type="submit" className="btn-secondary" style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}>
                                  {isRtl ? "قائمة مختصرة" : "Shortlist"}
                                </button>
                              </form>
                            )}
                            <form action={async () => { "use server"; await awardProjectAction(project.id, bid.id); }}>
                              <ConfirmSubmitButton
                                label={isRtl ? "ترسية هذا العرض" : "Award This Bid"}
                                confirmMessage={isRtl ? "هل أنت متأكد من ترسية هذا العرض؟ سيتم رفض بقية العروض تلقائياً." : "Are you sure you want to award this bid? All other bids will be rejected automatically."}
                                className="btn-primary"
                                style={{ fontSize: "0.75rem", padding: "0.375rem 0.75rem" }}
                              />
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {isOwner && project.bids.length >= 2 && (
                  <div style={{ marginTop: "1rem", textAlign: "center" }}>
                    <Link href={`/dashboard/bids/compare?projectId=${project.id}`} className="btn-secondary" style={{ fontSize: "0.8125rem", padding: "0.5rem 1.25rem" }}>
                      {isRtl ? "مقارنة العروض" : "Compare Bids"}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Bid Form (for contractors/engineers) */}
            {/* Bid eligibility notice — show why user can't bid */}
            {(isContractor || isEngineer) && !canBid && !existingBid && (
              <div className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem", border: "2px solid var(--accent)", background: "var(--accent-light)" }}>
                <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--accent)", marginBottom: "0.25rem" }}>
                  ⚠️ {isRtl ? "لا يمكنك التقديم على هذا المشروع" : "You cannot bid on this project"}
                </div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0 }}>
                  {bidBlockReason === "APPROVAL"
                    ? (isRtl
                        ? "لا يمكنك التقديم حالياً لأن ملفك لم يكتمل أو ما زال بانتظار موافقة الإدارة. أكمل ملفك أو انتظر اعتماد الحساب."
                        : "You cannot bid yet because your profile is incomplete or still pending admin approval. Please complete your profile or wait for approval.")
                    : bidBlockReason === "CLOSED"
                      ? (isRtl ? "انتهت فترة استقبال العروض لهذا المشروع." : "The bidding period for this project has ended.")
                      : (isRtl ? "هذا المشروع لا يتناسب مع تخصصك. يمكنك التقديم فقط على المشاريع المناسبة لدورك." : "This project doesn't match your specialty. You can only bid on projects that match your profile.")}
                </p>
              </div>
            )}

            {(isContractor || isEngineer) && canBid && !existingBid && hasKrasat && (
              <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>
                  {tBid("submit")}
                </h3>

                {/* Wallet balance display — informational only. Krasat unlock already covers bid access. */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)",
                  background: walletBalance >= 100 ? "var(--primary-light)" : "var(--surface-2)",
                  marginBottom: "1rem",
                }}>
                  <Wallet style={{ width: "18px", height: "18px", color: walletBalance >= 100 ? "var(--primary)" : "var(--error)" }} />
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>
                    {isRtl ? "رصيد المحفظة:" : "Wallet Balance:"}
                  </span>
                  <span style={{
                    fontSize: "1rem", fontWeight: 800,
                    color: walletBalance >= 100 ? "var(--primary)" : "var(--error)",
                  }}>
                    {walletBalance.toLocaleString()} {isRtl ? "ر.س" : "SAR"}
                  </span>
                </div>

                <div style={{
                  padding: "0.875rem 1rem",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--primary-light)",
                  color: "var(--primary)",
                  fontSize: "0.8125rem",
                  marginBottom: "1rem",
                }}>
                  {isRtl
                    ? "تم فتح تفاصيل المشروع عبر كراسات. لا يلزم دفع 100 ريال إضافية لتقديم العرض."
                    : "Project details are already unlocked via Krasat. No extra 100 SAR payment is required to submit your bid."}
                </div>

                <form action={submitBidAction}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <div style={{ marginBottom: "1rem" }}>
                    <label>{tBid("amount")} ({tCommon("sar")})</label>
                    <input type="number" name="amount" required dir="ltr" />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label>{tBid("duration")}</label>
                    <input type="number" name="estimatedDuration" dir="ltr" />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label>{tBid("proposal")}</label>
                    <textarea name="proposalText" required style={{ minHeight: "100px", resize: "vertical" }} />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label>{isRtl ? "مرفقات داعمة" : "Supporting Documents"}</label>
                    <input id="bid-supporting-docs" type="file" name="bidAttachment" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style={{ display: "block", marginTop: "0.5rem", fontSize: "0.8125rem" }} />
                    <label htmlFor="bid-supporting-docs" className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginTop: "0.375rem", cursor: "pointer", padding: "0.55rem 0.9rem" }}>
                      {isRtl ? "رفع الملفات" : "Upload Files"}
                    </label>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      {isRtl ? "يمكنك إرفاق ملفات داعمة للعرض مثل PDF أو الصور." : "You can attach supporting bid files such as PDFs or images."}
                    </div>
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: "100%", padding: "0.75rem" }}>
                    <Send style={{ width: "16px", height: "16px" }} /> {tBid("submit")}
                  </button>
                </form>
              </div>
            )}

            {existingBid && (
              <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem", border: "2px solid var(--success)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <CheckCircle style={{ width: "20px", height: "20px", color: "var(--success)" }} />
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--success)" }}>
                    {isRtl ? "تم تقديم عرضك" : "Bid Submitted"}
                  </h3>
                </div>
                <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--primary)" }}>
                  {(existingBid as any).amount?.toLocaleString()} {tCommon("sar")}
                </p>
              </div>
            )}

            {/* Gap 6: Bidding Deadline Banner */}
            {project.biddingWindowEnd && (() => {
              const now = new Date();
              const end = new Date(project.biddingWindowEnd);
              const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              const expired = daysLeft <= 0;
              return (
                <div className="card" style={{
                  padding: "1rem", marginBottom: "1rem",
                  border: `2px solid ${expired ? "var(--error)" : daysLeft <= 5 ? "var(--accent)" : "var(--primary)"}`,
                  background: expired ? "var(--error-light)" : daysLeft <= 5 ? "var(--accent-light)" : "var(--primary-light)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Timer style={{ width: "18px", height: "18px", color: expired ? "var(--error)" : daysLeft <= 5 ? "var(--accent)" : "var(--primary)" }} />
                    <div>
                      <div style={{ fontSize: "0.875rem", fontWeight: 700, color: expired ? "var(--error)" : "var(--text)" }}>
                        {expired
                          ? (isRtl ? "انتهت فترة التقديم" : "Bidding Closed")
                          : (isRtl ? `${daysLeft} يوم متبقي للتقديم` : `${daysLeft} days left to bid`)}
                      </div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                        {isRtl ? "الموعد النهائي:" : "Deadline:"} {end.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Gap 6: Owner can extend deadline */}
            {isOwner && project.biddingWindowEnd && (
              <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }}>
                <form action={extendDeadlineAction} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <select name="extraDays" defaultValue="14" style={{ flex: 1, padding: "0.375rem", fontSize: "0.8125rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                    <option value="7">{isRtl ? "7 أيام" : "7 days"}</option>
                    <option value="14">{isRtl ? "14 يوم" : "14 days"}</option>
                    <option value="30">{isRtl ? "30 يوم" : "30 days"}</option>
                  </select>
                  <button type="submit" style={{
                    padding: "0.375rem 0.75rem", fontSize: "0.75rem", borderRadius: "var(--radius-md)",
                    border: "1px solid var(--primary)", background: "var(--primary-light)", color: "var(--primary)",
                    cursor: "pointer", fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap",
                  }}>
                    {isRtl ? "تمديد الموعد" : "Extend"}
                  </button>
                </form>
              </div>
            )}

            {/* Project Info Card */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>
                {isRtl ? "معلومات المشروع" : "Project Info"}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                  { label: isRtl ? "الحالة" : "Status", value: labelStatus(project.status, isRtl) },
                  { label: isRtl ? "النوع" : "Type", value: project.projectType.replace(/_/g, " ") },
                  { label: isRtl ? "تاريخ البدء المتوقع" : "Expected Start Date", value: project.requiredStartDate ? new Date(project.requiredStartDate).toLocaleDateString() : "—" },
                  { label: isRtl ? "آخر موعد لاستقبال العروض" : "Bid End Date", value: project.deadline ? new Date(project.deadline).toLocaleDateString() : "—" },
                  { label: isRtl ? "العروض" : "Bids", value: project.bids.length.toString() },
                  { label: isRtl ? "تاريخ النشر" : "Published", value: project.publishedAt ? new Date(project.publishedAt).toLocaleDateString() : "—" },
                  { label: isRtl ? "نوع العقار" : "Property", value: project.propertyType || "—" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>{item.label}</span>
                    <span style={{ fontWeight: 600, color: "var(--text)" }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {isOwner && project.status === "AWARDED" && (
              <div className="card" style={{ padding: "1.5rem", marginTop: "1rem", border: "2px solid var(--accent)" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "1rem" }}>
                  {isRtl ? "خيارات إضافية بعد الترسية" : "Post-Award Upsell Options"}
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ padding: "1rem", borderRadius: "var(--radius-lg)", background: "var(--surface-2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <HardHat style={{ width: "18px", height: "18px", color: "var(--accent)" }} />
                      <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)" }}>
                        {isRtl ? "الخدمة الاختيارية: الإشراف المهني" : "Optional Service: Professional Supervision"}
                      </div>
                    </div>
                    <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                      {isRtl
                        ? "رسوم لمرة واحدة 100 ر.س. سيتم إرسال الطلب للمهندسين المؤهلين، ثم مقارنة العروض واختيار المشرف."
                        : "One-time fee of 100 SAR. The system will broadcast to eligible engineers, then you can compare proposals and award a supervisor."}
                    </p>
                    {supervisionRequest ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                        <span className={`chip chip-${supervisionRequest.status === "ASSIGNED" ? "success" : supervisionRequest.status === "OPEN" ? "warning" : "info"}`}>
                          {isRtl ? `حالة الطلب: ${supervisionRequest.status}` : `Request Status: ${supervisionRequest.status}`}
                        </span>
                        <Link href="/dashboard/supervision" className="btn-secondary" style={{ textDecoration: "none", fontSize: "0.8125rem", padding: "0.5rem 1rem" }}>
                          {isRtl ? "إدارة طلب الإشراف" : "Manage Supervision Request"}
                        </Link>
                      </div>
                    ) : (
                      <Link href="/dashboard/supervision" className="btn-primary" style={{ textDecoration: "none", fontSize: "0.8125rem", padding: "0.5rem 1rem", display: "inline-flex" }}>
                        <HardHat style={{ width: "14px", height: "14px" }} />
                        {isRtl ? "طلب إشراف احترافي — 150 ر.س" : "Request Professional Supervision — 150 SAR"}
                      </Link>
                    )}
                  </div>

                  <div style={{ padding: "1rem", borderRadius: "var(--radius-lg)", background: "var(--surface-2)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <FileText style={{ width: "18px", height: "18px", color: "var(--primary)" }} />
                      <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)" }}>
                        {isRtl ? "الخدمة الاختيارية: نوع العقد" : "Optional Service: Contract Type"}
                      </div>
                    </div>
                    <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                      {isRtl
                        ? "اختر بين العقد البسيط المجاني أو الترقية إلى عقد احترافي شامل مقابل 150 ر.س."
                        : "Choose between the free Simple contract or upgrade to a comprehensive Professional contract for 150 SAR."}
                    </p>
                    {contractRecord ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span className={`chip chip-${contractRecord.contractType === "PROFESSIONAL" ? "success" : "default"}`}>
                            {contractRecord.contractType === "PROFESSIONAL"
                              ? (isRtl ? "عقد احترافي" : "Professional Contract")
                              : (isRtl ? "عقد بسيط" : "Simple Contract")}
                          </span>
                          <span className={`chip chip-${contractRecord.status === "SIGNED" ? "success" : "info"}`}>
                            {contractRecord.status}
                          </span>
                        </div>
                        <Link href={`/dashboard/contracts/${contractRecord.id}`} className="btn-secondary" style={{ textDecoration: "none", fontSize: "0.8125rem", padding: "0.5rem 1rem" }}>
                          <Shield style={{ width: "14px", height: "14px" }} />
                          {isRtl ? "عرض / إدارة العقد" : "Open / Manage Contract"}
                        </Link>
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.8125rem", color: "var(--error)" }}>
                        {isRtl ? "لم يتم العثور على سجل العقد بعد. يرجى تحديث الصفحة أو مراجعة لوحة العقود." : "No contract record was found yet. Please refresh the page or check the contracts dashboard."}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}