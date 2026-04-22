# LineX-Forsa Security Audit Report

**Date:** 2026-03-18 | **Auditor:** Automated White-Hat | **Scope:** Full codebase + live site | **Commit:** eef022b (post-fix)

---

## Executive Summary

| Severity | Count | Fixed |
|----------|-------|-------|
| CRITICAL | 2 | 2 ✅ |
| HIGH | 4 | 4 ✅ |
| MEDIUM | 5 | 1 partial |
| LOW | 4 | — |
| INFO | 3 | — |

---

## CRITICAL Findings

### C1. Email Verification Token Not Validated ✅ FIXED
- **Severity:** CRITICAL
- **File:** `src/app/api/auth/verify-email/route.ts`
- **Description:** The endpoint accepted ANY token value. An attacker could verify any email by hitting `/api/auth/verify-email?token=anything&email=victim@example.com`.
- **Impact:** Account takeover — attacker verifies emails they don't own.
- **Fix:** Replaced with HMAC-SHA256 token validation using `AUTH_SECRET`. Token is now generated in `src/lib/email.ts` and validated with `crypto.timingSafeEqual`.

### C2. Unauthenticated AI Agent API ✅ FIXED
- **Severity:** CRITICAL
- **File:** `src/app/api/agents/chat/route.ts`
- **Description:** The `/api/agents/chat` endpoint had no authentication check. Anyone could call all 11 AI agents (OpenAI-powered) without being logged in.
- **Impact:** Unlimited OpenAI API credit drain; potential prompt injection; abuse of admin-intelligence agent by unauthenticated users.
- **Fix:** Added `getCurrentUser()` check. Returns 401 if not authenticated. Rate limiting now uses `user.id` instead of IP.

---

## HIGH Findings

### H1. Login API Route Missing Rate Limiting ✅ FIXED
- **Severity:** HIGH
- **File:** `src/app/api/auth/login/route.ts`
- **Description:** The `/api/auth/login` POST route had zero rate limiting. The server action (`loginAction`) had rate limiting, but the API route was unprotected — allowing brute force via direct API calls.
- **Impact:** Password brute-forcing.
- **Fix:** Added `rateLimits.auth(ip)` check (5 attempts/min/IP).

### H2. IDOR in markCompleteAction ✅ FIXED
- **Severity:** HIGH
- **File:** `src/app/[locale]/dashboard/execution/[id]/actions.ts`
- **Description:** `markCompleteAction` accepted any `projectId` from the form without verifying the caller owns the project. Any authenticated user could mark any project as COMPLETED.
- **Impact:** Data manipulation — projects completed without owner consent.
- **Fix:** Added ownership verification: checks `project.owner.userId === user.id || user.role === "ADMIN"`.

### H3. Error Message Information Leakage ✅ FIXED
- **Severity:** HIGH
- **Files:** `auth/actions.ts`, `api/profile/route.ts`, `api/agents/chat/route.ts`, `api/payment/callback/route.ts`
- **Description:** Multiple endpoints returned `error?.message` directly to clients, exposing internal error details (stack traces, DB errors, library internals).
- **Impact:** Attackers gain knowledge of internal architecture, library versions, DB schema.
- **Fix:** Replaced with generic error messages.

