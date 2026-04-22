"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { calculateBidScore } from "@/lib/ai";
import { rankBidWithPolicy } from "@/lib/bid-ranking-policy";
import { sendBidAwardedEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

// ============================================================================
// Krasat Purchase — 100 SAR to unlock project details (SS-KR-01)
// ============================================================================
export async function purchaseKrasat(projectId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  try {
    // Check if already purchased
    const existing = await db.krasatPurchase.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } },
    });
    if (existing) return { success: true, alreadyPurchased: true };

    // Create Krasat purchase (in production, integrate with Stripe)
    await db.krasatPurchase.create({
      data: { userId: user.id, projectId, amount: 100, status: "completed" },
    });

    // Track wallet transaction
    await db.walletTransaction.create({
      data: {
        userId: user.id, type: "DEDUCT", amount: 100,
        purpose: "KRASAT", referenceId: projectId, status: "completed",
      },
    });

    // Audit log
    await db.auditLog.create({
      data: { actorId: user.id, action: "KRASAT_PURCHASED", entityType: "project", entityId: projectId, metadata: { amount: 100 } },
    });

    revalidatePath(`/marketplace/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error('[purchaseKrasat] DB query failed:', error);
    return { success: false, error: "Database error" };
  }
}

// ============================================================================
// Award Project — Owner awards a bid (CS-PO-08)
// ============================================================================
export async function awardProjectAction(projectId: string, bidId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "OWNER") return { success: false, error: "Unauthorized" };

  try {
    const bid = await db.bid.findUnique({
      where: { id: bidId },
      include: { project: { include: { owner: true } }, contractor: true, engineer: true },
    });

    if (!bid || bid.project.owner.userId !== user.id) return { success: false, error: "Bid not found" };
    if (bid.project.status !== "PUBLISHED" && bid.project.status !== "BIDDING") return { success: false, error: "Project not in bidding phase" };

    const winnerUserId = bid.contractor?.userId || bid.engineer?.userId;
    // Create award
    await db.award.create({
      data: {
        projectId, bidId, ownerId: user.id,
        contractorId: bid.contractorId,
        engineerId: bid.engineerId,
        awardedAmount: bid.amount,
      },
    });

    // Update project status
    await db.project.update({ where: { id: projectId }, data: { status: "AWARDED", awardedAt: new Date() } });

    // Update winning bid
    await db.bid.update({ where: { id: bidId }, data: { status: "AWARDED" } });

    const losingBids = await db.bid.findMany({
      where: { projectId, id: { not: bidId }, status: { not: "WITHDRAWN" } },
      include: { contractor: { select: { userId: true, companyName: true, companyNameAr: true } }, engineer: { select: { userId: true, fullName: true, fullNameAr: true } } },
    });

    // Reject all other bids
    await db.bid.updateMany({
      where: { projectId, id: { not: bidId }, status: { not: "WITHDRAWN" } },
      data: { status: "REJECTED", rejectedAt: new Date(), rejectionReason: "Another bid was awarded" },
    });

    // Create fee event (5% platform fee)
    const feeRule = await db.feeRule.findFirst({ where: { isDefault: true, isActive: true } });
    if (feeRule) {
      const feeAmount = feeRule.percentage ? bid.amount * (feeRule.percentage / 100) : (feeRule.flatAmount || 0);
      await db.feeEvent.create({
        data: {
          awardId: (await db.award.findUnique({ where: { projectId } }))!.id,
          feeRuleId: feeRule.id, feeType: feeRule.feeType,
          payerType: feeRule.payer, baseAmount: bid.amount,
          feeAmount: Math.min(feeAmount, feeRule.maxAmount || Infinity),
        },
      });
    }

    // Notify winner
    await db.notification.create({
      data: {
        userId: winnerUserId!, type: "BID_AWARDED",
        title: "Congratulations! Your bid was awarded",
        titleAr: "تهانينا! تم ترسية عرضك",
        message: `Your bid of ${bid.amount} SAR has been awarded`,
        messageAr: `تم ترسية عرضك بقيمة ${bid.amount} ريال`,
        link: `/marketplace/${projectId}`,
      },
    });

    if (losingBids.length > 0) {
      const losingBidNotifications = losingBids
        .map((losingBid) => {
          const userId = losingBid.contractor?.userId || losingBid.engineer?.userId;
          if (!userId) return null;
          return {
            userId,
            type: "BID_REJECTED" as const,
            title: "A different bid was awarded",
            titleAr: "تمت ترسية عرض آخر",
            message: `Another bid was selected for project "${bid.project.title}".`,
            messageAr: `تم اختيار عرض آخر لمشروع "${bid.project.titleAr || bid.project.title}".`,
            link: "/dashboard/bids",
          };
        })
        .filter((item): item is {
          userId: string;
          type: "BID_REJECTED";
          title: string;
          titleAr: string;
          message: string;
          messageAr: string;
          link: string;
        } => Boolean(item));

      if (losingBidNotifications.length > 0) {
      await db.notification.createMany({
        data: losingBidNotifications,
      });
      }
    }

    // Create simple contract
    await db.contract.create({
      data: { projectId, contractType: "SIMPLE", status: "PENDING_SIGNATURE", terms: "Standard platform contract terms" },
    });

    // Send award email to winner (non-blocking)
    const contractorUser = winnerUserId ? await db.user.findUnique({ where: { id: winnerUserId } }) : null;
    if (contractorUser) {
      sendBidAwardedEmail(contractorUser.email, bid.project.title, bid.amount, "ar").catch(e => console.error("Award email error:", e));
    }

    // Audit log
    await db.auditLog.create({
      data: { actorId: user.id, action: "PROJECT_AWARDED", entityType: "project", entityId: projectId, metadata: { bidId, amount: bid.amount } },
    });

    // Gap 5: Evaluate badges after award
    const { evaluateUserBadges } = await import("@/lib/badges");
    if (winnerUserId) evaluateUserBadges(winnerUserId).catch(() => {});

    await refreshProjectBidRankings(projectId);

    revalidatePath(`/marketplace/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error('[awardProjectAction] DB query failed:', error);
    return { success: false, error: "Database error" };
  }
}

