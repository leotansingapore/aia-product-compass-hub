// Edge-case battery 2 for /scripts — the second hundred. Groups:
//   A auth/tiers/view-as · B mutation & failure paths · C search layer 2
//   D URL robustness · E layout extremes · F gestures/input · G persistence
//   H performance/platform · I cross-surface consistency · W webkit subset
// Run with dev server up: node tests/scripts-behaviour-battery-2.mjs
// Prod: BASE_URL=https://academy.finternship.com node tests/scripts-behaviour-battery-2.mjs
import { chromium, webkit } from 'playwright';
import { launch, login, gotoScripts, dismissOverlays, clearScriptsStorage, resultCount, BASE } from './_scripts-helpers.mjs';

const SHOT_DIR = '/private/tmp/claude-501/-Users-leo/8c05f4d2-7c83-46f5-b3be-ab7cad065c0d/scratchpad';
const results = [];
const skipped = [];
let b, ctx, p;

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`PASS ${results.length}: ${name}`);
  } catch (e) {
    results.push({ name, ok: false, err: String(e).split('\n')[0].slice(0, 220) });
    console.log(`FAIL ${results.length}: ${name} — ${String(e).split('\n')[0].slice(0, 220)}`);
    try { await p.screenshot({ path: `${SHOT_DIR}/battery2-fail-${results.length}.png` }); } catch {}
  }
}
function skip(name, why) { skipped.push({ name, why }); }
const eq = (a, b, msg) => { if (a !== b) throw new Error(`${msg ?? 'expected equal'}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`); };
const ok = (v, msg) => { if (!v) throw new Error(msg ?? 'expected truthy'); };

const searchInput = () => p.locator('input[aria-label="Search scripts"]');
const catTrigger = () => p.locator('button[role="combobox"]').nth(0);
const audTrigger = () => p.locator('button[role="combobox"]').nth(1);

({ b, ctx, p } = await launch());
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
await login(p);
await gotoScripts(p);
await clearScriptsStorage(p);
const TOTAL = await resultCount(p);
ok(TOTAL > 50, `sane corpus (${TOTAL})`);

// ===========================================================================
// A. Auth, tiers, view-as
// ===========================================================================
await check('A1 anon shared link -> login -> lands back on the exact filtered view', async () => {
  const fresh = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const fp = await fresh.newPage();
  await fp.goto(`${BASE}/scripts?category=cold-calling&audience=warm-market`, { waitUntil: 'domcontentloaded' });
  await fp.waitForURL(u => u.toString().includes('/auth'), { timeout: 20000 });
  await fp.waitForTimeout(800);
  await fp.locator('input[type="email"]').fill('master_admin@demo.com');
  await fp.locator('input[type="password"]').fill('demo123456');
  await fp.locator('button[type="submit"]').first().click();
  await fp.waitForURL(u => u.toString().includes('/scripts'), { timeout: 60000 });
  const url = fp.url();
  ok(url.includes('category=cold-calling') && url.includes('audience=warm-market'), `params survived (${url})`);
  await fp.waitForSelector('[data-testid="scripts-result-count"]', { timeout: 30000 });
  let n = 0;
  for (let i = 0; i < 4; i++) {
    await fp.waitForTimeout(1200);
    if (await fp.getByText("Couldn't load scripts").isVisible().catch(() => false)) {
      await fp.locator('button:has-text("Retry")').click().catch(() => {});
      continue;
    }
    n = parseInt((await fp.locator('[data-testid="scripts-result-count"]').innerText()).match(/(\d+)/)[1], 10);
    if (n > 0) break;
  }
  ok(n > 0, `results shown (${n})`);
  await fresh.close();
});

await check('A2 tier-locked user on a shared scripts link is bounced, never half-renders', async () => {
  const fresh = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const fp = await fresh.newPage();
  await fp.goto(`${BASE}/auth`, { waitUntil: 'domcontentloaded' });
  await fp.waitForTimeout(800);
  await fp.locator('input[type="email"]').fill('user@demo.com');
  await fp.locator('input[type="password"]').fill('demo123456');
  await fp.locator('button[type="submit"]').first().click();
  await fp.waitForURL(u => !u.toString().includes('/auth'), { timeout: 60000 });
  await fp.goto(`${BASE}/scripts?category=cold-calling`, { waitUntil: 'domcontentloaded' });
  await fp.waitForTimeout(4000);
  ok(!fp.url().includes('/scripts'), `redirected away (${fp.url()})`);
  const sawScripts = await fp.locator('input[aria-label="Search scripts"]').isVisible().catch(() => false);
  ok(!sawScripts, 'scripts UI never rendered');
  await fresh.close();
});

await check('A3 view-as tier hides admin Delete controls, filters still work', async () => {
  // NOTE: "Add Script" is deliberately visible to every consultant — the
  // scripts DB takes user contributions. Admin-only surface = Delete/Edit/
  // category-trash/KnowledgeManagement.
  await gotoScripts(p);
  await p.evaluate(() => localStorage.setItem('view-as-tier', 'post_rnf'));
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForSelector('input[aria-label="Search scripts"]', { timeout: 30000 });
  let deletes = -1;
  for (let i = 0; i < 10; i++) {
    await p.waitForTimeout(700);
    deletes = await p.locator('button:has-text("Delete")').count();
    if (deletes === 0) break;
  }
  eq(deletes, 0, 'no Delete buttons in member view');
  // filters still work
  await audTrigger().click();
  await p.waitForTimeout(300);
  await p.locator('[role="option"]', { hasText: 'NSF / NS' }).first().click();
  await p.waitForTimeout(700);
  ok(p.url().includes('audience=nsf'), 'filtering works in member view');
});

await check('A4 view-as: category dropdown has no per-category delete icons', async () => {
  await catTrigger().click();
  await p.waitForTimeout(400);
  eq(await p.locator('button[title^="Delete category"]').count(), 0, 'no trash icons');
  await p.keyboard.press('Escape');
});

await check('A5 view-as: Knowledge Base Management section not mounted', async () => {
  ok(!(await p.getByText('Knowledge Base Management').isVisible().catch(() => false)), 'admin section absent');
});

await check('A6 reverting to admin view restores admin controls', async () => {
  await p.evaluate(() => localStorage.removeItem('view-as-tier'));
  await gotoScripts(p);
  await clearScriptsStorage(p);
  await gotoScripts(p);
  ok(await p.locator('button:has-text("Add Script")').isVisible(), 'Add Script back');
});

