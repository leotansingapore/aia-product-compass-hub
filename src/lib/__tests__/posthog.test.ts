import { describe, expect, it, vi } from 'vitest'

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }))

import { isProductionHost, isTestEmail, maskAttribute, maskNetworkEntry, scrubEvent, scrubUrl } from '@/lib/posthog'
import type { CaptureResult, CapturedNetworkRequest } from 'posthog-js'

const UUID = '3f2a9c4e-1b7d-4e8a-9c0f-2d5b6a7e8f90'

describe('scrubUrl', () => {
  it('drops a recovery hash and every non-utm query param', () => {
    expect(
      scrubUrl('https://academy.finternship.com/reset-password?code=abc&utm_source=fb&email=a@b.com#access_token=eyJhbGci.x.y&type=recovery')
    ).toBe('https://academy.finternship.com/reset-password?utm_source=fb')
  })

  it('replaces ids and share tokens, keeps page slugs', () => {
    expect(scrubUrl(`/roleplay/feedback/${UUID}`)).toBe('/roleplay/feedback/:id')
    expect(scrubUrl('/playbooks/share/9f86d081884c7d65')).toBe('/playbooks/share/:id')
    expect(scrubUrl(`/learning-track/admin/recruit/${UUID}`)).toBe('/learning-track/admin/recruit/:id')
    expect(scrubUrl('/n/k9XbQ2mZr7TwLp4s')).toBe('/n/:id')
    expect(scrubUrl('/learning-track/first-60-days/reference/objection-handling')).toBe(
      '/learning-track/first-60-days/reference/objection-handling'
    )
    expect(scrubUrl('/learning-track/first-60-days/day/12')).toBe('/learning-track/first-60-days/day/12')
  })

  it('leaves non-URL strings alone', () => {
    expect(scrubUrl('$direct')).toBe('$direct')
    expect(scrubUrl(UUID)).toBe(UUID)
  })
})

describe('scrubEvent', () => {
  it('scrubs event URLs and the replay href', () => {
    const event = {
      uuid: 'u',
      event: '$snapshot',
      properties: {
        $current_url: `https://academy.finternship.com/roleplay/feedback/${UUID}?q=John`,
        distinct_id: UUID,
        $snapshot_data: [
          { type: 4, data: { href: 'https://academy.finternship.com/auth#access_token=secret' } },
          { type: 2, data: 'compressed' },
        ],
      },
      $set_once: { $initial_current_url: 'https://academy.finternship.com/?email=a@b.com' },
    } as unknown as CaptureResult
    const out = scrubEvent(event)!
    expect(out.properties.$current_url).toBe('https://academy.finternship.com/roleplay/feedback/:id')
    expect(out.properties.distinct_id).toBe(UUID)
    expect(out.properties.$snapshot_data[0].data.href).toBe('https://academy.finternship.com/auth')
    expect(out.$set_once!.$initial_current_url).toBe('https://academy.finternship.com/')
  })
})

describe('what never leaves', () => {
  it('scrubs URLs nested in heatmaps and web vitals, keys included', () => {
    const event = {
      uuid: 'u',
      event: '$$heatmap',
      properties: {
        $heatmap_data: {
          [`https://academy.finternship.com/roleplay/feedback/${UUID}?q=secret`]: [{ x: 1 }],
          [`https://academy.finternship.com/roleplay/feedback/${UUID}?q=other`]: [{ x: 2 }],
        },
        $web_vitals_LCP_event: { value: 1200, $current_url: `https://academy.finternship.com/auth#access_token=secret` },
      },
    } as unknown as CaptureResult
    const out = scrubEvent(event)!
    expect(out.properties.$heatmap_data).toEqual({ [`https://academy.finternship.com/roleplay/feedback/:id`]: [{ x: 1 }, { x: 2 }] })
    expect(out.properties.$web_vitals_LCP_event.$current_url).toBe(`https://academy.finternship.com/auth`)
    expect(out.properties.$web_vitals_LCP_event.value).toBe(1200)
  })

  it('drops the page title and scrubs link hrefs in the autocapture chain', () => {
    const event = {
      uuid: 'u',
      event: '$autocapture',
      properties: {
        title: 'John Tan | FINternship',
        $elements_chain: `a:attr__href="/playbooks/share/9f86d081884c7d65?x=1"href="/roleplay/feedback/${UUID}?tab=chat"nth-child="1"`,
      },
    } as unknown as CaptureResult
    const out = scrubEvent(event)!
    expect(out.properties.title).toBeUndefined()
    expect(out.properties.$elements_chain).toBe('a:attr__href="/playbooks/share/:id"href="/roleplay/feedback/:id"nth-child="1"')
  })
})

