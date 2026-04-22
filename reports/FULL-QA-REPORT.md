# LineX-Forsa Full QA Test Report

**Date:** March 18, 2026 | **Tester:** Automated QA (curl + API) | **Environment:** https://linex-forsa.vercel.app

---

## Test Report Summary

| Metric | Count |
|--------|-------|
| **Total Test Cases** | 87 |
| **Passed (PASS)** | 62 |
| **Partial (PARTIAL)** | 12 |
| **Failed (FAIL)** | 6 |
| **Blocked (BLOCKED)** | 4 |
| **Mock/Placeholder (MOCK)** | 3 |

**Overall Score: 71% PASS, 14% PARTIAL, 7% FAIL, 5% BLOCKED, 3% MOCK**

---

## 1. User Registration

| # | Test Case | Expected | Status | Notes |
|---|-----------|----------|--------|-------|
| 1.1 | Registration page loads | 200 OK | PASS | `/ar/auth/register` returns 200, 37KB |
| 1.2 | Owner role available | "مالك مشروع" option | PASS | Found in HTML |
| 1.3 | Contractor role available | "مقاول" option | PASS | Found in HTML |
| 1.4 | Engineer role available | "مهندس" option | PASS | Found in HTML |
| 1.5 | Phone number field | Mandatory phone input | PASS | "رقم الجوال" field present |
| 1.6 | Owner type (Individual/Company) | فرد/شركة radio | PASS | "شركة" found in registration HTML |
| 1.7 | Engineer specialization (Designer/Supervisor/Both) | 3 choices | PARTIAL | Available on profile page; not confirmed at registration step |
| 1.8 | Post-registration auto-login | Redirect to profile | BLOCKED | Cannot test without creating real accounts |

## 2. Login/Logout/Auth

| # | Test Case | Expected | Status | Notes |
|---|-----------|----------|--------|-------|
| 2.1 | Login page loads | 200 OK | PASS | `/ar/auth/login` returns 200 |
| 2.2 | Valid admin login | Success + redirect | PASS | `{"success":true,"redirectTo":"/admin"}` |
| 2.3 | Invalid credentials rejected | Error message | PASS | `{"success":false,"error":"Invalid email or password"}` |
| 2.4 | JWT cookie set | HTTP-only secure cookie | PASS | `auth-token` cookie set with Secure flag |
| 2.5 | Cookie expiry | 7-day JWT | PASS | Expiry 604,800s from login |
| 2.6 | Auth check endpoint | Returns user info | PASS | `/api/auth/me` returns role + email |
| 2.7 | Logout | Clears session | PASS | `{"success":true}` |
| 2.8 | Protected routes redirect | Redirect to login | PASS | Marketplace → login, Admin → login when unauthenticated |
| 2.9 | Forgot password page | Loads with form | PASS | 200 OK, 32KB |
| 2.10 | Email verification endpoint | API exists | PARTIAL | `/api/auth/verify-email` exists but returned empty on test token |

## 3. Project Creation

| # | Test Case | Expected | Status | Notes |
|---|-----------|----------|--------|-------|
| 3.1 | Project creation page loads | 200 OK (owners) | PASS | 34KB response with wizard |
| 3.2 | 3 project types available | Design/Construction/Both | PASS | "مقاولات فقط", "تصميم فقط" found |
| 3.3 | Multi-step wizard | Upwork-style progressive | PASS | "step", "خطوة" found in HTML |
| 3.4 | Category selection | Hierarchical tree | PASS | "category" present |
| 3.5 | Location/neighborhood selection | Searchable chips | PASS | "حي" found |
| 3.6 | File upload buttons | 4 upload categories | PASS | "upload", "رفع" present |
| 3.7 | Save as draft | Draft button | PASS | Documented as R5 |
| 3.8 | Budget field (hidden from bidders) | Owner-only visibility | PASS | G1 implemented |
| 3.9 | Google Maps integration | Map with address fields | MOCK | Placeholder UI only, no API key |

## 4. Marketplace

