# LineX-Forsa — E2E Test Checklist
## For Human Testers
### Version 2.0 | March 2026

**Test URL:** https://linex-forsa.vercel.app
**Admin:** admin@linexforsa.com / Admin@123456

---

## Test 1: Registration Flow

### 1.1 Owner Registration
- [ ] Go to `/ar/auth/register`
- [ ] Select "مالك مشروع" (Project Owner) role card
- [ ] Fill: Name, Email, Password (must have uppercase + number), Confirm Password
- [ ] Click "إنشاء الحساب"
- [ ] ✅ Should redirect to `/dashboard`
- [ ] ✅ Navbar should show username
- [ ] ✅ Verification email should be received (check inbox)
- [ ] ✅ Dashboard shows owner-specific stats

### 1.2 Contractor Registration
- [ ] Go to `/ar/auth/register`
- [ ] Select "مقاول / مورد" (Contractor) role card
- [ ] Complete registration
- [ ] ✅ Should redirect to `/dashboard`
- [ ] ✅ Dashboard shows contractor-specific stats + AI analysis

### 1.3 Engineer Registration
- [ ] Go to `/ar/auth/register`
- [ ] Select "مهندس" (Engineer) role card
- [ ] Complete registration
- [ ] ✅ Should redirect to `/dashboard`

### 1.4 Duplicate Email
- [ ] Try registering with an already-used email
- [ ] ✅ Should show error: "An account with this email already exists"

### 1.5 Validation
- [ ] Try submitting with empty fields → ✅ Should show validation errors
- [ ] Try password without uppercase → ✅ Should show error
- [ ] Try mismatched passwords → ✅ Should show error

---

## Test 2: Login Flow

### 2.1 Valid Login
- [ ] Go to `/ar/auth/login`
- [ ] Enter admin@linexforsa.com / Admin@123456
- [ ] ✅ Should redirect to `/admin`
- [ ] ✅ Navbar shows "admin" + logout button

### 2.2 Invalid Login
- [ ] Enter wrong email/password
- [ ] ✅ Should show "Invalid email or password"

### 2.3 Logged-in Redirect
- [ ] While logged in, go to `/auth/login`
- [ ] ✅ Should redirect away (not show login form)

### 2.4 Logout
- [ ] Click logout button
- [ ] ✅ Should redirect to homepage
- [ ] ✅ Navbar shows login/register buttons

---

## Test 3: Project Creation (Owner)

### 3.1 Create Project
- [ ] Login as owner
- [ ] Go to `/dashboard/projects/new`
- [ ] Fill title, description, category, location, budget, dates
- [ ] Click "حفظ كمسودة" (Save Draft) → ✅ Redirects to dashboard
- [ ] Click "إرسال للمراجعة" (Submit for Review) → ✅ Project status = PENDING_REVIEW

### 3.2 AI Project Assistant
- [ ] On project creation page, click "استخدم المساعد" (Use Assistant)
- [ ] Type project description in Arabic or English
- [ ] Click "ملء النموذج تلقائياً" (Auto-fill Form)
- [ ] ✅ Form fields should be populated by AI

---

## Test 4: Admin Review

### 4.1 Review Queue
- [ ] Login as admin
- [ ] Go to `/admin/projects`
- [ ] ✅ Should see pending projects list

### 4.2 Approve Project
- [ ] Click "موافقة" (Approve) on a pending project
- [ ] ✅ Project status changes to PUBLISHED
- [ ] ✅ Project appears in marketplace

### 4.3 Reject Project
- [ ] Click "رفض" (Reject) on a pending project
- [ ] ✅ Project status changes to CHANGES_REQUESTED

---

## Test 5: Marketplace

### 5.1 Auth Required
- [ ] Logout and go to `/marketplace`
- [ ] ✅ Should redirect to login page

### 5.2 View Projects
- [ ] Login and go to `/marketplace`
- [ ] ✅ Should see published projects from database
- [ ] ✅ Category filter sidebar should work (click a category)
- [ ] ✅ Search should work
- [ ] ✅ Active filter chips should appear
- [ ] ✅ "Clear All" should remove filters

### 5.3 Project Detail
- [ ] Click "التفاصيل" (Details) on a project
- [ ] ✅ Should see full project details
- [ ] ✅ Budget, location, category, description visible

---

## Test 6: Bidding (Contractor)

