import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
page.on("pageerror", (e) => console.log("pageerror:", e.message.slice(0, 200)));
page.on("console", (m) => {
  if (m.type() === "error") console.log("[error]", m.text().slice(0, 300));
});

await page.goto("http://localhost:8080/auth", { waitUntil: "networkidle" });
await page.locator("#signin-email").fill(process.env.E2E_EMAIL);
await page.locator("#signin-password").fill(process.env.E2E_PASSWORD);
await page.locator('button[type="submit"]').click();
await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 15000 });

// Test /cmfas-exams renders the rich category page
console.log("1. Visit /cmfas-exams");
await page.goto("http://localhost:8080/cmfas-exams", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.screenshot({ path: ".tmp-probe/shots/cmfas-1.png", fullPage: true });
console.log("   title:", await page.locator("h1").first().textContent().catch(() => "NONE"));
console.log("   products:", await page.locator('[data-testid="products-grid"], .nested-products-grid a, [role="article"]').count());

// Test /category/cmfas redirects to /cmfas-exams
console.log("2. Visit /category/cmfas");
await page.goto("http://localhost:8080/category/cmfas", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
console.log("   final URL:", page.url());
await page.screenshot({ path: ".tmp-probe/shots/cmfas-2.png", fullPage: true });

await browser.close();
