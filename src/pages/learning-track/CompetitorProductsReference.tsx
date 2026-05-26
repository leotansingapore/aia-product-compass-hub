import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, BookOpen, Brain, ChevronDown, ChevronRight, Loader2, RotateCcw, Search, X } from "lucide-react";

// Load competitor-products markdown via Vite glob ?raw (same pattern as assignments.ts).
const rawLoaders = import.meta.glob<string>(
  "/docs/competitor-products-singapore.md",
  { query: "?raw", import: "default" },
);
const loadRaw = Object.values(rawLoaders)[0] as (() => Promise<string>) | undefined;

// ============ TYPES ============

type CategoryId = "life" | "endowment" | "medical" | "investment-linked" | "closed";

interface Product {
  name: string;
  description: string;
  subgroup?: string;
}

interface InsurerCategory {
  id: CategoryId;
  label: string;
  products: Product[];
  notes: string[]; // paragraph text not attached to a specific product
}

interface Insurer {
  id: string;
  name: string;
  brandNote?: string;
  categories: InsurerCategory[];
}

interface ParsedDoc {
  preface: string;        // everything before the first "## " insurer section
  insurers: Insurer[];
  appendix: string;       // everything after the last insurer section
}

const CATEGORY_LABELS: Record<CategoryId, string> = {
  life: "Life",
  endowment: "Endowment",
  medical: "Medical",
  "investment-linked": "Investment-linked",
  closed: "Closed / superseded",
};

const CATEGORY_COLOURS: Record<CategoryId, string> = {
  life: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30",
  endowment: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
  medical: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
  "investment-linked": "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30",
  closed: "bg-muted text-muted-foreground border-muted-foreground/30",
};

const INSURER_COLOURS: Record<string, string> = {
  aia: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30",
  "great-eastern": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  prudential: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30",
  singlife: "bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/30",
  "income-insurance": "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
  manulife: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30",
  "hsbc-life": "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
  "raffles-health-insurance": "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-500/30",
};

// ============ PARSER ============

function stripFrontmatter(raw: string): string {
  const match = raw.match(/^---\s*\n[\s\S]*?\n---\s*\n?/);
  return match ? raw.slice(match[0].length) : raw;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function categoryIdFromHeading(heading: string): CategoryId | null {
  const t = heading.trim().toLowerCase();
  if (t.startsWith("life")) return "life";
  if (t.startsWith("endowment")) return "endowment";
  if (t.startsWith("medical")) return "medical";
  if (t.startsWith("investment-linked") || t.startsWith("investment linked")) return "investment-linked";
  if (t.startsWith("closed")) return "closed";
  return null;
}

// Insurer headings to extract. Anything not in this list at "## " level stays in
// preface/appendix prose.
const INSURER_NAMES = [
  "AIA Singapore",
  "Great Eastern",
  "Prudential Singapore",
  "Singlife",
  "Income Insurance",
  "Manulife Singapore",
  "HSBC Life",
  "Raffles Health Insurance",
];

function isInsurerHeading(heading: string): boolean {
  const h = heading.trim();
  return INSURER_NAMES.some(
    (n) => h === n || h.toLowerCase().startsWith(n.toLowerCase()),
  );
}

function parseProductLine(line: string): Product | null {
  // Match: `- **Name** — description.` or `- **Name** ... — description.`
  // Also tolerate alternative dashes and parenthetical fragments in the name.
  const m = line.match(/^[-*]\s+\*\*([^*]+)\*\*\s*(?:\(([^)]+)\))?\s*(?:[—\-–]\s*(.+))?$/);
  if (!m) return null;
  const name = m[1].trim();
  const paren = m[2]?.trim();
  const description = (m[3] ?? "").trim();
  const fullDesc = paren ? `${paren ? `(${paren}) ` : ""}${description}` : description;
  return { name, description: fullDesc };
}

