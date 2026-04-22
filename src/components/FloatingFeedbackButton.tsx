import { useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageSquarePlus } from "lucide-react";
import { FeedbackModal } from "@/components/FeedbackButton";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { cn } from "@/lib/utils";

export function FloatingFeedbackButton() {
  const { user } = useSimplifiedAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  /** Same horizontal inset as CMFASHubChatFAB; vertical gap above the caption + AI tutor button stack. */
  const aboveCmfasTutor = pathname.startsWith("/cmfas");

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed z-[9990] hidden md:flex items-center gap-2",
          aboveCmfasTutor
            ? "bottom-40 right-4 sm:right-8"
            : "bottom-6 right-6",
          "rounded-full px-4 py-2.5 shadow-lg",
          "bg-card border border-border text-muted-foreground",
          "hover:text-foreground hover:shadow-xl hover:border-primary/40",
          "transition-all duration-200",
          "text-sm font-medium"
        )}
        aria-label="Share Feedback"
      >
        <MessageSquarePlus className="h-4 w-4" />
        <span>Feedback</span>
      </button>
      <FeedbackModal open={open} onOpenChange={setOpen} />
    </>
  );
}
