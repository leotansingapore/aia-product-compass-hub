import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth';

interface ExamBestScore {
  score: number;
  total: number;
  pct: number;
}

export function useExamBestScore(productId: string | undefined) {
  const { user } = useSimplifiedAuth();
  const [best, setBest] = useState<ExamBestScore | null>(null);

  useEffect(() => {
    if (!user?.id || !productId) return;

    const slug = productId.replace(/^core-/, '');

    supabase
      .from('quiz_attempts')
      .select('score, total_questions')
      .eq('user_id', user.id)
      .eq('product_id', slug)
      .order('score', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const d = data[0];
          setBest({
            score: d.score,
            total: d.total_questions,
            pct: Math.round((d.score / d.total_questions) * 100),
          });
        }
      });
  }, [user?.id, productId]);

  return best;
}
