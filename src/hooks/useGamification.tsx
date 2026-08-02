import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AchievementToast } from '@/components/AchievementToast';
import { localTimezoneOffsetMinutes } from '@/lib/localDay';

interface QuizResult {
  productId: string;
  /**
   * The real category this product belongs to. When the caller genuinely has no
   * category to hand (CMFAS modules, which are not products in a category) we
   * skip the `learning_progress` row rather than fabricate one — the original
   * code wrote `productId.split('-')[0]`, which produced "core" for slug ids and
   * the first eight hex characters of a UUID otherwise.
   */
  categoryId?: string | null;
  /**
   * The lesson this quiz belongs to, when it is an in-lesson quiz. The daily
   * XP limit is scoped per lesson: keying it on productId alone meant a learner
   * working through a course earned on their first quiz and was then told
   * "Quiz Already Completed Today" on every other lesson in the same product.
   * Omit for a product-level quiz (one per product per day, as before).
   */
  videoId?: string | null;
  score: number;
  totalQuestions: number;
  /**
   * Kept for callers, but no longer trusted: the server decides what counts as
   * a perfect score from the attempt row it wrote.
   */
  isPerfectScore: boolean;
}

/** Shape returned by `award_quiz_xp` / `award_page_visit_xp`. */
interface XpAwardResult {
  duplicate: boolean;
  awarded_xp: number;
  total_xp: number;
  current_level: number;
  previous_level: number;
  leveled_up: boolean;
  streak_days: number;
}

interface ClaimedAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
}

interface ClaimAchievementsResult {
  awarded: ClaimedAchievement[];
  awarded_xp: number;
  total_xp: number;
  current_level: number;
  previous_level: number;
  leveled_up: boolean;
  streak_days: number;
}

/**
 * XP is awarded by the DATABASE, not by this hook.
 *
 * Everything here used to run in the browser: the XP was computed client-side,
 * the `quiz_attempts` row was inserted client-side, and `profiles.total_xp` /
 * `current_level` were then written straight from the client. The own-row RLS
 * policy on `profiles` allowed that, so any learner could paste
 * `supabase.from('profiles').update({ total_xp: 999999 })` into the console and
 * take the leaderboard. The "one quiz per day" limit was a client SELECT
 * followed by an unconditional client INSERT, so it stopped nothing either.
 *
 * The gamification columns are no longer writable by `authenticated` at all
 * (see `supabase/migrations/20260802120000_server_side_xp_award.sql`); these
 * SECURITY DEFINER functions are the only path:
 *
 *   award_quiz_xp       — recomputes the reward, enforces the daily limit
 *   award_page_visit_xp — the 5 XP page-visit award, likewise once per day
 *   claim_achievements  — evaluates badge requirements against the user's rows
 *
 * The user-facing behaviour is unchanged: same toasts, same "Quiz Already
 * Completed Today" path (now driven by the server's `duplicate` flag), same
 * achievement check afterwards, same level-up celebration.
 */
export const useGamification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const celebrateLevelUp = useCallback(
    (result: { leveled_up?: boolean; current_level?: number }) => {
      if (!result?.leveled_up) return;
      toast({
        title: "Level Up! 🚀",
        description: `Congratulations! You've reached Level ${result.current_level}!`,
      });
    },
    [toast],
  );

  /**
   * Claims any newly-earned badges and shows their toasts. The requirements are
   * evaluated server-side, so a client that lies about its quiz result cannot
   * unlock a badge it hasn't earned.
   */
  const claimAchievements = useCallback(async () => {
    // Typed loosely: these functions are newer than the generated Supabase
    // types, which have no entry for them.
    const { data, error } = await (supabase.rpc as any)('claim_achievements', {
      p_tz_offset_minutes: localTimezoneOffsetMinutes(),
    });

    if (error) {
      console.error('Error claiming achievements:', error);
      return;
    }

    const result = data as ClaimAchievementsResult | null;
    for (const achievement of result?.awarded ?? []) {
      toast({
        description: <AchievementToast achievement={achievement} />,
        duration: 5000,
      });
    }
    celebrateLevelUp(result ?? {});
  }, [toast, celebrateLevelUp]);

  const recordQuizCompletion = useCallback(async (result: QuizResult) => {
    if (!user || isProcessing) return;

    setIsProcessing(true);
    try {
      const { data, error } = await (supabase.rpc as any)('award_quiz_xp', {
        p_product_id: result.productId,
        p_video_id: result.videoId ?? null,
        p_score: result.score,
        p_total_questions: result.totalQuestions,
        p_category_id: result.categoryId ?? null,
        p_tz_offset_minutes: localTimezoneOffsetMinutes(),
      });

      if (error) throw error;

      const award = data as XpAwardResult | null;
      if (!award) throw new Error('award_quiz_xp returned no result');

      if (award.duplicate) {
        toast({
          title: "Quiz Already Completed Today",
          description: result.videoId
            ? "You've already earned XP for this lesson's quiz today. Try again tomorrow!"
            : "You've already earned XP for this quiz today. Try again tomorrow!",
          variant: "default",
        });
        return;
      }

      // Level-up celebration first, then badges — the same order as before,
      // when the profile write happened ahead of the achievement check.
      celebrateLevelUp(award);
      await claimAchievements();

      toast({
        title: "Quiz Completed! 🎉",
        description: `You earned ${award.awarded_xp} XP!`,
      });
    } catch (error) {
      console.error('Error recording quiz completion:', error);
      toast({
        title: "Error",
        description: "Failed to record quiz completion",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user, isProcessing, toast, celebrateLevelUp, claimAchievements]);

  const recordPageVisit = useCallback(async (categoryId: string, productId?: string) => {
    if (!user) return;

    // Cheap client-side throttle so a browsing session doesn't fire a request
    // per page view. It is NOT the limit — the server enforces once per local
    // day per (user, category, product), so clearing site data no longer farms
    // 5 XP per refresh the way this localStorage key alone used to allow.
    const visitKey = `page_visit_${user.id}_${productId || categoryId}`;
    const lastVisit = localStorage.getItem(visitKey);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (lastVisit && (now - parseInt(lastVisit)) < oneDay) return;

    try {
      const { data, error } = await (supabase.rpc as any)('award_page_visit_xp', {
        p_category_id: categoryId,
        p_product_id: productId ?? null,
        p_tz_offset_minutes: localTimezoneOffsetMinutes(),
      });

      if (error) throw error;

      localStorage.setItem(visitKey, now.toString());
      celebrateLevelUp((data as XpAwardResult | null) ?? {});
    } catch (error) {
      console.error('Error recording page visit:', error);
    }
  }, [user, celebrateLevelUp]);

  return {
    recordQuizCompletion,
    recordPageVisit,
    isProcessing
  };
};
