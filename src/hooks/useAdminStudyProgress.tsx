import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PRODUCT_SLUGS, PRODUCT_LABELS } from '@/types/questionBank';

export interface StudyProductBreakdown {
  product_slug: string;
  mastered_count: number;
  study_total: number;
  mastery_pct: number;
  last_studied: string | null;
}

export interface UserStudyStat {
  user_id: string;
  display_name: string | null;
  email: string | null;
  has_studied: boolean;
  total_mastered: number;
  total_questions: number;
  mastery_pct: number;
  last_studied: string | null;
  product_breakdown: StudyProductBreakdown[];
}

/**
 * Fetches per-user study bank progress across all products.
 * Includes users who have studied but never taken an exam.
 */
export function useAdminStudyProgress() {
  const [stats, setStats] = useState<UserStudyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profilesRes, progressRes, studyTotalsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('user_id, display_name, email, first_name, last_name'),
        supabase
          .from('user_question_progress')
          .select('user_id, product_slug, mastered, last_answered_at'),
        supabase
          .from('question_bank_questions' as never)
          .select('product_slug')
          .eq('bank_type', 'study'),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (progressRes.error) throw progressRes.error;
      if (studyTotalsRes.error) throw studyTotalsRes.error;

      const profiles = profilesRes.data ?? [];
      const progressRows = (progressRes.data ?? []) as Array<{
        user_id: string;
        product_slug: string;
        mastered: boolean;
        last_answered_at: string;
      }>;
      const studyTotals = (studyTotalsRes.data ?? []) as Array<{ product_slug: string }>;

      // Count study questions per product slug
      const studyTotalBySlug = new Map<string, number>();
      for (const row of studyTotals) {
        studyTotalBySlug.set(row.product_slug, (studyTotalBySlug.get(row.product_slug) ?? 0) + 1);
      }
      const totalQuestionsAcrossBank = Array.from(studyTotalBySlug.values()).reduce((a, b) => a + b, 0);

      // Group progress by user
      const progressByUser = new Map<string, typeof progressRows>();
      for (const row of progressRows) {
        if (!progressByUser.has(row.user_id)) progressByUser.set(row.user_id, []);
        progressByUser.get(row.user_id)!.push(row);
      }

      const result: UserStudyStat[] = [];

      for (const profile of profiles) {
        const userRows = progressByUser.get(profile.user_id) ?? [];
        const hasStudied = userRows.length > 0;

        // Group this user's progress by product
        const byProduct = new Map<string, typeof userRows>();
        for (const row of userRows) {
          if (!byProduct.has(row.product_slug)) byProduct.set(row.product_slug, []);
          byProduct.get(row.product_slug)!.push(row);
        }

        const breakdown: StudyProductBreakdown[] = [];
        for (const [slug, rows] of byProduct.entries()) {
          const mastered = rows.filter((r) => r.mastered).length;
          const total = studyTotalBySlug.get(slug) ?? 0;
          const lastStudied = rows.reduce(
            (latest, r) => (!latest || r.last_answered_at > latest ? r.last_answered_at : latest),
            null as string | null
          );
          breakdown.push({
            product_slug: slug,
            mastered_count: mastered,
            study_total: total,
            mastery_pct: total > 0 ? Math.round((mastered / total) * 100) : 0,
            last_studied: lastStudied,
          });
        }

        // Pad breakdown with stubs for products the user hasn't touched yet
        const touchedSlugs = new Set(breakdown.map((b) => b.product_slug));
        for (const slug of PRODUCT_SLUGS) {
          if (!touchedSlugs.has(slug)) {
            breakdown.push({
              product_slug: slug,
              mastered_count: 0,
              study_total: studyTotalBySlug.get(slug) ?? 0,
              mastery_pct: 0,
              last_studied: null,
            });
          }
        }

        const totalMastered = userRows.filter((r) => r.mastered).length;
        // Mastery % is calculated across products the user has ENGAGED with,
        // not the entire question bank (which would produce tiny, misleading %s)
        const touchedTotalQuestions = breakdown.reduce((sum, b) => sum + b.study_total, 0);
        const masteryPct = touchedTotalQuestions > 0
          ? Math.round((totalMastered / touchedTotalQuestions) * 100)
          : 0;
        const lastStudied = userRows.reduce(
          (latest, r) => (!latest || r.last_answered_at > latest ? r.last_answered_at : latest),
          null as string | null
        );

        const displayName =
          profile.display_name ||
          (profile.first_name && profile.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : null);

        result.push({
          user_id: profile.user_id,
          display_name: displayName,
          email: profile.email,
          has_studied: hasStudied,
          total_mastered: totalMastered,
          total_questions: touchedTotalQuestions,
          mastery_pct: masteryPct,
          last_studied: lastStudied,
          product_breakdown: breakdown.sort((a, b) => {
            const aTouched = a.last_studied !== null;
            const bTouched = b.last_studied !== null;
            if (aTouched !== bTouched) return aTouched ? -1 : 1;
            if (aTouched) return b.mastery_pct - a.mastery_pct;
            return (PRODUCT_LABELS[a.product_slug] ?? a.product_slug).localeCompare(
              PRODUCT_LABELS[b.product_slug] ?? b.product_slug
            );
          }),
        });
      }

      // Sort: never-studied last, then by mastery pct descending (to show top performers first)
      result.sort((a, b) => {
        if (a.has_studied !== b.has_studied) return a.has_studied ? -1 : 1;
        return b.mastery_pct - a.mastery_pct;
      });

      setStats(result);
    } catch (err: any) {
      console.error('Error fetching admin study progress:', err);
      setError(err.message || 'Failed to load study progress data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { stats, loading, error, refetch: fetchData };
}
