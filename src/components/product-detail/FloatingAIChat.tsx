import { useState } from "react";
import { createPortal } from "react-dom";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ProductKnowledgeChat } from "./ProductKnowledgeChat";

interface FloatingAIChatProps {
  productId: string;
  productName: string;
}

export function FloatingAIChat({ productId, productName }: FloatingAIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const portal = (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            "fixed z-[9999] bg-background border rounded-xl shadow-2xl flex flex-col overflow-hidden",
            isMobile
              ? "bottom-20 right-2 w-[calc(100vw-1rem)] h-[70vh]"
              : "bottom-24 right-6 w-[420px] h-[600px]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-primary/5">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">{productName} AI</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Chat body */}
          <div className="flex-1 min-h-0">
            <ProductKnowledgeChat
              productId={productId}
              productName={productName}
            />
          </div>
        </div>
      )}

      {/* FAB */}
      <Button
        onClick={() => setIsOpen((o) => !o)}
        className={cn(
          "fixed z-[9999] h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
          "bg-primary hover:bg-primary/90",
          isMobile ? "bottom-20 right-4" : "bottom-6 right-6"
        )}
        size="icon"
        aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <Bot className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary border-2 border-background" />
            </span>
          </>
        )}
      </Button>
    </>
  );

  return createPortal(portal, document.body);
}
