import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import { QuizExplanation } from "@/components/quiz/QuizExplanation";
import { QuizNavigation } from "@/components/quiz/QuizNavigation";
import { QuizSummary } from "@/components/quiz/QuizSummary";
import { useQuizState } from "@/hooks/useQuizState";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category?: string;
}

interface ProductQuizProps {
  questions: QuizQuestion[];
  productId: string;
}

export function ProductQuiz({ questions, productId }: ProductQuizProps) {
  const {
    currentQuestion,
    selectedAnswer,
    selectedAnswers,
    showResult,
    score,
    answeredQuestions,
    isCorrect,
    isComplete,
    handleAnswerSelect,
    handleNext,
    handlePrevious,
    handleRestart,
  } = useQuizState({ questions, productId });

  return (
    <Card className="border-accent/20 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <span>🧠</span> Knowledge Quiz
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Test your product knowledge with this interactive quiz
        </CardDescription>
        <QuizProgress
          currentQuestion={currentQuestion}
          totalQuestions={questions.length}
          answeredQuestions={answeredQuestions}
          score={score}
          isComplete={isComplete}
        />
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {isComplete ? (
          <QuizSummary
            score={score}
            totalQuestions={questions.length}
            answeredQuestions={answeredQuestions}
            selectedAnswers={selectedAnswers}
            questions={questions}
            onRestart={handleRestart}
          />
        ) : (
          <div className="space-y-4">
            <QuizQuestion
              question={questions[currentQuestion]}
              selectedAnswer={selectedAnswer}
              showResult={showResult}
              onAnswerSelect={handleAnswerSelect}
            />

            <QuizExplanation
              explanation={questions[currentQuestion].explanation}
              isCorrect={isCorrect}
              showResult={showResult}
            />

            <QuizNavigation
              currentQuestion={currentQuestion}
              totalQuestions={questions.length}
              showResult={showResult}
              isComplete={isComplete}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onRestart={handleRestart}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
