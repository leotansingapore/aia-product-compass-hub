import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ChevronDown, ChevronRight, ArrowUpDown, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SessionRow = {
  id: string;
  user_id: string;
  scenario_title: string;
  scenario_category: string;
  scenario_difficulty: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  video_url: string | null;
};

type FeedbackRow = {
  session_id: string;
  overall_score: number;
  communication_score: number;
  active_listening_score: number;
  objection_handling_score: number;
  product_knowledge_score: number;
  created_at: string;
};

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
};

type SessionWithFeedback = SessionRow & { feedback?: FeedbackRow };

type LearnerRoll = {
  userId: string;
  name: string;
  email: string | null;
  sessions: SessionWithFeedback[];
  totalSessions: number;
  completedSessions: number;
  avgScore: number | null;
  lastSessionAt: string | null;
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
  sessions: SessionRow[];
  feedback: FeedbackRow[];
  profiles: Map<string, ProfileRow>;
}> {
  const sessionsRes = await supabase
    .from("roleplay_sessions")
    .select("id, user_id, scenario_title, scenario_category, scenario_difficulty, started_at, ended_at, duration_seconds, video_url")
    .order("started_at", { ascending: false })
    .range(0, 9999);
  if (sessionsRes.error) throw sessionsRes.error;
  const sessions = (sessionsRes.data ?? []) as SessionRow[];

  const sessionIds = sessions.map((s) => s.id);
  const feedback: FeedbackRow[] = [];
  if (sessionIds.length > 0) {
    const feedbackRes = await supabase
      .from("roleplay_feedback")
      .select("session_id, overall_score, communication_score, active_listening_score, objection_handling_score, product_knowledge_score, created_at")
      .in("session_id", sessionIds)
      .range(0, 9999);
    if (feedbackRes.error) throw feedbackRes.error;
    feedback.push(...((feedbackRes.data ?? []) as FeedbackRow[]));
  }

  const userIds = Array.from(new Set(sessions.map((s) => s.user_id)));
  if (userIds.length === 0) return { sessions, feedback, profiles: new Map() };
  const profilesRes = await supabase
    .from("profiles")
    .select("user_id, display_name, email, first_name, last_name")
    .in("user_id", userIds);
  if (profilesRes.error) throw profilesRes.error;
  return {
    sessions,
    feedback,
    profiles: new Map((profilesRes.data ?? []).map((p: ProfileRow) => [p.user_id, p])),
  };
}

function rollUp(
  sessions: SessionRow[],
  feedback: FeedbackRow[],
  profiles: Map<string, ProfileRow>,
): LearnerRoll[] {
  const feedbackBySession = new Map(feedback.map((f) => [f.session_id, f]));
  const byUser = new Map<string, SessionWithFeedback[]>();
  for (const s of sessions) {
    const enriched: SessionWithFeedback = { ...s, feedback: feedbackBySession.get(s.id) };
    const list = byUser.get(s.user_id) ?? [];
    list.push(enriched);
    byUser.set(s.user_id, list);
  }
  const out: LearnerRoll[] = [];
  for (const [userId, list] of byUser) {
    const completed = list.filter((s) => !!s.ended_at);
    const scored = list.filter((s) => s.feedback?.overall_score);
    const avgScore = scored.length > 0
      ? Math.round(scored.reduce((sum, s) => sum + (s.feedback?.overall_score ?? 0), 0) / scored.length)
      : null;
    out.push({
      userId,
      name: personLabel(profiles.get(userId), userId),
      email: profiles.get(userId)?.email ?? null,
      sessions: list.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()),
      totalSessions: list.length,
      completedSessions: completed.length,
      avgScore,
      lastSessionAt: list[0]?.started_at ?? null,
    });
  }
  return out;
}

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

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

type SortKey = "name" | "sessions" | "score" | "lastSession";

