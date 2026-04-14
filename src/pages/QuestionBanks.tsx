import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedPage } from "@/components/ProtectedPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, GraduationCap, Loader2, Sparkles, RotateCcw, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_SLUGS, PRODUCT_LABELS } from "@/types/questionBank";
import { useAuth } from "@/hooks/useAuth";
import { MasteryProgressBar } from "@/components/study/MasteryProgressBar";

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

interface MasteryBySlug {
  [productSlug: string]: { mastered: number; touched: number };
}

function useMasteryBySlug() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["all-product-progress", user?.id],
    queryFn: async (): Promise<MasteryBySlug> => {
      if (!user?.id) return {};
      const { data, error } = await supabase
        .from("user_question_progress")
        .select("product_slug, mastered")
        .eq("user_id", user.id);
      if (error) throw error;
      const out: MasteryBySlug = {};
      for (const row of (data ?? []) as Array<{ product_slug: string; mastered: boolean }>) {
        if (!out[row.product_slug]) out[row.product_slug] = { mastered: 0, touched: 0 };
        out[row.product_slug].touched += 1;
        if (row.mastered) out[row.product_slug].mastered += 1;
      }
      return out;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });
}

export default function QuestionBanks() {
  const navigate = useNavigate();
  const { data: counts = {}, isLoading } = useBankCounts();
  const { data: masteryBySlug = {} } = useMasteryBySlug();

  const getStudyCount = (id: string) => counts[id]?.study ?? 0;
  const getExamCount = (id: string) => counts[id]?.exam ?? 0;
  const getMastery = (id: string) => masteryBySlug[id] ?? { mastered: 0, touched: 0 };
  const totalStudy = Object.values(counts).reduce((s, c) => s + c.study, 0);
  const totalExam = Object.values(counts).reduce((s, c) => s + c.exam, 0);

  return (
    <ProtectedPage pageId="question-banks">
      <PageLayout
        title="Question Banks | FINternship"
        description="Practice with product-specific question banks to test your knowledge."
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 animate-fade-in">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Question Banks</h1>
            <p className="text-muted-foreground mb-4">
              Study with practice questions or take scored exams recorded on your profile.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">
                  {isLoading ? "…" : totalStudy} Study Questions
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                <GraduationCap className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">
                  {isLoading ? "…" : totalExam} Exam Questions
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{products.length} Products</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => {
                const studyCount = getStudyCount(product.id);
                const examCount = getExamCount(product.id);
                return (
                  <Card key={product.id} className="transition-all duration-200 hover:shadow-md hover:border-primary/30">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-primary shrink-0" />
                          <CardTitle className="text-lg">{product.title}</CardTitle>
                        </div>
                        <Badge variant="secondary">{studyCount + examCount} total</Badge>
                      </div>
                      <CardDescription className="mt-1">{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {studyCount > 0 && (() => {
                        const mastery = getMastery(product.id);
                        const freshCount = Math.max(studyCount - mastery.touched, 0);
                        const reviewCount = Math.max(mastery.touched - mastery.mastered, 0);
                        return (
                          <>
                            <MasteryProgressBar mastered={mastery.mastered} total={studyCount} />
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => navigate(`${product.studyRoute}?mode=fresh`)}
                                disabled={freshCount <= 0}
                              >
                                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                                Fresh
                                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                                  {freshCount}
                                </Badge>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => navigate(`${product.studyRoute}?mode=review`)}
                                disabled={reviewCount <= 0}
                              >
                                <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
                                Review
                                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                                  {reviewCount}
                                </Badge>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => navigate(`${product.studyRoute}?mode=all`)}
                              >
                                <Layers className="h-3.5 w-3.5 text-primary" />
                                Redo All
                                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                                  {studyCount}
                                </Badge>
                              </Button>
                              <Button
                                size="sm"
                                className="gap-1.5"
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
                            </div>
                          </>
                        );
                      })()}
                      {studyCount === 0 && (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="gap-1.5"
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
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </PageLayout>
    </ProtectedPage>
  );
}