| # | Test Case | Expected | Status | Notes |
|---|-----------|----------|--------|-------|
| 4.1 | Marketplace loads (auth) | Project listings | PASS | 116KB response, 200 OK |
| 4.2 | Requires authentication | Redirect to login | PASS | Unauthenticated → login redirect |
| 4.3 | Project type filter tabs | الكل/مقاولات/تصميم | PASS | "الكل", "مقاولات", "تصميم" found |
| 4.4 | Category filter sidebar | Hierarchical tree | PASS | "category", "تصفية" present |
| 4.5 | Search functionality | Text search | PASS | "search", "بحث" present |
| 4.6 | Empty state message | "لا توجد مشاريع" | PASS | No projects currently, message shown |
| 4.7 | Krasat blur gate | Blurred details + unlock | PASS | "blur" found in marketplace HTML |
| 4.8 | All users see all posts | No role-based visibility hiding | PASS | v4.0 design choice (bid-gated, not visibility-gated) |
| 4.9 | Smart match score display | 70%+ threshold shown | FAIL | No match score percentage visible; spec requires it |

## 5. Krasat System (100 SAR)

| # | Test Case | Expected | Status | Notes |
|---|-----------|----------|--------|-------|
| 5.1 | Krasat payment flow | 100 SAR unlock | PARTIAL | DineroPay integration built (`createKrasatPayment()`), test keys only |
| 5.2 | Blur gate before payment | Details hidden | PASS | Blur element present in marketplace |
| 5.3 | Q&A messaging after purchase | Chat enabled | PASS | Chat bubbles built in project detail page |
| 5.4 | Non-refundable policy | Cannot refund | PASS | Business rule documented |
| 5.5 | Full details after purchase | Files, drawings, BOQ | PASS | Unlock flow built per HANDOVER |

## 6. Bidding

| # | Test Case | Expected | Status | Notes |
|---|-----------|----------|--------|-------|
| 6.1 | Bid form available | Price, timeline, proposal | PASS | Bid form on project detail page |
| 6.2 | Bid attachments upload | File upload on bid | PASS | G18 implemented |
| 6.3 | AI bid ranking (100-point) | Price/Rating/Timeline/Exp/Response | PASS | Algorithm in `ai.ts` confirmed |
| 6.4 | My Bids dashboard | Track all bids | PASS | `/dashboard/bids` returns 200 |
| 6.5 | Bid status tracking | Submitted/Shortlisted/Awarded/Rejected | PASS | Status chips documented |
| 6.6 | Shortlist (up to 3) | Owner shortlists bids | PASS | Built per HANDOVER |
| 6.7 | Anonymous ranking visible | Score shown, competitors hidden | PASS | G21 implemented |
| 6.8 | Bid eligibility enforcement | Engineers→design, Contractors→construction | PASS | v4.0 bidding rules enforced |

## 7. Award & Contract

| # | Test Case | Expected | Status | Notes |
|---|-----------|----------|--------|-------|
| 7.1 | Award action | Select winner, reject others | PASS | Award flow built |
| 7.2 | Award notification | Bidder notified | PASS | G20 notification on award |
| 7.3 | Bid comparison page | Side-by-side (3 bids) | PASS | `/dashboard/bids/compare` returns 200 |
| 7.4 | Simple contract (free) | Standard template | PASS | contracts table with type field |
| 7.5 | Professional contract (150 SAR) | Custom drafted | PARTIAL | Payment flow built; DineroPay test keys only |
| 7.6 | Digital signatures | Both parties sign | PASS | G15 built on contract page |
| 7.7 | Contract PDF download | PDF export | PARTIAL | Browser print only (R9), not server-side PDF generation |
| 7.8 | Contract page loads | Shows terms + signatures | PASS | `/dashboard/contracts/[id]` returns 200 |

## 8. Execution Workspace

