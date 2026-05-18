/**
 * CaseDetail
 *
 * Full-page case-study view, replacing the old popup dialog on /case-vault.
 * One URL per case: /case-vault/:caseId — easier to deep-link, share, scroll,
 * and read on mobile. Pulls the same data as the old dialog plus a "Related
 * cases" section that surfaces sibling cases in the same product / play.
 *
 * Source of structured data: src/data/caseVault.ts
 * Source of reference photos: src/data/case-reference-photos.json
 *                            + photo_case_tags table (admin-tagged)
 * Source of full prose case write-up: linked out to
 *   /learning-track/product-mastery/day/:dayNumber#:anchor
 */
import { useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ExternalLink,
  Pencil,
  ImageIcon,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import {
  CASES,
  CASE_PRODUCTS,
  type CaseEntry,
} from "@/data/caseVault";
import {
  getCaseNarrative,
  normaliseDrawingTitle,
  type DrawingImageLookup,
} from "@/data/caseNarratives";
import { CaseReferencePhotos } from "@/components/case-vault/CaseReferencePhotos";
import { useConceptCards } from "@/hooks/useConceptCards";
import { markdownComponents } from "@/lib/markdown-config";

const NARRATIVE_REMARK_PLUGINS = [remarkGfm];

// Strip the "Play X — " prefix from a play label so it reads naturally in
// a sentence.
function playInSentence(play: string): string {
  return play.replace(/^Play\s+[A-C]\s+[—–-]\s+/i, "").trim().toLowerCase();
}

// Strip the "(Play X receipt)" / "(receipt)" suffix and leading "The" so the
// title reads as a clean noun phrase for use mid-sentence.
function prospectFromTitle(title: string): string {
  return title
    .replace(/\s*\([^)]*receipt[^)]*\)\s*$/i, "")
    .replace(/^The\s+/i, "")
    .trim();
}

