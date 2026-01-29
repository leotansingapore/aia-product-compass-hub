import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  const [isOpen, setIsOpen] = useState(false);
  const hasLink = Boolean(notebookLink);

  return (
    <>
      {/* Floating Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => hasLink && setIsOpen(true)}
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

      {/* Slide-out Sheet with iframe */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          className="w-full sm:max-w-[450px] p-0 flex flex-col"
          side="right"
        >
          <SheetHeader className="px-4 py-3 border-b bg-muted/30">
            <SheetTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-5 w-5 text-primary" />
              Chat about {productName}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 min-h-0">
            {notebookLink && (
              <iframe
                src={notebookLink}
                className="w-full h-full border-0"
                allow="microphone; camera"
                title={`NotebookLM Chat - ${productName}`}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
