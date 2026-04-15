import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PRODUCT_SLUGS, PRODUCT_LABELS } from '@/types/questionBank';

export interface UserQuizStat {
  user_id: string;
  display_name: string | null;
  email: string | null;
  total_attempts: number;
  avg_score_pct: number;
  best_score_pct: number;
  last_attempt: string | null;
  product_breakdown: QuizProductBreakdown[];
  has_taken_quiz: boolean;
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
  mastered_count: number;
  study_total: number;
}

// Reverse-lookup: product title → slug. Used to join quiz_attempts (UUID) to
// user_question_progress / question_bank_questions (slug-based).
const titleToSlug: Record<string, string> = Object.fromEntries(
  Object.entries(PRODUCT_LABELS).map(([slug, label]) => [label, slug])
);

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

      // Mastery aggregates: count mastered rows per user × product_slug.
      const { data: masteryData, error: masteryError } = await supabase
        .from('user_question_progress')
        .select('user_id, product_slug, mastered');

      if (masteryError) throw masteryError;

      // Study-bank totals per product_slug, for denominator.
      const { data: studyTotalsData, error: studyTotalsError } = await supabase
        .from('question_bank_questions' as never)
        .select('product_slug')
        .eq('bank_type', 'study');

      if (studyTotalsError) throw studyTotalsError;

      const studyTotalBySlug = new Map<string, number>();
      for (const row of (studyTotalsData ?? []) as Array<{ product_slug: string }>) {
        studyTotalBySlug.set(row.product_slug, (studyTotalBySlug.get(row.product_slug) ?? 0) + 1);
      }

      const masteryByUserSlug = new Map<string, Map<string, number>>();
      for (const row of (masteryData ?? []) as Array<{ user_id: string; product_slug: string; mastered: boolean }>) {
        if (!row.mastered) continue;
        if (!masteryByUserSlug.has(row.user_id)) masteryByUserSlug.set(row.user_id, new Map());
        const inner = masteryByUserSlug.get(row.user_id)!;
        inner.set(row.product_slug, (inner.get(row.product_slug) ?? 0) + 1);
      }

      const profileMap = new Map(
        (profilesData || []).map(p => [p.user_id, p])
      );
      const productMap = new Map(
        (productsData || []).map(p => [p.id, p.title])
      );

      // Map slug → product_id (for padding not-taken product rows)
      const slugToProductId = new Map<string, string>();
      for (const p of (productsData || [])) {
        const slug = titleToSlug[p.title];
        if (slug) slugToProductId.set(slug, p.id);
      }

      // Group attempts by user
      const attemptsByUser = new Map<string, RawQuizAttempt[]>();
      for (const row of (attemptsData || []) as RawQuizAttempt[]) {
        if (!attemptsByUser.has(row.user_id)) attemptsByUser.set(row.user_id, []);
        attemptsByUser.get(row.user_id)!.push(row);
      }

      const result: UserQuizStat[] = [];

      // Iterate over ALL profiles so we include users who haven't taken any quiz
      for (const profile of profilesData || []) {
        const userId = profile.user_id;
        const rows = attemptsByUser.get(userId) ?? [];
        const hasTakenQuiz = rows.length > 0;

        const displayName =
          profile.display_name ||
          (profile.first_name && profile.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : null);

        // Product breakdown (empty if user has no attempts)
        const byProduct = new Map<string, RawQuizAttempt[]>();
        for (const row of rows) {
          if (!byProduct.has(row.product_id)) byProduct.set(row.product_id, []);
          byProduct.get(row.product_id)!.push(row);
        }

        const product_breakdown: QuizProductBreakdown[] = [];
        const attemptedProductIds = new Set<string>();
        for (const [productId, pRows] of byProduct.entries()) {
          const scorePcts = pRows.map(r => r.total_questions > 0 ? (r.score / r.total_questions) * 100 : 0);
          const bestIdx = scorePcts.indexOf(Math.max(...scorePcts));
          const avgPct = Math.round(scorePcts.reduce((a, b) => a + b, 0) / scorePcts.length);
          const lastAttempt = pRows.reduce(
            (latest, r) => (!latest || r.completed_at > latest ? r.completed_at : latest),
            null as string | null
          );

          const productTitle = productMap.get(productId) || productId;
          const slug = titleToSlug[productTitle];
          const masteredCount = slug ? (masteryByUserSlug.get(userId)?.get(slug) ?? 0) : 0;
          const studyTotal = slug ? (studyTotalBySlug.get(slug) ?? 0) : 0;

          attemptedProductIds.add(productId);
          product_breakdown.push({
            product_id: productId,
            product_title: productTitle,
            attempts: pRows.length,
            best_score: pRows[bestIdx].score,
            best_total: pRows[bestIdx].total_questions,
            best_score_pct: Math.round(scorePcts[bestIdx]),
            avg_score_pct: avgPct,
            last_attempt: lastAttempt,
            mastered_count: masteredCount,
            study_total: studyTotal,
          });
        }

        // Pad breakdown with stubs for products the user hasn't attempted
        for (const slug of PRODUCT_SLUGS) {
          const productId = slugToProductId.get(slug);
          if (!productId || attemptedProductIds.has(productId)) continue;
          const masteredCount = masteryByUserSlug.get(userId)?.get(slug) ?? 0;
          const studyTotal = studyTotalBySlug.get(slug) ?? 0;
          product_breakdown.push({
            product_id: productId,
            product_title: PRODUCT_LABELS[slug] ?? slug,
            attempts: 0,
            best_score: 0,
            best_total: 0,
            best_score_pct: 0,
            avg_score_pct: 0,
            last_attempt: null,
            mastered_count: masteredCount,
            study_total: studyTotal,
          });
        }

        // Sort: attempted (by best_score desc) first, then not-attempted (alphabetical)
        product_breakdown.sort((a, b) => {
          const aAttempted = a.attempts > 0;
          const bAttempted = b.attempts > 0;
          if (aAttempted !== bAttempted) return aAttempted ? -1 : 1;
          if (aAttempted) return b.best_score_pct - a.best_score_pct;
          return a.product_title.localeCompare(b.product_title);
        });

        const allPcts = rows.map(r => r.total_questions > 0 ? (r.score / r.total_questions) * 100 : 0);
        const avgScorePct = allPcts.length > 0 ? Math.round(allPcts.reduce((a, b) => a + b, 0) / allPcts.length) : 0;
        const bestScorePct = allPcts.length > 0 ? Math.round(Math.max(...allPcts)) : 0;
        const lastAttempt = rows.reduce(
          (latest, r) => (!latest || r.completed_at > latest ? r.completed_at : latest),
          null as string | null
        );

        result.push({
          user_id: userId,
          display_name: displayName,
          email: profile.email || null,
          total_attempts: rows.length,
          avg_score_pct: avgScorePct,
          best_score_pct: bestScorePct,
          last_attempt: lastAttempt,
          product_breakdown,
          has_taken_quiz: hasTakenQuiz,
        });
      }

      // Sort: users who have taken quizzes first (by best score desc), then never-taken users
      result.sort((a, b) => {
        if (a.has_taken_quiz !== b.has_taken_quiz) return a.has_taken_quiz ? -1 : 1;
        return b.best_score_pct - a.best_score_pct;
      });
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
