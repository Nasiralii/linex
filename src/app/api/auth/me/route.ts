import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import type { Prisma } from "@prisma/client";

async function createAuthMeAuditLog(action: string, metadata?: Record<string, unknown>, actorId?: string) {
  try {
    await db.auditLog.create({
      data: {
        actorId,
        action,
        entityType: "auth",
        entityId: actorId || "auth_me",
        metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch {
    // Avoid blocking auth/me on audit write failures
  }
}

// Retry logic for Supabase cold starts
async function getUserWithRetry() {
  for (let i = 0; i < 3; i++) {
    try {
      const user = await getCurrentUser();
      if (user) return user;
    } catch {
      if (i < 2) await new Promise(r => setTimeout(r, 1000));
    }
  }
  return null;
}

export async function GET() {
  const startedAt = Date.now();
  try {
    const requestHeaders = await headers();
    const clientEvent = requestHeaders.get("x-auth-client-event");
    const clientMeta = requestHeaders.get("x-auth-client-meta");
    if (clientEvent) {
      let parsedMeta: Record<string, unknown> | undefined = undefined;
      try {
        parsedMeta = clientMeta ? JSON.parse(clientMeta) : undefined;
      } catch {
        parsedMeta = { raw: clientMeta };
      }
      await createAuthMeAuditLog(clientEvent, parsedMeta);
    }

    const user = await getUserWithRetry();
    if (!user) {
      logger.warn("/api/auth/me unauthorized", { action: "auth_me_unauthorized", entityType: "auth" });
      await createAuthMeAuditLog("AUTH_ME_UNAUTHORIZED", { route: "/api/auth/me" });
      return NextResponse.json(null, { status: 401 });
    }

    let profile: any = null;
    let notificationCount = 0;
    let verificationStatus: string | null = null;

    try {
      if (user.role === "OWNER") {
        profile = await db.ownerProfile.findUnique({ where: { userId: user.id } });
        verificationStatus = profile?.verificationStatus || null;
      } else if (user.role === "CONTRACTOR") {
        profile = await db.contractorProfile.findUnique({
          where: { userId: user.id },
          include: { documents: true, portfolioItems: true, categories: true },
        });
        verificationStatus = profile?.verificationStatus || null;
      } else if (user.role === "ENGINEER") {
        profile = await db.engineerProfile.findUnique({
          where: { userId: user.id },
          include: { documents: true, portfolioItems: true },
        });
        verificationStatus = profile?.verificationStatus || null;
      }
    } catch (error: any) {
      logger.warn("/api/auth/me profile lookup failed", { userId: user.id, action: "auth_me_profile_lookup_failed", entityType: "auth" }, error);
    }

    try {
      notificationCount = await db.notification.count({
        where: { userId: user.id, isRead: false },
      });
    } catch (error: any) {
      logger.warn("/api/auth/me notification lookup failed", { userId: user.id, action: "auth_me_notification_lookup_failed", entityType: "auth" }, error);
    }

    logger.api("GET", "/api/auth/me", 200, user.id, Date.now() - startedAt);
    await createAuthMeAuditLog("AUTH_ME_RESOLVED", { duration: Date.now() - startedAt, role: user.role }, user.id);

    return NextResponse.json({
      email: user.email,
      role: user.role,
      id: user.id,
      avatarUrl: user.avatarUrl,
      profile,
      profileComplete: profile?.profileComplete ?? null,
      notificationCount,
      verificationStatus,
    });
  } catch (error: any) {
    logger.error("/api/auth/me failed", { action: "auth_me_failed", entityType: "auth" }, error);
    await createAuthMeAuditLog("AUTH_ME_SERVICE_FAILURE", { route: "/api/auth/me", message: error?.message || String(error) });
    return NextResponse.json({ error: "Auth service unavailable", stage: "auth_me_failed" }, { status: 503 });
  }
}