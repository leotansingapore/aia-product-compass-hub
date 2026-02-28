import { createPortal } from "react-dom";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FloatingNotebookChatProps {
  notebookLink?: string;
  productName?: string;
}

export function FloatingNotebookChat({
  notebookLink,
  productName = "Product",
}: FloatingNotebookChatProps) {
  const hasLink = Boolean(notebookLink);

  const handleClick = () => {
    if (hasLink && notebookLink) {
      window.open(notebookLink, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleClick}
            disabled={!hasLink}
            className={cn(
              "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
              "transition-all duration-300 hover:scale-110",
              hasLink
                ? "bg-primary hover:bg-primary/90"
                : "bg-muted cursor-not-allowed"
            )}
            size="icon"
            aria-label={hasLink ? "Open NotebookLM Chat" : "Chat not available"}
          >
            <MessageCircle className="h-6 w-6" />
            {/* Pulse indicator when link is available */}
            {hasLink && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-background" />
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          {hasLink ? `Chat about ${productName}` : "Chat not available"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
