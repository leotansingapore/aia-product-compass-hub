import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

interface AchievementToastProps {
  achievement: {
    name: string;
    description: string;
    icon: string;
    xp_reward: number;
  };
}

export function AchievementToast({ achievement }: AchievementToastProps) {
  return (
    <div className="flex items-center gap-3 p-2">
      <div className="bg-gradient-primary p-2 rounded-full">
        <Award className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{achievement.icon}</span>
          <h4 className="font-semibold text-foreground">Achievement Unlocked!</h4>
        </div>
        <p className="font-medium">{achievement.name}</p>
        <p className="text-sm text-muted-foreground">{achievement.description}</p>
        <Badge variant="secondary" className="mt-1">
          +{achievement.xp_reward} XP
        </Badge>
      </div>
    </div>
  );
}