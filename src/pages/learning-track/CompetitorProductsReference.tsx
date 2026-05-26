import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, BookOpen, Loader2, Search } from "lucide-react";

// Load via Vite glob ?raw (same pattern used by features/first-60-days/assignments.ts).
// Single-file globs work fine — the glob returns a record with one entry.
const rawLoaders = import.meta.glob<string>(
  "/docs/competitor-products-singapore.md",
  { query: "?raw", import: "default" },
);

const loadRaw = Object.values(rawLoaders)[0] as (() => Promise<string>) | undefined;

// Strip the YAML frontmatter block before rendering — readers don't need it.
function stripFrontmatter(raw: string): string {
  const match = raw.match(/^---\s*\n[\s\S]*?\n---\s*\n?/);
  return match ? raw.slice(match[0].length) : raw;
}

// Extract H2 headings so we can render a section jump-list.
function extractSections(md: string): Array<{ slug: string; title: string }> {
  const lines = md.split("\n");
  const sections: Array<{ slug: string; title: string }> = [];
  for (const line of lines) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (!m) continue;
    const title = m[1].trim();
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    sections.push({ slug, title });
  }
  return sections;
}

export default function CompetitorProductsReference() {
  const [raw, setRaw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!loadRaw) {
      setError("Reference document could not be located.");
      return;
    }
    loadRaw()
      .then((text) => {
        if (!cancelled) setRaw(text);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "Failed to load reference.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const body = useMemo(() => (raw ? stripFrontmatter(raw) : ""), [raw]);
  const sections = useMemo(() => extractSections(body), [body]);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (raw === null) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto" data-testid="competitor-products-reference">
      <div>
        <Link
          to="/learning-track/resources"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Resources
        </Link>
      </div>

      <header className="space-y-2 border-b pb-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <BookOpen className="h-3 w-3" /> Reference
        </div>
        <h1 className="text-2xl font-semibold">Singapore Competitor Product Inventory</h1>
        <p className="text-sm text-muted-foreground">
          A lookup of current retail life and health policies sold by the six major insurers in Singapore — AIA,
          Great Eastern, Prudential, Singlife, Income Insurance, and Manulife — classified into Life, Endowment,
          Medical, and Investment-linked.
        </p>
      </header>

      {sections.length > 0 && (
        <nav aria-label="Jump to section" className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
            <Search className="h-3 w-3" /> Jump to
          </p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {sections.map((s) => (
              <li key={s.slug}>
                <a href={`#${s.slug}`} className="text-primary hover:underline">
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <article className="prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:scroll-mt-20 prose-table:text-sm">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
      </article>
    </div>
  );
}
