// Baseline probe for /scripts: reproduce suspected defects before changing code.
//   D1: dropdown counts vs results mismatch while a search query is active
//   D2: shared link with category+audience still applies recipient's stored role/tag
//   D3: empty-state recovery nukes all filters
import { launch, login, gotoScripts, clearScriptsStorage, resultCount } from './_scripts-helpers.mjs';

const { b, p } = await launch();
await login(p);

// --- D2: recipient has stored role filter, opens a shared category+audience link ---
await gotoScripts(p);
await p.evaluate(() => localStorage.setItem('scripts_filter_role', 'telemarketer'));
await gotoScripts(p, '?category=cold-calling&audience=warm-market');
console.log('D2 shared-link test:');
console.log('  url after load:', p.url());
console.log('  results:', await resultCount(p));
await clearScriptsStorage(p);

// --- D1: search query active -> compare category dropdown counts vs actual selection results ---
await gotoScripts(p);
const searchBox = p.locator('input[aria-label="Search scripts"]');
await searchBox.fill('cold calling');
await p.keyboard.press('Escape');
await p.waitForTimeout(600);
console.log('\nD1 search "cold calling": total results =', await resultCount(p));
const catTrigger = p.locator('button[role="combobox"]').first();
await catTrigger.click();
await p.waitForTimeout(500);
const items = await p.locator('[role="option"]').allInnerTexts();
console.log('  category dropdown items:', JSON.stringify(items));
await p.keyboard.press('Escape');
// Now actually select cold-calling and see the real result count
await catTrigger.click();
await p.waitForTimeout(300);
await p.locator('[role="option"]', { hasText: 'Cold Calling' }).first().click();
await p.waitForTimeout(600);
console.log('  after selecting Cold Calling: results =', await resultCount(p));

// --- D3: zero-result combo -> what does the empty state offer? ---
await clearScriptsStorage(p);
await gotoScripts(p, '?category=referral&audience=nsf');
console.log('\nD3 referral+nsf: results =', await resultCount(p));
const emptyText = await p.locator('text=No scripts found').locator('..').innerText().catch(() => 'not visible');
console.log('  empty state:', emptyText.replace(/\n/g, ' | ').slice(0, 200));

// Baseline screenshots
await clearScriptsStorage(p);
await gotoScripts(p);
await p.waitForTimeout(1500);
await p.screenshot({ path: '/private/tmp/claude-501/-Users-leo/8c05f4d2-7c83-46f5-b3be-ab7cad065c0d/scratchpad/scripts-baseline-desktop.png' });
await p.setViewportSize({ width: 390, height: 844 });
await p.waitForTimeout(800);
await p.screenshot({ path: '/private/tmp/claude-501/-Users-leo/8c05f4d2-7c83-46f5-b3be-ab7cad065c0d/scratchpad/scripts-baseline-mobile.png' });
await b.close();