// ─── Related cases card ───────────────────────────────────────────────────
function RelatedCaseCard({ entry }: { entry: CaseEntry }) {
  return (
    <Link
      to={`/case-vault/${entry.id}`}
      className="group block rounded-xl border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-primary/40"
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2 min-w-0">
          <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0 font-mono shrink-0">
            Case {entry.code}
          </Badge>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide truncate">
            {CASE_PRODUCTS[entry.product].label}
          </span>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-1">
          {entry.title}
        </h3>
        <div className="text-xs text-muted-foreground line-clamp-2">
          {entry.headline}
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const entry = useMemo(
    () => CASES.find((c) => c.id === caseId) ?? null,
    [caseId]
  );

  // Surface up to 4 sibling cases for the same product, then fill from the
  // same play if needed. Used as a "you might also want to drill" footer.
  const related = useMemo(() => {
    if (!entry) return [];
    const sameProduct = CASES.filter(
      (c) => c.id !== entry.id && c.product === entry.product
    );
    const samePlay = CASES.filter(
      (c) =>
        c.id !== entry.id &&
        c.product !== entry.product &&
        c.play === entry.play
    );
    const merged: CaseEntry[] = [];
    const seen = new Set<string>([entry.id]);
    for (const c of [...sameProduct, ...samePlay]) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      merged.push(c);
      if (merged.length >= 4) break;
    }
    return merged;
  }, [entry]);

  if (!entry) {
    return (
      <PageLayout title="Case not found — Case Vault" description="">
        <BrandedPageHeader
          tone="dark"
          showOnMobile
          title="Case not found"
          subtitle="That case id doesn't exist in the vault."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Case Vault", href: "/case-vault" },
            { label: "Not found" },
          ]}
        />
        <div className="mx-auto px-3 md:px-6 py-10 max-w-3xl">
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              We couldn't find a case with id "{caseId}".
            </p>
            <Button asChild size="sm">
              <Link to="/case-vault">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back to the vault
              </Link>
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Live Concept Cards (Supabase) — used to embed the actual drawing image
  // inline in the narrative wherever the prose references that drawing.
  // Without the lookup the narrative still renders correctly, just without
  // images (linkified text only).
  const { cards: conceptCards } = useConceptCards();

  const drawingImageLookup: DrawingImageLookup = useMemo(() => {
    const map = new Map<string, { imageUrls: string[]; cardId: string }>();
    for (const card of conceptCards) {
      const images: string[] = (card.image_urls && card.image_urls.length > 0)
        ? card.image_urls
        : card.image_url ? [card.image_url] : [];
      if (images.length === 0) continue;
      map.set(normaliseDrawingTitle(card.title), {
        imageUrls: images,
        cardId: card.id,
      });
    }
    return {
      get: (key: string) => map.get(key),
    };
  }, [conceptCards]);

  const titleNoun = prospectFromTitle(entry.title);
  const playPhrase = playInSentence(entry.play);
  const tldr = `A ${entry.prospect.toLowerCase()} — ${titleNoun}. The move: ${playPhrase}, structured as ${entry.anchor}. The numbers landed at ${entry.headline}.`;
  const narrative = useMemo(
    () => getCaseNarrative(entry.id, drawingImageLookup),
    [entry.id, drawingImageLookup],
  );

  return (
    <PageLayout
      title={`Case ${entry.code}: ${entry.title} — Case Vault`}
      description={entry.headline}
    >
      <BrandedPageHeader
        tone="dark"
        showOnMobile
        title={`Case ${entry.code}`}
        subtitle={entry.title}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Case Vault", href: "/case-vault" },
          { label: `Case ${entry.code}` },
        ]}
      />

      <div className="mx-auto px-3 md:px-6 py-4 md:py-8 max-w-4xl overflow-x-hidden">
        {/* Back nav */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-1.5 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 font-mono">
              Case {entry.code}
            </Badge>
            <Badge variant="outline">
              {CASE_PRODUCTS[entry.product].label}
            </Badge>
          </div>
        </div>

        {/* Title block */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight mb-2">
            {entry.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {entry.prospect} · {entry.play}
          </p>
        </div>

        <div className="space-y-6">
          {/* TL;DR */}
          <section className="rounded-xl bg-muted/40 border border-border/60 p-4 md:p-5">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              In plain English
            </div>
            <p className="text-base leading-relaxed">{tldr}</p>
          </section>

          {/* Outcome */}
          <section className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-4 md:p-5">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2">
              The outcome (vs the prospect's existing setup)
            </div>
            <div className="text-base text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
              {entry.headline}
            </div>
          </section>

          {/* Metadata grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Who they were
              </div>
              <div className="text-sm text-foreground">{entry.prospect}</div>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Play used
              </div>
              <div className="text-sm text-foreground">{entry.play}</div>
            </div>
            <div className="rounded-xl border bg-card p-4 sm:col-span-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                The deal shape (ticket size × duration)
              </div>
              <div className="text-sm text-foreground">{entry.anchor}</div>
            </div>
          </section>

          {/* The case study — long-form narrative for the reader */}
          {narrative && (
            <section className="rounded-2xl border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-4 md:px-5 py-3 border-b bg-muted/30">
                <BookOpen className="h-4 w-4 text-primary shrink-0" />
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  The case study — for the FC walking into one like this
                </div>
              </div>
              <article className="px-4 md:px-6 py-5 md:py-6 max-w-none case-narrative">
                <ReactMarkdown
                  remarkPlugins={NARRATIVE_REMARK_PLUGINS}
                  components={markdownComponents}
                >
                  {narrative}
                </ReactMarkdown>
              </article>
            </section>
          )}

          {/* Field receipt screenshot */}
          {entry.screenshot && (
            <section>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Field receipt (real screenshot from the case)
              </div>
              <img
                src={entry.screenshot}
                alt={`${entry.title} — field receipt`}
                loading="lazy"
                className="w-full rounded-xl border bg-muted/20"
              />
            </section>
          )}

          {/* Reference photos from the Telegram case-study chat */}
          <section>
            <CaseReferencePhotos caseId={entry.id} />
          </section>

          {/* Drawings used */}
          {entry.drawings.length > 0 && (
            <section>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" />
                Drawings used in this close — click to drill the concept card
              </div>
              <div className="flex flex-wrap gap-2">
                {entry.drawings.map((d) => (
                  <Link
                    key={d}
                    to={`/concept-cards?q=${encodeURIComponent(d)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium border border-primary/20 transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {d}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {entry.tags.length > 0 && (
            <section>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Tags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {entry.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {/* CTAs */}
          <section className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-2 border-t">
            <Button variant="outline" asChild className="gap-1.5">
              <Link to="/concept-cards">
                <Pencil className="h-4 w-4" />
                Open Concept Cards
              </Link>
            </Button>
            <Button asChild className="gap-1.5">
              <Link to={entry.sourcePath}>
                Read the full case
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </section>

          {/* Related cases */}
          {related.length > 0 && (
            <section className="pt-4">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Related cases
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {related.map((r) => (
                  <RelatedCaseCard key={r.id} entry={r} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
