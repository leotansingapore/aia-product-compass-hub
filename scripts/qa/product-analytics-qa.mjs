// Product analytics QA - proves the whole pipeline against the real database:
// a screen open writes an app_events row stamped app=academy, a redirect logs
// nothing of its own, a signed-out deep link is recorded once sign-in brings
// the learner back, the developer's Product tab shows numbers that match the
// SQL (What changed, the zero-filled daily table, retention cells, feature
// rows), the master admin never sees the tab and gets zero rows from the RPCs,
// and nothing overflows at phone width.
//
//   npm run build && npx vite preview --port 5194 --strictPort &
//   node scripts/qa/product-analytics-qa.mjs
//
// analytics.ts refuses to record from localhost (a dev machine hits the
// production database), so the local build is served UNDER the production
// hostname: every request to academy.finternship.com is answered from the
// preview server. The rows this run writes are deleted at the end. Every
// account it signs in as is in analytics_excluded_user_ids(), so even a
// crashed run never reaches the panel's numbers.
//
// Screenshots: /tmp/acad-product-analytics/<view>-<width>-<n>.png, one per
// viewport of the page's tallest scroller. Read them; a passing run with a
// broken layout is still a broken panel.
//
// Keys come from the Supabase Management API (token at
// ~/.local/state/va-watchdog/token), so nothing needs to be exported first.
import fs from 'node:fs';
import os from 'node:os';
import { chromium } from 'playwright-core';
// Node 22.18+ strips the types; the catalog has no imports of its own.
import { FEATURE_CATALOG, RETIRED_LABELS, RESCOPED } from '../../src/lib/featureCatalog.ts';

const REF = 'hgdbflprrficdoyxmdxe';
const SB = `https://${REF}.supabase.co`;
const PROD = 'https://academy.finternship.com';
const LOCAL = `http://localhost:${process.argv[2] ?? '5194'}`;
const OWNER = 'tanjunsing@gmail.com'; // the developer
const CLIENT = 'admin@demo.com'; // the demo master_admin: an admin, still not the developer
const LEARNER = { email: 'user@demo.com', password: 'demo123456' }; // src/config/authConfig.ts
const TRACKING_BEGAN = '2026-09-13'; // changes.ts
const SHOTS = '/tmp/acad-product-analytics';
const MGMT = fs.readFileSync(`${os.homedir()}/.local/state/va-watchdog/token`, 'utf8').trim();
const DAY = 86_400_000;
fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0;
let fail = 0;
const check = (ok, label, detail = '') => {
  if (ok) { pass += 1; console.log(`  ok   ${label}`); }
  else { fail += 1; console.log(`  FAIL ${label}${detail ? ` - ${detail}` : ''}`); }
};

const mgmt = (path, init = {}) =>
  fetch(`https://api.supabase.com/v1/projects/${REF}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${MGMT}`, 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0', ...(init.headers || {}) },
  });
const sql = async (query) => {
  const r = await mgmt('/database/query', { method: 'POST', body: JSON.stringify({ query }) });
  const body = await r.json();
  if (!Array.isArray(body)) throw new Error(`sql: ${JSON.stringify(body).slice(0, 200)}`);
  return body;
};
const keys = await (await mgmt('/api-keys?reveal=true')).json();
const SERVICE = keys.find((k) => k.name === 'service_role').api_key;
const ANON = keys.find((k) => k.name === 'anon').api_key;

