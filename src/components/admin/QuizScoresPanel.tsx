import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Trophy,
  Users,
  TrendingUp,
  Brain,
} from 'lucide-react';
import { useAdminQuizScores, UserQuizStat } from '@/hooks/useAdminQuizScores';
import { LoadingState } from '@/components/ui/LoadingState';
import { useIsMobile } from '@/hooks/use-mobile';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function ScoreBadge({ pct }: { pct: number }) {
  const variant = pct >= 80 ? 'default' : pct >= 50 ? 'secondary' : 'outline';
  return (
    <Badge variant={variant} className="tabular-nums text-xs">
      {pct}%
    </Badge>
  );
}

function QuizProductRow({ pb }: { pb: import('@/hooks/useAdminQuizScores').QuizProductBreakdown }) {
  const isDormant = pb.attempts === 0;

  if (isDormant) {
    return (
      <div className="flex items-center gap-3 rounded-lg border bg-background/60 px-4 py-2 text-sm opacity-60">
        <div className="flex-1 min-w-[120px]">
          <span className="font-medium truncate block text-muted-foreground">{pb.product_title}</span>
        </div>
        <span className="text-xs italic text-muted-foreground">Not taken</span>
        {pb.study_total > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Trophy className="h-3 w-3 text-yellow-500" />
            <span>Mastery: {pb.mastered_count}/{pb.study_total}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-background px-4 py-2.5 text-sm">
      <div className="flex-1 min-w-[120px]">
        <span className="font-medium truncate block">{pb.product_title}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
        <Trophy className="h-3 w-3" />
        <span>Best: {pb.best_score}/{pb.best_total} ({pb.best_score_pct}%)</span>
      </div>
      {pb.study_total > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Trophy className="h-3 w-3 text-yellow-500" />
          <span>
            Mastery: {pb.mastered_count}/{pb.study_total} ({Math.round((pb.mastered_count / pb.study_total) * 100)}%)
          </span>
        </div>
      )}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <Progress value={pb.best_score_pct} className="h-1.5 w-20" />
        <span className="text-xs text-muted-foreground">Avg {pb.avg_score_pct}%</span>
      </div>
      <div className="text-xs text-muted-foreground shrink-0">
        {pb.attempts} attempt{pb.attempts !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

function QuizProductList({ breakdown }: { breakdown: import('@/hooks/useAdminQuizScores').QuizProductBreakdown[] }) {
  const attempted = breakdown.filter((pb) => pb.attempts > 0);
  const dormant = breakdown.filter((pb) => pb.attempts === 0);

  return (
    <div className="grid gap-2">
      {attempted.map((pb) => (
        <QuizProductRow key={pb.product_id} pb={pb} />
      ))}
      {attempted.length > 0 && dormant.length > 0 && (
        <div className="border-t mt-1 pt-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-1 pb-1">
            Not yet attempted ({dormant.length})
          </p>
        </div>
      )}
      {dormant.map((pb) => (
        <QuizProductRow key={pb.product_id} pb={pb} />
      ))}
    </div>
  );
}

function UserQuizMobileCard({ stat }: { stat: UserQuizStat }) {
  const [open, setOpen] = useState(false);
  const name = stat.display_name || stat.email || stat.user_id.slice(0, 8) + '…';
  const hasTaken = stat.has_taken_quiz;

  return (
    <Collapsible open={open} onOpenChange={hasTaken ? setOpen : undefined}>
      <CollapsibleTrigger asChild>
        <Card className={`${hasTaken ? 'cursor-pointer' : ''} active:scale-[0.99] transition-transform ${!hasTaken ? 'opacity-60' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{name}</div>
                {stat.email && stat.display_name && (
                  <div className="text-xs text-muted-foreground truncate">{stat.email}</div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {hasTaken ? (
                  <>
                    <ScoreBadge pct={stat.best_score_pct} />
                    {open ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground text-xs">Not taken</Badge>
                )}
              </div>
            </div>

            {hasTaken ? (
              <>
                <Progress value={stat.best_score_pct} className="h-1.5 mt-3 mb-3" />

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <div className="text-sm font-semibold">{stat.total_attempts}</div>
                    <div className="text-xs text-muted-foreground">Attempts</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{stat.avg_score_pct}%</div>
                    <div className="text-xs text-muted-foreground">Avg Score</div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-muted-foreground italic mt-2">Hasn't taken any exams yet</p>
            )}
          </CardContent>
        </Card>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mx-1 mb-2 rounded-b-lg border border-t-0 bg-muted/30 px-4 py-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Product Breakdown
          </p>
          {(() => {
            const attempted = stat.product_breakdown.filter(pb => pb.attempts > 0);
            const dormant = stat.product_breakdown.filter(pb => pb.attempts === 0);
            return (
              <>
                {attempted.map(pb => (
                  <div key={pb.product_id} className="rounded-lg border bg-background p-3 text-sm">
                    <div className="font-medium mb-2 truncate">{pb.product_title}</div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Trophy className="h-3 w-3" />
                        Best: {pb.best_score}/{pb.best_total} ({pb.best_score_pct}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Progress value={pb.best_score_pct} className="h-1.5 flex-1" />
                      <span className="text-xs text-muted-foreground w-16 text-right">
                        {pb.attempts} attempt{pb.attempts !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {pb.study_total > 0 && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-yellow-500" />
                        Mastery: {pb.mastered_count}/{pb.study_total} ({Math.round((pb.mastered_count / pb.study_total) * 100)}%)
                      </div>
                    )}
                  </div>
                ))}
                {attempted.length > 0 && dormant.length > 0 && (
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide pt-2 pb-1">
                    Not yet attempted ({dormant.length})
                  </p>
                )}
                {dormant.map(pb => (
                  <div key={pb.product_id} className="rounded-lg border bg-background/60 p-3 text-sm opacity-60">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate text-muted-foreground">{pb.product_title}</span>
                      <span className="text-xs italic text-muted-foreground shrink-0">Not taken</span>
                    </div>
                    {pb.study_total > 0 && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Trophy className="h-3 w-3 text-yellow-500" />
                        Mastery: {pb.mastered_count}/{pb.study_total}
                      </div>
                    )}
                  </div>
                ))}
              </>
            );
          })()}
          <p className="text-xs text-muted-foreground pt-1">
            Last attempt: {formatDate(stat.last_attempt)}
          </p>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function UserQuizRow({ stat }: { stat: UserQuizStat }) {
  const [open, setOpen] = useState(false);
  const name = stat.display_name || stat.email || stat.user_id.slice(0, 8) + '…';
  const hasTaken = stat.has_taken_quiz;

  return (
    <Collapsible open={open} onOpenChange={hasTaken ? setOpen : undefined}>
      <CollapsibleTrigger asChild>
        <TableRow className={`${hasTaken ? 'cursor-pointer' : ''} hover:bg-muted/50 group ${!hasTaken ? 'opacity-60' : ''}`}>
          <TableCell className="font-medium">
            <div className="flex items-center gap-2">
              {hasTaken ? (
                open ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )
              ) : (
                <div className="w-4 shrink-0" />
              )}
              <div>
                <div className="font-medium text-sm">{name}</div>
                {stat.email && stat.display_name && (
                  <div className="text-xs text-muted-foreground">{stat.email}</div>
                )}
              </div>
            </div>
          </TableCell>
          <TableCell className="text-center">
            {hasTaken ? (
              <div className="flex flex-col items-center gap-1">
                <ScoreBadge pct={stat.best_score_pct} />
                <Progress value={stat.best_score_pct} className="h-1.5 w-20" />
              </div>
            ) : (
              <Badge variant="outline" className="text-muted-foreground text-xs">Not taken</Badge>
            )}
          </TableCell>
          <TableCell className="text-center tabular-nums text-sm">
            {hasTaken ? `${stat.avg_score_pct}%` : <span className="text-muted-foreground">—</span>}
          </TableCell>
          <TableCell className="text-center tabular-nums text-sm">
            {hasTaken ? stat.total_attempts : <span className="text-muted-foreground">—</span>}
          </TableCell>
          <TableCell className="text-center text-xs text-muted-foreground">
            {hasTaken ? formatDate(stat.last_attempt) : 'Never'}
          </TableCell>
        </TableRow>
      </CollapsibleTrigger>

      <CollapsibleContent asChild>
        <TableRow className="bg-muted/20">
          <TableCell colSpan={5} className="py-0">
            <div className="py-3 px-6 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Product Breakdown
              </p>
              <QuizProductList breakdown={stat.product_breakdown} />
            </div>
          </TableCell>
        </TableRow>
      </CollapsibleContent>
    </Collapsible>
  );
}

type QuizStatusFilter = 'all' | 'taken' | 'not-taken';

export function QuizScoresPanel() {
  const { stats, loading, error, refetch } = useAdminQuizScores();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuizStatusFilter>('all');
  const isMobile = useIsMobile();

  const filtered = stats.filter(s => {
    if (statusFilter === 'taken' && !s.has_taken_quiz) return false;
    if (statusFilter === 'not-taken' && s.has_taken_quiz) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.display_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  const takenStats = stats.filter(s => s.has_taken_quiz);
  const totalUsers = stats.length;
  const quizTakers = takenStats.length;
  const notTaken = totalUsers - quizTakers;
  const totalAttempts = stats.reduce((s, u) => s + u.total_attempts, 0);
  const avgBest =
    takenStats.length > 0
      ? Math.round(takenStats.reduce((s, u) => s + u.best_score_pct, 0) / takenStats.length)
      : 0;

  if (loading) return <LoadingState message="Loading quiz score data..." />;

  if (error)
    return (
      <Card>
        <CardContent className="p-8 text-center text-destructive">{error}</CardContent>
      </Card>
    );

  const filterTabs: Array<{ key: QuizStatusFilter; label: string; count: number }> = [
    { key: 'all', label: 'All', count: totalUsers },
    { key: 'taken', label: 'Taken', count: quizTakers },
    { key: 'not-taken', label: 'Not Taken', count: notTaken },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="!p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Quiz Takers</span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tabular-nums">{quizTakers}</span>
              <span className="text-xs text-muted-foreground">of {totalUsers}</span>
            </div>
            <Progress
              value={totalUsers > 0 ? (quizTakers / totalUsers) * 100 : 0}
              className="h-1"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="!p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Not Taken</span>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tabular-nums">{notTaken}</span>
              <span className="text-xs text-muted-foreground">users</span>
            </div>
            <div className="h-1" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="!p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Attempts</span>
              <Brain className="h-4 w-4 text-accent-foreground" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tabular-nums">{totalAttempts}</span>
              <span className="text-xs text-muted-foreground">across all exams</span>
            </div>
            <div className="h-1" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="!p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Avg Best Score</span>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tabular-nums">{avgBest}%</span>
              <span className="text-xs text-muted-foreground">for takers</span>
            </div>
            <Progress value={avgBest} className="h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-lg">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              statusFilter === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            <span className={`ml-0.5 tabular-nums text-[10px] px-1.5 py-0.5 rounded-full ${
              statusFilter === tab.key ? 'bg-muted' : 'bg-background'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Refresh */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon" onClick={refetch} className="shrink-0">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Content area */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Brain className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No users match your filter</p>
            <p className="text-sm mt-1">
              {search || statusFilter !== 'all'
                ? 'Try clearing filters or adjusting search'
                : 'Users will appear here once they register'}
            </p>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground px-1">
            {filtered.length} user{filtered.length !== 1 ? 's' : ''} · tap to expand
          </p>
          {filtered.map(stat => (
            <UserQuizMobileCard key={stat.user_id} stat={stat} />
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-5 w-5" />
              Quiz Scores
            </CardTitle>
            <CardDescription>Click any row to see per-product breakdowns</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[240px]">User</TableHead>
                  <TableHead className="text-center">Best Score</TableHead>
                  <TableHead className="text-center">Avg Score</TableHead>
                  <TableHead className="text-center">Attempts</TableHead>
                  <TableHead className="text-center">Last Attempt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(stat => (
                  <UserQuizRow key={stat.user_id} stat={stat} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
