import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Award, Target, Zap } from "lucide-react";

interface UserProfile {
  display_name: string;
  current_level: number;
  total_xp: number;
  streak_days: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
  earned_at?: string;
}

export function UserStats() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Listen for real-time updates to user achievements and profiles with throttling
  useEffect(() => {
    if (!user) return;

    let timeoutId: NodeJS.Timeout;

    const debouncedFetch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log('🔄 Debounced fetch triggered');
        fetchUserData();
      }, 1000); // Wait 1 second before fetching
    };

    const channel = supabase
      .channel('user-stats-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('New achievement detected, scheduling refresh');
          debouncedFetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('Profile updated, scheduling refresh');
          debouncedFetch();
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch recent achievements
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select(`
          earned_at,
          achievements (
            id,
            name,
            description,
            icon,
            category,
            xp_reward
          )
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
        .limit(3);

      if (achievementsData) {
        const formattedAchievements = achievementsData.map(item => ({
          ...item.achievements,
          earned_at: item.earned_at
        })) as Achievement[];
        setRecentAchievements(formattedAchievements);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return null;
  }

  // Progressive level calculation helper functions
  const getXPForLevel = (level: number) => {
    let totalXP = 0;
    for (let i = 1; i < level; i++) {
      totalXP += i * 200;
    }
    return totalXP;
  };
  
  const getXPForNextLevel = (level: number) => level * 200;
  const xpForCurrentLevel = profile ? getXPForLevel(profile.current_level) : 0;
  const currentLevelXP = profile ? profile.total_xp - xpForCurrentLevel : 0;
  const nextLevelXP = profile ? getXPForNextLevel(profile.current_level) : 200;
  const progressPercentage = profile ? (currentLevelXP / nextLevelXP) * 100 : 0;

  // Remove gamification elements per user request
  return null;
}