import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedPage } from "@/components/ProtectedPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Brain, Lock } from "lucide-react";
import { proAchieverExamQuestions } from "@/data/proAchieverExamQuestions";

interface QuestionBank {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  categories: { label: string; count: number }[];
  route: string;
  available: boolean;
}

const questionBanks: QuestionBank[] = [
  {
    id: "pro-achiever",
    title: "Pro Achiever",
    description: "Test your knowledge on Pro Achiever (APA) 3.0 — product facts, sales angles, and objection handling.",
    questionCount: proAchieverExamQuestions.length,
    categories: [
      { label: "Product Facts", count: proAchieverExamQuestions.filter(q => q.category === "product-facts").length },
      { label: "Sales Angles", count: proAchieverExamQuestions.filter(q => q.category === "sales-angles").length },
      { label: "Objection Handling", count: proAchieverExamQuestions.filter(q => q.category === "objection-handling").length },
    ],
    route: "/product/pro-achiever/exam",
    available: true,
  },
  {
    id: "pro-lifetime-protector",
    title: "Pro Lifetime Protector",
    description: "Coming soon — product knowledge quiz for Pro Lifetime Protector.",
    questionCount: 0,
    categories: [],
    route: "",
    available: false,
  },
  {
    id: "platinum-wealth-venture",
    title: "Platinum Wealth Venture",
    description: "Coming soon — product knowledge quiz for Platinum Wealth Venture.",
    questionCount: 0,
    categories: [],
    route: "",
    available: false,
  },
  {
    id: "healthshield-gold-max",
    title: "Healthshield Gold Max",
    description: "Coming soon — product knowledge quiz for Healthshield Gold Max.",
    questionCount: 0,
    categories: [],
    route: "",
    available: false,
  },
];

export default function QuestionBanks() {
  const navigate = useNavigate();

  return (
    <ProtectedPage pageId="question-banks">
      <PageLayout
        title="Question Banks | FINternship"
        description="Practice with product-specific question banks to test your knowledge."
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 animate-fade-in">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Question Banks</h1>
            <p className="text-muted-foreground">
              Practice with product-specific quizzes covering product facts, sales angles, and objection handling.
            </p>
          </div>

          <div className="grid gap-4">
            {questionBanks.map((bank) => (
              <Card
                key={bank.id}
                className={`transition-all duration-200 ${bank.available ? "hover:shadow-md cursor-pointer hover:border-primary/30" : "opacity-60"}`}
                onClick={() => bank.available && navigate(bank.route)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary shrink-0" />
                      <CardTitle className="text-lg">{bank.title}</CardTitle>
                    </div>
                    {bank.available ? (
                      <Badge variant="secondary">{bank.questionCount} questions</Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-1">{bank.description}</CardDescription>
                </CardHeader>
                {bank.available && bank.categories.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {bank.categories.map((cat) => (
                        <Badge key={cat.label} variant="outline" className="text-xs">
                          {cat.label} ({cat.count})
                        </Badge>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1 -ml-2">
                      Start Quiz <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </PageLayout>
    </ProtectedPage>
  );
}
