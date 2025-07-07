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
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {currentQuestion + 1} of {totalQuestions}
        </Badge>
        {isComplete && (
          <Badge variant={score >= totalQuestions * 0.7 ? "default" : "secondary"}>
            Score: {score}/{totalQuestions}
          </Badge>
        )}
      </div>
      
      {/* Progress Indicator */}
      <div className="flex gap-2">
        {Array.from({ length: totalQuestions }, (_, index) => (
          <div
            key={index}
            className={`h-2 w-8 rounded-full ${
              index < currentQuestion 
                ? 'bg-success' 
                : index === currentQuestion 
                ? 'bg-primary' 
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}