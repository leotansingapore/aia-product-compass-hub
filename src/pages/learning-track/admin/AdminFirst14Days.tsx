import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function AdminFirst14Days() {
  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <CardContent className="p-6 space-y-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">
              Database migration pending
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              First 14 Days progress is currently tracked in each learner's browser
              (localStorage) and isn't queryable from the admin side yet. The
              <code className="mx-1 rounded bg-muted px-1.5 py-0.5 text-xs">first_14_days_progress</code>
              table has been requested in <code className="rounded bg-muted px-1.5 py-0.5 text-xs">SUPABASE.md</code>.
              Once Lovable runs the migration, this tab will populate with the same
              day-by-day rollup used for First 60 Days.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
