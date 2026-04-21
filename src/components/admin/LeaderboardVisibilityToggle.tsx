import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface LeaderboardVisibilityToggleProps {
  userId: string;
  showInLeaderboard: boolean;
  onChange?: (next: boolean) => void;
}

/**
 * Admin toggle: hide or unhide a learner on the /leaderboard page.
 * Writes to profiles.show_in_leaderboard and invalidates leaderboard caches.
 */
export function LeaderboardVisibilityToggle({
  userId,
  showInLeaderboard,
  onChange,
}: LeaderboardVisibilityToggleProps) {
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState(showInLeaderboard);
  const queryClient = useQueryClient();

  const handleToggle = async () => {
    const next = !value;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ show_in_leaderboard: next })
        .eq("user_id", userId);
      if (error) throw error;
      setValue(next);
      onChange?.(next);
      toast({
        title: next ? "User unhidden" : "User hidden",
        description: next
          ? "Now visible on the leaderboard"
          : "Removed from the leaderboard",
      });
      queryClient.invalidateQueries({ queryKey: ["learner-leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["user-management"] });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update";
      toast({
        title: "Couldn't update leaderboard visibility",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const Icon = value ? Eye : EyeOff;
  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={handleToggle}
      disabled={saving}
      aria-label={value ? "Hide from leaderboard" : "Show on leaderboard"}
      title={value ? "Hide from leaderboard" : "Show on leaderboard"}
      className="h-7 w-7 p-0"
    >
      {saving ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Icon
          className={
            value ? "h-3.5 w-3.5" : "h-3.5 w-3.5 text-muted-foreground"
          }
        />
      )}
    </Button>
  );
}
