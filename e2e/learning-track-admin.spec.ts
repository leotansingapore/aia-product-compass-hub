import { test, expect, type Page } from "@playwright/test";

// Set via env: E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD before running.
const ADMIN = {
  email: process.env.E2E_ADMIN_EMAIL ?? "admin@demo.com",
  password: process.env.E2E_ADMIN_PASSWORD ?? "demo123456",
};

const CRASH_UI = /Something went wrong|Error in this page/;

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/auth");
  await page.locator("#signin-email").fill(email);
  await page.locator("#signin-password").fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((url) => !url.pathname.startsWith("/auth"), {
    timeout: 15_000,
  });
}

/** The admin layout is showing, `tabName` is the active tab, and nothing crashed. */
async function expectAdminTab(page: Page, tabName: string) {
  await expect(page.getByTestId("admin-layout-page")).toBeVisible({ timeout: 15_000 });
  const nav = page.getByRole("navigation", { name: "Admin sections" });
  await expect(nav.getByRole("link", { name: tabName, exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByText(CRASH_UI)).toHaveCount(0);
}

// Current admin tabs (see the `learning-track/admin` routes in src/App.tsx).
const ADMIN_TABS = [
  { path: "first-14-days", tab: "First 14 Days" },
  { path: "first-60-days", tab: "First 60 Days" },
  { path: "assignments", tab: "Assignments" },
  { path: "question-banks", tab: "Question Banks" },
  { path: "roleplay", tab: "Roleplay" },
];

test.describe("Learning Track — admin flow", () => {
  test("admin sees the Admin tab in the learning track nav", async ({ page }) => {
    await signIn(page, ADMIN.email, ADMIN.password);

    await page.goto("/learning-track/pre-rnf");
    await expect(
      page.getByRole("link", { name: "Admin", exact: true })
    ).toBeVisible({ timeout: 15_000 });
  });

  test("admin landing redirects to First 60 Days", async ({ page }) => {
    await signIn(page, ADMIN.email, ADMIN.password);

    await page.goto("/learning-track/admin");
    await page.waitForURL(/\/learning-track\/admin\/first-60-days/, { timeout: 15_000 });
    await expectAdminTab(page, "First 60 Days");
  });

  for (const { path, tab } of ADMIN_TABS) {
    test(`${tab} admin tab loads`, async ({ page }) => {
      await signIn(page, ADMIN.email, ADMIN.password);

      await page.goto(`/learning-track/admin/${path}`);
      await expectAdminTab(page, tab);
      if (path === "first-14-days") {
        await expect(page.getByTestId("admin-first-14-days-hub")).toBeVisible();
      }
    });
  }

  test("legacy admin URLs redirect to their replacement tabs", async ({ page }) => {
    await signIn(page, ADMIN.email, ADMIN.password);

    for (const [legacy, target, tab] of [
      ["roster", "first-60-days", "First 60 Days"],
      ["heatmap", "first-60-days", "First 60 Days"],
      ["submissions", "assignments", "Assignments"],
    ] as const) {
      await page.goto(`/learning-track/admin/${legacy}`);
      await page.waitForURL(new RegExp(`/learning-track/admin/${target}`), { timeout: 15_000 });
      await expectAdminTab(page, tab);
    }
  });
});
