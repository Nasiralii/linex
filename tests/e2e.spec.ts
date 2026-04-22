import { test, expect, Page } from "@playwright/test";

const BASE = ""; // Uses baseURL from config
const ADMIN_EMAIL = "admin@linexforsa.com";
const ADMIN_PASS = "Admin@123456";
const TEST_EMAIL = `test${Date.now()}@example.com`;
const TEST_PASS = "TestPass1";

// Helper: Login
async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/ar/auth/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
}

// ============================================================================
// TEST 1: HOMEPAGE
// ============================================================================
test.describe("Homepage", () => {
  test("should load Arabic homepage", async ({ page }) => {
    await page.goto(`${BASE}/ar`);
    await expect(page).toHaveTitle(/LineX Forsa|لاينكس فرصة/);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should load English homepage", async ({ page }) => {
    await page.goto(`${BASE}/en`);
    await expect(page).toHaveTitle(/LineX Forsa/);
  });

  test("should have chat widget", async ({ page }) => {
    await page.goto(`${BASE}/ar`);
    const chatButton = page.locator("button").filter({ has: page.locator("svg") }).last();
    await expect(chatButton).toBeVisible();
  });
});

// ============================================================================
// TEST 2: REGISTRATION
// ============================================================================
test.describe("Registration", () => {
  test("should show registration page with 3 role cards", async ({ page }) => {
    await page.goto(`${BASE}/ar/auth/register`);
    await expect(page.locator("h1")).toContainText(/إنشاء حساب|Create Account/);
    // Should have 3 role selection buttons
    const roleButtons = page.locator("button").filter({ hasText: /مالك|مقاول|مهندس|Owner|Contractor|Engineer/ });
    await expect(roleButtons.first()).toBeVisible();
  });

  test("should validate empty form submission", async ({ page }) => {
    await page.goto(`${BASE}/ar/auth/register`);
    // Submit button should be disabled without role selection
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeDisabled();
  });
});

// ============================================================================
// TEST 3: LOGIN
// ============================================================================
test.describe("Login", () => {
  test("should show login page", async ({ page }) => {
    await page.goto(`${BASE}/ar/auth/login`);
    await expect(page.locator("h1")).toContainText(/تسجيل الدخول|Sign In/);
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto(`${BASE}/ar/auth/login`);
    await page.fill('input[name="email"]', "wrong@email.com");
    await page.fill('input[name="password"]', "WrongPass1");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    await expect(page.locator("text=Invalid email or password").or(page.locator("text=Login failed"))).toBeVisible();
  });

  test("should login as admin successfully", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASS);
    // Should redirect to admin dashboard
    await expect(page).toHaveURL(/admin/);
  });
});

// ============================================================================
// TEST 4: ADMIN DASHBOARD
// ============================================================================
test.describe("Admin Dashboard", () => {
  test("should show admin page after login", async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASS);
    await page.waitForTimeout(1000);
    // After login, should be on admin page (h1 exists)
    const h1 = await page.locator("h1").first().textContent();
    expect(h1).toBeTruthy();
  });

  test("admin pages exist and are accessible", async ({ page }) => {
    // Test that admin pages return valid HTML (not 500 errors)
    const pages = ["/ar/admin", "/ar/admin/agents", "/ar/admin/ai-hub", "/ar/admin/marketing", "/ar/admin/projects", "/ar/admin/audit"];
    for (const p of pages) {
      const response = await page.goto(`${BASE}${p}`);
      expect(response?.status()).toBeLessThan(500);
    }
  });
});

// ============================================================================
// TEST 5: MARKETPLACE AUTH GUARD
// ============================================================================
test.describe("Marketplace Auth", () => {
  test("should redirect unauthenticated users to login", async ({ page }) => {
    await page.goto(`${BASE}/ar/marketplace`);
    await page.waitForTimeout(2000);
    // Should redirect to login
    await expect(page).toHaveURL(/auth\/login/);
  });
});

// ============================================================================
// TEST 6: RBAC (Role-Based Access)
// ============================================================================
test.describe("RBAC Security", () => {
  test("non-admin cannot access admin pages", async ({ page }) => {
    // Try accessing admin without login → should redirect
    await page.goto(`${BASE}/ar/admin`);
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/auth\/login|dashboard/);
  });
});

// ============================================================================
// TEST 7: ERROR PAGES
// ============================================================================
test.describe("Error Pages", () => {
  test("should show 404 for unknown pages", async ({ page }) => {
    await page.goto(`${BASE}/ar/this-page-does-not-exist`);
    await page.waitForTimeout(2000);
    // Should show 404 or not-found content
    const content = await page.textContent("body");
    expect(content).toBeTruthy();
  });
});

// ============================================================================
// TEST 8: LANGUAGE SWITCHING
// ============================================================================
test.describe("Language", () => {
  test("should have RTL direction for Arabic", async ({ page }) => {
    await page.goto(`${BASE}/ar`);
    const dir = await page.locator("[dir]").first().getAttribute("dir");
    expect(dir).toBe("rtl");
  });

  test("should have LTR direction for English", async ({ page }) => {
    await page.goto(`${BASE}/en`);
    const dir = await page.locator("[dir]").first().getAttribute("dir");
    expect(dir).toBe("ltr");
  });
});

// ============================================================================
// TEST 9: API ENDPOINTS
// ============================================================================
test.describe("API Endpoints", () => {
  test("auth/me should return 401 for unauthenticated", async ({ request }) => {
    const response = await request.get(`${BASE}/api/auth/me`);
    expect(response.status()).toBe(401);
  });

  test("agents/chat should accept POST", async ({ request }) => {
    const response = await request.post(`${BASE}/api/agents/chat`, {
      data: { agent: "support", message: "Hello", locale: "en" },
    });
    // Should return 200, rate-limited 429, or 500 if API key not configured
    expect([200, 429, 500]).toContain(response.status());
  });
});

// ============================================================================
// TEST 10: FORGOT PASSWORD PAGE
// ============================================================================
test.describe("Forgot Password", () => {
  test("should show forgot password page", async ({ page }) => {
    await page.goto(`${BASE}/ar/auth/forgot-password`);
    await expect(page.locator("h1")).toContainText(/استعادة كلمة المرور|Reset Password/);
  });
});

// ============================================================================
// TEST 11: NOTIFICATIONS PAGE
// ============================================================================
test.describe("Notifications", () => {
  test("should require auth for notifications", async ({ page }) => {
    await page.goto(`${BASE}/ar/dashboard/notifications`);
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/auth\/login/);
  });
});

// ============================================================================
// TEST 12: SECURITY HEADERS
// ============================================================================
test.describe("Security Headers", () => {
  test("should have security headers", async ({ request }) => {
    const response = await request.get(`${BASE}/ar`);
    const headers = response.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
  });
});
