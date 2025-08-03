import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Search, 
  Bookmark, 
  ArrowRight, 
  GraduationCap, 
  MessageCircle,
  TrendingUp,
  Users,
  HelpCircle,
  Archive,
  Shield
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { useCategories } from "@/hooks/useProducts";

interface QuickAction {
  title: string;
  description: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  sectionId: string;
  badge?: string;
  priority: number;
}

export function PermissionAwareQuickActions() {
  const navigate = useNavigate();
  const { canAccessSection, getUserTier } = usePermissions();
  const { categories } = useCategories();
  const [availableActions, setAvailableActions] = useState<QuickAction[]>([]);

  const userTier = getUserTier();

  useEffect(() => {
    // Define all possible quick actions
    const allActions: QuickAction[] = [
      {
        title: "Search Products",
        description: "Find specific products and resources",
        route: "/search",
        icon: Search,
        sectionId: "search",
        priority: 10
      },
      {
        title: "My Bookmarks",
        description: "Access your saved products",
        route: "/bookmarks",
        icon: Bookmark,
        sectionId: "bookmarks",
        priority: 8
      },
      {
        title: "CMFAS Exams",
        description: "Exam preparation and resources",
        route: "/cmfas-exams",
        icon: GraduationCap,
        sectionId: "cmfas-exams",
        badge: "Learning",
        priority: 7
      },
      {
        title: "Roleplay Training",
        description: "Practice your sales conversations",
        route: "/roleplay",
        icon: MessageCircle,
        sectionId: "roleplay",
        badge: "Practice",
        priority: 9
      },
      {
        title: "Search by Client Profile",
        description: "Find products for specific client needs",
        route: "/search-by-profile",
        icon: Users,
        sectionId: "search-by-profile",
        priority: 6
      },
      {
        title: "How to Use Portal",
        description: "Learn to navigate the platform",
        route: "/how-to-use",
        icon: HelpCircle,
        sectionId: "how-to-use",
        priority: 3
      },
      {
        title: "Sales Tools",
        description: "Objection handling and sales resources",
        route: "/product/sales-tools-objections",
        icon: TrendingUp,
        sectionId: "sales-tools",
        badge: "Tools",
        priority: 5
      }
    ];

    // Add category quick actions for accessible categories
    const categoryActions: QuickAction[] = categories
      .filter(category => {
        const sectionId = `product-category-${category.id}`;
        return canAccessSection(sectionId);
      })
      .slice(0, 3) // Show top 3 categories
      .map((category, index) => ({
        title: category.name,
        description: category.description || `Explore ${category.name} products`,
        route: `/category/${category.id}`,
        icon: Archive,
        sectionId: `product-category-${category.id}`,
        badge: "Category",
        priority: 4 - index
      }));

    // Filter actions based on permissions and sort by priority
    const filteredActions = [...allActions, ...categoryActions]
      .filter(action => canAccessSection(action.sectionId))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 6); // Show top 6 actions

    setAvailableActions(filteredActions);
  }, [canAccessSection, categories]);

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        {userTier && (
          <Badge variant="outline" className="text-xs">
            {userTier === 'master_admin' ? 'Full Access' : 
             userTier === 'tier_4' ? 'Tier 4 Access' :
             userTier === 'tier_3' ? 'Tier 3 Access' :
             userTier === 'tier_2' ? 'Tier 2 Access' :
             userTier === 'tier_1' ? 'Tier 1 Access' : 'Limited Access'}
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableActions.map((action) => (
          <Card key={action.route} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <action.icon className="h-5 w-5 text-primary" />
                {action.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {action.badge}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-xs mb-3">
                {action.description}
              </CardDescription>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => navigate(action.route)}
              >
                Go
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}