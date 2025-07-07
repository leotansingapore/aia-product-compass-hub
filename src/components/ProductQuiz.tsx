import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import { QuizExplanation } from "@/components/quiz/QuizExplanation";
import { QuizNavigation } from "@/components/quiz/QuizNavigation";
import { useQuizState } from "@/hooks/useQuizState";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface ProductQuizProps {
  questions: QuizQuestion[];
  productId: string;
}

export function ProductQuiz({ questions, productId }: ProductQuizProps) {
  const {
    currentQuestion,
    selectedAnswer,
    showResult,
    score,
    answeredQuestions,
    isCorrect,
    isComplete,
    handleAnswerSelect,
    handleNext,
    handlePrevious,
    handleRestart,
    user
  } = useQuizState({ questions, productId });

  return (
    <Card className="border-accent/20 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span>🧠</span> Knowledge Quiz
          </span>
          <QuizProgress
            currentQuestion={currentQuestion}
            totalQuestions={questions.length}
            answeredQuestions={answeredQuestions}
            score={score}
            isComplete={isComplete}
          />
        </CardTitle>
        <CardDescription>
          Test your product knowledge with this interactive quiz
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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
            score={score}
            user={user}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onRestart={handleRestart}
          />
        </div>
      </CardContent>
    </Card>
  );
}