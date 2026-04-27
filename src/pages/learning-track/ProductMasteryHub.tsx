import { Link } from "react-router-dom";
import { CheckCircle2, ClipboardCheck, BookOpen, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { WEEK_META, prefetchDay } from "@/features/product-mastery-track/content";
import { DAY_SUMMARIES, TOTAL_DAYS } from "@/features/product-mastery-track/summaries";
import { useProductMasteryProgress } from "@/hooks/product-mastery-track/useProductMasteryProgress";

const BASE_PATH = "/learning-track/product-mastery";

export default function ProductMasteryHub() {
  const { isQuizPassed, isDayComplete } = useProductMasteryProgress();
  const completedCount = DAY_SUMMARIES.filter((d) => isDayComplete(d.dayNumber)).length;
  const overallPct = Math.round((completedCount / TOTAL_DAYS) * 100);

  const weeks = Object.keys(WEEK_META)
    .map((n) => Number(n))
    .sort((a, b) => a - b)
    .map((n) => ({
      week: n,
      meta: WEEK_META[n],
      days: DAY_SUMMARIES.filter((d) => d.week === n),
    }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-3 sm:px-0" data-testid="product-mastery-hub">
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card shadow-card">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(ellipse at top right, hsl(var(--primary) / 0.16), transparent 55%), radial-gradient(ellipse at bottom left, hsl(var(--accent) / 0.14), transparent 55%)",
          }}
        />
        <div className="relative grid gap-4 p-5 sm:gap-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
              <Sparkles className="h-3 w-3" />
              Product Mastery Track
            </div>
            <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              7 weeks. 7 core products. Sales-ready.
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              One product per week, five days each. Each day ends with a 10-question quiz drawn
              directly from the canonical Product Summary so the facts in your mouth match the
              facts on the page.
            </p>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className="relative grid h-20 w-20 place-items-center rounded-full"
              style={{
                background: `conic-gradient(hsl(var(--primary)) ${overallPct * 3.6}deg, hsl(var(--muted)) 0deg)`,
              }}
              aria-label={`${overallPct} percent complete`}
              role="img"
            >
              <div className="grid h-[64px] w-[64px] place-items-center rounded-full bg-card">
                <span className="font-serif text-lg font-semibold tabular-nums text-foreground">
                  {overallPct}
                  <span className="text-[10px] text-muted-foreground">%</span>
                </span>
              </div>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {completedCount} / {TOTAL_DAYS} days
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:gap-5">
        {weeks.map(({ week, meta, days }) => {
          const weekDone = days.every((d) => isDayComplete(d.dayNumber));
          const weekStarted = days.some((d) => isDayComplete(d.dayNumber));
          return (
            <Card key={week} className="border-border/60 shadow-card">
              <CardContent className="space-y-3 px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      <span className="text-primary">Week {week}</span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                      <span>{days.length} days</span>
                    </div>
                    <h2 className="font-serif text-lg font-semibold leading-tight text-foreground sm:text-xl">
                      {meta.title}
                    </h2>
                    <p className="max-w-3xl text-sm text-muted-foreground">{meta.tagline}</p>
                  </div>
                  {weekDone ? (
                    <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Week complete
                    </Badge>
                  ) : weekStarted ? (
                    <Badge variant="outline" className="bg-background/60">
                      In progress
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted/40 text-muted-foreground">
                      Not started
                    </Badge>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                  {days.map((d) => {
                    const done = isDayComplete(d.dayNumber);
                    const quizPassed = isQuizPassed(d.dayNumber);
                    return (
                      <Link
                        key={d.dayNumber}
                        to={`${BASE_PATH}/day/${d.dayNumber}`}
                        onMouseEnter={() => prefetchDay(d.dayNumber)}
                        onFocus={() => prefetchDay(d.dayNumber)}
                        className={cn(
                          "group flex items-start gap-2.5 rounded-xl border p-3 transition-colors",
                          done
                            ? "border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10"
                            : "border-border/70 bg-background/60 hover:border-primary/40 hover:bg-primary/5",
                        )}
                      >
                        <div
                          className={cn(
                            "grid h-8 w-8 shrink-0 place-items-center rounded-lg font-serif text-sm font-semibold tabular-nums",
                            done
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                              : "bg-primary/10 text-primary",
                          )}
                        >
                          {d.dayInWeek}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-primary">
                            {d.title.replace(`${meta.title} \u2014 `, "")}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />~{d.duration}m
                            </span>
                            {quizPassed && (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-300">
                                <ClipboardCheck className="h-3 w-3" />
                                Quiz passed
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
