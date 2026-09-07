// Render check: does the auto-published team training lesson actually play on
// academy.finternship.com, with the caption track the proxy serves?
//
// Uses a throwaway account (created and deleted here), never a real learner.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

// fileURLToPath, not .pathname: the repo path contains a space.
const HUB = fileURLToPath(new URL('../..', import.meta.url))
const env = {}
for (const f of ['.env', '.env.local']) {
  for (const line of fs.readFileSync(`${HUB}/${f}`, 'utf8').split('\n')) {
    const i = line.indexOf('=')
    if (i > 0 && !line.startsWith('#')) {
      const k = line.slice(0, i).trim()
      if (!(k in env)) env[k] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '')
    }
  }
}
const URL_ = env.SUPABASE_URL
const SR = env.SUPABASE_SERVICE_ROLE_KEY
const ANON = env.VITE_SUPABASE_PUBLISHABLE_KEY
const H = { apikey: SR, Authorization: `Bearer ${SR}`, 'Content-Type': 'application/json' }

const email = `tt-render-qa-${Date.now()}@mailinator.com`
const password = 'TtRender-123456!'

const mk = await fetch(`${URL_}/auth/v1/admin/users`, {
  method: 'POST', headers: H,
  body: JSON.stringify({ email, password, email_confirm: true }),
})
const user = await mk.json()
if (!user.id) throw new Error(`create user failed: ${JSON.stringify(user).slice(0, 300)}`)
console.log('throwaway user', user.id)

await fetch(`${URL_}/rest/v1/user_admin_roles`, {
  method: 'POST', headers: { ...H, Prefer: 'return=representation' },
  body: JSON.stringify({ user_id: user.id, admin_role: 'admin' }),
}).then((r) => r.text()).then((t) => console.log('admin role:', t.slice(0, 120)))

const cleanup = async () => {
  await fetch(`${URL_}/rest/v1/user_admin_roles?user_id=eq.${user.id}`, { method: 'DELETE', headers: H })
  await fetch(`${URL_}/rest/v1/profiles?id=eq.${user.id}`, { method: 'DELETE', headers: H })
  const d = await fetch(`${URL_}/auth/v1/admin/users/${user.id}`, { method: 'DELETE', headers: H })
  console.log('cleanup user delete:', d.status)
}

// Defaults to the most recently published team training; pass a slug to pin one.
const SLUG = process.argv[2] ?? '26th-aug-activity-tracker-features-routines-leads-and-closing-scripts'
const PAGE = `https://academy.finternship.com/product/training-meetings/${SLUG}`
const fails = []
const errors = []
const b = await chromium.launch({ headless: true })
  .catch(() => chromium.launch({ channel: 'chrome', headless: true }))
try {
  const c = await b.newContext({ viewport: { width: 1440, height: 950 }, timezoneId: 'Asia/Singapore' })
  await c.addInitScript(() => { try { localStorage.setItem('view-as-tier', 'post_rnf') } catch {} })
  const p = await c.newPage()
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 180)) })
  p.on('pageerror', (e) => errors.push(`pageerror: ${e.message.slice(0, 180)}`))

  await p.goto('https://academy.finternship.com/auth', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(3500)
  await p.fill('#signin-email', email)
  await p.fill('#signin-password', password)
  await p.getByRole('button', { name: /sign in/i }).first().click()
  await p.waitForTimeout(7000)
  console.log('after login:', p.url())

  await p.goto(PAGE, { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(9000)

  // Deep links land on lesson 1, so the lesson has to be clicked in the
  // sidebar. Derive the label from the slug rather than hardcoding one date,
  // or passing a slug silently re-checks whichever lesson was hardcoded.
  const label = SLUG.replace(/^(\d+)(st|nd|rd|th)-([a-z]{3})-.*/, '$1$2 $3')
  const side = p.getByText(new RegExp(label, 'i')).first()
  if (!(await side.count())) fails.push(`no sidebar row matching "${label}"`)
  else { await side.click().catch(() => {}); await p.waitForTimeout(4000) }

  const probe = await p.evaluate(async () => {
    const v = document.querySelector('video')
    if (!v) return { video: false }
    const track = v.querySelector('track')
    await new Promise((res) => {
      if (v.readyState >= 1) return res()
      v.addEventListener('loadedmetadata', res, { once: true })
      setTimeout(res, 12000)
    })
    let vttStatus = null
    if (track?.src) {
      try { vttStatus = (await fetch(track.src)).status } catch (e) { vttStatus = `err ${e.message}` }
    }
    return {
      video: true,
      src: v.currentSrc || v.src,
      crossOrigin: v.crossOrigin,
      readyState: v.readyState,
      duration: Math.round(v.duration || 0),
      trackSrc: track?.src ?? null,
      trackKind: track?.kind ?? null,
      vttStatus,
      heading: document.querySelector('h1,h2')?.textContent?.trim().slice(0, 90) ?? null,
      hasNotes: /Team training notes/i.test(document.body.innerText),
      bodyWide: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }
  })
  console.log(JSON.stringify(probe, null, 2))

  if (!probe.video) fails.push('no <video> element on the lesson page')
  else {
    if (!/recap-video-proxy/.test(probe.src || '')) fails.push(`video src is not the proxy: ${probe.src}`)
    // The src must be THIS lesson's release key, not whichever lesson the page
    // opened on: 19 Aug once passed while the 26 Aug player was on screen.
    const wantMonth = label.slice(-3).toLowerCase()
    if (!new RegExp(`team-training-\\d{4}-${{jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'}[wantMonth]}-`).test(probe.src || '')) {
      fails.push(`player is not this lesson: ${probe.src}`)
    }
    // A trimmed training runs tens of minutes. The bar is "a real recording
    // loaded", not a length: these calls run anywhere from 35 to 180 minutes.
    if (!probe.duration || probe.duration < 600) {
      fails.push(`video duration ${probe.duration}s, too short to be a training`)
    }
    if (!probe.trackSrc) fails.push('no caption <track> rendered')
    if (probe.vttStatus !== 200) fails.push(`caption fetch returned ${probe.vttStatus}`)
    if (!probe.hasNotes) fails.push('lecture notes not rendered')
  }

  await p.screenshot({ path: '/tmp/tt-lesson-desktop.png', fullPage: false })
  await p.setViewportSize({ width: 390, height: 844 })
  await p.waitForTimeout(1500)
  const overflow = await p.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
  if (overflow) fails.push('horizontal overflow at 390px')
  await p.screenshot({ path: '/tmp/tt-lesson-mobile.png' })
} finally {
  await b.close()
  await cleanup()
}

const real = errors.filter((e) => !/favicon|ResizeObserver|Download the React|analytics|insights/i.test(e))
console.log(JSON.stringify({ failures: fails, consoleErrors: real.slice(0, 6) }, null, 2))
process.exit(fails.length ? 1 : 0)