function parseDoc(raw: string): ParsedDoc {
  const body = stripFrontmatter(raw);
  const lines = body.split("\n");

  let preface = "";
  let appendix = "";
  const insurers: Insurer[] = [];

  let mode: "preface" | "insurer" | "appendix" = "preface";
  let currentInsurer: Insurer | null = null;
  let currentCategory: InsurerCategory | null = null;
  let currentSubgroup: string | undefined = undefined;
  const prefaceLines: string[] = [];
  const appendixLines: string[] = [];

  const horizontalRule = /^---+\s*$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h2Match = line.match(/^##\s+(.+?)\s*$/);
    const h3Match = line.match(/^###\s+(.+?)\s*$/);
    const subgroupMatch = line.match(/^\*\*([^*]+)\*\*\s*$/);
    const productMaybe = parseProductLine(line.trim());

    if (h2Match) {
      const heading = h2Match[1].trim();
      if (isInsurerHeading(heading)) {
        // Start a new insurer section. Exit preface mode.
        if (mode === "preface") mode = "insurer";
        if (currentInsurer) insurers.push(currentInsurer);
        currentInsurer = {
          id: slugify(heading),
          name: heading,
          categories: [],
        };
        currentCategory = null;
        currentSubgroup = undefined;
        continue;
      }
      // Non-insurer ## heading after we've started insurer mode → enter appendix.
      if (mode === "insurer") {
        if (currentInsurer) {
          insurers.push(currentInsurer);
          currentInsurer = null;
        }
        mode = "appendix";
        appendixLines.push(line);
        continue;
      }
      // Otherwise (still in preface), just add to preface.
      prefaceLines.push(line);
      continue;
    }

    if (mode === "insurer" && currentInsurer && h3Match) {
      const cid = categoryIdFromHeading(h3Match[1]);
      if (cid) {
        currentCategory = { id: cid, label: CATEGORY_LABELS[cid], products: [], notes: [] };
        currentInsurer.categories.push(currentCategory);
        currentSubgroup = undefined;
        continue;
      }
    }

    if (mode === "insurer" && currentInsurer) {
      // Pre-category: capture lines before the first ### heading as brand note.
      if (!currentCategory) {
        const trimmed = line.trim();
        if (!trimmed || horizontalRule.test(trimmed)) continue;
        // Strip leading bold prefix (e.g. "**Brand note:**" or "**Important flag — no IP.**")
        const stripped = trimmed.replace(/^\*\*[^*]+\*\*\s*/, "").trim();
        const segment = stripped || trimmed.replace(/^\*\*|\*\*$/g, "");
        currentInsurer.brandNote = ((currentInsurer.brandNote ?? "") + " " + segment).trim();
        continue;
      }
      if (subgroupMatch && !productMaybe) {
        currentSubgroup = subgroupMatch[1].trim();
        continue;
      }
      if (productMaybe) {
        currentProductPush(currentCategory, currentSubgroup, productMaybe);
        continue;
      }
      // Free paragraphs inside a category — keep as notes.
      const trimmed = line.trim();
      if (trimmed && !horizontalRule.test(trimmed)) {
        currentCategory.notes.push(trimmed);
      }
      continue;
    }

    // Bucket non-insurer lines into preface or appendix.
    if (mode === "preface") prefaceLines.push(line);
    else if (mode === "appendix") appendixLines.push(line);
  }

  if (currentInsurer) insurers.push(currentInsurer);

  preface = prefaceLines.join("\n").trim();
  appendix = appendixLines.join("\n").trim();
  return { preface, insurers, appendix };
}

function currentProductPush(
  category: InsurerCategory,
  subgroup: string | undefined,
  product: Product,
) {
  category.products.push({ ...product, subgroup });
}

function productMatchesSearch(p: Product, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    p.name.toLowerCase().includes(needle) ||
    (p.description?.toLowerCase().includes(needle) ?? false) ||
    (p.subgroup?.toLowerCase().includes(needle) ?? false)
  );
}

// ============ FLASHCARDS ============

interface FlashcardEntry {
  product: Product;
  insurer: { id: string; name: string };
  category: CategoryId;
}

type QuizMode = "category" | "insurer";

