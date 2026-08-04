import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import GithubSlugger from "github-slugger";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { ScriptsHubHeaderTabs } from "@/components/scripts/ScriptsTabBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Archive, ImageIcon, ExternalLink, Search, X, List } from "lucide-react";
import { useConceptCards, type ConceptCard } from "@/hooks/useConceptCards";

// Vite raw-import: bundles the markdown text directly into the page chunk.
// The leading underscore filename keeps it out of the day-numbered glob.
import playbookMarkdown from "../../docs/product-mastery-track/_drawings-playbook.md?raw";

// Strip frontmatter so the rendered page doesn't show YAML at the top.
function stripFrontmatter(raw: string): string {
  if (raw.startsWith("---")) {
    const end = raw.indexOf("\n---", 3);
    if (end !== -1) return raw.slice(end + 4).trimStart();
  }
  return raw;
}

/**
 * Normalise a drawing heading like "Drawing 1 — The 1/3 Rule circle" or
 * "The 1/3 Rule circle" down to a comparable key. The playbook H2 uses
 * "Drawing N — Title" while the seeded concept_cards titles are just "Title".
 */
function normaliseHeading(raw: string): string {
  // Strip "Drawing N — " prefix
  const stripped = raw.replace(/^Drawing\s+\d+\s+[—–-]\s+/i, "").trim();
  // Lowercase + collapse whitespace; we use this as a loose match key.
  return stripped.toLowerCase().replace(/\s+/g, " ");
}

/**
 * Build a lookup table from playbook heading → ConceptCard. Uses a permissive
 * substring match in both directions so e.g. playbook "The 1/3 Rule circle"
 * matches concept card "The 1/3 Rule circle" but also tolerates minor wording
 * drift like "circle" suffix vs none.
 */
function buildHeadingToCardMap(cards: ConceptCard[]): Map<string, ConceptCard> {
  const map = new Map<string, ConceptCard>();
  for (const card of cards) {
    if (!card.title) continue;
    map.set(normaliseHeading(card.title), card);
  }
  return map;
}

function findCardForHeading(
  rawHeading: string,
  index: Map<string, ConceptCard>,
  allCards: ConceptCard[]
): ConceptCard | undefined {
  const norm = normaliseHeading(rawHeading);
  if (index.has(norm)) return index.get(norm);
  // Fallback: loose substring match (e.g. "1/3 rule" vs "the 1/3 rule circle")
  return allCards.find((c) => {
    const ck = normaliseHeading(c.title);
    if (!ck) return false;
    return ck.includes(norm) || norm.includes(ck);
  });
}

interface PlaybookHeading {
  id: string;
  text: string;
  level: number;
  /** The Tier / section H1 this heading sits under, for context in the list. */
  section: string | null;
}

/**
 * Jump-to index for the playbook.
 *
 * This page is ~35 phone screens of reference material with 58 headings and,
 * before this, no search, no contents list and no in-page navigation at all —
 * "Drawing 10" sat 19 screens down. An FC sitting in front of a client who asks
 * about the retirement gap had to thumb-scroll for it.
 *
 * The headings are read from the RENDERED DOM rather than re-derived from the
 * markdown: `rehypeSlug` owns the ids, and recomputing them here would be a
 * second implementation of its slug algorithm that could silently drift and
 * leave every link pointing at nothing.
 */
