import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductChatLauncherProps {
  productName?: string;
  description?: string;
  className?: string;
  productId: string;
  customLink?: string;
  chatbot1Name?: string;
}

export function ProductChatLauncher({
  productName,
  description,
  className = "",
  productId,
  customLink,
  chatbot1Name,
}: ProductChatLauncherProps) {
  const navigate = useNavigate();

  const defaultDescription = productName
    ? `Get instant help with ${productName} details, comparisons, and sales tips`
    : "Get instant help with product details and sales guidance";

  const handleLaunch = () => {
    if (customLink) {
      window.open(customLink, '_blank', 'noopener,noreferrer');
    } else {
      navigate(`/product/${productId}/ai-assistant`);
    }
  };

  return (
    <Card className={`h-full group hover:shadow-md transition-all duration-300 border border-border hover:border-primary/50 bg-card ${className}`}>
      <CardContent className="p-5 pt-5 sm:pt-4 md:pt-6 flex flex-col justify-center h-full relative">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Icon */}
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
            <MessageCircle className="h-7 w-7 text-primary" />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              {chatbot1Name || "Chat with AI Assistant"}
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
            disabled={!customLink}
            aria-label={customLink ? "Open chat with AI assistant" : "Chat not configured"}
            className="w-full h-10 text-sm"
            size="default"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {customLink ? "Open Chat" : "Chat Not Configured"}
            {customLink && <ExternalLink className="h-3.5 w-3.5 ml-1" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
