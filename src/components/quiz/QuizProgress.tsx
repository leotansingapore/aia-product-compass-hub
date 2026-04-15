import { Badge } from "@/components/ui/badge";

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: boolean[];
  score: number;
  isComplete: boolean;
}

export function QuizProgress({ 
  currentQuestion, 
  totalQuestions, 
  answeredQuestions, 
  score, 
  isComplete 
}: QuizProgressProps) {
  const progressPct = Math.round(((currentQuestion + 1) / totalQuestions) * 100);

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs">
            Q{currentQuestion + 1} / {totalQuestions}
          </Badge>
          {isComplete && (
            <Badge variant={score >= totalQuestions * 0.7 ? "default" : "secondary"} className="text-xs">
              Score: {score}/{totalQuestions}
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{progressPct}%</span>
      </div>

      {/* Single progress bar — works for any number of questions */}
      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.max(progressPct, progressPct > 0 ? 3 : 0)}%` }}
        />
      </div>
    </div>
  );
}
