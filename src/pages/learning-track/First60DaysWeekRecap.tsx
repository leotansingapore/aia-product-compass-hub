import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ArrowLeft, ArrowRight, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { dayMarkdownComponents } from "@/components/first-60-days/dayMarkdownComponents";
import { WEEK_META } from "@/features/first-60-days/content";
import { convertWikilinks } from "@/features/first-60-days/parse";
import { DAY_SUMMARIES } from "@/features/first-60-days/summaries";

const recapLoaders = import.meta.glob<string>(
  "/docs/first-60-days/week-*/recap.md",
  { query: "?raw", import: "default" },
);

const FRONTMATTER_RE = /^---\s*\n[\s\S]*?\n---\s*\n?/;

function loaderFor(weekNumber: number): (() => Promise<string>) | undefined {
  const key = `/docs/first-60-days/week-${weekNumber}/recap.md`;
  return recapLoaders[key] as (() => Promise<string>) | undefined;
}

export default function First60DaysWeekRecap() {
  const { weekNumber: rawWeek } = useParams<{ weekNumber: string }>();
  const weekNumber = Number(rawWeek);
  const [body, setBody] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setBody(null);
    setMissing(false);
    const loader = loaderFor(weekNumber);
    if (!loader) {
      setMissing(true);
      return;
    }
    let cancelled = false;
    loader()
      .then((raw) => {
        if (cancelled) return;
        const stripped = raw.replace(FRONTMATTER_RE, "").trim();
        setBody(convertWikilinks(stripped));
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });
    return () => {
      cancelled = true;
    };
  }, [weekNumber]);

  const meta = WEEK_META[weekNumber];

  const lastDayOfWeek = useMemo(
    () =>
      DAY_SUMMARIES.filter((d) => d.week === weekNumber).reduce(
        (acc, d) => (acc && acc.dayNumber > d.dayNumber ? acc : d),
        undefined as (typeof DAY_SUMMARIES)[number] | undefined,
      ),
    [weekNumber],
  );

  const firstDayOfNextWeek = useMemo(
    () =>
      DAY_SUMMARIES.find((d) => d.week === weekNumber + 1) ?? undefined,
    [weekNumber],
  );

  if (!meta || missing) {
    return (
      <Card className="mx-auto mt-12 max-w-md text-center">
        <CardContent className="space-y-3 p-6">
          <h2 className="text-lg font-semibold">Recap not available</h2>
          <p className="text-sm text-muted-foreground">
            We don't have a recap recording for Week {Number.isFinite(weekNumber) ? weekNumber : ""} yet.
          </p>
          <Button asChild variant="outline">
            <Link to="/learning-track/first-60-days">Back to the 60-day hub</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-3 sm:space-y-6 sm:px-0" data-testid="first-60-days-recap">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
      >
        <Link
          to="/learning-track/first-60-days"
          className="transition-colors hover:text-primary"
        >
          60-day hub
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span>Week {weekNumber}</span>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-foreground">Recap</span>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-card shadow-card">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(ellipse at top right, hsl(var(--primary) / 0.18), transparent 55%), radial-gradient(ellipse at bottom left, hsl(var(--accent) / 0.18), transparent 55%)",
          }}
        />
        <div className="relative flex flex-col gap-3 p-3.5 sm:gap-4 sm:p-8">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            <Film className="h-3 w-3" /> Week {weekNumber} wrap-up
          </span>
          <h1 className="text-balance font-serif text-3xl font-bold tracking-tight sm:text-4xl">
            Week {weekNumber} Recap - {meta.title}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{meta.tagline}</p>
        </div>
      </section>

      {/* Body */}
      <Card>
        <CardContent className="prose prose-sm max-w-none p-4 sm:prose-base sm:p-6 dark:prose-invert">
          {body === null ? (
            <div className="flex min-h-[160px] items-center justify-center text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary/60" />
                Loading recap…
              </span>
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={dayMarkdownComponents}
            >
              {body}
            </ReactMarkdown>
          )}
        </CardContent>
      </Card>

      {/* Prev / Next */}
      <div className="grid gap-3 sm:grid-cols-2">
        {lastDayOfWeek ? (
          <Button asChild variant="outline" className="justify-start gap-2">
            <Link to={`/learning-track/first-60-days/day/${lastDayOfWeek.dayNumber}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="text-left">
                <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Previous
                </span>
                <span className="block">Day {lastDayOfWeek.dayNumber} . {lastDayOfWeek.title}</span>
              </span>
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {firstDayOfNextWeek ? (
          <Button asChild className="justify-end gap-2">
            <Link to={`/learning-track/first-60-days/day/${firstDayOfNextWeek.dayNumber}`}>
              <span className="text-right">
                <span className="block text-[10px] uppercase tracking-[0.18em] text-primary-foreground/80">
                  Up next
                </span>
                <span className="block">Day {firstDayOfNextWeek.dayNumber} . {firstDayOfNextWeek.title}</span>
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="justify-end gap-2">
            <Link to="/learning-track/first-60-days">
              <span>Back to the hub</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
