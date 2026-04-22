import { useMemo, useState } from "react";
import {
  Crown,
  Medal,
  Award,
  Loader2,
  Trophy,
  ChevronDown,
  ChevronRight,
  CalendarCheck,
  Pencil,
  FileCheck2,
  Brain,
  BookOpen,
  PlayCircle,
  Route,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

type PointRow = {
  icon: typeof CalendarCheck;
  activity: string;
  points: string;
  note?: string;
};

const POINT_ROWS: readonly PointRow[] = [
  { icon: CalendarCheck, activity: "First 14 Days — day complete", points: "1 pt", note: "per day" },
  { icon: Pencil, activity: "First 14 Days — reflection", points: "0.5 pt", note: "per reflection" },
  { icon: CalendarCheck, activity: "First 60 Days — day complete", points: "1 pt", note: "per day" },
  { icon: Pencil, activity: "First 60 Days — reflection", points: "0.5 pt", note: "per reflection" },
  { icon: FileCheck2, activity: "Assignment submitted", points: "5 pt", note: "per assignment" },
  { icon: Brain, activity: "Question bank mastery", points: "0.5 pt", note: "per question" },
  { icon: BookOpen, activity: "Product quiz attempt", points: "1 pt", note: "per attempt" },
  { icon: PlayCircle, activity: "Video completed", points: "0.5 pt", note: "per video" },
  { icon: Route, activity: "Learning track item", points: "1 pt", note: "per item" },
  { icon: Upload, activity: "Learning track submission", points: "3 pt", note: "per submission" },
  { icon: CheckCircle2, activity: "Submission approved", points: "+2 pt", note: "bonus on approval" },
];

function PointsReferenceTable() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <div>
            <div className="text-sm font-semibold">How points are earned</div>
            <div className="text-xs text-muted-foreground">
              Tiebreaker: distinct days active, then name.
            </div>
          </div>
          <Badge variant="secondary" className="hidden sm:inline-flex text-[10px]">
            {POINT_ROWS.length} ways to score
          </Badge>
        </div>
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-full text-[11px] uppercase tracking-wider">
                  Activity
                </TableHead>
                <TableHead className="whitespace-nowrap text-right text-[11px] uppercase tracking-wider">
                  Points
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {POINT_ROWS.map(({ icon: Icon, activity, points, note }) => (
                <TableRow key={activity}>
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium leading-tight">{activity}</div>
                        {note && (
                          <div className="text-[11px] text-muted-foreground">{note}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 text-right">
                    <span className="inline-flex min-w-[56px] justify-center rounded-md border border-amber-200/60 bg-amber-50 px-2 py-0.5 text-xs font-semibold tabular-nums text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                      {points}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Leaderboard() {
  const { user } = useSimplifiedAuth();
  const { tier } = useUserTier();
  const scopedTier =
    tier === "explorer" || tier === "papers_taker" || tier === "post_rnf"
      ? tier
      : null;
  const query = useLearnerLeaderboard(user?.id ?? null, scopedTier);

  const rows = query.data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
      <div className="overflow-hidden rounded-xl border bg-gradient-to-br from-amber-50 via-background to-background p-5 dark:from-amber-950/20">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 ring-1 ring-amber-500/20">
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-2xl font-bold font-serif tracking-tight">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">
              Show up, stack points, climb the ranks. Consistency wins — we break ties on
              distinct days active.
            </p>
          </div>
        </div>
      </div>

      {query.isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : query.error ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">
            Failed to load leaderboard:{" "}
            {(query.error as { message?: string } | null)?.message ?? "Unknown error"}
          </CardContent>
        </Card>
      ) : scopedTier ? (
        (() => {
          const tierRows = rows
            .filter((r) => r.tier === scopedTier)
            .map((r, i) => ({ ...r, rank: i + 1 }));
          return (
            <div className="space-y-3">
              <div className="inline-flex rounded-md border bg-muted/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {TIER_META[scopedTier].label} Leaderboard
              </div>
              <HallOfFamePodium rows={tierRows} />
              <YourRankBanner rows={rows} tier={scopedTier} />
              <LeaderboardTable rows={rows} tier={scopedTier} filter="" />
            </div>
          );
        })()
      ) : (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            The leaderboard opens once your tier is assigned.
          </CardContent>
        </Card>
      )}

      <PointsReferenceTable />
    </div>
  );
}
