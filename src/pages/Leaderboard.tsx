import { useMemo, useState } from "react";
import {
  Crown,
  Medal,
  Award,
  Loader2,
  Trophy,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useUserTier } from "@/hooks/useUserTier";
import {
  useLearnerLeaderboard,
  type LeaderboardRow,
  type PointBreakdown,
} from "@/hooks/useLearnerLeaderboard";
import { TIER_META, type TierLevel } from "@/lib/tiers";
import { HallOfFamePodium } from "@/components/leaderboard/HallOfFamePodium";

const RANK_GOLD = "#C4A24D";
const RANK_SILVER = "#A8A8A8";
const RANK_BRONZE = "#CD7F32";

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5" style={{ color: RANK_GOLD }} />;
  if (rank === 2) return <Medal className="h-5 w-5" style={{ color: RANK_SILVER }} />;
  if (rank === 3) return <Award className="h-5 w-5" style={{ color: RANK_BRONZE }} />;
  return (
    <span className="text-sm font-semibold text-muted-foreground tabular-nums">#{rank}</span>
  );
}

const BREAKDOWN_ROWS: Array<{ key: keyof PointBreakdown; label: string }> = [
  { key: "first14Days", label: "First 14 Days — days complete" },
  { key: "first14Reflections", label: "First 14 Days — reflections" },
  { key: "first60Days", label: "First 60 Days — days complete" },
  { key: "first60Reflections", label: "First 60 Days — reflections" },
  { key: "assignments", label: "Assignments submitted" },
  { key: "questionBank", label: "Question bank mastery" },
  { key: "productQuizzes", label: "Product quizzes" },
  { key: "videos", label: "Videos completed" },
  { key: "learningTrackItems", label: "Learning track items" },
  { key: "learningTrackSubmissions", label: "Learning track submissions" },
];

function formatPoints(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function LeaderboardTable({
  rows,
  tier,
  filter,
}: {
  rows: LeaderboardRow[];
  tier: TierLevel;
  filter: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const pool = rows.filter((r) => r.tier === tier);
    // Re-rank within tier scope so #1 on each board is truly first.
    const reranked = pool.map((r, i) => ({ ...r, rank: i + 1 }));
    const q = filter.trim().toLowerCase();
    if (!q) return reranked;
    return reranked.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.email ?? "").toLowerCase().includes(q),
    );
  }, [rows, tier, filter]);

  if (filtered.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground">
          <Trophy className="h-6 w-6" />
          <div>No one on this leaderboard yet. Complete a day, quiz, or assignment to get on the board.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="divide-y">
        {filtered.map((row) => {
          const isOpen = expanded === row.userId;
          return (
            <div
              key={row.userId}
              className={cn(
                "transition-colors",
                row.isCurrentUser && "bg-primary/5 ring-1 ring-primary/20",
              )}
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : row.userId)}
                className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/40"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  <RankIcon rank={row.rank} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{row.name}</span>
                    {row.isCurrentUser && (
                      <Badge variant="secondary" className="text-[10px]">
                        You
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold tabular-nums">
                    {formatPoints(row.totalPoints)} pts
                  </div>
                  <div className="text-[11px] text-muted-foreground tabular-nums">
                    {row.daysActive} {row.daysActive === 1 ? "day" : "days"} active
                  </div>
                </div>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </button>
              {isOpen && (
                <div className="border-t bg-muted/20 px-4 py-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Point breakdown
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {BREAKDOWN_ROWS.map(({ key, label }) => {
                      const val = row.breakdown[key];
                      if (val === 0) return null;
                      return (
                        <div key={key} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium tabular-nums">
                            {formatPoints(val)}
                          </span>
                        </div>
                      );
                    })}
                    {BREAKDOWN_ROWS.every(({ key }) => row.breakdown[key] === 0) && (
                      <div className="col-span-full text-xs italic text-muted-foreground">
                        No points yet — time to get started.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function YourRankBanner({ rows, tier }: { rows: LeaderboardRow[]; tier: TierLevel }) {
  const me = useMemo(() => {
    const pool = rows.filter((r) => r.tier === tier);
    const reranked = pool.map((r, i) => ({ ...r, rank: i + 1 }));
    return reranked.find((r) => r.isCurrentUser);
  }, [rows, tier]);

  if (!me) return null;

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="flex items-center gap-3 p-3">
        <div className="flex h-10 w-10 items-center justify-center">
          <RankIcon rank={me.rank} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your rank
          </div>
          <div className="text-sm font-semibold">
            #{me.rank} — {formatPoints(me.totalPoints)} pts
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          {me.daysActive} {me.daysActive === 1 ? "day" : "days"} active
        </div>
      </CardContent>
    </Card>
  );
}

export default function Leaderboard() {
  const { user } = useSimplifiedAuth();
  const { tier } = useUserTier();
  const scopedTier =
    tier === "papers_taker" || tier === "post_rnf" ? tier : null;
  const query = useLearnerLeaderboard(user?.id ?? null, scopedTier);

  const rows = query.data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <div className="space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-bold font-serif tracking-tight">
          <Trophy className="h-6 w-6 text-amber-500" /> Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Ranked by learning activity — days complete, quizzes, reflections, assignments,
          question banks, and videos. Tiebreaker: distinct days active.
        </p>
      </div>

      {query.isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : query.error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">
            Failed to load leaderboard:{" "}
            {(query.error as { message?: string })?.message ??
              (typeof query.error === "string"
                ? query.error
                : JSON.stringify(query.error))}
          </CardContent>
        </Card>
      ) : tier === "papers_taker" || tier === "post_rnf" ? (
        (() => {
          const tierRows = rows
            .filter((r) => r.tier === tier)
            .map((r, i) => ({ ...r, rank: i + 1 }));
          return (
            <div className="space-y-3">
              <div className="inline-flex rounded-md border bg-muted/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {TIER_META[tier].label} Leaderboard
              </div>
              <HallOfFamePodium rows={tierRows} />
              <YourRankBanner rows={rows} tier={tier} />
              <LeaderboardTable rows={rows} tier={tier} filter="" />
            </div>
          );
        })()
      ) : (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            The leaderboard opens once you start your Papers-taker journey.
          </CardContent>
        </Card>
      )}

      <Card className="border-dashed">
        <CardContent className="space-y-1 p-3 text-[11px] text-muted-foreground">
          <div className="font-semibold text-foreground">How points are earned</div>
          <div>First 14/60 Days day complete: 1 pt · reflection: +0.5 pt</div>
          <div>Assignment submitted: 5 pt · question bank mastery: 0.5 pt each</div>
          <div>Product quiz: 1 pt · video completed: 0.5 pt</div>
          <div>Learning track item complete: 1 pt · submission: 3 pt (+2 pt if approved)</div>
        </CardContent>
      </Card>
    </div>
  );
}
