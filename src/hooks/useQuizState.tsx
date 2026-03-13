import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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

interface PersistedQuizState {
  currentQuestion: number;
  score: number;
  selectedAnswers: (number | null)[];
  answeredQuestions: boolean[];
}

const storageKey = (productId: string) => `quiz_state_${productId}`;

const loadState = (productId: string, length: number): PersistedQuizState => {
  try {
    const raw = localStorage.getItem(storageKey(productId));
    if (raw) {
      const parsed: PersistedQuizState = JSON.parse(raw);
      // Guard against stale data from a different question set length
      if (
        parsed.selectedAnswers?.length === length &&
        parsed.answeredQuestions?.length === length
      ) {
        return parsed;
      }
    }
  } catch { /* ignore */ }
  return {
    currentQuestion: 0,
    score: 0,
    selectedAnswers: new Array(length).fill(null),
    answeredQuestions: new Array(length).fill(false),
  };
};

export const useQuizState = ({ questions, productId }: UseQuizStateProps) => {
  const { user } = useAuth();

  const initial = loadState(productId, questions.length);

  const [currentQuestion, setCurrentQuestion] = useState(initial.currentQuestion);
  const [score, setScore] = useState(initial.score);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(initial.selectedAnswers);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(initial.answeredQuestions);

  const selectedAnswer = selectedAnswers[currentQuestion];
  const showResult = answeredQuestions[currentQuestion];

  // Persist state to localStorage on every change
  useEffect(() => {
    const state: PersistedQuizState = { currentQuestion, score, selectedAnswers, answeredQuestions };
    localStorage.setItem(storageKey(productId), JSON.stringify(state));
  }, [currentQuestion, score, selectedAnswers, answeredQuestions, productId]);

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
    } else if (answeredQuestions[currentQuestion]) {
      // Record quiz attempt (no XP)
      try {
        await supabase.from('quiz_attempts').insert({
          user_id: user?.id,
          product_id: productId,
          score,
          total_questions: questions.length,
          xp_earned: 0,
        });
      } catch (error) {
        console.error('Failed to record quiz attempt:', error);
      }
      localStorage.removeItem(storageKey(productId));
      setCurrentQuestion(0);
      setScore(0);
      setSelectedAnswers(new Array(questions.length).fill(null));
      setAnsweredQuestions(new Array(questions.length).fill(false));
    }
  }, [currentQuestion, questions.length, answeredQuestions, user, score, productId]);

  const handlePrevious = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  }, [currentQuestion]);

  const handleRestart = useCallback(() => {
    localStorage.removeItem(storageKey(productId));
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswers(new Array(questions.length).fill(null));
    setAnsweredQuestions(new Array(questions.length).fill(false));
  }, [questions.length, productId]);

  const isCorrect = selectedAnswer === questions[currentQuestion].correct;
  const isComplete = answeredQuestions.every(answered => answered);

  return {
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
    user
  };
};