import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, ChevronRight, GraduationCap, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { WEEK_META, getAllWeeks, prefetchDay } from "@/features/product-mastery-track/content";
import { TOTAL_DAYS } from "@/features/product-mastery-track/summaries";
import { useProductMasteryProgress } from "@/hooks/product-mastery-track/useProductMasteryProgress";
import { useAdmin } from "@/hooks/useAdmin";
import { PRODUCT_SLUGS } from "@/types/questionBank";

const PRODUCT_SLUG_SET = new Set<string>(PRODUCT_SLUGS);

const BASE_PATH = "/learning-track/product-mastery";

let dayPageChunkPromise: Promise<unknown> | null = null;
function prefetchDayPageChunk(): void {
  if (!dayPageChunkPromise) {
    dayPageChunkPromise = import("./ProductMasteryDay").catch(() => {
      dayPageChunkPromise = null;
    });
  }
}

function warmDay(dayNumber: number) {
  prefetchDay(dayNumber);
  prefetchDayPageChunk();
}

export default function ProductMasteryHub() {
  const weeks = getAllWeeks();
  const { isDayComplete, isUnlocked: rawIsUnlocked } = useProductMasteryProgress();
  const { isActualAdmin } = useAdmin();
  const isUnlocked = (dayNumber: number) => isActualAdmin || rawIsUnlocked(dayNumber);

  const totalDone = weeks.reduce(
    (acc, w) => acc + w.days.filter((d) => isDayComplete(d.dayNumber)).length,
    0,
  );
  const totalPct = TOTAL_DAYS === 0 ? 0 : Math.round((totalDone / TOTAL_DAYS) * 100);

  return (
    <div className="space-y-4 max-w-3xl mx-auto" data-testid="product-mastery-hub">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Product Mastery Track
        </p>
        <span className="text-xs text-muted-foreground tabular-nums">
          {totalDone} of {TOTAL_DAYS} days · {totalPct}%
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {weeks.map((week) => {
          const weekDone = week.days.filter((d) => isDayComplete(d.dayNumber)).length;
          const totalDays = week.days.length;
          const allDone = totalDays > 0 && weekDone === totalDays;
          const inProgress = weekDone > 0 && !allDone;
          const anyUnlocked = week.days.some((d) => isUnlocked(d.dayNumber));
          const isLocked = !anyUnlocked;
          const firstIncompleteUnlocked = week.days.find(
            (d) => !isDayComplete(d.dayNumber) && isUnlocked(d.dayNumber),
          );
          const entryDay = firstIncompleteUnlocked ?? week.days[0];
          const href = `${BASE_PATH}/day/${entryDay.dayNumber}`;
          const productSlug = WEEK_META[week.weekNumber]?.productSlug;
          const hasBank = !!productSlug && PRODUCT_SLUG_SET.has(productSlug);

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
                    const dayUnlocked = isUnlocked(d.dayNumber);
                    const StatusIcon = done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                    ) : !dayUnlocked ? (
                      <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <span className="h-3.5 w-3.5 rounded-full border border-muted-foreground/40 shrink-0" />
                    );
                    const dayTitle = d.title.replace(`${week.title} \u2014 `, "");
                    return (
                      <li key={d.dayNumber} className="flex items-center gap-2 text-[13px]">
                        {StatusIcon}
                        {dayUnlocked ? (
                          <Link
                            to={`${BASE_PATH}/day/${d.dayNumber}`}
                            onMouseEnter={() => warmDay(d.dayNumber)}
                            onFocus={() => warmDay(d.dayNumber)}
                            onTouchStart={() => warmDay(d.dayNumber)}
                            className="hover:text-primary transition-colors line-clamp-1"
                          >
                            <span className="text-muted-foreground tabular-nums mr-2">
                              Day {d.dayInWeek}
                            </span>
                            <span className={cn(done && "text-muted-foreground line-through")}>
                              {dayTitle}
                            </span>
                          </Link>
                        ) : (
                          <span className="line-clamp-1 text-muted-foreground/60">
                            <span className="tabular-nums mr-2">Day {d.dayInWeek}</span>
                            <span>{dayTitle}</span>
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
                {hasBank && (
                  <div className="border-t border-border/60 pt-3 space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      End-of-week practice
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        asChild={!isLocked}
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs"
                        disabled={isLocked}
                      >
                        {isLocked ? (
                          <span>
                            <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                            Question Bank
                          </span>
                        ) : (
                          <Link to={`/product/${productSlug}/study`}>
                            <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                            Question Bank
                          </Link>
                        )}
                      </Button>
                      <Button
                        asChild={!isLocked}
                        size="sm"
                        className="gap-1.5 text-xs"
                        disabled={isLocked}
                      >
                        {isLocked ? (
                          <span>
                            <GraduationCap className="h-3.5 w-3.5" />
                            Take Exam
                          </span>
                        ) : (
                          <Link
                            to={`/product/${productSlug}/exam`}
                            state={{ from: "product-mastery" }}
                          >
                            <GraduationCap className="h-3.5 w-3.5" />
                            Take Exam
                          </Link>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
