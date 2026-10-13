// The <head> a link-preview crawler gets for a shared academy link.
//
// The SPA ships one index.html for every URL, and WhatsApp, Telegram, Slack and LinkedIn
// read that HTML without running the bundle, so every link unfurled as the same site card
// (Leo, 2026-10-13). vercel.json sends ONLY crawler user-agents here; people never reach it,
// which is why this can answer with a bare head instead of the app shell.
//
// scripts/og/pages.mjs says what each page is (written by scripts/og/build-og.mjs from the
// route table, the docs folders and the products table). A path it does not list takes its
// nearest listed ancestor, so a lesson added after the last build still unfurls as its
// product. Every page sits behind a login, so a card names the page, never its contents.
//
// Same recipe as ActivityTracker's api/page-og.ts; see the link-previews skill.

import { resolvePage, SITE_NAME } from '../scripts/og/resolve.mjs'
import PAGES from '../scripts/og/pages.mjs'

interface Req {
  headers: Record<string, string | string[] | undefined>
  url?: string
}
interface Res {
  status: (code: number) => Res
  setHeader: (k: string, v: string) => void
  send: (body: string) => void
}

interface Page {
  title: string
  description: string
  card: string
}

const ORIGIN = 'https://academy.finternship.com'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function headHtml(page: Page, url: string, origin: string): string {
  const t = esc(page.title)
  const d = esc(page.description)
  const u = esc(url)
  const img = esc(`${origin}/og/${page.card}.jpg`)
  const site = esc(SITE_NAME)
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" />
<title>${t} | ${site}</title>
<meta name="description" content="${d}" />
<meta name="robots" content="noindex" />
<link rel="icon" type="image/png" href="${esc(origin)}/logo.png" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="${site}" />
<meta property="og:title" content="${t}" />
<meta property="og:description" content="${d}" />
<meta property="og:url" content="${u}" />
<meta property="og:image" content="${img}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${t}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${t}" />
<meta name="twitter:description" content="${d}" />
<meta name="twitter:image" content="${img}" />
</head><body><a href="${u}">${t}</a></body></html>`
}

/** Pure, so the tests can run it without a server. */
export function previewFor(path: string, origin = ORIGIN): string {
  // No row and no listed ancestor: the home card, the same one index.html carries.
  const page = (resolvePage(path, PAGES) ?? PAGES['/']) as Page
  return headHtml(page, `${origin}${path}`, origin)
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] ?? '' : v ?? '')

export default function handler(req: Req, res: Res) {
  const host = first(req.headers['x-forwarded-host'] ?? req.headers.host).split(':')[0]
  // Preview deployments point at their own cards; any other host gets production's.
  const origin = /^[a-z0-9.-]+\.(vercel\.app|finternship\.com)$/.test(host) ? `https://${host}` : ORIGIN
  // Vercel may merge the source query into the destination, so read defensively.
  const raw = new URL(req.url ?? '/', ORIGIN).searchParams.get('path') ?? ''
  const path = `/${raw.replace(/^\/+/, '')}`

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  // Same URL, two bodies (SPA for people, this for crawlers): never cache on the URL alone.
  res.setHeader('Vary', 'User-Agent')
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600')
  res.status(200).send(previewFor(path, origin))
}