### 6.1 Submit Bid
- [ ] Login as verified contractor
- [ ] Go to a project detail page
- [ ] Fill bid form: amount, duration, proposal
- [ ] Click "تقديم عرض" (Submit Bid)
- [ ] ✅ Bid should appear on the page
- [ ] ✅ Owner should receive notification
- [ ] ✅ Owner should receive email notification

### 6.2 Duplicate Bid
- [ ] Try submitting a second bid on the same project
- [ ] ✅ Should be prevented (one bid per contractor per project)

---

## Test 7: Award Flow (Owner)

### 7.1 View Bids
- [ ] Login as project owner
- [ ] Go to own project detail
- [ ] ✅ Should see all submitted bids

### 7.2 Award Bid
- [ ] Select a bid and award it
- [ ] ✅ Project status → AWARDED
- [ ] ✅ Winning bid status → AWARDED
- [ ] ✅ Other bids → REJECTED
- [ ] ✅ Winner receives notification
- [ ] ✅ Winner receives email
- [ ] ✅ Contract created
- [ ] ✅ Fee event created (5%)
- [ ] ✅ Audit log entry created

---

## Test 8: Notifications

- [ ] Go to `/dashboard/notifications`
- [ ] ✅ Should see list of notifications
- [ ] ✅ "Mark all read" button should work
- [ ] ✅ Unread notifications have green accent bar

---

## Test 9: Admin Dashboard

- [ ] Login as admin → `/admin`
- [ ] ✅ KPIs show real numbers from database
- [ ] ✅ Navigation bar shows: Dashboard, Projects, AI Agents, Marketing, AI Hub, Audit
- [ ] ✅ Recent users table shows actual users

---

## Test 10: AI Agents

### 10.1 Customer Support Chat
- [ ] Click the green chat bubble (bottom corner)
- [ ] Ask a question in Arabic
- [ ] ✅ Should get AI response in Arabic
- [ ] Ask in English
- [ ] ✅ Should get response in English

### 10.2 AI Hub
- [ ] Go to `/admin/ai-hub`
- [ ] Test each of the 11 agents:
  - [ ] 1. Customer Support
  - [ ] 2. Project Intake
  - [ ] 3. Bid Evaluator
  - [ ] 4. Admin Intelligence
  - [ ] 5. Outreach Agent
  - [ ] 6. Contract Drafter
  - [ ] 7. Bid Writer
  - [ ] 8. Document Verifier
  - [ ] 9. Price Estimator
  - [ ] 10. Review Sentiment
  - [ ] 11. Marketing Agent

### 10.3 Agent Control
- [ ] Go to `/admin/agents`
- [ ] ✅ All 11 agents listed with toggle switches
- [ ] Toggle one agent off → ✅ Status changes to "Disabled"
- [ ] Toggle back on → ✅ Status changes to "Active"

### 10.4 Marketing Page
- [ ] Go to `/admin/marketing`
- [ ] Select "Instagram Post"
- [ ] Enter a topic
- [ ] Click generate
- [ ] ✅ Should get caption, hashtags, image prompt

---

## Test 11: Language Switching

- [ ] On any page, click "English" / "العربية"
- [ ] ✅ All text should switch language
- [ ] ✅ Layout should switch direction (RTL ↔ LTR)
- [ ] ✅ Forms should work in both languages

---

## Test 12: Security

### 12.1 RBAC
- [ ] As owner, try accessing `/admin` → ✅ Redirected to dashboard
- [ ] As contractor, try accessing `/admin` → ✅ Redirected to dashboard
- [ ] As non-logged-in user, access `/marketplace` → ✅ Redirected to login

### 12.2 Rate Limiting
- [ ] Send 15+ rapid requests to the AI chat → ✅ Should get 429 rate limit error

### 12.3 Error Pages
- [ ] Go to a non-existent page (e.g., `/ar/xyz`) → ✅ Should show 404 page

---

## Test Results Summary

| Test Area | Passed | Failed | Notes |
|-----------|--------|--------|-------|
| Registration | /5 | | |
| Login | /4 | | |
| Project Creation | /2 | | |
| Admin Review | /3 | | |
| Marketplace | /3 | | |
| Bidding | /2 | | |
| Award Flow | /1 | | |
| Notifications | /1 | | |
| Admin Dashboard | /1 | | |
| AI Agents | /4 | | |
| Language | /1 | | |
| Security | /3 | | |
| **TOTAL** | **/30** | | |

---

*Test checklist created: March 2026*
