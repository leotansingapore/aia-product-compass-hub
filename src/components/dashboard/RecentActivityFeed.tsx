import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Bookmark, Eye, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActivityItem {
  id: string;
  type: 'viewed' | 'bookmarked' | 'completed';
  title: string;
  subtitle: string;
  route: string;
  timestamp: string;
}

export function RecentActivityFeed() {
  const navigate = useNavigate();

  // Mock data - in real app, this would come from a hook
  const recentActivity: ActivityItem[] = [
    {
      id: "1",
      type: "viewed",
      title: "Pro Achiever",
      subtitle: "Investment Product",
      route: "/product/pro-achiever",
      timestamp: "2 hours ago"
    },
    {
      id: "2", 
      type: "bookmarked",
      title: "Medical Insurance Guide",
      subtitle: "Training Material",
      route: "/training/medical-guide",
      timestamp: "Yesterday"
    },
    {
      id: "3",
      type: "completed",
      title: "CMFAS Module 9",
      subtitle: "Exam Preparation",
      route: "/cmfas/module/9",
      timestamp: "2 days ago"
    }
  ];

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'viewed':
        return <Eye className="h-4 w-4 text-blue-500" />;
      case 'bookmarked':
        return <Bookmark className="h-4 w-4 text-orange-500" />;
      case 'completed':
        return <Play className="h-4 w-4 text-green-500" />;
    }
  };

  const getBadgeText = (type: ActivityItem['type']) => {
    switch (type) {
      case 'viewed':
        return 'Viewed';
      case 'bookmarked':
        return 'Saved';
      case 'completed':
        return 'Done';
    }
  };

  if (recentActivity.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </div>
      
      <Card className="divide-y">
        {recentActivity.map((item) => (
          <div
            key={item.id}
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors active:bg-muted first:rounded-t-lg last:rounded-b-lg"
            onClick={() => navigate(item.route)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getIcon(item.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <p className="text-micro text-muted-foreground truncate">{item.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <Badge variant="secondary" className="text-micro">
                  {getBadgeText(item.type)}
                </Badge>
                <span className="text-micro text-muted-foreground">{item.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}