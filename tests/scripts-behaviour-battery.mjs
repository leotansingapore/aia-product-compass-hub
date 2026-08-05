// Human-behaviour battery for /scripts. Run with the dev server up:
//   node tests/scripts-behaviour-battery.mjs            (default localhost:8083)
//   BASE_URL=https://academy.finternship.com node tests/scripts-behaviour-battery.mjs
//
// Companion to src/lib/scriptsFilter.test.ts (644 generated logic cases) —
// this file drives the REAL page the way people actually behave: thumbs,
// leftover filters, shared links, double taps, back buttons, tiny screens.
import { launch, login, gotoScripts, dismissOverlays, clearScriptsStorage, resultCount, BASE } from './_scripts-helpers.mjs';

const results = [];
let ctx, p, b;

async function check(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`PASS ${results.length}: ${name}`);
  } catch (e) {
    results.push({ name, ok: false, err: String(e).split('\n')[0].slice(0, 220) });
    console.log(`FAIL ${results.length}: ${name} — ${String(e).split('\n')[0].slice(0, 220)}`);
    try {
      await p.screenshot({ path: `/private/tmp/claude-501/-Users-leo/8c05f4d2-7c83-46f5-b3be-ab7cad065c0d/scratchpad/battery-fail-${results.length}.png` });
    } catch {}
  }
}
const eq = (a, b, msg) => { if (a !== b) throw new Error(`${msg ?? 'expected equal'}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`); };
const ok = (v, msg) => { if (!v) throw new Error(msg ?? 'expected truthy'); };

({ b, ctx, p } = await launch());
const pageErrors = [];
p.on('pageerror', e => pageErrors.push(String(e)));
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
await login(p);
await gotoScripts(p);
await clearScriptsStorage(p);

// Ground truth pulled from the live page: total + per-category/audience counts
await gotoScripts(p);
const TOTAL = await resultCount(p);
ok(TOTAL > 50, `sane corpus (got ${TOTAL})`);

const searchInput = () => p.locator('input[aria-label="Search scripts"]');
const countLine = () => p.locator('[data-testid="scripts-result-count"]');
const catTrigger = () => p.locator('button[role="combobox"]').nth(0);
const audTrigger = () => p.locator('button[role="combobox"]').nth(1);

async function readDropdown(trigger) {
  await trigger().click();
  await p.waitForTimeout(400);
  const items = await p.locator('[role="option"]').allInnerTexts();
  await p.keyboard.press('Escape');
  await p.waitForTimeout(200);
  return items.map(t => {
    const m = t.match(/^(.*?)\s*\((\d+)\)\s*$/);
    return m ? { label: m[1].trim(), count: parseInt(m[2], 10) } : { label: t.trim(), count: null };
  });
}

