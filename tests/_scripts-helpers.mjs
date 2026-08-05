// Shared helpers for /scripts behavioural probes.
import { chromium } from 'playwright';

export const BASE = process.env.BASE_URL || 'http://localhost:8083';

export async function launch(viewport = { width: 1440, height: 900 }) {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport });
  const p = await ctx.newPage();
  return { b, ctx, p };
}

export async function login(p, email = 'master_admin@demo.com', password = 'demo123456') {
  await p.goto(`${BASE}/auth`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1000);
  await p.locator('input[type="email"]').fill(email);
  await p.locator('input[type="password"]').fill(password);
  await p.locator('button[type="submit"]').first().click();
  await p.waitForURL(u => !u.toString().includes('/auth'), { timeout: 60000 });
  // Stamp the animated tour as seen for this user so its z-9999 overlay never
  // intercepts probe clicks. Key is animated-tour-seen-<userId>.
  await p.waitForTimeout(1500);
  await p.evaluate(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) {
        try {
          const session = JSON.parse(localStorage.getItem(k));
          const uid = session?.user?.id;
          if (uid) localStorage.setItem(`animated-tour-seen-${uid}`, new Date().toISOString());
        } catch {}
      }
    }
    localStorage.setItem('animated-tour-seen-guest', new Date().toISOString());
  });
}

export async function dismissOverlays(p) {
  // Belt and braces: if the tour still appears, click its Skip control.
  const skip = p.locator('[aria-label="Animated onboarding tour"] button:has-text("Skip")').first();
  if (await skip.isVisible().catch(() => false)) {
    await skip.click().catch(() => {});
    await p.waitForTimeout(400);
  }
}

export async function gotoScripts(p, qs = '') {
  await p.goto(`${BASE}/scripts${qs}`, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('input[aria-label="Search scripts"]', { timeout: 30000 });
  await dismissOverlays(p);
  // The battery fires ~50 page loads at Supabase; the odd fetch gets dropped.
  // The page surfaces that as an error card with Retry — use it, same as a
  // human would, instead of misreading "0 scripts" as a filter bug.
  for (let i = 0; i < 3; i++) {
    await p.waitForTimeout(800);
    const errCard = await p.getByText("Couldn't load scripts").isVisible().catch(() => false);
    if (!errCard) break;
    await p.locator('button:has-text("Retry")').click().catch(() => {});
    await p.waitForTimeout(1200);
  }
}

export async function clearScriptsStorage(p) {
  await p.evaluate(() => {
    ['tab', 'category', 'audience', 'role', 'tag'].forEach(k =>
      localStorage.removeItem(`scripts_filter_${k}`)
    );
  });
}

export async function resultCount(p) {
  const txt = await p.getByText(/\d+ (of \d+ )?scripts? found/).first().innerText().catch(() => null);
  if (!txt) return null;
  const m = txt.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}