### H4. Missing CSP Header ✅ FIXED
- **Severity:** HIGH
- **File:** `next.config.ts`
- **Description:** No Content-Security-Policy header was set. XSS payloads could load external scripts.
- **Impact:** Increased XSS attack surface.
- **Fix:** Added CSP header: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; frame-ancestors 'none'`. Also added `preload` to HSTS.

---

## MEDIUM Findings

### M1. In-Memory Rate Limiting (Serverless-Incompatible)
- **Severity:** MEDIUM
- **File:** `src/lib/rate-limit.ts`
- **Description:** Rate limiting uses an in-memory `Map`. On Vercel's serverless, each function invocation may get a fresh memory space, rendering rate limits ineffective across cold starts.
- **Impact:** Rate limiting may not work in production.
- **Recommendation:** Use Redis (Upstash) or Vercel KV for distributed rate limiting. Consider `@upstash/ratelimit`.

### M2. Weak JWT Secret Fallback
- **Severity:** MEDIUM
- **File:** `src/lib/auth.ts` line 7
- **Description:** `AUTH_SECRET` falls back to `"dev-secret-change-in-production"`. If the env var is missing in production, all JWTs are signed with a known secret.
- **Impact:** Token forgery if env var is not set.
- **Recommendation:** Throw an error at startup if `AUTH_SECRET` is not set in production. Add to deployment checklist.

### M3. No Authorization on sendWorkspaceMessage
- **Severity:** MEDIUM
- **File:** `src/app/[locale]/dashboard/execution/[id]/actions.ts`
- **Description:** `sendWorkspaceMessage` accepts `receiverId` and `projectId` from form data without verifying the caller is a participant. Any authenticated user can send messages as themselves to any user on any project.
- **Impact:** Spam, social engineering, impersonation.
- **Recommendation:** Verify caller is owner or contractor on the project before allowing messages.

### M4. Admin Client Pages Without Server-Side Auth Guard
- **Severity:** MEDIUM
- **Files:** `src/app/[locale]/admin/ai-hub/page.tsx`, `src/app/[locale]/admin/marketing/page.tsx`
- **Description:** These are `"use client"` components with no server-side auth check. The AI Hub and Marketing pages are accessible to any user who navigates directly. They call `/api/agents/chat` (now auth-gated) but still render admin UI to non-admins.
- **Impact:** UI exposure; non-admins see admin interface.
- **Recommendation:** Wrap in a server component that checks `requireRole(["ADMIN"])` before rendering the client component.

### M5. Payment Callback No Webhook Signature Verification
- **Severity:** MEDIUM
- **File:** `src/app/api/payment/callback/route.ts`
- **Description:** The payment callback trusts any POST to `/api/payment/callback` and verifies via API call to DineroPay. There's no webhook signature validation, so a forged callback could trigger verification checks and race conditions.
- **Impact:** Potential payment bypass if DineroPay API is spoofed or a race condition is exploited.
- **Recommendation:** Implement DineroPay webhook signature verification (HMAC). Add idempotency check to prevent duplicate processing.

---

## LOW Findings

### L1. Password Policy Missing Special Character Requirement
- **Severity:** LOW
- **File:** `src/lib/validations/auth.ts`
- **Description:** Password requires 8+ chars, uppercase, and number — but no special character. OWASP recommends broader complexity.
- **Recommendation:** Add `.regex(/[!@#$%^&*]/, "Must contain a special character")`.

### L2. JWT Algorithm Not Explicitly Set
- **Severity:** LOW
- **File:** `src/lib/auth.ts`
- **Description:** `jwt.sign()` uses default HS256. While secure, explicitly setting `{ algorithm: "HS256" }` prevents algorithm confusion attacks.
- **Recommendation:** Add `algorithm: "HS256"` to `jwt.sign()` and `jwt.verify()` options.

### L3. Supabase Anon Key in Client Bundle
- **Severity:** LOW
- **File:** `src/lib/storage.ts`
- **Description:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` is exposed to the client (by design for Supabase). Ensure RLS policies are properly configured on Supabase storage bucket.
- **Recommendation:** Verify Supabase storage RLS restricts uploads to authenticated users only.

### L4. NEXT_LOCALE Cookie Missing Secure Flag
- **Severity:** LOW
- **Description:** Live site sets `NEXT_LOCALE=ar; Path=/; SameSite=lax` without `Secure` flag.
- **Recommendation:** This is a non-sensitive cookie, but adding `Secure` is best practice. Controlled by next-intl middleware.

---

## INFO Findings

### I1. Good: SQL Injection Prevention
- **Description:** Prisma ORM used throughout — parameterized queries by default. No raw SQL found. ✅

### I2. Good: XSS via React
- **Description:** React/Next.js auto-escapes JSX output. No `dangerouslySetInnerHTML` found in user-facing code. Project titles/descriptions are escaped by default. ✅

### I3. Good: File Upload Security
- **Description:** `src/lib/storage.ts` validates file type (allowlist) and size (10MB max). Uses Supabase storage with randomized filenames. No path traversal risk. ✅

---

## Security Posture Summary

| Category | Grade | Notes |
|----------|-------|-------|
| Authentication | B+ | bcrypt-12, JWT, HttpOnly/Secure/SameSite cookies. Fix: hardcode HS256, enforce AUTH_SECRET. |
| Authorization | B | RBAC on most routes. Fix: messaging IDOR, admin client pages. |
| Input Validation | A- | Zod schemas, Prisma ORM, React escaping. Solid. |
| API Security | B | Rate limiting exists but in-memory only. Auth now on all sensitive routes. |
| Data Protection | B+ | No PII leakage in responses. bcrypt-12. Env vars in .gitignore. |
| File Upload | A | Type allowlist, 10MB limit, randomized names. |
| Infrastructure | A- | HSTS, X-Frame-Options DENY, CSP added, nosniff. Vercel handles HTTPS. |

**Overall: B+** — Fundamentals are solid. The critical/high fixes have been applied and pushed.