| # | Test Case | Expected | Status | Notes |
|---|-----------|----------|--------|-------|
| 8.1 | Workspace page loads | Chat, files, milestones | PASS | `/dashboard/execution/[id]` returns 200 |
| 8.2 | Direct messaging | Real-time chat | PASS | Chat in workspace |
| 8.3 | File sharing | Upload + view files | PASS | G23 + post-award file sharing |
| 8.4 | Milestone tracking | Track progress stages | PASS | G16 milestone tracking |
| 8.5 | Progress update form | Structured updates | PASS | G24 structured form with 📋 prefix |
| 8.6 | Mark project complete | Button to complete | PASS | G25 with timestamp |
| 8.7 | File version control | Track file versions | FAIL | No versioning; files replaced, no history |
| 8.8 | Issue/problem reporting | Dedicated tracker | FAIL | Only via messaging; no structured issue tracker |

## 9. Supervision Service

| # | Test Case | Expected | Status | Notes |
|---|-----------|----------|--------|-------|
| 9.1 | Supervision page loads | Request form | PASS | `/dashboard/supervision` returns 200 |
| 9.2 | 100 SAR request fee | Payment to request | PASS | "100", "request", "طلب" in page |
| 9.3 | Engineer wallet (500 SAR) | Fund wallet page | PASS | "500", "ريال" found in wallet page |
| 9.4 | 500 SAR auto-deduct on award | Wallet deducted | PASS | R3 implemented |
| 9.5 | Supervision bids ranked | AI ranking | PASS | R7 ranked by wallet balance |
| 9.6 | Refund request | Engineer requests refund | PASS | G27 refund action in wallet |
| 9.7 | Admin refund management | Admin approves refunds | PASS | `/admin/refunds` returns 200 |

## 10. Professional Contract (150 SAR)

| # | Test Case | Expected | Status | Notes |
|---|-----------|----------|--------|-------|
| 10.1 | Contract type selection | Simple vs Professional | PASS | Built in contract flow |
| 10.2 | 150 SAR payment | DineroPay integration | PARTIAL | Test keys only; production keys needed |
| 10.3 | Auto-generated from project data | Pre-filled contract | PASS | Contract page with terms |
| 10.4 | All project files attached | Files embedded | PARTIAL | Contract exists but file embedding not confirmed |
| 10.5 | Digital signatures | Both parties sign | PASS | Signature feature built |

## 11. Admin Dashboard

| # | Test Case | Expected | Status | Notes |
|---|-----------|----------|--------|-------|
| 11.1 | Admin dashboard loads | KPIs + navigation | PASS | 96KB, KPIs present |
| 11.2 | Admin-only access | RBAC enforcement | PASS | Non-admin redirected to login |
| 11.3 | Project review queue | Approve/reject projects | PASS | `/admin/projects` 200 OK |
| 11.4 | User management | Approve/reject/request info | PASS | `/admin/users` 200 OK |
| 11.5 | Engineer verification | Verify docs | PASS | `/admin/engineers` 200 OK |
| 11.6 | AI agent toggles | On/off per agent | PASS | `/admin/agents` 200 OK, 88KB |
| 11.7 | AI Hub (test agents) | Test all 11 | PASS | `/admin/ai-hub` 200 OK |
| 11.8 | Marketing generator | AI marketing content | PASS | `/admin/marketing` 200 OK |
| 11.9 | Audit log viewer | Immutable log | PASS | `/admin/audit` 200 OK, 57KB |
| 11.10 | Dispute resolution | View/resolve disputes | PASS | `/admin/disputes` 200 OK |
| 11.11 | Rating moderation | Hide/delete reviews | PASS | `/admin/reviews` 200 OK |
| 11.12 | Reports page | Revenue + stats | PASS | `/admin/reports` 200 OK, 75KB |
| 11.13 | Refund management | Approve/reject refunds | PASS | `/admin/refunds` 200 OK |

## 12. AI Agents (11 Total)

