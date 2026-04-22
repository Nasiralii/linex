# PowerBI v3 — Premium Dashboard Redesign

**Date:** 2026-03-18
**Commit:** 18d3996
**Status:** ✅ Deployed to master

## What Changed

### 1. KPI Cards (`kpi-cards.tsx` — 108 lines)
- **Gradient backgrounds**: Green→dark green, gold→dark gold, blue→dark blue, teal→dark teal
- **Large animated counters**: 2.5rem font, count-up from 0 with eased animation
- **Circular icon badges**: Semi-transparent white circle with backdrop-blur
- **Trend indicators**: ↑/↓ arrows with colored pill badges
- **Mini sparklines**: 7 CSS bars inside each card showing trend data
- **Hover effect**: translateY(-6px) + color-matching shadow glow
- **Staggered animation**: 100ms delay between cards using fadeSlideUp
- **Decorative elements**: Two transparent circles for depth

### 2. Revenue Charts (`revenue-charts.tsx` — 133 lines)
- **Glass-morphism cards**: rgba(255,255,255,0.95) + backdrop-blur(12px)
- **Gradient bars**: Green gradient with rounded tops, animated grow from bottom
- **Bar glow shadows**: Height-proportional glow on each bar
- **Hover state**: Bar brightens to lighter green + tooltip slides in with breakdown
- **Donut chart**: 180px with animated segment drawing (gray → colored transition)
- **Center text**: Total SAR in large bold text with inset shadow
- **Legend**: Colored dots with hover-highlight border effect
- **Section headers**: Gold accent bar (4px gradient line)

### 3. Pipeline Chart (`pipeline-chart.tsx` — 143 lines)
- **Visual funnel**: Each stage gets narrower (100% → 20% width)
- **Graduated gradient colors**: Light green (Draft) → Dark green (Completed)
- **Count circles**: White semi-transparent badges with percentage
- **Slide-in animation**: Stages animate from left with staggered delays
- **Accordion expand**: Smooth max-height transition with opacity fade
- **Users section**: Emoji icons, gradient bars, percentage labels

### 4. Drill-Down Table (`drill-down-table.tsx` — 139 lines)
- **Dark green header**: Primary gradient background with white text
- **Alternating rows**: White (#fff) / Light sand (#faf9f6)
- **Hover highlight**: Mint green (#f0fdf4) on hover
- **Status chips**: Colored badges for all status types
- **Row expansion**: Smooth gradient background (mint → sand) with bid detail cards
- **AI score badges**: Purple pill badges for bid scores
- **Top performers**: 🥇🥈🥉 emoji medals (large 1.75rem) for top 3
- **Performer cards**: Gradient backgrounds for podium positions

### 5. Dashboard Client (`dashboard-client.tsx` — 87 lines)
- **Pill period selector**: Glass-morphism container with gradient active state
- **Section headers**: Gold accent underline (gradient border-image)
- **Section component**: Reusable with bilingual title support
- **Page background** (page.tsx): Sandstone-to-white gradient

### 6. Page Background (`page.tsx`)
- Changed from flat `#f5f2ea` to `linear-gradient(180deg, #f5f2ea, #fafafa, #fff)`

## Design Tokens Used
| Token | Value |
|-------|-------|
| Primary gradient | `linear-gradient(135deg, #0f6b57, #0a4e41)` |
| Accent gradient | `linear-gradient(135deg, #c58b2a, #a06d1e)` |
| Blue gradient | `linear-gradient(135deg, #2563eb, #1d4ed8)` |
| Teal gradient | `linear-gradient(135deg, #0d9488, #0f766e)` |
| Glass | `rgba(255,255,255,0.95)` + `backdrop-blur(12px)` |
| Card shadow | `0 4px 24px rgba(0,0,0,0.08)` |
| Hover shadow | `0 8px 32px rgba(15,107,87,0.15)` |

## File Sizes
All files under 150 lines ✅
- `dashboard-client.tsx`: 87 lines
- `kpi-cards.tsx`: 108 lines
- `revenue-charts.tsx`: 133 lines
- `drill-down-table.tsx`: 139 lines
- `page.tsx`: 141 lines
- `pipeline-chart.tsx`: 143 lines

## Technical Notes
- No external chart libraries — pure CSS + inline styles
- Bilingual support (AR/EN) preserved throughout
- IntersectionObserver for scroll-triggered animations
- All data fetching remains in page.tsx (server component)
- Build passes cleanly with Next.js 16.1.6
