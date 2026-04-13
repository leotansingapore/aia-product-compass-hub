import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

await page.goto("http://localhost:8080/auth", { waitUntil: "networkidle" });
await page.locator("#signin-email").fill(process.env.E2E_EMAIL);
await page.locator("#signin-password").fill(process.env.E2E_PASSWORD);
await page.locator('button[type="submit"]').click();
await page.waitForURL((url) => !url.pathname.startsWith("/auth"), { timeout: 15000 });
await page.waitForTimeout(1000);

// Wait longer on each page + take screenshots after full settle
const paths = [
  ["/learning-track/post-rnf", "06b-post-rnf-overview"],
  ["/learning-track/admin/roster", "09b-admin-roster"],
];
for (const [path, name] of paths) {
  await page.goto(`http://localhost:8080${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `.tmp-probe/shots/${name}.png`, fullPage: true });
  console.log(`📸 ${name}`);
}

await browser.close();
