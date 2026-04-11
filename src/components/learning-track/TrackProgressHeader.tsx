import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useLearningTrackOverallProgress } from "@/hooks/learning-track/useLearningTrackOverallProgress";
import { cn } from "@/lib/utils";

interface Props {
  track: "pre_rnf" | "post_rnf";
}

export function TrackProgressHeader({ track }: Props) {
  const { user } = useSimplifiedAuth();
  const { data, isLoading } = useLearningTrackOverallProgress(user?.id);

  if (!user || isLoading || !data) return null;

  const pct = track === "pre_rnf" ? data.preRnfPct : data.postRnfPct;
  const label = track === "pre_rnf" ? "Pre-RNF Training" : "Post-RNF Training";

  return (
    <div className="rounded-lg border bg-card p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">{label} progress</div>
        <span
          className={cn(
            "text-sm tabular-nums",
            pct === 0 ? "text-muted-foreground" : "font-semibold"
          )}
        >
          {pct === 0 ? "Not started" : `${pct}% complete`}
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all",
            pct === 0 ? "bg-muted" : pct < 33 ? "bg-red-400" : pct < 66 ? "bg-amber-400" : pct < 100 ? "bg-green-500" : "bg-green-600"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
