# Critical Fixes Report — LineX Forsa

**Date:** 2026-03-18  
**Commit:** `1f6e27c` → pushed to `master`  
**Author:** Tamer Abuhalaweh <tamer.abuhalaweh@gmail.com>

---

## Issue 1: `/api/auth/me` returns null with valid cookie

**Root Cause:** `getCurrentUser()` fails silently on Supabase cold starts — first DB query times out, returns null, user gets logged out.

**Fix:** Added `getUserWithRetry()` — retries up to 3 times with 1s delay between attempts. If all fail, returns null (401).

**File:** `src/app/api/auth/me/route.ts` (62 lines)

---

## Issue 2: `/api/agents/chat` returns "Unknown agent" for `agentKey=support`

**Root Cause:** The admin panel registers agents with `key: "customer_support"` but the API switch statement only handled `case "support"`. If any client sends `customer_support` (matching admin registry), it falls to the default `"Unknown agent"` branch.

**Fix:** Added `case "customer_support":` as an alias that falls through to the existing `case "support":` handler. Both keys now work.

**File:** `src/app/api/agents/chat/route.ts` (86 lines)

---

## Issue 3: `/api/payment/callback` returns 307 redirect

**Root Cause:** DineroPay sends users back via GET redirect with query params (`session_id`, `status`). The existing GET handler only read the `status` param to redirect — it didn't verify the payment server-side. This meant the wallet transaction was never recorded if DineroPay used GET instead of POST.

**Fix:** Enhanced GET handler to:
1. Extract `session_id` from URL params
2. If present, verify payment server-side (same logic as POST)
3. Record wallet transaction / purchase
4. Then redirect to wallet page with success/failed status
5. Falls back to status-only redirect if no session_id

**File:** `src/app/api/payment/callback/route.ts` (113 lines)

---

## Issue 4: Execution/contracts pages 404 on invalid IDs

**Root Cause:** When invalid/non-existent IDs hit `db.*.findUnique()`, Prisma throws on malformed IDs (not valid cuid), or returns null. The original code called `notFound()` which triggers Next.js's 404 page — unhelpful for users.

**Fix (Execution page):**
- Wrapped DB query in try/catch with friendly error UI
- If project not found or not awarded, shows bilingual "Project Not Found" message with back link
- File: `src/app/[locale]/dashboard/execution/[id]/page.tsx` (145 lines)

**Fix (Contracts page):**
- Same pattern: try/catch + friendly "Contract Not Found" message
- Added access denied UI instead of raw notFound()
- Extracted server actions (`upgradeToProContract`, `signContractAction`) into `actions.ts` to keep page under 150 lines
- Extracted `SignatureBox` as a helper component
- Files: `page.tsx` (140 lines), `actions.ts` (63 lines)

---

## Issue 5: Seed data for bid/award workflow testing

**Created:** `src/scripts/seed-test-data.ts` (98 lines)

**Seeds:**
| Entity | Details |
|--------|---------|
| Contractor | `test-contractor@test.com` / `Test@123456` — "Test Build LLC", verified |
| Owner | `owner@test.com` / `Test@123456` (reuses existing if present) |
| Project | "Test Bid/Award Workflow Project" — status: BIDDING, budget: 200-350K SAR |
| Bid | 280,000 SAR from Test Build LLC, status: SUBMITTED |
| Messages | 2 sample messages between contractor and owner |

**Run:** `npx tsx src/scripts/seed-test-data.ts`

---

## File Size Compliance

All modified files are under 150 lines:

| File | Lines |
|------|-------|
| `src/app/api/auth/me/route.ts` | 62 |
| `src/app/api/agents/chat/route.ts` | 86 |
| `src/app/api/payment/callback/route.ts` | 113 |
| `src/app/[locale]/dashboard/execution/[id]/page.tsx` | 145 |
| `src/app/[locale]/dashboard/contracts/[id]/page.tsx` | 140 |
| `src/app/[locale]/dashboard/contracts/[id]/actions.ts` | 63 |
| `src/scripts/seed-test-data.ts` | 98 |
