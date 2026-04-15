import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import { cn } from "@/lib/utils";
import type { LearningTrackPhase } from "@/types/learning-track";

interface Props {
  track: "pre_rnf" | "post_rnf";
  phases?: LearningTrackPhase[];
}

export function TrackProgressHeader({ track, phases }: Props) {
  const { user } = useSimplifiedAuth();
  const { progress, isLoading } = useLearningTrackProgress(user?.id);

  if (!user || isLoading || !phases || phases.length === 0) return null;

  const allItemIds = phases.flatMap((p) => p.items.map((i) => i.id));
  const total = allItemIds.length;
  if (total === 0) return null;

  const completed = allItemIds.filter((id) => progress[id]?.status === "completed").length;
  const pct = Math.round((completed / total) * 100);
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
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out",
            pct === 0 ? "bg-muted" : pct < 33 ? "bg-red-400" : pct < 66 ? "bg-amber-400" : pct < 100 ? "bg-green-500" : "bg-green-600"
          )}
          style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%` }}
        />
      </div>
    </div>
  );
}
