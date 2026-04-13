import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { FeedbackModal } from "@/components/FeedbackButton";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { cn } from "@/lib/utils";

export function FloatingFeedbackButton() {
  const { user } = useSimplifiedAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 left-6 z-[9990] flex items-center gap-2",
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
