// Page lists read from the app's own content, for build-og.mjs. Plain Node: no Vite, no
// TS aliases, so the few app rules needed here (slugs, category ids) are read from source.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './card.mjs';

/** ASCII only on a card or in a preview: dashes and quotes mapped, emoji and the rest dropped. */
export const clean = (s) =>
  String(s ?? '')
    .replace(/\s+[\u2013\u2014]\s+/g, ', ')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/[^\x20-\x7e]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** A preview description: one or two sentences, never cut mid-word. */
export const summary = (s, max = 180) => {
  const t = clean(
    String(s ?? '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[*_`]+/g, ''),
  );
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const stop = cut.lastIndexOf('. ');
  return stop > 60 ? cut.slice(0, stop + 1) : `${cut.slice(0, cut.lastIndexOf(' '))}...`;
};

/** src/utils/slugUtils.ts createSlug, which product and lesson URLs are built from. */
export const createSlug = (text) =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '');

/** categoryIdToSlugMap from slugUtils.ts: the slug the app puts in /category/ links. */
export function categoryIdSlugs() {
  const src = readFileSync(path.join(ROOT, 'src/utils/slugUtils.ts'), 'utf8');
  const block = src.match(/categoryIdToSlugMap[^{]*\{([\s\S]*?)\n\};/);
  if (!block) throw new Error('categoryIdToSlugMap not found in src/utils/slugUtils.ts');
  return Object.fromEntries([...block[1].matchAll(/'([0-9a-f-]{36})':\s*'([a-z0-9-]+)'/g)].map((m) => [m[1], m[2]]));
}

/** Frontmatter of a markdown file as flat key -> string. */
export function frontmatter(file) {
  const src = readFileSync(file, 'utf8');
  const m = src.match(/^---\n([\s\S]*?)\n---/);
  const out = {};
  if (!m) return out;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].replace(/^["']|["']$/g, '').trim();
  }
  return out;
}

/**
 * Every <Route> in src/App.tsx as { path, to? } with nested paths joined to their parent.
 * `to` is set for a static <Navigate to="..."> so a shared old link previews as its target.
 */
export function appRoutes() {
  const lines = readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf8').split('\n');
  const stack = [];
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('</Route>')) {
      stack.pop();
      continue;
    }
    if (!line.startsWith('<Route ')) continue;
    // A tag may span lines (element={ ... }); read until it ends as a leaf or a parent.
    let tag = line;
    while (!/\/>$|\}>$/.test(tag) && i + 1 < lines.length) tag += ` ${lines[++i].trim()}`;
    const own = tag.match(/\spath="([^"]+)"/)?.[1];
    const parent = stack.length ? stack[stack.length - 1] : '';
    const full = own == null ? parent : own.startsWith('/') ? own : `${parent.replace(/\/$/, '')}/${own}`;
    if (own != null || tag.includes(' index ')) {
      const to = tag.match(/<Navigate to="([^"?]+)/)?.[1];
      const target = to && !to.includes(':') ? (to.startsWith('/') ? to : `${full}/${to}`) : undefined;
      out.push({ path: full || '/', to: target });
    }
    if (/\}>$/.test(tag)) stack.push(full);
  }
  return out;
}
