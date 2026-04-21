import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAllWeeks, TOTAL_DAYS } from "@/features/first-60-days/content";
import { useFirst60DaysProgress } from "@/hooks/first-60-days/useFirst60DaysProgress";
import { LeaderboardRankCard } from "@/components/leaderboard/LeaderboardRankCard";

export default function First60Days() {
  const weeks = getAllWeeks();
  const { completedCount, isDayComplete, isUnlocked } = useFirst60DaysProgress();

  const totalDone = completedCount();
  const totalPct = TOTAL_DAYS === 0 ? 0 : Math.round((totalDone / TOTAL_DAYS) * 100);

  return (
    <div className="space-y-4 max-w-3xl mx-auto" data-testid="first-60-days-hub">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your First 60 Days
        </p>
        <span className="text-xs text-muted-foreground tabular-nums">
          {totalDone} of {TOTAL_DAYS} days · {totalPct}%
        </span>
      </div>

      <LeaderboardRankCard />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {weeks.map((week) => {
          const weekDone = week.days.filter((d) => isDayComplete(d.dayNumber)).length;
          const totalDays = week.days.length;
          const allDone = totalDays > 0 && weekDone === totalDays;
          const inProgress = weekDone > 0 && !allDone;
          // A week is "locked" when none of its days are unlocked yet.
          const anyUnlocked = week.days.some((d) => isUnlocked(d.dayNumber));
          const isLocked = !anyUnlocked;
          const firstIncomplete = week.days.find((d) => !isDayComplete(d.dayNumber) && isUnlocked(d.dayNumber));
          const entryDay = firstIncomplete ?? week.days[0];
          const href = `/learning-track/first-60-days/day/${entryDay.dayNumber}`;

          return (
            <Card
              key={week.weekNumber}
              className={cn(
                "transition-all duration-200 hover:border-primary/30 hover:shadow-md",
                isLocked && "opacity-50",
              )}
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
                    {isLocked ? "Locked" : allDone ? "Completed" : inProgress ? "In Progress" : `Week ${week.weekNumber}`}
                  </Badge>
                  {isLocked ? (
                    <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : allDone ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  ) : null}
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
                <div className="border-t border-border/60 pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Progress
                  </p>
                  <span className="text-sm text-muted-foreground">
                    {weekDone} of {totalDays} days
                  </span>
                </div>
                <Button
                  asChild={!isLocked}
                  variant="default"
                  className="w-full gap-2 text-sm font-semibold"
                  disabled={isLocked}
                >
                  {isLocked ? (
                    <span>
                      Locked
                      <ChevronRight className="h-4 w-4 shrink-0 opacity-90" />
                    </span>
                  ) : (
                    <Link to={href}>
                      {allDone ? "Review" : inProgress ? "Continue" : "Start"}
                      <ChevronRight className="h-4 w-4 shrink-0 opacity-90" />
                    </Link>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
