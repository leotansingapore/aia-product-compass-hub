import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CMFASChatLauncherProps {
  moduleId?: string;
  moduleName?: string;
  description?: string;
  className?: string;
}

export function CMFASChatLauncher({ 
  moduleId, 
  moduleName, 
  description,
  className = ""
}: CMFASChatLauncherProps) {
  const navigate = useNavigate();

  const handleChatClick = () => {
    const chatPath = moduleId ? `/cmfas/chat/${moduleId}` : '/cmfas/chat';
    navigate(chatPath);
  };

  const defaultDescription = moduleId 
    ? `Get instant help with ${moduleId.toUpperCase()} exam topics, explanations, and study guidance`
    : "Get instant help with CMFAS exam preparation and study guidance";

  return (
    <Card className={`group hover:shadow-md transition-all duration-300 hover:scale-[1.02] border-primary/20 hover:border-primary/40 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <MessageCircle className="h-6 w-6 text-primary-foreground" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground">
                Chat with AI Tutor
              </h3>
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            </div>
            
            {moduleName && (
              <p className="text-sm font-medium text-muted-foreground mb-2">
                for {moduleName}
              </p>
            )}
            
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {description || defaultDescription}
            </p>
            
            <Button 
              onClick={handleChatClick}
              className="w-full group-hover:shadow-md transition-all duration-300"
              size="sm"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}