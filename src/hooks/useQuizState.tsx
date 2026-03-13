import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface UseQuizStateProps {
  questions: QuizQuestion[];
  productId: string;
}

export const useQuizState = ({ questions, productId }: UseQuizStateProps) => {
  const { user } = useAuth();
  const { recordQuizCompletion } = useGamification();
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  // Store each question's selected answer and whether result is shown
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
    new Array(questions.length).fill(false)
  );

  const selectedAnswer = selectedAnswers[currentQuestion];
  const showResult = answeredQuestions[currentQuestion];

  const handleAnswerSelect = useCallback((answerIndex: number) => {
    if (answeredQuestions[currentQuestion]) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
    
    const newAnswered = [...answeredQuestions];
    newAnswered[currentQuestion] = true;
    setAnsweredQuestions(newAnswered);
    
    if (answerIndex === questions[currentQuestion].correct) {
      setScore(prev => prev + 1);
    }
  }, [answeredQuestions, selectedAnswers, questions, currentQuestion]);

  const handleNext = useCallback(async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else if (answeredQuestions[currentQuestion] && user) {
      const isPerfectScore = score === questions.length;
      try {
        await recordQuizCompletion({
          productId,
          score,
          totalQuestions: questions.length,
          isPerfectScore
        });
        setCurrentQuestion(0);
        setScore(0);
        setSelectedAnswers(new Array(questions.length).fill(null));
        setAnsweredQuestions(new Array(questions.length).fill(false));
      } catch (error) {
        console.error('Failed to record quiz completion:', error);
      }
    }
  }, [currentQuestion, questions.length, answeredQuestions, user, score, productId, recordQuizCompletion]);

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  const handleRestart = useCallback(() => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswers(new Array(questions.length).fill(null));
    setAnsweredQuestions(new Array(questions.length).fill(false));
  }, [questions.length]);

  const isCorrect = selectedAnswer === questions[currentQuestion].correct;
  const isComplete = answeredQuestions.every(answered => answered);

  return {
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
  };
};