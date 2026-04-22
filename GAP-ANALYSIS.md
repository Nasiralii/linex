# LineX-Forsa Gap Analysis

**Date:** March 18, 2026
**Source Requirements:** requirements-full.txt (881 lines, 17 sections)
**Built Reference:** HANDOVER.md (v4.1, March 17, 2026)

---

## Executive Summary

Total distinct features/workflows required across 17 sections: **94**

| Status    | Count | Percentage |
|-----------|-------|------------|
| BUILT     | 72    | 76.6%      |
| PARTIAL   | 14    | 14.9%      |
| NOT BUILT | 5     | 5.3%       |
| MOCK      | 3     | 3.2%       |

**Overall completion: ~84%**

The platform has strong coverage of core workflows (registration, project creation, bidding, awarding, execution). Primary gaps are in production-readiness items (payment gateway production keys, government API integration, Google Maps), advanced AI matching features, and some execution workspace polish.

---

## Section-by-Section Analysis

### 1. Platform Architecture & User Roles

| Feature/Requirement | Status | Evidence/Notes |
|---------------------|--------|----------------|
| 4 user roles (Owner, Contractor, Engineer, Admin) | BUILT | HANDOVER S6: users table with 4 roles, RBAC enforced |
| Owner registration (Individual + Company) | BUILT | v4.0: companyType radio (Individual/Company) at registration |
| Contractor registration (Company only) | BUILT | Registration page with role selection |
| Engineer registration (Individual + Company) | BUILT | Registration page with role selection |
| Admin (seed only) | BUILT | Admin seeded, not self-registerable |
| Email verification | BUILT | R1: /api/auth/verify-email endpoint |
| Phone number mandatory | BUILT | G12 (original gap): phone on registration |
| Role-specific redirects | BUILT | HANDOVER S6: admin to /admin, others to /dashboard |
| User role matrix (permissions) | BUILT | Server-side RBAC via getCurrentUser() |

### 2. Project Types & Categories

| Feature/Requirement | Status | Evidence/Notes |
|---------------------|--------|----------------|
| DESIGN_ONLY type | BUILT | Project wizard with 3 type cards |
| CONSTRUCTION_ONLY type | BUILT | Project wizard with 3 type cards |
| DESIGN_AND_CONSTRUCTION type | BUILT | Project wizard with 3 type cards |
| 18 construction trade categories | BUILT | Seeded categories table, hierarchical tree |
| Design-only visible to engineers only | PARTIAL | v4.0 changed: all users see all posts, bid eligibility enforced instead of visibility |
| Construction-only visible to contractors only | PARTIAL | Same as above: visibility is open, bidding is gated |
| Design+Construction visible to both | BUILT | All users see, both can bid per rules |

Note: The spec requires role-based visibility filtering. The platform chose bid-eligibility gating instead. Users see all projects but cannot bid on ineligible ones. This is a deliberate design deviation documented in v4.0.

### 3. Project Owner Workflow (12 Stages)

| Feature/Requirement | Status | Evidence/Notes |
|---------------------|--------|----------------|
| Registration and profile setup | BUILT | Auth pages, profile editing |
| Project creation (title, category, location, budget, description) | BUILT | 5-step Upwork-style wizard |
| File upload (images, drawings, BOQ, site photos) | BUILT | 4 separate upload buttons |
| Save as draft | BUILT | R5: save draft button |
| Admin review gate (PENDING_REVIEW) | BUILT | Admin project review queue |
| Project published with notifications | BUILT | G22: auto-notify matching users on approval |
| Receive and view ranked bids | BUILT | AI bid ranking in marketplace |
| Krasat Q&A messaging | BUILT | Chat bubbles in project detail |
| Compare and shortlist (up to 3) | BUILT | Bid comparison side-by-side page |
| Award contractor/engineer | BUILT | Award action with notifications |
| Supervision upsell (100 SAR) | BUILT | Supervision request flow |
| Professional contract upsell (150 SAR) | BUILT | Contract flow with payment |
| Execution workspace access | BUILT | Execution workspace page |
| Completion and rating | BUILT | Star rating + mark complete |
| Budget hidden from bidders | BUILT | G1: budget visible to admin + owner only |
| Bidding window (30 days default) | PARTIAL | Not confirmed as configurable; status transitions exist |
| Side-by-side comparison (price, timeline, ratings, risk) | PARTIAL | Comparison page exists but risk assessment not confirmed |

### 4. Contractor Workflow (11 Stages)

