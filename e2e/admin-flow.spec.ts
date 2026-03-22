import { test, expect } from "@playwright/test";

test.describe("Admin Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/en/login");
    await page.fill("#email", "admin@pos4work.gr");
    await page.fill("#password", "admin123");
    await page.click('button[type="submit"]');
    // Admin is redirected to /discover after login
    await page.waitForURL("**/discover**", { timeout: 15000 });
    // Navigate to admin dashboard
    await page.goto("/en/admin");
    await page.waitForLoadState("networkidle");
  });

  test("admin dashboard loads", async ({ page }) => {
    await expect(page).toHaveURL(/admin/);
    // Overview/Dashboard should be the default tab
    await expect(
      page.locator("button", { hasText: "Dashboard" }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("can view companies tab", async ({ page }) => {
    // Click Companies sidebar button
    await page.locator("button", { hasText: "Companies" }).first().click();
    // Companies table should load — look for table header or known company
    await expect(
      page.locator("text=Workable").first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("can view candidates tab", async ({ page }) => {
    // Click Candidates sidebar button
    await page.locator("button", { hasText: "Candidates" }).first().click();
    // Should show the demo candidate email in the table
    await expect(
      page.locator("text=demo@candidate.gr").first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("can view claims tab", async ({ page }) => {
    // Click Claim Requests sidebar button
    await page.locator("button", { hasText: "Claim Requests" }).first().click();
    // Should show status filter chips — "Pending" is the default active filter
    await expect(
      page.locator("button", { hasText: "Pending" }).first()
    ).toBeVisible({ timeout: 10000 });
  });
});
