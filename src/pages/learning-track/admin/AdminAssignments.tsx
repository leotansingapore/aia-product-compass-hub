import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ChevronDown, ChevronRight, FileText, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { loadAllAssignments, type Assignment } from "@/features/first-60-days/assignments";

const PRODUCT_ID = "first-60-days-assignments";

type SubmissionRow = {
  id: string;
  user_id: string;
  item_id: string;
  submission_text: string | null;
  file_url: string | null;
  file_name: string | null;
  submitted_at: string | null;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
};

type LearnerRow = {
  userId: string;
  name: string;
  email: string | null;
  submissions: Record<string, SubmissionRow>;
  submittedCount: number;
};

function personLabel(p: ProfileRow | undefined, fallbackId: string): string {
  if (!p) return fallbackId.slice(0, 8);
  return (
    p.display_name?.trim() ||
    [p.first_name, p.last_name].filter(Boolean).join(" ").trim() ||
    p.email ||
    fallbackId.slice(0, 8)
  );
}

async function fetchAll(): Promise<{
  rows: SubmissionRow[];
  profiles: Map<string, ProfileRow>;
  assignments: Assignment[];
}> {
  const [subRes, assignments] = await Promise.all([
    (supabase.from as any)("assignment_submissions")
      .select("id, user_id, item_id, submission_text, file_url, file_name, submitted_at")
      .eq("product_id", PRODUCT_ID)
      .order("submitted_at", { ascending: false })
      .range(0, 9999),
    loadAllAssignments(),
  ]);
  if (subRes.error) throw subRes.error;
  const rows = (subRes.data ?? []) as SubmissionRow[];
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  if (userIds.length === 0) return { rows, profiles: new Map(), assignments };
  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("id, display_name, email, first_name, last_name")
    .in("id", userIds);
  if (profErr) throw profErr;
  return {
    rows,
    profiles: new Map((profiles ?? []).map((p: ProfileRow) => [p.id, p])),
    assignments,
  };
}

function rollUp(
  rows: SubmissionRow[],
  profiles: Map<string, ProfileRow>,
  assignments: Assignment[],
): LearnerRow[] {
  const byUser = new Map<string, Record<string, SubmissionRow>>();
  for (const r of rows) {
    const forUser = byUser.get(r.user_id) ?? {};
    // Most recent first in query order; keep first seen per item.
    if (!forUser[r.item_id]) forUser[r.item_id] = r;
    byUser.set(r.user_id, forUser);
  }
  const out: LearnerRow[] = [];
  for (const [userId, submissions] of byUser) {
    const submittedCount = assignments.filter(
      (a) => !!submissions[a.frontmatter.status_key],
    ).length;
    out.push({
      userId,
      name: personLabel(profiles.get(userId), userId),
      email: profiles.get(userId)?.email ?? null,
      submissions,
      submittedCount,
    });
  }
  out.sort((a, b) => b.submittedCount - a.submittedCount || a.name.localeCompare(b.name));
  return out;
}

function parseFormValues(text: string | null | undefined): Record<string, string> | null {
  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed).map(([k, v]) => [k, typeof v === "string" ? v : String(v ?? "")]),
      );
    }
  } catch {
    // not json
  }
  return null;
}

export default function AdminAssignments() {
  const query = useQuery({
    queryKey: ["admin-first-60-assignments"],
    queryFn: fetchAll,
    staleTime: 30_000,
  });
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const learners = useMemo(() => {
    if (!query.data) return [] as LearnerRow[];
    return rollUp(query.data.rows, query.data.profiles, query.data.assignments);
  }, [query.data]);

  const assignments = query.data?.assignments ?? [];

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return learners;
    return learners.filter(
      (l) =>
        l.name.toLowerCase().includes(q) || (l.email ?? "").toLowerCase().includes(q),
    );
  }, [learners, filter]);

  const toggle = (userId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          Failed to load submissions: {(query.error as Error).message}
        </CardContent>
      </Card>
    );
  }

  if (learners.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          No assignment submissions yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          One row per learner. Click a row to see each assignment they've submitted.
          Counts show how many of the {assignments.length} assignments are in.
        </CardContent>
      </Card>

      <Input
        placeholder="Filter by name or email…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-sm"
      />

      <div className="space-y-2">
        {filtered.map((l) => {
          const isOpen = expanded.has(l.userId);
          return (
            <div key={l.userId} className="rounded-lg border bg-card">
              <button
                type="button"
                onClick={() => toggle(l.userId)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/40 transition-colors"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{l.name}</div>
                  {l.email && (
                    <div className="text-xs text-muted-foreground truncate">{l.email}</div>
                  )}
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] font-semibold uppercase tracking-wide",
                    l.submittedCount === assignments.length &&
                      "bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30",
                  )}
                >
                  {l.submittedCount} / {assignments.length}
                </Badge>
              </button>

              {isOpen && (
                <div className="border-t divide-y">
                  {assignments.map((a) => {
                    const sub = l.submissions[a.frontmatter.status_key];
                    const formValues = parseFormValues(sub?.submission_text);
                    return (
                      <div key={a.slug} className="p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Assignment {a.frontmatter.order}
                            </div>
                            <div className="text-sm font-semibold">{a.frontmatter.title}</div>
                          </div>
                          {sub ? (
                            <Badge className="bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30 text-[10px] font-semibold uppercase">
                              Submitted
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                              Not yet
                            </Badge>
                          )}
                        </div>

                        {sub && (
                          <div className="text-xs text-muted-foreground">
                            Submitted {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : "—"}
                          </div>
                        )}

                        {sub?.file_name && (
                          <a
                            href={sub.file_url ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs hover:bg-muted/60 transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="truncate max-w-xs">{sub.file_name}</span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </a>
                        )}

                        {formValues && (
                          <div className="space-y-2">
                            {Object.entries(formValues).map(([label, value]) =>
                              value ? (
                                <div
                                  key={label}
                                  className="rounded-md border bg-background p-3"
                                >
                                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                    {label}
                                  </div>
                                  <div className="text-sm whitespace-pre-wrap">{value}</div>
                                </div>
                              ) : null,
                            )}
                          </div>
                        )}

                        {sub && !formValues && sub.submission_text && (
                          <div className="rounded-md border bg-background p-3 text-sm whitespace-pre-wrap">
                            {sub.submission_text}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
