import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto("http://localhost:8080/auth", { waitUntil: "networkidle" });
await page.locator("#signin-email").fill(process.env.E2E_EMAIL);
await page.locator("#signin-password").fill(process.env.E2E_PASSWORD);
await page.locator('button[type="submit"]').click();
await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 15000 });

await page.goto("http://localhost:8080/learning-track/pre-rnf", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

// Click the first item to expand
const firstItem = page.locator('[id^="item-"]').first();
const itemId = await firstItem.getAttribute("id");
console.log(`First item: ${itemId}`);
await firstItem.locator("button").nth(1).click();
await page.waitForTimeout(1500);

// Count content blocks rendered
const relatedSection = firstItem.locator('h4:has-text("Related resources")').locator("..");
const resourceCards = relatedSection.locator("a");
const count = await resourceCards.count();
console.log(`Related resource cards rendered: ${count}`);
for (let i = 0; i < count; i++) {
  const text = await resourceCards.nth(i).textContent();
  const href = await resourceCards.nth(i).getAttribute("href");
  console.log(`  [${i}] ${text?.trim()} -> ${href}`);
}

// Also count Content section blocks
const contentSection = firstItem.locator('h4:has-text("Content")').locator("..");
const contentBlockCount = await contentSection.locator("> div > div").count();
console.log(`Content blocks rendered: ${contentBlockCount}`);

// Full HTML of the expanded item body for inspection
const html = await firstItem.locator(".ml-8").innerHTML();
console.log("\n--- Expanded body HTML (truncated) ---");
console.log(html.slice(0, 3000));

await browser.close();
