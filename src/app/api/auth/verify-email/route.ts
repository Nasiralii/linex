import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

// R1: Email verification handler — validates token cryptographically
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const email = url.searchParams.get("email");

    if (!token || !email) {
      return NextResponse.redirect(new URL("/ar/auth/login?error=invalid-token", url.origin));
    }

    // Verify the user exists
    const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return NextResponse.redirect(new URL("/ar/auth/login?error=user-not-found", url.origin));
    }

    // Validate token: HMAC of email with AUTH_SECRET
    const secret = process.env.AUTH_SECRET || "dev-secret-change-in-production";
    const expectedToken = crypto
      .createHmac("sha256", secret)
      .update(email.toLowerCase())
      .digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken))) {
      return NextResponse.redirect(new URL("/ar/auth/login?error=invalid-token", url.origin));
    }

    // Already verified — skip
    if (user.emailVerified) {
      return NextResponse.redirect(new URL("/ar/auth/login?verified=true", url.origin));
    }

    // Mark email as verified
    await db.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    // Audit log
    await db.auditLog.create({
      data: { actorId: user.id, action: "EMAIL_VERIFIED", entityType: "user", entityId: user.id },
    });

    // Redirect to login with success message
    return NextResponse.redirect(new URL("/ar/auth/login?verified=true", url.origin));
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(new URL("/ar/auth/login?error=verification-failed", request.url));
  }
}
