// Link previews: what WhatsApp, Telegram and Slack show for a shared academy link.
// scripts/og/build-og.mjs writes the table; api/page-og.ts serves it to crawlers only.
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import PAGES from '../../scripts/og/pages.mjs';
import { resolvePage } from '../../scripts/og/resolve.mjs';
import { appRoutes } from '../../scripts/og/content.mjs';
import { IGNORED, SECTIONS } from '../../scripts/og/routes.mjs';
import { previewFor } from '../../api/page-og';

const ROOT = path.resolve(__dirname, '../..');
type Page = { title: string; description: string; card: string };
const pages = PAGES as Record<string, Page>;

describe('link preview table', () => {
  it('gives every fixed route in App.tsx its own preview, not the home card', () => {
    const missing = (appRoutes() as { path: string }[])
      .map((r) => r.path)
      .filter((p) => !p.includes(':') && !IGNORED.includes(p) && p !== '/')
      .filter((p) => {
        const page = resolvePage(p, pages);
        return !page || page.card === 'home';
      });
    expect(missing).toEqual([]);
  });

  it('lists the dynamic families build-og reads', () => {
    for (const p of [
      '/learning-track/first-14-days/day/1',
      '/learning-track/first-60-days/day/60',
      '/learning-track/next-60-days/day/1',
      '/learning-track/product-mastery/day/1',
      '/learning-track/pre-rnf/assignments/case-study-competition',
      '/learning-track/pre-rnf/assignments/assignment-11',
      '/learning-track/post-rnf/assignments/assignment-01',
      '/learning-track/pre-rnf/worksheets/pledge-sheet',
      '/cheat-sheets/core-training/warm-market-flow',
      '/product/core-pro-achiever',
      '/product/pro-achiever',
      '/category/investment-products',
      '/cmfas/module/m9',
    ]) {
      expect(pages[p], p).toBeTruthy();
    }
  });

  it('has a drawn card for every page', () => {
    const cards = [...new Set(Object.values(pages).map((p) => p.card))];
    expect(cards.filter((c) => !existsSync(path.join(ROOT, 'public/og', `${c}.jpg`)))).toEqual([]);
  });

  it('keeps every preview ASCII and dash-free', () => {
    const bad = Object.entries(pages).filter(([, p]) => /[^\x20-\x7e]/.test(p.title + p.description) || !p.title || !p.description);
    expect(bad.map(([k]) => k)).toEqual([]);
  });

  it('never names a case, a shared playbook or an AIA course from its URL', () => {
    const sections = new Set((SECTIONS as { path: string }[]).map((s) => s.path));
    const named = Object.keys(pages).filter(
      (p) => !sections.has(p) && /^\/(case-vault|playbooks|scripts|servicing|flows)\/.|\/aia-training\/./.test(p),
    );
    expect(named).toEqual([]);
    expect(resolvePage('/case-vault/real-retirement-tan-family', pages).title).toBe('Case vault');
    expect(resolvePage('/learning-track/post-rnf/aia-training/courses/leadership-essentials', pages).title).toBe('AIA training courses');
    expect(resolvePage('/playbooks/share/abc123token', pages).title).toBe('Shared script playbook');
  });
});

describe('resolvePage', () => {
  it('gives a lesson newer than the table its product, word for word', () => {
    expect(resolvePage('/product/core-pro-achiever/medical-underwriting-basics', pages)).toBe(pages['/product/core-pro-achiever']);
  });

  it('falls back to the section for a product id it has never seen', () => {
    expect(resolvePage('/product/brand-new-plan', pages).title).toBe('Product training');
  });

  it('never puts words from the URL on a preview', () => {
    for (const p of ['/product/your-account-is-locked-call-now', '/learning-track/send-your-password', '/library/free-money-here']) {
      const page = resolvePage(p, pages);
      expect(`${page.title} ${page.description}`.toLowerCase(), p).not.toMatch(/locked|password|money/);
    }
  });

  it('ignores a trailing slash, a query and doubled slashes', () => {
    expect(resolvePage('/learning-track/first-14-days/?x=1', pages)).toBe(pages['/learning-track/first-14-days']);
    expect(resolvePage('//library//products', pages)).toBe(pages['/library/products']);
  });

  it('returns nothing for an unknown top-level path', () => {
    expect(resolvePage('/no-such-page', pages)).toBeNull();
  });
});

describe('api/page-og', () => {
  it('serves the page head with an absolute card URL', () => {
    const html = previewFor('/learning-track/first-14-days/day/1');
    const day = pages['/learning-track/first-14-days/day/1'];
    expect(html).toContain(`<meta property="og:image" content="https://academy.finternship.com/og/${day.card}.jpg" />`);
    expect(html).toContain('<meta property="og:url" content="https://academy.finternship.com/learning-track/first-14-days/day/1" />');
    expect(html).toContain('<meta name="robots" content="noindex" />');
  });

  it('escapes what it prints', () => {
    const html = previewFor('/product/core-pro-achiever/a-b"><script>');
    expect(html).not.toContain('"><script>');
  });

  it('answers an unknown path with the home card', () => {
    expect(previewFor('/no-such-page')).toContain('/og/home.jpg');
  });
});

describe('vercel.json', () => {
  const rewrites = JSON.parse(readFileSync(path.join(ROOT, 'vercel.json'), 'utf8')).rewrites as {
    source: string;
    destination: string;
    has?: { value: string }[];
  }[];
  const crawler = rewrites.findIndex((r) => r.destination.startsWith('/api/page-og'));
  // Vercel anchors has.value as ^value$.
  const ua = new RegExp(`^${rewrites[crawler].has![0].value}$`);

  it('sends crawlers to page-og before the SPA catch-all', () => {
    expect(crawler).toBeGreaterThanOrEqual(0);
    expect(crawler).toBeLessThan(rewrites.findIndex((r) => r.destination === '/index.html'));
  });

  it('matches preview bots and never a person', () => {
    for (const bot of [
      'TelegramBot (like TwitterBot)',
      'WhatsApp/2.23.20.0 A',
      'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
      'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
    ]) {
      expect(ua.test(bot), bot).toBe(true);
    }
    for (const person of [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Line/13.0.0',
      'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/470.0]',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Telegram-iOS',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36',
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    ]) {
      expect(ua.test(person), person).toBe(false);
    }
  });
});
