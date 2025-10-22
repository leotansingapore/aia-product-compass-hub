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
    <Card className={`h-full group hover:shadow-md transition-all duration-300 border border-border hover:border-primary/50 bg-card ${className}`}>
      <CardContent className="p-5 pt-5 sm:pt-4 md:pt-6 flex flex-col justify-center h-full">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Icon */}
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
            <MessageCircle className="h-7 w-7 text-primary" />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Chat with AI Assistant
            </h3>
            {productName && (
              <p className="text-xs font-medium text-primary">
                for {productName}
              </p>
            )}
            <p className="text-xs text-muted-foreground leading-snug">
              {description || defaultDescription}
            </p>
          </div>

          {/* Button */}
          <Button
            type="button"
            onClick={handleLaunch}
            aria-label="Start chat with AI assistant"
            className="w-full h-10 text-sm"
            size="default"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Start Chat
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
