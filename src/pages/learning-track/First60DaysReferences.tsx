import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listReferences, type ReferenceListItem } from "@/features/first-60-days/references";

export default function First60DaysReferences() {
  const [items, setItems] = useState<ReferenceListItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    listReferences()
      .then((refs) => {
        if (!cancelled) setItems(refs);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="mx-auto max-w-4xl space-y-5 p-3 sm:space-y-6 sm:p-6"
      data-testid="first-60-days-references"
    >
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
      >
        <Link to="/learning-track/first-60-days" className="transition-colors hover:text-primary">
          60-day hub
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-foreground">References</span>
      </nav>

      <div className="rounded-2xl border border-border/60 bg-gradient-card p-4 sm:p-7 shadow-card">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary mb-2">
          <BookOpen className="h-3 w-3" /> Reference library
        </div>
        <h1 className="font-serif text-xl sm:text-3xl font-semibold leading-tight tracking-tight">
          Source scripts &amp; conviction references
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          The full-text references the day lessons draw from. Read any of them end to end whenever you
          want the complete source behind a lesson.
        </p>
      </div>

      {items === null ? (
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded-2xl bg-muted/50" />
          <div className="h-20 animate-pulse rounded-2xl bg-muted/50" />
          <div className="h-20 animate-pulse rounded-2xl bg-muted/50" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No references available yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((ref) => (
            <Link
              key={ref.slug}
              to={`/learning-track/first-60-days/reference/${ref.slug}`}
              className="group block"
            >
              <Card className="border-border/60 shadow-card transition-all hover:border-primary/40 hover:shadow-md">
                <CardContent className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm sm:text-base font-bold font-serif leading-snug">
                      {ref.title}
                    </h2>
                    {ref.subtitle && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {ref.subtitle}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="pt-2">
        <Button
          asChild
          variant="ghost"
          className="-ml-3 gap-2 text-muted-foreground hover:text-foreground"
        >
          <Link to="/learning-track/first-60-days">
            <ArrowLeft className="h-4 w-4" />
            Back to 60-day hub
          </Link>
        </Button>
      </div>
    </div>
  );
}
