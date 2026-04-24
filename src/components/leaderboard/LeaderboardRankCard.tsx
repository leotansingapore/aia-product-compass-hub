import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Crown, Medal, Award, ChevronRight } from "lucide-react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useUserTier } from "@/hooks/useUserTier";
import { useLearnerLeaderboard } from "@/hooks/useLearnerLeaderboard";
import { cn } from "@/lib/utils";

// Yield to the browser so the hub grid paints before the leaderboard RPC
// competes for the network + main thread. requestIdleCallback when available,
// setTimeout fallback for Safari.
function useDeferredMount(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    type IdleWin = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const w = window as IdleWin;
    if (typeof w.requestIdleCallback === "function") {
      const handle = w.requestIdleCallback(() => setReady(true), { timeout: 500 });
      return () => w.cancelIdleCallback?.(handle);
    }
    const handle = window.setTimeout(() => setReady(true), 200);
    return () => window.clearTimeout(handle);
  }, []);
  return ready;
}

const RANK_GOLD = "#C4A24D";
const RANK_SILVER = "#A8A8A8";
const RANK_BRONZE = "#CD7F32";

function formatPoints(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5" style={{ color: RANK_GOLD }} />;
  if (rank === 2) return <Medal className="h-5 w-5" style={{ color: RANK_SILVER }} />;
  if (rank === 3) return <Award className="h-5 w-5" style={{ color: RANK_BRONZE }} />;
  return <Trophy className="h-5 w-5 text-amber-500" />;
}

/**
 * Compact card showing the learner's current leaderboard rank with a CTA
 * to the full leaderboard page. Hides itself when the user isn't on a
 * ranked tier or before the leaderboard query resolves.
 */
export function LeaderboardRankCard({ className }: { className?: string }) {
  const { user } = useSimplifiedAuth();
  const { tier } = useUserTier();
  const scopedTier =
    tier === "explorer" || tier === "papers_taker" || tier === "post_rnf"
      ? tier
      : null;
  const mounted = useDeferredMount();
  // Only arm the leaderboard RPC once the hub is idle. The hook already has a
  // 5-min staleTime, so deferring the first fetch never re-runs on revisits.
  const query = useLearnerLeaderboard(
    mounted ? user?.id ?? null : null,
    mounted ? scopedTier : null,
  );

  if (!scopedTier) return null;
  if (!query.data) return null;

  const pool = query.data.filter((r) => r.tier === tier);
  const reranked = pool.map((r, i) => ({ ...r, rank: i + 1 }));
  const me = reranked.find((r) => r.isCurrentUser);
  const total = reranked.length;

  return (
    <Link
      to="/leaderboard"
      className={cn(
        "group block rounded-lg border bg-gradient-to-r from-amber-50 via-background to-background p-3 transition-all hover:border-amber-400/60 hover:shadow-sm dark:from-amber-950/20",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
          {me ? <RankIcon rank={me.rank} /> : <Trophy className="h-5 w-5 text-amber-500" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Leaderboard
          </div>
          {me ? (
            <div className="truncate text-sm font-semibold">
              #{me.rank} of {total} · {formatPoints(me.totalPoints)} pts
            </div>
          ) : (
            <div className="truncate text-sm font-semibold">
              Join the leaderboard — complete a day to get on the board
            </div>
          )}
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
