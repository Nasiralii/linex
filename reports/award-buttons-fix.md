# Award & Shortlist Buttons — Implementation Report

**Commit:** `43b9144`  
**Date:** 2026-03-18  
**File changed:** `src/app/[locale]/marketplace/[id]/page.tsx` (+24 lines)

## What was done

Added **Shortlist** and **Award Project** buttons to each bid card on the marketplace project detail page, plus a **Compare Bids** link.

### Changes

1. **Import** — Added `awardProjectAction` and `shortlistBidAction` from `../actions` (both already existed in `actions.ts`)

2. **Shortlist button** — Calls `shortlistBidAction(bid.id)`. Hidden if bid is already `SHORTLISTED`. Updates bid status to `SHORTLISTED`, notifies contractor, respects max 3 shortlist limit.

3. **Award Project button** — Calls `awardProjectAction(project.id, bid.id)`. Creates award record, updates project status to `AWARDED`, rejects other bids, notifies winner, creates contract, sends email, charges platform fee.

4. **Visibility rules:**
   - Only visible when `isOwner && project.status === "BIDDING"`
   - Hidden on bids already `AWARDED`
   - Shortlist button hidden on bids already `SHORTLISTED`

5. **Compare Bids link** — Shown below bid list when owner has 2+ bids. Links to `/dashboard/bids/compare`.

6. **i18n** — Full Arabic/English support:
   - "Shortlist" / "قائمة مختصرة"
   - "Award Project" / "ترسية المشروع"
   - "Compare Bids" / "مقارنة العروض"

7. **Type fix** — Wrapped action calls in `async () => { "use server"; await action(); }` to satisfy form `action` prop's `void` return type (the server actions return `{ success, error }` objects).

### No other files modified
All logic already existed in `actions.ts`. This was a UI-only change.
