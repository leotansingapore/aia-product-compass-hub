// The catalog is only worth anything if it stays complete. This reads the
// REAL route tree off disk and rebuilds full paths for nested routes, so a
// screen added next month fails here until someone decides whether it reports.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  FEATURE_CATALOG, REDIRECT_ONLY, RESCOPED, RETIRED_LABELS,
  featureForPath, isRedirectOnly, isUntracked, featureLabel, featureArea,
} from '../featureCatalog'

const appFile = resolve(__dirname, '../../App.tsx')

/** Every route as a full path, walking nested <Route> blocks by indentation. */
function declaredRoutes(): { path: string; to: string | null }[] {
  const out: { path: string; to: string | null }[] = []
  const stack: { path: string; indent: number }[] = []
  for (const line of readFileSync(appFile, 'utf8').split('\n')) {
    const indent = line.search(/\S/)
    if (/^\s*<\/Route>\s*$/.test(line)) {
      while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop()
      continue
    }
    const m = line.match(/<Route\s+(?:index|path="([^"]*)")/)
    if (!m) continue
    const parent = stack.length ? stack[stack.length - 1].path : ''
    const p = m[1]
    const full = p === undefined ? parent || '/' : p.startsWith('/') ? p : `${parent}/${p}`
    // A <Navigate> element makes the route an alias; `to` is resolved the way
    // the router does (relative to the parent) and its query dropped.
    const nav = line.match(/element=\{<Navigate\s+to="([^"?]+)/)
    const to = nav ? (nav[1].startsWith('/') ? nav[1] : `${parent}/${nav[1]}`) : null
    out.push({ path: full, to })
    // A parent opens when the tag is not self-closed on the same line.
    if (!/\/>\s*$/.test(line) && !/<\/Route>/.test(line)) stack.push({ path: full, indent })
  }
  const sample = (p: string) => p.replace(/:[A-Za-z]+\??/g, 'sample')
  return out
    .filter((r) => r.path !== '*' && !r.path.endsWith('/*'))
    .map((r) => ({ path: sample(r.path), to: r.to && sample(r.to) }))
}

const declaredPaths = (): string[] => [...new Set(declaredRoutes().filter((r) => !r.to).map((r) => r.path))]
const aliases = () => declaredRoutes().filter((r): r is { path: string; to: string } => !!r.to)

describe('feature catalog', () => {
  it('reads a real, nested route tree', () => {
    const paths = declaredPaths()
    expect(paths.length).toBeGreaterThan(90)
    expect(paths).toContain('/learning-track/pre-rnf/assignments/sample')
    expect(paths).toContain('/learning-track/admin/first-60-days')
    expect(paths).toContain('/library/products')
  })

  it('gives every screen either a feature key or a written reason', () => {
    const unexplained = declaredPaths().filter((p) => !featureForPath(p) && !isUntracked(p) && !isRedirectOnly(p))
    expect(unexplained).toEqual([])
  })

  it('gives no redirect a key its destination does not carry', () => {
    // On the 2026-11-06 catalog this listed 9 aliases: /how-to-use,
    // /content-studio, /cheat-sheets, /changelog, /sales-playbooks, the three
    // pre-RNF redirects and /learning-track/first-30-days.
    const list = aliases()
    expect(list.length).toBeGreaterThan(15)
    const borrowed = list
      .filter((a) => featureForPath(a.path) !== null && featureForPath(a.path)?.key !== featureForPath(a.to)?.key)
      .map((a) => `${a.path} -> ${a.to}`)
    expect(borrowed).toEqual([])
  })

  it('reports nothing for a path whose component always redirects', () => {
    expect(featureForPath('/learning-track')).toBeNull()
    expect(featureForPath('/library')).toBeNull()
    // Exact, so the index never silences the screens under it.
    for (const r of REDIRECT_ONLY) expect(isRedirectOnly(`${r.path}/sample`), r.path).toBe(false)
  })

  it('never gives two screens the same label', () => {
    const labels = [...FEATURE_CATALOG.map((f) => f.label), ...Object.values(RETIRED_LABELS)]
    expect(labels.length).toBe(new Set(labels).size)
  })

  it('retires keys out of the catalog and re-scopes only live ones, each with a real date', () => {
    for (const key of Object.keys(RETIRED_LABELS)) expect(FEATURE_CATALOG.some((f) => f.key === key), key).toBe(false)
    for (const [key, since] of Object.entries(RESCOPED)) {
      expect(FEATURE_CATALOG.some((f) => f.key === key), key).toBe(true)
      expect(since).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(since)), key).toBe(false)
    }
  })

  it('has no duplicate keys', () => {
    const keys = FEATURE_CATALOG.map((f) => f.key)
    expect(keys.length).toBe(new Set(keys).size)
  })

  it('keeps an index page from swallowing its children', () => {
    expect(featureForPath('/learning-track/pre-rnf/assignments')?.key).toBe('lt_pre_rnf_assignments')
    expect(featureForPath('/learning-track/pre-rnf/assignments/x')?.key).toBe('lt_pre_rnf_assignments')
    expect(featureForPath('/learning-track/pre-rnf/assignments/assignment-08/tool/y')?.key).toBe('lt_pre_rnf_tools')
    expect(featureForPath('/learning-track/admin/roster')?.key).toBe('lt_admin')
    expect(featureForPath('/library/products')?.key).toBe('library_products')
    expect(featureForPath('/product/pro-achiever/study')?.key).toBe('product_study')
    expect(featureForPath('/product/pro-achiever/some-lesson')?.key).toBe('product')
    expect(featureForPath('/')?.key).toBe('home')
  })

  it('never lets a longer path borrow a shorter feature key', () => {
    expect(featureForPath('/flowsx')).toBeNull()
    expect(featureForPath('/cmfas-exams/manage')?.key).toBe('cmfas_manage')
    for (const f of FEATURE_CATALOG) {
      const src = f.match.source
      expect(src.endsWith('(?:\\/|$)') || src.endsWith('/?$'), `${f.key} matcher lacks a boundary`).toBe(true)
    }
  })

  it('reports nothing for the admin area or the share links', () => {
    expect(featureForPath('/admin')).toBeNull()
    expect(featureForPath('/playbooks/share/tok')).toBeNull()
    expect(featureForPath('/playbooks/abc')?.key).toBe('playbooks')
  })

  it('labels a key the database returns that the catalog no longer carries', () => {
    expect(featureLabel('some_retired_thing')).toBe('Some retired thing')
    expect(featureLabel('lt_home')).toBe('Track: home (a redirect)')
    expect(featureArea('lt_home')).toBe('Retired')
    expect(featureArea('some_retired_thing')).toBe('Retired')
  })
})
