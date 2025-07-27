import { useState } from "react";
import { Plus, Search, Bookmark, MessageCircle, FileText, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function FloatingQuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const quickActions = [
    {
      icon: Search,
      label: "Search",
      action: () => navigate("/search"),
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      icon: Bookmark,
      label: "Bookmarks",
      action: () => navigate("/bookmarks"),
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      icon: FileText,
      label: "How to Use",
      action: () => navigate("/how-to-use"),
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      icon: MessageCircle,
      label: "Feedback",
      action: () => {
        toast({
          title: "Feedback",
          description: "Feedback feature coming soon!",
        });
      },
      color: "bg-pink-500 hover:bg-pink-600"
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Action Menu */}
      {isOpen && (
        <Card className="mb-4 shadow-lg animate-fade-in">
          <CardContent className="p-2">
            <div className="flex flex-col gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    action.action();
                    setIsOpen(false);
                  }}
                  className="justify-start gap-3 h-10"
                >
                  <div className={`w-8 h-8 rounded-full ${action.color} flex items-center justify-center`}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-medium">{action.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main FAB */}
      <Button
        size="lg"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full shadow-lg transition-all duration-200 
          ${isOpen 
            ? 'bg-red-500 hover:bg-red-600 rotate-45' 
            : 'bg-primary hover:bg-primary/90 hover:scale-110'
          }
        `}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Plus className="h-6 w-6" />
        )}
        <span className="sr-only">Quick Actions</span>
      </Button>
    </div>
  );
}