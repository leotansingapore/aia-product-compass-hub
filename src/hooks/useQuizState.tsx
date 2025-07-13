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
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
    new Array(questions.length).fill(false)
  );

  const handleAnswerSelect = useCallback((answerIndex: number) => {
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
  }, [showResult, questions, currentQuestion, answeredQuestions]);

  const handleNext = useCallback(async () => {
    console.log('handleNext called', { 
      currentQuestion, 
      totalQuestions: questions.length, 
      showResult, 
      user: !!user,
      isComplete: answeredQuestions.every(answered => answered)
    });
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else if (showResult && user) {
      console.log('Quiz completion triggered', { score, totalQuestions: questions.length });
      // Quiz completed - record gamification data
      const isPerfectScore = score === questions.length;
      try {
        await recordQuizCompletion({
          productId,
          score,
          totalQuestions: questions.length,
          isPerfectScore
        });
        console.log('Quiz completion recorded successfully');
        // Reset quiz state after completion
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore(0);
        setAnsweredQuestions(new Array(questions.length).fill(false));
      } catch (error) {
        console.error('Failed to record quiz completion:', error);
      }
    } else {
      console.log('Quiz completion conditions not met', { showResult, user: !!user });
    }
  }, [currentQuestion, questions.length, showResult, user, score, productId, recordQuizCompletion, questions, answeredQuestions]);

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  }, [currentQuestion]);

  const handleRestart = useCallback(() => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
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