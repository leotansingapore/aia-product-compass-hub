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
      color: "text-white",
      bgColor: "bg-blue-600"
    },
    {
      title: "CMFAS Training",
      description: "Certification modules",
      icon: GraduationCap,
      href: "/cmfas-exams",
      color: "text-white",
      bgColor: "bg-green-600"
    },
    {
      title: "Client Profiles",
      description: "Search by client needs",
      icon: Users,
      href: "/search-by-profile",
      color: "text-white",
      bgColor: "bg-purple-600"
    },
    {
      title: "Roleplay Practice",
      description: "Practice sales scenarios",
      icon: MessageSquare,
      href: "/roleplay",
      color: "text-white",
      bgColor: "bg-orange-600"
    },
    {
      title: "My Bookmarks",
      description: "Saved materials",
      icon: FileText,
      href: "/bookmarks",
      color: "text-white",
      bgColor: "bg-red-600"
    },
    {
      title: "How to Use",
      description: "Portal guide",
      icon: BarChart3,
      href: "/how-to-use",
      color: "text-white",
      bgColor: "bg-teal-600"
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action) => (
          <Card
            key={action.title}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(action.href)}
          >
            <CardContent className="!p-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${action.bgColor} shadow-md`}>
                  <action.icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{action.title}</h4>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}