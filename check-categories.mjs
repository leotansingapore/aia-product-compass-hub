import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(`PAGEERROR: ${e.message}`));
page.on('console', m => { if (m.type() === 'error') errors.push(`CONSOLE: ${m.text()}`); });
// sign in first
await page.goto('http://localhost:8080/auth');
await page.fill('input[type="email"]', 'master_admin@demo.com');
await page.fill('input[type="password"]', 'demo1234');
await page.click('button[type="submit"]');
await page.waitForURL(url => !url.toString().includes('/auth'), { timeout: 10000 }).catch(() => {});
await page.goto('http://localhost:8080/categories');
await page.waitForTimeout(3000);
const stat = await page.locator('text=categories').first().textContent().catch(() => 'NO STAT');
const cards = await page.locator('button[aria-label^="Open"]').count();
console.log(JSON.stringify({ stat, cardCount: cards, errors: errors.slice(0, 8) }, null, 2));
await browser.close();
