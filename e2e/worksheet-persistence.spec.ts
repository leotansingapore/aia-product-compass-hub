import { test, expect, type Page } from "@playwright/test";

// Real creds never live in this file — set via env before running.
const RECRUIT = {
  email: process.env.E2E_USER_EMAIL ?? "user@demo.com",
  password: process.env.E2E_USER_PASSWORD ?? "demo123456",
};

const BP = "/learning-track/pre-rnf/worksheets/business-plan";
const PS = "/learning-track/pre-rnf/worksheets/pledge-sheet";

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/auth");
  await page.locator("#signin-email").fill(email);
  await page.locator("#signin-password").fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 15_000 });
}

async function openBusinessPlan(page: Page) {
  await page.goto(BP);
  await expect(page.getByRole("heading", { name: "My vision board" })).toBeVisible({ timeout: 15_000 });
  const skip = page.getByText("Skip tour", { exact: false });
  if (await skip.isVisible().catch(() => false)) await skip.click();
}

const mottoField = (page: Page) =>
  page.locator("label", { hasText: "My personal motto" }).locator('xpath=following-sibling::textarea');

async function clearLocalDrafts(page: Page) {
  await page.evaluate(() => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith("worksheet-draft-"))
      .forEach((k) => localStorage.removeItem(k));
  });
}

test.describe("Worksheet persistence", () => {
  test("business plan survives a page refresh (local draft)", async ({ page }) => {
    await signIn(page, RECRUIT.email, RECRUIT.password);
    await openBusinessPlan(page);

    const value = "Refresh persistence line one\nline two\nline three";
    await mottoField(page).fill(value);

    await page.reload();
    await expect(page.getByRole("heading", { name: "My vision board" })).toBeVisible({ timeout: 15_000 });
    await expect(mottoField(page)).toHaveValue(value);
  });

  test("business plan survives coming back later (saved to account, local cache cleared)", async ({ page }) => {
    await signIn(page, RECRUIT.email, RECRUIT.password);
    await openBusinessPlan(page);

    const value = "Saved-to-account persistence check";
    await mottoField(page).fill(value);

    // Explicit Save writes it to the account (Supabase).
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText(/Worksheet saved/i)).toBeVisible({ timeout: 15_000 });

    // Simulate a different browser / another day: drop the local draft entirely,
    // so the reload must rehydrate from the account.
    await clearLocalDrafts(page);
    await page.reload();
    await expect(page.getByRole("heading", { name: "My vision board" })).toBeVisible({ timeout: 15_000 });
    await expect(mottoField(page)).toHaveValue(value);
  });

  test("pledge sheet survives a page refresh (local draft)", async ({ page }) => {
    await signIn(page, RECRUIT.email, RECRUIT.password);
    await page.goto(PS);
    // The pledge calculator renders a "Goals & Targets" style heading once hydrated.
    await expect(page.locator("input").first()).toBeVisible({ timeout: 15_000 });
    const skip = page.getByText("Skip tour", { exact: false });
    if (await skip.isVisible().catch(() => false)) await skip.click();

    // Personalise → name field; a stable, identifiable value.
    await page.getByPlaceholder("e.g. Jane Tan").fill("Persistence Tester");

    await page.reload();
    await expect(page.locator("input").first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByPlaceholder("e.g. Jane Tan")).toHaveValue("Persistence Tester");
  });
});