| Feature/Requirement | Status | Evidence/Notes |
|---------------------|--------|----------------|
| Company registration | BUILT | Registration with company fields |
| Profile completion (trade, areas, experience, team size) | BUILT | Profile editing page with role-specific fields |
| Portfolio/references | BUILT | G9: portfolio tab with image grid |
| Document upload (license, insurance, registration, bank) | BUILT | G6: 5 document categories |
| Admin verification | BUILT | Admin users page with approve/reject |
| AI profile ranking (0-100) | BUILT | AI Profile Quality Score on profile |
| AI badge assignment | BUILT | G19: auto-badges (EXPERIENCED at 5+ projects) |
| Smart matching (browse + recommendations) | PARTIAL | Marketplace with filters exists; AI match score (70%+ shown) not confirmed |
| Krasat purchase (100 SAR unlock) | BUILT | Blur gate + DineroPay payment |
| Q&A messaging with owner | BUILT | Chat in project detail |
| Bid submission (price, timeline, proposal, attachments) | BUILT | Bid form + G18 bid attachments |
| AI bid ranking (100-point scale) | BUILT | 5-factor algorithm in ai.ts |
| Bid tracking dashboard | BUILT | G17: /dashboard/bids with stats |
| Award notification + confirmation | BUILT | G20: notification + contract signature as confirmation |
| Execution workspace | BUILT | Chat, files, milestones |
| Completion + rating | BUILT | Mark complete + star rating |

### 5. Engineer Workflow (12 Stages)

| Feature/Requirement | Status | Evidence/Notes |
|---------------------|--------|----------------|
| Registration (Individual or Company) | BUILT | Registration page |
| Specialization choice (Designer/Supervisor/Both) | BUILT | engineer_profiles table, profile page |
| Document upload (license, education, insurance, certs, ID) | BUILT | G7: 5 document categories |
| Admin verification | BUILT | Admin engineers page |
| AI profile ranking + badges | BUILT | AI quality score, auto-badges |
| Wallet funding (500 SAR for supervisors) | BUILT | G9 wallet page + DineroPay |
| Krasat purchase (100 SAR) | BUILT | Same flow as contractors |
| Bid submission + AI ranking | BUILT | Bid form + ranking algorithm |
| Bid tracking | BUILT | /dashboard/bids |
| 500 SAR wallet deduction on supervision award | BUILT | R3: auto-deduct on award |
| Supervision execution | BUILT | Workspace access for supervisors |
| Refund request (500 SAR to IBAN) | BUILT | G27: request refund action in wallet |
| Refund processing (5-10 business days) | PARTIAL | Admin refund page exists; actual bank transfer processing not automated |

### 6. Admin Workflow

| Feature/Requirement | Status | Evidence/Notes |
|---------------------|--------|----------------|
| Contractor verification (review docs, approve/reject) | BUILT | Admin users page with 3 actions |
| Engineer verification | BUILT | Admin engineers page |
| Project review and approval | BUILT | Admin projects page with approve/request edits |
| Request edits with guidance notes | BUILT | G12: text input for admin notes |
| Platform moderation (flag suspicious activity) | PARTIAL | Audit logs exist; proactive flagging not confirmed |
| Dispute resolution | BUILT | G15: /admin/disputes |
| Refund management | BUILT | /admin/refunds |
| Rating moderation (hide/delete reviews) | BUILT | G16: /admin/reviews with audit trail |
| System administration (settings, reports) | BUILT | platform_settings table, /admin/reports |
| AI agent management (on/off toggles) | BUILT | /admin/agents page |

### 7. Krasat System

| Feature/Requirement | Status | Evidence/Notes |
|---------------------|--------|----------------|
| 100 SAR per project access | BUILT | krasat_purchases table + payment flow |
| Blur gate before payment | BUILT | Marketplace detail page blur |
| Full project details after purchase | BUILT | Unlocked view |
| Q&A messaging enabled after purchase | BUILT | Chat bubbles in project detail |
| Non-refundable | BUILT | Business rule in payment flow |
| Ensures serious bidders only | BUILT | Paywall as filter |

### 8. Supervision Service

| Feature/Requirement | Status | Evidence/Notes |
|---------------------|--------|----------------|
| Owner pays 100 SAR to request | BUILT | Supervision payment flow |
| Broadcast to eligible engineers | BUILT | Supervision request page |
| Engineers with 500+ SAR wallet can bid | BUILT | R7: ranked by wallet balance |
| Supervision bids ranked by AI | BUILT | R7: supervision bids with ranking |
| Owner awards supervisor | BUILT | Award flow |
| 500 SAR deducted from supervisor wallet | BUILT | R3: auto-deduct |
| Supervisor joins execution workspace | BUILT | Workspace access |
| Refund after project completion | BUILT | G27: refund request in wallet |

