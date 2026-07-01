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

    // The extra readiness self-checks are present.
    await expect(
      page.getByText("Do I have my cold calling / warm calling script ready?"),
    ).toBeVisible();
    await expect(page.getByText("How confident am I to start cold calling?")).toBeVisible();

    // The pledge declaration reads cleanly (no doubled "I, <name>, I have written").
    await expect(page.getByText(", I have written")).toHaveCount(0);
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

  test("pledge has a drawable signature pad + date that survive a reload", async ({ page }) => {
    await signIn(page, RECRUIT.email, RECRUIT.password);
    await openWorksheet(page);

    // The old plain-text signature input is gone; a canvas takes its place.
    await expect(page.getByPlaceholder("Your signature")).toHaveCount(0);
    const canvas = page.locator("canvas").first();
    await expect(canvas).toBeVisible();

    const date = page.getByPlaceholder("DD / MM / YYYY");
    await date.fill("01 / 07 / 2026");

    // Draw a signature stroke on the canvas (scroll it into view so the mouse
    // coordinates actually land on it).
    await canvas.scrollIntoViewIfNeeded();
    const box = await canvas.boundingBox();
    if (!box) throw new Error("signature canvas has no bounding box");
    await page.mouse.move(box.x + 30, box.y + box.height * 0.6);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.3, { steps: 10 });
    await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.7, { steps: 10 });
    await page.mouse.up();

    // The signature is captured as a PNG data URL and the draft autosaves it, so
    // it survives a reload (both the drawn ink and the typed date).
    await page.reload();
    await expect(page.getByRole("heading", { name: "My vision board" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByPlaceholder("DD / MM / YYYY")).toHaveValue("01 / 07 / 2026");

    const savedSig = await page.evaluate(() => {
      const key = Object.keys(localStorage).find(
        (k) => k.startsWith("worksheet-draft-") && k.includes("business-plan"),
      );
      if (!key) return "";
      try {
        return JSON.parse(localStorage.getItem(key) || "{}").final_pledge_signed || "";
      } catch {
        return "";
      }
    });
    expect(savedSig.startsWith("data:image")).toBeTruthy();
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

  test("an objection picked in one row drops out of the other rows' choices", async ({ page }) => {
    await signIn(page, RECRUIT.email, RECRUIT.password);
    await openWorksheet(page);

    const objectionSelects = page.locator('select:has(option[value="__other"])');
    const row0 = objectionSelects.nth(0);
    const row1 = objectionSelects.nth(1);
    await expect(row0).toBeVisible();

    // Both rows initially offer ETFs.
    await expect(row1.locator('option[value="ETFs"]')).toHaveCount(1);

    // Pick ETFs in row 0.
    await row0.selectOption("ETFs");

    // Row 0 keeps its own choice…
    await expect(row0).toHaveValue("ETFs");
    await expect(row0.locator('option[value="ETFs"]')).toHaveCount(1);
    // …but ETFs is no longer offered in row 1.
    await expect(row1.locator('option[value="ETFs"]')).toHaveCount(0);
  });
});
