import { Link } from "react-router-dom";
import { Lock, CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getAllWeeks, TOTAL_DAYS } from "@/features/first-60-days/content";
import { useFirst60DaysProgress } from "@/hooks/first-60-days/useFirst60DaysProgress";

export default function First60Days() {
  const weeks = getAllWeeks();
  const { currentDay, completedCount, isDayComplete, isUnlocked } = useFirst60DaysProgress();

  const done = completedCount();
  const pct = TOTAL_DAYS === 0 ? 0 : Math.round((done / TOTAL_DAYS) * 100);
  const current = currentDay();
  const notStarted = done === 0 && current === 1;

  return (
    <div className="space-y-6" data-testid="first-60-days-hub">
      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">Your First 60 Days</h2>
            <p className="text-sm text-muted-foreground">
              10 weeks × 6 days. Foundation, productivity, financial fundamentals, sales skill, and
              product mastery — one 20-minute lesson at a time.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge variant="secondary">
                {done} / {TOTAL_DAYS} complete
              </Badge>
              {!notStarted && (
                <Badge variant="outline">Currently at Day {current}</Badge>
              )}
            </div>
          </div>
          <div className="shrink-0">
            <Button asChild size="lg">
              <Link to={`/learning-track/first-60-days/day/${notStarted ? 1 : current}`}>
                <PlayCircle className="mr-2 h-4 w-4" />
                {notStarted ? "Start Day 1" : `Continue Day ${current}`}
              </Link>
            </Button>
          </div>
        </CardContent>
        <CardContent className="px-5 pb-5 pt-0">
          <Progress value={pct} aria-label="60-day progress" />
          <div className="mt-1 text-xs text-muted-foreground">{pct}% complete</div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {weeks.map((week) => {
          const weekDone = week.days.filter((d) => isDayComplete(d.dayNumber)).length;
          return (
            <Card key={week.weekNumber} className="flex flex-col">
              <CardHeader className="space-y-1 p-4 pb-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wide">Week {week.weekNumber}</span>
                  <span>
                    {weekDone} / {week.days.length}
                  </span>
                </div>
                <CardTitle className="text-base">{week.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{week.tagline}</p>
              </CardHeader>
              <CardContent className="flex-1 space-y-1 p-4 pt-2">
                {week.days.map((day) => {
                  const passed = isDayComplete(day.dayNumber);
                  const unlocked = isUnlocked(day.dayNumber);
                  const isCurrent = day.dayNumber === current && !passed && unlocked;
                  const statusIcon = passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : !unlocked ? (
                    <Lock className="h-4 w-4 text-muted-foreground/50" />
                  ) : (
                    <Circle className={cn("h-4 w-4", isCurrent ? "text-primary" : "text-muted-foreground/70")} />
                  );
                  const content = (
                    <div
                      className={cn(
                        "flex items-start gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                        unlocked
                          ? "hover:bg-muted cursor-pointer"
                          : "cursor-not-allowed text-muted-foreground/60",
                        isCurrent && "bg-primary/5 ring-1 ring-primary/30"
                      )}
                    >
                      <span className="shrink-0 pt-0.5">{statusIcon}</span>
                      <span className="min-w-0 flex-1 truncate">
                        <span className="font-medium">Day {day.dayNumber}</span>
                        <span className="text-muted-foreground"> — {day.title}</span>
                      </span>
                    </div>
                  );
                  return unlocked ? (
                    <Link key={day.dayNumber} to={`/learning-track/first-60-days/day/${day.dayNumber}`} className="block">
                      {content}
                    </Link>
                  ) : (
                    <div key={day.dayNumber}>{content}</div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
