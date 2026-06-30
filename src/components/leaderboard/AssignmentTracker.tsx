import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2, Search, Users2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AdminWorksheetRoster from "@/components/leaderboard/AdminWorksheetRoster";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAssignmentTracker, type TrackerColumn } from "@/hooks/useAssignmentTracker";

function fmtDate(iso: string | null): string {
  if (!iso) return "Submitted";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "Submitted" : d.toLocaleDateString();
}

function HeaderCell({ col, count, total }: { col: TrackerColumn; count: number; total: number }) {
  return (
    <th
      className="sticky top-0 z-10 bg-muted/60 px-1.5 py-2 text-center align-bottom backdrop-blur"
      title={`Assignment ${col.order}: ${col.title} — ${count}/${total} submitted. Click to open the assignment.`}
    >
      <Link
        to={`/learning-track/pre-rnf/assignments/${col.urlSlug}`}
        className="mx-auto flex w-9 flex-col items-center gap-0.5 rounded-md py-0.5 transition-colors hover:bg-primary/10"
      >
        <span className="text-xs font-bold tabular-nums text-primary underline-offset-2 hover:underline">
          {col.order}
        </span>
        <span className="text-[10px] tabular-nums text-muted-foreground">{count}</span>
      </Link>
    </th>
  );
}

export default function AssignmentTracker({ enabled }: { enabled: boolean }) {
  const { data, isLoading, error } = useAssignmentTracker(enabled);
  const [filter, setFilter] = useState("");

  const filteredUsers = useMemo(() => {
    const users = data?.users ?? [];
    const q = filter.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q));
  }, [data, filter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-4 text-sm text-destructive">
          Couldn't load the assignment tracker:{" "}
          {(error as { message?: string } | null)?.message ?? "Unknown error"}
        </CardContent>
      </Card>
    );
  }

  const columns = data?.columns ?? [];
  const perColumnCount = data?.perColumnCount ?? {};
  const totalLearners = data?.users.length ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Users2 className="h-3.5 w-3.5" />
          Assignment Tracker
          <Badge variant="secondary" className="ml-1 text-[10px]">
            Admin only
          </Badge>
        </div>
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search a learner…"
            className="h-9 pl-8 text-sm"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Each learner appears once they've submitted at least one assignment. Column numbers match
        the assignment order — hover a header or a tick for the full title and date.
      </p>

      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            {totalLearners === 0
              ? "No assignment submissions yet."
              : "No learner matches that search."}
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border [-webkit-overflow-scrolling:touch]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-20 bg-muted/60 px-3 py-2 text-left align-bottom backdrop-blur">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Learner
                  </div>
                </th>
                <th className="sticky top-0 z-10 bg-muted/60 px-2 py-2 text-center align-bottom backdrop-blur">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Done
                  </div>
                </th>
                {columns.map((col) => (
                  <HeaderCell
                    key={col.statusKey}
                    col={col}
                    count={perColumnCount[col.statusKey] ?? 0}
                    total={totalLearners}
                  />
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((u) => {
                const pct = columns.length ? u.completedCount / columns.length : 0;
                return (
                  <tr key={u.userId} className="hover:bg-muted/30">
                    <td className="sticky left-0 z-10 max-w-[160px] truncate bg-background px-3 py-2 font-medium">
                      {u.name}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span
                        className={cn(
                          "inline-flex min-w-[3rem] justify-center rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
                          pct === 1
                            ? "bg-green-500/15 text-green-700 dark:text-green-300"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {u.completedCount}/{columns.length}
                      </span>
                    </td>
                    {columns.map((col) => {
                      const done = col.statusKey in u.completedAt;
                      return (
                        <td key={col.statusKey} className="px-1.5 py-2 text-center">
                          {done ? (
                            <span
                              className="mx-auto flex h-6 w-6 items-center justify-center rounded-md bg-green-500/15 text-green-600 dark:text-green-400"
                              title={`${col.title} — ${fmtDate(u.completedAt[col.statusKey])}`}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span
                              className="mx-auto block h-1 w-3 rounded-full bg-border"
                              title={`${col.title} — not submitted`}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {columns.length > 0 && (
        <div className="rounded-lg border bg-muted/20 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            What each number is
          </div>
          <div className="flex flex-wrap gap-1.5">
            {columns.map((col) => (
              <Link
                key={col.statusKey}
                to={`/learning-track/pre-rnf/assignments/${col.urlSlug}`}
                className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2 py-1 text-xs transition-colors hover:border-primary/40 hover:bg-primary/5"
                title={col.short}
              >
                <span className="flex h-4 min-w-4 items-center justify-center rounded bg-primary/10 px-1 text-[10px] font-bold tabular-nums text-primary">
                  {col.order}
                </span>
                <span className="max-w-[180px] truncate text-foreground/80">{col.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="border-t pt-5">
        <AdminWorksheetRoster enabled={enabled} />
      </div>
    </div>
  );
}
