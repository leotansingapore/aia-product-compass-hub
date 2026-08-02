import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AchievementToast } from '@/components/AchievementToast';
import { addDays, localDayIso, startOfLocalDayIso } from '@/lib/localDay';

interface QuizResult {
  productId: string;
  /**
   * The real category this product belongs to. `learning_progress.category_id`
   * is NOT NULL, so when the caller genuinely has no category to hand (CMFAS
   * modules, which are not products in a category) we skip the
   * learning_progress row rather than fabricate one — the previous code wrote
   * `productId.split('-')[0]`, which produced "core" for slug ids and the
   * first eight hex characters of a UUID otherwise.
   */
  categoryId?: string | null;
  score: number;
  totalQuestions: number;
  isPerfectScore: boolean;
}

export const useGamification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const calculateXP = (score: number, totalQuestions: number) => {
    const baseXP = 20;
    const bonusXP = Math.floor((score / totalQuestions) * 50);
    return baseXP + bonusXP;
  };

  const recordQuizCompletion = useCallback(async (result: QuizResult) => {
    if (!user || isProcessing) return;

    console.log('🎯 Starting quiz completion recording for user:', user.id, 'result:', result);
    setIsProcessing(true);
    try {
      // Check if user has already completed this quiz today to prevent XP
      // farming. The boundary is the learner's own midnight — a UTC boundary
      // rolled the "day" over at 08:00 in Singapore, so an evening quiz still
      // counted as "today" the following morning.
      const { data: existingAttempt } = await supabase
        .from('quiz_attempts')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', result.productId)
        .gte('completed_at', startOfLocalDayIso())
        .order('completed_at', { ascending: false })
        .limit(1);

      if (existingAttempt && existingAttempt.length > 0) {
        console.log('⚠️ Quiz already completed today, no XP awarded');
        toast({
          title: "Quiz Already Completed Today",
          description: "You've already earned XP for this quiz today. Try again tomorrow!",
          variant: "default",
        });
        return;
      }

      const xpEarned = calculateXP(result.score, result.totalQuestions);
      console.log('💎 Calculated XP:', xpEarned);
      
      // Record quiz attempt
      console.log('📝 Recording quiz attempt...');
      const { error: quizError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          product_id: result.productId,
          score: result.score,
          total_questions: result.totalQuestions,
          xp_earned: xpEarned
        });

      if (quizError) {
        console.error('❌ Quiz attempt error:', quizError);
        throw quizError;
      }
      console.log('✅ Quiz attempt recorded successfully');

      // Record learning progress. Only when we know the real category — see
      // QuizResult.categoryId. The quiz attempt and the XP above are recorded
      // either way, so nothing the learner earned depends on this row.
      if (result.categoryId) {
        console.log('📊 Recording learning progress...');
        const { error: progressError } = await supabase
          .from('learning_progress')
          .insert({
            user_id: user.id,
            category_id: result.categoryId,
            product_id: result.productId,
            progress_type: 'quiz_completed',
            xp_earned: xpEarned
          });

        if (progressError) {
          console.error('❌ Learning progress error:', progressError);
          throw progressError;
        }
        console.log('✅ Learning progress recorded successfully');
      } else {
        console.log('ℹ️ No category id for this quiz — skipping learning_progress row');
      }

      // Update user profile with new XP and level. This runs before the
      // achievement check because the check reads the freshly-bumped streak.
      console.log('🔄 Updating user profile...');
      await updateUserProfile(xpEarned);
      console.log('✅ User profile updated successfully');

      // Check for new achievements. Their XP comes back as a single total and
      // is applied in one further write — previously each award called
      // updateUserProfile individually, landed inside its 5-second throttle,
      // and had its XP silently thrown away.
      console.log('🏆 Checking for achievements...');
      const achievementXp = await checkAchievements(result);
      if (achievementXp > 0) {
        await updateUserProfile(achievementXp);
      }
      console.log('✅ Achievements checked successfully');

      // Show XP toast
      toast({
        title: "Quiz Completed! 🎉",
        description: `You earned ${xpEarned} XP!`,
      });

    } catch (error) {
      console.error('💥 Error recording quiz completion:', error);
      toast({
        title: "Error",
        description: "Failed to record quiz completion",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [user, isProcessing, toast]);

  /**
   * Applies an XP delta to the profile (and recomputes level + streak).
   *
   * There is deliberately no time-based throttle here any more. The old one
   * *discarded* any XP that arrived within 5 seconds of the previous write,
   * and because achievements are checked milliseconds after the quiz XP write,
   * every single badge reward fell inside that window — the learner saw the
   * badge toast but their total_xp never moved. Callers now batch their XP and
   * call this once, so the number of writes is bounded by the caller instead.
   */
  const updateUserProfile = async (xpEarned: number) => {
    if (!user) return;

    try {
      // Get current profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_xp, current_level, last_active_date, streak_days')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const newTotalXP = profile.total_xp + xpEarned;
      
      // Progressive level calculation: Level 1 = 200 XP, Level 2 = 600 XP, Level 3 = 1200 XP, etc.
      // Each level requires (level * 200) XP total
      let newLevel = 1;
      let totalXPNeeded = 0;
      while (totalXPNeeded <= newTotalXP) {
        totalXPNeeded += newLevel * 200;
        if (totalXPNeeded > newTotalXP) break;
        newLevel++;
      }
      
      // Calculate streak against the learner's local calendar day, not UTC.
      const today = localDayIso();
      const lastActive = profile.last_active_date;
      const yesterdayStr = localDayIso(addDays(-1));

      let newStreak = profile.streak_days;
      if (lastActive === yesterdayStr) {
        newStreak += 1;
      } else if (lastActive !== today) {
        newStreak = 1;
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          total_xp: newTotalXP,
          current_level: newLevel,
          last_active_date: today,
          streak_days: newStreak
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Check for level up
      if (newLevel > profile.current_level) {
        toast({
          title: "Level Up! 🚀",
          description: `Congratulations! You've reached Level ${newLevel}!`,
        });
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  /**
   * Awards any newly-earned achievements and returns the TOTAL XP they carry,
   * for the caller to apply in one profile write. Returns 0 if nothing new.
   */
  const checkAchievements = async (result: QuizResult): Promise<number> => {
    if (!user) return 0;

    console.log('🏆 Checking achievements for user:', user.id);

    // Get all achievements and user's current achievements
    const [{ data: allAchievements }, { data: userAchievements }] = await Promise.all([
      supabase.from('achievements').select('*'),
      supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id)
    ]);

    if (!allAchievements || !userAchievements) {
      console.log('❌ Missing achievements or user achievements data');
      return 0;
    }

    console.log('🎯 Found achievements:', allAchievements.length);
    console.log('🏅 User already has:', userAchievements.length, 'achievements');

    const earnedAchievementIds = new Set(userAchievements.map(ua => ua.achievement_id));
    const newAchievements = [];

    for (const achievement of allAchievements) {
      if (earnedAchievementIds.has(achievement.id)) {
        console.log('⏭️ Already earned:', achievement.name);
        continue;
      }

      console.log('🔍 Checking achievement:', achievement.name, achievement.requirement_type, achievement.requirement_value);
      const shouldEarn = await checkAchievementRequirement(achievement, result);
      console.log('✅ Should earn?', shouldEarn);
      
      if (shouldEarn) {
        console.log('🎉 New achievement earned:', achievement.name);
        newAchievements.push(achievement);
      }
    }

    console.log('🆕 Total new achievements:', newAchievements.length);

    // Award new achievements, accumulating their XP rather than writing it one
    // badge at a time.
    let awardedXp = 0;
    for (const achievement of newAchievements) {
      awardedXp += await awardAchievement(achievement);
    }
    console.log('💎 Achievement XP to apply:', awardedXp);
    return awardedXp;
  };

  const checkAchievementRequirement = async (achievement: any, result: QuizResult) => {
    const { requirement_type, requirement_value } = achievement;

    switch (requirement_type) {
      case 'quiz_completion':
        // This should trigger after completing the current quiz
        return true;

      case 'perfect_score':
        return result.isPerfectScore;

      case 'total_quizzes':
        const { count: totalQuizzes } = await supabase
          .from('quiz_attempts')
          .select('*', { count: 'exact' })
          .eq('user_id', user!.id);
        return (totalQuizzes || 0) >= requirement_value;

      case 'streak':
        const { data: profile } = await supabase
          .from('profiles')
          .select('streak_days')
          .eq('user_id', user!.id)
          .single();
        return (profile?.streak_days || 0) >= requirement_value;

      default:
        return false;
    }
  };

  /**
   * Records the badge and returns its XP reward for the caller to batch.
   * Returns 0 if the badge could not be recorded, so no XP is credited for a
   * badge the learner didn't actually get.
   */
  const awardAchievement = async (achievement: any): Promise<number> => {
    if (!user) return 0;

    try {
      // Insert user achievement
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievement.id
        });

      if (error) throw error;

      // Show achievement toast
      toast({
        description: (
          <AchievementToast achievement={achievement} />
        ),
        duration: 5000,
      });

      return achievement.xp_reward ?? 0;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return 0;
    }
  };

  const recordPageVisit = useCallback(async (categoryId: string, productId?: string) => {
    if (!user) return;

    // Throttle page visits - only record once per product per day using localStorage
    const visitKey = `page_visit_${user.id}_${productId || categoryId}`;
    const lastVisit = localStorage.getItem(visitKey);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // Only record if not visited in the last 24 hours
    if (lastVisit && (now - parseInt(lastVisit)) < oneDay) {
      console.log('⏳ Page visit throttled - already recorded today');
      return; // This should prevent the entire function from continuing
    }

    try {
      console.log('📄 Recording new page visit for:', productId || categoryId);
      const { error } = await supabase
        .from('learning_progress')
        .insert({
          user_id: user.id,
          category_id: categoryId,
          product_id: productId,
          progress_type: 'page_visited',
          xp_earned: 5
        });

      if (error) throw error;
      
      // Update localStorage to prevent duplicate calls
      localStorage.setItem(visitKey, now.toString());
      console.log('🏆 Page visit recorded, awarding 5 XP');
      
      await updateUserProfile(5);
    } catch (error) {
      console.error('Error recording page visit:', error);
    }
  }, [user]);

  return {
    recordQuizCompletion,
    recordPageVisit,
    isProcessing
  };
};