function buildFlashcardDeck(insurers: Insurer[]): FlashcardEntry[] {
  const deck: FlashcardEntry[] = [];
  for (const ins of insurers) {
    for (const cat of ins.categories) {
      if (cat.id === "closed") continue;
      for (const p of cat.products) {
        deck.push({
          product: p,
          insurer: { id: ins.id, name: ins.name },
          category: cat.id,
        });
      }
    }
  }
  return deck;
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface FlashcardsViewProps {
  insurers: Insurer[];
}

function FlashcardsView({ insurers }: FlashcardsViewProps) {
  const deck = useMemo(() => buildFlashcardDeck(insurers), [insurers]);
  const [order, setOrder] = useState<number[]>(() => shuffle(deck.map((_, i) => i)));
  const [position, setPosition] = useState(0);
  const [mode, setMode] = useState<QuizMode>("category");
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  // Reset position + stats when mode changes or deck size changes.
  useEffect(() => {
    setOrder(shuffle(deck.map((_, i) => i)));
    setPosition(0);
    setRevealed(false);
    setPicked(null);
    setStats({ correct: 0, total: 0 });
  }, [mode, deck.length]);

  const card = deck[order[position]];

  const handlePick = useCallback(
    (choice: string) => {
      if (revealed || !card) return;
      const correct = mode === "category" ? choice === card.category : choice === card.insurer.id;
      setPicked(choice);
      setRevealed(true);
      setStats((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    },
    [card, mode, revealed],
  );

  const next = useCallback(() => {
    setRevealed(false);
    setPicked(null);
    setPosition((p) => {
      if (p + 1 >= order.length) {
        // Reshuffle on wraparound for an endless deck.
        setOrder(shuffle(deck.map((_, i) => i)));
        return 0;
      }
      return p + 1;
    });
  }, [order.length, deck]);

  const resetDeck = useCallback(() => {
    setOrder(shuffle(deck.map((_, i) => i)));
    setPosition(0);
    setRevealed(false);
    setPicked(null);
    setStats({ correct: 0, total: 0 });
  }, [deck]);

  if (!card || deck.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No products available to quiz on.
      </div>
    );
  }

  const accuracy =
    stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

  const categoryChoices: CategoryId[] = ["life", "endowment", "medical", "investment-linked"];
  const insurerChoices = insurers.map((i) => ({ id: i.id, name: i.name }));

  return (
    <div className="space-y-4">
      {/* Mode + stats bar */}
      <div className="rounded-lg border bg-card p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <Brain className="h-4 w-4 text-primary" />
          <span className="font-medium">Quiz mode</span>
          <div className="ml-2 flex rounded border overflow-hidden text-xs">
            <button
              onClick={() => setMode("category")}
              className={`px-3 py-1 ${
                mode === "category" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              Guess category
            </button>
            <button
              onClick={() => setMode("insurer")}
              className={`px-3 py-1 border-l ${
                mode === "insurer" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              Guess insurer
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            Card {position + 1} of {order.length}
          </span>
          <span>
            Score: <span className="font-semibold text-foreground">{stats.correct}</span>
            {" / "}
            {stats.total}
            {stats.total > 0 && <span className="ml-1">({accuracy}%)</span>}
          </span>
          <button onClick={resetDeck} className="inline-flex items-center gap-1 hover:text-foreground">
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="rounded-xl border-2 bg-card p-6 sm:p-8 shadow-sm space-y-5 min-h-[280px]">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {mode === "category"
              ? "What category is this policy?"
              : "Which insurer sells this policy?"}
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold leading-tight">
            {card.product.name}
          </h2>
          {mode === "category" && (
            <div className="text-sm text-muted-foreground">
              Sold by{" "}
              <span
                className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${
                  INSURER_COLOURS[card.insurer.id] ?? "bg-muted text-foreground border-muted-foreground/30"
                }`}
              >
                {card.insurer.name}
              </span>
            </div>
          )}
          {card.product.subgroup && revealed && (
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Subgroup: {card.product.subgroup}
            </div>
          )}
          {revealed && card.product.description && (
            <p className="text-sm text-muted-foreground pt-3 border-t mt-3 leading-relaxed">
              {card.product.description}
            </p>
          )}
        </div>

        {/* Choices */}
        {mode === "category" ? (
          <div className="grid grid-cols-2 gap-2">
            {categoryChoices.map((cid) => {
              const isPicked = picked === cid;
              const isCorrect = cid === card.category;
              let cls = "border-border hover:bg-muted";
              if (revealed) {
                if (isCorrect) cls = "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-300";
                else if (isPicked) cls = "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300";
                else cls = "border-border opacity-60";
              }
              return (
                <button
                  key={cid}
                  onClick={() => handlePick(cid)}
                  disabled={revealed}
                  className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors text-left ${cls}`}
                >
                  {CATEGORY_LABELS[cid]}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {insurerChoices.map((ins) => {
              const isPicked = picked === ins.id;
              const isCorrect = ins.id === card.insurer.id;
              let cls = "border-border hover:bg-muted";
              if (revealed) {
                if (isCorrect) cls = "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-300";
                else if (isPicked) cls = "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300";
                else cls = "border-border opacity-60";
              }
              return (
                <button
                  key={ins.id}
                  onClick={() => handlePick(ins.id)}
                  disabled={revealed}
                  className={`rounded-lg border-2 px-3 py-2 text-xs font-medium transition-colors text-left ${cls}`}
                >
                  {ins.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Reveal / Next */}
        <div className="flex items-center justify-between gap-2 pt-2">
          {!revealed ? (
            <button
              onClick={() => {
                setRevealed(true);
                setStats((s) => ({ ...s, total: s.total + 1 }));
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Reveal answer (skip without scoring)
            </button>
          ) : (
            <div className="text-xs">
              {picked && (picked === (mode === "category" ? card.category : card.insurer.id)) ? (
                <span className="text-green-700 dark:text-green-300 font-medium">Correct.</span>
              ) : picked ? (
                <span className="text-red-700 dark:text-red-300 font-medium">
                  Answer: {mode === "category" ? CATEGORY_LABELS[card.category] : card.insurer.name}.
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Answer: {mode === "category" ? CATEGORY_LABELS[card.category] : card.insurer.name}.
                </span>
              )}
            </div>
          )}
          <button
            onClick={next}
            className="ml-auto inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Next card <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Deck draws from {deck.length} active products across {insurers.length} insurers. Closed-to-new-business plans are excluded.
      </p>
    </div>
  );
}

// ============ COMPONENT ============

type ViewMode = "browse" | "flashcards";

export default function CompetitorProductsReference() {
  const [raw, setRaw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("browse");
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryId>>(
    new Set(),
  );
  const [selectedInsurers, setSelectedInsurers] = useState<Set<string>>(new Set());
  const [collapsedInsurers, setCollapsedInsurers] = useState<Set<string>>(new Set());

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

  const parsed = useMemo(() => (raw ? parseDoc(raw) : null), [raw]);

  // Apply filters: search filters products, category filter hides whole categories,
  // insurer filter hides whole insurer sections.
  const visibleInsurers = useMemo(() => {
    if (!parsed) return [];
    return parsed.insurers
      .filter((ins) => selectedInsurers.size === 0 || selectedInsurers.has(ins.id))
      .map((ins) => ({
        ...ins,
        categories: ins.categories
          .filter(
            (c) =>
              c.id !== "closed" &&
              (selectedCategories.size === 0 || selectedCategories.has(c.id)),
          )
          .map((c) => ({
            ...c,
            products: c.products.filter((p) => productMatchesSearch(p, search)),
          }))
          .filter((c) => c.products.length > 0 || !search),
      }))
      .filter((ins) => ins.categories.some((c) => c.products.length > 0) || !search);
  }, [parsed, search, selectedCategories, selectedInsurers]);

  const totalVisibleProducts = useMemo(
    () =>
      visibleInsurers.reduce(
        (sum, ins) => sum + ins.categories.reduce((s, c) => s + c.products.length, 0),
        0,
      ),
    [visibleInsurers],
  );

  const toggleSet = <T,>(setter: React.Dispatch<React.SetStateAction<Set<T>>>, value: T) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories(new Set());
    setSelectedInsurers(new Set());
  };

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!parsed) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const anyFilter = search.length > 0 || selectedCategories.size > 0 || selectedInsurers.size > 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto" data-testid="competitor-products-reference">
      <div>
        <Link
          to="/learning-track/resources"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Resources
        </Link>
      </div>

      <header className="space-y-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          <BookOpen className="h-3 w-3" /> Reference
        </div>
        <h1 className="text-2xl font-semibold">Singapore Competitor Product Inventory</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Current retail life and health policies sold by the major insurers in Singapore.
          Browse to look up a name, or switch to flashcards to drill yourself on which insurer
          sells what.
        </p>
        <div className="flex rounded-lg border overflow-hidden w-fit text-sm">
          <button
            onClick={() => setView("browse")}
            className={`px-4 py-1.5 inline-flex items-center gap-1.5 ${
              view === "browse"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" /> Browse
          </button>
          <button
            onClick={() => setView("flashcards")}
            className={`px-4 py-1.5 inline-flex items-center gap-1.5 border-l ${
              view === "flashcards"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
          >
            <Brain className="h-3.5 w-3.5" /> Flashcards
          </button>
        </div>
      </header>

      {view === "flashcards" && <FlashcardsView insurers={parsed.insurers} />}

      {view === "browse" && (
      <>
      {/* Preface (intro, brand-prefix lookup, IP carrier list, etc.) */}
      <details className="rounded-lg border bg-muted/30">
        <summary className="cursor-pointer list-none p-4 flex items-center justify-between gap-2 hover:bg-muted/50 transition-colors">
          <span className="font-semibold text-sm">How to use this document · brand-prefix lookup · IP and CareShield carrier lists</span>
          <ChevronDown className="h-4 w-4 transition-transform [details[open]_&]:rotate-180" />
        </summary>
        <div className="px-4 pb-4 prose prose-sm max-w-none dark:prose-invert prose-headings:mt-4 prose-table:text-xs">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.preface}</ReactMarkdown>
        </div>
      </details>

      {/* Sticky filter bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name or description... (e.g. 'PRUShield', 'multipay', 'mortgage')"
              className="w-full rounded border bg-background py-2 pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label="Search competitor products"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {anyFilter && (
            <button
              onClick={clearFilters}
              className="text-xs text-muted-foreground hover:text-foreground self-center px-2"
            >
              Clear filters ({totalVisibleProducts} shown)
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground self-center mr-1">Category:</span>
          {(["life", "endowment", "medical", "investment-linked"] as CategoryId[]).map((cid) => {
            const active = selectedCategories.has(cid);
            return (
              <button
                key={cid}
                onClick={() => toggleSet(setSelectedCategories, cid)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  active ? CATEGORY_COLOURS[cid] + " font-medium" : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                {CATEGORY_LABELS[cid]}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground self-center mr-1">Insurer:</span>
          {parsed.insurers.map((ins) => {
            const active = selectedInsurers.has(ins.id);
            return (
              <button
                key={ins.id}
                onClick={() => toggleSet(setSelectedInsurers, ins.id)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  active
                    ? (INSURER_COLOURS[ins.id] ?? "bg-primary/10 text-primary border-primary/30") + " font-medium"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                {ins.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtered insurer/category cards */}
      <div className="space-y-6">
        {visibleInsurers.length === 0 && (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <Search className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              No products match the current filters.
            </p>
            <button onClick={clearFilters} className="mt-2 text-xs text-primary hover:underline">
              Clear filters
            </button>
          </div>
        )}

        {visibleInsurers.map((ins) => {
          const collapsed = collapsedInsurers.has(ins.id);
          const insurerColour = INSURER_COLOURS[ins.id] ?? "bg-muted text-foreground border-muted-foreground/30";
          return (
            <section
              key={ins.id}
              id={ins.id}
              className="rounded-lg border bg-card overflow-hidden scroll-mt-32"
            >
              <button
                onClick={() => toggleSet(setCollapsedInsurers, ins.id)}
                className="w-full flex items-center justify-between gap-2 p-4 hover:bg-muted/30 transition-colors text-left"
                aria-expanded={!collapsed}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${insurerColour}`}>
                    {ins.name}
                  </span>
                  {ins.brandNote && (
                    <p className="text-xs text-muted-foreground line-clamp-1 italic">
                      {ins.brandNote}
                    </p>
                  )}
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${
                    collapsed ? "" : "rotate-180"
                  }`}
                />
              </button>

              {!collapsed && (
                <div className="border-t bg-background">
                  {ins.brandNote && (
                    <div className="p-4 border-b bg-amber-500/5 text-xs text-muted-foreground italic">
                      <span className="font-semibold text-amber-700 dark:text-amber-300 not-italic">Brand note: </span>
                      {ins.brandNote}
                    </div>
                  )}
                  <div className="divide-y">
                    {ins.categories.length === 0 && (
                      <div className="p-4 text-sm text-muted-foreground">No products match filters in this insurer.</div>
                    )}
                    {ins.categories.map((cat) => (
                      <div key={cat.id} className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CATEGORY_COLOURS[cat.id]}`}>
                            {cat.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {cat.products.length} product{cat.products.length === 1 ? "" : "s"}
                          </span>
                        </div>
                        {cat.notes.length > 0 && (
                          <div className="text-xs text-muted-foreground prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {cat.notes.join("\n")}
                            </ReactMarkdown>
                          </div>
                        )}
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {cat.products.map((p, i) => (
                            <div
                              key={`${ins.id}-${cat.id}-${i}-${p.name}`}
                              className="rounded border bg-card p-3 hover:shadow-sm transition-shadow"
                            >
                              <div className="font-medium text-sm">{p.name}</div>
                              {p.subgroup && (
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground/70 mt-0.5">
                                  {p.subgroup}
                                </div>
                              )}
                              {p.description && (
                                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                  {p.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Appendix: cross-insurer cheatsheet, troubleshooting, FC notes */}
      {parsed.appendix && (
        <div className="rounded-lg border bg-muted/20 p-4 prose prose-sm md:prose-base max-w-none dark:prose-invert prose-headings:scroll-mt-32">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.appendix}</ReactMarkdown>
        </div>
      )}
      </>
      )}
    </div>
  );
}
