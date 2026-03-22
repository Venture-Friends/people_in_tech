import { test, expect } from "@playwright/test";

test.describe("Company Rep Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as company rep
    await page.goto("/en/login");
    await page.fill('input[name="email"]', "rep@company.gr");
    await page.fill('input[name="password"]', "rep123");
    await page.click('button[type="submit"]');
    // After login the app redirects to /discover
    await page.waitForURL("**/discover**", { timeout: 15000 });
  });

  test("lands on discover page after login", async ({ page }) => {
    await expect(page).toHaveURL(/discover/);
  });

  test("can access company dashboard directly", async ({ page }) => {
    // Company reps access their dashboard at /dashboard/company
    await page.goto("/en/dashboard/company");
    await expect(page).toHaveURL(/dashboard\/company/);
    // Dashboard heading should be visible
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  test("can see company dashboard overview stats", async ({ page }) => {
    await page.goto("/en/dashboard/company");
    await expect(page).toHaveURL(/dashboard\/company/);
    // Overview tab is the default - check for stats card labels
    // Use getByText with exact match to avoid matching recharts tooltip
    await expect(page.getByText("Followers", { exact: true }).first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("Active Roles", { exact: true })).toBeVisible({
      timeout: 10000,
    });
  });

  test("can access profile editor", async ({ page }) => {
    await page.goto("/en/dashboard/profile");
    await expect(page).toHaveURL(/dashboard\/profile/);
    // Profile page heading
    await expect(page.getByText("My Profile")).toBeVisible({ timeout: 10000 });
  });

  test("can view company page with team section", async ({ page }) => {
    await page.goto("/en/companies/workable");
    // Company name should be displayed in the hero
    await expect(page.locator("h1")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("h1")).toContainText("Workable");
    // Team section in the About tab should show the rep
    await expect(page.getByText("Nikos Georgiou")).toBeVisible({ timeout: 10000 });
  });

  test("can view company profile tab in dashboard", async ({ page }) => {
    await page.goto("/en/dashboard/company?tab=profile");
    await expect(page).toHaveURL(/dashboard\/company/);
    // Company Profile sidebar item should be visible
    await expect(page.getByText("Company Profile").first()).toBeVisible({
      timeout: 10000,
    });
  });
});
