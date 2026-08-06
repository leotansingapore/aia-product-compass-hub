import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Loader2,
  Users,
  Activity,
  AlertTriangle,
  Gauge,
  Trophy,
  ClipboardList,
  FileCheck2,
  CalendarCheck,
  Brain,
  MessageCircle,
  GraduationCap,
  Shield,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePermissions } from "@/hooks/usePermissions";
import { TIER_META, type TierLevel } from "@/lib/tiers";
import {
  useTeamProgress,
  useCoreVideoCatalog,
  type TeamProgressRow,
} from "@/hooks/useTeamProgress";
import {
  TeamMemberDetail,
  useAssignmentDefs,
} from "@/components/team-progress/TeamMemberDetail";
import { TOTAL_DAYS as F14_TOTAL } from "@/features/first-14-days/summaries";
import { TOTAL_DAYS as F60_TOTAL } from "@/features/first-60-days/summaries";
import { TOTAL_DAYS as N60_TOTAL } from "@/features/next-60-days/summaries";
import { TOTAL_DAYS as PM_TOTAL } from "@/features/product-mastery-track/summaries";

const SCOPED_TIERS: readonly TierLevel[] = ["explorer", "papers_taker", "post_rnf"];

const QUICK_LINKS: readonly { label: string; to: string; icon: typeof Trophy }[] = [
  { label: "Leaderboard", to: "/leaderboard", icon: Trophy },
  { label: "Assignment Tracker", to: "/leaderboard/tracker", icon: ClipboardList },
  { label: "Assignment Submissions", to: "/learning-track/admin/assignments", icon: FileCheck2 },
  { label: "First 14 Days", to: "/learning-track/admin/first-14-days", icon: CalendarCheck },
  { label: "First 60 Days", to: "/learning-track/admin/first-60-days", icon: CalendarCheck },
  { label: "Question Banks", to: "/learning-track/admin/question-banks", icon: Brain },
  { label: "Roleplay", to: "/learning-track/admin/roleplay", icon: MessageCircle },
  { label: "CMFAS Exams", to: "/cmfas-exams/manage", icon: GraduationCap },
  { label: "Admin Panel", to: "/admin", icon: Shield },
];

type SortKey = "lastActive" | "overall" | "points" | "name";

type Denominators = {
  f14: number;
  f60: number;
  n60: number;
  pm: number;
  assignments: number;
  videos: number;
};

type ComputedRow = TeamProgressRow & {
  doneTotal: number;
  itemTotal: number;
  overallPct: number;
};

function daysSince(iso: string | null): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY;
  return Math.floor((Date.now() - then) / 86_400_000);
}

function staleLabel(iso: string | null): string {
  const d = daysSince(iso);
  if (!Number.isFinite(d)) return "never";
  if (d === 0) return "today";
  if (d === 1) return "yesterday";
  return `${d} days ago`;
}

function compute(row: TeamProgressRow, den: Denominators): ComputedRow {
  const doneTotal =
    Math.min(row.f14Done, den.f14) +
    Math.min(row.f60Done, den.f60) +
    Math.min(row.n60Done, den.n60) +
    Math.min(row.pmDone, den.pm) +
    Math.min(row.assignmentsDone, den.assignments) +
    Math.min(row.videosDone, den.videos);
  const itemTotal = den.f14 + den.f60 + den.n60 + den.pm + den.assignments + den.videos;
  return {
    ...row,
    doneTotal,
    itemTotal,
    overallPct: itemTotal > 0 ? Math.round((doneTotal / itemTotal) * 100) : 0,
  };
}