function DrawingsQuickJump({ ready }: { ready: boolean }) {
  const [headings, setHeadings] = useState<PlaybookHeading[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready) return;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-playbook-body] h1, [data-playbook-body] h2, [data-playbook-body] h3"),
    );
    let section: string | null = null;
    const next: PlaybookHeading[] = [];
    for (const el of els) {
      const text = (el.textContent || "").trim();
      if (!el.id || !text) continue;
      const level = Number(el.tagName.slice(1));
      if (level === 1) section = text;
      next.push({ id: el.id, text, level, section: level === 1 ? null : section });
    }
    setHeadings(next);
    // Concept-card images arrive asynchronously and re-render the H2s, so
    // re-read once they settle. Ids are stable; this only refills an empty list.
  }, [ready]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return headings;
    return headings.filter(
      (h) => h.text.toLowerCase().includes(q) || (h.section || "").toLowerCase().includes(q),
    );
  }, [headings, query]);

  // Close when tapping outside, so the list never sits over the content a
  // consultant just jumped to.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const jumpTo = useCallback((id: string) => {
    if (!document.getElementById(id)) return;
    setOpen(false);
    setQuery("");

    // Put the drawing in the address bar. Without this the URL never changed,
    // so there was no way to send someone "the retirement-gap drawing" — and
    // Back skipped the whole playbook instead of stepping through your jumps.
    // `replaceState` keeps it out of history (a jump is not a page visit).
    try {
      window.history.replaceState(null, "", `#${id}`);
    } catch {
      /* non-critical: the scroll below still works */
    }

    // Offset by whatever is actually pinned to the top right now (app header +
    // this bar) instead of a hard-coded number that breaks at the other
    // breakpoint or if the header height ever changes.
    const desiredTop = () => {
      const header = document.querySelector("header");
      const headerH =
        header && getComputedStyle(header).position === "sticky" ? header.getBoundingClientRect().height : 0;
      return headerH + (barRef.current?.getBoundingClientRect().height ?? 0) + 12;
    };

    // Scroll, then re-measure and correct until the heading actually lands.
    //
    // A single computed scrollTo overshot badly: the drawing images are
    // `loading="lazy"`, so a long jump reveals images ABOVE the target that
    // then load and grow the document underneath the in-flight smooth scroll.
    // Jumping from Tier 3 back to Drawing 1 left the heading 276px off the top
    // of the screen. Correcting after the layout settles is the only thing that
    // survives content whose height isn't known until it scrolls into view.
    let attempt = 0;
    const settle = () => {
      const el = document.getElementById(id);
      if (!el) return;
      const delta = el.getBoundingClientRect().top - desiredTop();
      if (Math.abs(delta) <= 4 || attempt > 8) return;
      window.scrollTo({
        top: Math.max(0, window.scrollY + delta),
        behavior: attempt === 0 ? "smooth" : "auto",
      });
      attempt += 1;
      setTimeout(settle, attempt === 1 ? 420 : 110);
    };
    settle();
  }, []);


  if (!ready || headings.length === 0) return null;

  return (
    <div ref={containerRef} className="sticky top-[57px] md:top-12 z-30 -mx-3 md:-mx-6 px-3 md:px-6 pt-2 pb-2 bg-background mb-4">
      <div ref={barRef} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={`Jump to a drawing — ${headings.filter((h) => h.level === 2).length} sections`}
          aria-label="Search the playbook and jump to a drawing"
          aria-expanded={open}
          aria-controls="drawings-jump-list"
          className="pl-10 pr-10 h-11"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(true);
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Hide the contents list" : "Show the contents list"}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
          >
            <List className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div
          id="drawings-jump-list"
          role="listbox"
          className="absolute left-3 right-3 md:left-6 md:right-6 mt-1 max-h-[60vh] overflow-y-auto rounded-lg border bg-popover shadow-lg z-50"
        >
          {matches.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">Nothing in the playbook matches “{query.trim()}”.</p>
          ) : (
            matches.map((h) => (
              <button
                key={h.id}
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => jumpTo(h.id)}
                className={`w-full text-left px-3 py-2.5 hover:bg-accent transition-colors border-b border-border/40 last:border-0 ${
                  h.level === 1 ? "bg-muted/40" : ""
                }`}
              >
                <span
                  className={
                    h.level === 1
                      ? "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                      : h.level === 2
                        ? "text-sm font-medium"
                        : "text-sm text-muted-foreground pl-3 block"
                  }
                >
                  {h.text}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function DrawingsPlaybookPage() {
  const [markdown, setMarkdown] = useState<string>("");
  const { cards } = useConceptCards();

  useEffect(() => {
    setMarkdown(stripFrontmatter(playbookMarkdown));
  }, []);

  const headingIndex = useMemo(() => buildHeadingToCardMap(cards), [cards]);

  // Custom H2 renderer: extract heading text, look up matching concept card,
  // and render image + "View as Concept Card" deep-link directly under the heading.
  const components: Components = useMemo(() => {
    const slugger = new GithubSlugger();
    return {
      // Wide comparison tables scroll inside their own box rather than forcing
      // the page sideways. Replaces the page-level clip that used to hide the
      // right-hand columns outright.
      table: ({ children, ...rest }) => (
        <div className="not-prose my-4 overflow-x-auto rounded-lg border">
          <table className="w-full text-sm [&_td]:border-t [&_td]:px-3 [&_td]:py-2 [&_th]:bg-muted/40 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold" {...rest}>
            {children}
          </table>
        </div>
      ),
      h2: ({ children, ...rest }) => {
        slugger.reset();
        const textContent = String(
          Array.isArray(children)
            ? children.map((c) => (typeof c === "string" ? c : "")).join("")
            : (children ?? "")
        ).trim();
        const card = findCardForHeading(textContent, headingIndex, cards);
        const id = slugger.slug(textContent);

        // Pull the first image URL the card has (image_urls preferred, then image_url).
        const imgUrl =
          (card?.image_urls && card.image_urls[0]) || card?.image_url || null;

        return (
          <>
            <h2 id={id} {...rest}>
              {children}
            </h2>
            {card && (
              <div className="not-prose mt-2 mb-4 flex flex-col gap-3 rounded-xl border bg-card p-3 sm:p-4">
                {imgUrl ? (
                  <a
                    href={imgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-lg bg-white"
                  >
                    <img
                      src={imgUrl}
                      alt={textContent}
                      loading="lazy"
                      className="w-full max-h-96 object-contain mx-auto"
                    />
                  </a>
                ) : (
                  <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-6 text-xs text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    <span>
                      No drawing uploaded yet — open the Concept Card to add one
                    </span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5 items-center text-xs">
                  <Link
                    to={`/concept-cards?q=${encodeURIComponent(card.title)}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-medium border border-primary/20 transition-colors"
                  >
                    <Pencil className="h-3 w-3" />
                    Open Concept Card
                    <ExternalLink className="h-3 w-3 opacity-50" />
                  </Link>
                  {card.tags?.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border border-border/60 text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        );
      },
    };
  }, [cards, headingIndex]);

  return (
    <PageLayout
      title="Drawings Playbook — FINternship"
      description="The 30+ diagrams that close cases. Methodology, scripts, and drilling protocol for every drawing in the APA appointment flow."
    >
      <BrandedPageHeader
        tone="dark"
        showOnMobile
        title="Drawings Playbook"
        subtitle="Every diagram an FC needs in an appointment — structure, script, when to use it."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Drawings Playbook" }]}
        headerTabs={<ScriptsHubHeaderTabs />}
      />

      {/* No `overflow-x-hidden` here. It was guarding against the playbook's
          wide comparison tables, but an ancestor with a clipped overflow axis
          makes `position: sticky` non-functional for everything inside it — the
          jump bar below scrolled away with the page instead of pinning. The
          tables now scroll inside their own container (see `components.table`),
          which also beats clipping: the clipped columns were unreachable. */}
      <div className="mx-auto px-3 md:px-6 py-3 md:py-8 max-w-4xl">
        {/* Companion-tool quick links */}
        <div className="flex flex-wrap gap-2 mb-5">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/concept-cards">
              <Pencil className="h-4 w-4" />
              Drill in Concept Cards
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/case-vault">
              <Archive className="h-4 w-4" />
              Real-receipt closes
            </Link>
          </Button>
        </div>

        <DrawingsQuickJump ready={!!markdown} />

        {/* Markdown body — every H2 (Drawing) gets an inline image panel if a
            matching Concept Card exists. */}
        <Card>
          <CardContent
            data-playbook-body
            // `scroll-mt` on every heading so the BROWSER's native #hash scroll
            // clears the app header (57px) plus the sticky jump bar (~52px).
            // Fighting the native scroll from JS did not work — it re-fires as
            // lazy images settle and kept planting the heading at y=0, hidden
            // behind the chrome. Letting it win, but landing it correctly, is
            // both simpler and more robust.
            className="prose prose-sm max-w-none px-4 py-5 dark:prose-invert sm:prose-base sm:px-8 sm:py-8 [&_h1]:scroll-mt-28 [&_h2]:scroll-mt-28 [&_h3]:scroll-mt-28"
          >
            {markdown ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
                components={components}
              >
                {markdown}
              </ReactMarkdown>
            ) : (
              <div className="space-y-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted/70" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted/70" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer cross-links */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/concept-cards"
            className="group rounded-2xl border bg-card p-4 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-primary mb-1">
              <Pencil className="h-4 w-4" />
              <span className="text-sm font-semibold">Concept Cards</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Drill every drawing as a flash card. Quiz mode + spaced repetition + focus drawing canvas.
            </p>
          </Link>
          <Link
            to="/case-vault"
            className="group rounded-2xl border bg-card p-4 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Archive className="h-4 w-4" />
              <span className="text-sm font-semibold">Case Vault</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Real-prospect receipts across all 7 AIA products. Each case lists the drawings used.
            </p>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
