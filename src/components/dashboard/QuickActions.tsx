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
      bgColor: "bg-blue-50",
      borderColor: "group-hover:border-blue-300"
    },
    {
      title: "CMFAS Training",
      description: "Certification modules",
      icon: GraduationCap,
      href: "/cmfas-exams",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "group-hover:border-green-300"
    },
    {
      title: "Client Profiles",
      description: "Search by client needs",
      icon: Users,
      href: "/search-by-profile",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "group-hover:border-purple-300"
    },
    {
      title: "Roleplay Practice",
      description: "Practice sales scenarios",
      icon: MessageSquare,
      href: "/roleplay",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "group-hover:border-orange-300"
    },
    {
      title: "My Bookmarks",
      description: "Saved materials",
      icon: FileText,
      href: "/bookmarks",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "group-hover:border-red-300"
    },
    {
      title: "How to Use",
      description: "Portal guide",
      icon: BarChart3,
      href: "/how-to-use",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "group-hover:border-teal-300"
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-fr">
        {actions.map((action) => (
          <Card
            key={action.title}
            className="h-full hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => navigate(action.href)}
          >
            <CardContent className="h-full !p-6 flex items-center justify-center">
              <div className="flex flex-col items-center text-center space-y-3 w-full">
                <div className={`p-3 rounded-xl ${action.bgColor} ${action.borderColor} group-hover:scale-105 transition-all duration-200 shadow-sm border-2 border-transparent`}>
                  <action.icon className={`h-6 w-6 ${action.color} stroke-[2]`} />
                </div>
                <div>
                  <div className="font-medium text-sm sm:text-base">{action.title}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground mt-1">{action.description}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}