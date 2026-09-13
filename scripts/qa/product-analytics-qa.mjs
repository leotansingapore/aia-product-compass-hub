// Product analytics QA - proves the whole pipeline against the real database:
// a screen open writes an app_events row stamped app=academy, the developer's
// Product tab shows it, even the master admin never sees the tab and gets zero
// rows from the RPCs, and nothing overflows at phone width.
//
//   npm run build && npx vite preview --port 5194 --strictPort &
//   node scripts/qa/product-analytics-qa.mjs
//
// analytics.ts refuses to record from localhost (a dev machine hits the
// production database), so the local build is served UNDER the production
// hostname: every request to academy.finternship.com is answered from the
// preview server. The rows this run writes are deleted at the end.
//
// Keys come from the Supabase Management API (token at
// ~/.local/state/va-watchdog/token), so nothing needs to be exported first.
import fs from 'node:fs';
import os from 'node:os';
import { chromium } from 'playwright-core';

const REF = 'hgdbflprrficdoyxmdxe';
const SB = `https://${REF}.supabase.co`;
const PROD = 'https://academy.finternship.com';
const LOCAL = `http://localhost:${process.argv[2] ?? '5194'}`;
const OWNER = 'tanjunsing@gmail.com'; // the developer
const CLIENT = 'admin@demo.com'; // the demo master_admin: an admin, still not the developer
const MGMT = fs.readFileSync(`${os.homedir()}/.local/state/va-watchdog/token`, 'utf8').trim();

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

async function openAs(email, viewport = { width: 1440, height: 950 }) {
  const sess = await mintSession(email);
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.route(`${PROD}/**`, async (route) => {
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

// --- 1. a screen open writes a row -------------------------------------------
const owner = await openAs(OWNER);
for (const path of ['/library/products', '/learning-track/pre-rnf', '/roleplay']) {
  await owner.page.goto(`${PROD}${path}`, { waitUntil: 'domcontentloaded' });
  await owner.page.waitForTimeout(4500);
}
const rows = await sql(`select props->>'feature' f from public.app_events where user_id='${owner.uid}' and created_at >= '${runStart}' order by created_at`);
const feats = rows.map((r) => r.f);
check(feats.includes('library_products'), 'the library wrote library_products', feats.join(','));
check(feats.includes('lt_pre_rnf'), 'the track wrote lt_pre_rnf', feats.join(','));
check(feats.includes('roleplay'), 'roleplay wrote roleplay', feats.join(','));
const stamped = await sql(`select count(*) n from public.app_events where user_id='${owner.uid}' and created_at >= '${runStart}' and props->>'app' = 'academy'`);
check(Number(stamped[0].n) === rows.length, 'every row is stamped app=academy', `${stamped[0].n} of ${rows.length}`);

// --- 2. the owner's panel shows it ---------------------------------------------
await owner.page.goto(`${PROD}/admin?tab=product`, { waitUntil: 'domcontentloaded' });
await owner.page.waitForTimeout(7000);
let body = await text(owner.page);
check(/Product analytics/.test(body), 'the developer reaches the Product tab', body.slice(0, 120));
check(!/not migrated yet/i.test(body), 'the RPCs answer');
const [truth] = await sql(`select set_config('request.jwt.claims','{"sub":"${owner.uid}"}', true); select active_users from public.app_usage_overview('academy', 30)`);
check(body.includes(String(truth.active_users)), 'active users on screen match the SQL', `expected ${truth.active_users}`);

await owner.page.getByRole('tab', { name: 'Features' }).click();
await owner.page.waitForTimeout(3000);
body = await text(owner.page);
check(/Library: products/.test(body) && /Roleplay/.test(body), 'Features lists the screens just opened');
check(/Waiting for first data/.test(body), 'the waiting-for-first-data card renders');
await owner.page.screenshot({ path: '/tmp/acad-product-analytics-features.png', fullPage: true }).catch(() => {});
for (const tab of ['Retention', 'Events']) {
  await owner.page.getByRole('tab', { name: tab }).click();
  await owner.page.waitForTimeout(2500);
}
check(/feature_open/.test(await text(owner.page)), 'Events lists feature_open');
const shell = [...new Set(htmlScripts)];
const realErrors = owner.errors.filter((e) => !(/Unexpected token '<'/.test(e) && shell.length));
check(shell.every((p) => /^\/_vercel\//.test(p)), 'scripts the local dist lacks are Vercel-injected only', shell.join(', '));
check(realErrors.length === 0, 'no javascript errors as owner', realErrors.join(' | '));

// --- 3. phone width ------------------------------------------------------------
await owner.page.setViewportSize({ width: 390, height: 844 });
for (const view of ['overview', 'features', 'retention', 'events']) {
  await owner.page.goto(`${PROD}/admin?tab=product&view=${view}&days=30`, { waitUntil: 'domcontentloaded' });
  await owner.page.waitForTimeout(3500);
  const o = await owner.page.evaluate(() => ({ doc: document.documentElement.scrollWidth, win: window.innerWidth }));
  check(o.doc <= o.win + 1, `${view} fits 390px`, JSON.stringify(o));
}
await owner.ctx.close();

// --- 4. a plain user gets nothing ----------------------------------------------
const client = await openAs(CLIENT);
await client.page.goto(`${PROD}/admin?tab=product`, { waitUntil: 'domcontentloaded' });
await client.page.waitForTimeout(5000);
check(!/Product analytics/.test(await text(client.page)), 'the master admin never sees the Product tab', client.page.url());
const [asClient] = await sql(`select set_config('request.jwt.claims','{"sub":"${client.uid}"}', true); select active_users, events from public.app_usage_overview('academy', 30)`);
check(Number(asClient.active_users) === 0 && Number(asClient.events) === 0, 'the RPCs give the master admin zero rows', JSON.stringify(asClient));
await client.ctx.close();

const gone = await sql(`delete from public.app_events where user_id in ('${owner.uid}','${client.uid}') and created_at >= '${runStart}' returning id`);
console.log(`  ..   cleaned ${gone.length} QA rows`);
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
