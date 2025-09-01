import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  MessageSquare,
  FileText,
  GraduationCap
} from "lucide-react";

export function QuickActions() {
  const navigate = useNavigate();

  // Debug logging to help identify visibility issues
  console.log('[QuickActions] Rendering QuickActions component');

  const actions = [
    {
      title: "Browse Products",
      description: "Explore all product categories", 
      icon: BookOpen,
      href: "/",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "CMFAS Training",
      description: "Certification modules",
      icon: GraduationCap, 
      href: "/cmfas-exams",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Client Profiles",
      description: "Search by client needs",
      icon: Users,
      href: "/search-by-profile",
      color: "text-purple-600", 
      bgColor: "bg-purple-50"
    },
    {
      title: "Roleplay Practice", 
      description: "Practice sales scenarios",
      icon: MessageSquare,
      href: "/roleplay",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "My Bookmarks",
      description: "Saved materials",
      icon: FileText,
      href: "/bookmarks",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "How to Use",
      description: "Portal guide",
      icon: BarChart3,
      href: "/how-to-use",
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action) => (
          <Card 
            key={action.title} 
            className="hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => navigate(action.href)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-3 rounded-lg ${action.bgColor} group-hover:scale-110 transition-transform`}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <div>
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}