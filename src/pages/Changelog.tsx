import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Bot,
  Search,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/fetchAllRows";

interface ChangelogEntry {
  id: string;
  entry_date: string;
  type: "new" | "improved" | "fixed";
  title: string;
  description: string;
  category: "Platform" | "AI" | "Scripts" | "Admin" | "Videos" | "New Page";
  link_to: string | null;
  source: "manual" | "ai_generated";
  is_published: boolean;
  created_at: string;
}

const changeTypeConfig: Record<string, { label: string; className: string }> = {
  new: { label: "New", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
  improved: { label: "Improved", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  fixed: { label: "Fixed", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
};

const categoryConfig: Record<string, { label: string; className: string }> = {
  Platform: { label: "Platform", className: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400" },
  AI: { label: "AI", className: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400" },
  Scripts: { label: "Scripts", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  Admin: { label: "Admin", className: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400" },
  Videos: { label: "Videos", className: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400" },
  "New Page": { label: "New Page", className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400" },
};

const ALL_CATEGORIES = ["All", "New Page", "Platform", "AI", "Scripts", "Videos", "Admin"] as const;

function useChangelogEntries() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      // Paged rather than a load-more control: the page groups every entry by
      // month and the counts have to be right, so a partial list would be
      // wrong rather than merely short. PostgREST caps a plain select at 1000
      // rows, which the changelog will pass as AI entries accumulate weekly.
      // `id` is the tiebreaker so pages can't overlap on a shared date.
      const data = await fetchAllRows<ChangelogEntry>((from, to) =>
        supabase
          .from("changelog_entries")
          .select("*")
          .eq("is_published", true)
          .order("entry_date", { ascending: false })
          .order("created_at", { ascending: false })
          .order("id", { ascending: true })
          .range(from, to),
      );
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load changelog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEntries(); }, []);

  // Group by month label
  const grouped = entries.reduce<{ month: string; changes: ChangelogEntry[] }[]>((acc, entry) => {
    const d = new Date(entry.entry_date);
    const month = d.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const existing = acc.find((g) => g.month === month);
    if (existing) existing.changes.push(entry);
    else acc.push({ month, changes: [entry] });
    return acc;
  }, []);

  return { entries, grouped, loading, error, refetch: fetchEntries };
}

function ChangeCard({ change }: { change: ChangelogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const typeCfg = changeTypeConfig[change.type] ?? changeTypeConfig.new;
  const catCfg = categoryConfig[change.category];
  const hasLink = !!change.link_to;
  const isAI = change.source === "ai_generated";

  const dateLabel = new Date(change.entry_date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  return (
    <div className="group relative flex gap-4 rounded-xl border bg-card p-4 sm:p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-200">
      {/* Icon */}
      <div className="shrink-0 mt-0.5">
        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span className="text-xs text-muted-foreground">{dateLabel}</span>
          <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 font-medium ${typeCfg.className}`}>
            {typeCfg.label}
          </Badge>
          {catCfg && (
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-medium border-0 ${catCfg.className}`}>
              {catCfg.label}
            </Badge>
          )}
          {isAI && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted px-1.5 py-0 rounded-full">
              <Bot className="h-2.5 w-2.5" /> AI
            </span>
          )}
        </div>

        <h3 className="font-semibold text-sm text-foreground mb-1">{change.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{change.description}</p>

        {/* Action row */}
        {hasLink && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs px-2 gap-1"
              onClick={() => navigate(change.link_to!)}
            >
              <ExternalLink className="h-3 w-3" />
              Open
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Changelog() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const { grouped, loading, error, refetch } = useChangelogEntries();

  // Category tabs alone can't answer the question people actually bring here —
  // "did they change anything about HealthShield?" — across ~50 entries spread
  // over 15 phone screens. Match the words in the entry, not just its bucket.
  const filteredGroups = grouped
    .map((group) => {
      const q = query.trim().toLowerCase();
      return {
        ...group,
        changes: group.changes.filter((c) => {
          if (activeCategory !== "All" && c.category !== activeCategory) return false;
          if (!q) return true;
          return (
            c.title.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q)
          );
        }),
      };
    })
    .filter((group) => group.changes.length > 0);

  const totalCount = filteredGroups.reduce((s, g) => s + g.changes.length, 0);
  const isFiltering = query.trim().length > 0 || activeCategory !== "All";

  return (
    <>
      <Helmet>
        <title>Changelog · FINternship</title>
        <meta name="description" content="See what's new in FINternship — new pages, features, and improvements." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Changelog</h1>
                <p className="text-sm text-muted-foreground">What's new in FINternship — updated automatically</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
              All meaningful changes to the platform — new pages, features, videos, and improvements. AI-generated weekly entries are marked with a 🤖 badge.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={refetch} className="shrink-0 gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {/* Search, pinned below the app header (57px mobile, 48px from md up).
            A direct child of the tall page container — a sticky element only
            sticks while its own parent is in view. */}
        <div className="sticky top-[57px] md:top-12 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-background mb-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the changelog — a product, a page, a feature"
              aria-label="Search changelog entries"
              className="pl-10 pr-10"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {ALL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
          {isFiltering && (
            <span className="text-xs text-muted-foreground self-center ml-1">
              {totalCount} {totalCount === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-sm text-destructive mb-3">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch}>Try again</Button>
          </div>
        ) : filteredGroups.length > 0 ? (
          <div className="space-y-10">
            {filteredGroups.map((group) => (
              <div key={group.month}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-base font-semibold text-foreground">{group.month}</h2>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {group.changes.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {group.changes.map((change) => (
                    <ChangeCard key={change.id} change={change} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            {/* Name the filter that actually emptied the list. This used to say
                "No entries in this category yet" and only reset the category —
                which reads as a lie, and fixes nothing, when the miss came from
                the search box. */}
            <p className="text-sm text-muted-foreground">
              {query.trim()
                ? `Nothing in the changelog matches “${query.trim()}”${activeCategory !== "All" ? ` in ${activeCategory}` : ""}.`
                : "No entries in this category yet."}
            </p>
            <button
              onClick={() => {
                setQuery("");
                setActiveCategory("All");
              }}
              className="text-xs mt-2 text-primary hover:underline"
            >
              Show all changes
            </button>
          </div>
        )}
      </div>
    </>
  );
}