// ============================================================================
// Shortlist Bid — Owner shortlists a bid (CS-PO-07)
// ============================================================================
export async function shortlistBidAction(bidId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== "OWNER") return { success: false, error: "Unauthorized" };

  try {
    const bid = await db.bid.findUnique({ where: { id: bidId }, include: { project: { include: { owner: true } } } });
    if (!bid || bid.project.owner.userId !== user.id) return { success: false, error: "Bid not found" };

    // Check shortlist limit (max 3)
    const shortlistedCount = await db.bid.count({ where: { projectId: bid.projectId, status: "SHORTLISTED" } });
    if (shortlistedCount >= 3) return { success: false, error: "Maximum 3 bids can be shortlisted" };

    await db.bid.update({ where: { id: bidId }, data: { status: "SHORTLISTED", shortlistedAt: new Date() } });

    const notifiedUserId = bid.contractorId
      ? (await db.contractorProfile.findUnique({ where: { id: bid.contractorId } }))?.userId
      : bid.engineerId
        ? (await db.engineerProfile.findUnique({ where: { id: bid.engineerId } }))?.userId
        : null;

    if (notifiedUserId) {
      await db.notification.create({
        data: {
          userId: notifiedUserId,
        type: "BID_SHORTLISTED",
        title: "Your bid has been shortlisted",
        titleAr: "تم إدراج عرضك في القائمة المختصرة",
        message: "The project owner has shortlisted your bid for further evaluation",
        messageAr: "قام مالك المشروع بإدراج عرضك في القائمة المختصرة",
        link: `/dashboard`,
      },
      });
    }

    await refreshProjectBidRankings(bid.projectId);

    revalidatePath(`/marketplace/${bid.projectId}`);
    return { success: true };
  } catch (error) {
    console.error('[shortlistBidAction] DB query failed:', error);
    return { success: false, error: "Database error" };
  }
}

// ============================================================================
// Refresh policy-based ranking for project bids
// ============================================================================
export async function refreshProjectBidRankings(projectId: string) {
  const bids = await db.bid.findMany({
    where: { projectId, status: { in: ["SUBMITTED", "SHORTLISTED", "AWARDED"] } },
    include: {
      contractor: {
        include: {
          documents: { select: { id: true } },
          portfolioItems: { select: { id: true } },
        },
      },
      project: {
        select: {
          id: true,
          title: true,
          titleAr: true,
          description: true,
          descriptionAr: true,
          budgetMin: true,
          budgetMax: true,
          projectType: true,
          publishedAt: true,
        },
      },
      engineer: {
        include: {
          documents: { select: { id: true } },
          portfolioItems: { select: { id: true } },
        },
      },
    },
  });

  for (const bid of bids) {
    const ranked = await rankBidWithPolicy({
      bid: {
        id: bid.id,
        amount: bid.amount,
        estimatedDuration: bid.estimatedDuration,
        proposalText: bid.proposalText,
        submittedAt: bid.submittedAt,
        aiScore: bid.aiScore,
        contractor: {
          id: bid.contractor?.id || bid.engineer?.id,
          companyName: bid.contractor?.companyName || bid.engineer?.fullName,
          companyNameAr: bid.contractor?.companyNameAr || bid.engineer?.fullNameAr,
          ratingAverage: bid.contractor?.ratingAverage || bid.engineer?.ratingAverage,
          reviewCount: bid.contractor?.reviewCount || bid.engineer?.reviewCount,
          yearsInBusiness: bid.contractor?.yearsInBusiness,
          yearsExperience: bid.engineer?.yearsExperience,
          verificationStatus: bid.contractor?.verificationStatus || bid.engineer?.verificationStatus,
          website: bid.contractor?.website || bid.engineer?.website,
          teamSize: bid.contractor?.teamSize,
          specialization: bid.engineer?.specialization,
          profileComplete: bid.contractor?.profileComplete || bid.engineer?.profileComplete,
          documentsCount: bid.contractor?.documents.length || bid.engineer?.documents.length || 0,
          portfolioCount: bid.contractor?.portfolioItems.length || bid.engineer?.portfolioItems.length || 0,
        },
      },
      project: bid.project,
    });

    await db.bid.update({ where: { id: bid.id }, data: { aiScore: ranked.totalScore } });
    await db.auditLog.create({
      data: {
        action: "BID_RANKED",
        entityType: "bid",
        entityId: bid.id,
        metadata: {
          projectId,
          eligible: ranked.eligible,
          totalScore: ranked.totalScore,
          confidence: ranked.confidence,
          missingCoreFields: ranked.missingCoreFields,
          usedFallbacks: ranked.usedFallbacks,
          explanationsEn: ranked.explanationsEn,
          explanationsAr: ranked.explanationsAr,
        },
      },
    });
  }
}
