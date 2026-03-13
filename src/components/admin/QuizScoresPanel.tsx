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

function UserQuizMobileCard({ stat }: { stat: UserQuizStat }) {
  const [open, setOpen] = useState(false);
  const name = stat.display_name || stat.email || stat.user_id.slice(0, 8) + '…';

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Card className="cursor-pointer active:scale-[0.99] transition-transform">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{name}</div>
                {stat.email && stat.display_name && (
                  <div className="text-xs text-muted-foreground truncate">{stat.email}</div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ScoreBadge pct={stat.best_score_pct} />
                {open ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>

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
          </CardContent>
        </Card>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mx-1 mb-2 rounded-b-lg border border-t-0 bg-muted/30 px-4 py-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Product Breakdown
          </p>
          {stat.product_breakdown.map(pb => (
            <div key={pb.product_id} className="rounded-lg border bg-background p-3 text-sm">
              <div className="font-medium mb-2 truncate">{pb.product_title}</div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  Best: {pb.best_score}/{pb.best_total} ({pb.best_score_pct}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={pb.best_score_pct} className="h-1.5 flex-1" />
                <span className="text-xs text-muted-foreground w-16 text-right">
                  {pb.attempts} attempt{pb.attempts !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
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

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <TableRow className="cursor-pointer hover:bg-muted/50 group">
          <TableCell className="font-medium">
            <div className="flex items-center gap-2">
              {open ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
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
            <div className="flex flex-col items-center gap-1">
              <ScoreBadge pct={stat.best_score_pct} />
              <Progress value={stat.best_score_pct} className="h-1.5 w-20" />
            </div>
          </TableCell>
          <TableCell className="text-center tabular-nums text-sm">
            {stat.avg_score_pct}%
          </TableCell>
          <TableCell className="text-center tabular-nums text-sm">
            {stat.total_attempts}
          </TableCell>
          <TableCell className="text-center text-xs text-muted-foreground">
            {formatDate(stat.last_attempt)}
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
              <div className="grid gap-2">
                {stat.product_breakdown.map(pb => (
                  <div
                    key={pb.product_id}
                    className="flex flex-wrap items-center gap-3 rounded-lg border bg-background px-4 py-2.5 text-sm"
                  >
                    <div className="flex-1 min-w-[120px]">
                      <span className="font-medium truncate block">{pb.product_title}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Trophy className="h-3 w-3" />
                      <span>Best: {pb.best_score}/{pb.best_total} ({pb.best_score_pct}%)</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Progress value={pb.best_score_pct} className="h-1.5 w-20" />
                      <span className="text-xs text-muted-foreground">Avg {pb.avg_score_pct}%</span>
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {pb.attempts} attempt{pb.attempts !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TableCell>
        </TableRow>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function QuizScoresPanel() {
  const { stats, loading, error, refetch } = useAdminQuizScores();
  const [search, setSearch] = useState('');
  const isMobile = useIsMobile();

  const filtered = stats.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.display_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  const totalUsers = stats.length;
  const totalAttempts = stats.reduce((s, u) => s + u.total_attempts, 0);
  const avgBest =
    stats.length > 0
      ? Math.round(stats.reduce((s, u) => s + u.best_score_pct, 0) / stats.length)
      : 0;

  if (loading) return <LoadingState message="Loading quiz score data..." />;

  if (error)
    return (
      <Card>
        <CardContent className="p-8 text-center text-destructive">{error}</CardContent>
      </Card>
    );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold">{totalUsers}</div>
              <div className="text-xs text-muted-foreground">Quiz Takers</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/50 shrink-0">
              <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold">{totalAttempts}</div>
              <div className="text-xs text-muted-foreground">Total Attempts</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-bold">{avgBest}%</div>
              <div className="text-xs text-muted-foreground">Avg Best Score</div>
            </div>
          </CardContent>
        </Card>
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
            <p className="font-medium">No quiz attempts yet</p>
            <p className="text-sm mt-1">Users will appear here once they complete a product exam</p>
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
