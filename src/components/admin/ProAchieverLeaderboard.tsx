import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal, Award, RefreshCw, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminQuizScores } from '@/hooks/useAdminQuizScores';
import { LoadingState } from '@/components/ui/LoadingState';
import { cn } from '@/lib/utils';

const PRODUCT_ID = 'pro-achiever';
const TOTAL_QUESTIONS = 36; // current exam length

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function gradeLabel(pct: number) {
  if (pct === 100) return { text: 'Perfect', color: 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' };
  if (pct >= 80)  return { text: 'Excellent', color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800' };
  if (pct >= 60)  return { text: 'Good', color: 'text-primary bg-primary/5 border-primary/20' };
  if (pct >= 40)  return { text: 'Practising', color: 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' };
  return           { text: 'Needs Work', color: 'text-destructive bg-destructive/5 border-destructive/20' };
}

const RANK_ICONS = [
  <Trophy key={0} className="h-5 w-5 text-yellow-500" />,
  <Medal  key={1} className="h-5 w-5 text-slate-400" />,
  <Award  key={2} className="h-5 w-5 text-amber-600" />,
];

export function ProAchieverLeaderboard() {
  const { stats, loading, error, refetch } = useAdminQuizScores();

  const leaderboard = useMemo(() => {
    return stats
      .map(u => {
        const pb = u.product_breakdown.find(p => p.product_id === PRODUCT_ID);
        if (!pb) return null;
        return {
          user_id: u.user_id,
          name: u.display_name || u.email || u.user_id.slice(0, 8) + '…',
          email: u.email,
          best_score: pb.best_score,
          best_total: pb.best_total,
          best_score_pct: pb.best_score_pct,
          avg_score_pct: pb.avg_score_pct,
          attempts: pb.attempts,
          xp_earned: pb.total_xp_earned,
          last_attempt: pb.last_attempt,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (b!.best_score_pct !== a!.best_score_pct) return b!.best_score_pct - a!.best_score_pct;
        return (b!.avg_score_pct ?? 0) - (a!.avg_score_pct ?? 0);
      }) as {
        user_id: string; name: string; email: string | null;
        best_score: number; best_total: number; best_score_pct: number;
        avg_score_pct: number; attempts: number; xp_earned: number; last_attempt: string | null;
      }[];
  }, [stats]);

  if (loading) return <LoadingState message="Loading leaderboard…" />;
  if (error) return (
    <Card><CardContent className="p-8 text-center text-destructive">{error}</CardContent></Card>
  );

  const topScore = leaderboard[0]?.best_score_pct ?? 0;
  const totalTakers = leaderboard.length;
  const passCount = leaderboard.filter(u => u.best_score_pct >= 60).length;
  const avgBest = totalTakers > 0
    ? Math.round(leaderboard.reduce((s, u) => s + u.best_score_pct, 0) / totalTakers)
    : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Pro Achiever 3.0 — Exam Leaderboard
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ranked by best score · {TOTAL_QUESTIONS} questions
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="gap-1.5 text-xs h-8">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Takers', value: totalTakers },
          { label: 'Avg Best Score', value: `${avgBest}%` },
          { label: 'Pass Rate (≥60%)', value: totalTakers ? `${Math.round((passCount / totalTakers) * 100)}%` : '—' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold">{s.value}</div>
              <div className="text-[11px] text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leaderboard */}
      {leaderboard.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No Pro Achiever exam attempts yet</p>
            <p className="text-sm mt-1">Scores will appear here once advisors complete the exam</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3 px-4 sm:px-6">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <div className="divide-y divide-border">
              {leaderboard.map((entry, idx) => {
                const grade = gradeLabel(entry.best_score_pct);
                const isTop3 = idx < 3;
                return (
                  <div
                    key={entry.user_id}
                    className={cn(
                      'flex items-center gap-3 px-4 sm:px-6 py-3',
                      idx === 0 && 'bg-yellow-50/50 dark:bg-yellow-900/10',
                    )}
                  >
                    {/* Rank */}
                    <div className="w-7 shrink-0 flex justify-center">
                      {isTop3 ? RANK_ICONS[idx] : (
                        <span className="text-sm font-bold text-muted-foreground tabular-nums">
                          {idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Name + email */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={cn("font-medium text-sm truncate", idx === 0 && "text-yellow-700 dark:text-yellow-400")}>
                          {entry.name}
                        </span>
                        {entry.best_score_pct === 100 && (
                          <Star className="h-3.5 w-3.5 text-yellow-500 shrink-0" fill="currentColor" />
                        )}
                      </div>
                      {entry.email && entry.name !== entry.email && (
                        <div className="text-[11px] text-muted-foreground truncate">{entry.email}</div>
                      )}
                    </div>

                    {/* Score bar */}
                    <div className="hidden sm:flex flex-col gap-1 w-28 shrink-0">
                      <Progress value={entry.best_score_pct} className="h-1.5" />
                      <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>Avg {entry.avg_score_pct}%</span>
                        <span>{entry.attempts} try{entry.attempts !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Score badge */}
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <Badge variant="outline" className={cn('text-xs font-semibold border', grade.color)}>
                        {entry.best_score_pct}%
                      </Badge>
                      <span className="text-[10px] text-muted-foreground hidden sm:block">
                        {entry.best_score}/{entry.best_total} · {formatDate(entry.last_attempt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
