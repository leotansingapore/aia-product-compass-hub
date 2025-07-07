import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const { recordQuizCompletion } = useGamification();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(new Array(questions.length).fill(false));

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === questions[currentQuestion].correct) {
      if (!answeredQuestions[currentQuestion]) {
        setScore(prev => prev + 1);
      }
    }
    
    const newAnswered = [...answeredQuestions];
    newAnswered[currentQuestion] = true;
    setAnsweredQuestions(newAnswered);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else if (showResult && user) {
      // Quiz completed - record gamification data
      const isPerfectScore = score === questions.length;
      recordQuizCompletion({
        productId,
        score,
        totalQuestions: questions.length,
        isPerfectScore
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnsweredQuestions(new Array(questions.length).fill(false));
  };

  const isCorrect = selectedAnswer === questions[currentQuestion].correct;
  const isComplete = answeredQuestions.every(answered => answered);

  return (
    <Card className="border-accent/20 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span>🧠</span> Knowledge Quiz
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {currentQuestion + 1} of {questions.length}
            </Badge>
            {isComplete && (
              <Badge variant={score >= questions.length * 0.7 ? "default" : "secondary"}>
                Score: {score}/{questions.length}
              </Badge>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Test your product knowledge with this interactive quiz
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Progress Indicator */}
          <div className="flex gap-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full ${
                  index < currentQuestion 
                    ? 'bg-success' 
                    : index === currentQuestion 
                    ? 'bg-primary' 
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Question */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {questions[currentQuestion].question}
            </h3>
            
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    showResult
                      ? index === questions[currentQuestion].correct
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
                        {index === questions[currentQuestion].correct ? (
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

          {/* Explanation */}
          {showResult && (
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
                    {questions[currentQuestion].explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {isComplete && (
                <Button 
                  variant="outline" 
                  onClick={handleRestart}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restart Quiz
                </Button>
              )}
              
              {currentQuestion < questions.length - 1 ? (
                <Button 
                  onClick={handleNext}
                  disabled={!showResult}
                >
                  Next Question
                </Button>
              ) : (
                showResult && (
                  <Button 
                    onClick={handleNext}
                    disabled={!user}
                    variant="hero"
                    className="px-6"
                  >
                    {user ? `Complete Quiz (+${20 + Math.floor((score / questions.length) * 50)} XP)` : 'Sign in to earn XP'}
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}