describe('addresses in links', () => {
  it('keeps only the scheme of tel:, mailto: and friends, and drops phone numbers in paths', () => {
    expect(scrubUrl('tel:+6591234567')).toBe('tel:')
    expect(scrubUrl('mailto:john@client.com?subject=hi')).toBe('mailto:')
    expect(scrubUrl('https://wa.me/6591234567?text=hello')).toBe('https://wa.me/')
    expect(scrubUrl('/invite/a1b2c3d4e5f6')).toBe('/invite/:id')
    expect(maskAttribute('href', 'tel:+6591234567')).toBe('tel:')
    expect(maskAttribute('data-phone', '91234567')).toBe('********')
    expect(maskAttribute('data-state', 'open')).toBe('open')
    const event = { uuid: 'u', event: '$autocapture', properties: { $elements_chain: 'a:attr__href="tel:+6591234567"nth-child="1"' } } as unknown as CaptureResult
    expect(scrubEvent(event)!.properties.$elements_chain).toBe('a:attr__href="tel:"nth-child="1"')
  })
})

describe('maskAttribute', () => {
  it('masks human-readable attributes, scrubs links, keeps styling', () => {
    expect(maskAttribute('aria-label', 'Open feedback for John Tan')).toBe('************')
    expect(maskAttribute('title', 'Jo')).toBe('**')
    expect(maskAttribute('href', `/roleplay/feedback/${UUID}?tab=chat`)).toBe('/roleplay/feedback/:id')
    expect(maskAttribute('class', 'flex gap-2')).toBe('flex gap-2')
    expect(maskAttribute('style', 'background-image: url("https://x.supabase.co/storage/v1/object/sign/a.png?token=abc")')).toBe('background-image: url("https://x.supabase.co/")')
    expect(maskAttribute('data-share', '/playbooks/share/9f86d081884c7d65')).toBe('/playbooks/share/:id')
    expect(maskAttribute('data-state', 'open')).toBe('open')
  })
})

describe('isTestEmail', () => {
  it('matches the demo accounts and the shared test domains', () => {
    expect(isTestEmail('master_admin@demo.com')).toBe(true)
    expect(isTestEmail('user@demo.com')).toBe(true)
    expect(isTestEmail('x@mailinator.com')).toBe(true)
    expect(isTestEmail('qa@agency.demo')).toBe(true)
    expect(isTestEmail('you@aia.com.sg')).toBe(false)
    expect(isTestEmail(null)).toBe(false)
  })
})

describe('isProductionHost', () => {
  it('is the academy domain only, never a preview or localhost', () => {
    expect(isProductionHost('academy.finternship.com')).toBe(true)
    expect(isProductionHost('aia-product-compass-hub.vercel.app')).toBe(false)
    expect(isProductionHost('aia-product-compass-hub-git-main-leo.vercel.app')).toBe(false)
    expect(isProductionHost('localhost')).toBe(false)
    expect(isProductionHost('evilacademy.finternship.com')).toBe(false)
    expect(isProductionHost('academy.finternship.com.evil.io')).toBe(false)
  })
})

describe('init config', () => {
  it('blocks /flags without switching off remote config, which replay needs', async () => {
    const { readFileSync } = await import('node:fs')
    const src = readFileSync('src/lib/posthog.ts', 'utf8')
    expect(src).toMatch(/advanced_disable_feature_flags: true/)
    expect(src).not.toMatch(/advanced_disable_flags:/)
  })

  it('never captures click attributes, sends straight to PostHog, records every session', async () => {
    const { readFileSync } = await import('node:fs')
    const src = readFileSync('src/lib/posthog.ts', 'utf8')
    // posthog-js escapes quotes but not backslashes in $elements_chain, so a
    // filter over that string is a parser differential; collect none at all.
    expect(src).toMatch(/mask_all_element_attributes: true,/)
    expect(src).toMatch(/api_host: 'https:\/\/us\.i\.posthog\.com'/)
    expect(src).toMatch(/sampleRate: 1,/)
  })
})

