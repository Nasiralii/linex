# Gaps Fix Report #2 — Gaps 4, 5, 6

**Date:** 2026-03-18  
**Stack:** Next.js 16 (App Router), Prisma 7, Tailwind CSS 4, jsPDF

---

## Gap 4: Server-Side PDF Generation for Contracts ✅

### Problem
Contract page used `window.print()` (browser-only, no real PDF). Needed server-side PDF generation with downloadable output.

### Solution
Used **jsPDF** (lightweight, Vercel-compatible) instead of puppeteer/headless Chrome.

### Files Created
| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/contract-pdf.ts` | 140 | HTML template generator + ContractData type interface |
| `src/lib/pdf-builder.ts` | 109 | jsPDF document builder (sections, signature boxes) |
| `src/app/api/contracts/[id]/pdf/route.ts` | 90 | API route: auth check, data fetch, PDF response |

### Files Modified
| File | Change |
|------|--------|
| `src/app/[locale]/dashboard/contracts/[id]/page.tsx` | Replaced `window.print()` button with `<a href="/api/contracts/{id}/pdf" download>` link |

### How it Works
1. `GET /api/contracts/{id}/pdf` validates user auth (owner/contractor/admin)
2. Fetches contract + project + parties from DB
3. Builds PDF using jsPDF with:
   - Green header with LineX Forsa branding
   - Project details (title, owner, contractor, amount)
   - Full contract terms section
   - Signature boxes with signed/pending status
   - Footer with platform info
4. Returns `application/pdf` with `Content-Disposition: attachment`

### Notes
- jsPDF is ~300KB, runs in Node.js — no headless browser needed
- HTML template (`contract-pdf.ts`) kept for potential future email/web preview use
- Contract button now styled as branded download link (not generic print button)

---

## Gap 5: Additional AI Badges ✅

### Problem
Only VERIFIED and EXPERIENCED badges existed. Spec requires 6 badge types with auto-assignment.

### Badge Types Implemented

| Badge | Criteria | Auto-assigned |
|-------|----------|---------------|
| `VERIFIED` | Admin verified profile | ✅ On verification |
| `EXPERIENCED` | 5+ completed projects (via awards) | ✅ On project award |
| `HIGHLY_RATED` | Average rating ≥ 4.5 (min 2 reviews) | ✅ On review submit |
| `FAST_RESPONSE` | Avg bid response < 24h (min 3 bids) | ✅ On bid submit |
| `PREMIUM` | 10+ completed projects | ✅ On project award |
| `NEW` | Joined within 30 days | ✅ Auto-expires |

### Files Created
| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/badges.ts` | 142 | Badge config, `evaluateUserBadges()`, `getUserBadges()` |
| `src/components/badge-display.tsx` | 44 | Reusable `<BadgeDisplay>` component (bilingual, themed) |

### Files Modified
| File | Change |
|------|--------|
| `src/app/[locale]/profile/[userId]/page.tsx` | Fetches DB badges, renders `<BadgeDisplay>` on public profiles |
| `src/app/[locale]/dashboard/profile/page.tsx` | Updated badge styles to support all 7 badge types (was 4) |
| `src/app/[locale]/marketplace/[id]/page.tsx` | Shows badges on bid cards; triggers `evaluateUserBadges` on bid/review submit |
| `src/app/[locale]/marketplace/actions.ts` | Triggers `evaluateUserBadges` after project award |
| `src/app/[locale]/admin/projects/page.tsx` | Replaced manual badge upsert with `evaluateUserBadges()` call |

### Badge Display
- Each badge has: emoji, English label, Arabic label, themed background/text colors
- `<BadgeDisplay>` component accepts `badges[]`, `locale`, `size` props
- Shows on: public profile headers, bid cards (for owner/admin view), dashboard profile

### Evaluation Triggers
`evaluateUserBadges(userId)` is called after:
- Bid submission (→ FAST_RESPONSE check)
- Review submission (→ HIGHLY_RATED check)
- Project award (→ EXPERIENCED, PREMIUM check)
- Project publish (→ admin auto-badge)

---

## Gap 6: Bidding Window Duration ✅

### Problem
No bidding deadline on projects. Bids could be submitted indefinitely.

### Schema
`biddingWindowEnd` field already existed in `Project` model (`bidding_window_end DateTime?`). Just needed to be populated and enforced.

### Implementation

| Feature | Status |
|---------|--------|
| Auto-set 30-day deadline on project publish | ✅ |
| Countdown on marketplace listing cards | ✅ |
| Countdown banner on project detail sidebar | ✅ |
| Prevent bids after deadline (server-side) | ✅ |
| Owner can extend deadline (7/14/30 days) | ✅ |

### Files Modified
| File | Change |
|------|--------|
| `src/app/[locale]/admin/projects/page.tsx` | Sets `biddingWindowEnd = now + 30 days` on approve |
| `src/app/[locale]/marketplace/page.tsx` | Shows ⏱ countdown on cards ("X days left" / "Bidding closed") |
| `src/app/[locale]/marketplace/[id]/page.tsx` | Timer banner in sidebar + extend deadline form (owner) + server-side bid block |

### Bidding Deadline UI
- **Marketplace cards**: Shows "X days left" (green if >5 days, amber if ≤5, red if expired)
- **Project detail**: Full banner with icon, days remaining, deadline date
- **Owner controls**: Dropdown to extend by 7/14/30 days with submit button
- **Server-side**: `submitBidAction` checks `biddingWindowEnd` before creating bid

---

## TypeScript Fixes ✅

| Fix | File |
|-----|------|
| Fixed `reviews.reduce((s, r) =>` implicit any | `marketplace/[id]/page.tsx` |
| Fixed `bids.filter(b =>` implicit any in badges.ts | `lib/badges.ts` |
| Fixed `Buffer` → `BodyInit` type for NextResponse | `api/contracts/[id]/pdf/route.ts` |

**Pre-existing errors remain** (Prisma client generation, other files' implicit `any`) — not introduced by this PR.

---

## Dependencies Added
- `jspdf@^2.5.2` — Lightweight PDF generation (works in Node.js, no headless browser)

## All New Files Under 150 Lines ✅
- `route.ts`: 90 lines
- `contract-pdf.ts`: 140 lines
- `pdf-builder.ts`: 109 lines  
- `badges.ts`: 142 lines
- `badge-display.tsx`: 44 lines
