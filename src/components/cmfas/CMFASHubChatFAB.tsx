import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AITutorFABIcon } from "@/components/cmfas/AITutorFABIcon";

const CHAT_PATH = "/cmfas/chat";

/**
 * Hub-only FAB: fixed to the viewport so it stays visible on every tab and does not scroll with content.
 * Portaled to `document.body` to avoid clipping from overflow/stacking contexts on main.
 */
export function CMFASHubChatFAB({ className }: { className?: string }) {
  const navigate = useNavigate();

  const fab = (
    <div
      className={cn(
        "pointer-events-none fixed z-[9985] flex flex-col items-end gap-2",
        // Mobile: above bottom nav; desktop: comfortable inset (Feedback lives in sidebar)
        "bottom-24 right-4 sm:bottom-8 sm:right-8",
        className
      )}
    >
      {/* Caption aids scan & recall; icon-only FAB stays primary on small screens */}
      <span
        className={cn(
          "pointer-events-none hidden max-w-[11rem] rounded-full border border-white/35 bg-primary/95 px-3 py-1.5 text-center text-[11px] font-semibold uppercase leading-tight tracking-wide text-primary-foreground shadow-md backdrop-blur-[2px] sm:inline-block",
          "shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.55)]"
        )}
        aria-hidden
      >
        AI tutor
      </span>
      <Button
        type="button"
        size="icon"
        onClick={() => navigate(CHAT_PATH)}
        className={cn(
          "pointer-events-auto relative h-16 w-16 rounded-full border-2 border-white/45",
          "bg-gradient-primary text-primary-foreground shadow-elegant",
          "shadow-[0_14px_44px_-10px_hsl(var(--primary)/0.55),0_8px_24px_-12px_rgba(15,23,42,0.35)]",
          "ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
          "[&_svg]:size-8",
          "transition-[transform,box-shadow,filter] duration-200",
          "hover:scale-105 hover:border-white/70 hover:brightness-110 hover:shadow-[0_18px_50px_-8px_hsl(var(--primary)/0.5),0_10px_28px_-10px_rgba(15,23,42,0.4)]",
          "active:scale-[0.97]",
          "motion-reduce:transition-none motion-reduce:hover:scale-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
        aria-label="Open CMFAS AI tutor chat"
        title="Open AI tutor — ask CMFAS questions"
      >
        <AITutorFABIcon className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
      </Button>
    </div>
  );

  return createPortal(fab, document.body);
}