describe('template v2 (2026-10-05 reviews)', () => {
  it('keeps only the origin of a link to any other site', () => {
    expect(scrubUrl('https://www.linkedin.com/in/maria-santos-0a1b2c3/')).toBe('https://www.linkedin.com/')
    expect(scrubUrl('https://mariasantos.com/portfolio?ref=x')).toBe('https://mariasantos.com/')
    expect(scrubUrl('//evil.example/in/john-tan')).toBe('//evil.example/')
    expect(scrubUrl('https://aia-product-compass-hub.vercel.app/learning-track/first-60-days/reference/objection-handling')).toBe('https://aia-product-compass-hub.vercel.app/')
    expect(scrubUrl('https://academy.finternship.com/learning-track/first-60-days/day/12')).toBe('https://academy.finternship.com/learning-track/first-60-days/day/12')
    expect(scrubUrl('https://fonts.googleapis.com/css2?family=Inter')).toBe('https://fonts.googleapis.com/css2?family=Inter')
  })

  it('leaves build files alone and survives malformed escapes and odd paths', () => {
    expect(scrubUrl('/assets/index-AbCdEfGh12345678.js')).toBe('/assets/index-AbCdEfGh12345678.js')
    expect(scrubUrl('/blog/50%off')).toBe('/blog/50%off')
    expect(scrubUrl('/roleplay//feedback//' + UUID)).toBe('/roleplay/feedback/:id')
    expect(scrubUrl('//roleplay//feedback')).toBe('//roleplay/')
    expect(scrubUrl('https://[bad')).toBe('')
  })

  it('keeps what a replay needs to render, nothing more', () => {
    expect(maskAttribute('_cssText', '.a{color:red}.b{background:url(/n/9f86d081884c7d659a2feaa0c55ad015)}')).toBe('.a{color:red}.b{background:url(/n/:id)}')
    expect(maskAttribute('rr_width', '120px')).toBe('120px')
    expect(maskAttribute('rr_dataURL', 'data:image/png;base64,AAAA')).toBe('data:')
    expect(maskAttribute('href', '#icon-check')).toBe('#icon-check')
    expect(maskAttribute('href', 'https://www.linkedin.com/in/maria-santos/')).toBe('https://www.linkedin.com/')
  })

  it('pins the settings the project could otherwise switch on', async () => {
    const { readFileSync } = await import('node:fs')
    const src = readFileSync('src/lib/posthog.ts', 'utf8')
    expect(src).toMatch(/persistence: 'localStorage'/)
    expect(src).toMatch(/cross_subdomain_cookie: false/)
    expect(src).toMatch(/logs: \{ captureConsoleLogs: false, beforeSend: \(\) => null \}/)
    expect(src).toMatch(/maskCapturedNetworkRequestFn: maskNetworkEntry,/)
    expect(src).toMatch(/mask_all_element_attributes: true/)
  })
})

describe('template v3: replay page address', () => {
  it('keeps a lone page address, scrubbed, and drops every network entry', () => {
    expect(maskNetworkEntry({ name: 'https://academy.finternship.com/roleplay/feedback/3f2a9c4e-1b7d-4e8a-9c0f-2d5b6a7e8f90?q=John#access_token=x' } as CapturedNetworkRequest)).toEqual({ name: 'https://academy.finternship.com/roleplay/feedback/:id' })
    expect(maskNetworkEntry({ name: 'https://academy.finternship.com/roleplay/feedback/3f2a9c4e-1b7d-4e8a-9c0f-2d5b6a7e8f90?q=John#access_token=x', entryType: 'resource', initiatorType: 'fetch' } as CapturedNetworkRequest)).toBeNull()
    expect(maskNetworkEntry({ name: 'https://academy.finternship.com/roleplay/feedback/3f2a9c4e-1b7d-4e8a-9c0f-2d5b6a7e8f90?q=John#access_token=x', method: 'POST' } as CapturedNetworkRequest)).toBeNull()
  })
})
