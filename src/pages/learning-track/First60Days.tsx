import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronRight, ClipboardList, Film, GraduationCap, Lock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAllWeeks, prefetchDay, TOTAL_DAYS, WEEKS_WITH_RECAP } from "@/features/first-60-days/content";
import { useFirst60DaysProgress } from "@/hooks/first-60-days/useFirst60DaysProgress";
import { LeaderboardRankCard } from "@/components/leaderboard/LeaderboardRankCard";

// Warm the day-page chunk on hover so navigation doesn't wait on the JS fetch.
// Vite dedupes repeated dynamic imports, so this is cheap to call many times.
let dayPageChunkPromise: Promise<unknown> | null = null;
function prefetchDayPageChunk(): void {
  if (!dayPageChunkPromise) {
    dayPageChunkPromise = import("./First60DaysDay").catch(() => {
      // Reset so a retry on the next hover can try again after a transient failure.
      dayPageChunkPromise = null;
    });
  }
}

function warmDay(dayNumber: number) {
  prefetchDay(dayNumber);
  prefetchDayPageChunk();
}

export default function First60Days() {
  const weeks = getAllWeeks();
  const {
    completedCount,
    isDayComplete,
    isUnlocked,
    isActualAdmin,
    markDayCompleteAsAdmin,
    unmarkDayCompleteAsAdmin,
  } = useFirst60DaysProgress();

  const totalDone = completedCount();
  const totalPct = TOTAL_DAYS === 0 ? 0 : Math.round((totalDone / TOTAL_DAYS) * 100);

  // Pre-compute per-week stats once per progress change instead of running
  // 6 day-lookups × 10 weeks (60+ isDayComplete/isUnlocked calls) inside the
  // map on every render. Same fix as ProductMasteryHub.
  const weekStats = useMemo(
    () =>
      weeks.map((week) => {
        const weekDone = week.days.filter((d) => isDayComplete(d.dayNumber)).length;
        const totalDays = week.days.length;
        const allDone = totalDays > 0 && weekDone === totalDays;
        const inProgress = weekDone > 0 && !allDone;
        const anyUnlocked = week.days.some((d) => isUnlocked(d.dayNumber));
        const isLocked = !anyUnlocked;
        const firstIncomplete = week.days.find(
          (d) => !isDayComplete(d.dayNumber) && isUnlocked(d.dayNumber),
        );
        const entryDay = firstIncomplete ?? week.days[0];
        return { week, weekDone, totalDays, allDone, inProgress, anyUnlocked, isLocked, entryDay };
      }),
    [weeks, isDayComplete, isUnlocked],
  );

  return (
    <div className="space-y-4 max-w-3xl mx-auto px-1 sm:px-0" data-testid="first-60-days-hub">
      <div className="space-y-2.5">
        <Link
          to="/cmfas-exams"
          className="group relative flex items-center gap-3 sm:gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3 sm:p-5 transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Required</p>
            <h3 className="text-sm sm:text-base font-bold font-serif leading-snug">CMFAS Exams</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">Study modules, videos, and the AI tutor that prepare you to clear the papers.</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>

        <Link
          to="/learning-track/pre-rnf/assignments"
          className="group relative flex items-center gap-3 sm:gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3 sm:p-5 transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Required</p>
            <h3 className="text-sm sm:text-base font-bold font-serif leading-snug">Assignments</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">Weekly deliverables that turn the lessons into real reps with real prospects.</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>

        <Link
          to="/learning-track/product-mastery"
          className="group relative flex items-center gap-3 sm:gap-4 rounded-2xl border border-border/60 bg-gradient-to-r from-muted/40 via-muted/20 to-transparent p-3 sm:p-5 transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Optional</p>
            <h3 className="text-sm sm:text-base font-bold font-serif leading-snug">Product Mastery Track</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">7 weeks, one core product per week. Five days per product, 10-question quiz per day.</p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </Link>
      </div>

      <div className="flex items-center justify-between gap-2 px-1">
        <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your First 60 Days
        </p>
        <span className="text-[10px] sm:text-xs text-muted-foreground tabular-nums whitespace-nowrap">
          {totalDone} of {TOTAL_DAYS} days · {totalPct}%
        </span>
      </div>

      <LeaderboardRankCard />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {weekStats.map(({ week, weekDone, totalDays, allDone, inProgress, anyUnlocked, isLocked, entryDay }) => {
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
                <ul className="space-y-1.5">
                  {week.days.map((d) => {
                    const done = isDayComplete(d.dayNumber);
                    const unlocked = isUnlocked(d.dayNumber);
                    const StatusIcon = done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                    ) : !unlocked ? (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <span className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40 shrink-0" />
                    );
                    return (
                      <li key={d.dayNumber} className="flex items-center gap-2 text-[13px]">
                        {isActualAdmin ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (done) {
                                unmarkDayCompleteAsAdmin(d.dayNumber);
                              } else {
                                markDayCompleteAsAdmin(d.dayNumber);
                              }
                            }}
                            aria-label={done ? `Unmark Day ${d.dayNumber} as complete` : `Mark Day ${d.dayNumber} as complete`}
                            title={done ? "Admin: unmark day" : "Admin: mark day complete"}
                            className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:ring-2 hover:ring-primary/40 transition-shadow"
                          >
                            {StatusIcon}
                          </button>
                        ) : (
                          StatusIcon
                        )}
                        {unlocked ? (
                          <Link
                            to={`/learning-track/first-60-days/day/${d.dayNumber}`}
                            onMouseEnter={() => warmDay(d.dayNumber)}
                            onFocus={() => warmDay(d.dayNumber)}
                            onTouchStart={() => warmDay(d.dayNumber)}
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
                  {WEEKS_WITH_RECAP.has(week.weekNumber) && (
                    <li className="flex items-center gap-2 pt-1.5 mt-1.5 border-t border-dashed border-border/60 text-[13px]">
                      <Film className="h-3.5 w-3.5 text-primary shrink-0" />
                      {anyUnlocked ? (
                        <Link
                          to={`/learning-track/first-60-days/recap/${week.weekNumber}`}
                          className="hover:text-primary transition-colors line-clamp-1"
                        >
                          <span className="text-primary/80 tabular-nums mr-2 text-[10px] font-semibold uppercase tracking-wider">
                            Recap
                          </span>
                          <span className="font-medium">Week {week.weekNumber} Recap</span>
                        </Link>
                      ) : (
                        <span className="line-clamp-1 text-muted-foreground/60">
                          <span className="tabular-nums mr-2 text-[10px] font-semibold uppercase tracking-wider">
                            Recap
                          </span>
                          <span>Week {week.weekNumber} Recap</span>
                        </span>
                      )}
                    </li>
                  )}
                </ul>
                <div className="border-t border-border/60 pt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {weekDone} of {totalDays} days
                  </span>
                  <Button
                    asChild={!isLocked}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    disabled={isLocked}
                  >
                    {isLocked ? (
                      <span>
                        Locked
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <Link
                        to={href}
                        onMouseEnter={() => warmDay(entryDay.dayNumber)}
                        onFocus={() => warmDay(entryDay.dayNumber)}
                        onTouchStart={() => warmDay(entryDay.dayNumber)}
                      >
                        {allDone ? "Review" : inProgress ? "Continue" : "Start"}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
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
