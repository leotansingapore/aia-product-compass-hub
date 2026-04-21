import { useMemo, useState } from "react";
import { Loader2, ArrowUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DAYS_WITH_REFLECTION, TOTAL_DAYS } from "@/features/first-60-days/summaries";

type ProgressRow = {
  user_id: string;
  day_number: number;
  quiz_passed_at: string | null;
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

type LearnerRoll = {
  userId: string;
  name: string;
  email: string | null;
  quizzesPassed: number;
  currentDay: number;
  reflectionsSubmitted: number;
  reflectionsExpected: number;
  lastActive: string;
};

const TOTAL_REFLECTION_DAYS = DAYS_WITH_REFLECTION.size;

function personLabel(p: ProfileRow | undefined, fallbackId: string): string {
  if (!p) return fallbackId.slice(0, 8);
  return (
    p.display_name?.trim() ||
    [p.first_name, p.last_name].filter(Boolean).join(" ").trim() ||
    p.email ||
    fallbackId.slice(0, 8)
  );
}

async function fetchAllProgress(): Promise<{ rows: ProgressRow[]; profiles: Map<string, ProfileRow> }> {
  const { data, error } = await supabase
    .from("first_60_days_progress")
    .select("user_id, day_number, quiz_passed_at, reflection_submitted_at, updated_at")
    .range(0, 9999);
  if (error) throw error;
  const rows = (data ?? []) as ProgressRow[];
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  if (userIds.length === 0) return { rows, profiles: new Map() };
  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("user_id, display_name, email, first_name, last_name")
    .in("user_id", userIds);
  if (profErr) throw profErr;
  return {
    rows,
    profiles: new Map((profiles ?? []).map((p: ProfileRow) => [p.user_id, p])),
  };
}

function rollUp(rows: ProgressRow[], profiles: Map<string, ProfileRow>): LearnerRoll[] {
  const byUser = new Map<string, ProgressRow[]>();
  for (const r of rows) {
    const list = byUser.get(r.user_id) ?? [];
    list.push(r);
    byUser.set(r.user_id, list);
  }
  const out: LearnerRoll[] = [];
  for (const [userId, list] of byUser) {
    const profile = profiles.get(userId);
    const quizzesPassed = list.filter((r) => r.quiz_passed_at).length;
    const reflectionsSubmitted = list.filter(
      (r) => r.reflection_submitted_at && DAYS_WITH_REFLECTION.has(r.day_number),
    ).length;
    const highestCompleted = list
      .filter((r) => r.quiz_passed_at)
      .reduce((m, r) => Math.max(m, r.day_number), 0);
    const currentDay = Math.min(TOTAL_DAYS, highestCompleted + 1);
    const lastActive = list
      .map((r) => r.updated_at)
      .sort()
      .at(-1) ?? new Date(0).toISOString();
    out.push({
      userId,
      name: personLabel(profile, userId),
      email: profile?.email ?? null,
      quizzesPassed,
      currentDay,
      reflectionsSubmitted,
      reflectionsExpected: TOTAL_REFLECTION_DAYS,
      lastActive,
    });
  }
  return out;
}

function daysSince(iso: string): number {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - then) / 86_400_000);
}

type SortKey = "name" | "currentDay" | "quizzesPassed" | "lastActive";

export default function First60DaysProgress() {
  const query = useQuery({
    queryKey: ["first-60-days-progress-admin"],
    queryFn: fetchAllProgress,
    staleTime: 30_000,
  });

  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("lastActive");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const learners = useMemo(() => {
    if (!query.data) return [] as LearnerRoll[];
    return rollUp(query.data.rows, query.data.profiles);
  }, [query.data]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const base = q
      ? learners.filter(
          (l) =>
            l.name.toLowerCase().includes(q) || (l.email ?? "").toLowerCase().includes(q),
        )
      : learners.slice();
    base.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "currentDay") return (a.currentDay - b.currentDay) * dir;
      if (sortKey === "quizzesPassed") return (a.quizzesPassed - b.quizzesPassed) * dir;
      return (new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime()) * dir;
    });
    return base;
  }, [learners, filter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
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
          Failed to load learner progress: {(query.error as Error).message}
        </CardContent>
      </Card>
    );
  }

  if (learners.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          No learner has started the First 60 Days journey yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          One row per learner. <span className="font-medium text-foreground">Current day</span> =
          next day the learner can unlock (highest quiz passed + 1).{" "}
          <span className="font-medium text-foreground">Quizzes</span> counts 100%-passed quizzes
          across all {TOTAL_DAYS} days.{" "}
          <span className="font-medium text-foreground">Reflections</span> counts submitted (not
          draft) reflections on the {TOTAL_REFLECTION_DAYS} days that require one.
        </CardContent>
      </Card>

      <Input
        placeholder="Filter by name or email…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-sm"
      />

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-3 py-2">
                <SortButton active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")}>
                  Learner
                </SortButton>
              </th>
              <th className="px-3 py-2">
                <SortButton
                  active={sortKey === "currentDay"}
                  dir={sortDir}
                  onClick={() => toggleSort("currentDay")}
                >
                  Current day
                </SortButton>
              </th>
              <th className="px-3 py-2">
                <SortButton
                  active={sortKey === "quizzesPassed"}
                  dir={sortDir}
                  onClick={() => toggleSort("quizzesPassed")}
                >
                  Quizzes passed
                </SortButton>
              </th>
              <th className="px-3 py-2">Progress</th>
              <th className="px-3 py-2">Reflections</th>
              <th className="px-3 py-2">
                <SortButton
                  active={sortKey === "lastActive"}
                  dir={sortDir}
                  onClick={() => toggleSort("lastActive")}
                >
                  Last active
                </SortButton>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((l) => {
              const pct = Math.round((l.quizzesPassed / TOTAL_DAYS) * 100);
              const daysStale = daysSince(l.lastActive);
              const staleLabel =
                daysStale === 0
                  ? "today"
                  : daysStale === 1
                  ? "yesterday"
                  : Number.isFinite(daysStale)
                  ? `${daysStale} days ago`
                  : "never";
              return (
                <tr key={l.userId}>
                  <td className="px-3 py-2 align-top">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{l.name}</span>
                      {l.email && (
                        <span className="text-xs text-muted-foreground">{l.email}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top font-semibold">Day {l.currentDay}</td>
                  <td className="px-3 py-2 align-top">
                    {l.quizzesPassed} / {TOTAL_DAYS}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <div className="flex items-center gap-2 min-w-[160px]">
                      <Progress value={pct} className="h-2" />
                      <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">
                        {pct}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top">
                    {l.reflectionsSubmitted} / {l.reflectionsExpected}
                  </td>
                  <td
                    className={cn(
                      "px-3 py-2 align-top text-xs",
                      daysStale >= 7 ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {staleLabel}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
