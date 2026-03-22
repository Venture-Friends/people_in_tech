import { test, expect } from "@playwright/test";

test.describe("Candidate Flow", () => {
  test("can view landing page", async ({ page }) => {
    await page.goto("/en");
    // The hero section contains "Greece's Tech" heading
    await expect(page.locator("h1")).toBeVisible();
    // Navbar brand should be visible (multiple matches in nav, footer, copyright)
    await expect(page.locator("text=People in Tech").first()).toBeVisible();
  });

  test("can browse discover page", async ({ page }) => {
    await page.goto("/en/discover");
    await expect(page).toHaveURL(/discover/);
    // Verify the page loads with company cards or content
    await page.waitForSelector('[class*="card"], [class*="company"], [class*="grid"]', {
      timeout: 10000,
    });
  });

  test("can view events page", async ({ page }) => {
    await page.goto("/en/events");
    await expect(page).toHaveURL(/events/);
  });

  test("can view jobs page", async ({ page }) => {
    await page.goto("/en/jobs");
    await expect(page).toHaveURL(/jobs/);
  });

  test("can login as candidate", async ({ page }) => {
    await page.goto("/en/login");
    await page.fill('input[name="email"]', "demo@candidate.gr");
    await page.fill('input[name="password"]', "demo123");
    await page.click('button[type="submit"]');
    // After login the app redirects to /discover
    await page.waitForURL("**/discover**", { timeout: 15000 });
    await expect(page).toHaveURL(/discover/);
  });

  test("can view company profile", async ({ page }) => {
    await page.goto("/en/companies/workable");
    // Company name appears in hero and tabs - use first match
    await expect(page.locator("text=Workable").first()).toBeVisible({ timeout: 10000 });
  });
});
