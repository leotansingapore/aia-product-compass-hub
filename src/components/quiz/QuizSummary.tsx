import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Target, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizSummaryProps {
  score: number;
  totalQuestions: number;
  answeredQuestions: boolean[];
  selectedAnswers: (number | null)[];
  questions: { correct: number; category?: string }[];
  onRestart: () => void;
}

function getGrade(pct: number) {
  if (pct === 100) return { label: "Perfect Score! 🏆", color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" };
  if (pct >= 80)  return { label: "Excellent! 🌟",     color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" };
  if (pct >= 60)  return { label: "Good effort 👍",    color: "text-primary",     bg: "bg-primary/5 border-primary/20" };
  if (pct >= 40)  return { label: "Keep practising 📚", color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800" };
  return           { label: "Needs improvement 💪",     color: "text-destructive", bg: "bg-destructive/5 border-destructive/20" };
}

function getFeedback(pct: number): string {
  if (pct === 100) return "Flawless! You have a complete command of this product. You're ready to discuss it confidently with any client.";
  if (pct >= 80)  return "Strong performance! You know this product well. Review the questions you missed to sharpen your edge before client meetings.";
  if (pct >= 60)  return "Solid foundation. A few gaps to fill — revisit the explanations for incorrect answers and re-take the exam.";
  if (pct >= 40)  return "You've got the basics but need more depth. Study the product overview and training materials, then try again.";
  return "More study needed before presenting this product to clients. Review all training materials and focus on the explanations.";
}

const CATEGORY_LABELS: Record<string, string> = {
  "product-facts":      "Product Facts",
  "sales-angles":       "Sales Techniques",
  "objection-handling": "Objection Handling",
  "roleplay":           "Roleplay Scenarios",
};

export function QuizSummary({ score, totalQuestions, questions, selectedAnswers, onRestart }: QuizSummaryProps) {
  const pct = Math.round((score / totalQuestions) * 100);
  const grade = getGrade(pct);
  const feedback = getFeedback(pct);

  // Per-category breakdown
  const categories = Array.from(new Set(questions.map(q => (q as any).category).filter(Boolean)));
  const categoryStats = categories.map(cat => {
    const indices = questions.reduce<number[]>((acc, q, i) => {
      if ((q as any).category === cat) acc.push(i);
      return acc;
    }, []);
    const correct = indices.filter(i => selectedAnswers[i] === questions[i].correct).length;
    return { cat, correct, total: indices.length };
  });

  // Missed questions (wrong answers)
  const missed = questions.reduce<number[]>((acc, q, i) => {
    if (selectedAnswers[i] !== null && selectedAnswers[i] !== q.correct) acc.push(i + 1);
    return acc;
  }, []);

  return (
    <div className="space-y-5 py-2 animate-in fade-in duration-300">

      {/* Score circle + grade */}
      <div className={cn("rounded-xl border p-5 text-center space-y-1", grade.bg)}>
        <div className={cn("text-5xl font-bold tabular-nums", grade.color)}>
          {score}<span className="text-2xl text-muted-foreground font-normal">/{totalQuestions}</span>
        </div>
        <div className={cn("text-lg font-semibold", grade.color)}>{grade.label}</div>
        <div className="text-sm text-muted-foreground">{pct}% correct</div>
      </div>

      {/* Feedback */}
      <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 text-sm text-foreground leading-relaxed">
        {feedback}
      </div>

      {/* Category breakdown */}
      {categoryStats.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Breakdown by Category</p>
          {categoryStats.map(({ cat, correct, total }) => {
            const catPct = Math.round((correct / total) * 100);
            return (
              <div key={cat} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{CATEGORY_LABELS[cat] ?? cat}</span>
                  <span className={cn("font-medium", catPct >= 70 ? "text-emerald-600" : catPct >= 50 ? "text-orange-500" : "text-destructive")}>
                    {correct}/{total}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500",
                      catPct >= 70 ? "bg-emerald-500" : catPct >= 50 ? "bg-orange-400" : "bg-destructive"
                    )}
                    style={{ width: `${catPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Missed questions */}
      {missed.length > 0 && (
        <div className="rounded-lg border border-border bg-background px-4 py-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <AlertCircle className="h-3.5 w-3.5 text-destructive" />
            Review these questions: {missed.map(n => `Q${n}`).join(", ")}
          </div>
          <p className="text-xs text-muted-foreground">Use the Prev button to revisit any question and re-read the explanation.</p>
        </div>
      )}

      {/* Restart */}
      <Button variant="outline" className="w-full gap-2" onClick={onRestart}>
        <RotateCcw className="h-4 w-4" />
        Retake Exam
      </Button>
    </div>
  );
}
