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
  Video,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  Users,
  Play,
} from 'lucide-react';
import { useAdminVideoProgress, UserVideoStat } from '@/hooks/useAdminVideoProgress';
import { LoadingState } from '@/components/ui/LoadingState';

function formatWatchTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function CompletionBadge({ pct }: { pct: number }) {
  const variant =
    pct >= 80 ? 'default' : pct >= 40 ? 'secondary' : 'outline';
  return (
    <Badge variant={variant} className="tabular-nums">
      {pct}%
    </Badge>
  );
}

function UserProgressRow({ stat }: { stat: UserVideoStat }) {
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
              <CompletionBadge pct={stat.completion_percentage} />
              <Progress
                value={stat.completion_percentage}
                className="h-1.5 w-20"
              />
            </div>
          </TableCell>
          <TableCell className="text-center tabular-nums text-sm">
            <span className="text-green-600 dark:text-green-400 font-medium">
              {stat.completed_videos}
            </span>
            <span className="text-muted-foreground"> / {stat.total_videos}</span>
          </TableCell>
          <TableCell className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {formatWatchTime(stat.total_watch_time_seconds)}
            </div>
          </TableCell>
          <TableCell className="text-center text-xs text-muted-foreground">
            {formatDate(stat.last_activity)}
          </TableCell>
          <TableCell className="text-center text-xs text-muted-foreground">
            {stat.product_breakdown.length}
          </TableCell>
        </TableRow>
      </CollapsibleTrigger>

      <CollapsibleContent asChild>
        <TableRow className="bg-muted/20">
          <TableCell colSpan={6} className="py-0">
            <div className="py-3 px-6 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Product Breakdown
              </p>
              <div className="grid gap-2">
                {stat.product_breakdown.map(pb => (
                  <div
                    key={pb.product_id}
                    className="flex items-center gap-4 rounded-lg border bg-background px-4 py-2.5 text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-medium truncate block">
                        {pb.product_title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>
                        {pb.videos_completed}/{pb.videos_watched} videos
                      </span>
                    </div>
                    <div className="w-24 flex flex-col items-end gap-1 shrink-0">
                      <Progress value={pb.completion_percentage} className="h-1.5 w-20" />
                      <span className="text-xs text-muted-foreground">
                        {pb.completion_percentage}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="h-3 w-3" />
                      {formatWatchTime(pb.total_watch_time_seconds)}
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

export function VideoProgressPanel() {
  const { stats, loading, error, refetch } = useAdminVideoProgress();
  const [search, setSearch] = useState('');

  const filtered = stats.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.display_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  // Summary stats
  const totalUsers = stats.length;
  const totalWatchTime = stats.reduce((s, u) => s + u.total_watch_time_seconds, 0);
  const totalCompletions = stats.reduce((s, u) => s + u.completed_videos, 0);
  const avgCompletion =
    stats.length > 0
      ? Math.round(
          stats.reduce((s, u) => s + u.completion_percentage, 0) / stats.length
        )
      : 0;

  if (loading) return <LoadingState message="Loading video progress data..." />;

  if (error)
    return (
      <Card>
        <CardContent className="p-8 text-center text-destructive">
          {error}
        </CardContent>
      </Card>
    );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <div className="text-xs text-muted-foreground">Active Learners</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/50">
              <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalCompletions}</div>
              <div className="text-xs text-muted-foreground">Videos Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <Clock className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">{formatWatchTime(totalWatchTime)}</div>
              <div className="text-xs text-muted-foreground">Total Watch Time</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <div className="text-2xl font-bold">{avgCompletion}%</div>
              <div className="text-xs text-muted-foreground">Avg Completion</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                User Video Progress
              </CardTitle>
              <CardDescription>
                Click any row to see per-product breakdowns
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 w-56"
                />
              </div>
              <Button variant="outline" size="icon" onClick={refetch}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Play className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No video activity yet</p>
              <p className="text-sm mt-1">Users will appear here once they start watching videos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[240px]">User</TableHead>
                  <TableHead className="text-center">Completion</TableHead>
                  <TableHead className="text-center">Videos Done</TableHead>
                  <TableHead className="text-center">Watch Time</TableHead>
                  <TableHead className="text-center">Last Active</TableHead>
                  <TableHead className="text-center">Products</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(stat => (
                  <UserProgressRow key={stat.user_id} stat={stat} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
