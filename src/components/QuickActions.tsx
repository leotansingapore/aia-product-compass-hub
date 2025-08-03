import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Wrench, ArrowRight, Clock, TrendingUp, Bookmark } from "lucide-react";

interface QuickAction {
  title: string;
  description: string;
  action: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  priority: number;
}

const quickActions: QuickAction[] = [
  {
    title: 'How to Use This Portal',
    description: 'Get started with the learning platform and discover all features',
    action: 'Start Tutorial',
    route: '/how-to-use',
    icon: BookOpen,
    badge: 'Essential',
    priority: 1
  },
  {
    title: 'Search by Client Profile',
    description: 'Find perfect products for specific client needs and scenarios',
    action: 'Search Now',
    route: '/search-by-profile',
    icon: Search,
    priority: 2
  },
  {
    title: 'My Bookmarks',
    description: 'View your saved products and important resources',
    action: 'View Bookmarks',
    route: '/bookmarks',
    icon: Bookmark,
    priority: 4
  }
];

export function QuickActions() {
  const navigate = useNavigate();
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);

  useEffect(() => {
    // Load recently used actions from localStorage
    const recent = localStorage.getItem('recentQuickActions');
    if (recent) {
      setRecentlyUsed(JSON.parse(recent));
    }
  }, []);

  const handleActionClick = (action: QuickAction) => {
    // Track usage
    const newRecent = [action.route, ...recentlyUsed.filter(r => r !== action.route)].slice(0, 3);
    setRecentlyUsed(newRecent);
    localStorage.setItem('recentQuickActions', JSON.stringify(newRecent));
    
    navigate(action.route);
  };

  const sortedActions = [...quickActions].sort((a, b) => {
    // Prioritize recently used, then by priority
    const aRecentIndex = recentlyUsed.indexOf(a.route);
    const bRecentIndex = recentlyUsed.indexOf(b.route);
    
    if (aRecentIndex !== -1 && bRecentIndex !== -1) {
      return aRecentIndex - bRecentIndex;
    }
    if (aRecentIndex !== -1) return -1;
    if (bRecentIndex !== -1) return 1;
    
    return a.priority - b.priority;
  });

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg md:text-xl font-semibold">Quick Actions</h3>
        {recentlyUsed.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Recently used</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {sortedActions.map((action, index) => {
          const isRecentlyUsed = recentlyUsed.includes(action.route);
          const Icon = action.icon;
          
          return (
            <Card 
              key={action.route} 
              className={`group hover:shadow-card transition-all cursor-pointer ${
                isRecentlyUsed ? 'ring-1 ring-primary/30 bg-primary/5' : ''
              }`}
              onClick={() => handleActionClick(action)}
            >
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      isRecentlyUsed ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-sm group-hover:text-primary transition-colors">
                      {action.title}
                    </CardTitle>
                  </div>
                  {action.badge && (
                    <Badge variant={action.badge === 'Essential' ? 'default' : 'secondary'} className="text-xs hidden sm:inline-flex">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs mt-1 line-clamp-2 md:line-clamp-none">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <Button 
                  variant={isRecentlyUsed ? "default" : "outline"} 
                  className="w-full"
                  size="sm"
                >
                  <span className="text-xs">{action.action}</span>
                  <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}