import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const EMAIL = process.env.E2E_EMAIL;
const PASSWORD = process.env.E2E_PASSWORD;

mkdirSync(".tmp-probe/shots", { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text().slice(0, 200)}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message.slice(0, 200)}`));

async function shot(name) {
  await page.screenshot({ path: `.tmp-probe/shots/${name}.png`, fullPage: true });
  console.log(`  📸 ${name}.png`);
}

// Sign in
console.log("1. Sign in");
await page.goto("http://localhost:8080/auth", { waitUntil: "networkidle" });
await page.locator("#signin-email").fill(EMAIL);
await page.locator("#signin-password").fill(PASSWORD);
await page.locator('button[type="submit"]').click();
await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 15000 });
console.log(`   Landed at: ${page.url()}`);
await page.waitForTimeout(1500);
await shot("01-after-login");

// Dashboard (if not already there)
console.log("2. Dashboard");
await page.goto("http://localhost:8080/", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await shot("02-dashboard");

// Learning track pre-RNF
console.log("3. Pre-RNF track");
await page.goto("http://localhost:8080/learning-track/pre-rnf", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await shot("03-pre-rnf-overview");

// Count phases + click first phase to see expansion
const phaseCount = await page.locator("section h2").count();
console.log(`   Phases visible: ${phaseCount}`);

// Click first item to expand it
const firstItem = page.locator('[id^="item-"]').first();
if ((await firstItem.count()) > 0) {
  await firstItem.locator("button").nth(1).click();
  await page.waitForTimeout(800);
  await shot("04-pre-rnf-first-item-expanded");
}

// Try to scroll down and see a few more items
await page.evaluate(() => window.scrollTo(0, 800));
await page.waitForTimeout(500);
await shot("05-pre-rnf-scrolled");

// Post-RNF
console.log("4. Post-RNF track");
await page.getByRole("link", { name: "Post-RNF Training" }).click();
await page.waitForURL(/\/post-rnf/, { timeout: 10000 });
await page.waitForTimeout(1500);
await shot("06-post-rnf-overview");

// Click first item
const firstPostItem = page.locator('[id^="item-"]').first();
if ((await firstPostItem.count()) > 0) {
  await firstPostItem.locator("button").nth(1).click();
  await page.waitForTimeout(800);
  await shot("07-post-rnf-first-item-expanded");
}

// Resources hub
console.log("5. Resources hub");
await page.getByRole("link", { name: "Resources" }).click();
await page.waitForURL(/\/resources/, { timeout: 10000 });
await page.waitForTimeout(1500);
await shot("08-resources-hub");

// Admin roster (if user is admin)
console.log("6. Admin roster");
await page.goto("http://localhost:8080/learning-track/admin/roster", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await shot("09-admin-roster");

// Admin heatmap
console.log("7. Admin heatmap");
await page.goto("http://localhost:8080/learning-track/admin/heatmap", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await shot("10-admin-heatmap");

// Admin submissions
console.log("8. Admin submissions");
await page.goto("http://localhost:8080/learning-track/admin/submissions", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await shot("11-admin-submissions");

// Mobile viewport
console.log("9. Mobile pre-RNF");
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:8080/learning-track/pre-rnf", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
await shot("12-mobile-pre-rnf");

// Console logs
console.log("\n--- Console logs ---");
for (const l of logs.slice(-30)) console.log(l);

await browser.close();
