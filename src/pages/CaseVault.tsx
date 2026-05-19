import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { ScriptsHubHeaderTabs } from "@/components/scripts/ScriptsTabBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ImageIcon, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CASES,
  CASE_PRODUCTS,
  ALL_CASE_PLAYS,
  type CaseEntry,
  type CaseProduct,
} from "@/data/caseVault";
import { REAL_CASES } from "@/data/caseVaultReal";

// Curated training cases + real-appointment cases derived from Fireflies notes.
const ALL_CASES: CaseEntry[] = [...CASES, ...REAL_CASES];

const PRODUCT_FILTER_OPTIONS: ("All" | CaseProduct)[] = [
  "All",
  ...(Object.keys(CASE_PRODUCTS) as CaseProduct[]),
];

const PLAY_FILTER_OPTIONS = ["All", ...ALL_CASE_PLAYS];

// ─── Case Card ──────────────────────────────────────────────────────────
function CaseCard({ entry }: { entry: CaseEntry }) {
  return (
    <Link
      to={`/case-vault/${entry.id}`}
      className="group text-left rounded-2xl border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary block"
    >
      {/* Header strip */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b bg-muted/30">
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

      {/* Body */}
      <div className="p-4 flex flex-col gap-2.5">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2">
          {entry.title}
        </h3>

        <div className="text-xs text-muted-foreground space-y-1">
          <div>
            <span className="font-medium text-foreground/80">Prospect:</span>{" "}
            {entry.prospect}
          </div>
          <div>
            <span className="font-medium text-foreground/80">Anchor:</span>{" "}
            {entry.anchor}
          </div>
        </div>

        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 px-2.5 py-1.5">
          <div className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-0.5">
            Receipt
          </div>
          <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-snug">
            {entry.headline}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 pt-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {entry.play.split("—")[0].trim()}
          </Badge>
          {entry.tags.slice(0, 2).map((t) => (
            <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0">
              {t}
            </Badge>
          ))}
        </div>

        {/* Drawings count */}
        {entry.drawings.length > 0 && (
          <div className="text-[10px] text-muted-foreground pt-0.5 flex items-center gap-1">
            <ImageIcon className="h-3 w-3" />
            {entry.drawings.length} drawing
            {entry.drawings.length > 1 ? "s" : ""} used
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────
export default function CaseVaultPage() {
  const [search, setSearch] = useState("");
  const [filterProduct, setFilterProduct] = useState<string>("All");
  const [filterPlay, setFilterPlay] = useState<string>("All");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Backward-compat: legacy deep-links used `?case=<id>` to open the case in
  // a modal. Now that each case is a real page, redirect those URLs to the
  // canonical /case-vault/:caseId route so old links still work.
  useEffect(() => {
    const caseId = searchParams.get("case");
    if (!caseId) return;
    const entry = ALL_CASES.find((c) => c.id === caseId);
    if (entry) {
      navigate(`/case-vault/${entry.id}`, { replace: true });
    }
  }, [searchParams, navigate]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_CASES.filter((c) => {
      if (filterProduct !== "All" && c.product !== filterProduct) return false;
      if (filterPlay !== "All" && c.play !== filterPlay) return false;
      if (!q) return true;
      const hay = `${c.code} ${c.title} ${c.prospect} ${c.anchor} ${c.headline} ${c.tags.join(" ")} ${c.drawings.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [search, filterProduct, filterPlay]);

  const productCounts = useMemo(() => {
    const counts: Record<string, number> = { All: ALL_CASES.length };
    for (const c of ALL_CASES) {
      counts[c.product] = (counts[c.product] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <PageLayout
      title="Case Vault — FINternship"
      description="31 real-prospect case studies across 7 AIA products — receipts, anchors, and the drawings that closed them."
    >
      <BrandedPageHeader
        tone="dark"
        showOnMobile
        title="Case Vault"
        subtitle="Real-prospect receipts across all 7 AIA products. Filter by product or play, click any card to open the full case page."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Case Vault" }]}
        headerTabs={<ScriptsHubHeaderTabs />}
      />

      <div className="mx-auto px-3 md:px-6 py-3 md:py-8 max-w-6xl overflow-x-hidden">
        {/* Toolbar */}
        <div className="flex flex-col gap-2 mb-5">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by prospect, product, headline, drawing used..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={filterProduct} onValueChange={setFilterProduct}>
              <SelectTrigger className="w-[150px] sm:w-44 text-xs h-9">
                <span className="text-muted-foreground mr-1">Product:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_FILTER_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p === "All" ? "All products" : CASE_PRODUCTS[p].label} (
                    {productCounts[p] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPlay} onValueChange={setFilterPlay}>
              <SelectTrigger className="w-[170px] sm:w-56 text-xs h-9">
                <span className="text-muted-foreground mr-1">Play:</span>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAY_FILTER_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p === "All" ? "All plays" : p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(search || filterProduct !== "All" || filterPlay !== "All") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9"
                onClick={() => {
                  setSearch("");
                  setFilterProduct("All");
                  setFilterPlay("All");
                }}
              >
                Clear
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Showing {filtered.length} of {ALL_CASES.length} cases
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              No cases match the current filters.
            </p>
          </div>
        ) : (
          <div
            className={cn(
              "grid gap-3 md:gap-4",
              "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {filtered.map((entry) => (
              <CaseCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
