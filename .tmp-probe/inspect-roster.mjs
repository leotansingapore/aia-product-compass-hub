import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
page.on("pageerror", (e) => console.log("pageerror:", e.message));
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") console.log(`[${m.type()}]`, m.text().slice(0, 300));
});

await page.goto("http://localhost:8080/auth", { waitUntil: "networkidle" });
await page.locator("#signin-email").fill(process.env.E2E_EMAIL);
await page.locator("#signin-password").fill(process.env.E2E_PASSWORD);
await page.locator('button[type="submit"]').click();
await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 15000 });

await page.goto("http://localhost:8080/learning-track/admin/roster", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

// Count table elements
const tables = await page.locator("table").count();
console.log(`Tables found: ${tables}`);

if (tables > 0) {
  const headers = await page.locator("table th").allTextContents();
  console.log("Headers:", headers);

  const firstRow = page.locator("table tbody tr").first();
  const cells = await firstRow.locator("td").count();
  console.log(`First row cells: ${cells}`);
  const cellTexts = await firstRow.locator("td").allTextContents();
  console.log("First row text:", cellTexts.map((t) => t.slice(0, 60)));

  const rowCount = await page.locator("table tbody tr").count();
  console.log(`Total rows: ${rowCount}`);
}

// Check for any errors / loading
const bodyText = (await page.locator("body").textContent()) || "";
if (bodyText.includes("Failed to load roster")) console.log("⚠ Failed to load roster error shown");

await browser.close();
