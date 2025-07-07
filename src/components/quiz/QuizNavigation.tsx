import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface QuizNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  showResult: boolean;
  isComplete: boolean;
  score: number;
  user: any;
  onPrevious: () => void;
  onNext: () => void;
  onRestart: () => void;
}

export function QuizNavigation({
  currentQuestion,
  totalQuestions,
  showResult,
  isComplete,
  score,
  user,
  onPrevious,
  onNext,
  onRestart
}: QuizNavigationProps) {
  const calculateXP = (score: number, totalQuestions: number) => {
    const baseXP = 20;
    const bonusXP = Math.floor((score / totalQuestions) * 50);
    return baseXP + bonusXP;
  };

  return (
    <div className="flex justify-between items-center pt-4">
      <Button 
        variant="outline" 
        onClick={onPrevious}
        disabled={currentQuestion === 0}
      >
        Previous
      </Button>
      
      <div className="flex gap-2">
        {isComplete && (
          <Button 
            variant="outline" 
            onClick={onRestart}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Restart Quiz
          </Button>
        )}
        
        {currentQuestion < totalQuestions - 1 ? (
          <Button 
            onClick={onNext}
            disabled={!showResult}
          >
            Next Question
          </Button>
        ) : (
          showResult && (
            <Button 
              onClick={onNext}
              disabled={!user}
              variant="hero"
              className="px-6"
            >
              {user ? `Complete Quiz (+${calculateXP(score, totalQuestions)} XP)` : 'Sign in to earn XP'}
            </Button>
          )
        )}
      </div>
    </div>
  );
}