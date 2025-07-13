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

  // Level calculation: Each level requires 200 XP
  const getXPForNextLevel = (level: number) => 200;
  const currentLevelXP = profile ? profile.total_xp % 200 : 0;
  const nextLevelXP = 200;
  const progressPercentage = profile ? (currentLevelXP / nextLevelXP) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Level & XP */}
      <Card className="border-accent/20 bg-gradient-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-warning" />
            <span className="font-semibold">Level {profile?.current_level || 1}</span>
          </div>
          <Progress value={progressPercentage} className="mb-2" />
          <p className="text-sm text-muted-foreground">
            {currentLevelXP}/{nextLevelXP} XP
          </p>
        </CardContent>
      </Card>

      {/* Total XP */}
      <Card className="border-accent/20 bg-gradient-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-primary" />
            <span className="font-semibold">Total XP</span>
          </div>
          <p className="text-2xl font-bold text-primary">
            {profile?.total_xp || 0}
          </p>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card className="border-accent/20 bg-gradient-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-warning" />
            <span className="font-semibold">Streak</span>
          </div>
          <p className="text-2xl font-bold text-warning">
            {profile?.streak_days || 0} days
          </p>
        </CardContent>
      </Card>

      {/* Recent Achievement */}
      <Card className="border-accent/20 bg-gradient-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-success" />
            <span className="font-semibold">Latest Achievement</span>
          </div>
          {recentAchievements.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">{recentAchievements[0].icon}</span>
              <div>
                <p className="text-sm font-medium">{recentAchievements[0].name}</p>
                <Badge variant="secondary" className="text-xs">
                  +{recentAchievements[0].xp_reward} XP
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete your first quiz!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}