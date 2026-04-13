import { useState } from "react";
import { Brain, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuizQuestion } from "@/components/quiz/QuizQuestion";
import type { QuizConfig } from "@/hooks/useProducts";

interface InlineQuizProps {
  title: string;
  description?: string;
  quizConfig: QuizConfig;
  onComplete: () => void;
}

export function InlineQuiz({ title, description, quizConfig, onComplete }: InlineQuizProps) {
  const { questions } = quizConfig;
  const totalQuestions = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    () => Array(totalQuestions).fill(null)
  );
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
    () => Array(totalQuestions).fill(false)
  );
  const [submitted, setSubmitted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const allAnswered = answeredQuestions.every(Boolean);

  const score = selectedAnswers.reduce<number>((acc, answer, i) => {
    if (answer === questions[i].correct_index) return acc + 1;
    return acc;
  }, 0);

  const scorePercent = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const passThreshold = quizConfig.pass_threshold;
  const passed = passThreshold != null ? scorePercent / 100 >= passThreshold : null;

  function handleAnswerSelect(answerIndex: number) {
    if (answeredQuestions[currentIndex]) return;
    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = answerIndex;
      return next;
    });
    setAnsweredQuestions((prev) => {
      const next = [...prev];
      next[currentIndex] = true;
      return next;
    });
  }

  function handleSubmit() {
    setSubmitted(true);
    onComplete();
  }

  function handleRetake() {
    setCurrentIndex(0);
    setSelectedAnswers(Array(totalQuestions).fill(null));
    setAnsweredQuestions(Array(totalQuestions).fill(false));
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            {title} - Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="h-8 w-8 text-success" />
              <span className="text-2xl font-bold">
                {score}/{totalQuestions} correct ({scorePercent}%)
              </span>
            </div>
            <Progress value={scorePercent} className="h-2" />
            {passed != null && (
              <Badge variant={passed ? "default" : "destructive"} className="mt-2">
                {passed
                  ? "Passed"
                  : `Below threshold (${Math.round((passThreshold ?? 0) * 100)}%)`}
              </Badge>
            )}
          </div>
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleRetake} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-1">
          <span>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span>{answeredQuestions.filter(Boolean).length} answered</span>
        </div>
        <Progress
          value={((currentIndex + 1) / totalQuestions) * 100}
          className="h-1.5"
        />
      </CardHeader>
      <CardContent className="space-y-4">
        <QuizQuestion
          question={{
            question: currentQuestion.question,
            options: currentQuestion.options,
            correct: currentQuestion.correct_index,
            explanation: currentQuestion.explanation ?? "",
          }}
          selectedAnswer={selectedAnswers[currentIndex]}
          showResult={answeredQuestions[currentIndex]}
          onAnswerSelect={handleAnswerSelect}
        />

        {answeredQuestions[currentIndex] && currentQuestion.explanation && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
            <p className="font-medium text-primary mb-1">Explanation</p>
            <p className="text-muted-foreground">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((i) => i - 1)}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentIndex < totalQuestions - 1 ? (
            <Button
              variant="outline"
              size="sm"
              disabled={!answeredQuestions[currentIndex]}
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={!allAnswered}
              onClick={handleSubmit}
            >
              Submit Quiz
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
