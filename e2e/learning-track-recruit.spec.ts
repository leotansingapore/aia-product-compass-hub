import { test, expect, type Page } from "@playwright/test";

// Set via env: E2E_USER_EMAIL / E2E_USER_PASSWORD before running.
// Real creds never live in this file.
const RECRUIT = {
  email: process.env.E2E_USER_EMAIL ?? "user@demo.com",
  password: process.env.E2E_USER_PASSWORD ?? "demo123456",
};

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/auth");
  await page.locator("#signin-email").fill(email);
  await page.locator("#signin-password").fill(password);
  await page.locator('button[type="submit"]').click();
  // Wait for any post-auth navigation away from /auth
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), {
    timeout: 15_000,
  });
}

test.describe("Learning Track — recruit flow", () => {
  test("loads pre-RNF page with phases rendered from Supabase", async ({ page }) => {
    await signIn(page, RECRUIT.email, RECRUIT.password);

    await page.goto("/learning-track/pre-rnf");
    await expect(page.getByTestId("pre-rnf-page")).toBeVisible({ timeout: 15_000 });

    // At least one phase section heading should appear
    await expect(page.locator("section h2").first()).toBeVisible();

    // The header tab strip is visible
    await expect(page.getByRole("link", { name: "Pre-RNF Training" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Post-RNF Training" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Resources" })).toBeVisible();
  });

  test("loads post-RNF page with phases rendered from Supabase", async ({ page }) => {
    await signIn(page, RECRUIT.email, RECRUIT.password);

    await page.goto("/learning-track/post-rnf");
    await expect(page.getByTestId("post-rnf-page")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("section h2").first()).toBeVisible();
  });

  test("loads resource hub", async ({ page }) => {
    await signIn(page, RECRUIT.email, RECRUIT.password);

    await page.goto("/learning-track/resources");
    await expect(page.getByTestId("resources-page")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('input[type="search"]')).toBeVisible();
  });

  test("URL-driven navigation between subtabs works", async ({ page }) => {
    await signIn(page, RECRUIT.email, RECRUIT.password);

    await page.goto("/learning-track/pre-rnf");
    await expect(page.getByTestId("pre-rnf-page")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("link", { name: "Post-RNF Training" }).click();
    await expect(page).toHaveURL(/\/learning-track\/post-rnf/);
    await expect(page.getByTestId("post-rnf-page")).toBeVisible();

    await page.getByRole("link", { name: "Resources" }).click();
    await expect(page).toHaveURL(/\/learning-track\/resources/);
    await expect(page.getByTestId("resources-page")).toBeVisible();
  });
});