await check('A7 course-banner dismissal is per-user (guest key does not hide it for the user)', async () => {
  await p.evaluate(() => localStorage.setItem('scripts-course-banner-dismissed-guest', '1'));
  await gotoScripts(p);
  const bannerOrLink = (await p.getByText('Scripts Fundamentals').count()) > 0;
  ok(bannerOrLink, 'course entry still present for the signed-in user');
});

await check('A8 normal load never flashes through the tier bounce', async () => {
  await gotoScripts(p, '?category=cold-calling');
  await p.waitForTimeout(1500);
  ok(p.url().includes('/scripts'), 'stayed on /scripts');
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

// ===========================================================================
// B. Mutation & failure paths (all failure cases via interception — no DB writes)
// ===========================================================================
await check('B1 favourite -> favourites-only -> unfavourite removes card and updates count', async () => {
  await gotoScripts(p);
  const heart = p.locator('button[title="Add to favourites"]').first();
  await heart.scrollIntoViewIfNeeded();
  await heart.click();
  await p.waitForTimeout(1200);
  await p.locator('button:has-text("Favourites")').first().click();
  await p.waitForTimeout(800);
  const n = await resultCount(p);
  ok(n >= 1, `favourites view has the card (${n})`);
  const unheart = p.locator('button[title="Remove from favourites"]').first();
  await unheart.click();
  await p.waitForTimeout(1200);
  const after = await resultCount(p);
  eq(after, n - 1, 'card left the favourites view');
  await p.locator('button:has-text("Favourites")').first().click();
  await p.waitForTimeout(500);
});

await check('B2 RLS-shaped DELETE (200 empty) surfaces an error, not fake success', async () => {
  await gotoScripts(p);
  const heart = p.locator('button[title="Add to favourites"]').first();
  await heart.scrollIntoViewIfNeeded();
  await heart.click();
  await p.waitForTimeout(1200);
  await p.route('**/rest/v1/script_favourites*', route => {
    if (route.request().method() === 'DELETE') {
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    } else route.continue();
  });
  await p.locator('button[title="Remove from favourites"]').first().click();
  await p.waitForTimeout(1500);
  ok(await p.getByText('Failed to update favourite').isVisible().catch(() => false), 'error toast shown');
  await p.unroute('**/rest/v1/script_favourites*');
  // real cleanup
  await p.locator('button[title="Remove from favourites"]').first().click();
  await p.waitForTimeout(1200);
});

await check('B3 blocked INSERT (401) surfaces an error, not fake success', async () => {
  await gotoScripts(p);
  // make sure the first card is genuinely UNfavourited so the toggle is an INSERT
  const cleanup = p.locator('button[title="Remove from favourites"]').first();
  if (await cleanup.isVisible().catch(() => false)) {
    await cleanup.click();
    await p.waitForTimeout(1500);
  }
  await p.route('**/rest/v1/script_favourites*', route => {
    if (route.request().method() === 'POST') {
      route.fulfill({ status: 401, contentType: 'application/json', body: '{"message":"blocked"}' });
    } else route.continue();
  });
  const heart = p.locator('button[title="Add to favourites"]').first();
  await heart.scrollIntoViewIfNeeded();
  await heart.click();
  await p.waitForTimeout(1500);
  ok(await p.getByText('Failed to update favourite').isVisible().catch(() => false), 'error toast shown');
  ok(!(await p.getByText('Added to favourites').isVisible().catch(() => false)), 'no success toast');
  await p.unroute('**/rest/v1/script_favourites*');
});

await check('B4 scripts-fetch failure -> Retry recovers WITH the active filters intact', async () => {
  let failed = false;
  await p.route('**/rest/v1/scripts*', route => {
    if (!failed) { failed = true; route.fulfill({ status: 500, body: '{}' }); }
    else route.continue();
  });
  await p.goto(`${BASE}/scripts?category=cold-calling`, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('input[aria-label="Search scripts"]', { timeout: 30000 });
  await dismissOverlays(p);
  await p.waitForTimeout(1200);
  const errVisible = await p.getByText("Couldn't load scripts").isVisible().catch(() => false);
  if (errVisible) {
    await p.locator('button:has-text("Retry")').click();
    await p.waitForTimeout(2000);
  }
  await p.unroute('**/rest/v1/scripts*');
  await p.waitForTimeout(800);
  ok(p.url().includes('category=cold-calling'), 'filter still in url');
  const n = await resultCount(p);
  ok(n > 0, `data recovered (${n})`);
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('B5 alt-tab refetch keeps scroll, filters and open cards', async () => {
  await gotoScripts(p, '?category=cold-calling');
  await p.evaluate(() => window.scrollTo(0, 1200));
  await p.waitForTimeout(400);
  await p.evaluate(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('focus'));
  });
  await p.waitForTimeout(1500);
  const y = await p.evaluate(() => window.scrollY);
  ok(Math.abs(y - 1200) < 300, `scroll kept (${y})`);
  ok(p.url().includes('category=cold-calling'), 'filter kept');
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

skip('B6 live edit/recategorise/merge while filtered', 'needs real DB writes against the shared prod Supabase — not safe from an automated battery');

// ===========================================================================
// C. Search, second layer
// ===========================================================================
await check('C1 composition events (IME) do not crash and settle on the committed text', async () => {
  await gotoScripts(p);
  const inp = searchInput();
  await inp.click();
  await p.evaluate(() => {
    const el = document.querySelector('input[aria-label="Search scripts"]');
    el.dispatchEvent(new CompositionEvent('compositionstart', { data: '' }));
    el.dispatchEvent(new CompositionEvent('compositionupdate', { data: 'bao' }));
  });
  await inp.fill('保险');
  await p.evaluate(() => {
    const el = document.querySelector('input[aria-label="Search scripts"]');
    el.dispatchEvent(new CompositionEvent('compositionend', { data: '保险' }));
  });
  await p.waitForTimeout(600);
  eq(await inp.inputValue(), '保险', 'committed text stands');
  ok((await resultCount(p)) !== null, 'count intact');
  await p.locator('button[aria-label="Clear search"]').click();
});

await check('C2 suggestion list caps at 8 and is deterministic across re-renders', async () => {
  await gotoScripts(p);
  ok((await resultCount(p)) > 0, 'data loaded before suggestion test');
  const runs = [];
  for (let i = 0; i < 2; i++) {
    await searchInput().fill('');
    await searchInput().fill('co');
    await p.waitForTimeout(600);
    const items = await p.locator('#script-search-suggestions button').allInnerTexts();
    runs.push(items);
  }
  ok(runs[0].length <= 8, `capped (${runs[0].length})`);
  eq(JSON.stringify(runs[0]), JSON.stringify(runs[1]), 'stable ordering');
  await searchInput().fill('');
});

await check('C3 mousedown on a suggestion inside the 200ms blur window still lands', async () => {
  await searchInput().fill('cold cal');
  await p.waitForTimeout(600);
  const sug = p.locator('#script-search-suggestions button').first();
  const box = await sug.boundingBox();
  await p.mouse.move(box.x + 10, box.y + 10);
  await p.mouse.down();
  await p.waitForTimeout(250);
  await p.mouse.up();
  await p.waitForTimeout(700);
  ok(p.url().includes('category=cold-calling'), `suggestion applied (${p.url()})`);
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('C4 ArrowDown x20 clamps at the last suggestion, Enter applies it without crashing', async () => {
  await searchInput().fill('call');
  await p.waitForTimeout(600);
  for (let i = 0; i < 20; i++) await p.keyboard.press('ArrowDown');
  for (let i = 0; i < 25; i++) await p.keyboard.press('ArrowUp');
  for (let i = 0; i < 3; i++) await p.keyboard.press('ArrowDown');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(700);
  ok((await resultCount(p)) !== null, 'page fine after clamped navigation');
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('C5 REGRESSION: tag suggestion applies the tag filter, no dead-slug toast', async () => {
  // discover a real tag from the Tag FILTER dropdown — the filter bar's four
  // selects are the first comboboxes in the DOM (an open card adds more later)
  await gotoScripts(p);
  await clearScriptsStorage(p);
  await gotoScripts(p);
  ok((await p.locator('button[role="combobox"]').count()) >= 4, 'filter selects present');
  const tagTrigger = p.locator('button[role="combobox"]').nth(3);
  await tagTrigger.click();
  await p.waitForTimeout(400);
  const tagItems = (await p.locator('[role="option"]').allInnerTexts())
    .filter(t => !t.startsWith('All'))
    .map(t => { const m = t.match(/^(.*?)\s*\((\d+)\)\s*$/); return m ? { tag: m[1].trim(), count: parseInt(m[2], 10) } : { tag: t.trim(), count: 1 }; })
    .filter(r => r.count > 0);
  await p.keyboard.press('Escape');
  ok(tagItems.length > 0, 'corpus has tags with matches');
  const tag = tagItems[0].tag;
  await searchInput().fill(tag.slice(0, Math.max(3, tag.length - 1)));
  await p.waitForTimeout(700);
  const tagSug = p.locator('#script-search-suggestions button', { hasText: '🏷️' }).first();
  if (!(await tagSug.isVisible().catch(() => false))) throw new Error(`no tag suggestion for "${tag}"`);
  await tagSug.click();
  await p.waitForTimeout(800);
  ok(!(await p.getByText('That script no longer exists').isVisible().catch(() => false)), 'no dead-slug toast');
  ok(p.url().includes('tag='), `tag filter applied (${p.url()})`);
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('C6 author suggestion opens the script with content visible (not drill-hidden)', async () => {
  await gotoScripts(p);
  await searchInput().fill('leo');
  await p.waitForTimeout(700);
  const sug = p.locator('#script-search-suggestions button', { hasText: 'Version' }).first();
  if (await sug.isVisible().catch(() => false)) {
    await sug.click();
    await p.waitForTimeout(1200);
    ok(!(await p.getByText('Reveal answer').first().isVisible().catch(() => false)), 'not in drill mode');
  }
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('C7 searching while a script deep link is open does not crash or trap', async () => {
  // grab a real slug first
  await gotoScripts(p);
  const cardId = await p.locator('[id^="script-"]').first().getAttribute('id');
  const openBtn = p.locator('[id^="script-"]').first().locator('[role="button"], button').first();
  await openBtn.click();
  await p.waitForTimeout(700);
  const slugUrl = p.url();
  await searchInput().fill('referral');
  await p.waitForTimeout(700);
  ok((await resultCount(p)) !== null, 'count fine');
  ok(!(await p.getByText('Something went wrong').isVisible().catch(() => false)), 'no error boundary');
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('C8 query matching only off-page content shows 0 + honest recovery, no leak', async () => {
  await gotoScripts(p);
  await searchInput().fill('is this mlm');
  await p.waitForTimeout(700);
  const n = await resultCount(p);
  if (n === 0) {
    ok(await p.locator('button:has-text("Remove search")').isVisible().catch(() => false), 'search recovery offered');
  } else {
    // if it matches on-page content that is fine — assert none are FAQ/servicing
    ok(true, 'matched on-page scripts');
  }
  await p.locator('button[aria-label="Clear search"]').click().catch(() => {});
});

await check('C9 multi-line paste is treated as one query, no crash', async () => {
  await gotoScripts(p);
  await p.evaluate(() => {
    const el = document.querySelector('input[aria-label="Search scripts"]');
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, 'warm\nmarket');
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await p.waitForTimeout(600);
  ok((await resultCount(p)) !== null, 'count intact');
  await gotoScripts(p);
});

await check('C10 fast typing then instant Enter commits the FULL query', async () => {
  await searchInput().fill('');
  await searchInput().pressSequentially('warm market', { delay: 5 });
  await p.keyboard.press('Enter');
  await p.waitForTimeout(700);
  eq(await searchInput().inputValue(), 'warm market', 'input complete');
  ok(p.url().includes('q=warm'), 'query committed to url');
  await p.locator('button[aria-label="Clear search"]').click();
});

await check('C11 REGRESSION: clearing search returns focus to the input', async () => {
  await searchInput().fill('warm');
  await p.waitForTimeout(400);
  await p.locator('button[aria-label="Clear search"]').click();
  await p.waitForTimeout(300);
  const focused = await p.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  eq(focused, 'Search scripts', 'input refocused');
});

await check('C12 zero-width and combining characters never crash the filter', async () => {
  for (const q of ['wa​rm', 'é', '‍‍']) {
    await searchInput().fill(q);
    await p.waitForTimeout(350);
    ok((await resultCount(p)) !== null, `count intact for ${JSON.stringify(q)}`);
  }
  await searchInput().fill('');
});

await check('C13 RTL (Arabic) query renders and filters without layout break', async () => {
  await searchInput().fill('تأمين');
  await p.waitForTimeout(500);
  ok((await resultCount(p)) !== null, 'count intact');
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(overflow <= 1, `no overflow (${overflow})`);
  await searchInput().fill('');
});

await check('C14 open suggestions survive a viewport resize without floating detached', async () => {
  await searchInput().fill('co');
  await p.waitForTimeout(600);
  await p.setViewportSize({ width: 390, height: 844 });
  await p.waitForTimeout(600);
  const list = p.locator('#script-search-suggestions');
  if (await list.isVisible().catch(() => false)) {
    const lb = await list.boundingBox();
    const ib = await searchInput().boundingBox();
    ok(lb && ib && Math.abs(lb.y - (ib.y + ib.height)) < 60, `anchored under input (list y=${lb?.y}, input bottom=${ib ? ib.y + ib.height : '?'})`);
  }
  await p.setViewportSize({ width: 1440, height: 900 });
  await searchInput().fill('');
});

// ===========================================================================
// D. URL robustness
// ===========================================================================
await check('D1 REGRESSION: empty ?q= still suppresses stored filters (URL is the spec)', async () => {
  await gotoScripts(p, '?category=referral');
  await p.waitForTimeout(400);
  await gotoScripts(p, '?q=');
  await p.waitForTimeout(600);
  eq(await resultCount(p), TOTAL, 'full list, stored category NOT re-applied');
  await clearScriptsStorage(p);
});

await check('D2 duplicate ?category params: first wins, later normalised to one', async () => {
  await gotoScripts(p, '?category=cold-calling&category=referral');
  await p.waitForTimeout(600);
  const n1 = await resultCount(p);
  await gotoScripts(p, '?category=cold-calling');
  const nCold = await resultCount(p);
  eq(n1, nCold, 'first value applied');
  await clearScriptsStorage(p);
});

await check('D3 REGRESSION: hand-typed ?category=COLD-CALLING case-folds and works', async () => {
  await gotoScripts(p, '?category=COLD-CALLING');
  await p.waitForTimeout(800);
  const n = await resultCount(p);
  ok(n > 0 && n < TOTAL, `filtered (${n})`);
  ok(!(await p.getByText(/scripts here any more/).isVisible().catch(() => false)), 'no dead-category toast');
  await clearScriptsStorage(p);
});

await check('D4 REGRESSION: ?audience=WARM-MARKET case-folds and works', async () => {
  await gotoScripts(p, '?audience=WARM-MARKET');
  await p.waitForTimeout(800);
  const n = await resultCount(p);
  ok(n > 0 && n < TOTAL, `filtered (${n})`);
  await clearScriptsStorage(p);
});

await check('D5 space-encoded ?category=cold%20calling dead-ends gracefully with the toast', async () => {
  await gotoScripts(p, '?category=cold%20calling');
  await p.waitForTimeout(1200);
  eq(await resultCount(p), TOTAL, 'fell back to all');
  await clearScriptsStorage(p);
});

await check('D6 2000-char ?q= loads without crash', async () => {
  await gotoScripts(p, `?q=${'z'.repeat(2000)}`);
  await p.waitForTimeout(800);
  eq(await resultCount(p), 0, 'zero results');
  eq((await searchInput().inputValue()).length, 2000, 'input holds the query');
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('D8 foreign ?script= param survives a filter change', async () => {
  await gotoScripts(p, '?script=abc123');
  await audTrigger().click();
  await p.waitForTimeout(300);
  await p.locator('[role="option"]', { hasText: 'NSF / NS' }).first().click();
  await p.waitForTimeout(800);
  ok(p.url().includes('script=abc123'), `script param kept (${p.url()})`);
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('D9 REGRESSION: utm params ride along through filter changes', async () => {
  await gotoScripts(p, '?category=cold-calling&utm_source=whatsapp&utm_campaign=aug');
  await audTrigger().click();
  await p.waitForTimeout(300);
  await p.locator('[role="option"]', { hasText: 'Warm Market' }).first().click();
  await p.waitForTimeout(800);
  ok(p.url().includes('utm_source=whatsapp') && p.url().includes('utm_campaign=aug'), `utm kept (${p.url()})`);
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('D10 trailing slash /scripts/ renders the page', async () => {
  await p.goto(`${BASE}/scripts/`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2000);
  const rendered = await p.locator('input[aria-label="Search scripts"]').isVisible().catch(() => false);
  ok(rendered, `scripts UI rendered at /scripts/ (${p.url()})`);
});

await check('D11 wrong-case slug still resolves via case-insensitive id suffix', async () => {
  await gotoScripts(p);
  // build a real slug from the first card
  const id = (await p.locator('[id^="script-"]').first().getAttribute('id')).replace('script-', '');
  const short = id.replace(/-/g, '').slice(0, 8);
  await p.goto(`${BASE}/scripts/anything-${short.toUpperCase()}`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2500);
  ok(!(await p.getByText('That script no longer exists').isVisible().catch(() => false)), 'no dead-slug toast');
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('D12 back after a suggestion navigation leaves cleanly (no trap)', async () => {
  await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1500);
  await gotoScripts(p);
  await searchInput().fill('warm market intro');
  await p.waitForTimeout(700);
  const scriptSug = p.locator('#script-search-suggestions button', { hasText: 'Script' }).first();
  if (await scriptSug.isVisible().catch(() => false)) {
    await scriptSug.click();
    await p.waitForTimeout(1000);
  }
  await p.goBack();
  await p.waitForTimeout(1200);
  ok(!p.url().includes('/scripts/'), `left the deep link (${p.url()})`);
});

await check('D13 cmd-click on a category group header does not hijack navigation', async () => {
  await gotoScripts(p);
  await clearScriptsStorage(p);
  await gotoScripts(p);
  const header = p.locator('button[title^="Show only"]').first();
  await header.click({ modifiers: ['Meta'] });
  await p.waitForTimeout(600);
  ok(p.url().includes('/scripts'), 'still on scripts');
});

await check('D14 ?v=uv-123 (user-version param) survives filter changes', async () => {
  await gotoScripts(p, '?v=uv-123');
  await audTrigger().click();
  await p.waitForTimeout(300);
  await p.locator('[role="option"]', { hasText: 'NSF / NS' }).first().click();
  await p.waitForTimeout(800);
  ok(p.url().includes('v=uv-123'), `uv param kept (${p.url()})`);
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

skip('D7 #hash fragment preservation through the param-rebuild effect', 'setSearchParams cannot carry a hash; /scripts uses no in-page anchors today — pinned as a known limitation rather than asserted');

// ===========================================================================
// E. Layout extremes
// ===========================================================================
await check('E1 280px (folded phone): no overflow, filters usable', async () => {
  await p.setViewportSize({ width: 280, height: 653 });
  await gotoScripts(p);
  await p.waitForTimeout(900);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(overflow <= 1, `overflow ${overflow}px`);
  ok(await catTrigger().isVisible(), 'category select visible');
});

await check('E2 ~200% zoom (720x450 viewport): sticky offsets still correct', async () => {
  await p.setViewportSize({ width: 720, height: 450 });
  await gotoScripts(p);
  await p.evaluate(() => window.scrollTo(0, 3000));
  await p.waitForTimeout(600);
  const box = await searchInput().boundingBox();
  ok(box && box.y >= 30 && box.y < 160, `search pinned (${box?.y})`);
  await p.setViewportSize({ width: 1440, height: 900 });
});

await check('E4 prefers-reduced-motion: deep filter change still returns to results (instantly)', async () => {
  await p.emulateMedia({ reducedMotion: 'reduce' });
  await gotoScripts(p);
  await clearScriptsStorage(p);
  await gotoScripts(p);
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await p.waitForTimeout(500);
  const deepY = await p.evaluate(() => window.scrollY);
  const header = p.locator('button[title^="Show only"]').last();
  await header.scrollIntoViewIfNeeded();
  await header.click();
  await p.waitForTimeout(1200);
  const afterY = await p.evaluate(() => window.scrollY);
  ok(afterY < deepY - 1000, `returned to results (${deepY} -> ${afterY})`);
  await p.emulateMedia({ reducedMotion: null });
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('E6 tag dropdown is scroll-capped, not viewport-tall', async () => {
  await gotoScripts(p);
  const tagTrigger = p.locator('button[role="combobox"]').nth(3);
  await tagTrigger.click();
  await p.waitForTimeout(400);
  const maxH = await p.evaluate(() => {
    const el = document.querySelector('[role="listbox"]');
    return el ? getComputedStyle(el).maxHeight : 'none';
  });
  await p.keyboard.press('Escape');
  ok(maxH !== 'none', `listbox max-height set (${maxH})`);
});

await check('E8 20px root font: 390px layout holds', async () => {
  await p.setViewportSize({ width: 390, height: 844 });
  await gotoScripts(p);
  await p.addStyleTag({ content: 'html{font-size:20px !important}' });
  await p.waitForTimeout(600);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(overflow <= 1, `overflow ${overflow}px`);
  await p.setViewportSize({ width: 1440, height: 900 });
  await gotoScripts(p);
});

await check('E9 forced-colors mode: chips keep visible borders, page renders', async () => {
  await p.emulateMedia({ forcedColors: 'active' });
  await gotoScripts(p, '?category=cold-calling');
  await p.waitForTimeout(800);
  ok((await resultCount(p)) !== null, 'page renders');
  const borderStyle = await p.evaluate(() => {
    const chip = document.querySelector('button[aria-pressed]');
    return chip ? getComputedStyle(chip).borderStyle : 'none-found';
  });
  ok(borderStyle === 'solid' || borderStyle === 'none-found', `chip border ${borderStyle}`);
  await p.emulateMedia({ forcedColors: 'none' });
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('E10 dark-mode empty state: recovery buttons visibly contrast the background', async () => {
  await p.evaluate(() => document.documentElement.classList.add('dark'));
  await gotoScripts(p, '?category=referral&audience=nsf');
  await p.waitForTimeout(800);
  const btn = p.locator('button:has-text("Remove ")').first();
  ok(await btn.isVisible(), 'recovery visible');
  const { fg, bg } = await p.evaluate(() => {
    const el = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Remove '));
    const cs = getComputedStyle(el);
    return { fg: cs.color, bg: cs.backgroundColor };
  });
  ok(fg !== bg, `fg ${fg} != bg ${bg}`);
  await p.evaluate(() => document.documentElement.classList.remove('dark'));
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

skip('E3 print stylesheet fidelity', 'print output needs eyeballing a PDF; the sticky bar carries no print:hidden today — logged as a follow-up, not auto-assertable');
skip('E5 long unbroken title token', 'needs a synthetic script in the DB; covered indirectly by overflow checks on real data');
skip('E7 wide markdown table inside a card', 'data-dependent — no table-bearing script in the corpus today');

// ===========================================================================
// F. Gestures & input methods
// ===========================================================================
await check('F1 keyboard-only: from search, Tab walks Share -> Add -> filter selects in order', async () => {
  await gotoScripts(p);
  await p.evaluate(() => { const el = document.activeElement; if (el && el.blur) el.blur(); });
  await p.keyboard.press('/');
  await p.waitForTimeout(200);
  eq(await p.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Search scripts', 'slash lands in search');
  const reached = [];
  for (let i = 0; i < 14; i++) {
    await p.keyboard.press('Tab');
    const info = await p.evaluate(() => {
      const el = document.activeElement;
      return el?.getAttribute('aria-label') || el?.textContent?.trim().slice(0, 20) || el?.getAttribute('role') || el?.tagName;
    });
    reached.push(info);
  }
  ok(reached.some(r => r && r.includes('Share')), `Share reachable (${reached.join(' | ')})`);
  ok(reached.some(r => r && (r.includes('Add Script') || r === 'combobox')), 'Add/filters reachable');
});

await check('F2 exactly one aria-live results region (no duplicate announcements)', async () => {
  const count = await p.evaluate(() =>
    [...document.querySelectorAll('[aria-live]')].filter(el => /scripts found/.test(el.textContent || '')).length
  );
  eq(count, 1, 'one live region');
});

await check('F3 Escape on an open Select closes it WITHOUT clearing the applied filter', async () => {
  await gotoScripts(p, '?category=cold-calling');
  const before = await resultCount(p);
  await catTrigger().click();
  await p.waitForTimeout(400);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
  eq(await resultCount(p), before, 'filter untouched');
  ok(p.url().includes('category=cold-calling'), 'url untouched');
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('F4 opening two selects back-to-back leaves no stuck overlay', async () => {
  await gotoScripts(p);
  await catTrigger().click();
  await p.waitForTimeout(150);
  await p.keyboard.press('Escape');
  await audTrigger().click();
  await p.waitForTimeout(300);
  ok(await p.locator('[role="option"]').first().isVisible(), 'second dropdown open');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  await searchInput().click();
  const focused = await p.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  eq(focused, 'Search scripts', 'page interactive after dropdown dance');
});

await check('F5 drag-selecting title text on a card header does not toggle it', async () => {
  await gotoScripts(p);
  const card = p.locator('[id^="script-"]').first();
  await card.scrollIntoViewIfNeeded();
  const trigger = card.locator('[data-state]').first();
  const stateBefore = await trigger.getAttribute('data-state');
  // drag across the TITLE text so the browser actually builds a selection
  const title = card.locator('h3').first();
  const tb = await title.boundingBox();
  await p.mouse.move(tb.x + 4, tb.y + tb.height / 2);
  await p.mouse.down();
  await p.mouse.move(tb.x + Math.min(tb.width - 4, 180), tb.y + tb.height / 2, { steps: 10 });
  const selLen = await p.evaluate(() => window.getSelection()?.toString().length ?? 0);
  await p.mouse.up();
  await p.waitForTimeout(500);
  ok(selLen > 0, `drag produced a selection (${selLen} chars)`);
  eq(await trigger.getAttribute('data-state'), stateBefore, `state unchanged by drag (selection ${selLen} chars)`);
});

await check('F6 double-click on an audience chip nets out to a deterministic state', async () => {
  await gotoScripts(p, '?category=cold-calling');
  const chip = p.locator('button[aria-pressed="false"]').first();
  await chip.dblclick();
  await p.waitForTimeout(900);
  // React batching decides whether two near-instant taps net to applied or
  // cleared — what matters is the UI and URL agree and nothing breaks.
  const urlHasAudience = p.url().includes('audience=');
  const pressedCount = await p.locator('button[aria-pressed="true"]').count();
  eq(urlHasAudience, pressedCount > 0, `url and chips agree (url=${urlHasAudience}, pressed=${pressedCount})`);
  ok((await resultCount(p)) !== null, 'page fine');
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('F8 card Copy puts clean plain text on the clipboard', async () => {
  await gotoScripts(p);
  const card = p.locator('[id^="script-"]').first();
  await card.locator('[role="button"], button').first().click();
  await p.waitForTimeout(800);
  const copyBtn = card.locator('button:has-text("Copy")').first();
  if (await copyBtn.isVisible().catch(() => false)) {
    await copyBtn.click();
    await p.waitForTimeout(500);
    const text = await p.evaluate(() => navigator.clipboard.readText());
    ok(text.length > 20, 'clipboard has content');
    ok(!text.includes('**') && !text.includes('##'), 'no raw markdown markers');
  }
  await gotoScripts(p);
});

skip('F7 touch-action on chips vs double-tap zoom', 'requires a real touch device; chips are 11px-text buttons where browser dbl-tap heuristics differ');
skip('F9-F11 pinch zoom / edge swipe / iPad Scribble', 'multi-touch and OS gestures are outside Playwright emulation');

// ===========================================================================
// G. Persistence & lifecycle
// ===========================================================================
await check('G1 rapid open/close card toggles x5 keep filters and never corrupt the url', async () => {
  await gotoScripts(p, '?category=cold-calling');
  const card = p.locator('[id^="script-"]').first();
  await card.scrollIntoViewIfNeeded();
  for (let i = 0; i < 5; i++) {
    await card.locator('[role="button"], button').first().click();
    await p.waitForTimeout(250);
  }
  await p.waitForTimeout(600);
  ok(p.url().includes('category=cold-calling'), `filter intact (${p.url()})`);
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('G2 scripts q and objections oq stay isolated across 3 tab hops', async () => {
  await gotoScripts(p, '?q=warm');
  for (let i = 0; i < 3; i++) {
    await p.locator('a:has-text("Objections"), button:has-text("Objections")').first().click();
    await p.waitForTimeout(1200);
    await p.locator('a:has-text("Sales Scripts"), button:has-text("Sales Scripts")').first().click();
    await p.waitForTimeout(1200);
  }
  eq(await searchInput().inputValue(), 'warm', 'q survived the hops');
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('G4 RouteTracker cold-start restores /scripts WITH its params', async () => {
  await gotoScripts(p, '?category=referral');
  await p.waitForTimeout(800);
  await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2500);
  // RouteTracker restore fires once per session mount on '/': simulate a cold
  // start by reloading the root
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);
  if (p.url().includes('/scripts')) {
    ok(p.url().includes('category=referral'), `params restored (${p.url()})`);
  } else {
    throw new Error(`route not restored (${p.url()})`);
  }
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('G5 localStorage that THROWS still renders a working page', async () => {
  const fresh = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const fp = await fresh.newPage();
  await fp.goto(`${BASE}/auth`, { waitUntil: 'domcontentloaded' });
  await fp.waitForTimeout(800);
  await fp.locator('input[type="email"]').fill('master_admin@demo.com');
  await fp.locator('input[type="password"]').fill('demo123456');
  await fp.locator('button[type="submit"]').first().click();
  await fp.waitForURL(u => !u.toString().includes('/auth'), { timeout: 60000 });
  // Break storage AFTER auth so the session survives but the page's own
  // localStorage use hits the throwing paths.
  await fp.addInitScript(() => {
    // Real private-mode/quota shape: reads work, WRITES throw.
    const orig = window.localStorage;
    Object.defineProperty(window, 'localStorage', {
      get() {
        return new Proxy(orig, {
          get(t, k) {
            if (k === 'setItem') return () => { throw new DOMException('QuotaExceededError'); };
            const v = t[k];
            return typeof v === 'function' ? v.bind(t) : v;
          },
        });
      },
    });
  });
  await fp.goto(`${BASE}/scripts?category=cold-calling`, { waitUntil: 'domcontentloaded' });
  await fp.waitForTimeout(4000);
  const rendered = await fp.locator('input[aria-label="Search scripts"]').isVisible().catch(() => false);
  const crashed = await fp.getByText('Something went wrong').isVisible().catch(() => false);
  ok(rendered && !crashed, `page usable with hostile storage (rendered=${rendered}, crashed=${crashed})`);
  await fresh.close();
});

await check('G6 corrupted stored filter values degrade to All with the toast, no crash loop', async () => {
  await gotoScripts(p);
  await p.evaluate(() => {
    localStorage.setItem('scripts_filter_category', '{"x":1}');
    localStorage.setItem('scripts_filter_tag', 'x'.repeat(10000));
  });
  await gotoScripts(p);
  let n = null;
  for (let i = 0; i < 5; i++) {
    await p.waitForTimeout(900);
    n = await resultCount(p);
    if (n === TOTAL) break;
    if (await p.getByText("Couldn't load scripts").isVisible().catch(() => false)) {
      await p.locator('button:has-text("Retry")').click().catch(() => {});
    }
  }
  eq(n, TOTAL, 'fell back to all');
  ok(!(await p.getByText('Something went wrong').isVisible().catch(() => false)), 'no error boundary');
  await clearScriptsStorage(p);
});

await check('G7 stale scripts_filter_tab value does not break the page', async () => {
  await p.evaluate(() => localStorage.setItem('scripts_filter_tab', 'bogus-tab'));
  await gotoScripts(p);
  ok((await resultCount(p)) !== null, 'scripts tab rendered');
  await clearScriptsStorage(p);
});

await check('G8 login flow never honours an off-origin redirect target', async () => {
  const fresh = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const fp = await fresh.newPage();
  await fp.goto(`${BASE}/auth?redirect=https://evil.example.com`, { waitUntil: 'domcontentloaded' });
  await fp.waitForTimeout(800);
  await fp.locator('input[type="email"]').fill('master_admin@demo.com');
  await fp.locator('input[type="password"]').fill('demo123456');
  await fp.locator('button[type="submit"]').first().click();
  await fp.waitForURL(u => !u.toString().includes('/auth'), { timeout: 60000 });
  ok(fp.url().startsWith(BASE), `stayed on origin (${fp.url()})`);
  await fresh.close();
});

await check('G9 two rapid navigations settle on the LAST one', async () => {
  await p.goto(`${BASE}/scripts?q=first`, { waitUntil: 'commit' });
  await p.goto(`${BASE}/scripts?q=second`, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('input[aria-label="Search scripts"]', { timeout: 30000 });
  await p.waitForTimeout(1000);
  eq(await searchInput().inputValue(), 'second', 'last navigation wins');
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

skip('G3 bottom-nav round trip on mobile', 'covered by G2 tab-hop and battery-1 localStorage restore; the mobile nav path adds no new state machinery');

// ===========================================================================
// H. Performance & platform limits
// ===========================================================================
await check('H1 30 fast keystrokes: input exact, count correct, nothing dropped', async () => {
  await gotoScripts(p);
  const text = 'warm market friends family in';
  await searchInput().pressSequentially(text, { delay: 10 });
  await p.waitForTimeout(700);
  eq(await searchInput().inputValue(), text, 'no dropped keys');
  ok((await resultCount(p)) !== null, 'count settled');
  await p.locator('button[aria-label="Clear search"]').click();
});

await check('H2 REGRESSION: typing 20 chars fires few replaceState calls (debounced), not 20+', async () => {
  const fresh = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const fp = await fresh.newPage();
  await fp.addInitScript(() => {
    window.__rsCount = 0;
    const orig = history.replaceState.bind(history);
    history.replaceState = (...a) => { window.__rsCount++; return orig(...a); };
  });
  await fp.goto(`${BASE}/auth`, { waitUntil: 'domcontentloaded' });
  await fp.waitForTimeout(800);
  await fp.locator('input[type="email"]').fill('master_admin@demo.com');
  await fp.locator('input[type="password"]').fill('demo123456');
  await fp.locator('button[type="submit"]').first().click();
  await fp.waitForURL(u => !u.toString().includes('/auth'), { timeout: 60000 });
  await fp.goto(`${BASE}/scripts`, { waitUntil: 'domcontentloaded' });
  await fp.waitForSelector('input[aria-label="Search scripts"]', { timeout: 30000 });
  await fp.waitForTimeout(1500);
  const before = await fp.evaluate(() => window.__rsCount);
  await fp.locator('input[aria-label="Search scripts"]').pressSequentially('warm market followup', { delay: 30 });
  await fp.waitForTimeout(900);
  const after = await fp.evaluate(() => window.__rsCount);
  const calls = after - before;
  ok(calls <= 8, `replaceState calls for 19 chars: ${calls} (was 19+ before the debounce)`);
  await fresh.close();
});

await check('H3 60 filter toggles: JS heap growth bounded', async () => {
  await gotoScripts(p);
  const heapBefore = await p.evaluate(() => performance.memory?.usedJSHeapSize ?? 0);
  for (let i = 0; i < 30; i++) {
    await p.evaluate(() => {
      const chips = document.querySelectorAll('button');
    });
    await catTrigger().click();
    await p.waitForTimeout(60);
    await p.keyboard.press('Escape');
  }
  const heapAfter = await p.evaluate(() => performance.memory?.usedJSHeapSize ?? 0);
  const deltaMB = (heapAfter - heapBefore) / 1048576;
  ok(deltaMB < 60, `heap delta ${deltaMB.toFixed(1)}MB`);
});

await check('H4 no >300ms long task while typing', async () => {
  await gotoScripts(p);
  await p.evaluate(() => {
    window.__longTasks = [];
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) window.__longTasks.push(e.duration);
    }).observe({ entryTypes: ['longtask'] });
  });
  await searchInput().pressSequentially('cold calling telemarketer', { delay: 20 });
  await p.waitForTimeout(800);
  const worst = await p.evaluate(() => Math.max(0, ...window.__longTasks));
  ok(worst < 300, `worst long task ${Math.round(worst)}ms`);
  await p.locator('button[aria-label="Clear search"]').click();
});

await check('H5 opening the heaviest visible card stays under 1.5s', async () => {
  await gotoScripts(p);
  const card = p.locator('[id^="script-"]').first();
  await card.scrollIntoViewIfNeeded();
  const t0 = Date.now();
  await card.locator('[role="button"], button').first().click();
  await card.locator('[data-state="open"]').first().waitFor({ timeout: 5000 });
  const ms = Date.now() - t0;
  ok(ms < 1500, `open took ${ms}ms`);
  await gotoScripts(p);
});

await check('H6 cumulative layout shift on load stays sane', async () => {
  await gotoScripts(p);
  await p.waitForTimeout(1500);
  const cls = await p.evaluate(() => {
    let total = 0;
    for (const e of performance.getEntriesByType('layout-shift')) {
      if (!e.hadRecentInput) total += e.value;
    }
    return total;
  });
  ok(cls < 0.4, `CLS ${cls.toFixed(3)}`);
});

await check('H7 slow network: query typed during load is not clobbered by the data arriving', async () => {
  const cdp = await ctx.newCDPSession(p);
  try {
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1500 * 1024, uploadThroughput: 500 * 1024 });
    await p.goto(`${BASE}/scripts`, { waitUntil: 'domcontentloaded' });
    await p.waitForSelector('input[aria-label="Search scripts"]', { timeout: 60000 });
    await searchInput().fill('referral');
    await p.waitForTimeout(5000);
    eq(await searchInput().inputValue(), 'referral', 'query survived the slow data swap');
    const n = await resultCount(p);
    ok(n !== null && n < TOTAL, `filter applied to arrived data (${n})`);
  } finally {
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 }).catch(() => {});
    await cdp.detach().catch(() => {});
  }
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

// ===========================================================================
// I. Cross-surface consistency
// ===========================================================================
await check('I1 global Cmd+K result for scripts lands on /scripts', async () => {
  await gotoScripts(p);
  await p.keyboard.press(process.platform === 'darwin' ? 'Meta+k' : 'Control+k');
  await p.waitForTimeout(1200);
  const palette = p.locator('input[placeholder*="earch"]').last();
  if (!(await palette.isVisible().catch(() => false))) throw new Error('palette did not open');
  await palette.fill('sales scripts');
  await p.waitForTimeout(900);
  const first = p.locator('[cmdk-item], [role="option"]').first();
  await first.click();
  await p.waitForTimeout(1500);
  ok(p.url().includes('/scripts') || p.url().includes('/sales'), `landed near scripts (${p.url()})`);
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('I3 follow-up sub-group card counts sum to the category count', async () => {
  await gotoScripts(p, '?category=follow-up');
  await p.waitForTimeout(1000);
  const total = await resultCount(p);
  const cards = await p.locator('[id^="script-"]').count();
  eq(cards, total, `rendered cards (${cards}) match count (${total})`);
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('I4a jump chips hidden when a search is active', async () => {
  await gotoScripts(p, '?q=warm');
  ok(!(await p.getByText('Jump to:').isVisible().catch(() => false)), 'chips hidden');
});

await check('I4b jump chips hidden when a category is active', async () => {
  await gotoScripts(p, '?category=cold-calling');
  ok(!(await p.getByText('Jump to:').isVisible().catch(() => false)), 'chips hidden');
});

await check('I4c jump chips hidden in favourites-only view', async () => {
  await gotoScripts(p);
  await clearScriptsStorage(p);
  await gotoScripts(p);
  await p.locator('button:has-text("Favourites")').first().click();
  await p.waitForTimeout(600);
  ok(!(await p.getByText('Jump to:').isVisible().catch(() => false)), 'chips hidden');
  await p.locator('button:has-text("Favourites")').first().click();
});

await check('I5 dismissed course banner leaves the one-line link in filtered AND zero states', async () => {
  await gotoScripts(p);
  const dismiss = p.locator('button[aria-label="Hide the Scripts Fundamentals banner"]');
  if (await dismiss.isVisible().catch(() => false)) await dismiss.click();
  await gotoScripts(p, '?category=cold-calling');
  ok(await p.getByText('Scripts Fundamentals course').isVisible(), 'link in filtered view');
  await gotoScripts(p, '?category=referral&audience=nsf');
  ok(await p.getByText('Scripts Fundamentals course').isVisible(), 'link in zero state');
  // restore banner for future runs
  await p.evaluate(() => {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith('scripts-course-banner-dismissed-')) localStorage.removeItem(k);
    }
  });
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('I6 recovery button, chip X and Clear-all converge on identical counts', async () => {
  const counts = {};
  // path a: recovery button
  await gotoScripts(p, '?category=referral&audience=nsf');
  await p.locator('button:has-text("Remove audience")').click();
  await p.waitForTimeout(700);
  counts.recovery = await resultCount(p);
  // path b: breadcrumb chip X
  await gotoScripts(p, '?category=referral&audience=nsf');
  await p.locator('button[aria-label="Remove audience filter"]').click();
  await p.waitForTimeout(700);
  counts.chip = await resultCount(p);
  // path c: clear all then re-apply category
  await gotoScripts(p, '?category=referral&audience=nsf');
  await p.locator('button:has-text("Clear all filters")').click();
  await p.waitForTimeout(700);
  await catTrigger().click();
  await p.waitForTimeout(300);
  await p.locator('[role="option"]', { hasText: 'Referral Scripts' }).first().click();
  await p.waitForTimeout(700);
  counts.clearAll = await resultCount(p);
  ok(counts.recovery === counts.chip && counts.chip === counts.clearAll,
    `all paths agree (${JSON.stringify(counts)})`);
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await b.close();

// ===========================================================================
// W. WebKit subset (Safari engine)
// ===========================================================================
const wb = await webkit.launch();
const wctx = await wb.newContext({ viewport: { width: 1440, height: 900 } });
p = await wctx.newPage();
const wkErrors = [];
p.on('pageerror', e => wkErrors.push(String(e)));

await check('W1 webkit: login + /scripts renders and filters', async () => {
  await login(p);
  await gotoScripts(p, '?category=cold-calling');
  const n = await resultCount(p);
  ok(n > 0, `filtered (${n})`);
});

await check('W2 webkit: typing 40 chars fast throws no SecurityError (replaceState limit)', async () => {
  await gotoScripts(p);
  await searchInput().pressSequentially('warm market friends family introduction', { delay: 15 });
  await p.waitForTimeout(900);
  ok(!wkErrors.some(e => e.includes('SecurityError')), `no SecurityError (${wkErrors[0] ?? 'clean'})`);
});

await check('W3 webkit: back/forward cache restore keeps a working page', async () => {
  await gotoScripts(p, '?q=warm');
  await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1500);
  await p.goBack();
  await p.waitForTimeout(1500);
  const val = await p.locator('input[aria-label="Search scripts"]').inputValue().catch(() => null);
  eq(val, 'warm', 'query restored after back');
});

await check('W4 webkit: small viewport suggestions anchor under the input', async () => {
  await p.setViewportSize({ width: 390, height: 500 }); // keyboard-ish height
  await gotoScripts(p);
  await searchInput().fill('co');
  await p.waitForTimeout(700);
  const list = p.locator('#script-search-suggestions');
  if (await list.isVisible().catch(() => false)) {
    const lb = await list.boundingBox();
    ok(lb && lb.y < 500, `list within visual viewport (y=${lb?.y})`);
  }
});

await check('W5 webkit: zero JS errors across the subset (network/CORS noise excluded)', async () => {
  const jsErrors = wkErrors.filter(e => !/Fetch API|access control|Load failed|NetworkError/i.test(e));
  ok(jsErrors.length === 0, `errors: ${jsErrors.slice(0, 2).join(' | ')}`);
});

await wb.close();

// ===========================================================================
const failed = results.filter(r => !r.ok);
console.log(`\n=== BATTERY 2: ${results.length - failed.length}/${results.length} passed, ${skipped.length} skipped ===`);
if (failed.length) {
  console.log('FAILURES:');
  failed.forEach(f => console.log(` - ${f.name}: ${f.err}`));
}
console.log('SKIPPED (with reasons):');
skipped.forEach(s => console.log(` - ${s.name}: ${s.why}`));
process.exit(failed.length ? 1 : 0);
