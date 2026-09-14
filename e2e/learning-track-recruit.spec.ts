import { test, expect, type Page } from "@playwright/test";

// Set via env: E2E_USER_EMAIL / E2E_USER_PASSWORD before running.
// Real creds never live in this file. The default demo user is on the Explorer
// tier, which locks Pre-RNF and Post-RNF — point these at a Papers-taker+ or
// admin account (e.g. admin@demo.com) for the track pages to render.
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
  test("loads the Pre-RNF checklist", async ({ page }) => {
    await signIn(page, RECRUIT.email, RECRUIT.password);

    await page.goto("/learning-track/pre-rnf");
    await expect(page.getByTestId("pre-rnf-page")).toBeVisible({ timeout: 15_000 });

    // Checklist and Recommended order are two views of the same progress.
    await expect(page.getByRole("tab", { name: "Checklist" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Recommended order" })).toBeVisible();

    // The header track links are visible
    await expect(page.getByRole("link", { name: /Pre-RNF Training/ }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Post-RNF Training/ }).first()).toBeVisible();
  });

  test("loads the Post-RNF hub", async ({ page }) => {
    await signIn(page, RECRUIT.email, RECRUIT.password);

    await page.goto("/learning-track/post-rnf");
    await expect(page.getByTestId("post-rnf-page")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Assignments" }).first()).toBeVisible();
  });

  test("loads resource hub", async ({ page }) => {
    await signIn(page, RECRUIT.email, RECRUIT.password);

    await page.goto("/learning-track/resources");
    await expect(page.getByTestId("resources-page")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('input[type="search"]')).toBeVisible();
  });

  test("header links switch between Pre-RNF and Post-RNF", async ({ page }) => {
    await signIn(page, RECRUIT.email, RECRUIT.password);

    await page.goto("/learning-track/pre-rnf");
    await expect(page.getByTestId("pre-rnf-page")).toBeVisible({ timeout: 15_000 });

    await page.getByRole("link", { name: /Post-RNF Training/ }).first().click();
    await expect(page).toHaveURL(/\/learning-track\/post-rnf/);
    await expect(page.getByTestId("post-rnf-page")).toBeVisible();

    await page.getByRole("link", { name: /Pre-RNF Training/ }).first().click();
    await expect(page).toHaveURL(/\/learning-track\/pre-rnf/);
    await expect(page.getByTestId("pre-rnf-page")).toBeVisible();
  });
});
