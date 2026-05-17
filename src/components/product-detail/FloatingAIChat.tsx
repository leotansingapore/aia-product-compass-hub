import { lazy, Suspense, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

// Defer the ~615-line chat (and its OpenAI/markdown deps) until the user
// actually opens the floating panel. Keeps the FAB itself near-zero cost on
// every product/video page paint.
const ProductKnowledgeChat = lazy(() =>
  import("./ProductKnowledgeChat").then((m) => ({ default: m.ProductKnowledgeChat }))
);

// Module-level prefetch: kick off the lazy chunk download as soon as the FAB
// is hovered / touched / focused so by the time the user actually clicks the
// 18.8KB chunk is already in cache. Without this, the click triggers the
// download AND mount sequentially — perceived as a 200-400ms "spinner stuck"
// moment on cold start, especially on slower connections.
let chatPromise: Promise<unknown> | null = null;
function prefetchChat() {
  if (!chatPromise) {
    chatPromise = import("./ProductKnowledgeChat").catch(() => {
      chatPromise = null; // allow retry if the prefetch failed
    });
  }
}

// Skeleton shown during Suspense (one-time chunk download). Renders the chat
// frame — mode-toggle row, welcome bubble with quick-question chips, input
// bar — so the user perceives the chat as "already loading content" instead
// of staring at a blank panel with a lone spinner.
function ChatSkeleton() {
  return (
    <div className="flex h-full flex-col">
      {/* Mode toggle row */}
      <div className="border-b px-3 py-2">
        <div className="flex gap-1.5">
          <div className="h-7 w-20 rounded-md bg-muted/60 animate-pulse" />
          <div className="h-7 w-20 rounded-md bg-muted/60 animate-pulse" />
          <div className="h-7 w-20 rounded-md bg-muted/60 animate-pulse" />
        </div>
      </div>
      {/* Welcome message bubble */}
      <div className="flex-1 overflow-hidden px-4 py-3">
        <div className="flex gap-3">
          <div className="h-7 w-7 shrink-0 rounded-full bg-primary/15 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-muted/60 animate-pulse" />
            <div className="h-3 w-5/6 rounded bg-muted/60 animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-muted/60 animate-pulse" />
            <div className="mt-3 flex flex-wrap gap-1.5">
              <div className="h-6 w-32 rounded-full bg-muted/50 animate-pulse" />
              <div className="h-6 w-40 rounded-full bg-muted/50 animate-pulse" />
              <div className="h-6 w-28 rounded-full bg-muted/50 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      {/* Input row */}
      <div className="border-t px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="h-9 flex-1 rounded-md bg-muted/50 animate-pulse" />
          <div className="h-9 w-9 rounded-md bg-primary/30 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

interface FloatingAIChatProps {
  productId: string;
  productName: string;
}

export function FloatingAIChat({ productId, productName }: FloatingAIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  // Track whether we've already started a prefetch this session so the
  // handlers below don't fire the import() a dozen times on hover-jitter.
  const prefetchedRef = useRef(false);

  const warmChat = useCallback(() => {
    if (prefetchedRef.current) return;
    prefetchedRef.current = true;
    prefetchChat();
  }, []);

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
            <Suspense fallback={<ChatSkeleton />}>
              <ProductKnowledgeChat
                productId={productId}
                productName={productName}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* FAB — onMouseEnter / onFocus / onTouchStart prefetch the chat
          chunk before the click happens. Effectively removes the 18.8KB
          cold-start download from the perceived open time. */}
      <Button
        onClick={() => {
          warmChat();
          setIsOpen((o) => !o);
        }}
        onMouseEnter={warmChat}
        onFocus={warmChat}
        onTouchStart={warmChat}
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
