import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { scrubSentryBreadcrumb, scrubSentryEvent, scrubSentryValue } from '@/lib/sentryScrub'

const HOST = 'https://academy.finternship.com'
const UUID = '3f2a9c4e-1b7d-4e8a-9c0f-2d5b6a7e8f90'
const SUPABASE = 'https://hgdbflprrficdoyxmdxe.supabase.co'

describe('Sentry events leave without login tokens, share tokens or learner details', () => {
  it('cleans the page address and drops the raw query string', () => {
    const out = scrubSentryEvent({
      request: { url: `${HOST}/reset-password?code=abc123&email=john.tan@gmail.com#access_token=x&type=recovery`, query_string: 'code=abc123&email=john.tan@gmail.com', headers: { Referer: `${HOST}/playbooks/share/9f86d081884c7d65?ref=wa` } },
      transaction: `/roleplay/feedback/${UUID}`,
    })
    expect(out.request.url).toBe(`${HOST}/reset-password`)
    expect(out.request.query_string).toBeUndefined()
    expect(out.request.headers.Referer).toBe(`${HOST}/playbooks/share/:id`)
    expect(out.transaction).toBe('/roleplay/feedback/:id')
  })

  it('cleans URLs inside messages and breadcrumbs, keeps Supabase paths without their query', () => {
    const out = scrubSentryValue({
      exception: { values: [{ value: `Failed to fetch ${HOST}/case-vault/${UUID}?client=Tan&premium=9000 (500)` }] },
      breadcrumbs: [
        { category: 'navigation', data: { from: '/playbooks/share/9f86d081884c7d65', to: `${HOST}/search?q=John+Tan` } },
        { category: 'fetch', data: { url: `${SUPABASE}/rest/v1/case_vault?id=eq.${UUID}` } },
        { category: 'fetch', data: { url: 'https://www.linkedin.com/in/john-tan-0a1b2c3/' } },
      ],
    })
    expect(out.exception.values[0].value).toBe(`Failed to fetch ${HOST}/case-vault/:id (500)`)
    expect(out.breadcrumbs[0].data).toEqual({ from: '/playbooks/share/:id', to: `${HOST}/search` })
    expect(out.breadcrumbs[1].data.url).toBe(`${SUPABASE}/rest/v1/case_vault`)
    expect(out.breadcrumbs[2].data.url).toBe('https://www.linkedin.com/')
  })

  it('cleans URLs a regex would cut short, escape or find without a scheme', () => {
    const out = scrubSentryValue({
      bracket: `Failed ${HOST}/search?q=Tan(x)&premium=9000 (500)`,
      escaped: `{"url":"https:\\/\\/academy.finternship.com\\/search?q=Tan&premium=9000"}`,
      schemeless: 'loading academy.finternship.com/playbooks/share/9f86d081884c7d65 failed',
      token: 'opened /playbooks/share/9f86d081884c7d65?k=3f2a9c4e1b7d4e8a9c0f2d5b6a7e8f90',
    })
    for (const v of Object.values(out)) {
      expect(v).not.toMatch(/q=|premium=|Tan\(|9000|9f86d081884c7d65|3f2a9c4e1b7d4e8a9c0f2d5b6a7e8f90/)
    }
    expect(out.schemeless).toContain('/playbooks/share/:id')
  })

  it('drops Supabase storage paths, cleans keys, and never sends an over-deep object raw', () => {
    const storage = scrubSentryValue(`${SUPABASE}/storage/v1/object/sign/assignment-uploads/ab12/John-Tan-answers.pdf?token=abc`)
    expect(storage).toBe(`${SUPABASE}/storage/v1/:path`)
    expect(Object.keys(scrubSentryValue({ [`${HOST}/playbooks/share/9f86d081884c7d65`]: 1 }))).toEqual([`${HOST}/playbooks/share/:id`])
    let deep: Record<string, unknown> = { url: `${HOST}/search?q=Tan` }
    for (let i = 0; i < 20; i++) deep = { next: deep }
    expect(JSON.stringify(scrubSentryValue(deep))).not.toContain('q=Tan')
  })

  it('removes personal details and login tokens from any text', () => {
    const out = scrubSentryValue({
      message: 'duplicate key: Key (email)=(john.tan@gmail.com), NRIC S1234567D, mobile +65 9123 4567',
      recovery: '/reset-password#access_token=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.sig-part_1&type=recovery',
      jwt: 'token eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.sig-part_1',
      inText: 'redirecting to #access_token=abc123secret&type=recovery now',
    })
    expect(JSON.stringify(out)).not.toMatch(/john\.tan|S1234567D|9123|eyJhbGci|access_token=|abc123secret/)
  })

  it('drops console breadcrumbs and strips attribute values from click breadcrumbs', () => {
    expect(scrubSentryBreadcrumb({ category: 'console', message: 'loaded case {client: "John Tan"}' })).toBeNull()
    const click = scrubSentryBreadcrumb({ category: 'ui.click', message: 'div.card > button.open[title="Open John Tan"][aria-label="John Tan"]' })
    expect(click?.message).toBe('div.card > button.open')
  })

  it("leaves Sentry's own ids alone", () => {
    const ids = { event_id: '3f2a9c4e1b7d4e8a9c0f2d5b6a7e8f90', trace_id: 'a1b2c3d4e5f60718293a4b5c6d7e8f90', span_id: '1a2b3c4d5e6f7081' }
    expect(scrubSentryValue(ids)).toEqual(ids)
  })

  it('leaves stack frames pointing at build files intact', () => {
    const frame = { filename: `${HOST}/assets/index-AbC123xYz.js`, lineno: 1 }
    expect(scrubSentryValue(frame)).toEqual(frame)
  })

  it('sentry.ts runs every event, transaction and breadcrumb through the cleaner', () => {
    const src = readFileSync('src/lib/sentry.ts', 'utf8')
    expect(src).toMatch(/beforeSend: \(event\) => scrubSentryEvent\(withPostHogSession\(event\)\)/)
    expect(src).toMatch(/beforeSendTransaction: \(event\) => scrubSentryEvent\(event\)/)
    expect(src).toMatch(/beforeBreadcrumb: \(breadcrumb\) => scrubSentryBreadcrumb\(breadcrumb\)/)
  })
})
