import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AchievementToast } from '@/components/AchievementToast';

interface QuizResult {
  productId: string;
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

    setIsProcessing(true);
    try {
      const xpEarned = calculateXP(result.score, result.totalQuestions);
      
      // Record quiz attempt
      const { error: quizError } = await supabase
        .from('quiz_attempts')
        .insert({
          user_id: user.id,
          product_id: result.productId,
          score: result.score,
          total_questions: result.totalQuestions,
          xp_earned: xpEarned
        });

      if (quizError) throw quizError;

      // Record learning progress
      const { error: progressError } = await supabase
        .from('learning_progress')
        .insert({
          user_id: user.id,
          category_id: result.productId.split('-')[0] || 'general',
          product_id: result.productId,
          progress_type: 'quiz_completed',
          xp_earned: xpEarned
        });

      if (progressError) throw progressError;

      // Update user profile with new XP and level
      await updateUserProfile(xpEarned);

      // Check for new achievements
      await checkAchievements(result);

      // Show XP toast
      toast({
        title: "Quiz Completed! 🎉",
        description: `You earned ${xpEarned} XP!`,
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
  }, [user, isProcessing, toast]);

  const updateUserProfile = async (xpEarned: number) => {
    if (!user) return;

    // Get current profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_xp, current_level, last_active_date, streak_days')
      .eq('user_id', user.id)
      .single();

    if (!profile) return;

    const newTotalXP = profile.total_xp + xpEarned;
    const newLevel = Math.floor(newTotalXP / 200) + 1;
    
    // Calculate streak
    const today = new Date().toISOString().split('T')[0];
    const lastActive = profile.last_active_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

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
  };

  const checkAchievements = async (result: QuizResult) => {
    if (!user) return;

    // Get all achievements and user's current achievements
    const [{ data: allAchievements }, { data: userAchievements }] = await Promise.all([
      supabase.from('achievements').select('*'),
      supabase.from('user_achievements').select('achievement_id').eq('user_id', user.id)
    ]);

    if (!allAchievements || !userAchievements) return;

    const earnedAchievementIds = new Set(userAchievements.map(ua => ua.achievement_id));
    const newAchievements = [];

    for (const achievement of allAchievements) {
      if (earnedAchievementIds.has(achievement.id)) continue;

      const shouldEarn = await checkAchievementRequirement(achievement, result);
      if (shouldEarn) {
        newAchievements.push(achievement);
      }
    }

    // Award new achievements
    for (const achievement of newAchievements) {
      await awardAchievement(achievement);
    }
  };

  const checkAchievementRequirement = async (achievement: any, result: QuizResult) => {
    const { requirement_type, requirement_value } = achievement;

    switch (requirement_type) {
      case 'quiz_completion':
        const { count: quizCount } = await supabase
          .from('quiz_attempts')
          .select('*', { count: 'exact' })
          .eq('user_id', user!.id);
        return (quizCount || 0) >= requirement_value;

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

  const awardAchievement = async (achievement: any) => {
    if (!user) return;

    try {
      // Insert user achievement
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievement.id
        });

      if (error) throw error;

      // Update user XP
      await updateUserProfile(achievement.xp_reward);

      // Show achievement toast
      toast({
        description: (
          <AchievementToast achievement={achievement} />
        ),
        duration: 5000,
      });

    } catch (error) {
      console.error('Error awarding achievement:', error);
    }
  };

  const recordPageVisit = useCallback(async (categoryId: string, productId?: string) => {
    if (!user) return;

    try {
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