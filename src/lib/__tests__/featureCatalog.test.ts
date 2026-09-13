// The catalog is only worth anything if it stays complete. This reads the
// REAL route tree off disk and rebuilds full paths for nested routes, so a
// screen added next month fails here until someone decides whether it reports.

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { FEATURE_CATALOG, featureForPath, isUntracked, featureLabel, featureArea } from '../featureCatalog'

const appFile = resolve(__dirname, '../../App.tsx')

/** Every route as a full path, walking nested <Route> blocks by indentation. */
function declaredPaths(): string[] {
  const out: string[] = []
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
    out.push(full)
    // A parent opens when the tag is not self-closed on the same line.
    if (!/\/>\s*$/.test(line) && !/<\/Route>/.test(line)) stack.push({ path: full, indent })
  }
  return [...new Set(out)].filter((p) => p !== '*' && !p.endsWith('/*')).map((p) => p.replace(/:[A-Za-z]+\??/g, 'sample'))
}

describe('feature catalog', () => {
  it('reads a real, nested route tree', () => {
    const paths = declaredPaths()
    expect(paths.length).toBeGreaterThan(90)
    expect(paths).toContain('/learning-track/pre-rnf/assignments/sample')
    expect(paths).toContain('/learning-track/admin/roster')
    expect(paths).toContain('/library/products')
  })

  it('gives every screen either a feature key or a written reason', () => {
    const unexplained = declaredPaths().filter((p) => !featureForPath(p) && !isUntracked(p))
    expect(unexplained).toEqual([])
  })

  it('has no duplicate keys', () => {
    const keys = FEATURE_CATALOG.map((f) => f.key)
    expect(keys.length).toBe(new Set(keys).size)
  })

  it('keeps an index page from swallowing its children', () => {
    expect(featureForPath('/learning-track')?.key).toBe('lt_home')
    expect(featureForPath('/learning-track/pre-rnf')?.key).toBe('lt_pre_rnf')
    expect(featureForPath('/learning-track/pre-rnf/assignments/x')?.key).toBe('lt_pre_rnf_assignments')
    expect(featureForPath('/learning-track/pre-rnf/assignments/assignment-08/tool/y')?.key).toBe('lt_pre_rnf_tools')
    expect(featureForPath('/learning-track/admin/roster')?.key).toBe('lt_admin')
    expect(featureForPath('/library')?.key).toBe('library_home')
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
    expect(featureArea('some_retired_thing')).toBe('Retired')
  })
})
