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
    <Card className={`group hover:shadow-md transition-all duration-300 hover:scale-[1.02] border-primary/20 hover:border-primary/40 mobile-card ${className}`}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start gap-3 md:gap-4">
          {/* Icon */}
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-primary rounded-lg md:rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
            <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm md:text-base font-semibold text-foreground">
                Chat with AI Tutor
              </h3>
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-primary animate-pulse" />
            </div>
            
            {moduleName && (
              <p className="text-xs md:text-sm font-medium text-muted-foreground mb-2">
                for {moduleName}
              </p>
            )}
            
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-3 md:mb-4">
              {description || defaultDescription}
            </p>
            
            <Button 
              onClick={handleChatClick}
              className="w-full group-hover:shadow-md transition-all duration-300 mobile-touch-target"
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