export default function AdminRoleplay() {
  const query = useQuery({
    queryKey: ["admin-roleplay"],
    queryFn: fetchAll,
    staleTime: 30_000,
  });
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("lastSession");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const learners = useMemo(() => {
    if (!query.data) return [] as LearnerRoll[];
    return rollUp(query.data.sessions, query.data.feedback, query.data.profiles);
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
      if (sortKey === "sessions") return (a.totalSessions - b.totalSessions) * dir;
      if (sortKey === "score") {
        const av = a.avgScore ?? -1;
        const bv = b.avgScore ?? -1;
        return (av - bv) * dir;
      }
      const at = a.lastSessionAt ? new Date(a.lastSessionAt).getTime() : 0;
      const bt = b.lastSessionAt ? new Date(b.lastSessionAt).getTime() : 0;
      return (at - bt) * dir;
    });
    return base;
  }, [learners, filter, sortKey, sortDir]);

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
          Failed to load roleplay data: {(query.error as Error).message}
        </CardContent>
      </Card>
    );
  }

  if (learners.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          No roleplay sessions yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          One row per learner. Click to expand their full session history.{" "}
          <span className="font-medium text-foreground">Avg score</span> is averaged over
          scored sessions only (feedback AI must have completed).
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
              <th className="px-3 py-2 w-8"></th>
              <th className="px-3 py-2">
                <SortButton active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")}>
                  Learner
                </SortButton>
              </th>
              <th className="px-3 py-2">
                <SortButton active={sortKey === "sessions"} dir={sortDir} onClick={() => toggleSort("sessions")}>
                  Sessions
                </SortButton>
              </th>
              <th className="px-3 py-2">
                <SortButton active={sortKey === "score"} dir={sortDir} onClick={() => toggleSort("score")}>
                  Avg score
                </SortButton>
              </th>
              <th className="px-3 py-2">
                <SortButton active={sortKey === "lastSession"} dir={sortDir} onClick={() => toggleSort("lastSession")}>
                  Last session
                </SortButton>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((l) => {
              const isOpen = expanded.has(l.userId);
              const daysStale = daysSince(l.lastSessionAt);
              return (
                <>
                  <tr
                    key={l.userId}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => toggleExpand(l.userId)}
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
                        <span className="font-medium text-foreground">{l.name}</span>
                        {l.email && (
                          <span className="text-xs text-muted-foreground">{l.email}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 align-top">
                      {l.completedSessions} / {l.totalSessions}
                    </td>
                    <td className="px-3 py-2 align-top font-medium">
                      {l.avgScore !== null ? `${l.avgScore}/100` : "—"}
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
                      {staleLabel(l.lastSessionAt)}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={5} className="bg-muted/20 border-t">
                        <div className="p-4 space-y-2">
                          {l.sessions.map((s) => (
                            <div
                              key={s.id}
                              className="rounded-md border bg-background p-3 flex items-start gap-3"
                            >
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium truncate">
                                    {s.scenario_title}
                                  </span>
                                  <Badge variant="outline" className="text-[10px] uppercase">
                                    {s.scenario_difficulty}
                                  </Badge>
                                  {!s.ended_at && (
                                    <Badge variant="secondary" className="text-[10px] uppercase">
                                      Incomplete
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(s.started_at).toLocaleString()} · {formatDuration(s.duration_seconds)}
                                </div>
                                {s.feedback && (
                                  <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                                    <span className="rounded bg-muted/60 px-1.5 py-0.5">
                                      Overall <span className="font-semibold">{s.feedback.overall_score}</span>
                                    </span>
                                    <span className="rounded bg-muted/60 px-1.5 py-0.5">
                                      Comms {s.feedback.communication_score}
                                    </span>
                                    <span className="rounded bg-muted/60 px-1.5 py-0.5">
                                      Listen {s.feedback.active_listening_score}
                                    </span>
                                    <span className="rounded bg-muted/60 px-1.5 py-0.5">
                                      Objection {s.feedback.objection_handling_score}
                                    </span>
                                    <span className="rounded bg-muted/60 px-1.5 py-0.5">
                                      Product {s.feedback.product_knowledge_score}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {s.video_url && (
                                <a
                                  href={s.video_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex shrink-0 items-center gap-1.5 rounded border bg-background px-2 py-1 text-xs hover:bg-muted/60 transition-colors"
                                >
                                  <Video className="h-3.5 w-3.5" />
                                  Recording
                                </a>
                              )}
                            </div>
                          ))}
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
