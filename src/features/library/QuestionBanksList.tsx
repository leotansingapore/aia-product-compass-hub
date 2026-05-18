import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, GraduationCap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_SLUGS, PRODUCT_LABELS } from "@/types/questionBank";
import { MasteryProgressBar } from "@/components/study/MasteryProgressBar";
import { useStudyMasteryBySlug } from "@/hooks/useStudyMasteryBySlug";

interface ProductQuizEntry {
  id: string;
  title: string;
  description: string;
  studyRoute: string;
  examRoute: string;
}

const productDescriptions: Record<string, string> = {
  "pro-achiever": "Regular premium ILP — AIA's best-selling investment plan.",
  "platinum-wealth-venture": "Limited premium ILP with wealth accumulation focus.",
  "healthshield-gold-max": "Integrated Shield Plan for hospitalization and surgical coverage.",
  "pro-lifetime-protector": "Hybrid ILP combining lifetime protection with investment growth.",
  "solitaire-pa": "Personal accident plan for outpatient and accident coverage.",
  "ultimate-critical-cover": "Multi-pay critical illness plan with unlimited claims.",
  "guaranteed-protect-plus": "Whole-life par plan — accumulator + booster multipliers with optional CI riders.",
};

const products: ProductQuizEntry[] = PRODUCT_SLUGS.map((slug) => ({
  id: slug,
  title: PRODUCT_LABELS[slug],
  description: productDescriptions[slug] || "",
  studyRoute: `/product/${slug}/study`,
  examRoute: `/product/${slug}/exam`,
}));

interface BankCounts {
  [productSlug: string]: { study: number; exam: number };
}

function useBankCounts() {
  return useQuery({
    queryKey: ["question-bank-counts"],
    queryFn: async (): Promise<BankCounts> => {
      const { data, error } = await supabase
        .from("question_bank_questions" as never)
        .select("product_slug, bank_type")
        .range(0, 9999);
      if (error) throw error;
      const counts: BankCounts = {};
      for (const row of (data ?? []) as Array<{ product_slug: string; bank_type: "study" | "exam" }>) {
        if (!counts[row.product_slug]) counts[row.product_slug] = { study: 0, exam: 0 };
        counts[row.product_slug][row.bank_type]++;
      }
      return counts;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function QuestionBanksList() {
  const navigate = useNavigate();
  const { data: counts = {}, isLoading } = useBankCounts();
  const { data: studyMasteryBySlug = {} } = useStudyMasteryBySlug();

  const getStudyCount = (id: string) => counts[id]?.study ?? 0;
  const getExamCount = (id: string) => counts[id]?.exam ?? 0;
  const getStudyMastery = (id: string) =>
    studyMasteryBySlug[id] ?? { mastered: 0, progressPercent: 0 };

  // Aggregate totals for the summary strip — same source of truth as the
  // per-card numbers, computed once so the strip stays in sync.
  const totals = useMemo(() => {
    let study = 0;
    let exam = 0;
    let mastered = 0;
    for (const product of products) {
      const s = getStudyCount(product.id);
      const e = getExamCount(product.id);
      study += s;
      exam += e;
      mastered += getStudyMastery(product.id).mastered;
    }
    return { study, exam, mastered, masteryPct: study > 0 ? Math.round((mastered / study) * 100) : 0 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts, studyMasteryBySlug]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryStat label="Products" value={products.length.toString()} />
        <SummaryStat label="Study questions" value={totals.study.toString()} />
        <SummaryStat label="Exam questions" value={totals.exam.toString()} />
        <SummaryStat label="Mastery" value={`${totals.masteryPct}%`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const studyCount = getStudyCount(product.id);
          const examCount = getExamCount(product.id);
          const total = studyCount + examCount;
          const mastery = getStudyMastery(product.id);
          const hasContent = total > 0;

          return (
            <Card
              key={product.id}
              className="flex h-full flex-col transition-all duration-200 hover:shadow-md hover:border-primary/30"
            >
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Brain className="h-4 w-4" />
                  </div>
                  {hasContent && (
                    <Badge variant="secondary" className="shrink-0 text-[10px] uppercase tracking-wider">
                      {total} questions
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-base leading-snug">{product.title}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                    {product.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="mt-auto flex flex-col gap-3 pt-0">
                {studyCount > 0 ? (
                  <MasteryProgressBar
                    mastered={mastery.mastered}
                    total={studyCount}
                    progressPercent={mastery.progressPercent}
                  />
                ) : examCount > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No study bank yet — exam available below.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Questions coming soon.</p>
                )}

                {hasContent && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-[40px] gap-1.5 text-xs sm:text-sm"
                      disabled={studyCount === 0}
                      onClick={() => navigate(product.studyRoute)}
                    >
                      <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                      <span>Study</span>
                      <Badge variant="secondary" className="ml-auto px-1.5 py-0 text-[10px]">
                        {studyCount}
                      </Badge>
                    </Button>
                    <Button
                      size="sm"
                      className="min-h-[40px] gap-1.5 text-xs sm:text-sm"
                      disabled={examCount === 0}
                      onClick={() => navigate(product.examRoute, { state: { from: "question-banks" } })}
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span>Exam</span>
                      <Badge
                        variant="secondary"
                        className="ml-auto px-1.5 py-0 text-[10px] bg-primary-foreground/20 text-primary-foreground"
                      >
                        {examCount}
                      </Badge>
                    </Button>
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

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums leading-none">{value}</p>
    </div>
  );
}