function CountCell({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((Math.min(done, total) / total) * 100) : 0;
  return (
    <div className="min-w-[52px]">
      <div
        className={cn(
          "text-xs tabular-nums",
          done >= total && total > 0
            ? "font-semibold text-emerald-600 dark:text-emerald-400"
            : done > 0
              ? "text-foreground"
              : "text-muted-foreground/60",
        )}
      >
        {done}/{total}
      </div>
      <Progress value={pct} className="mt-0.5 h-1 w-12" />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  tone?: "warn";
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3.5">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            tone === "warn"
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0">
          <div className="text-lg font-bold leading-tight tabular-nums">{value}</div>
          <div className="truncate text-[11px] text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
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
      <ArrowUpDown
        className={cn("ml-1 h-3 w-3 transition-transform", active && dir === "asc" && "rotate-180")}
      />
    </Button>
  );
}

/**
 * Manager/leader command centre: one row per consultant with their completion
 * counts across every tracked dimension (day tracks, assignments, Core
 * Products videos, question bank), stale-learner flagging, and a full
 * per-consultant drill-down. Consolidates the scattered admin surfaces —
 * leaderboard, assignment tracker, per-track admin tabs — behind one page.
 */
export default function TeamProgress() {
  const { isAdmin, isMasterAdmin } = usePermissions();
  const admin = isAdmin() || isMasterAdmin();
  const isMobile = useIsMobile();

  const teamQuery = useTeamProgress(admin);
  const catalogQuery = useCoreVideoCatalog(admin);
  const defsQuery = useAssignmentDefs();

  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<"all" | TierLevel>("all");
  const [showAdmins, setShowAdmins] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("lastActive");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded] = useState<string | null>(null);

  const denominators: Denominators | null = useMemo(() => {
    if (!catalogQuery.data || !defsQuery.data) return null;
    return {
      f14: F14_TOTAL,
      f60: F60_TOTAL,
      n60: N60_TOTAL,
      pm: PM_TOTAL,
      assignments: defsQuery.data.first60.length + defsQuery.data.next60.length,
      videos: catalogQuery.data.length,
    };
  }, [catalogQuery.data, defsQuery.data]);

  const cohort = useMemo(() => {
    if (!teamQuery.data || !denominators) return [] as ComputedRow[];
    return teamQuery.data
      .filter((r) => (showAdmins ? true : !r.isAdmin))
      .filter((r) => (tierFilter === "all" ? true : r.tier === tierFilter))
      .map((r) => compute(r, denominators));
  }, [teamQuery.data, denominators, showAdmins, tierFilter]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q
      ? cohort.filter(
          (r) =>
            r.name.toLowerCase().includes(q) || (r.email ?? "").toLowerCase().includes(q),
        )
      : cohort.slice();
    const dir = sortDir === "asc" ? 1 : -1;
    base.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "overall") return (a.overallPct - b.overallPct) * dir;
      if (sortKey === "points") return (a.totalPoints - b.totalPoints) * dir;
      const at = a.lastActive ? new Date(a.lastActive).getTime() : 0;
      const bt = b.lastActive ? new Date(b.lastActive).getTime() : 0;
      return (at - bt) * dir;
    });
    return base;
  }, [cohort, search, sortKey, sortDir]);

  const stats = useMemo(() => {
    const activeWeek = cohort.filter((r) => daysSince(r.lastActive) <= 7).length;
    const stale = cohort.length - activeWeek;
    const avg =
      cohort.length > 0
        ? Math.round(cohort.reduce((sum, r) => sum + r.overallPct, 0) / cohort.length)
        : 0;
    return { count: cohort.length, activeWeek, stale, avg };
  }, [cohort]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  };

  const loading =
    teamQuery.isLoading || catalogQuery.isLoading || defsQuery.isLoading || !denominators;
  const loadError = teamQuery.error ?? catalogQuery.error;

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
      <div className="overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 via-background to-background p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="font-serif text-2xl font-bold tracking-tight">Team Progress</h1>
            <p className="text-sm text-muted-foreground">
              Every consultant's learning activity in one place — day tracks, assignments,
              trainings and question bank. Click a row for the full drill-down.
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {QUICK_LINKS.map(({ label, to, icon: Icon }) => (
            <Button
              key={to}
              asChild
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 px-2.5 text-xs"
            >
              <Link to={to}>
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : loadError ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">
            Failed to load team progress: {(loadError as Error).message}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <StatCard icon={Users} label="Consultants" value={String(stats.count)} />
            <StatCard icon={Activity} label="Active in last 7 days" value={String(stats.activeWeek)} />
            <StatCard
              icon={AlertTriangle}
              label="Inactive 7+ days"
              value={String(stats.stale)}
              tone="warn"
            />
            <StatCard icon={Gauge} label="Average completion" value={`${stats.avg}%`} />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:max-w-xs"
            />
            <Select
              value={tierFilter}
              onValueChange={(v) => setTierFilter(v as "all" | TierLevel)}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tiers</SelectItem>
                {SCOPED_TIERS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TIER_META[t].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isMobile && (
              <Select
                value={`${sortKey}:${sortDir}`}
                onValueChange={(v) => {
                  const [k, d] = v.split(":") as [SortKey, "asc" | "desc"];
                  setSortKey(k);
                  setSortDir(d);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastActive:desc">Last active (newest)</SelectItem>
                  <SelectItem value="lastActive:asc">Last active (oldest)</SelectItem>
                  <SelectItem value="overall:desc">Completion (highest)</SelectItem>
                  <SelectItem value="overall:asc">Completion (lowest)</SelectItem>
                  <SelectItem value="points:desc">Points (most)</SelectItem>
                  <SelectItem value="name:asc">Name (A–Z)</SelectItem>
                </SelectContent>
              </Select>
            )}
            <div className="flex items-center gap-2 sm:ml-auto">
              <Switch id="show-admins" checked={showAdmins} onCheckedChange={setShowAdmins} />
              <Label htmlFor="show-admins" className="text-xs text-muted-foreground">
                Show admin accounts
              </Label>
            </div>
          </div>

          {visible.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-sm text-muted-foreground">
                No consultants match this view.
              </CardContent>
            </Card>
          ) : isMobile ? (
            <div className="space-y-2">
              {visible.map((r) => {
                const isOpen = expanded === r.userId;
                const stale = daysSince(r.lastActive) >= 7;
                return (
                  <div key={r.userId} className="rounded-lg border bg-card">
                    <button
                      type="button"
                      className="w-full p-3 text-left"
                      onClick={() => setExpanded(isOpen ? null : r.userId)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">{r.name}</span>
                            <Badge variant="secondary" className="shrink-0 text-[10px]">
                              {TIER_META[r.tier].label}
                            </Badge>
                          </div>
                          {r.email && (
                            <div className="truncate text-xs text-muted-foreground">{r.email}</div>
                          )}
                        </div>
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={r.overallPct} className="h-2" />
                        <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">
                          {r.overallPct}%
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-x-3 gap-y-1 text-[11px] tabular-nums text-muted-foreground">
                        <span>14D {r.f14Done}/{F14_TOTAL}</span>
                        <span>60D {r.f60Done}/{F60_TOTAL}</span>
                        <span>N60 {r.n60Done}/{N60_TOTAL}</span>
                        <span>PM {r.pmDone}/{PM_TOTAL}</span>
                        <span>Asg {r.assignmentsDone}/{denominators.assignments}</span>
                        <span>Vid {r.videosDone}/{denominators.videos}</span>
                      </div>
                      <div
                        className={cn(
                          "mt-1.5 text-[11px]",
                          stale ? "text-destructive" : "text-muted-foreground",
                        )}
                      >
                        Last active: {staleLabel(r.lastActive)}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="border-t bg-muted/20 p-3">
                        <TeamMemberDetail
                          userId={r.userId}
                          qbCorrect={r.qbCorrect}
                          catalog={catalogQuery.data ?? []}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">
                      <SortButton
                        active={sortKey === "name"}
                        dir={sortDir}
                        onClick={() => toggleSort("name")}
                      >
                        Consultant
                      </SortButton>
                    </th>
                    <th className="px-3 py-2">
                      <SortButton
                        active={sortKey === "overall"}
                        dir={sortDir}
                        onClick={() => toggleSort("overall")}
                      >
                        Overall
                      </SortButton>
                    </th>
                    <th className="whitespace-nowrap px-2 py-2">14 Days</th>
                    <th className="whitespace-nowrap px-2 py-2">60 Days</th>
                    <th className="whitespace-nowrap px-2 py-2">Next 60</th>
                    <th className="whitespace-nowrap px-2 py-2">Mastery</th>
                    <th className="whitespace-nowrap px-2 py-2">Assign.</th>
                    <th className="whitespace-nowrap px-2 py-2">Videos</th>
                    <th className="whitespace-nowrap px-2 py-2">
                      <span title="Question bank — questions answered correctly at least once">
                        QB
                      </span>
                    </th>
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
                {visible.map((r) => {
                  const isOpen = expanded === r.userId;
                  const stale = daysSince(r.lastActive) >= 7;
                  // One keyed tbody per learner: the row pair (summary +
                  // drill-down) needs a keyed wrapper, and lovable-tagger
                  // breaks on named <Fragment> while <> can't take a key.
                  return (
                    <tbody key={r.userId} className="border-t first:border-t-0">
                        <tr
                          className="cursor-pointer hover:bg-muted/40"
                          onClick={() => setExpanded(isOpen ? null : r.userId)}
                        >
                          <td className="px-3 py-2 align-top">
                            <div className="flex items-start gap-1.5">
                              {isOpen ? (
                                <ChevronDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              )}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium text-foreground">{r.name}</span>
                                  <Badge variant="secondary" className="text-[10px]">
                                    {TIER_META[r.tier].label}
                                  </Badge>
                                  {r.isAdmin && (
                                    <Badge variant="outline" className="text-[10px]">
                                      Admin
                                    </Badge>
                                  )}
                                </div>
                                {r.email && (
                                  <div className="text-xs text-muted-foreground">{r.email}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 align-top">
                            <div className="flex min-w-[120px] items-center gap-2">
                              <Progress value={r.overallPct} className="h-2" />
                              <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                                {r.overallPct}%
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-2 align-top">
                            <CountCell done={r.f14Done} total={F14_TOTAL} />
                          </td>
                          <td className="px-2 py-2 align-top">
                            <CountCell done={r.f60Done} total={F60_TOTAL} />
                          </td>
                          <td className="px-2 py-2 align-top">
                            <CountCell done={r.n60Done} total={N60_TOTAL} />
                          </td>
                          <td className="px-2 py-2 align-top">
                            <CountCell done={r.pmDone} total={PM_TOTAL} />
                          </td>
                          <td className="px-2 py-2 align-top">
                            <CountCell done={r.assignmentsDone} total={denominators.assignments} />
                          </td>
                          <td className="px-2 py-2 align-top">
                            <CountCell done={r.videosDone} total={denominators.videos} />
                          </td>
                          <td className="px-2 py-2 align-top">
                            <span
                              className={cn(
                                "text-xs tabular-nums",
                                r.qbCorrect > 0 ? "text-foreground" : "text-muted-foreground/60",
                              )}
                            >
                              {r.qbCorrect}
                            </span>
                          </td>
                          <td
                            className={cn(
                              "px-3 py-2 align-top text-xs",
                              stale ? "text-destructive" : "text-muted-foreground",
                            )}
                          >
                            {staleLabel(r.lastActive)}
                          </td>
                        </tr>
                        {isOpen && (
                          <tr className="border-t bg-muted/20">
                            <td colSpan={10} className="px-4 py-3">
                              <TeamMemberDetail
                                userId={r.userId}
                                qbCorrect={r.qbCorrect}
                                catalog={catalogQuery.data ?? []}
                              />
                            </td>
                          </tr>
                        )}
                    </tbody>
                  );
                })}
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