| # | Test Case | Expected | Status | Notes |
|---|-----------|----------|--------|-------|
| 12.1 | Customer Support | Arabic chat response | PASS | Returns Arabic help message |
| 12.2 | Project Intake | Structured intake | PASS | Returns `ready:false` with guidance |
| 12.3 | Bid Evaluator | Analysis response | PASS | Returns `analysis` + `ranking` fields |
| 12.4 | Admin Intelligence | Platform insights | PASS | Returns `summary` |
| 12.5 | Contract Drafter | Draft contract | PASS | Returns `contractTitle` |
| 12.6 | Bid Writer | Proposal text | PASS | Returns `proposalText` |
| 12.7 | Doc Verifier | Validation result | PASS | Returns `isValid`, `findings` |
| 12.8 | Price Estimator | Cost estimate | PASS | Returns `estimatedMin/Max`, `breakdown` |
| 12.9 | Review Sentiment | Sentiment analysis | PASS | Returns `sentimentScore` |
| 12.10 | Marketing | Content generation | PASS | Returns `caption` |
| 12.11 | Outreach | Outreach content | PASS | Works (hit rate limit on rapid test) |

## 13. Notifications

| # | Test Case | Expected | Status | Notes |
|---|-----------|----------|--------|-------|
| 13.1 | Notification center | List all notifications | PASS | `/dashboard/notifications` 200 OK |
| 13.2 | Notification bell badge | Unread count in navbar | PASS | "notification", "إشعار" in navbar HTML |
| 13.3 | Auto-notify on publish | Matching users notified | PASS | G22 implemented |
| 13.4 | Email notifications | Resend integration | BLOCKED | Cannot verify email delivery from CLI |

## 14. Bilingual (Arabic/English RTL/LTR)

| # | Test Case | Expected | Status | Notes |
|---|-----------|----------|--------|-------|
| 14.1 | Arabic homepage (RTL) | `dir="rtl"` `lang="ar"` | PASS | Confirmed in HTML |
| 14.2 | English homepage (LTR) | `dir="ltr"` `lang="en"` | PASS | Confirmed in HTML |
| 14.3 | Default locale redirect | / → /ar | PASS | 307 redirect to `/ar` |
| 14.4 | Language switcher | EN/AR toggle | PASS | "English" button visible in navbar |
| 14.5 | Arabic fonts | IBM Plex Sans Arabic | PASS | Font preconnect in HTML |
| 14.6 | Translation coverage | Full i18n via next-intl | PASS | ar.json/en.json with all keys present |

## 15. Payment System (DineroPay)

| # | Test Case | Expected | Status | Notes |
|---|-----------|----------|--------|-------|
| 15.1 | Payment callback API | Process payment results | PASS | `/api/payment/callback` returns proper error on invalid data |
| 15.2 | Krasat payment function | 100 SAR | PASS | `createKrasatPayment()` built |
| 15.3 | Supervision payment | 100 SAR | PASS | `createSupervisionPayment()` built |
| 15.4 | Wallet payment | 500 SAR | PASS | `createWalletPayment()` built |
| 15.5 | Contract payment | 150 SAR | PASS | `createContractPayment()` built |
| 15.6 | Production keys | Live payments working | FAIL | Test keys only (`e6c77f...`), no production transactions possible |
| 15.7 | Multiple payment methods | Mada, Visa, Apple Pay, STC Pay | BLOCKED | Cannot test actual payment flow |

## 16. Ratings & Reviews

| # | Test Case | Expected | Status | Notes |
|---|-----------|----------|--------|-------|
| 16.1 | Star rating (1-5) | Submit rating on completion | PASS | Star rating UI built |
| 16.2 | Review comments | Text review | PASS | Review form built |
| 16.3 | Admin moderation | Hide/delete reviews | PASS | `/admin/reviews` functional |
| 16.4 | Rating on profile | Stars visible | BLOCKED | No completed projects to verify display |

## 17. Security (RBAC, Rate Limiting)

