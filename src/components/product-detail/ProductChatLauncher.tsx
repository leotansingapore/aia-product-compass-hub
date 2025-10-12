import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductChatLauncherProps {
  productName?: string;
  description?: string;
  className?: string;
  productId: string;
}

export function ProductChatLauncher({
  productName,
  description,
  className = "",
  productId,
}: ProductChatLauncherProps) {
  const navigate = useNavigate();
  const defaultDescription = productName
    ? `Get instant help with ${productName} details, comparisons, and sales tips`
    : "Get instant help with product details and sales guidance";

  const handleLaunch = () => {
    navigate(`/product/${productId}/ai-assistant`);
  };

  return (
    <Card className={`group hover:shadow-md transition-all duration-300 hover:scale-[1.02] border-primary/20 hover:border-primary/40 mobile-card ${className}`}>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex items-start">
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm md:text-base font-semibold text-foreground">Chat with AI Assistant</h3>
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-primary animate-pulse" />
            </div>

            {productName && (
              <p className="text-micro md:text-sm font-medium text-muted-foreground mb-2">for {productName}</p>
            )}

            <p className="text-micro md:text-sm text-muted-foreground leading-relaxed mb-3 md:mb-4">
              {description || defaultDescription}
            </p>

            <Button
              type="button"
              onClick={handleLaunch}
              aria-label="Start chat with AI assistant"
              className="w-full h-12 md:h-10 text-base md:text-sm group-hover:shadow-md transition-all duration-300 mobile-touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [touch-action:manipulation]"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Start Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
