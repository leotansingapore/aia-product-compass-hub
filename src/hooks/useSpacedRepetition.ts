import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';
import { ConceptCard } from '@/hooks/useConceptCards';

export type Grade = 'again' | 'hard' | 'good' | 'easy';

interface ReviewRow {
  id: string;
  user_id: string;
  card_id: string;
  ease_factor: number;
  interval_days: number;
  due_date: string; // ISO date string yyyy-mm-dd
  last_grade: Grade;
  reviewed_at: string;
}

// SM-2 algorithm
function computeNextInterval(
  current: { ease_factor: number; interval_days: number },
  grade: Grade,
): { ease_factor: number; interval_days: number; due_date: string } {
  let { ease_factor, interval_days } = current;

  switch (grade) {
    case 'again':
      interval_days = 1;
      ease_factor = Math.max(1.3, ease_factor - 0.2);
      break;
    case 'hard':
      interval_days = Math.max(1, Math.round(interval_days * 1.2));
      ease_factor = Math.max(1.3, ease_factor - 0.15);
      break;
    case 'good':
      interval_days = Math.round(interval_days * ease_factor);
      break;
    case 'easy':
      interval_days = Math.round(interval_days * ease_factor * 1.3);
      ease_factor = Math.min(2.5, ease_factor + 0.15);
      break;
  }

  // Ensure minimum 1 day
  interval_days = Math.max(1, interval_days);

  const due = new Date();
  due.setDate(due.getDate() + interval_days);
  const due_date = due.toISOString().split('T')[0];

  return { ease_factor, interval_days, due_date };
}

// Preview intervals for hint display (no state mutation)
export function previewIntervals(current: { ease_factor: number; interval_days: number }): Record<Grade, number> {
  const grades: Grade[] = ['again', 'hard', 'good', 'easy'];
  const result = {} as Record<Grade, number>;
  for (const g of grades) {
    result[g] = computeNextInterval(current, g).interval_days;
  }
  return result;
}

export function formatInterval(days: number): string {
  if (days === 1) return '1d';
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.round(days / 7)}w`;
  return `${Math.round(days / 30)}mo`;
}

interface UseSpacedRepetitionReturn {
  reviews: Map<string, ReviewRow>;
  dueCards: ConceptCard[];
  reviewStats: { dueToday: number; reviewedToday: number };
  gradeCard: (cardId: string, grade: Grade) => Promise<void>;
  isDue: (cardId: string) => boolean;
  getReview: (cardId: string) => ReviewRow | undefined;
  loading: boolean;
}

export function useSpacedRepetition(cards: ConceptCard[]): UseSpacedRepetitionReturn {
  const { user } = useSimplifiedAuth();
  const [reviews, setReviews] = useState<Map<string, ReviewRow>>(new Map());
  const [loading, setLoading] = useState(true);

  // Load reviews from DB
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const cardIds = cards.map(c => c.id);
    if (cardIds.length === 0) { setLoading(false); return; }

    setLoading(true);
    supabase
      .from('concept_card_reviews')
      .select('*')
      .eq('user_id', user.id)
      .in('card_id', cardIds)
      .then(({ data, error }) => {
        if (error) { console.error('SRS load error:', error); }
        const map = new Map<string, ReviewRow>();
        for (const row of data ?? []) {
          map.set(row.card_id, row as ReviewRow);
        }
        setReviews(map);
        setLoading(false);
      });
  }, [user, cards.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const today = new Date().toISOString().split('T')[0];

  const isDue = useCallback((cardId: string): boolean => {
    const r = reviews.get(cardId);
    if (!r) return true; // never reviewed → always due
    return r.due_date <= today;
  }, [reviews, today]);

  const dueCards = cards.filter(c => isDue(c.id));

  const reviewStats = {
    dueToday: dueCards.length,
    reviewedToday: [...reviews.values()].filter(r =>
      r.reviewed_at.startsWith(new Date().toISOString().slice(0, 10))
    ).length,
  };

  const gradeCard = useCallback(async (cardId: string, grade: Grade) => {
    if (!user) return;

    const existing = reviews.get(cardId);
    const current = existing
      ? { ease_factor: existing.ease_factor, interval_days: existing.interval_days }
      : { ease_factor: 2.5, interval_days: 1 };

    const next = computeNextInterval(current, grade);

    const upsertData = {
      user_id: user.id,
      card_id: cardId,
      ease_factor: next.ease_factor,
      interval_days: next.interval_days,
      due_date: next.due_date,
      last_grade: grade,
      reviewed_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('concept_card_reviews')
      .upsert(upsertData, { onConflict: 'user_id,card_id' })
      .select()
      .single();

    if (error) {
      console.error('SRS grade error:', error);
      return;
    }

    setReviews(prev => {
      const updated = new Map(prev);
      updated.set(cardId, data as ReviewRow);
      return updated;
    });
  }, [user, reviews]);

  const getReview = useCallback((cardId: string) => reviews.get(cardId), [reviews]);

  return { reviews, dueCards, reviewStats, gradeCard, isDue, getReview, loading };
}
