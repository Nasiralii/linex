import { db } from "@/lib/db";

// ============================================================================
// Gap 5: Badge System — Auto-assign badges based on user activity
// Badge types: VERIFIED, EXPERIENCED, HIGHLY_RATED, FAST_RESPONSE, PREMIUM, NEW
// ============================================================================

export const BADGE_CONFIG = {
  VERIFIED: {
    labelEn: "Verified", labelAr: "موثّق", emoji: "✓",
    colorBg: "var(--primary-light)", colorText: "var(--primary)",
  },
  EXPERIENCED: {
    labelEn: "Experienced", labelAr: "خبير", emoji: "⭐",
    colorBg: "var(--info-light)", colorText: "var(--info)",
  },
  HIGHLY_RATED: {
    labelEn: "Highly Rated", labelAr: "تقييم عالي", emoji: "🌟",
    colorBg: "var(--accent-light)", colorText: "var(--accent)",
  },
  FAST_RESPONSE: {
    labelEn: "Fast Response", labelAr: "استجابة سريعة", emoji: "⚡",
    colorBg: "#fff3e0", colorText: "#e65100",
  },
  PREMIUM: {
    labelEn: "Premium", labelAr: "مميز", emoji: "💎",
    colorBg: "#f3e5f5", colorText: "#7b1fa2",
  },
  NEW: {
    labelEn: "New", labelAr: "جديد", emoji: "🆕",
    colorBg: "#e3f2fd", colorText: "#1565c0",
  },
} as const;

export type BadgeType = keyof typeof BADGE_CONFIG;

/**
 * Evaluate and auto-assign all applicable badges for a user.
 * Called after key events (bid, project complete, review, etc.)
 */
export async function evaluateUserBadges(userId: string): Promise<string[]> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { contractorProfile: true, engineerProfile: true },
  });
  if (!user) return [];

  const assigned: string[] = [];
  const profile = user.contractorProfile || user.engineerProfile;

  // VERIFIED — admin verified
  if ((profile as any)?.verificationStatus === "VERIFIED") {
    await upsertBadge(userId, "VERIFIED");
    assigned.push("VERIFIED");
  }

  // NEW — joined within last 30 days
  const daysSinceJoin = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceJoin <= 30) {
    await upsertBadge(userId, "NEW", new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    assigned.push("NEW");
  } else {
    // Remove expired NEW badge
    await db.userBadge.deleteMany({ where: { userId, badge: "NEW" } });
  }

  // Count completed projects (as contractor via awards)
  let completedProjects = 0;
  if (user.contractorProfile) {
    completedProjects = await db.award.count({
      where: {
        contractorId: user.contractorProfile.id,
        project: { status: { in: ["COMPLETED", "IN_PROGRESS", "AWARDED"] } },
      },
    });
  }

  // EXPERIENCED — 5+ completed projects
  if (completedProjects >= 5) {
    await upsertBadge(userId, "EXPERIENCED");
    assigned.push("EXPERIENCED");
  }

  // PREMIUM — 10+ completed projects
  if (completedProjects >= 10) {
    await upsertBadge(userId, "PREMIUM");
    assigned.push("PREMIUM");
  }

  // HIGHLY_RATED — average rating >= 4.5
  const rating = (profile as any)?.ratingAverage || 0;
  const reviewCount = (profile as any)?.reviewCount || 0;
  if (rating >= 4.5 && reviewCount >= 2) {
    await upsertBadge(userId, "HIGHLY_RATED");
    assigned.push("HIGHLY_RATED");
  }

  // FAST_RESPONSE — average bid response time < 24h
  if (user.contractorProfile) {
    const bids = await db.bid.findMany({
      where: { contractorId: user.contractorProfile.id, submittedAt: { not: null } },
      select: { submittedAt: true, project: { select: { publishedAt: true } } },
      take: 20,
      orderBy: { submittedAt: "desc" },
    });
    const validBids = bids.filter((b: any) => b.submittedAt && b.project.publishedAt);
    if (validBids.length >= 3) {
      const avgHours = validBids.reduce((sum: number, b: any) => {
        const hours = (new Date(b.submittedAt!).getTime() - new Date(b.project.publishedAt!).getTime()) / (1000 * 60 * 60);
        return sum + Math.max(0, hours);
      }, 0) / validBids.length;
      if (avgHours < 24) {
        await upsertBadge(userId, "FAST_RESPONSE");
        assigned.push("FAST_RESPONSE");
      }
    }
  }

  return assigned;
}

async function upsertBadge(userId: string, badge: string, expiresAt?: Date) {
  await db.userBadge.upsert({
    where: { userId_badge: { userId, badge } },
    create: { userId, badge, expiresAt },
    update: { expiresAt },
  });
}

/**
 * Get display-ready badges for a user
 */
export async function getUserBadges(userId: string): Promise<BadgeType[]> {
  const badges = await db.userBadge.findMany({
    where: {
      userId,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    select: { badge: true },
  });
  return badges.map((b: { badge: string }) => b.badge as BadgeType);
}
