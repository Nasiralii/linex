import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { rateLimits } from "@/lib/rate-limit";
import type { Prisma } from "@prisma/client";

async function createAuthAuditLog(data: {
  actorId?: string | null;
  action: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await db.auditLog.create({
      data: {
        actorId: data.actorId || undefined,
        action: data.action,
        entityType: "auth",
        entityId: data.entityId || data.actorId || "login",
        metadata: (data.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch {
    // Never block auth flow on audit logging failure
  }
}

async function dbRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error("Retry exhausted");
}

export async function POST(request: NextRequest) {
  let stage = "init";
  try {
    stage = "rate_limit";
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rl = rateLimits.auth(ip);
    if (!rl.allowed) {
      return NextResponse.json({ success: false, error: "Too many login attempts. Please try again later." }, { status: 429 });
    }

    stage = "parse_body";
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    stage = "find_user";
    const user = await dbRetry(() => db.user.findUnique({ where: { email: email.toLowerCase() } }));
    if (!user) {
      await createAuthAuditLog({
        action: "AUTH_LOGIN_FAILED",
        entityId: email.toLowerCase(),
        metadata: { stage, reason: "user_not_found" },
      });
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    if (user.status === "DEACTIVATED") {
      return NextResponse.json({ success: false, error: "Your account has been deactivated" }, { status: 403 });
    }

    if (user.status === "SUSPENDED") {
      stage = "reactivate_user";
      await dbRetry(() => db.user.update({ where: { id: user.id }, data: { status: "ACTIVE" } }));
    }

    stage = "verify_password";
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      await createAuthAuditLog({
        actorId: user.id,
        action: "AUTH_LOGIN_FAILED",
        metadata: { stage, reason: "invalid_password" },
      });
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    stage = "update_last_login";
    await dbRetry(() => db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }));

    stage = "create_session";
    await dbRetry(() => createSession(user.id, user.role));

    let redirectTo = user.role === "ADMIN" ? "/admin" : "/dashboard";

    // BUG-C09: Parallelize profile completeness queries
    if (user.role !== "ADMIN") {
      const profileQueries: Record<string, () => Promise<any>> = {
        OWNER: () => db.ownerProfile.findUnique({ where: { userId: user.id }, select: { profileComplete: true } }),
        CONTRACTOR: () => db.contractorProfile.findUnique({ where: { userId: user.id }, select: { profileComplete: true } }),
        ENGINEER: () => db.engineerProfile.findUnique({ where: { userId: user.id }, select: { profileComplete: true } }),
      };
      const queryFn = profileQueries[user.role];
      if (queryFn) {
        stage = "profile_redirect_check";
        try {
          const profile = await dbRetry(queryFn);
          if (!profile?.profileComplete) redirectTo = "/dashboard/profile";
        } catch (profileError: any) {
          console.error("Login API profile redirect check failed:", profileError?.message || profileError);
          // Non-critical: successful login should continue even if this check fails
        }
      }
    }

    await createAuthAuditLog({
      actorId: user.id,
      action: "AUTH_LOGIN_SUCCEEDED",
      metadata: { redirectTo },
    });

    return NextResponse.json({ success: true, redirectTo });
  } catch (error: any) {
    console.error(`Login API error at stage [${stage}]:`, error?.message || error);
    await createAuthAuditLog({
      action: "AUTH_LOGIN_SERVICE_FAILURE",
      metadata: { stage, message: error?.message || String(error) },
    });
    return NextResponse.json(
      {
        success: false,
        error: "Login service is temporarily unavailable. Please try again in a moment.",
        stage,
      },
      { status: 503 }
    );
  }
}
