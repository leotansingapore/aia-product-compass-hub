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
    <div className="pt-4 space-y-2">
      {/* Main action row */}
      <div className="flex items-center justify-between gap-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={currentQuestion === 0}
          className="shrink-0"
        >
          ← Prev
        </Button>
        
        <div className="flex gap-2 flex-wrap justify-end">
          {isComplete && (
            <Button 
              variant="outline"
              size="sm"
              onClick={onRestart}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">Restart</span>
              <span className="sm:hidden">↺</span>
            </Button>
          )}
          
          {currentQuestion < totalQuestions - 1 ? (
            <Button 
              size="sm"
              onClick={onNext}
              disabled={!showResult}
            >
              Next →
            </Button>
          ) : (
            showResult && (
              <Button 
                onClick={onNext}
                disabled={!user}
                variant="hero"
                size="sm"
                className="px-4 text-xs sm:text-sm"
              >
                {user ? `Complete (+${calculateXP(score, totalQuestions)} XP)` : 'Sign in to earn XP'}
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}