"use server";

import { db } from "@/lib/db";
import { rateLimits } from "@/lib/rate-limit";
import {
  hashPassword,
  verifyPassword,
  createSession,
  deleteSession,
  getCurrentUser,
} from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { sendVerificationEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import type { UserRole } from "@prisma/client";

// ============================================================================
// Register Action
// ============================================================================

export interface AuthResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

export async function aiTranslateProfileTextAction(
  text: string,
  fromLang: "ar" | "en",
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    if (!text?.trim()) return { success: true, translated: "" };

    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const targetLang = fromLang === "ar" ? "English" : "Arabic";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Translate the following profile bio to ${targetLang}. Return only the translated bio text with no explanation.`,
        },
        { role: "user", content: text },
      ],
      max_tokens: 400,
      temperature: 0.3,
    });

    return {
      success: true,
      translated: response.choices[0]?.message?.content?.trim() || "",
    };
  } catch (error) {
    console.error("Profile translate error:", error);
    return { success: false, error: "Translation failed" };
  }
}

export async function registerAction(formData: FormData): Promise<AuthResult> {
  const startTime = Date.now();
  try {
    const rawData = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      role: formData.get("role") as string,
    };
    // Gap 12: Phone number
    const phone = (formData.get("phone") as string) || "";
    // Arabic name (if provided)
    const fullNameAr = (formData.get("fullNameAr") as string) || "";

    // Validate input
    const result = registerSchema.safeParse(rawData);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return { success: false, error: firstError.message };
    }

    const { fullName, email, password, role } = result.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        ownerProfile: {
          select: { verificationStatus: true },
        },
        contractorProfile: {
          select: { verificationStatus: true },
        },
        engineerProfile: {
          select: { verificationStatus: true },
        },
      },
    });

    if (existingUser) {
      // Check if user has a rejected profile - if so, allow creating new account
      const profileStatus =
        existingUser.ownerProfile?.verificationStatus ||
        existingUser.contractorProfile?.verificationStatus ||
        existingUser.engineerProfile?.verificationStatus;

      if (profileStatus === "REJECTED") {
        // Delete the old rejected user to allow creating new account with same email
        logger.info("Deleting rejected user to allow new registration", {
          email: email.toLowerCase(),
          existingUserId: existingUser.id,
          action: "delete_rejected_user",
        });

        await db.user.delete({
          where: { id: existingUser.id },
        });

        logger.info(
          "Allowing rejected user to create new account with same email",
          {
            email: email.toLowerCase(),
            oldUserId: existingUser.id,
            action: "register_rejected_user",
          },
        );
      } else {
        return {
          success: false,
          error: "An account with this email already exists",
        };
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // ALL users start as ACTIVE — they can browse the platform
    // verificationStatus stays DRAFT until the user completes the required application info/documents
    const userStatus = "ACTIVE";

    // G4: Owner type (Individual/Company)
    const ownerType = (formData.get("ownerType") as string) || "individual";
    const website = ((formData.get("website") as string) || "").trim();
    const publicName = ((formData.get("publicName") as string) || "").trim();
    const companyCr = ((formData.get("companyCr") as string) || "").trim();
    const ownerProjectPreferences = (
      (formData.get("ownerProjectPreferences") as string) || ""
    ).trim();

    // Create user
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: role as UserRole,
        status: userStatus as any,
        emailVerified: false,
      },
    });

    // Create role-specific profile
    if (role === "OWNER") {
      await db.ownerProfile.create({
        data: {
          userId: user.id,
          fullName,
          fullNameAr: fullNameAr || null,
          legalName: fullName,
          legalNameAr: fullNameAr || null,
          phone: phone || null,
          companyName: publicName || null,
          companyType: ownerType,
          projectPreferences: ownerProjectPreferences || null,
          verificationStatus: "DRAFT",
        },
      });
    } else if (role === "CONTRACTOR") {
      await db.contractorProfile.create({
        data: {
          userId: user.id,
          companyName: fullName,
          companyNameAr: fullNameAr || null,
          legalName: fullName,
          legalNameAr: fullNameAr || null,
          companyCr: companyCr || null,
          phone: phone || null,
          verificationStatus: "DRAFT",
          website: website || null,
        },
      });
    } else if (role === "ENGINEER") {
      const specialization =
        formData.get("specialization")?.toString() || "DESIGNER";
      await db.engineerProfile.create({
        data: {
          userId: user.id,
          fullName,
          fullNameAr: fullNameAr || null,
          legalName: fullName,
          legalNameAr: fullNameAr || null,
          phone: phone || null,
          companyName: publicName || null,
          verificationStatus: "DRAFT",
          specialization,
          website: website || null,
        },
      });
    }

    // Send verification email (non-blocking)
    const verificationToken = crypto.randomUUID();
    sendVerificationEmail(email.toLowerCase(), verificationToken, "ar").catch(
      (e) =>
        logger.error(
          "Email send failed",
          { action: "register", entityType: "email" },
          e as Error,
        ),
    );

    // Auto-login after registration — redirect to profile page to fill required info
    await createSession(user.id, user.role);

    logger.auth("register", user.id, true);
    logger.api("POST", "/auth/register", 200, user.id, Date.now() - startTime);

    return { success: true, redirectTo: "/dashboard/profile" };
  } catch (error: any) {
    logger.error(
      "Register failed",
      { action: "register", entityType: "auth" },
      error,
    );

    // Return specific error messages for debugging
    if (error?.code === "P2002") {
      // Prisma unique constraint violation
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }
    if (error?.message?.includes("password")) {
      return { success: false, error: "Password does not meet requirements" };
    }
    if (error?.message?.includes("validation")) {
      return { success: false, error: `Validation error: ${error.message}` };
    }
    if (error?.message?.includes("create")) {
      return {
        success: false,
        error: "Failed to create account. Please try again.",
      };
    }

    // Log the actual error for server-side debugging
    console.error("[registerAction] Detailed error:", {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack?.split("\n").slice(0, 3).join("\n"),
    });

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

// ============================================================================
// Login Action
// ============================================================================

export async function loginAction(formData: FormData): Promise<AuthResult> {
  const startTime = Date.now();
  try {
    // Rate limit: 5 login attempts per minute per IP
    const ip = "server-action"; // Server actions dont expose IP easily
    const rl = rateLimits.auth(ip);
    if (!rl.allowed) {
      logger.security("rate_limit_exceeded", undefined, {
        action: "login",
        ip,
      });
      return {
        success: false,
        error: "Too many login attempts. Please try again later.",
      };
    }
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Validate input
    const result = loginSchema.safeParse(rawData);
    if (!result.success) {
      const firstError = result.error.issues[0];
      return { success: false, error: firstError.message };
    }

    const { email, password } = result.data;

    // Find user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    // Check status — allow SUSPENDED users to log in (they see pending approval message)
    if (user.status === "DEACTIVATED") {
      return { success: false, error: "Your account has been deactivated" };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      logger.security("login_failed", undefined, {
        email: email.toLowerCase(),
        reason: "invalid_password",
      });
      return { success: false, error: "Invalid email or password" };
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session
    await createSession(user.id, user.role);

    // Determine redirect
    let redirectTo = user.role === "ADMIN" ? "/admin" : "/dashboard";

    if (user.role !== "ADMIN") {
      if (user.role === "OWNER") {
        const profile = await db.ownerProfile.findUnique({
          where: { userId: user.id },
          select: { profileComplete: true },
        });
        if (!profile?.profileComplete) redirectTo = "/dashboard/profile";
      } else if (user.role === "CONTRACTOR") {
        const profile = await db.contractorProfile.findUnique({
          where: { userId: user.id },
          select: { profileComplete: true },
        });
        if (!profile?.profileComplete) redirectTo = "/dashboard/profile";
      } else if (user.role === "ENGINEER") {
        const profile = await db.engineerProfile.findUnique({
          where: { userId: user.id },
          select: { profileComplete: true },
        });
        if (!profile?.profileComplete) redirectTo = "/dashboard/profile";
      }
    }

    logger.auth("login", user.id, true);
    logger.api("POST", "/auth/login", 200, user.id, Date.now() - startTime);

    return { success: true, redirectTo };
  } catch (error: any) {
    logger.error(
      "Login failed",
      { action: "login", entityType: "auth" },
      error,
    );
    return { success: false, error: "Login failed. Please try again." };
  }
}

// ============================================================================
// Logout Action
// ============================================================================

export async function logoutAction(): Promise<AuthResult> {
  try {
    const user = await getCurrentUser();
    await deleteSession();
    logger.auth("logout", user?.id, true);
    return { success: true, redirectTo: "/" };
  } catch (error) {
    logger.error(
      "Logout failed",
      { action: "logout", entityType: "auth" },
      error as Error,
    );
    return { success: false, error: "Failed to log out" };
  }
}
