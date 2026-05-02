// ============================================================================
// CSRF Protection — Token-based CSRF protection for API routes
// ============================================================================

import { cookies } from "next/headers";
import { createHmac, randomBytes } from "crypto";
import { logger } from "./logger";
import { isPublicUrlHttps } from "./https-public-url";

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.AUTH_SECRET || "csrf-secret-change-in-production";
const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a CSRF token
 * Creates a random token and signs it with HMAC
 */
export function generateCsrfToken(): string {
  const random = randomBytes(32).toString("hex");
  const signature = createHmac("sha256", CSRF_SECRET)
    .update(random)
    .digest("hex");
  
  return `${random}.${signature}`;
}

/**
 * Verify a CSRF token
 * Checks if the token signature is valid
 */
export function verifyCsrfToken(token: string): boolean {
  try {
    const [random, signature] = token.split(".");
    if (!random || !signature) return false;
    
    const expectedSignature = createHmac("sha256", CSRF_SECRET)
      .update(random)
      .digest("hex");
    
    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(signature, expectedSignature);
  } catch {
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Set CSRF token in response cookies
 * Call this in server components or API routes that render forms
 */
export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();
  
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by client JS to send in header
    // Previous: secure: process.env.NODE_ENV === "production",
    // Same rule as auth-token: Secure only over HTTPS (see https-public-url.ts).
    secure: process.env.NODE_ENV === "production" && isPublicUrlHttps(),
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
  
  return token;
}

/**
 * Verify CSRF token from request
 * Checks both header and body for the token
 */
export async function verifyCsrfRequest(request: Request): Promise<boolean> {
  try {
    // Get token from cookie
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
    
    if (!cookieToken) {
      logger.security("csrf_missing_cookie");
      return false;
    }
    
    // Get token from header or body
    const headerToken = request.headers.get(CSRF_HEADER_NAME);
    
    // Try to get from body if not in header
    let bodyToken: string | null = null;
    try {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const body = await request.clone().json();
        bodyToken = body._csrf || body.csrfToken;
      } else if (contentType.includes("form")) {
        const formData = await request.clone().formData();
        bodyToken = (formData.get("_csrf") || formData.get("csrfToken")) as string;
      }
    } catch {
      // Body parsing failed, continue with header check
    }
    
    const requestToken = headerToken || bodyToken;
    
    if (!requestToken) {
      logger.security("csrf_missing_token");
      return false;
    }
    
    // Verify tokens match
    if (cookieToken !== requestToken) {
      logger.security("csrf_token_mismatch");
      return false;
    }
    
    // Verify token signature
    if (!verifyCsrfToken(requestToken)) {
      logger.security("csrf_invalid_signature");
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error("CSRF verification error", {}, error as Error);
    return false;
  }
}

/**
 * CSRF protection middleware for API routes
 * Use this in your API route handlers
 */
export function withCsrfProtection(
  handler: (request: Request) => Promise<Response>
) {
  return async (request: Request): Promise<Response> => {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
      return handler(request);
    }
    
    const isValid = await verifyCsrfRequest(request);
    
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "CSRF token validation failed" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    return handler(request);
  };
}

/**
 * Get CSRF token for client-side use
 * Returns the token from cookies
 */
export async function getCsrfToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(CSRF_COOKIE_NAME)?.value || null;
  } catch {
    return null;
  }
}

// Export constants for client use
export const CSRF = {
  COOKIE_NAME: CSRF_COOKIE_NAME,
  HEADER_NAME: CSRF_HEADER_NAME,
};