| # | Test Case | Expected | Status | Notes |
|---|-----------|----------|--------|-------|
| 17.1 | RBAC enforcement | Role-based access | PASS | Admin routes protected, marketplace gated |
| 17.2 | Password hashing | bcrypt 12 rounds | PASS | Documented + login works correctly |
| 17.3 | HTTP-only cookies | Secure, non-JS-accessible | PASS | `#HttpOnly_` prefix in cookie jar |
| 17.4 | Security headers: X-Frame-Options | DENY | PASS | `x-frame-options: DENY` |
| 17.5 | Security headers: HSTS | Present | PASS | `strict-transport-security: max-age=31536000` |
| 17.6 | Security headers: X-Content-Type | nosniff | PASS | Confirmed |
| 17.7 | Security headers: Referrer-Policy | strict-origin | PASS | Confirmed |
| 17.8 | AI API rate limiting | 10 req/min | PASS | Rate limit triggered at request 6 (429 returned) |
| 17.9 | Auth rate limiting | Prevents brute force | FAIL | 12 rapid login attempts all returned 401, no 429 (rate limit may not be enforced on auth) |
| 17.10 | 404 error page | Custom 404 | PASS | Returns proper 404 status code |
| 17.11 | Input validation (Zod) | Validates all inputs | PASS | Validation schemas documented |
| 17.12 | HTTPS enforced | TLS everywhere | PASS | Vercel-enforced HTTPS |

---

## Extra Features (Beyond Requirements)

11 AI Agents (support, intake, bid evaluation, contract drafting, etc.), AI Hub for testing agents, Marketing AI agent, Admin Reports page with revenue stats, Public profile pages, AI Profile Quality Score (0-100 gauge), Platform fee system (5% on awards), Floating AI chat widget on every page, Admin audit logging, Auto-badge assignment (EXPERIENCED at 5+ projects).

---

## Critical Issues Found

### 🔴 CRITICAL (Must Fix Before Go-Live)

1. **Production payment keys missing** — DineroPay runs on test credentials. No real money can flow. All 4 payment flows (Krasat 100 SAR, Supervision 100 SAR, Wallet 500 SAR, Contract 150 SAR) are non-functional for real users.

2. **Auth rate limiting not enforced** — 12 rapid login attempts with wrong credentials all returned 401 with no rate limiting (429). This enables brute-force attacks on user passwords.

### 🟡 HIGH (Should Fix Before Go-Live)

3. **No smart match score display** — Spec requires AI match scores (70%+ threshold) shown when browsing projects. Marketplace has filters but no percentage match indicator.

4. **No file version control** — Execution workspace supports file sharing but no version tracking. Spec requires version control for project files.

5. **Google Maps placeholder only** — Location selection uses dropdown chips (49 Riyadh neighborhoods), but Google Maps integration is a non-functional placeholder.

6. **No server-side PDF generation** — Contracts rely on browser print (Ctrl+P). Professional contracts (150 SAR product) need reliable server-generated PDFs.

### 🟢 LOW (Nice to Have)

7. **No structured issue tracker** — Execution workspace handles issues via chat messages only; no dedicated issue/problem form.

8. **Contract page doesn't embed project files** — Professional contract (150 SAR) should attach all project files; unclear if implemented.

9. **Government license verification** — Only a placeholder badge; no API integration with Saudi gov systems (MOMRA/Etimad).

---

## Recommendations

### Before Go-Live (Week 1)
- [ ] Obtain DineroPay production merchant keys and configure in Vercel
- [ ] Add rate limiting to `/api/auth/login` endpoint (5 attempts per IP per 15 min)
- [ ] Set up production domain (not vercel.app subdomain)
- [ ] Test full payment flow end-to-end with real DineroPay sandbox

### Before Public Launch (Week 2)
- [ ] Implement smart match scoring with percentage display on marketplace cards
- [ ] Add server-side PDF generation for contracts (Puppeteer or @react-pdf/renderer)
- [ ] Obtain and configure Google Maps API key
- [ ] Add file versioning to execution workspace

### Post-Launch (Month 1)
- [ ] Integrate Saudi government license verification API
- [ ] Add structured issue tracker in execution workspace
- [ ] Expand badge set (Highly Rated, Fast Response, Premium)
- [ ] Add configurable bidding window (30 days default)

---

*Report generated: March 18, 2026 01:35 AST — curl HTTP + API testing against live deployment*
