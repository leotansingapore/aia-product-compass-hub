import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, BookOpen, Trophy } from "lucide-react";
import { useExamBestScore } from "@/hooks/useExamBestScore";

export type ProductContinueLearningVariant = "card" | "hero-strip";

export interface ProductContinueLearningProps {
  hasStudy: boolean;
  hasExam: boolean;
  /** Route slug without `core-` prefix, e.g. `getOriginalSlug(product.id)` */
  originalSlug: string;
  variant: ProductContinueLearningVariant;
}

/**
 * Study bank + product exam CTAs for products that define those paths.
 * - `hero-strip`: compact row under the video hero (high visibility).
 * - `card`: full "Continue learning" block below the tabbed module layout.
 */
export function ProductContinueLearning({
  hasStudy,
  hasExam,
  originalSlug,
  variant,
}: ProductContinueLearningProps) {
  const navigate = useNavigate();
  const best = useExamBestScore(hasExam ? originalSlug : undefined);

  if (!hasStudy && !hasExam) return null;

  if (variant === "hero-strip") {
    return (
      <div className="border-t border-white/10 bg-zinc-900/95">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4">
          <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500 sm:text-xs">
            Next steps
          </span>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:justify-start sm:gap-2">
            {hasStudy && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 border-zinc-600 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 hover:text-white"
                onClick={() => navigate(`/product/${originalSlug}/study`)}
              >
                <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                Study
              </Button>
            )}
            {hasExam && (
              <Button
                type="button"
                size="sm"
                className="h-8"
                onClick={() => navigate(`/product/${originalSlug}/exam`)}
              >
                <Brain className="h-3.5 w-3.5 mr-1.5" />
                Exam
                {best && (
                  <Badge
                    variant="secondary"
                    className="ml-1.5 text-[10px] px-1.5 py-0 bg-primary-foreground/20 text-primary-foreground"
                  >
                    <Trophy className="h-2.5 w-2.5 mr-0.5" />
                    {best.pct}%
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  let stepNum = 2;
  return (
    <Card className="mt-4 border-primary/20 sm:mt-6 overflow-visible">
      <CardContent className="space-y-0 p-5 pt-5 sm:p-6 sm:pt-6 md:pt-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Continue learning
        </h3>
        {hasStudy && (
          <div className={`flex items-center gap-3 py-3 ${hasExam ? "border-b" : ""}`}>
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 text-xs font-bold text-primary">
              {stepNum++}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium">Study Bank</h4>
              <p className="text-xs text-muted-foreground">Practice questions with instant feedback &mdash; no scoring</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => navigate(`/product/${originalSlug}/study`)}
            >
              <BookOpen className="mr-1.5 h-3.5 w-3.5" />
              Study
            </Button>
          </div>
        )}
        {hasExam && (
          <div className="flex items-center gap-3 py-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 text-xs font-bold text-primary">
              {stepNum++}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium flex items-center gap-2">
                Product Knowledge Exam
                {best && (
                  <Badge
                    variant={best.pct >= 80 ? "default" : best.pct >= 50 ? "secondary" : "outline"}
                    className="text-[10px] px-1.5 py-0 gap-0.5"
                  >
                    <Trophy className="h-2.5 w-2.5" />
                    Best: {best.pct}%
                  </Badge>
                )}
              </h4>
              <p className="text-xs text-muted-foreground">Timed &amp; scored &mdash; best score shown on your profile. Retake anytime.</p>
            </div>
            <Button size="sm" className="shrink-0" onClick={() => navigate(`/product/${originalSlug}/exam`)}>
              <Brain className="mr-1.5 h-3.5 w-3.5" />
              Exam
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
