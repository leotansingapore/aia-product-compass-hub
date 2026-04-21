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
        .select("product_slug, bank_type");
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {products.map((product) => {
        const studyCount = getStudyCount(product.id);
        const examCount = getExamCount(product.id);
        return (
          <Card key={product.id} className="transition-all duration-200 hover:shadow-md hover:border-primary/30">
            <CardHeader className="pb-2 px-4 sm:px-6">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Brain className="h-5 w-5 text-primary shrink-0" />
                  <CardTitle className="text-base sm:text-lg truncate">{product.title}</CardTitle>
                </div>
                <Badge variant="secondary" className="shrink-0">{studyCount + examCount} total</Badge>
              </div>
              <CardDescription className="mt-1 text-xs sm:text-sm">{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 px-4 sm:px-6">
              {studyCount > 0 && (() => {
                const mastery = getStudyMastery(product.id);
                return (
                  <>
                    <MasteryProgressBar
                      mastered={mastery.mastered}
                      total={studyCount}
                      progressPercent={mastery.progressPercent}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 min-h-[44px] sm:min-h-0 text-xs sm:text-sm"
                        onClick={() => navigate(product.studyRoute)}
                      >
                        <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                        Question Bank
                        <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                          {studyCount}
                        </Badge>
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1.5 min-h-[44px] sm:min-h-0 text-xs sm:text-sm"
                        onClick={() => navigate(product.examRoute, { state: { from: "question-banks" } })}
                      >
                        <GraduationCap className="h-3.5 w-3.5" />
                        Exam
                        <Badge
                          variant="secondary"
                          className="ml-1 text-[10px] px-1.5 py-0 bg-primary-foreground/20 text-primary-foreground"
                        >
                          {examCount}
                        </Badge>
                      </Button>
                    </div>
                  </>
                );
              })()}
              {studyCount === 0 && (
                <Button
                  size="sm"
                  className="gap-1.5 min-h-[44px] sm:min-h-0 w-full sm:w-auto"
                  onClick={() => navigate(product.examRoute, { state: { from: "question-banks" } })}
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  Product Exam
                  <Badge
                    variant="secondary"
                    className="ml-1 text-[10px] px-1.5 py-0 bg-primary-foreground/20 text-primary-foreground"
                  >
                    {examCount}
                  </Badge>
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
