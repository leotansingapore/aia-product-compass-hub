import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface QuizNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  showResult: boolean;
  isComplete: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onRestart: () => void;
}

export function QuizNavigation({
  currentQuestion,
  totalQuestions,
  showResult,
  isComplete,
  onPrevious,
  onNext,
  onRestart
}: QuizNavigationProps) {
  return (
    <div className="pt-4 space-y-2">
      {/* Main action row */}
      <div className="flex items-center justify-between gap-2">
        <Button 
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={currentQuestion === 0}
          className="shrink-0 min-h-[44px] sm:min-h-0"
        >
          ← Prev
        </Button>
        
        <div className="flex gap-2 flex-wrap justify-end">
          {isComplete && (
            <Button 
              variant="outline"
              size="sm"
              onClick={onRestart}
              className="flex items-center gap-1 min-h-[44px] sm:min-h-0"
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
              className="min-h-[44px] sm:min-h-0 min-w-[80px]"
            >
              Next →
            </Button>
          ) : (
            showResult && (
              <Button 
                onClick={onNext}
                variant="hero"
                size="sm"
                className="px-4 text-xs sm:text-sm min-h-[44px] sm:min-h-0"
              >
                Complete ✓
              </Button>
            )
          )}
        </div>
      </div>
    </div>
  );
}