import { useState, useMemo } from 'react';
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
  AlertTriangle,
  Users,
  BookOpen,
  TrendingUp,
  Trophy,
  ChevronDown,
  ChevronRight,
  Activity,
  UserX,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminStudyProgress, type UserStudyStat, type StudyProductBreakdown } from '@/hooks/useAdminStudyProgress';
import { LoadingState } from '@/components/ui/LoadingState';
import { useIsMobile } from '@/hooks/use-mobile';
import { PRODUCT_LABELS } from '@/types/questionBank';

const AT_RISK_INACTIVITY_DAYS = 14;

type SortField = 'name' | 'mastery' | 'last-activity';
type StatusFilter = 'active' | 'at-risk' | 'not-started' | 'all';

type UserStatus = 'active' | 'at-risk' | 'not-started';

function getUserStatus(stat: UserStudyStat): UserStatus {
  if (!stat.has_studied) return 'not-started';
  const daysSince = stat.last_studied
    ? (Date.now() - new Date(stat.last_studied).getTime()) / (1000 * 60 * 60 * 24)
    : Infinity;
  if (daysSince > AT_RISK_INACTIVITY_DAYS || stat.mastery_pct < 50) return 'at-risk';
  return 'active';
}

function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'Never';
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' });
}

function StatusDot({ status }: { status: UserStatus }) {
  const colors = {
    active: 'bg-emerald-500',
    'at-risk': 'bg-amber-500',
    'not-started': 'bg-muted-foreground/30',
  };
  return <div className={cn('h-2 w-2 rounded-full shrink-0', colors[status])} />;
}

