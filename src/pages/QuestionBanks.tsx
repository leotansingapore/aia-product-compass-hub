import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedPage } from "@/components/ProtectedPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Brain, GraduationCap } from "lucide-react";
import { proAchieverStudyBank } from "@/data/proAchieverStudyBank";
import { proAchieverExamQuestions } from "@/data/proAchieverExamQuestions";
import { platinumWealthVentureStudyBank } from "@/data/platinumWealthVentureStudyBank";
import { platinumWealthVentureExamQuestions } from "@/data/platinumWealthVentureExamQuestions";
import { healthshieldGoldMaxStudyBank } from "@/data/healthshieldGoldMaxStudyBank";
import { healthshieldGoldMaxExamQuestions } from "@/data/healthshieldGoldMaxExamQuestions";
import { proLifetimeProtectorStudyBank } from "@/data/proLifetimeProtectorStudyBank";
import { proLifetimeProtectorExamQuestions } from "@/data/proLifetimeProtectorExamQuestions";
import { solitairePaStudyBank } from "@/data/solitairePaStudyBank";
import { solitairePaExamQuestions } from "@/data/solitairePaExamQuestions";
import { ultimateCriticalCoverStudyBank } from "@/data/ultimateCriticalCoverStudyBank";
import { ultimateCriticalCoverExamQuestions } from "@/data/ultimateCriticalCoverExamQuestions";

interface ProductQuizEntry {
  id: string;
  title: string;
  description: string;
  studyCount: number;
  examCount: number;
  studyRoute: string;
  examRoute: string;
}

const products: ProductQuizEntry[] = [
  {
    id: "pro-achiever",
    title: "Pro Achiever",
    description: "Regular premium ILP — AIA's best-selling investment plan.",
    studyCount: proAchieverStudyBank.length,
    examCount: proAchieverExamQuestions.length,
    studyRoute: "/product/pro-achiever/study",
    examRoute: "/product/pro-achiever/exam",
  },
  {
    id: "platinum-wealth-venture",
    title: "Platinum Wealth Venture",
    description: "Limited premium ILP with wealth accumulation focus.",
    studyCount: platinumWealthVentureStudyBank.length,
    examCount: platinumWealthVentureExamQuestions.length,
    studyRoute: "/product/platinum-wealth-venture/study",
    examRoute: "/product/platinum-wealth-venture/exam",
  },
  {
    id: "healthshield-gold-max",
    title: "HealthShield Gold Max",
    description: "Integrated Shield Plan for hospitalization and surgical coverage.",
    studyCount: healthshieldGoldMaxStudyBank.length,
    examCount: healthshieldGoldMaxExamQuestions.length,
    studyRoute: "/product/healthshield-gold-max/study",
    examRoute: "/product/healthshield-gold-max/exam",
  },
  {
    id: "pro-lifetime-protector",
    title: "Pro Lifetime Protector",
    description: "Hybrid ILP combining lifetime protection with investment growth.",
    studyCount: proLifetimeProtectorStudyBank.length,
    examCount: proLifetimeProtectorExamQuestions.length,
    studyRoute: "/product/pro-lifetime-protector/study",
    examRoute: "/product/pro-lifetime-protector/exam",
  },
  {
    id: "solitaire-pa",
    title: "Solitaire PA",
    description: "Personal accident plan for outpatient and accident coverage.",
    studyCount: solitairePaStudyBank.length,
    examCount: solitairePaExamQuestions.length,
    studyRoute: "/product/solitaire-pa/study",
    examRoute: "/product/solitaire-pa/exam",
  },
  {
    id: "ultimate-critical-cover",
    title: "Ultimate Critical Cover",
    description: "Multi-pay critical illness plan with unlimited claims.",
    studyCount: ultimateCriticalCoverStudyBank.length,
    examCount: ultimateCriticalCoverExamQuestions.length,
    studyRoute: "/product/ultimate-critical-cover/study",
    examRoute: "/product/ultimate-critical-cover/exam",
  },
];

export default function QuestionBanks() {
  const navigate = useNavigate();

  const totalStudy = products.reduce((sum, p) => sum + p.studyCount, 0);
  const totalExam = products.reduce((sum, p) => sum + p.examCount, 0);

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
                <span className="text-sm font-medium">{totalStudy} Study Questions</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                <GraduationCap className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">{totalExam} Exam Questions</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{products.length} Products</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {products.map((product) => (
              <Card key={product.id} className="transition-all duration-200 hover:shadow-md hover:border-primary/30">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary shrink-0" />
                      <CardTitle className="text-lg">{product.title}</CardTitle>
                    </div>
                    <Badge variant="secondary">
                      {product.studyCount + product.examCount} total
                    </Badge>
                  </div>
                  <CardDescription className="mt-1">{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => navigate(product.studyRoute)}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Study Bank
                      <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                        {product.studyCount}
                      </Badge>
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => navigate(product.examRoute)}
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                      Product Exam
                      <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 bg-primary-foreground/20 text-primary-foreground">
                        {product.examCount}
                      </Badge>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageLayout>
    </ProtectedPage>
  );
}
