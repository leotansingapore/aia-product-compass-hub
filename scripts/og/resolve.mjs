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

export function resolvePage(path, pages) {
  const p = normalize(path);
  if (pages[p]) return pages[p];
  const segs = p.split('/').filter(Boolean);
  for (let i = segs.length - 1; i >= 1; i--) {
    const parent = pages[`/${segs.slice(0, i).join('/')}`];
    if (parent) return parent;
  }
  return null;
}
