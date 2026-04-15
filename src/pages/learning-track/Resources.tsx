import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Search } from "lucide-react";
import { buildResourceIndex, type IndexedResource, type ResourceKind } from "@/lib/learning-track/resourceIndex";

const KIND_LABELS: Record<ResourceKind | "all", string> = {
  all: "All",
  product: "Products",
  obsidian_doc: "Reference docs",
  script: "Scripts",
  concept_card: "Concept cards",
  video: "Videos",
  kb: "Knowledge base",
  notebooklm: "NotebookLM",
};

export default function Resources() {
  const [index, setIndex] = useState<IndexedResource[] | null>(null);
  const [filter, setFilter] = useState<ResourceKind | "all">("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    buildResourceIndex().then((r) => {
      if (!cancelled) setIndex(r);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!index) return [];
    return index
      .filter((r) => filter === "all" || r.kind === filter)
      .filter((r) =>
        !search ? true : r.title.toLowerCase().includes(search.toLowerCase())
      );
  }, [index, filter, search]);

  if (index === null) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="resources-page">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full rounded border bg-background py-2 pl-8 pr-2 text-sm"
            aria-label="Search resources"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as ResourceKind | "all")}
          className="rounded border bg-background p-2 text-sm"
          aria-label="Filter by resource type"
        >
          {Object.entries(KIND_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Search className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">No resources match your search.</p>
          {search && (
            <button onClick={() => setSearch("")} className="mt-2 text-xs text-primary hover:underline">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => {
            const isExternal = r.href.startsWith("http");
            const inner = (
              <>
                <div className="text-xs uppercase text-muted-foreground">
                  {KIND_LABELS[r.kind]}
                </div>
                <div className="font-medium">{r.title}</div>
              </>
            );
            return isExternal ? (
              <a
                key={r.id}
                href={r.href}
                target="_blank"
                rel="noreferrer"
                className="rounded border bg-card p-3 hover:bg-muted"
              >
                {inner}
              </a>
            ) : (
              <Link
                key={r.id}
                to={r.href}
                className="rounded border bg-card p-3 hover:bg-muted"
              >
                {inner}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
