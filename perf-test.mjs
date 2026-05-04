import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:8080';
const TARGET = `${BASE}/learning-track/post-rnf/next-60-days`;

const accounts = {
  admin: { email: 'master_admin@demo.com', password: 'demo123456' },
  user:  { email: 'user@demo.com',         password: 'demo123456' },
};

async function runForRole(role) {
  const creds = accounts[role];
  console.log(`\n=== Run: ${role} (${creds.email}) ===`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();

  const networkLog = [];
  const consoleLog = [];

  page.on('console', (msg) => {
    consoleLog.push({
      type: msg.type(),
      text: msg.text(),
      ts: Date.now(),
    });
  });

  page.on('pageerror', (err) => {
    consoleLog.push({ type: 'pageerror', text: String(err && err.message || err), ts: Date.now() });
  });

  // Map requestId -> entry
  const reqIndex = new Map();
  let captureNetwork = false;
  let runStart = 0;

  page.on('request', (req) => {
    if (!captureNetwork) return;
    const entry = {
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType(),
      startTimeMs: Date.now() - runStart,
      headers: req.headers(),
      postDataPreview: req.postData() ? req.postData().slice(0, 400) : null,
    };
    reqIndex.set(req, entry);
  });

  page.on('response', async (resp) => {
    if (!captureNetwork) return;
    const req = resp.request();
    const entry = reqIndex.get(req);
    if (!entry) return;
    entry.status = resp.status();
    entry.fromCache = resp.fromServiceWorker?.() || false;
    try {
      const buf = await resp.body();
      entry.size = buf.length;
    } catch (e) {
      entry.size = null;
    }
    entry.endTimeMs = Date.now() - runStart;
    entry.durationMs = entry.endTimeMs - entry.startTimeMs;
    networkLog.push(entry);
  });

  // 1. Sign in
  console.log('[1] Sign in');
  await page.goto(`${BASE}/auth`, { waitUntil: 'networkidle' });
  await page.fill('input#signin-email', creds.email);
  await page.fill('input#signin-password', creds.password);
  await page.click('button[type="submit"]:has-text("Sign In")');
  try {
    await page.waitForURL((u) => !u.toString().includes('/auth'), { timeout: 45000 });
  } catch (e) {
    console.log('[1] Did not leave /auth in 45s, URL:', page.url());
    const bodyText = await page.locator('body').innerText().catch(() => '');
    console.log('[1] body snippet:', bodyText.slice(0, 500).replace(/\n+/g,' | '));
  }
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(2000);
  console.log('[1] Signed in. URL:', page.url());

  // 2. Start capturing, navigate
  console.log('[2] Navigate to target with full reload');
  runStart = Date.now();
  captureNetwork = true;
  const navStart = Date.now();
  await page.goto(TARGET, { waitUntil: 'commit' });

  // Time-to-first-render of the hub element
  let hubVisibleAtMs = null;
  try {
    await page.waitForSelector('[data-testid="next-60-days-hub"]', { state: 'visible', timeout: 30000 });
    hubVisibleAtMs = Date.now() - navStart;
    console.log(`[2] hub visible at ${hubVisibleAtMs}ms`);
  } catch (e) {
    console.log('[2] hub did not become visible in 30s');
  }

  // Wait until network idle so all subsequent fetch calls are captured
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1000);
  const fullSettleMs = Date.now() - navStart;

  // 3. performance.timing
  const perf = await page.evaluate(() => {
    const t = performance.timing;
    const navEntry = performance.getEntriesByType('navigation')[0] || {};
    return {
      domContentLoadedMs: t.domContentLoadedEventEnd - t.navigationStart,
      loadEventEndMs: t.loadEventEnd - t.navigationStart,
      domInteractiveMs: t.domInteractive - t.navigationStart,
      navType: navEntry.type,
      transferSize: navEntry.transferSize,
    };
  });

  captureNetwork = false;
  await browser.close();

  return {
    role,
    perf,
    hubVisibleAtMs,
    fullSettleMs,
    networkLog,
    consoleLog,
  };
}

const results = {};
for (const role of ['admin', 'user']) {
  results[role] = await runForRole(role);
}

fs.writeFileSync('/tmp/cmfas-test/post-rnf-perf.json', JSON.stringify(results, null, 2));
console.log('\nWrote /tmp/cmfas-test/post-rnf-perf.json');

// Print summary
function summarize(r) {
  console.log(`\n--- ${r.role} ---`);
  console.log('perf:', r.perf);
  console.log('hubVisibleAtMs:', r.hubVisibleAtMs, ' fullSettleMs:', r.fullSettleMs);

  const top = [...r.networkLog].sort((a,b) => (b.durationMs||0) - (a.durationMs||0)).slice(0, 12);
  console.log('top 12 slowest requests:');
  for (const e of top) {
    const u = e.url.length > 110 ? e.url.slice(0, 107) + '...' : e.url;
    console.log(`  ${String(e.durationMs).padStart(5)}ms  ${String(e.status).padStart(3)}  ${String(e.size||0).padStart(7)}B  ${e.resourceType.padEnd(10)} ${u}`);
  }
  const supabaseCalls = r.networkLog.filter(e => e.url.includes('supabase.co'));
  console.log(`supabase calls: ${supabaseCalls.length}`);
  const counts = {};
  for (const c of supabaseCalls) {
    const key = c.url.split('?')[0].split('/').slice(-3).join('/');
    counts[key] = (counts[key]||0) + 1;
  }
  console.log('supabase endpoint counts:', counts);

  const errors = r.consoleLog.filter(c => c.type === 'error' || c.type === 'pageerror');
  const warns  = r.consoleLog.filter(c => c.type === 'warning');
  console.log(`console errors: ${errors.length}, warnings: ${warns.length}`);
  for (const e of errors.slice(0, 8)) console.log(`  [err] ${e.text.slice(0, 200)}`);
}
summarize(results.admin);
summarize(results.user);