function StatusBadge({ status }: { status: UserStatus }) {
  if (status === 'active') {
    return (
      <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </Badge>
    );
  }
  if (status === 'at-risk') {
    return (
      <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 gap-1">
        <AlertTriangle className="h-3 w-3" />
        At Risk
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-muted-foreground gap-1">
      <Clock className="h-3 w-3" />
      Not started
    </Badge>
  );
}

function masteryColor(pct: number): string {
  if (pct >= 80) return 'bg-emerald-500';
  if (pct >= 50) return 'bg-blue-500';
  if (pct >= 25) return 'bg-amber-500';
  return 'bg-rose-500';
}

function MasteryBar({ pct, className }: { pct: number; className?: string }) {
  return (
    <div className={cn('relative h-1.5 w-full rounded-full bg-muted overflow-hidden', className)}>
      <div
        className={cn('absolute inset-y-0 left-0 rounded-full transition-all', masteryColor(pct))}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ProductBreakdownList({ breakdown }: { breakdown: StudyProductBreakdown[] }) {
  const touched = breakdown.filter((pb) => pb.last_studied !== null);
  const dormant = breakdown.filter((pb) => pb.last_studied === null);

  return (
    <>
      {touched.map((pb) => (
        <ProductBreakdownRow key={pb.product_slug} pb={pb} />
      ))}
      {touched.length > 0 && dormant.length > 0 && (
        <div className="border-t my-1 pt-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-1 py-1">
            Not yet started ({dormant.length})
          </p>
        </div>
      )}
      {dormant.map((pb) => (
        <ProductBreakdownRow key={pb.product_slug} pb={pb} />
      ))}
    </>
  );
}

function ProductBreakdownRow({ pb }: { pb: StudyProductBreakdown }) {
  const label = PRODUCT_LABELS[pb.product_slug] ?? pb.product_slug;
  const isDormant = pb.last_studied === null;

  if (isDormant) {
    return (
      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-1.5 text-xs opacity-60">
        <div className="font-medium truncate text-muted-foreground">{label}</div>
        <div className="w-[160px] text-right">
          <span className="text-[11px] italic text-muted-foreground">Not started</span>
        </div>
        <div className="text-muted-foreground tabular-nums text-[11px] w-16 text-right">—</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-1.5 text-xs">
      <div className="font-medium truncate">{label}</div>
      <div className="flex items-center gap-2 w-[160px]">
        <MasteryBar pct={pb.mastery_pct} />
        <span className="tabular-nums text-muted-foreground w-12 text-right">
          {pb.mastered_count}/{pb.study_total}
        </span>
      </div>
      <div className="text-muted-foreground tabular-nums text-[11px] w-16 text-right">
        {formatRelativeTime(pb.last_studied)}
      </div>
    </div>
  );
}

function UserRow({ stat }: { stat: UserStudyStat }) {
  const [open, setOpen] = useState(false);
  const status = getUserStatus(stat);
  const name = stat.display_name || stat.email?.split('@')[0] || stat.user_id.slice(0, 8);

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <>
        <CollapsibleTrigger asChild>
          <TableRow className={cn('cursor-pointer hover:bg-muted/50 transition-colors', !stat.has_studied && 'opacity-60')}>
            <TableCell className="w-[40px] pl-3 pr-0">
              <div className="flex items-center gap-2">
                {stat.has_studied ? (
                  open ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )
                ) : (
                  <div className="w-4" />
                )}
                <StatusDot status={status} />
              </div>
            </TableCell>
            <TableCell className="font-medium">
              <div>
                <div className="text-sm">{name}</div>
                {stat.email && stat.display_name && (
                  <div className="text-xs text-muted-foreground font-normal">{stat.email}</div>
                )}
              </div>
            </TableCell>
            <TableCell className="w-[280px]">
              {stat.has_studied ? (
                <div className="flex items-center gap-2">
                  <MasteryBar pct={stat.mastery_pct} className="flex-1" />
                  <span className="text-xs font-semibold tabular-nums w-10 text-right">{stat.mastery_pct}%</span>
                  <span className="text-[11px] text-muted-foreground tabular-nums w-12 text-right">
                    {stat.total_mastered}/{stat.total_questions}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground italic">No progress yet</span>
              )}
            </TableCell>
            <TableCell className="text-center tabular-nums text-sm">
              {stat.has_studied ? stat.product_breakdown.filter(pb => pb.last_studied !== null).length : '—'}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground tabular-nums">
              {formatRelativeTime(stat.last_studied)}
            </TableCell>
            <TableCell>
              <StatusBadge status={status} />
            </TableCell>
          </TableRow>
        </CollapsibleTrigger>

        <CollapsibleContent asChild>
          <TableRow className="bg-muted/20 hover:bg-muted/20">
            <TableCell colSpan={6} className="py-0">
              <div className="px-4 py-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Per-product progress
                </p>
                <div className="rounded-lg border bg-background p-2">
                  <ProductBreakdownList breakdown={stat.product_breakdown} />
                </div>
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
}

function UserMobileCard({ stat }: { stat: UserStudyStat }) {
  const [open, setOpen] = useState(false);
  const status = getUserStatus(stat);
  const name = stat.display_name || stat.email?.split('@')[0] || stat.user_id.slice(0, 8);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Card className={cn('cursor-pointer active:scale-[0.99] transition-transform', !stat.has_studied && 'opacity-60')}>
          <CardContent className="p-3">
            <div className="flex items-start gap-2 mb-2">
              <StatusDot status={status} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{name}</div>
                {stat.email && stat.display_name && (
                  <div className="text-xs text-muted-foreground truncate">{stat.email}</div>
                )}
              </div>
              <StatusBadge status={status} />
            </div>

            {stat.has_studied ? (
              <>
                <div className="flex items-center gap-2 mb-1.5">
                  <MasteryBar pct={stat.mastery_pct} className="flex-1" />
                  <span className="text-xs font-semibold tabular-nums w-10 text-right">{stat.mastery_pct}%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{stat.total_mastered}/{stat.total_questions} mastered · {stat.product_breakdown.filter(pb => pb.last_studied !== null).length} product{stat.product_breakdown.filter(pb => pb.last_studied !== null).length !== 1 ? 's' : ''}</span>
                  <span>{formatRelativeTime(stat.last_studied)}</span>
                </div>
              </>
            ) : (
              <div className="text-xs text-muted-foreground italic">Hasn't started studying yet</div>
            )}
          </CardContent>
        </Card>
      </CollapsibleTrigger>

      {stat.has_studied && (
        <CollapsibleContent>
          <div className="mx-1 mb-2 rounded-b-lg border border-t-0 bg-muted/30 px-3 py-2 space-y-0.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Per-product
            </p>
            <ProductBreakdownList breakdown={stat.product_breakdown} />
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}

export function StudyProgressPanel() {
  const { stats, loading, error, refetch } = useAdminStudyProgress();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('last-activity');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const isMobile = useIsMobile();

  // Compute per-user status
  const statsWithStatus = useMemo(() => {
    return stats.map((stat) => ({ ...stat, status: getUserStatus(stat) }));
  }, [stats]);

  // Summary metrics
  const summary = useMemo(() => {
    const total = statsWithStatus.length;
    const active = statsWithStatus.filter((s) => s.status === 'active').length;
    const atRisk = statsWithStatus.filter((s) => s.status === 'at-risk').length;
    const notStarted = statsWithStatus.filter((s) => s.status === 'not-started').length;
    const studiedStats = statsWithStatus.filter((s) => s.has_studied);
    const avgMasteryActive = studiedStats.length > 0
      ? Math.round(studiedStats.reduce((s, d) => s + d.mastery_pct, 0) / studiedStats.length)
      : 0;
    const totalMasteredAcross = statsWithStatus.reduce((s, d) => s + d.total_mastered, 0);
    return { total, active, atRisk, notStarted, avgMasteryActive, totalMasteredAcross };
  }, [statsWithStatus]);

  // Per-product engagement: average mastery across users who studied it
  const productEngagement = useMemo(() => {
    const byProduct = new Map<string, { masteredSum: number; totalSum: number; learners: number; lastStudied: string | null }>();
    for (const stat of statsWithStatus) {
      for (const pb of stat.product_breakdown) {
        if (!byProduct.has(pb.product_slug)) {
          byProduct.set(pb.product_slug, { masteredSum: 0, totalSum: 0, learners: 0, lastStudied: null });
        }
        const entry = byProduct.get(pb.product_slug)!;
        entry.masteredSum += pb.mastered_count;
        entry.totalSum += pb.study_total;
        entry.learners += 1;
        if (pb.last_studied && (!entry.lastStudied || pb.last_studied > entry.lastStudied)) {
          entry.lastStudied = pb.last_studied;
        }
      }
    }
    return Array.from(byProduct.entries())
      .map(([slug, data]) => ({
        slug,
        label: PRODUCT_LABELS[slug] ?? slug,
        avgMastery: data.totalSum > 0 ? Math.round((data.masteredSum / data.totalSum) * 100) : 0,
        learners: data.learners,
        lastStudied: data.lastStudied,
      }))
      .sort((a, b) => b.learners - a.learners);
  }, [statsWithStatus]);

  // Top performers leaderboard
  const topPerformers = useMemo(() => {
    return statsWithStatus
      .filter((s) => s.has_studied)
      .sort((a, b) => b.mastery_pct - a.mastery_pct)
      .slice(0, 3);
  }, [statsWithStatus]);

  // Filtered & sorted user list
  const filtered = useMemo(() => {
    let result = statsWithStatus.filter((d) => {
      const q = search.toLowerCase();
      const name = d.display_name || d.email?.split('@')[0] || d.user_id;
      if (search && !name.toLowerCase().includes(q) && !d.email?.toLowerCase().includes(q)) {
        return false;
      }
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'name') {
        const an = a.display_name || a.email || '';
        const bn = b.display_name || b.email || '';
        return an.localeCompare(bn);
      }
      if (sortBy === 'mastery') return b.mastery_pct - a.mastery_pct;
      if (sortBy === 'last-activity') {
        const aTime = a.last_studied ? new Date(a.last_studied).getTime() : 0;
        const bTime = b.last_studied ? new Date(b.last_studied).getTime() : 0;
        return bTime - aTime;
      }
      return 0;
    });

    return result;
  }, [statsWithStatus, search, statusFilter, sortBy]);

  if (loading) return <LoadingState message="Loading study progress..." />;

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-destructive">{error}</CardContent>
      </Card>
    );
  }

  const filterTabs: Array<{ key: StatusFilter; label: string; count: number; icon: React.ElementType }> = [
    { key: 'all', label: 'All', count: summary.total, icon: Users },
    { key: 'active', label: 'Active', count: summary.active, icon: Activity },
    { key: 'at-risk', label: 'At Risk', count: summary.atRisk, icon: AlertTriangle },
    { key: 'not-started', label: 'Not Started', count: summary.notStarted, icon: UserX },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="!p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Active Learners</span>
              <Activity className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tabular-nums">{summary.active}</span>
              <span className="text-xs text-muted-foreground">of {summary.total}</span>
            </div>
            <Progress
              value={summary.total > 0 ? (summary.active / summary.total) * 100 : 0}
              className="h-1"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="!p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Avg Mastery</span>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tabular-nums">{summary.avgMasteryActive}%</span>
              <span className="text-xs text-muted-foreground">for active users</span>
            </div>
            <MasteryBar pct={summary.avgMasteryActive} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="!p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Questions Mastered</span>
              <Trophy className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tabular-nums">{summary.totalMasteredAcross}</span>
              <span className="text-xs text-muted-foreground">across all users</span>
            </div>
            <div className="h-1" />
          </CardContent>
        </Card>

        <Card className={summary.atRisk > 0 ? 'border-amber-200 dark:border-amber-900' : ''}>
          <CardContent className="!p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Need Attention</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tabular-nums">{summary.atRisk}</span>
              <span className="text-xs text-muted-foreground">at risk</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Low mastery or inactive {AT_RISK_INACTIVITY_DAYS}+ days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two-column: Product engagement + Top performers */}
      {productEngagement.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Engagement by Product
              </CardTitle>
              <CardDescription className="text-xs">
                Average mastery % across users who've studied each product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {productEngagement.map((p) => (
                <div key={p.slug} className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium truncate">{p.label}</span>
                      <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                        {p.learners} learner{p.learners !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MasteryBar pct={p.avgMastery} className="flex-1" />
                      <span className="text-xs font-semibold tabular-nums w-10 text-right">{p.avgMastery}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Top Performers
              </CardTitle>
              <CardDescription className="text-xs">Highest mastery %</CardDescription>
            </CardHeader>
            <CardContent>
              {topPerformers.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No learners yet</p>
              ) : (
                <div className="space-y-2">
                  {topPerformers.map((stat, idx) => {
                    const name = stat.display_name || stat.email?.split('@')[0] || stat.user_id.slice(0, 8);
                    const medals = ['🥇', '🥈', '🥉'];
                    return (
                      <div key={stat.user_id} className="flex items-center gap-2 text-xs">
                        <span className="shrink-0 w-5 text-center">{medals[idx]}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{name}</div>
                          <MasteryBar pct={stat.mastery_pct} className="mt-1" />
                        </div>
                        <span className="font-semibold tabular-nums shrink-0 w-10 text-right">
                          {stat.mastery_pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter tabs + search + sort */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1 p-1 bg-muted/50 rounded-lg">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                statusFilter === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
              <span className={cn(
                'ml-0.5 tabular-nums text-[10px] px-1.5 py-0.5 rounded-full',
                statusFilter === tab.key ? 'bg-muted' : 'bg-background'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="rounded-md border border-input bg-background pl-3 pr-8 py-2 text-sm min-h-[40px] focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="last-activity">Sort: Last Activity</option>
              <option value="mastery">Sort: Mastery %</option>
              <option value="name">Sort: Name</option>
            </select>
            <Button variant="outline" size="icon" onClick={refetch} className="shrink-0" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* User list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No users match your filter</p>
            <p className="text-sm mt-1">
              {search || statusFilter !== 'all'
                ? 'Try clearing filters or adjusting search'
                : 'Users will appear here once they start studying'}
            </p>
          </CardContent>
        </Card>
      ) : isMobile ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground px-1">
            Showing {filtered.length} user{filtered.length !== 1 ? 's' : ''} · tap to expand
          </p>
          {filtered.map((stat) => (
            <UserMobileCard key={stat.user_id} stat={stat} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] pl-3 pr-0"></TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="w-[280px]">Mastery</TableHead>
                  <TableHead className="text-center">Products</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((stat) => (
                  <UserRow key={stat.user_id} stat={stat} />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
