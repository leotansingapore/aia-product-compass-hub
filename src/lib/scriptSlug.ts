/**
 * Utilities for pretty URL slugs for script deep-links.
 * Format: "<title-slug>-<first-8-chars-of-uuid>"
 * e.g. "warm-market-intro-8f42b1c3"
 */

/** Convert a script title + UUID into a URL-friendly slug */
export function toScriptSlug(stage: string, id: string): string {
  const titleSlug = stage
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")   // strip special chars
    .trim()
    .replace(/\s+/g, "-")            // spaces → hyphens
    .replace(/-+/g, "-")             // collapse double hyphens
    .slice(0, 48);                   // max 48 chars for title portion
  const shortId = id.replace(/-/g, "").slice(0, 8);
  return `${titleSlug}-${shortId}`;
}

/** Extract the short ID suffix from a slug (last segment after final hyphen-group) */
function extractShortId(slug: string): string {
  // The short ID is the last 8 hex characters appended after the last hyphen
  const match = slug.match(/([0-9a-f]{8})$/i);
  return match ? match[1].toLowerCase() : "";
}

/** Given a URL slug (or a raw UUID for backward compat), find the matching script ID */
export function resolveScriptSlug<T extends { id: string; stage: string }>(
  slugOrId: string,
  scripts: T[]
): string | null {
  if (!slugOrId) return null;

  // 1. Direct UUID match (backward compat with old links)
  if (/^[0-9a-f-]{36}$/i.test(slugOrId)) {
    const direct = scripts.find(s => s.id === slugOrId);
    if (direct) return direct.id;
  }

  // 2. Match by short ID suffix
  const shortId = extractShortId(slugOrId);
  if (shortId) {
    const byShortId = scripts.find(s =>
      s.id.replace(/-/g, "").toLowerCase().startsWith(shortId)
    );
    if (byShortId) return byShortId.id;
  }

  return null;
}
