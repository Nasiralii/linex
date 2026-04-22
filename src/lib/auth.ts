import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "./db";
import type { UserRole } from "@prisma/client";
import { logger } from "./logger";

// SECURITY: No fallback secret - fail fast if not configured
const AUTH_SECRET = process.env.AUTH_SECRET;
if (!AUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("AUTH_SECRET environment variable is required in production");
}
const AUTH_SECRET_VALUE = AUTH_SECRET || "dev-secret-change-in-production";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// ============================================================================
// Password Utilities
// ============================================================================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ============================================================================
// JWT Token Utilities
// ============================================================================

interface TokenPayload {
  userId: string;
  role: UserRole;
  sessionId: string;
}

export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, AUTH_SECRET_VALUE, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, AUTH_SECRET_VALUE) as TokenPayload;
  } catch {
    return null;
  }
}

// ============================================================================
// Session Management
// ============================================================================

export async function createSession(
  userId: string,
  role: UserRole,
  ipAddress?: string,
  userAgent?: string
) {
  logger.info("Creating auth session", { userId, role, action: "create_session_start", entityType: "auth" });

  // Create session in database
  const session = await db.session.create({
    data: {
      userId,
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + SESSION_DURATION),
      ipAddress,
      userAgent,
    },
  });

  // Create JWT token
  const token = createToken({
    userId,
    role,
    sessionId: session.id,
  });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });

  logger.auth("create_session_success", userId, true);

  return session;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (token) {
    const payload = verifyToken(token);
    if (payload?.sessionId) {
      await db.session.delete({
        where: { id: payload.sessionId },
      }).catch(() => {
        // Session might already be deleted
      });
    }
  }

  cookieStore.delete("auth-token");
}

// ============================================================================
// Get Current User
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  status: string;
  emailVerified: boolean;
  avatarUrl: string | null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      logger.debug("Auth token missing", { action: "get_current_user_no_token", entityType: "auth" });
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      logger.warn("Invalid auth token payload", { action: "get_current_user_invalid_token", entityType: "auth" });
      return null;
    }

    // Verify session still exists in DB
    const session = await db.session.findUnique({
      where: { id: payload.sessionId },
    });

    if (!session || session.expiresAt < new Date()) {
      // Session expired or not found
      logger.warn("Session missing or expired", {
        userId: payload.userId,
        action: "get_current_user_session_invalid",
        entityType: "auth",
        sessionId: payload.sessionId,
      });
      cookieStore.delete("auth-token");
      return null;
    }

    // Get user
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        avatarUrl: true,
      },
    });

    if (!user || user.status !== "ACTIVE") {
      logger.warn("User missing or inactive during auth resolution", {
        userId: payload.userId,
        action: "get_current_user_user_invalid",
        entityType: "auth",
        status: user?.status,
      });
      return null;
    }

    logger.debug("Resolved current user successfully", {
      userId: user.id,
      action: "get_current_user_success",
      entityType: "auth",
      role: user.role,
    });

    return user;
  } catch (error: any) {
    logger.error("getCurrentUser failed", { action: "get_current_user_exception", entityType: "auth" }, error);
    return null;
  }
}

// ============================================================================
// Authorization Helpers
// ============================================================================

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
