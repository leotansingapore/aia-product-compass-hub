import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CMFASChatLauncherProps {
  moduleId?: string;
  moduleName?: string;
  description?: string;
  className?: string;
  variant?: "default" | "compact";
}

export function CMFASChatLauncher({
  moduleId,
  moduleName,
  description,
  className = "",
  variant = "default",
}: CMFASChatLauncherProps) {
  const navigate = useNavigate();

  const handleChatClick = () => {
    const chatPath = moduleId ? `/cmfas/chat/${moduleId}` : "/cmfas/chat";
    navigate(chatPath);
  };

  const defaultDescription = moduleId
    ? `Get instant help with ${moduleId.toUpperCase()} exam topics, explanations, and study guidance`
    : "Get instant help with CMFAS exam preparation and study guidance";

  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "border-border shadow-sm mobile-card",
          className
        )}
      >
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">AI tutor</h3>
              <p className="text-micro mt-0.5 text-muted-foreground leading-snug sm:text-sm">
                {description || defaultDescription}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleChatClick}
            className="shrink-0 mobile-touch-target sm:w-auto"
          >
            Get help
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`group hover:shadow-md transition-all duration-300 hover:scale-[1.02] border-primary/20 hover:border-primary/40 mobile-card ${className}`}>
      <CardContent className="p-4 md:p-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm md:text-base font-semibold text-foreground">
              Chat with AI Tutor
            </h3>
            <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-primary animate-pulse" />
          </div>

          {moduleName && (
            <p className="text-micro md:text-sm font-medium text-muted-foreground mb-2">
              for {moduleName}
            </p>
          )}

          <p className="text-micro md:text-sm text-muted-foreground leading-relaxed mb-3 md:mb-4">
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
      </CardContent>
    </Card>
  );
}
