/**
 * Curated reference documents that ship alongside the day pages but live in
 * `_source-supplementary/` (everything else in that folder is gitignored — only
 * the explicit allow-list in .gitignore is shipped). Each file has YAML
 * frontmatter at the top; the body is plain markdown rendered with
 * `dayMarkdownComponents`.
 */

const rawLoaders = import.meta.glob<string>(
  "/docs/first-60-days/_source-supplementary/*.md",
  { query: "?raw", import: "default" },
);

const PATH_RE = /\/docs\/first-60-days\/_source-supplementary\/(.+)\.md$/;

const loaderBySlug: Record<string, () => Promise<string>> = {};
for (const [path, loader] of Object.entries(rawLoaders)) {
  const m = path.match(PATH_RE);
  if (!m) continue;
  loaderBySlug[m[1]] = loader as () => Promise<string>;
}

const FRONTMATTER_RE = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

export interface ReferenceDoc {
  slug: string;
  title: string;
  body: string;
  frontmatter: Record<string, string>;
}

const cache = new Map<string, ReferenceDoc>();

export function listReferenceSlugs(): string[] {
  return Object.keys(loaderBySlug).sort();
}

export async function loadReference(slug: string): Promise<ReferenceDoc | undefined> {
  if (cache.has(slug)) return cache.get(slug)!;
  const loader = loaderBySlug[slug];
  if (!loader) return undefined;
  const raw = await loader();
  const match = raw.match(FRONTMATTER_RE);
  let frontmatter: Record<string, string> = {};
  let body = raw;
  if (match) {
    body = raw.slice(match[0].length);
    const yaml = match[1];
    for (const line of yaml.split("\n")) {
      const kv = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/);
      if (!kv) continue;
      const value = kv[2].trim().replace(/^["']|["']$/g, "");
      if (value) frontmatter[kv[1]] = value;
    }
  }
  // Title preference: frontmatter `source` > frontmatter `title` > derived from slug.
  const title =
    frontmatter.source ||
    frontmatter.title ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const doc: ReferenceDoc = { slug, title, body, frontmatter };
  cache.set(slug, doc);
  return doc;
}
