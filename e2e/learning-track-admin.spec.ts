import { test, expect, type Page } from "@playwright/test";

// Set via env: E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD before running.
const ADMIN = {
  email: process.env.E2E_ADMIN_EMAIL ?? "admin@demo.com",
  password: process.env.E2E_ADMIN_PASSWORD ?? "demo123456",
};

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/auth");
  await page.locator("#signin-email").fill(email);
  await page.locator("#signin-password").fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), {
    timeout: 15_000,
  });
}

test.describe("Learning Track — admin flow", () => {
  test("admin sees the Admin tab in the learning track nav", async ({ page }) => {
    await signIn(page, ADMIN.email, ADMIN.password);

    await page.goto("/learning-track/pre-rnf");
    await expect(
      page.getByRole("link", { name: "Admin", exact: true })
    ).toBeVisible({ timeout: 15_000 });
  });

  test("roster view loads (table or empty state)", async ({ page }) => {
    await signIn(page, ADMIN.email, ADMIN.password);

    await page.goto("/learning-track/admin/roster");
    await expect(page.getByTestId("admin-roster-page")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("table")).toBeVisible();
  });

  test("heatmap view loads with both track grids", async ({ page }) => {
    await signIn(page, ADMIN.email, ADMIN.password);

    await page.goto("/learning-track/admin/heatmap");
    await expect(page.getByTestId("admin-heatmap-page")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Pre-RNF" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Post-RNF" })).toBeVisible();
  });

  test("submissions queue loads with status filter", async ({ page }) => {
    await signIn(page, ADMIN.email, ADMIN.password);

    await page.goto("/learning-track/admin/submissions");
    await expect(page.getByTestId("admin-submissions-page")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByLabel("Filter by review status")).toBeVisible();
  });

  test("admin landing redirects to roster", async ({ page }) => {
    await signIn(page, ADMIN.email, ADMIN.password);

    await page.goto("/learning-track/admin");
    await page.waitForURL(/\/learning-track\/admin\/roster/, { timeout: 15_000 });
    await expect(page.getByTestId("admin-roster-page")).toBeVisible();
  });
});