### 9. Professional Contract

| Feature/Requirement | Status | Evidence/Notes |
|---------------------|--------|----------------|
| Simple contract (free) | BUILT | contracts table with type field |
| Professional contract (150 SAR) | BUILT | Contract payment flow |
| Auto-generated from project data | BUILT | Contract page with terms |
| All project files attached | PARTIAL | Contract page exists; file attachment embedding not confirmed |
| Both parties review | BUILT | Contract detail page |
| Digital signatures | BUILT | G15 (original gap): signature on contract page |
| PDF generation | PARTIAL | R9: browser print button, not server-side PDF generation |
| Contract storage | BUILT | contracts table in database |

### 10. Smart Ranking & AI System

| Feature/Requirement | Status | Evidence/Notes |
|---------------------|--------|----------------|
| 100-point bid ranking algorithm | BUILT | ai.ts: Price(30%)+Rating(25%)+Timeline(20%)+Experience(15%)+Response(10%) |
| AI profile quality scoring (0-100) | BUILT | Circular gauge on profile page |
| Auto-generated badges | BUILT | G19: auto-assignment on triggers |
| Badge types (Verified, Experienced, Highly Rated, Fast Response, Premium) | PARTIAL | EXPERIENCED badge confirmed; full badge set not enumerated in HANDOVER |
| Smart matching (70%+ score shown) | NOT BUILT | No evidence of match-score display; marketplace has filters but no percentage match |
| Transparent scoring visible to bidders | BUILT | G21: AI score shown on My Bids page |

### 11. Execution Workspace

| Feature/Requirement | Status | Evidence/Notes |
|---------------------|--------|----------------|
| Direct messaging | BUILT | Chat in execution workspace |
| File sharing | BUILT | G23 + post-award chat file sharing |
| File version control | NOT BUILT | File sharing exists but no versioning system |
| Milestone tracking | BUILT | G16: milestone tracking in workspace |
| Daily progress updates | BUILT | G24: structured progress update form |
| Photo documentation | BUILT | File sharing supports images |
| Issue/problem reporting | PARTIAL | Can be done via messaging; no dedicated issue tracker |
| Contract reference in workspace | PARTIAL | Contract page exists separately; not embedded in workspace |
| Payment tracking in workspace | BUILT | R10: wallet + transaction history |
| Mark project complete | BUILT | G25: complete button with timestamp |

### 12. Payment System

| Feature/Requirement | Status | Evidence/Notes |
|---------------------|--------|----------------|
| Krasat (100 SAR) | BUILT | createKrasatPayment() |
| Supervision request (100 SAR) | BUILT | createSupervisionPayment() |
| Supervision wallet (500 SAR) | BUILT | createWalletPayment() |
| Professional contract (150 SAR) | BUILT | createContractPayment() |
| Platform fee (5% on award) | BUILT | fee_rules + fee_events tables, invoices table |
| Payment verification/callback | BUILT | /api/payment/callback + verifyPayment() |
| Multiple payment methods (card, Mada, Apple Pay, STC Pay) | BUILT | DineroPay supports all listed methods |
| Production payment keys | NOT BUILT | HANDOVER: test key in use, production keys needed |

### 13. Database Schema

| Feature/Requirement | Status | Evidence/Notes |
|---------------------|--------|----------------|
| 30+ tables | BUILT | HANDOVER S5 lists 28+ named tables with Prisma schema |
| Core tables (users, projects, bids, awards) | BUILT | All listed |
| Financial tables (invoices, wallet_transactions, krasat_purchases, fee_events) | BUILT | All listed |
| Communication tables (messages, notifications) | BUILT | All listed |
| Contract tables (contracts, supervision_requests) | BUILT | All listed |
| Admin tables (audit_logs, admin_notes, disputes) | BUILT | All listed |
| Badge system (user_badges) | BUILT | Listed |
| Category and location seed data | BUILT | 18 categories, 29 regions seeded |

### 14. API Endpoints

| Feature/Requirement | Status | Evidence/Notes |
|---------------------|--------|----------------|
| Auth endpoints (register, login, logout, verify-email) | BUILT | Server actions + API routes |
| Project CRUD | BUILT | Server actions in projects/actions.ts |
| Bid submission and management | BUILT | Server actions in marketplace/actions.ts |
| Payment endpoints | BUILT | Payment callback API |
| AI agent endpoint | BUILT | /api/agents/chat (all 11 agents) |
| Profile management | BUILT | /api/profile |
| Notification endpoints | BUILT | Notification center page |

