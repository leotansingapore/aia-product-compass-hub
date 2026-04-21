import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight, Compass, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAllWeeks, TOTAL_DAYS } from "@/features/first-14-days/content";
import { useFirst14DaysProgress } from "@/hooks/first-14-days/useFirst14DaysProgress";
import { useAdmin } from "@/hooks/useAdmin";

export default function First14Days() {
  const weeks = getAllWeeks();
  const { completedCount, isDayComplete, isUnlocked } = useFirst14DaysProgress();
  const { isActualAdmin } = useAdmin();
  const effectiveUnlocked = (dayNumber: number) => isActualAdmin || isUnlocked(dayNumber);

  const totalDone = completedCount();
  const totalPct = TOTAL_DAYS === 0 ? 0 : Math.round((totalDone / TOTAL_DAYS) * 100);

  const firstIncomplete = (() => {
    for (let d = 1; d <= TOTAL_DAYS; d++) if (!isDayComplete(d)) return d;
    return 1;
  })();

  return (
    <div className="space-y-6 max-w-3xl mx-auto" data-testid="first-14-days-hub">
      {/* Hero */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" />
            <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider">
              Your First 14 Days
            </Badge>
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif leading-tight tracking-tight">
              Decide if this career (and this team) is right for you.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              14 days, ~15 minutes each. By the end you'll have the honest answer — Commit, Delay,
              Keep Exploring, or an informed No. Written by Leo.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="lg" className="gap-2">
              <Link to={`/learning-track/first-14-days/day/${firstIncomplete}`}>
                {totalDone === 0 ? "Start Day 1" : totalDone === TOTAL_DAYS ? "Review" : `Continue — Day ${firstIncomplete}`}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {totalDone} of {TOTAL_DAYS} days · {totalPct}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Week cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {weeks.map((week) => {
          const weekDone = week.days.filter((d) => isDayComplete(d.dayNumber)).length;
          const totalDays = week.days.length;
          const allDone = totalDays > 0 && weekDone === totalDays;
          const inProgress = weekDone > 0 && !allDone;
          const firstIncompleteInWeek = week.days.find((d) => !isDayComplete(d.dayNumber));
          const entryDay = firstIncompleteInWeek ?? week.days[0];
          const href = `/learning-track/first-14-days/day/${entryDay.dayNumber}`;

          return (
            <Card
              key={week.weekNumber}
              className="transition-all duration-200 hover:border-primary/30 hover:shadow-md"
            >
              <CardHeader className="p-4 pb-0 sm:p-5 sm:pb-0 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white",
                      allDone
                        ? "bg-gradient-to-r from-green-500 to-emerald-600"
                        : inProgress
                          ? "bg-gradient-to-r from-blue-500 to-blue-600"
                          : "bg-gradient-to-r from-amber-500 to-amber-600",
                    )}
                  >
                    {allDone ? "Completed" : inProgress ? "In Progress" : `Week ${week.weekNumber}`}
                  </Badge>
                  {allDone ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /> : null}
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg font-bold font-serif leading-snug tracking-tight">
                    Week {week.weekNumber} — {week.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                    {week.tagline}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-3 sm:p-5 sm:pt-4 flex flex-col gap-3">
                <ul className="space-y-1.5">
                  {week.days.map((d) => {
                    const done = isDayComplete(d.dayNumber);
                    const unlocked = effectiveUnlocked(d.dayNumber);
                    return (
                      <li key={d.dayNumber} className="flex items-center gap-2 text-[13px]">
                        {done ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        ) : !unlocked ? (
                          <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        ) : (
                          <span className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40 shrink-0" />
                        )}
                        {unlocked ? (
                          <Link
                            to={`/learning-track/first-14-days/day/${d.dayNumber}`}
                            className="hover:text-primary transition-colors line-clamp-1"
                          >
                            <span className="text-muted-foreground tabular-nums mr-2">
                              Day {d.dayNumber}
                            </span>
                            <span className={cn(done && "text-muted-foreground line-through")}>
                              {d.title}
                            </span>
                          </Link>
                        ) : (
                          <span className="line-clamp-1 text-muted-foreground/60">
                            <span className="tabular-nums mr-2">Day {d.dayNumber}</span>
                            <span>{d.title}</span>
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-border/60 pt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {weekDone} of {totalDays} days
                  </span>
                  <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Link to={href}>
                      {allDone ? "Review" : inProgress ? "Continue" : "Start"}
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
