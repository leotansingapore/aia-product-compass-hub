import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import GithubSlugger from "github-slugger";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { ScriptsHubHeaderTabs } from "@/components/scripts/ScriptsTabBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Archive, ImageIcon, ExternalLink } from "lucide-react";
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

      <div className="mx-auto px-3 md:px-6 py-3 md:py-8 max-w-4xl overflow-x-hidden">
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

        {/* Markdown body — every H2 (Drawing) gets an inline image panel if a
            matching Concept Card exists. */}
        <Card>
          <CardContent className="prose prose-sm max-w-none px-4 py-5 dark:prose-invert sm:prose-base sm:px-8 sm:py-8">
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
              31 real-prospect receipts across all 7 AIA products. Each case lists the drawings used.
            </p>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
