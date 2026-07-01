import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock, ExternalLink, FileText, Loader2, Search, Users2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AdminWorksheetRoster from "@/components/leaderboard/AdminWorksheetRoster";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useAssignmentTracker, type TrackerColumn, type TrackerUser } from "@/hooks/useAssignmentTracker";
import { loadAssignmentDraft } from "@/features/first-60-days/assignmentDrafts";

const ASSIGNMENTS_PRODUCT_ID = "first-60-days-assignments";

type CellView = { user: TrackerUser; col: TrackerColumn; kind: "submitted" | "draft" };

type ViewContent = {
  fields: Array<{ label: string; value: string }>;
  text: string;
  fileUrl: string | null;
  fileName: string | null;
  at: string | null;
};

function parseAnswers(text: string | null): { fields: Array<{ label: string; value: string }>; text: string } {
  if (!text) return { fields: [], text: "" };
  try {
    const o = JSON.parse(text);
    if (o && typeof o === "object" && !Array.isArray(o)) {
      const fields = Object.entries(o)
        .map(([k, v]) => ({ label: k, value: typeof v === "string" ? v : String(v ?? "") }))
        .filter((f) => f.value.trim().length > 0);
      return { fields, text: "" };
    }
  } catch {
    /* plain text */
  }
  return { fields: [], text };
}

async function fetchCellContent(view: CellView): Promise<ViewContent> {
  const { user, col, kind } = view;
  if (kind === "submitted") {
    const { data, error } = await (supabase.from as any)("assignment_submissions")
      .select("submission_text, file_url, file_name, submitted_at")
      .eq("product_id", ASSIGNMENTS_PRODUCT_ID)
      .eq("user_id", user.userId)
      .eq("item_id", col.statusKey)
      .order("submitted_at", { ascending: false })
      .limit(1);
    if (error) throw error;
    const row = (data ?? [])[0];
    const parsed = parseAnswers(row?.submission_text ?? null);
    return {
      ...parsed,
      fileUrl: row?.file_url ?? null,
      fileName: row?.file_name ?? null,
      at: row?.submitted_at ?? null,
    };
  }
  const draft = await loadAssignmentDraft(user.userId, col.statusKey);
  const fields = Object.entries(draft?.blob.f ?? {})
    .map(([k, v]) => ({ label: k, value: typeof v === "string" ? v : String(v ?? "") }))
    .filter((f) => f.value.trim().length > 0);
  return { fields, text: (draft?.blob.t ?? "").trim(), fileUrl: null, fileName: null, at: null };
}

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
  const [view, setView] = useState<CellView | null>(null);

  const content = useQuery({
    queryKey: ["tracker-cell", view?.user.userId, view?.col.statusKey, view?.kind],
    enabled: !!view,
    queryFn: () => fetchCellContent(view!),
    staleTime: 15_000,
  });

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
        Learners appear once they've submitted or started any assignment. A{" "}
        <span className="font-medium text-green-600 dark:text-green-400">green</span> tick = submitted,
        a <span className="font-medium text-amber-600 dark:text-amber-400">yellow</span> dot = started
        but not submitted yet. Click either to read what they wrote.
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
                      const inProgress = !done && u.draftKeys.includes(col.statusKey);
                      return (
                        <td key={col.statusKey} className="px-1.5 py-2 text-center">
                          {done ? (
                            <button
                              type="button"
                              onClick={() => setView({ user: u, col, kind: "submitted" })}
                              className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-green-500/15 text-green-600 transition-transform hover:scale-110 hover:bg-green-500/25 dark:text-green-400"
                              title={`${col.title} — submitted ${fmtDate(u.completedAt[col.statusKey])}. Click to view.`}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          ) : inProgress ? (
                            <button
                              type="button"
                              onClick={() => setView({ user: u, col, kind: "draft" })}
                              className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-600 transition-transform hover:scale-110 hover:bg-amber-500/30 dark:text-amber-400"
                              title={`${col.title} — in progress (not submitted). Click to view.`}
                            >
                              <Clock className="h-3 w-3" />
                            </button>
                          ) : (
                            <span
                              className="mx-auto block h-1 w-3 rounded-full bg-border"
                              title={`${col.title} — not started`}
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

      <Dialog open={!!view} onOpenChange={(open) => !open && setView(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          {view && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2 pr-6 text-left">
                  <span>
                    {view.col.order}. {view.col.title}
                  </span>
                  {view.kind === "submitted" ? (
                    <Badge className="border-green-500/40 bg-green-500/10 text-[10px] font-semibold uppercase text-green-600 dark:text-green-400">
                      Submitted
                    </Badge>
                  ) : (
                    <Badge className="border-amber-500/40 bg-amber-500/10 text-[10px] font-semibold uppercase text-amber-600 dark:text-amber-400">
                      In progress
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-left">
                  {view.user.name}
                  {view.kind === "submitted" && content.data?.at
                    ? ` · submitted ${new Date(content.data.at).toLocaleString()}`
                    : view.kind === "draft"
                      ? " · started, not submitted yet"
                      : ""}
                </DialogDescription>
              </DialogHeader>

              {content.isLoading ? (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : content.error ? (
                <div className="py-6 text-sm text-destructive">
                  Couldn't load this submission.
                </div>
              ) : content.data &&
                (content.data.fields.length > 0 || content.data.text || content.data.fileUrl) ? (
                <div className="space-y-2">
                  {content.data.fileName && content.data.fileUrl && (
                    <a
                      href={content.data.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm hover:bg-muted/60"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">{content.data.fileName}</span>
                      <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                    </a>
                  )}
                  {content.data.fields.map((f) => (
                    <div key={f.label} className="rounded-md border bg-background p-3">
                      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {f.label}
                      </div>
                      <div className="whitespace-pre-wrap break-words text-sm">{f.value}</div>
                    </div>
                  ))}
                  {content.data.text && (
                    <div className="whitespace-pre-wrap break-words rounded-md border bg-background p-3 text-sm">
                      {content.data.text}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-sm text-muted-foreground">
                  Nothing recorded yet.
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
