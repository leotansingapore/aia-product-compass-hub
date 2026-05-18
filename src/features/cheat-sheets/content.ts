// Cheat-sheets content loader.
// Pulls every markdown file under /docs/cheat-sheets/ at build time and
// exposes a flat catalog plus a per-sheet lazy loader. Mirrors the pattern
// in features/product-mastery-track/content.ts but without progress tracking
// since cheat sheets are pure reference material.

export type CheatSheetSection = "first-60-days" | "next-60-days" | "product-mastery" | "core-training";

export interface CheatSheetEntry {
  section: CheatSheetSection;
  slug: string;        // filename without .md, e.g. "week-01" or "appointment-setting"
  title: string;       // from frontmatter `title:`
  description: string; // first non-empty line after the H1 quote-block, or empty
  course?: string;     // from frontmatter `course:`
  week?: number;       // from frontmatter `week:` when present
  module?: string;     // from frontmatter `module:` when present
  weeklyKpi?: string;  // from frontmatter `weekly_kpi:` when present
  tags: string[];
  path: string;        // canonical /docs path for cross-references
}

const SECTIONS: readonly CheatSheetSection[] = [
  "first-60-days",
  "next-60-days",
  "product-mastery",
  "core-training",
] as const;

const rawLoaders = import.meta.glob<string>("/docs/cheat-sheets/**/*.md", {
  query: "?raw",
  import: "default",
});

const indexLoader = import.meta.glob<string>("/docs/cheat-sheets/index.md", {
  query: "?raw",
  import: "default",
  eager: false,
});

const PATH_RE = /\/docs\/cheat-sheets\/([^/]+)\/([^/]+)\.md$/;
const SKIP_FILES = new Set(["_TEMPLATE.md"]);

const loaderByKey: Map<string, () => Promise<string>> = new Map();
const loaderByIndex: () => Promise<string> | undefined = (() => {
  for (const v of Object.values(indexLoader)) return v;
  return () => undefined as unknown as Promise<string>;
})();

interface ParsedFrontmatter {
  title?: string;
  course?: string;
  week?: number;
  module?: string;
  weekly_kpi?: string;
  tags?: string[];
  audience?: string;
}

function parseFrontmatter(raw: string): { fm: ParsedFrontmatter; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: raw };
  const fm: ParsedFrontmatter = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1] as keyof ParsedFrontmatter;
    let val: string = kv[2].trim();
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key === "tags") {
      const inner = val.replace(/^\[/, "").replace(/\]$/, "");
      const tags = inner
        .split(",")
        .map((t) => t.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
      (fm as Record<string, unknown>)[key] = tags;
    } else if (key === "week") {
      const n = Number(val);
      if (!Number.isNaN(n)) fm[key] = n;
    } else {
      (fm as Record<string, unknown>)[key] = val;
    }
  }
  return { fm, body: m[2] };
}

// Extract the first quoted "the one idea" pull-quote or first paragraph as description.
function extractDescription(body: string): string {
  // Look for "> **The one idea:** ..." pattern first
  const oneIdea = body.match(/^>\s*\*\*The one idea:\*\*\s*(.+)/m);
  if (oneIdea) {
    return oneIdea[1].replace(/<[^>]+>/g, "").trim().slice(0, 240);
  }
  // Otherwise: first non-heading, non-quote, non-empty line after the H1
  const lines = body.split("\n");
  let pastH1 = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!pastH1) {
      if (trimmed.startsWith("# ")) {
        pastH1 = true;
      }
      continue;
    }
    if (trimmed.startsWith("#")) continue;
    if (trimmed.startsWith(">")) {
      return trimmed.replace(/^>+\s*/, "").replace(/\*\*/g, "").slice(0, 240);
    }
    if (trimmed.startsWith("|") || trimmed.startsWith("-") || trimmed.startsWith("*")) continue;
    return trimmed.slice(0, 240);
  }
  return "";
}

