import { useMemo, useState } from "react";
import { Loader2, ChevronDown, ChevronRight, ArrowUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAdminStudyProgress } from "@/hooks/useAdminStudyProgress";
import { PRODUCT_LABELS } from "@/types/questionBank";

type SortKey = "name" | "mastery" | "mastered" | "lastStudied";

function daysSince(iso: string | null): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - then) / 86_400_000);
}

function staleLabel(iso: string | null): string {
  if (!iso) return "never";
  const d = daysSince(iso);
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  return `${d} days ago`;
}

export default function AdminQuestionBanks() {
  const { stats, loading, error } = useAdminStudyProgress();
  const isMobile = useIsMobile();
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("mastery");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const base = q
      ? stats.filter(
          (l) =>
            (l.display_name ?? "").toLowerCase().includes(q) ||
            (l.email ?? "").toLowerCase().includes(q),
        )
      : stats.slice();
    base.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") {
        return (a.display_name ?? "").localeCompare(b.display_name ?? "") * dir;
      }
      if (sortKey === "mastered") {
        return (a.total_mastered - b.total_mastered) * dir;
      }
      if (sortKey === "lastStudied") {
        const at = a.last_studied ? new Date(a.last_studied).getTime() : 0;
        const bt = b.last_studied ? new Date(b.last_studied).getTime() : 0;
        return (at - bt) * dir;
      }
      return (a.mastery_pct - b.mastery_pct) * dir;
    });
    return base;
  }, [stats, filter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const toggleExpand = (userId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          Failed to load question bank progress: {error}
        </CardContent>
      </Card>
    );
  }

  const activeLearners = stats.filter((l) => l.has_studied);

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Mastery %</span> = questions the
          learner has marked mastered, as a fraction of the banks they've actually
          touched (so it's not diluted by product banks they haven't started).{" "}
          {activeLearners.length} of {stats.length} learners have started studying.
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="Filter by name or email…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        {isMobile && (
          <Select
            value={`${sortKey}:${sortDir}`}
            onValueChange={(v) => {
              const [k, d] = v.split(":") as [SortKey, "asc" | "desc"];
              setSortKey(k);
              setSortDir(d);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mastery:desc">Mastery % (highest)</SelectItem>
              <SelectItem value="mastery:asc">Mastery % (lowest)</SelectItem>
              <SelectItem value="mastered:desc">Mastered (most)</SelectItem>
              <SelectItem value="mastered:asc">Mastered (fewest)</SelectItem>
              <SelectItem value="lastStudied:desc">Last studied (newest)</SelectItem>
              <SelectItem value="lastStudied:asc">Last studied (oldest)</SelectItem>
              <SelectItem value="name:asc">Name (A–Z)</SelectItem>
              <SelectItem value="name:desc">Name (Z–A)</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {isMobile ? (
        <div className="space-y-2">
          {filtered.map((l) => {
            const isOpen = expanded.has(l.user_id);
            const touched = l.product_breakdown.filter((b) => b.last_studied !== null);
            const daysStale = daysSince(l.last_studied);
            return (
              <div
                key={l.user_id}
                className={cn(
                  "rounded-lg border bg-card",
                  !l.has_studied && "opacity-60",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(l.user_id)}
                  className="flex w-full items-start gap-2 p-3 text-left hover:bg-muted/40 transition-colors"
                >
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <div className="text-sm font-medium truncate">
                        {l.display_name ?? "(unnamed)"}
                      </div>
                      {l.email && (
                        <div className="text-xs text-muted-foreground truncate">{l.email}</div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Mastered</div>
                        <div className="font-semibold text-foreground">
                          {l.total_mastered} / {l.total_questions}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Last studied</div>
                        <div
                          className={cn(
                            "font-semibold",
                            daysStale >= 14
                              ? "text-destructive"
                              : daysStale >= 7
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-foreground",
                          )}
                        >
                          {staleLabel(l.last_studied)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={l.mastery_pct} className="h-2" />
                      <span className="text-[11px] text-muted-foreground tabular-nums w-10 text-right">
                        {l.mastery_pct}%
                      </span>
                    </div>
                  </div>
                </button>
                {isOpen && (
                  <div className="border-t bg-muted/20 p-3">
                    {touched.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">
                        No product banks touched yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {touched.map((b) => (
                          <div
                            key={b.product_slug}
                            className="rounded-md border bg-background p-2.5 space-y-1.5"
                          >
                            <div className="text-sm font-medium truncate">
                              {PRODUCT_LABELS[b.product_slug] ?? b.product_slug}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {b.mastered_count} / {b.study_total} · {staleLabel(b.last_studied)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={b.mastery_pct} className="h-1.5" />
                              <span className="text-[11px] tabular-nums w-10 text-right">
                                {b.mastery_pct}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2 w-8"></th>
              <th className="px-3 py-2">
                <SortButton active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")}>
                  Learner
                </SortButton>
              </th>
              <th className="px-3 py-2">
                <SortButton
                  active={sortKey === "mastered"}
                  dir={sortDir}
                  onClick={() => toggleSort("mastered")}
                >
                  Mastered
                </SortButton>
              </th>
              <th className="px-3 py-2">
                <SortButton
                  active={sortKey === "mastery"}
                  dir={sortDir}
                  onClick={() => toggleSort("mastery")}
                >
                  Mastery %
                </SortButton>
              </th>
              <th className="px-3 py-2">
                <SortButton
                  active={sortKey === "lastStudied"}
                  dir={sortDir}
                  onClick={() => toggleSort("lastStudied")}
                >
                  Last studied
                </SortButton>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((l) => {
              const isOpen = expanded.has(l.user_id);
              const touched = l.product_breakdown.filter((b) => b.last_studied !== null);
              const daysStale = daysSince(l.last_studied);
              return (
                <>
                  <tr
                    key={l.user_id}
                    className={cn(
                      "cursor-pointer hover:bg-muted/30",
                      !l.has_studied && "opacity-60",
                    )}
                    onClick={() => toggleExpand(l.user_id)}
                  >
                    <td className="px-3 py-2 align-top">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {l.display_name ?? "(unnamed)"}
                        </span>
                        {l.email && (
                          <span className="text-xs text-muted-foreground">{l.email}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      {l.total_mastered} / {l.total_questions}
                    </td>
                    <td className="px-3 py-2 align-top">
                      <div className="flex items-center gap-2 min-w-[160px]">
                        <Progress value={l.mastery_pct} className="h-2" />
                        <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
                          {l.mastery_pct}%
                        </span>
                      </div>
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2 align-top text-xs",
                        daysStale >= 14
                          ? "text-destructive"
                          : daysStale >= 7
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-muted-foreground",
                      )}
                    >
                      {staleLabel(l.last_studied)}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={5} className="bg-muted/20 border-t">
                        <div className="p-4 space-y-2">
                          {touched.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">
                              No product banks touched yet.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {touched.map((b) => (
                                <div
                                  key={b.product_slug}
                                  className="flex items-center gap-3 rounded-md border bg-background p-2.5"
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium truncate">
                                      {PRODUCT_LABELS[b.product_slug] ?? b.product_slug}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {b.mastered_count} / {b.study_total} · {staleLabel(b.last_studied)}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 w-44 shrink-0">
                                    <Progress value={b.mastery_pct} className="h-1.5" />
                                    <span className="text-xs tabular-nums w-8 text-right">
                                      {b.mastery_pct}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}

function SortButton({
  active,
  dir,
  onClick,
  children,
}: {
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        "h-7 -ml-2 px-2 text-xs uppercase tracking-wide",
        active ? "text-foreground" : "text-muted-foreground",
      )}
      onClick={onClick}
    >
      {children}
      <ArrowUpDown className={cn("h-3 w-3 ml-1 transition-transform", active && dir === "asc" && "rotate-180")} />
    </Button>
  );
}
