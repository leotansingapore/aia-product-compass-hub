import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { useNavigate } from "react-router-dom";
import { MessageSquareWarning, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminFeedbackAlert() {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchPending = async () => {
      const { count, error } = await supabase
        .from("feedback_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      if (!error && count) {
        setPendingCount(count);
      }
    };

    fetchPending();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("feedback-alert")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "feedback_submissions" },
        () => {
          fetchPending();
          setDismissed(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  if (!isAdmin || pendingCount === 0 || dismissed) return null;

  return (
    <div className="relative rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-center gap-3">
      <MessageSquareWarning className="h-5 w-5 text-destructive shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {pendingCount} pending feedback {pendingCount === 1 ? "submission" : "submissions"}
        </p>
        <p className="text-xs text-muted-foreground">
          Review and respond to user feedback in the admin panel.
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        onClick={() => navigate("/admin")}
      >
        Review
      </Button>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
