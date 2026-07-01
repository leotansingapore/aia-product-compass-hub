import { test, expect, type Page } from "@playwright/test";

// Real creds never live in this file — set via env before running.
const RECRUIT = {
  email: process.env.E2E_USER_EMAIL ?? "user@demo.com",
  password: process.env.E2E_USER_PASSWORD ?? "demo123456",
};

const WORKSHEET_URL = "/learning-track/pre-rnf/worksheets/business-plan";

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/auth");
  await page.locator("#signin-email").fill(email);
  await page.locator("#signin-password").fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 15_000 });
}

async function openWorksheet(page: Page) {
  await page.goto(WORKSHEET_URL);
  // The editor renders its title once hydrated; wait on the first section head.
  await expect(page.getByRole("heading", { name: "My vision board" })).toBeVisible({
    timeout: 15_000,
  });
  // Dismiss the onboarding tour if it pops up.
  const skip = page.getByText("Skip tour", { exact: false });
  if (await skip.isVisible().catch(() => false)) await skip.click();
}

test.describe("Pre-RNF Business Plan worksheet", () => {
  test("renders every custom section of the plan", async ({ page }) => {
    await signIn(page, RECRUIT.email, RECRUIT.password);
    await openWorksheet(page);

    await expect(page.getByRole("heading", { name: "My vision board" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "My 100 Whys" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "My motto to live by" })).toBeVisible();
    // Pledge heading is CSS-uppercased; match case-insensitively on the accessible text.
    await expect(page.getByText(/my pledge/i).first()).toBeVisible();

    // Redundant checklist items were removed (vision board + 100 whys live as their
    // own sections now).
    await expect(page.getByText("Have I done my 100 Whys?")).toHaveCount(0);
    await expect(page.getByText("Have I done my vision board?")).toHaveCount(0);
  });

  test("100 Whys section either auto-fills or links to the assignment", async ({ page }) => {
    await signIn(page, RECRUIT.email, RECRUIT.password);
    await openWorksheet(page);

    const doLink = page.getByRole("link", { name: /Do my 100 Whys/i });
    const heading = page.getByRole("heading", { name: "My 100 Whys" });
    await expect(heading).toBeVisible();

    if (await doLink.isVisible().catch(() => false)) {
      // Not submitted yet: the prompt links to the assignment.
      await expect(doLink).toHaveAttribute(
        "href",
        "/learning-track/pre-rnf/assignments/100-whys",
      );
    } else {
      // Submitted: an editable textarea is shown under the heading.
      await expect(
        page.locator('label:has-text("The words I run on"), textarea').first(),
      ).toBeVisible();
    }
  });

  test("textareas accept line breaks and grow with content", async ({ page }) => {
    await signIn(page, RECRUIT.email, RECRUIT.password);
    await openWorksheet(page);

    const motto = page
      .locator("label", { hasText: "My personal motto" })
      .locator('xpath=following-sibling::textarea');
    await expect(motto).toBeVisible();

    const multi = "First line of my motto\nSecond line\nThird line";
    await motto.fill(multi);
    // The Enter-key content (real newlines) is preserved in the value.
    await expect(motto).toHaveValue(multi);

    // Auto-grow: field-sizing:content is applied so the box fits its content.
    const fieldSizing = await motto.evaluate(
      (el) => getComputedStyle(el as HTMLElement).fieldSizing || "",
    );
    expect(fieldSizing).toBe("content");
  });

  test("pledge signature + date are editable and survive a reload", async ({ page }) => {
    await signIn(page, RECRUIT.email, RECRUIT.password);
    await openWorksheet(page);

    const sig = page.getByPlaceholder("Your signature");
    const date = page.getByPlaceholder("DD / MM / YYYY");
    await expect(sig).toBeVisible();
    await expect(date).toBeVisible();

    const stamp = "E2E Signer 42";
    await sig.fill(stamp);
    await date.fill("01 / 07 / 2026");

    // The in-progress draft autosaves to localStorage on every keystroke, so a
    // reload must restore what was typed without needing an explicit Save.
    await page.reload();
    await expect(page.getByRole("heading", { name: "My vision board" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByPlaceholder("Your signature")).toHaveValue(stamp);
    await expect(page.getByPlaceholder("DD / MM / YYYY")).toHaveValue("01 / 07 / 2026");
  });

  test("objection dropdown offers the full warm-market library", async ({ page }) => {
    await signIn(page, RECRUIT.email, RECRUIT.password);
    await openWorksheet(page);

    // Find the objection-picker select (the only selects on the page live in the
    // objection-handling table).
    const objectionSelect = page.locator('select:has(optgroup)').first();
    await expect(objectionSelect).toBeVisible();

    // Two option groups: the product/DIY presets and the warm-market library.
    await expect(objectionSelect.locator("optgroup")).toHaveCount(2);

    // Library titles are wired in — far more than the 10 presets.
    const optionCount = await objectionSelect.locator("option").count();
    expect(optionCount).toBeGreaterThan(20);

    // A known preset and a known library title are both present.
    await expect(objectionSelect.locator('option', { hasText: "DIY" }).first()).toHaveCount(1);
    await expect(
      objectionSelect.locator("option").filter({ hasText: /Let me think about it/i }),
    ).toHaveCount(1);
  });
});