const mintSession = async (email) => {
  const link = await fetch(`${SB}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'magiclink', email }),
  }).then((r) => r.json());
  const verified = await fetch(`${SB}/auth/v1/verify`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'magiclink', token_hash: link.hashed_token }),
  }).then((r) => r.json());
  if (!verified?.access_token) throw new Error(`could not mint a session for ${email}`);
  return verified;
};

const browser = await chromium.launch({ headless: true }).catch(() => chromium.launch({ headless: true, channel: 'chrome' }));
const runStart = new Date().toISOString();
const htmlScripts = [];
const touched = new Set();

/** A context that answers academy.finternship.com from the local build. */
async function context(viewport) {
  const ctx = await browser.newContext({ viewport });
  // On the context, not the page: a second tab must never reach the real site.
  await ctx.route(`${PROD}/**`, async (route) => {
    const u = new URL(route.request().url());
    try {
      const r = await ctx.request.get(`${LOCAL}${u.pathname}${u.search}`, { maxRedirects: 0 });
      const headers = { ...r.headers() };
      if (route.request().resourceType() === 'script' && /text\/html/.test(headers['content-type'] ?? '')) htmlScripts.push(u.pathname);
      delete headers['content-encoding'];
      delete headers['content-length'];
      await route.fulfill({ status: r.status(), headers, body: await r.body() });
    } catch {
      await route.abort();
    }
  });
  return ctx;
}

async function openAs(email, viewport = { width: 1440, height: 950 }) {
  const sess = await mintSession(email);
  touched.add(sess.user.id);
  const ctx = await context(viewport);
  const page = await ctx.newPage();
  await page.addInitScript(([ref, s]) => {
    localStorage.setItem(`sb-${ref}-auth-token`, JSON.stringify({
      access_token: s.access_token, refresh_token: s.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + 3000, expires_in: 3000, token_type: 'bearer', user: s.user,
    }));
  }, [REF, sess]);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  return { page, ctx, errors, uid: sess.user.id };
}
const text = (page) => page.evaluate(() => document.body.innerText);
/** Waits for content, not for a clock: a loaded machine shows skeletons for a long time. */
async function waitText(page, re, timeout = 90_000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const t = await text(page).catch(() => '');
    if (re.test(t)) return t;
    await page.waitForTimeout(500);
  }
  return text(page).catch(() => '');
}
async function waitRow(uid, feature, timeout = 30_000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const r = await sql(`select 1 from public.app_events where user_id='${uid}' and created_at >= '${runStart}' and props->>'feature'='${feature}' limit 1`);
    if (r.length) return true;
    await new Promise((res) => setTimeout(res, 1000));
  }
  return false;
}
/** One shot per viewport of the tallest scroller; a stitched fullPage image of a nested scroller lies. */
async function shot(page, name) {
  await page.waitForTimeout(2500); // recharts animates in
  const steps = await page.evaluate(() => {
    let best = document.scrollingElement;
    let extra = best.scrollHeight - best.clientHeight;
    for (const el of document.querySelectorAll('*')) {
      if (!/(auto|scroll)/.test(getComputedStyle(el).overflowY)) continue;
      const hidden = el.scrollHeight - el.clientHeight;
      if (hidden > extra && el.clientHeight > 300) { extra = hidden; best = el; }
    }
    document.querySelectorAll('[data-qa-scroller]').forEach((e) => e.removeAttribute('data-qa-scroller'));
    best.setAttribute('data-qa-scroller', '1');
    return Math.min(8, Math.ceil(best.scrollHeight / best.clientHeight));
  });
  for (let i = 0; i < steps; i += 1) {
    await page.evaluate((n) => {
      const el = document.querySelector('[data-qa-scroller]');
      el.scrollTop = n * el.clientHeight * 0.9;
    }, i);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SHOTS}/${name}-${i + 1}.png` });
  }
  await page.evaluate(() => { document.querySelector('[data-qa-scroller]').scrollTop = 0; });
}

const claims = (uid) => `select set_config('request.jwt.claims','{"sub":"${uid}"}', true);`;
const labelOf = (key) => FEATURE_CATALOG.find((f) => f.key === key)?.label ?? RETIRED_LABELS[key] ?? key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
const dayLabel = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', timeZone: 'UTC' });

try {
  // --- 1. a screen open writes a row; a redirect writes nothing of its own -------
  const owner = await openAs(OWNER);
  for (const [path, feature] of [['/library/products', 'library_products'], ['/learning-track', 'lt_pre_rnf_assignments'], ['/roleplay', 'roleplay']]) {
    await owner.page.goto(`${PROD}${path}`, { waitUntil: 'domcontentloaded' });
    check(await waitRow(owner.uid, feature), `${path} wrote ${feature}`);
  }
  await owner.page.waitForTimeout(3000); // a stray alias row would land by now
  const rows = await sql(`select props->>'feature' f from public.app_events where user_id='${owner.uid}' and created_at >= '${runStart}' order by created_at`);
  const feats = rows.map((r) => r.f);
  const retired = feats.filter((f) => f in RETIRED_LABELS);
  check(retired.length === 0, '/learning-track logs only the screen it lands on, no redirect key', feats.join(','));
  const stamped = await sql(`select count(*) n from public.app_events where user_id='${owner.uid}' and created_at >= '${runStart}' and props->>'app' = 'academy'`);
  check(Number(stamped[0].n) === rows.length, 'every row is stamped app=academy', `${stamped[0].n} of ${rows.length}`);

  // --- 1b. a signed-out deep link is recorded once sign-in brings the learner back ---
  {
    const ctx = await context({ width: 1280, height: 900 });
    const page = await ctx.newPage();
    await page.goto(`${PROD}/leaderboard`, { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/auth/, { timeout: 60_000 });
    const pw = page.locator('input[placeholder="Enter your password"]');
    await pw.waitFor({ timeout: 60_000 });
    const form = page.locator('form', { has: pw });
    await form.locator('input[type="email"]').fill(LEARNER.email);
    await pw.fill(LEARNER.password);
    await form.locator('button[type="submit"]').click();
    await page.waitForURL(/\/leaderboard/, { timeout: 60_000 }).catch(() => {});
    const [{ id: learnerId }] = await sql(`select id from auth.users where email='${LEARNER.email}'`);
    touched.add(learnerId);
    check(/\/leaderboard/.test(page.url()), 'sign-in returns the learner to the deep link', page.url());
    check(await waitRow(learnerId, 'leaderboard'), 'the screen opened signed-out is recorded after sign-in');
    await ctx.close();
  }

  // --- 2. the owner's panel matches the SQL ---------------------------------------
  const sqlAs = (q) => sql(`${claims(owner.uid)} ${q}`);
  const [truth] = await sqlAs(`select * from public.app_usage_overview('academy', 30)`);
  const adoption = await sqlAs(`select * from public.app_feature_adoption('academy', 30)`);
  const events = await sqlAs(`select * from public.app_event_volume('academy', 30)`);
  const daily = await sqlAs(`select day, users from public.app_daily_active('academy', 90)`);
  const cohorts = await sqlAs(`select * from public.app_retention_cohorts('academy', 8)`);

  await owner.page.goto(`${PROD}/admin?tab=product&view=overview&days=30`, { waitUntil: 'domcontentloaded' });
  let body = await waitText(owner.page, /ACTIVE USERS \/ 30D\s+\d+/i);
  check(/Product analytics/.test(body), 'the developer reaches the Product tab', body.slice(0, 120));
  check(!/not migrated yet/i.test(body), 'the RPCs answer');
  check(/Your own account and the demo and test logins are left out/.test(body), 'the panel says who is left out');
  const tile = body.match(/ACTIVE USERS \/ 30D\s+(\d+)/i)?.[1];
  check(tile === String(truth.active_users), 'the active-users tile matches the SQL', `${tile} vs ${truth.active_users}`);

  // What changed: a twin of whatChanged() over the same RPC rows.
  body = await waitText(owner.page, /Gained[\s\S]*Lost[\s\S]*Stopped firing/i);
  const nowMs = Date.now();
  const priorStart = nowMs - 60 * DAY;
  const live = new Set(FEATURE_CATALOG.map((f) => f.key));
  const settled = (k) => !RESCOPED[k] || Date.parse(`${RESCOPED[k]}T00:00:00Z`) <= priorStart;
  const moves = adoption
    .filter((f) => live.has(f.feature) && Number(f.prior_users) > 0 && settled(f.feature))
    .map((f) => ({ feature: f.feature, users: Number(f.users), prior: Number(f.prior_users), change: Number(f.users) - Number(f.prior_users) }));
  const gained = moves.filter((m) => m.change > 0).sort((a, b) => b.change - a.change || b.users - a.users || a.feature.localeCompare(b.feature));
  const lost = moves.filter((m) => m.change < 0).sort((a, b) => a.change - b.change || b.prior - a.prior || a.feature.localeCompare(b.feature));
  for (const [side, list] of [['gained', gained], ['lost', lost]]) {
    const shown = await owner.page.evaluate((id) => [...document.querySelectorAll(`[data-testid="changed-${id}"] li`)].map((li) => ({ f: li.getAttribute('data-feature'), t: li.textContent })), side);
    const want = list.slice(0, 3);
    check(
      shown.length === want.length && want.every((m, i) => shown[i].f === m.feature && shown[i].t.includes(`${m.prior} to ${m.users}`)),
      `What changed ${side} matches the SQL`,
      `screen ${JSON.stringify(shown.map((s) => s.f))} sql ${JSON.stringify(want.map((m) => `${m.feature} ${m.prior}->${m.users}`))}`,
    );
  }
  const stoppedSql = events.filter((e) => Number(e.n) === 0 && Number(e.prior_n) >= 10).map((e) => e.event);
  const stoppedTxt = await owner.page.locator('[data-testid="changed-stopped"]').innerText();
  check(stoppedSql.length ? stoppedSql.every((e) => stoppedTxt.includes(e)) : /None/.test(stoppedTxt), 'What changed stopped-firing matches the SQL', stoppedTxt);
  const partialDays = Math.round((nowMs - 30 * DAY - Date.parse(`${TRACKING_BEGAN}T00:00:00Z`)) / DAY);
  const partialShown = await owner.page.locator('[data-testid="changed-partial"]').count();
  check(partialDays > 0 && partialDays < 30 ? partialShown === 1 : partialShown === 0, 'the partial-history note shows exactly when the period before is partly untracked');

  // The daily table twin: N whole UTC days, a quiet day as a zero.
  await shot(owner.page, 'overview-1440');
  await owner.page.locator('[data-testid="what-changed"]').waitFor();
  await owner.page.getByRole('button', { name: 'Table', exact: true }).first().click();
  await owner.page.waitForTimeout(800);
  const tableRows = await owner.page.evaluate(() => {
    const card = [...document.querySelectorAll('h3, [class*="CardTitle"], div')].find((el) => el.textContent?.trim() === 'Daily active users');
    const root = card?.closest('[class*="rounded"]') ?? document;
    return [...root.querySelectorAll('tbody tr')].map((tr) => [...tr.querySelectorAll('td')].slice(0, 2).map((td) => td.textContent.trim()));
  });
  const byDay = new Map(daily.map((d) => [String(d.day).slice(0, 10), Number(d.users)]));
  const wantDays = Array.from({ length: 30 }, (_, i) => new Date(nowMs - (29 - i) * DAY).toISOString().slice(0, 10)).filter((d) => d >= TRACKING_BEGAN).reverse();
  const wantRows = wantDays.map((d) => [dayLabel(d), String(byDay.get(d) ?? 0)]);
  check(JSON.stringify(tableRows) === JSON.stringify(wantRows), 'the daily table is 30 whole days and matches app_daily_active, quiet days as 0', `${JSON.stringify(tableRows.slice(0, 4))} vs ${JSON.stringify(wantRows.slice(0, 4))}`);
  check(wantRows.some((r) => r[1] === '0'), 'the window holds at least one quiet day to prove the fill', 'no zero day in 30d');
  await owner.page.getByRole('button', { name: 'Chart', exact: true }).first().click();

  // Features: every screen anyone opened in the window, with its head count.
  await owner.page.goto(`${PROD}/admin?tab=product&view=features&days=30`, { waitUntil: 'domcontentloaded' });
  await waitText(owner.page, /Waiting for first data/);
  await owner.page.waitForTimeout(1500);
  const featureRows = await owner.page.evaluate(() =>
    [...document.querySelectorAll('[data-testid="feature-adoption"] tbody tr')].map((tr) => tr.innerText.replace(/\s+/g, ' ')));
  const missing = adoption
    .filter((f) => Number(f.users) > 0)
    .filter((f) => !featureRows.some((r) => r.startsWith(`${labelOf(f.feature)} `) && new RegExp(`%\\s${f.users}\\s`).test(r)));
  check(missing.length === 0, 'Features lists every screen opened in the window with its SQL head count', missing.map((f) => f.feature).join(','));
  check(featureRows.some((r) => r.includes('Retired')) === adoption.some((f) => f.feature in RETIRED_LABELS), 'retired redirect keys show as Retired with a readable label');
  await shot(owner.page, 'features-1440');

  // Retention: every cell against the SQL, a finished empty week as 0%, the running week as a dash.
  await owner.page.goto(`${PROD}/admin?tab=product&view=retention&days=30`, { waitUntil: 'domcontentloaded' });
  await waitText(owner.page, /Joined/);
  await owner.page.waitForTimeout(1000);
  const retRows = await owner.page.evaluate(() =>
    [...document.querySelectorAll('table')].find((t) => /Joined/.test(t.innerText))
      ? [...[...document.querySelectorAll('table')].find((t) => /Joined/.test(t.innerText)).querySelectorAll('tbody tr')].map((tr) => [...tr.querySelectorAll('td')].map((td) => td.textContent.trim()))
      : []);
  const byWeek = new Map();
  for (const c of cohorts) {
    const e = byWeek.get(c.cohort_week) ?? { size: Number(c.cohort_size), cells: new Map() };
    e.cells.set(Number(c.week_offset), Number(c.users));
    byWeek.set(c.cohort_week, e);
  }
  const maxOff = Math.min(7, Math.max(0, ...cohorts.map((c) => Number(c.week_offset))));
  const wantRet = [...byWeek.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).map(([w, e]) => [
    dayLabel(w), String(e.size),
    ...Array.from({ length: maxOff + 1 }, (_, i) => {
      const start = Date.parse(`${w}T00:00:00Z`) + i * 7 * DAY;
      if (start > nowMs) return '';
      if (start + 7 * DAY > nowMs && i > 0) return '-';
      return `${Math.round(((e.cells.get(i) ?? 0) / e.size) * 100)}%`;
    }),
  ]);
  check(JSON.stringify(retRows) === JSON.stringify(wantRet), 'every retention cell matches the SQL (0% for a finished empty week, - for the running one)', `${JSON.stringify(retRows[0])} vs ${JSON.stringify(wantRet[0])}`);
  await shot(owner.page, 'retention-1440');

  await owner.page.goto(`${PROD}/admin?tab=product&view=events&days=30`, { waitUntil: 'domcontentloaded' });
  check(/feature_open/.test(await waitText(owner.page, /feature_open/)), 'Events lists feature_open');
  await shot(owner.page, 'events-1440');

  const shell = [...new Set(htmlScripts)];
  const realErrors = owner.errors.filter((e) => !(/Unexpected token '<'/.test(e) && shell.length));
  check(shell.every((p) => /^\/_vercel\//.test(p)), 'scripts the local dist lacks are Vercel-injected only', shell.join(', '));
  check(realErrors.length === 0, 'no javascript errors as owner', realErrors.join(' | '));

  // --- 3. phone width ------------------------------------------------------------
  await owner.page.setViewportSize({ width: 390, height: 844 });
  for (const [view, ready] of [['overview', /What changed/], ['features', /Waiting for first data/], ['retention', /Joined/], ['events', /feature_open/]]) {
    await owner.page.goto(`${PROD}/admin?tab=product&view=${view}&days=30`, { waitUntil: 'domcontentloaded' });
    await waitText(owner.page, ready);
    await owner.page.waitForTimeout(1500);
    const o = await owner.page.evaluate(() => ({ doc: document.documentElement.scrollWidth, win: window.innerWidth }));
    check(o.doc <= o.win + 1, `${view} fits 390px`, JSON.stringify(o));
    await shot(owner.page, `${view}-390`);
  }
  await owner.ctx.close();

  // --- 4. the master admin gets nothing ------------------------------------------
  const client = await openAs(CLIENT);
  await client.page.goto(`${PROD}/admin?tab=product`, { waitUntil: 'domcontentloaded' });
  const clientBody = await waitText(client.page, /Admin Dashboard/);
  check(/Admin Dashboard/.test(clientBody), 'the master admin reaches the admin page (so the next check is not blind)');
  check(!/Product analytics/.test(clientBody) && (await client.page.getByRole('tab', { name: 'Product' }).count()) === 0, 'the master admin never sees the Product tab', client.page.url());
  const [asClient] = await sql(`${claims(client.uid)} select active_users, events from public.app_usage_overview('academy', 30)`);
  check(Number(asClient.active_users) === 0 && Number(asClient.events) === 0, 'the RPCs give the master admin zero rows', JSON.stringify(asClient));
  await client.ctx.close();
} catch (e) {
  fail += 1;
  console.log(`  FAIL crashed - ${String(e?.stack ?? e).slice(0, 400)}`);
} finally {
  const ids = [...touched].map((id) => `'${id}'`).join(',');
  if (ids) {
    const gone = await sql(`delete from public.app_events where user_id in (${ids}) and created_at >= '${runStart}' returning id`).catch(() => []);
    console.log(`  ..   cleaned ${gone.length} QA rows`);
  }
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed. Screenshots in ${SHOTS}`);
process.exit(fail ? 1 : 0);