// Eagerly read each .md to populate the catalog. The bodies are small (~6-12KB)
// and there are only ~33 files, so eager parsing is fine and gives us instant
// search / index render without N async fetches.
const CATALOG: CheatSheetEntry[] = [];
let catalogReady = false;
let catalogPromise: Promise<CheatSheetEntry[]> | null = null;

async function buildCatalog(): Promise<CheatSheetEntry[]> {
  if (catalogReady) return CATALOG;
  if (catalogPromise) return catalogPromise;
  catalogPromise = (async () => {
    const entries: CheatSheetEntry[] = [];
    for (const [path, loader] of Object.entries(rawLoaders)) {
      const m = path.match(PATH_RE);
      if (!m) continue;
      const sectionRaw = m[1];
      const slug = m[2];
      if (SKIP_FILES.has(`${slug}.md`)) continue;
      if (slug === "index") continue;
      if (!SECTIONS.includes(sectionRaw as CheatSheetSection)) continue;
      const section = sectionRaw as CheatSheetSection;
      const key = `${section}/${slug}`;
      loaderByKey.set(key, loader as () => Promise<string>);
      const raw = await (loader as () => Promise<string>)();
      const { fm, body } = parseFrontmatter(raw);
      entries.push({
        section,
        slug,
        title: fm.title ?? slug,
        description: extractDescription(body),
        course: fm.course,
        week: fm.week,
        module: fm.module,
        weeklyKpi: fm.weekly_kpi,
        tags: fm.tags ?? [],
        path,
      });
    }
    entries.sort((a, b) => {
      const sa = SECTIONS.indexOf(a.section);
      const sb = SECTIONS.indexOf(b.section);
      if (sa !== sb) return sa - sb;
      // Weeks first by number, modules alphabetically
      const wa = a.week ?? Number.POSITIVE_INFINITY;
      const wb = b.week ?? Number.POSITIVE_INFINITY;
      if (wa !== wb) return wa - wb;
      return a.slug.localeCompare(b.slug);
    });
    CATALOG.length = 0;
    CATALOG.push(...entries);
    catalogReady = true;
    return CATALOG;
  })();
  return catalogPromise;
}

export async function getAllSheets(): Promise<CheatSheetEntry[]> {
  return buildCatalog();
}

export async function getSheetsBySection(section: CheatSheetSection): Promise<CheatSheetEntry[]> {
  const all = await buildCatalog();
  return all.filter((s) => s.section === section);
}

export async function getSheet(section: CheatSheetSection, slug: string): Promise<{ entry: CheatSheetEntry; body: string } | undefined> {
  const all = await buildCatalog();
  const entry = all.find((s) => s.section === section && s.slug === slug);
  if (!entry) return undefined;
  const key = `${section}/${slug}`;
  const loader = loaderByKey.get(key);
  if (!loader) return undefined;
  const raw = await loader();
  const { body } = parseFrontmatter(raw);
  return { entry, body };
}

// Load the master index page body for the landing card.
export async function getIndexBody(): Promise<string | undefined> {
  const raw = await loaderByIndex();
  if (!raw) return undefined;
  const { body } = parseFrontmatter(raw);
  return body;
}

export const SECTION_META: Record<CheatSheetSection, { title: string; tagline: string }> = {
  "first-60-days": {
    title: "First 60 Days",
    tagline: "Pre-licence onboarding - mindset, math, productivity, fundamentals.",
  },
  "next-60-days": {
    title: "Next 60 Days",
    tagline: "Post-licence first business - cold outreach, pitching, closing.",
  },
  "product-mastery": {
    title: "Product Mastery",
    tagline: "One product per week - specs, openers, objections, cross-sell.",
  },
  "core-training": {
    title: "Core Training",
    tagline: "Foundational modules used across every advisor engagement.",
  },
};

export const SECTION_ORDER: readonly CheatSheetSection[] = SECTIONS;
