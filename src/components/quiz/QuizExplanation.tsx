import { CheckCircle, XCircle } from "lucide-react";

interface QuizExplanationProps {
  explanation: string;
  isCorrect: boolean;
  showResult: boolean;
}

export function QuizExplanation({ explanation, isCorrect, showResult }: QuizExplanationProps) {
  if (!showResult) return null;

  return (
    <div className={`p-4 rounded-lg ${
      isCorrect ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'
    }`}>
      <div className="flex items-start gap-2">
        {isCorrect ? (
          <CheckCircle className="h-5 w-5 text-success mt-0.5" />
        ) : (
          <XCircle className="h-5 w-5 text-destructive mt-0.5" />
        )}
        <div>
          <p className={`font-semibold ${isCorrect ? 'text-success' : 'text-destructive'}`}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
}