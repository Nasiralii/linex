# Gaps Fix Report — March 18, 2026

## Summary
All 3 gaps implemented, build passing, pushed to `master` (commit `025402c`).

---

## Gap 1: Smart Match Score Display ✅

**What:** Project cards in marketplace show "XX% Match" compatibility badge for logged-in contractors/engineers.

**Scoring algorithm** (`src/lib/match-score.ts`):
- **Category match (40%)**: User's registered categories vs project category. Exact match = 100, no match = 20, no prefs = 50 (neutral).
- **Location match (30%)**: User's service locations vs project location. Same logic.
- **Rating/budget tier (30%)**: Higher-rated users matched to higher-budget projects. 3 tiers (< 500K, 500K-2M, 2M+). Experience years add bonus.

**Files created/modified:**
| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/match-score.ts` | 83 | `calculateMatchScore()` utility |
| `src/lib/user-profile.ts` | 34 | `getUserMatchProfile()` — fetches contractor/engineer data for matching |
| `src/components/marketplace/match-badge.tsx` | 38 | Color-coded badge component (green ≥80%, gold ≥60%, gray below) |
| `src/components/marketplace/project-card.tsx` | 84 | Extracted card with match badge display |

**Behavior:**
- Contractors: score based on their categories + locations + rating
- Engineers: score based on city + rating + experience (no category matching since EngineerProfile has no categories relation)
- Owners/Admins/unauthenticated: no badge shown

---

## Gap 2: File Version Control in Execution Workspace ✅

**What:** Files in the execution workspace now show version badges and allow viewing previous versions.

**How it works:**
- Files are grouped by base name (stripping version suffixes like `(v2)`)
- Each group shows the latest version with a `v{N}` badge
- If multiple versions exist, a "View History" button appears showing count
- Clicking reveals all versions with: version badge, upload timestamp, uploader name, download link

**Files created:**
| File | Lines | Purpose |
|------|-------|---------|
| `src/components/execution/file-list.tsx` | 73 | Client component with version grouping + history panel |
| `src/components/execution/workspace-chat.tsx` | 84 | Extracted chat component |
| `src/components/execution/milestone-tracker.tsx` | 27 | Extracted milestone component |
| `src/app/[locale]/dashboard/execution/[id]/actions.ts` | 52 | Extracted server actions |

**Note:** The current `ProjectAttachment` schema tracks `createdAt` per file. Files with the same base name are automatically versioned. The uploader name is inferred from the current user's role (owner vs contractor company name).

---

## Gap 3: Role-Based Project Visibility ✅

**What:** Marketplace query filters projects by user role.

**Rules implemented** (in `marketplace/page.tsx`):
| User Role | Sees |
|-----------|------|
| ENGINEER | `DESIGN_ONLY` + `DESIGN_AND_CONSTRUCTION` |
| CONTRACTOR | `CONSTRUCTION_ONLY` + `DESIGN_AND_CONSTRUCTION` |
| OWNER | All project types |
| ADMIN | All project types |

**Implementation:** `getAllowedTypes(role)` function returns allowed project types, applied as `where.projectType = { in: [...] }` in Prisma query. Manual type filter (sidebar tabs) still overrides for owners/admins.

---

## Additional Fixes

### Prisma 7 TypeScript Build Error
- **Problem:** `node_modules/.prisma/client/default.d.ts` was generated as 0 bytes, causing `Module '@prisma/client' has no exported member 'UserRole'` errors.
- **Fix:** Added postinstall + build scripts to write `export * from "./index"` into that file after `prisma generate`.

### tsconfig.json
- Excluded `prisma/` directory from TypeScript compilation (seed files use different import style).

### Component Refactoring
All page files kept under 150 lines by extracting:
- `SidebarFilters` — marketplace category tree + type tabs
- `ProjectCard` — project listing card with match badge
- `MatchBadge` — match score display component
- `FileList` — versioned file viewer
- `WorkspaceChat` — execution workspace chat
- `MilestoneTracker` — milestone progress display

---

## Build Status
```
✓ Compiled successfully
✓ All routes generated
✓ Pushed to master (025402c)
```