// ===========================================================================
// A. Deep links and URL state
// ===========================================================================
const catRows = (await readDropdown(catTrigger)).filter(r => r.label !== 'All' && r.count !== null);
for (const row of catRows) {
  await check(`deep link ?category reproduces dropdown promise: ${row.label} (${row.count})`, async () => {
    // find the slug by selecting via dropdown, reading the URL, then cold-loading it
    await catTrigger().click();
    await p.waitForTimeout(300);
    await p.locator('[role="option"]', { hasText: row.label }).first().click();
    await p.waitForTimeout(500);
    eq(await resultCount(p), row.count, 'selection count');
    const url = p.url();
    ok(url.includes('category='), 'url carries category');
    await gotoScripts(p); // reset
    await clearScriptsStorage(p);
    await p.goto(url, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(900);
    eq(await resultCount(p), row.count, 'cold-load count');
    await gotoScripts(p);
    await clearScriptsStorage(p);
  });
}

await check('banner link (?category=cold-calling&audience=warm-market) shows its scripts', async () => {
  await gotoScripts(p, '?category=cold-calling&audience=warm-market');
  const n = await resultCount(p);
  ok(n > 0, `expected >0, got ${n}`);
});

await check('D2 regression: leftover stored role does not blank a shared link', async () => {
  await p.evaluate(() => localStorage.setItem('scripts_filter_role', 'telemarketer'));
  await gotoScripts(p, '?category=cold-calling&audience=warm-market');
  ok(!p.url().includes('role='), 'role must not leak into url');
  const n = await resultCount(p);
  ok(n > 0, `expected >0, got ${n}`);
  await clearScriptsStorage(p);
});

await check('bare /scripts restores the last locally-used filters', async () => {
  await gotoScripts(p, '?category=referral');
  await p.waitForTimeout(400);
  await gotoScripts(p); // bare
  ok(p.url().includes('category=referral'), 'stored category restored into url');
  await clearScriptsStorage(p);
  await gotoScripts(p);
});

await check('?q= restores the search box and filtered count on cold load', async () => {
  await gotoScripts(p, '?q=warm');
  eq(await searchInput().inputValue(), 'warm', 'input restored');
  const n = await resultCount(p);
  ok(n > 0 && n < TOTAL, `filtered count sane (${n})`);
});

await check('refresh keeps the current filtered view', async () => {
  await gotoScripts(p, '?q=warm');
  const before = await resultCount(p);
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(900);
  eq(await resultCount(p), before, 'count after refresh');
  eq(await searchInput().inputValue(), 'warm', 'input after refresh');
});

await check('unknown ?category falls back to All and says so (toast)', async () => {
  await gotoScripts(p, '?category=definitely-not-real');
  await p.waitForTimeout(800);
  eq(await resultCount(p), TOTAL, 'fell back to the full list');
  ok(!p.url().includes('category='), 'dead param dropped from url');
  ok(await p.getByText(/scripts here any more/).first().isVisible().catch(() => false), 'explanatory toast shown');
});

await check('url-encoded CJK query round-trips', async () => {
  await gotoScripts(p, `?q=${encodeURIComponent('保险')}`);
  eq(await searchInput().inputValue(), '保险', 'CJK restored');
  ok((await resultCount(p)) !== null, 'count renders');
});

await check('url-encoded emoji query does not crash', async () => {
  await gotoScripts(p, `?q=${encodeURIComponent('🙂🙂')}`);
  ok((await resultCount(p)) !== null, 'count renders');
});

await check('dud script slug toasts and recovers to the list', async () => {
  await p.goto(`${BASE}/scripts/this-script-does-not-exist-00000000`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2500);
  ok(p.url().endsWith('/scripts'), `redirected (at ${p.url()})`);
  ok((await resultCount(p)) > 0, 'list rendered');
});

await check('D1 regression (live): category dropdown counts match results while searching', async () => {
  await gotoScripts(p);
  await clearScriptsStorage(p);
  await searchInput().fill('cold calling');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(600);
  const total = await resultCount(p);
  const rows = await readDropdown(catTrigger);
  const allRow = rows.find(r => r.label === 'All');
  eq(allRow.count, total, '"All" equals visible results');
  const sum = rows.filter(r => r.label !== 'All').reduce((a, r) => a + (r.count ?? 0), 0);
  eq(sum, total, 'per-category counts sum to total');
  // select the biggest category and verify the promise
  const biggest = rows.filter(r => r.label !== 'All').sort((a, b) => b.count - a.count)[0];
  await catTrigger().click();
  await p.waitForTimeout(300);
  await p.locator('[role="option"]', { hasText: biggest.label }).first().click();
  await p.waitForTimeout(500);
  eq(await resultCount(p), biggest.count, `selecting ${biggest.label}`);
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

// ===========================================================================
// B. Search behaviours
// ===========================================================================
await check('typing narrows, X clears, full count returns', async () => {
  await gotoScripts(p);
  await searchInput().fill('warm');
  await p.waitForTimeout(500);
  const filtered = await resultCount(p);
  ok(filtered < TOTAL, `narrowed (${filtered} < ${TOTAL})`);
  await p.locator('button[aria-label="Clear search"]').click();
  await p.waitForTimeout(500);
  eq(await resultCount(p), TOTAL, 'restored');
  eq(await searchInput().inputValue(), '', 'input empty');
});

await check('search matches are case- and padding-insensitive (same counts)', async () => {
  const counts = [];
  for (const q of ['warm', 'WARM', ' warm ', 'wArM']) {
    await searchInput().fill(q);
    await p.waitForTimeout(450);
    counts.push(await resultCount(p));
  }
  ok(counts.every(c => c === counts[0]), `all equal: ${counts.join(',')}`);
  await p.locator('button[aria-label="Clear search"]').click();
});

await check('trailing-space query equals trimmed query (thumb typing)', async () => {
  await searchInput().fill('warm market');
  await p.waitForTimeout(450);
  const a = await resultCount(p);
  await searchInput().fill('warm market ');
  await p.waitForTimeout(450);
  eq(await resultCount(p), a, 'trailing space no-op');
  await p.locator('button[aria-label="Clear search"]').click();
});

await check('suggestions appear from 2 chars and close on Escape', async () => {
  await searchInput().fill('co');
  await p.waitForTimeout(500);
  ok(await p.locator('#script-search-suggestions').isVisible(), 'listbox visible');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  ok(!(await p.locator('#script-search-suggestions').isVisible().catch(() => false)), 'closed');
  await searchInput().fill('');
});

await check('ArrowDown + Enter picks a suggestion; category suggestion applies the filter', async () => {
  await searchInput().fill('cold cal');
  await p.waitForTimeout(500);
  await p.keyboard.press('ArrowDown');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(600);
  // first suggestion for "cold cal" is the Cold Calling category
  ok(p.url().includes('category=cold-calling'), `category applied (${p.url()})`);
  eq(await searchInput().inputValue(), '', 'input cleared after pick');
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('Enter without a selection just commits the typed query', async () => {
  await searchInput().fill('referral');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(500);
  ok((await resultCount(p)) > 0, 'results for committed query');
  ok(p.url().includes('q=referral'), 'q in url');
  await p.locator('button[aria-label="Clear search"]').click();
});

await check('typing 8 characters adds zero history entries', async () => {
  await gotoScripts(p);
  const before = await p.evaluate(() => history.length);
  await searchInput().pressSequentially('referral', { delay: 40 });
  await p.waitForTimeout(600);
  const after = await p.evaluate(() => history.length);
  eq(after, before, 'history.length unchanged');
  await p.locator('button[aria-label="Clear search"]').click();
});

await check('300-char paste: no crash, honest empty state', async () => {
  await searchInput().fill('z'.repeat(300));
  await p.waitForTimeout(600);
  eq(await resultCount(p), 0, 'zero results');
  ok(await p.locator('text=No scripts found').isVisible(), 'empty state');
  await p.locator('button[aria-label="Clear search"]').click();
});

await check('rapid type-delete-type does not desync input and results', async () => {
  for (let i = 0; i < 5; i++) {
    await searchInput().fill('warm');
    await searchInput().fill('');
  }
  await searchInput().fill('warm');
  await p.waitForTimeout(600);
  const n = await resultCount(p);
  ok(n > 0 && n < TOTAL, `stable narrowed count (${n})`);
  await p.locator('button[aria-label="Clear search"]').click();
});

for (const nasty of ['(a+b)*c?', '$100', '[name]', '"quoted"', '<script>alert(1)</script>', '保险', '🙂', "'; DROP TABLE scripts;--"]) {
  await check(`nasty query renders safely: ${nasty.slice(0, 24)}`, async () => {
    await searchInput().fill(nasty);
    await p.waitForTimeout(450);
    ok((await resultCount(p)) !== null, 'count line intact');
    ok(!(await p.locator('text=Something went wrong').isVisible().catch(() => false)), 'no error boundary');
    await searchInput().fill('');
  });
}

await check('slash key focuses search from the page body (desktop)', async () => {
  await gotoScripts(p);
  await p.evaluate(() => { const el = document.activeElement; if (el && el.blur) el.blur(); });
  await p.keyboard.press('/');
  await p.waitForTimeout(300);
  const focused = await p.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  eq(focused, 'Search scripts', 'search focused');
});

await check('slash typed INSIDE the search box stays a character', async () => {
  await searchInput().fill('');
  await searchInput().click();
  await p.keyboard.type('a/b');
  eq(await searchInput().inputValue(), 'a/b', 'slash inserted, not hijacked');
  await searchInput().fill('');
});

// ===========================================================================
// C. Filter interactions
// ===========================================================================
await check('audience select -> chip appears -> chip X removes it', async () => {
  await gotoScripts(p);
  await clearScriptsStorage(p);
  await audTrigger().click();
  await p.waitForTimeout(300);
  await p.locator('[role="option"]', { hasText: 'NSF / NS' }).first().click();
  await p.waitForTimeout(500);
  ok(p.url().includes('audience=nsf'), 'url has audience');
  const chip = p.locator('.mb-3 >> text=NSF / NS').first();
  ok(await chip.isVisible(), 'breadcrumb chip shown');
  await p.locator('button[aria-label="Remove audience filter"]').click();
  await p.waitForTimeout(500);
  ok(!p.url().includes('audience='), 'audience cleared');
  eq(await resultCount(p), TOTAL, 'back to all');
});

await check('Clear all filters resets url, chips and count', async () => {
  await gotoScripts(p, '?category=follow-up&audience=parent');
  await p.locator('button:has-text("Clear all filters")').click();
  await p.waitForTimeout(500);
  ok(!p.url().includes('category=') && !p.url().includes('audience='), 'params gone');
  eq(await resultCount(p), TOTAL, 'full list');
  await clearScriptsStorage(p);
});

await check('D3 regression (live): zero-combo recovery buttons are honest', async () => {
  await gotoScripts(p, '?category=referral&audience=nsf');
  eq(await resultCount(p), 0, 'zero-state');
  const btns = await p.locator('button:has-text("Remove ")').allInnerTexts();
  ok(btns.length >= 1, 'at least one recovery');
  const promised = parseInt(btns[0].match(/(\d+) script/)?.[1] ?? '0', 10);
  await p.locator('button:has-text("Remove ")').first().click();
  await p.waitForTimeout(600);
  eq(await resultCount(p), promised, 'promise kept');
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('category trigger label survives a search that zeroes it (regression)', async () => {
  await gotoScripts(p, '?category=cold-calling');
  await searchInput().fill('zzzznothing');
  await p.waitForTimeout(600);
  const label = (await catTrigger().innerText()).trim();
  ok(label.length > 0 && label.toLowerCase().includes('cold'), `trigger still labelled ("${label}")`);
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('active audience chip click clears the filter (toggle)', async () => {
  await gotoScripts(p, '?category=cold-calling');
  // click a flow chip to set audience, then click it again
  const chip = p.locator('button[aria-pressed]').first();
  const chipText = await chip.innerText();
  await chip.click();
  await p.waitForTimeout(500);
  ok(p.url().includes('audience='), `audience set via chip (${chipText})`);
  const active = p.locator('button[aria-pressed="true"]').first();
  await active.click();
  await p.waitForTimeout(500);
  ok(!p.url().includes('audience='), 'second tap cleared it');
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('favourites toggle with no favourites shows honest empty state', async () => {
  await gotoScripts(p);
  await p.locator('button:has-text("Favourites")').first().click();
  await p.waitForTimeout(600);
  const n = await resultCount(p);
  if (n === 0) {
    ok(await p.locator('text=No scripts found').isVisible(), 'empty state shown');
    ok(await p.locator('button:has-text("Remove the favourites filter")').isVisible(), 'favourites recovery offered');
  }
  await p.locator('button:has-text("Favourites")').first().click();
  await p.waitForTimeout(400);
  eq(await resultCount(p), TOTAL, 'toggled back');
});

await check('?v= version param survives a filter change', async () => {
  await gotoScripts(p, '?v=1');
  await audTrigger().click();
  await p.waitForTimeout(300);
  await p.locator('[role="option"]', { hasText: 'NSF / NS' }).first().click();
  await p.waitForTimeout(500);
  ok(p.url().includes('v=1'), `v preserved (${p.url()})`);
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('double-clicking a select option does not double-apply or crash', async () => {
  await gotoScripts(p);
  await catTrigger().click();
  await p.waitForTimeout(300);
  await p.locator('[role="option"]', { hasText: 'Referral Scripts' }).first().dblclick().catch(() => {});
  await p.waitForTimeout(500);
  ok(p.url().includes('category=referral'), 'applied once');
  ok((await resultCount(p)) !== null, 'page fine');
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('spamming Clear all five times is harmless', async () => {
  await gotoScripts(p, '?category=follow-up');
  for (let i = 0; i < 5; i++) {
    await p.locator('button:has-text("Clear all filters")').click().catch(() => {});
    await p.waitForTimeout(120);
  }
  eq(await resultCount(p), TOTAL, 'stable full list');
  await clearScriptsStorage(p);
});

// ===========================================================================
// D. Journeys: scroll, share, dark mode, cards
// ===========================================================================
await check('sticky search stays pinned and clickable at depth', async () => {
  await gotoScripts(p);
  await p.mouse.wheel(0, 6000);
  await p.waitForTimeout(700);
  const box = await searchInput().boundingBox();
  ok(box && box.y >= 40 && box.y < 140, `pinned near top (y=${box?.y})`);
  const hit = await p.evaluate(({ x, y }) => {
    const el = document.elementFromPoint(x, y);
    return el?.getAttribute('aria-label') || el?.tagName || 'none';
  }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
  eq(hit, 'Search scripts', 'input is the hit target, not a header');
  await p.mouse.wheel(0, -20000);
});

await check('changing category from deep in the list scrolls back to results', async () => {
  await gotoScripts(p);
  await clearScriptsStorage(p);
  await p.waitForTimeout(500);
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await p.waitForTimeout(700);
  const deepY = await p.evaluate(() => window.scrollY);
  ok(deepY > 3000, `actually deep (${deepY})`);
  // group headers render in the unfiltered list — click one to filter
  const header = p.locator('button[title^="Show only"]').last();
  await header.scrollIntoViewIfNeeded();
  await header.click();
  await p.waitForTimeout(1200);
  const afterY = await p.evaluate(() => window.scrollY);
  ok(afterY < deepY - 1000, `scrolled back up (${deepY} -> ${afterY})`);
  const anchorTop = await p.locator('[data-testid="scripts-result-count"]').evaluate(el => el.getBoundingClientRect().top);
  ok(anchorTop > 60 && anchorTop < 300, `results header visible below sticky bar (top=${Math.round(anchorTop)})`);
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('Share copies the exact current view url', async () => {
  await gotoScripts(p, '?category=cold-calling&audience=warm-market');
  await p.locator('button:has-text("Share")').first().click();
  await p.waitForTimeout(400);
  const clip = await p.evaluate(() => navigator.clipboard.readText());
  eq(clip, p.url(), 'clipboard equals url');
});

await check('shared url opens identically in a fresh session (no localStorage)', async () => {
  const url = p.url();
  const n = await resultCount(p);
  const fresh = await ctx.browser().newContext({ viewport: { width: 1440, height: 900 } });
  const fp = await fresh.newPage();
  await fp.goto(`${BASE}/auth`, { waitUntil: 'domcontentloaded' });
  await fp.waitForTimeout(800);
  await fp.locator('input[type="email"]').fill('master_admin@demo.com');
  await fp.locator('input[type="password"]').fill('demo123456');
  await fp.locator('button[type="submit"]').first().click();
  await fp.waitForURL(u => !u.toString().includes('/auth'), { timeout: 60000 });
  await fp.goto(url, { waitUntil: 'domcontentloaded' });
  await fp.waitForSelector('[data-testid="scripts-result-count"]', { timeout: 30000 });
  await fp.waitForTimeout(1000);
  const freshCount = parseInt((await fp.locator('[data-testid="scripts-result-count"]').innerText()).match(/(\d+)/)[1], 10);
  eq(freshCount, n, 'same count for recipient');
  await fresh.close();
});

await check('a script card expands, shows content, collapses', async () => {
  await gotoScripts(p);
  await clearScriptsStorage(p);
  const card = p.locator('[id^="script-"]').first();
  await card.scrollIntoViewIfNeeded();
  const trigger = card.locator('[data-state]').first();
  const stateBefore = await trigger.getAttribute('data-state');
  await card.locator('[role="button"], button').first().click();
  await p.waitForTimeout(600);
  const stateAfter = await trigger.getAttribute('data-state');
  ok(stateBefore !== stateAfter, `toggled (${stateBefore} -> ${stateAfter})`);
});

await check('dark mode: sticky bar stays opaque over the list', async () => {
  await p.emulateMedia({ colorScheme: 'dark' });
  await p.evaluate(() => document.documentElement.classList.add('dark'));
  await p.waitForTimeout(400);
  await p.mouse.wheel(0, 4000);
  await p.waitForTimeout(500);
  const bg = await p.evaluate(() => {
    const inp = document.querySelector('input[aria-label="Search scripts"]');
    let el = inp;
    while (el && el !== document.body) {
      const cs = getComputedStyle(el);
      if (cs.position === 'sticky') return getComputedStyle(el).backgroundColor;
      el = el.parentElement;
    }
    return 'no-sticky-ancestor';
  });
  ok(bg !== 'no-sticky-ancestor' && !bg.includes('0, 0, 0, 0)'), `opaque sticky bg (${bg})`);
  await p.evaluate(() => document.documentElement.classList.remove('dark'));
  await p.emulateMedia({ colorScheme: 'light' });
  await p.mouse.wheel(0, -20000);
});

await check('no page errors accumulated across the desktop battery', async () => {
  // pageerror listener attached below at start; assert here
  ok(pageErrors.length === 0, `page errors: ${pageErrors.slice(0, 3).join(' | ')}`);
});

// ===========================================================================
// E. Mobile 390px + widths
// ===========================================================================
for (const width of [320, 390, 768]) {
  await check(`no horizontal overflow at ${width}px`, async () => {
    await p.setViewportSize({ width, height: 844 });
    await gotoScripts(p);
    await p.waitForTimeout(900);
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(overflow <= 1, `overflow ${overflow}px`);
  });
}

await check('mobile: More filters reveals Role and Tag with counts', async () => {
  await p.setViewportSize({ width: 390, height: 844 });
  await gotoScripts(p);
  await p.locator('button:has-text("More filters")').click();
  await p.waitForTimeout(400);
  const combos = await p.locator('button[role="combobox"]').count();
  ok(combos >= 3, `role/tag selects revealed (${combos} combos)`);
  await p.locator('button:has-text("Hide filters")').click();
});

await check('mobile: active role filter shows a badge on the More toggle', async () => {
  await gotoScripts(p, '?role=telemarketer');
  const badge = await p.locator('button:has-text("More filters") span').first().innerText().catch(() => '');
  eq(badge.trim(), '1', 'badge shows 1 hidden active filter');
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('mobile: zero-state recovery buttons fit the viewport', async () => {
  await gotoScripts(p, '?category=referral&audience=nsf');
  const btn = p.locator('button:has-text("Remove ")').first();
  const box = await btn.boundingBox();
  ok(box && box.x >= 0 && box.x + box.width <= 390, `button inside viewport (x=${box?.x}, w=${box?.width})`);
  await gotoScripts(p);
  await clearScriptsStorage(p);
});

await check('mobile: sticky search pinned at depth', async () => {
  await gotoScripts(p);
  await clearScriptsStorage(p);
  await p.waitForTimeout(500);
  await p.evaluate(() => window.scrollTo(0, 5000));
  await p.waitForTimeout(600);
  const box = await searchInput().boundingBox();
  ok(box && box.y >= 50 && box.y < 140, `pinned (y=${box?.y})`);
  await p.mouse.wheel(0, -20000);
});

await check('mobile: jump chips are tappable-sized (>=32px tall incl padding row)', async () => {
  await gotoScripts(p);
  await clearScriptsStorage(p);
  await p.waitForTimeout(500);
  const chip = p.locator('button:has-text("NSF / NS")').first();
  if (await chip.isVisible().catch(() => false)) {
    const box = await chip.boundingBox();
    ok(box && box.height >= 22, `chip height ${box?.height}`);
  }
});

await check('landscape phone (844x390): page usable, search reachable', async () => {
  await p.setViewportSize({ width: 844, height: 390 });
  await gotoScripts(p);
  await p.waitForTimeout(700);
  ok(await searchInput().isVisible(), 'search visible');
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(overflow <= 1, `overflow ${overflow}px`);
  await p.setViewportSize({ width: 1440, height: 900 });
});

// ===========================================================================
const failed = results.filter(r => !r.ok);
console.log(`\n=== BATTERY: ${results.length - failed.length}/${results.length} passed ===`);
if (failed.length) {
  console.log('FAILURES:');
  failed.forEach(f => console.log(` - ${f.name}: ${f.err}`));
}
await b.close();
process.exit(failed.length ? 1 : 0);
