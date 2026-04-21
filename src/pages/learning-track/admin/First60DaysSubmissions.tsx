import { useEffect, useMemo, useState } from "react";
import { Loader2, ChevronDown, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loadDay } from "@/features/first-60-days/content";
import { DAY_SUMMARIES } from "@/features/first-60-days/summaries";
import type { Day } from "@/features/first-60-days/types";

type ProgressRow = {
  user_id: string;
  day_number: number;
  reflection_answers: unknown;
  reflection_submitted_at: string | null;
  updated_at: string;
};

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
};

type Enriched = ProgressRow & { profile?: ProfileRow };

function answersToRecord(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof v === "string" && v.trim().length > 0) out[k] = v;
  }
  return out;
}

function personLabel(p: ProfileRow | undefined, fallbackId: string): string {
  if (!p) return fallbackId.slice(0, 8);
  const name =
    p.display_name?.trim() ||
    [p.first_name, p.last_name].filter(Boolean).join(" ").trim() ||
    p.email ||
    fallbackId.slice(0, 8);
  return name;
}

async function fetchSubmissions(): Promise<Enriched[]> {
  const { data: progress, error } = await supabase
    .from("first_60_days_progress")
    .select("user_id, day_number, reflection_answers, reflection_submitted_at, updated_at")
    .not("reflection_answers", "is", null)
    .order("reflection_submitted_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .range(0, 999);
  if (error) throw error;

  const rows = (progress ?? []) as ProgressRow[];
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  if (userIds.length === 0) return [];

  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("user_id, display_name, email, first_name, last_name")
    .in("user_id", userIds);
  if (profErr) throw profErr;

  const profileMap = new Map((profiles ?? []).map((p: ProfileRow) => [p.user_id, p]));
  return rows.map((r) => ({ ...r, profile: profileMap.get(r.user_id) }));
}

export default function First60DaysSubmissions() {
  const query = useQuery({
    queryKey: ["first-60-days-submissions"],
    queryFn: fetchSubmissions,
    staleTime: 30_000,
  });

  const [userFilter, setUserFilter] = useState("");
  const [dayFilter, setDayFilter] = useState<string>("all");
  const [submittedOnly, setSubmittedOnly] = useState<string>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadedDays, setLoadedDays] = useState<Record<number, Day | undefined>>({});

  useEffect(() => {
    const openDays = new Set<number>();
    for (const [key, isOpen] of Object.entries(expanded)) {
      if (!isOpen) continue;
      const n = Number(key.split("-").pop());
      if (n && loadedDays[n] === undefined) openDays.add(n);
    }
    openDays.forEach((n) => {
      loadDay(n).then((d) => setLoadedDays((prev) => ({ ...prev, [n]: d })));
    });
  }, [expanded, loadedDays]);

  const dayOptions = useMemo(() => DAY_SUMMARIES.map((d) => d.dayNumber), []);
  const daySummaryMap = useMemo(
    () => new Map(DAY_SUMMARIES.map((d) => [d.dayNumber, d])),
    [],
  );

  const filtered = useMemo(() => {
    const all = query.data ?? [];
    const q = userFilter.trim().toLowerCase();
    return all.filter((row) => {
      if (submittedOnly === "submitted" && !row.reflection_submitted_at) return false;
      if (submittedOnly === "draft" && row.reflection_submitted_at) return false;
      if (dayFilter !== "all" && String(row.day_number) !== dayFilter) return false;
      if (q) {
        const label = personLabel(row.profile, row.user_id).toLowerCase();
        const email = (row.profile?.email ?? "").toLowerCase();
        if (!label.includes(q) && !email.includes(q)) return false;
      }
      return true;
    });
  }, [query.data, userFilter, dayFilter, submittedOnly]);

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (query.error) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-4 text-sm text-destructive">
          Failed to load submissions:{" "}
          {query.error instanceof Error ? query.error.message : "Unknown error"}
        </CardContent>
      </Card>
    );
  }

  const rows = filtered;

  return (
    <div className="space-y-3" data-testid="first-60-days-submissions">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-3">
          <Input
            placeholder="Search by name or email…"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="max-w-xs"
          />
          <Select value={dayFilter} onValueChange={setDayFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All days</SelectItem>
              {dayOptions.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  Day {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={submittedOnly} onValueChange={setSubmittedOnly}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All submissions</SelectItem>
              <SelectItem value="submitted">Submitted only</SelectItem>
              <SelectItem value="draft">Drafts only</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="ml-auto">
            {rows.length} {rows.length === 1 ? "row" : "rows"}
          </Badge>
        </CardContent>
      </Card>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No reflection submissions match your filters yet.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="w-6 px-2 py-2"></th>
                <th className="px-3 py-2">Learner</th>
                <th className="px-3 py-2">Day</th>
                <th className="px-3 py-2">Submitted</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => {
                const rowKey = `${row.user_id}-${row.day_number}`;
                const isOpen = Boolean(expanded[rowKey]);
                const summary = daySummaryMap.get(row.day_number);
                const dayInfo = loadedDays[row.day_number];
                const answers = answersToRecord(row.reflection_answers);
                const isSubmitted = Boolean(row.reflection_submitted_at);
                return (
                  <>
                    <tr
                      key={rowKey}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setExpanded((s) => ({ ...s, [rowKey]: !s[rowKey] }))}
                    >
                      <td className="px-2 py-2 text-muted-foreground">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium">
                          {personLabel(row.profile, row.user_id)}
                        </div>
                        {row.profile?.email && (
                          <div className="text-xs text-muted-foreground">
                            {row.profile.email}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium">Day {row.day_number}</div>
                        {summary && (
                          <div className="text-xs text-muted-foreground">{summary.title}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {row.reflection_submitted_at
                          ? new Date(row.reflection_submitted_at).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <Badge
                          variant={isSubmitted ? "default" : "outline"}
                          className={cn(
                            isSubmitted &&
                              "border-emerald-500/60 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10"
                          )}
                        >
                          {isSubmitted ? "Submitted" : "Draft"}
                        </Badge>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-muted/30">
                        <td colSpan={5} className="px-6 py-4">
                          {!dayInfo ? (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Loader2 className="h-3 w-3 animate-spin" /> Loading prompts…
                            </div>
                          ) : dayInfo.reflection.length > 0 ? (
                            <div className="space-y-3">
                              {dayInfo.reflection.map((prompt) => {
                                const a = answers[String(prompt.index)] ?? "";
                                return (
                                  <div key={prompt.index} className="space-y-1">
                                    <div className="text-xs font-semibold text-muted-foreground">
                                      {prompt.index}. {prompt.question}
                                    </div>
                                    {a ? (
                                      <div className="whitespace-pre-wrap rounded-md border bg-background p-3 text-sm">
                                        {a}
                                      </div>
                                    ) : (
                                      <div className="text-xs italic text-muted-foreground">
                                        No answer
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              Raw answers:{" "}
                              <pre className="mt-1 overflow-auto rounded bg-background p-2 text-xs">
                                {JSON.stringify(answers, null, 2)}
                              </pre>
                            </div>
                          )}
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
