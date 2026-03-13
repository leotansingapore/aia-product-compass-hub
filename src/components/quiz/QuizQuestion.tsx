import { CheckCircle, XCircle } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizQuestionProps {
  question: QuizQuestion;
  selectedAnswer: number | null;
  showResult: boolean;
  onAnswerSelect: (answerIndex: number) => void;
}

export function QuizQuestion({ 
  question, 
  selectedAnswer, 
  showResult, 
  onAnswerSelect 
}: QuizQuestionProps) {
  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold mb-3 leading-snug">
        {question.question}
      </h3>
      
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(index)}
            disabled={showResult}
            className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-all text-sm sm:text-base ${
              showResult
                ? index === question.correct
                  ? 'border-success bg-success/10 text-success'
                  : selectedAnswer === index
                  ? 'border-destructive bg-destructive/10 text-destructive'
                  : 'border-muted bg-muted/50'
                : selectedAnswer === index
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex-1 leading-snug">{option}</span>
              {showResult && (
                <span className="shrink-0 mt-0.5">
                  {index === question.correct ? (
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                  ) : selectedAnswer === index ? (
                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
                  ) : null}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}