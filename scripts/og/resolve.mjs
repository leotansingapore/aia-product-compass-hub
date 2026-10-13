// Path -> preview lookup, shared by api/page-og.ts and the tests. Plain JS so the Vercel
// function can bundle it without the app's TS aliases.

export const SITE_NAME = 'FINternship Learning Platform';

/** /og/<slug>.jpg for a path. */
export const cardSlug = (path) =>
  path === '/' ? 'home' : path.replace(/^\/+|\/+$/g, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();

const normalize = (path) => {
  let p = String(path || '/').split(/[?#]/)[0];
  try {
    p = decodeURIComponent(p);
  } catch {
    // A malformed escape is still a path; keep it as typed.
  }
  p = `/${p.replace(/\/{2,}/g, '/').replace(/^\/+|\/+$/g, '')}`;
  return p;
};

// Ids, tokens and numbers say nothing to a reader, so only word slugs become a title.
const WORDY = /^(?=.*[a-z]{3})[a-z0-9]+(?:-[a-z0-9]+)*$/i;
const IDLIKE = /^[0-9a-f]{8}-[0-9a-f]{4}-|^[0-9a-f]{16,}$|\d{4,}/i;

export const humanize = (seg) => {
  if (!WORDY.test(seg) || IDLIKE.test(seg)) return null;
  const words = seg.split('-').join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/**
 * The preview for one shared path: its own entry, else its nearest listed ancestor. One level
 * below an ancestor that allows it (`leaf` not false), the last segment is named in the title,
 * so a lesson published after the last build reads "Medical underwriting | Pro Achiever".
 */
export function resolvePage(path, pages) {
  const p = normalize(path);
  if (pages[p]) return pages[p];
  const segs = p.split('/').filter(Boolean);
  for (let i = segs.length - 1; i >= 1; i--) {
    const parent = pages[`/${segs.slice(0, i).join('/')}`];
    if (!parent) continue;
    const leaf = parent.leaf !== false && i === segs.length - 1 ? humanize(segs[i]) : null;
    return leaf ? { ...parent, title: `${leaf} | ${parent.title}` } : parent;
  }
  return null;
}
