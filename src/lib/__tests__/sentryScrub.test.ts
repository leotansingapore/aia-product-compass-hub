import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { cleanUrl, scrubSentryBreadcrumb, scrubSentryEvent, scrubSentryValue } from '@/lib/sentryScrub'

// v8 reference test, ported: academy.finternship.com and this app's routes (/playbooks/share/).
const HOST = 'https://academy.finternship.com'
// A third-party origin (//clientco.com/) is kept on purpose; its path and query are not.
const PII = /maria|santos|john|tan\b|91234567|9123|4567|917|555|S1234567D|eyJhbGci|qwertyuiop|secret|DEF\b|0123456789abcdef|abc123|3f2a9c4e|clientco\.com\/[^\s]/i

describe('Sentry events leave without client figures, bearer links or personal details', () => {
  it('cleans the page address and drops the raw query string', () => {
    const out = scrubSentryEvent({
      request: { url: `${HOST}/playbooks/share/0123456789abcdef?client=1&age=45&income=90000#x`, query_string: 'client=1&age=45&income=90000', headers: { Referer: `${HOST}/playbooks/share/0123456789abcdef?k=secret` } },
      transaction: '/playbooks/share/0123456789abcdef',
    })
    expect(out.request.url).toBe(`${HOST}/playbooks/share/:id`)
    expect(out.request.query_string).toBeUndefined()
    expect(out.request.headers).toBeUndefined() // headers, cookies and bodies never leave
    expect(out.transaction).toBe('/playbooks/share/:id')
  })

  it('cleans URLs in messages and breadcrumbs, keeps Supabase paths without their query', () => {
    const out = scrubSentryValue({
      exception: { values: [{ value: `Failed to fetch ${HOST}/search?name=Tan&income=90000 (500)` }] },
      breadcrumbs: [
        { category: 'navigation', data: { from: '/playbooks/share/0123456789abcdef', to: `${HOST}/search?name=Tan` } },
        { category: 'fetch', data: { url: 'https://hgdbflprrficdoyxmdxe.supabase.co/rest/v1/client_profiles?id=eq.3f2a9c4e-1b7d-4e8a-9c0f-2d5b6a7e8f90' } },
        { category: 'fetch', data: { url: 'https://www.linkedin.com/in/maria-santos-0a1b2c3/' } },
      ],
    })
    expect(out.exception.values[0].value).toBe(`Failed to fetch ${HOST}/search (cut)`)
    expect(out.breadcrumbs[0].data).toEqual({ from: '/playbooks/share/:id', to: `${HOST}/search` })
    expect(out.breadcrumbs[1].data.url).toBe('https://hgdbflprrficdoyxmdxe.supabase.co/rest/v1/client_profiles')
    expect(out.breadcrumbs[2].data.url).toBe('https://www.linkedin.com/')
  })

  it('removes every example the seven review rounds found', () => {
    const cases = [
      // rounds 1-3: URLs in text, escapes, schemeless, tokens, personal details
      `Failed ${HOST}/search?name=Tan(x)&income=90000 (500)`,
      '{"url":"https:\\/\\/academy.finternship.com\\/search?name=Tan&income=90000"}',
      'loading academy.finternship.com/playbooks/share/0123456789abcdef failed',
      'opened /playbooks/share/0123456789abcdef?k=3f2a9c4e1b7d4e8a9c0f2d5b6a7e8f90',
      'duplicate key: Key (email)=(john.tan@gmail.com), NRIC S1234567D, mobile +65 9123 4567',
      '/reset#access_token=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.sig-part_1&type=recovery',
      'redirecting to #access_token=abc123secret&type=recovery now',
      // round 4: a path followed by text
      '/report failed: https://www.linkedin.com/in/maria-santos',
      '/report failed for 9123 4567 S1234567D and eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.sig-part_1',
      '/x/report/john%40gmail.com',
      // round 5: decode order, bare queries
      '/view/3f2a9c4e-1b7d-4e8a-9c0f-2d5b6a7e8f90/va/0123456789abcdef failed',
      '/playbooks/share/john%20tan-ab12',
      `${HOST}/x?code=abc%20DEF`,
      'upload 100% failed for /x/report/john%40gmail.com',
      'call %2B65%209123%204567',
      'domain=clientco.com&name=Tan',
      '/playbooks/share/maria%2Fsantos-ab12',
      '/playbooks/share/maria%20santos',
      `${HOST}/playbooks/share/x?name=John%20Tan&phone=91234567`,
      // round 6: encoded delimiters, brackets, quoted values
      '%2Fplaybooks%2Fshare%2Fjohn-tan-ab12cd34ef56',
      'redirect %2Fplaybooks%2Fshare%2Fqwertyuiop failed',
      'lookup %3Fname%3DJohn%20Tan done',
      'from https%3A%2F%2Fclientco.com%2Fpath%2Fmaria',
      '%252Fplaybooks%252Fshare%252Fjohn-tan-ab12cd34ef56',
      'GET /x?page=1&filter[email]=a&name[first]=John',
      'click on button.open[title="Open John Tan"]',
      // round 7: protocol-relative, brackets in a path query, encoded labels, underscores
      '//clientco.com/clients/maria-santos?name=John',
      'fetch //clientco.com/clients/maria-santos failed',
      '/tracker/crm?filter[name]=John',
      '/x?name=John Tan',
      'span %5Btitle%3D%22Open%20John%20Tan%22%5D',
      'upload lead_91234567_quote.pdf failed',
      'file x_S1234567D_y.pdf',
      'access_eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.sig-part_1',
      '%25252Fplaybooks%25252Fshare%25252Fjohn-tan-ab12cd34ef56',
      // round 7 findings on v7: 4x encoding, escapes splitting PII, quotes and ] in values
      '%2525252Ftracker%2525252Fcrm%2525252Fjohn-tan',
      '%2525253Fname%2525253DJohn%25252520Tan',
      '9123%FF4567',
      'S123%FF4567D',
      '/tracker/crm%FF/john-tan',
      'john%2525252540gmail.com',
      '/x failed: https://www.linkedin.com/in/maria-santos?x=1',
      'button[title="Open [VIP] John Tan"]',
      'img[alt="Photo of "Maria" Santos"]',
      'div.card > img[title="Say "hi" to John Tan"] > span',
      'api/leads?filter[name]=John',
      'fetch failed: ?name[first]=John&phone[0]=91234567',
      'filter%5Bname%5D=John%20Tan',
      // round 8 findings on v8: params without ?, deep-encoded cuts, > inside a value
      '/x;name=John Tan',
      '/api&name=John',
      `${HOST}/x;name=John`,
      'redirect %252Fx%253Fname%253DJohn Tan failed',
      'div.card > button[title="Clients > John Tan"]',
      'img[alt="Clients > Maria Santos"] > span',
      // round 8 findings: tokens at the end of a slug, Supabase ids, phone separators
      '/doc/q3-payroll-3f2a9c4e-1b7d-4e8a-9c0f-2d5b6a7e8f90',
      'https://hgdbflprrficdoyxmdxe.supabase.co/functions/v1/oauth-server/consents/3f2a9c4e-1b7d-4e8a-9c0f-2d5b6a7e8f90',
      'call 9123.4567', 'call 9123  4567', 'call (9123) 4567', 'call 9123 \u2013 4567',
      // decoded paths with spaces, JSON in messages
      'No routes matched location "/tracker/crm/Maria Santos"',
      'see https://www.linkedin.com/in/maria santos',
      'Error: {"name":"maria santos","company":"acme"}',
      // phone numbers outside Singapore
      'call +63 917 123 4567 now', 'call +1 415 555 0123', 'call 415-555-0123', 'call 0917 123 4567',
      // round 11 findings: third-party files under /static/, bracketed lists, @ inside JSON
      'https://files.clientco.com/static/invoices/Maria_Santos_Invoice_2026.pdf',
      'https://cdn.example.com/assets/John-Tan-NRIC.pdf',
      'Duplicate clients: ["Maria","John"]',
      'received ["Maria Santos"]',
      '{"handle":"@maria","name":"Maria Santos"}',
      // round 12 findings: single quotes, object literals, spaced lists
      "Duplicate clients: ['Maria','John']",
      "{'name':'Maria Santos'}",
      'clients "Maria", "John" clash',
    ]
    for (const c of cases) expect(scrubSentryValue(c), c).not.toMatch(PII)
    expect(scrubSentryValue('domain=clientco.com&name=Tan')).not.toMatch(/clientco/)
  })

  it("leaves Sentry's own fields alone: types, mechanisms, functions, sdk, measurements, metadata", () => {
    const event = {
      exception: { values: [{ type: 'AuthSessionMissingError', value: 'Auth session missing!', mechanism: { type: 'auto.browser.global_handlers.onerror', handled: false }, stacktrace: { frames: [{ function: 'Object.mutationFn', module: 'react-query', filename: `${HOST}/assets/index-AbC123xYz.js`, lineno: 3 }] } }] },
      measurements: { 'ttfb.requestTime': { value: 12, unit: 'millisecond' } },
      sdkProcessingMetadata: { dynamicSamplingContext: { trace_id: 'abc', public_key: 'x' } },
      sdk: { name: 'sentry.javascript.react', packages: [{ name: 'npm:@sentry/react', version: '9.1.0' }] },
      request: { url: `${HOST}/x`, headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh)', Cookie: 'sb=abc' } },
    }
    const out = scrubSentryEvent(event)
    expect(out.exception).toEqual(event.exception)
    expect(out.measurements).toEqual(event.measurements)
    expect(out.sdkProcessingMetadata).toEqual(event.sdkProcessingMetadata)
    expect(out.sdk).toEqual(event.sdk)
    expect(out.request).toEqual({ url: `${HOST}/x`, headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh)' } })
  })

  it('keeps Supabase calls, Next routes and stale-chunk paths, and stays fast on long text', () => {
    expect(scrubSentryValue('https://x.supabase.co/rest/v1/client_profiles?select=id%2Cname')).toBe('https://x.supabase.co/rest/v1/client_profiles')
    expect(scrubSentryEvent({ transaction: 'GET /api/projects/[id]/keywords' }).transaction).toBe('GET /api/projects/[id]/keywords')
    expect(scrubSentryValue('Failed to fetch dynamically imported module: https://cdn.example.com/assets/Page-AbC123.js')).toContain('/assets/Page-AbC123.js')
    const t = Date.now()
    scrubSentryValue('a'.repeat(20000) + '@')
    expect(Date.now() - t).toBeLessThan(200)
    expect(scrubSentryValue('name=tan then John Tan')).not.toMatch(/John|Tan\b/)
    expect(scrubSentryValue('retry at 2026-10-07T01:13:00Z after 3 tries, v9.1.0')).toBe('retry at 2026-10-07T01:13:00Z after 3 tries, v9.1.0')
  })

  it('rebuilds the event from allowlists: unlisted fields never leave', () => {
    const out = scrubSentryEvent({
      fingerprint: ['{{ default }}', 'client John Tan'],
      threads: { values: [{ name: 'John Tan' }] },
      modules: { react: '18.3.1' },
      server_name: 'john-macbook',
      exception: { values: [{ type: 'Error', value: 'boom', mechanism: { type: 'generic', handled: true, data: { client: 'John Tan' } }, stacktrace: { frames: [{ function: 'f', vars: { name: 'John Tan' } }] } }] },
      breadcrumbs: [{ category: 'nav', message: { text: 'John Tan' }, extraField: 'John Tan' }],
      futureSdkField: { name: 'John Tan' },
    } as Record<string, unknown>)
    expect(JSON.stringify(out)).not.toMatch(/John|john/)
    expect((out as { exception: { values: { mechanism: unknown }[] } }).exception.values[0].mechanism).toEqual({ type: 'generic', handled: true })
    expect(scrubSentryEvent({ fingerprint: ['{{ default }}'] }).fingerprint).toEqual(['{{ default }}'])
    for (const part of ['S1234567D', '91234567', 'john-tan-ab12cd34ef56', 'maria.santos']) {
      expect(scrubSentryEvent({ fingerprint: ['{{ default }}', part] }).fingerprint).toBeUndefined()
    }
    const frame = { function: 'f', filename: `${HOST}/playbooks/share/0123456789abcdef`, context_line: 'self.__next_f.push([1,"Maria Santos"])', pre_context: ['x'], post_context: ['y'] }
    const cleaned = scrubSentryEvent({ exception: { values: [{ type: 'E', stacktrace: { frames: [frame] } }] } })
    expect(JSON.stringify(cleaned)).not.toMatch(/Maria|john|context/)
    expect(cleanUrl('app:///_next/static/chunks/app/page-AbC123.js')).toBe('app:///_next/static/chunks/app/page-AbC123.js')
    expect(cleanUrl('app:///playbooks/share/0123456789abcdef')).toBe('app:///playbooks/share/:id')
    expect(cleanUrl('app:///tracker/crm/Maria_Santos/maria@clientco.com')).not.toMatch(/Maria|maria/)
    for (const v of ['app:///\\maria_santos/x', 'app:////maria_santos/x', 'app:///a\\maria_santos']) expect(cleanUrl(v)).not.toMatch(/maria/)
    expect(scrubSentryEvent({ fingerprint: ['{{ maria.santos }}'] }).fingerprint).toBeUndefined()
    expect(scrubSentryEvent({ fingerprint: ['{{ error.type }}', '{{ transaction }}'] }).fingerprint).toEqual(['{{ error.type }}', '{{ transaction }}'])
  })

  it('drops the response context and cleans the React component stack', () => {
    const out = scrubSentryEvent({ contexts: { response: { headers: { 'set-cookie': 'sb=abc' } }, react: { componentStack: '\n    at ClientRow (https://academy.finternship.com/playbooks/share/0123456789abcdef)\n    at List' } } })
    expect(out.contexts).not.toHaveProperty('response')
    expect(JSON.stringify(out)).not.toMatch(/john/)
    expect(String((out.contexts as { react: { componentStack: string } }).react.componentStack)).toContain('at List')
  })

  it('keeps ordinary words, build-file frames and Sentry ids', () => {
    expect(scrubSentryValue("TypeError: Cannot read properties of undefined (reading 'map')")).toBe("TypeError: Cannot read properties of undefined (reading 'map')")
    const frame = { filename: `${HOST}/assets/index-AbC123xYz.js`, lineno: 1 }
    expect(scrubSentryValue(frame)).toEqual(frame)
    const ids = { event_id: '3f2a9c4e1b7d4e8a9c0f2d5b6a7e8f90', trace_id: 'a1b2c3d4e5f60718293a4b5c6d7e8f90', span_id: '1a2b3c4d5e6f7081', release: 'b5ca9faa07a145eee9cf962d389352426bd8b3ad', tags: { posthog_session: '0199b1c2-7d4e-7a1b-9c3d-2e5f6a7b8c9d' } }
    expect(scrubSentryValue(ids)).toEqual(ids)
  })

  it('exempts id keys only for id-shaped values, never for app data or array items', () => {
    const out = scrubSentryValue({ release: 'john@x.com', extra: { release: ['john@x.com'], dist: ['john@x.com'], trace_id: 'see /playbooks/share/0123456789abcdef' } })
    expect(JSON.stringify(out)).not.toMatch(/john/)
  })

  it('keeps only the fields Sentry needs: app data, unknown contexts and custom breadcrumb data go', () => {
    const out = scrubSentryEvent({
      extra: { __serialized__: { name: 'maria santos' } },
      contexts: { custom: { client: 'John Tan' }, browser: { name: 'Chrome' } },
      request: { url: `${HOST}/search`, data: { name: 'John Tan' }, cookies: 'sb=abc' },
      breadcrumbs: [{ category: 'app', message: 'saved', data: { client: 'John Tan', url: '/playbooks/share/0123456789abcdef' } }],
    })
    expect(JSON.stringify(out)).not.toMatch(/maria|John|Tan/)
    expect(out.contexts).toEqual({ browser: { name: 'Chrome' } })
    expect(out.breadcrumbs).toEqual([{ category: 'app', message: 'saved', data: { url: '/playbooks/share/:id' } }])
  })

  it('is stable when a cleaned breadcrumb is cleaned again inside the event', () => {
    const once = scrubSentryValue(`Failed to fetch ${HOST}/playbooks/share/0123456789abcdef?x=1 then retried`)
    expect(scrubSentryValue(once)).toBe(once)
  })

  it('drops Supabase storage paths, cleans keys, and never sends an over-deep object raw', () => {
    expect(scrubSentryValue('https://hgdbflprrficdoyxmdxe.supabase.co/storage/v1/object/sign/assignment-uploads/ab12/John-Tan-policy.pdf?token=abc')).toBe('https://hgdbflprrficdoyxmdxe.supabase.co/storage/v1/:path')
    expect(Object.keys(scrubSentryValue({ [`${HOST}/playbooks/share/0123456789abcdef`]: 1 }))).toEqual([`${HOST}/playbooks/share/:id`])
    let deep: Record<string, unknown> = { url: `${HOST}/search?name=Tan` }
    for (let i = 0; i < 20; i++) deep = { next: deep }
    expect(JSON.stringify(scrubSentryValue(deep))).not.toContain('name=Tan')
  })

  it('drops console breadcrumbs and strips attribute values from click breadcrumbs', () => {
    expect(scrubSentryBreadcrumb({ category: 'console', message: 'loaded client {name: "John Tan"}' })).toBeNull()
    const click = scrubSentryBreadcrumb({ category: 'ui.click', message: 'div.card > button.open[title="Open John Tan"][aria-label="John Tan"]' })
    expect(click?.message).toBe('div.card > button.open')
  })

  it('sentry.ts runs every event, transaction and breadcrumb through the cleaner', () => {
    const src = readFileSync('src/lib/sentry.ts', 'utf8')
    expect(src).toMatch(/beforeSend: \(event\) => scrubSentryEvent\(withPostHogSession\(event\)\)/)
    expect(src).toMatch(/beforeSendTransaction: \(event\) => scrubSentryEvent\(event\)/)
    expect(src).toMatch(/beforeBreadcrumb: \(breadcrumb\) => scrubSentryBreadcrumb\(breadcrumb\)/)
  })
})
