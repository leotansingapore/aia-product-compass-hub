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
      <h3 className="text-lg font-semibold mb-4">
        {question.question}
      </h3>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(index)}
            disabled={showResult}
            className={`w-full text-left p-4 rounded-lg border transition-all ${
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
            <div className="flex items-center justify-between">
              <span>{option}</span>
              {showResult && (
                <span>
                  {index === question.correct ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : selectedAnswer === index ? (
                    <XCircle className="h-5 w-5 text-destructive" />
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