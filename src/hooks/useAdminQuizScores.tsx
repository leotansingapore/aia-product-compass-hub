import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UserQuizStat {
  user_id: string;
  display_name: string | null;
  email: string | null;
  total_attempts: number;
  avg_score_pct: number;
  best_score_pct: number;
  last_attempt: string | null;
  product_breakdown: QuizProductBreakdown[];
}

export interface QuizProductBreakdown {
  product_id: string;
  product_title: string;
  attempts: number;
  best_score: number;
  best_total: number;
  best_score_pct: number;
  avg_score_pct: number;
  last_attempt: string | null;
}

interface RawQuizAttempt {
  id: string;
  user_id: string;
  product_id: string;
  score: number;
  total_questions: number;
  xp_earned: number | null;
  completed_at: string;
}

export function useAdminQuizScores() {
  const [stats, setStats] = useState<UserQuizStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('*')
        .order('completed_at', { ascending: false });

      if (attemptsError) throw attemptsError;

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, first_name, last_name');

      if (profilesError) throw profilesError;

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, title');

      if (productsError) throw productsError;

      const profileMap = new Map(
        (profilesData || []).map(p => [p.user_id, p])
      );
      const productMap = new Map(
        (productsData || []).map(p => [p.id, p.title])
      );

      // Group by user
      const userMap = new Map<string, RawQuizAttempt[]>();
      for (const row of (attemptsData || []) as RawQuizAttempt[]) {
        if (!userMap.has(row.user_id)) userMap.set(row.user_id, []);
        userMap.get(row.user_id)!.push(row);
      }

      const result: UserQuizStat[] = [];

      for (const [userId, rows] of userMap.entries()) {
        const profile = profileMap.get(userId);
        const displayName =
          profile?.display_name ||
          (profile?.first_name && profile?.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : null);

        // Product breakdown
        const byProduct = new Map<string, RawQuizAttempt[]>();
        for (const row of rows) {
          if (!byProduct.has(row.product_id)) byProduct.set(row.product_id, []);
          byProduct.get(row.product_id)!.push(row);
        }

        const product_breakdown: QuizProductBreakdown[] = [];
        for (const [productId, pRows] of byProduct.entries()) {
          const scorePcts = pRows.map(r => r.total_questions > 0 ? (r.score / r.total_questions) * 100 : 0);
          const bestIdx = scorePcts.indexOf(Math.max(...scorePcts));
          const totalXp = pRows.reduce((s, r) => s + (r.xp_earned || 0), 0);
          const avgPct = Math.round(scorePcts.reduce((a, b) => a + b, 0) / scorePcts.length);
          const lastAttempt = pRows.reduce(
            (latest, r) => (!latest || r.completed_at > latest ? r.completed_at : latest),
            null as string | null
          );

          product_breakdown.push({
            product_id: productId,
            product_title: productMap.get(productId) || productId,
            attempts: pRows.length,
            best_score: pRows[bestIdx].score,
            best_total: pRows[bestIdx].total_questions,
            best_score_pct: Math.round(scorePcts[bestIdx]),
            avg_score_pct: avgPct,
            last_attempt: lastAttempt,
          });
        }

        const allPcts = rows.map(r => r.total_questions > 0 ? (r.score / r.total_questions) * 100 : 0);
        const avgScorePct = Math.round(allPcts.reduce((a, b) => a + b, 0) / allPcts.length);
        const bestScorePct = Math.round(Math.max(...allPcts));
        const totalXp = rows.reduce((s, r) => s + (r.xp_earned || 0), 0);
        const lastAttempt = rows.reduce(
          (latest, r) => (!latest || r.completed_at > latest ? r.completed_at : latest),
          null as string | null
        );

        result.push({
          user_id: userId,
          display_name: displayName,
          email: profile?.email || null,
          total_attempts: rows.length,
          avg_score_pct: avgScorePct,
          best_score_pct: bestScorePct,
          total_xp_earned: totalXp,
          last_attempt: lastAttempt,
          product_breakdown,
        });
      }

      // Sort by best score descending
      result.sort((a, b) => b.best_score_pct - a.best_score_pct);
      setStats(result);
    } catch (err: any) {
      console.error('Error fetching admin quiz scores:', err);
      setError(err.message || 'Failed to load quiz score data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { stats, loading, error, refetch: fetchData };
}
