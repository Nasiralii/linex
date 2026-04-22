# PowerBI-Style Dashboard v2 — Build Report

**Date:** 2026-03-18  
**Commit:** `8d882d1`  
**Author:** Tamer Abuhalaweh  

---

## What Was Built

Complete replacement of the admin reports page with a PowerBI-style interactive analytics dashboard. 6 component files, all under 150 lines, all inline styles.

## Architecture

| File | Lines | Role |
|------|-------|------|
| `page.tsx` | 141 | Server component — 9 parallel Prisma queries, data transformation |
| `dashboard-client.tsx` | 87 | Client orchestrator — period selector, CSS keyframes, layout |
| `kpi-cards.tsx` | 125 | 4 hero KPI cards with animated count-up |
| `revenue-charts.tsx` | 128 | Monthly bar chart + donut (conic-gradient) |
| `pipeline-chart.tsx` | 116 | Project funnel + users-by-role stacked bars |
| `drill-down-table.tsx` | 126 | Expandable projects table + top performers |

## Features Delivered

### Row 1: Hero KPI Cards
- **Total Revenue (SAR)** — green gradient, hover tooltip shows Krasat/Supervision/Contracts/Fees breakdown
- **Active Projects** — gold gradient, counts Published+Bidding+Awarded+In Progress
- **Registered Users** — blue gradient, Owners+Contractors+Engineers
- **Avg Bid Score** — purple gradient, AI score average from all scored bids
- ✅ Animated count-up (IntersectionObserver + requestAnimationFrame with ease-out cubic)
- ✅ Hover: translateY(-4px) + box-shadow increase
- ✅ Icon with colored background circle
- ✅ Trend indicator (↑/↓ with green/red pill)

### Row 2: Revenue Charts
- **Left (60%):** Monthly Revenue bar chart — last 6 months
  - CSS div bars with green gradient
  - Animated growth from bottom (IntersectionObserver)
  - Hover tooltips with per-source breakdown (Krasat/Supervision/Contracts/Fees)
- **Right (40%):** Revenue Sources donut
  - CSS conic-gradient with 4 segments (green/blue/gold/purple)
  - Scale animation on hover
  - Legend with SAR amounts + hover highlighting

### Row 3: Pipeline + Users
- **Left (60%):** Project Status Pipeline
  - 6 stages: Draft → Published → Bidding → Awarded → In Progress → Completed
  - Proportional bar widths with green gradient (light → dark)
  - Click-to-expand shows project names as chips
  - Animated bar growth on scroll
- **Right (40%):** Users by Role — stacked vertical bars
  - 3 bars: Owners, Contractors, Engineers
  - Stacked verified (solid) vs pending (semi-transparent)
  - Hover tooltip with exact counts + percentages
  - Legend below

### Row 4: Drill-Down Tables
- **Recent Projects Table:**
  - Columns: Project, Owner, Type, Status, Bids, Award Amount
  - Sortable columns (click header to toggle asc/desc)
  - Status chips with distinct colors per status
  - Type badges (Design/Construction/Design+Build)
  - Click row → inline expansion showing bid details with AI scores, amounts, status
  - Award contractor name shown in expanded view
- **Top Performers:**
  - Gold 🥇 / Silver 🥈 / Bronze 🥉 medals for top 3
  - Rating stars, project count, review count
  - Click to toggle highlight

### Interactive Features
- ✅ All numbers count up from 0 on load (cubic ease-out)
- ✅ Cards lift on hover (translateY(-4px) + shadow)
- ✅ Charts animate on scroll into viewport (IntersectionObserver)
- ✅ Tooltips on hover with detailed breakdowns
- ✅ Click-to-expand on table rows & pipeline stages
- ✅ Smooth transitions (0.3s ease) everywhere
- ✅ Time period selector: This Month / This Quarter / This Year / All Time

### Data Layer
- 9 parallel Prisma queries with Promise.all
- Graceful try/catch fallback to 0/empty on any DB error
- Queries: projects (with bids/awards/owner), wallet transactions, bid aggregates, user counts by role, contractor verification status, top performers by rating

### Bilingual
- Full Arabic + English labels throughout
- RTL-aware text alignment (`isRtl ? "right" : "left"`)
- Arabic month names in charts

## Files Removed
- `project-analytics.tsx` — replaced by pipeline-chart.tsx
- `user-analytics.tsx` — merged into pipeline-chart.tsx  
- `project-table.tsx` — replaced by drill-down-table.tsx

## Design System Compliance
- Primary: `#0f6b57` (green) ✅
- Accent: `#c58b2a` (gold) ✅
- Background: `#f5f2ea` (sandstone) ✅
- Cards: white with subtle shadows ✅
- No Tailwind — all inline styles ✅

## Build Status
- ✅ TypeScript: 0 errors
- ✅ Next.js build: successful
- ✅ Pushed to master
