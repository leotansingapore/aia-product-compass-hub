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

export interface ReferenceListItem {
  slug: string;
  title: string;
  subtitle?: string;
}

// Docs that are internal indexes rather than learner-facing references.
const HIDDEN_FROM_INDEX = /^INDEX-/i;

function humanizeType(type?: string): string | undefined {
  if (!type) return undefined;
  return type.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Loads metadata for every shipped reference so the index page can list them,
 * skipping internal index docs (e.g. the video-course master index). Sorted by
 * title. Used by the First 60 Days references index.
 */
export async function listReferences(): Promise<ReferenceListItem[]> {
  const slugs = listReferenceSlugs().filter((slug) => !HIDDEN_FROM_INDEX.test(slug));
  const docs = await Promise.all(slugs.map((slug) => loadReference(slug)));
  return docs
    .filter((d): d is ReferenceDoc => Boolean(d))
    .filter((d) => d.frontmatter.type !== "master-index")
    .map((d) => ({
      slug: d.slug,
      title: d.title,
      subtitle: d.frontmatter.purpose || humanizeType(d.frontmatter.type),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}
