# PowerBI-Style Analytics Dashboard — Build Report

## Summary

Replaced the basic admin reports page at `/admin/reports` with a full PowerBI-style interactive analytics dashboard. The dashboard fetches live data from the database and presents it across 5 visual sections with animations, drill-down interactivity, and full bilingual (AR/EN) support.

**Route:** `src/app/[locale]/admin/reports/page.tsx`
**Date:** March 18, 2026

---

## Files Created/Modified

| File | Lines | Type | Purpose |
|------|-------|------|---------|
| `src/app/[locale]/admin/reports/page.tsx` | 124 | Server | Main page — data fetching, auth, layout |
| `src/app/[locale]/admin/reports/dashboard-client.tsx` | 42 | Client | Orchestrator — wires all sections together |
| `src/app/[locale]/admin/reports/kpi-cards.tsx` | 93 | Client | Row 1: Hero KPI cards with trend arrows |
| `src/app/[locale]/admin/reports/revenue-charts.tsx` | 81 | Client | Row 2: Revenue breakdown + monthly trend |
| `src/app/[locale]/admin/reports/user-analytics.tsx` | 115 | Client | Row 3: Users by role (donut), verification, registrations |
| `src/app/[locale]/admin/reports/project-analytics.tsx` | 105 | Client | Row 4: Projects by status/type + avg bids |
| `src/app/[locale]/admin/reports/project-table.tsx` | 147 | Client | Row 5: Click-to-expand drill-down table |
| `src/components/admin/chart-bar.tsx` | 108 | Client | Reusable CSS bar chart (horizontal + vertical) |

**All files ≤ 150 lines ✓**

---

## Dashboard Sections

### Row 1: Hero KPI Cards (4 gradient cards)
- **Total Revenue (SAR)** — with trend arrow + percentage
- **Active Projects** — count of Published/Bidding/Awarded/In Progress
- **Registered Users** — total non-admin users
- **Completion Rate %** — completed / total projects

Each card has:
- Gradient background matching LineX-Forsa palette
- Decorative circle overlay
- Trend badge (up/down arrow with label)
- Fade-slide-up animation on load (staggered)

### Row 2: Revenue Breakdown (2 chart cards)
- **Revenue by Source**: Stacked horizontal bar showing Krasat, Supervision, Contracts, Platform Fees with color-coded legend and SAR amounts
- **Monthly Revenue Trend**: 6-month vertical bar chart using the reusable `ChartBar` component

### Row 3: User Analytics (3 cards)
- **Users by Role**: CSS conic-gradient donut chart showing Owner/Contractor/Engineer distribution with percentages
- **Verification Status**: Progress bars for Verified (green), Pending (amber), Rejected (red)
- **New Registrations This Month**: Large number display with growth indicator

### Row 4: Project Analytics (3 cards)
- **Projects by Status**: Horizontal bar chart (Draft, Published, Bidding, Awarded, Completed)
- **Projects by Type**: Vertical bar chart (Design, Construction, Design+Construction)
- **Average Bids per Project**: Large metric display with competitive assessment badge

### Row 5: Drill-Down Table
- Clickable project rows: Name, Owner, Status, Bids Count, Award Amount, Date
- Click any row → expands to show all bid details (company, amount, status)
- Hover effects on rows
- Empty state messages

---

## Design System Compliance

| Element | Value |
|---------|-------|
| Primary | `#0f6b57` (construction green) |
| Accent | `#c58b2a` (brass/gold) |
| Background | `#f5f2ea` (sandstone) |
| Cards | White with `border-radius: 16px`, subtle shadow |
| Header | Dark gradient matching existing admin pages |
| Typography | Inherits IBM Plex Sans Arabic / Space Grotesk |
| Layout | Uses existing `container-app` class |
| Styling | Inline styles throughout (matches codebase convention) |

---

## Data Sources (Live from DB)

| Metric | Query |
|--------|-------|
| Projects | `db.project.findMany()` with owner, bids, award relations |
| Bid count | `db.bid.count()` |
| Award count | `db.award.count()` |
| Users by role | `db.user.count()` per role (OWNER, CONTRACTOR, ENGINEER) |
| Wallet transactions | `db.walletTransaction.findMany()` filtered by purpose |
| New users this month | `db.user.count()` with `createdAt >= monthStart` |
| Verification status | `db.contractorProfile.count()` per verification status |

All queries wrapped in `try/catch` with graceful "No data" fallbacks.

---

## Interactivity Features

- ✅ KPI trend arrows (up/down based on data)
- ✅ CSS bar charts (div widths based on %) — no external chart library
- ✅ CSS donut chart (conic-gradient) for user role distribution
- ✅ Animated card entrance (fadeSlideUp with staggered delays)
- ✅ Hover effects on table rows
- ✅ Click-to-expand drill-down on project rows
- ✅ All text bilingual (Arabic + English) via locale check

---

## Reusable Component

**`src/components/admin/chart-bar.tsx`** — CSS-only bar chart component:
- Supports `horizontal` and `vertical` orientations
- Configurable: height, suffix, show/hide values, animation toggle
- Animated bar transitions with staggered delays
- Color-per-bar support
- Can be reused across any admin page

---

## Architecture Notes

- **Server/Client split**: Page (server) handles auth + data fetching, passes serialized props to client components
- **No external dependencies**: All charts are pure CSS — no Chart.js, Recharts, or D3
- **Component decomposition**: 8 focused files, each under 150 lines
- **Type safety**: Full TypeScript interfaces for all component props
- **Error resilience**: All DB queries wrapped in try/catch, components handle empty/zero data gracefully
