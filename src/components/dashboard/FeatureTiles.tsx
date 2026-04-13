import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, TrendingUp, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";

interface FeatureTile {
  title: string;
  description: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  badge?: string;
  sectionId: string;
}

export function FeatureTiles() {
  const navigate = useNavigate();
  const { canAccessSection } = usePermissions();

  const tiles: FeatureTile[] = [
    {
      title: "Roleplay Training",
      description: "Practice sales conversations",
      route: "/roleplay",
      icon: MessageSquare,
      gradient: "from-blue-500/10 to-blue-600/20",
      badge: "AI",
      sectionId: "roleplay"
    },
    {
      title: "Sales Tools",
      description: "Resources and calculators",
      route: "/scripts",
      icon: TrendingUp,
      gradient: "from-purple-500/10 to-purple-600/20",
      badge: "Tools",
      sectionId: "sales-tools"
    }
  ];

  const availableTiles = tiles.filter(tile => canAccessSection(tile.sectionId));

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {availableTiles.map((tile) => (
          <Card 
            key={tile.route}
            className={`p-4 cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-br ${tile.gradient} border-0 active:scale-95`}
            onClick={() => navigate(tile.route)}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <tile.icon className="h-6 w-6 text-primary" />
                {tile.badge && (
                  <Badge variant="secondary" className="text-micro px-2 py-0">
                    {tile.badge}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm leading-tight">{tile.title}</h4>
                <p className="text-micro text-muted-foreground leading-tight">{tile.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}