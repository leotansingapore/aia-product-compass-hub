// Playwright audit for /learning-track/first-14-days
// Logs in as admin@demo.com, visits each day, captures screenshots,
// reports JS console errors and any network failures.

import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const BASE = "http://localhost:8080";
const EMAIL = "admin@demo.com";
const PASSWORD = "demo123456";
const OUT_DIR = path.resolve("test-results/first-14-days-audit");

fs.mkdirSync(OUT_DIR, { recursive: true });

const report = {
  hub: {},
  days: [],
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  const networkErrors = [];
  const pageErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(err.message));
  page.on("response", (res) => {
    if (!res.ok() && res.status() !== 304) {
      networkErrors.push({ url: res.url(), status: res.status() });
    }
  });

  console.log("Navigating to /auth ...");
  await page.goto(`${BASE}/auth`, { waitUntil: "domcontentloaded" });
  // Wait longer for Vite HMR + React to mount
  await page.waitForTimeout(4000);
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.screenshot({ path: path.join(OUT_DIR, "debug-auth-page.png"), fullPage: true });
  console.log(`auth url: ${page.url()}`);
  const title = await page.title();
  console.log(`auth page title: ${title}`);
  console.log(`page errors so far: ${pageErrors.length}`);
  pageErrors.slice(0, 5).forEach((e) => console.log(`  pageerror: ${e.slice(0, 200)}`));
  console.log(`console errors so far: ${consoleErrors.length}`);
  consoleErrors.slice(0, 5).forEach((e) => console.log(`  console: ${e.slice(0, 200)}`));

  // Fill sign-in form — use placeholder-based locators since labels are inconsistent
  const emailField = page.getByPlaceholder("you@example.com").first();
  await emailField.waitFor({ timeout: 25000 });
  await emailField.fill(EMAIL);
  await page.getByPlaceholder("Enter your password").first().fill(PASSWORD);

  const signInButton = page
    .getByRole("button", { name: /sign in|log in/i })
    .first();
  await signInButton.click();

  await page.waitForURL(/\/learning-track|\//, { timeout: 30000 }).catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  console.log(`Logged in, landed at: ${page.url()}`);

  // Go to First 14 Days hub
  await page.goto(`${BASE}/learning-track/first-14-days`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const hubShot = path.join(OUT_DIR, "hub.png");
  await page.screenshot({ path: hubShot, fullPage: true });
  report.hub = {
    url: page.url(),
    screenshot: hubShot,
    consoleErrorsSoFar: [...consoleErrors],
    networkErrorsSoFar: [...networkErrors],
  };
  console.log(`hub captured: ${hubShot}`);

  // Reset errors per day
  for (let day = 1; day <= 14; day++) {
    consoleErrors.length = 0;
    networkErrors.length = 0;
    const url = `${BASE}/learning-track/first-14-days/day/${day}`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);

    // Check for "Loading..." stuck state
    const bodyText = await page.locator("body").innerText();
    const stillLoading = bodyText.trim().startsWith("Loading...") && bodyText.length < 50;

    const dayShot = path.join(OUT_DIR, `day-${String(day).padStart(2, "0")}.png`);
    await page.screenshot({ path: dayShot, fullPage: true });

    // Click Quiz tab to exercise it
    let quizShot = null;
    try {
      const quizTab = page.getByRole("tab", { name: /quiz/i });
      if (await quizTab.count() > 0) {
        await quizTab.first().click({ timeout: 5000 });
        await page.waitForTimeout(500);
        quizShot = path.join(OUT_DIR, `day-${String(day).padStart(2, "0")}-quiz.png`);
        await page.screenshot({ path: quizShot, fullPage: false });
      }
    } catch {}

    // Click Worksheet tab
    let wsShot = null;
    try {
      const wsTab = page.getByRole("tab", { name: /worksheet/i });
      if (await wsTab.count() > 0) {
        await wsTab.first().click({ timeout: 5000 });
        await page.waitForTimeout(500);
        wsShot = path.join(OUT_DIR, `day-${String(day).padStart(2, "0")}-worksheet.png`);
        await page.screenshot({ path: wsShot, fullPage: false });
      }
    } catch {}

    report.days.push({
      day,
      url,
      stillLoading,
      screenshot: dayShot,
      quizScreenshot: quizShot,
      worksheetScreenshot: wsShot,
      consoleErrors: [...consoleErrors],
      networkErrors: [...networkErrors],
    });
    console.log(`day ${day}: ${stillLoading ? "STUCK LOADING" : "ok"} | console=${consoleErrors.length} | network=${networkErrors.length}`);
  }

  const reportPath = path.join(OUT_DIR, "report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport: ${reportPath}`);

  // Summary
  const stuck = report.days.filter((d) => d.stillLoading);
  const withErrors = report.days.filter((d) => d.consoleErrors.length > 0 || d.networkErrors.length > 0);
  console.log(`\n=== SUMMARY ===`);
  console.log(`Days stuck loading: ${stuck.length}`);
  console.log(`Days with errors: ${withErrors.length}`);
  if (withErrors.length > 0) {
    withErrors.forEach((d) => {
      console.log(`  Day ${d.day}:`);
      d.consoleErrors.slice(0, 3).forEach((e) => console.log(`    console: ${e.slice(0, 120)}`));
      d.networkErrors.slice(0, 3).forEach((n) => console.log(`    network ${n.status}: ${n.url.slice(0, 120)}`));
    });
  }

  await browser.close();
})().catch((e) => {
  console.error("AUDIT FAILED:", e);
  process.exit(1);
});
