import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { triggerGlobalTourReset } from "@/hooks/useGlobalTourReset";

export function PlatformControls() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [lastResetAt, setLastResetAt] = useState<string | null>(null);

  const handleReset = async () => {
    setBusy(true);
    try {
      const iso = await triggerGlobalTourReset(user?.id);
      setLastResetAt(iso);
      toast({
        title: "Welcome tour reset for all users",
        description:
          "Every user will see the animated tour again on their next page load.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Reset failed",
        description:
          err instanceof Error
            ? err.message
            : "The platform_settings table may not exist yet. Ask Lovable to run the migration in SUPABASE.md.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-semibold">Welcome Tour</div>
            <p className="text-sm text-muted-foreground">
              Force the animated welcome tour to replay for every user on their
              next session.
            </p>
            {lastResetAt && (
              <div className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Reset triggered {new Date(lastResetAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" disabled={busy}>
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Reset tour for all users
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Reset Welcome Tour?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Every user — including those who've already completed the tour —
                will see the full animated welcome tour again the next time they
                open the app. Use this after a major platform update.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>
                Yes, reset for all
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