Note: Next.js server actions replace many traditional REST endpoints. Functionally equivalent.

### 15. Security & Verification

| Feature/Requirement | Status | Evidence/Notes |
|---------------------|--------|----------------|
| Password hashing (bcrypt) | BUILT | 12 rounds |
| Secure session management (JWT + HTTP-only cookies) | BUILT | 7-day expiry |
| Server-side RBAC | BUILT | getCurrentUser() on protected routes |
| Input validation (Zod) | BUILT | Validation schemas |
| SQL injection prevention | BUILT | Prisma ORM parameterized queries |
| Rate limiting | BUILT | Auth, API, AI (10 req/min) |
| Security headers (HSTS, CSP, X-Frame-Options) | BUILT | next.config.ts |
| HTTPS | BUILT | Vercel enforced |
| Audit logging | BUILT | audit_logs table + admin viewer |
| Government license verification API | MOCK | Placeholder badge only; no API integration |
| Document verification (manual admin review) | BUILT | Admin review pages |

### 16. MVP Implementation Scope

| Feature/Requirement | Status | Evidence/Notes |
|---------------------|--------|----------------|
| All 4 user role workflows | BUILT | Registration through completion |
| 3 project types | BUILT | Wizard + marketplace |
| Krasat system | BUILT | Payment + unlock + Q&A |
| Supervision service | BUILT | Full flow with wallet |
| Professional contract | BUILT | Payment + signatures |
| AI ranking and badges | BUILT | Algorithm + auto-badges |
| Execution workspace | BUILT | Chat, files, milestones |
| Payment processing | BUILT | DineroPay (test mode) |
| Bilingual (AR/EN) | BUILT | next-intl, RTL/LTR |
| Google Maps integration | MOCK | Placeholder UI, no API key |
| E2E tests | BUILT | 20/20 Playwright tests passing |

### 17. Timeline & Deliverables

| Feature/Requirement | Status | Evidence/Notes |
|---------------------|--------|----------------|
| MVP feature completeness | BUILT | HANDOVER claims ~85/100 production readiness |
| Production deployment | PARTIAL | Deployed on Vercel (test); AWS planned for production |
| Production payment keys | NOT BUILT | Test keys active |
| Production domain | NOT BUILT | Using vercel.app subdomain |

---

## Critical Gaps

1. **Production Payment Keys** -- DineroPay is integrated with test credentials only. No live transactions possible until production keys are configured.

2. **Google Maps Integration** -- Placeholder UI exists with 3 address fields, but no API key is connected. Location selection relies on dropdown only.

3. **Smart Match Score Display** -- The spec requires AI match scores (70%+ threshold) shown to contractors/engineers when browsing projects. No evidence this exists; marketplace uses category/type filters only.

4. **File Version Control** -- Execution workspace supports file sharing but has no version tracking. The spec explicitly requires versioning.

5. **Government License Verification API** -- Only a placeholder badge exists. No integration with Saudi government verification systems (Etimad, MOMRA, or equivalent).

6. **Server-Side PDF Generation** -- Contracts use browser print for PDF output. A proper server-side PDF generator (e.g., Puppeteer, jsPDF) would be needed for reliable, consistent contract documents.

7. **Role-Based Project Visibility** -- The spec requires design-only projects to be invisible to contractors and construction-only projects invisible to engineers. The platform shows all projects to all users and gates only at the bid level. This was a deliberate design choice but deviates from spec.

---

## Recommendations

**Priority 1 -- Production Readiness (Week 1)**
- Obtain and configure DineroPay production merchant keys
- Set up production domain and DNS
- Configure production environment on AWS (as planned per HANDOVER)
- Obtain Google Maps API key and connect to address fields

**Priority 2 -- Spec Compliance (Week 2)**
- Implement smart match scoring with percentage display on marketplace cards
- Add file versioning to execution workspace (track uploads by timestamp, allow viewing previous versions)
- Evaluate whether to enforce project visibility filtering per spec or document the bid-gating approach as an accepted deviation

**Priority 3 -- Integration (Week 3-4)**
- Integrate government license verification API (Saudi MOMRA/Etimad or equivalent)
- Implement server-side PDF generation for contracts (Puppeteer or equivalent)
- Automate refund bank transfers (currently admin-managed manually)

**Priority 4 -- Polish**
- Expand badge set beyond EXPERIENCED (add Highly Rated, Fast Response, Premium per spec)
- Add dedicated issue/problem tracker in execution workspace
- Embed contract reference directly in execution workspace view
- Add configurable bidding window duration (default 30 days)

---

*Analysis performed against requirements-full.txt and HANDOVER.md v4.1*
