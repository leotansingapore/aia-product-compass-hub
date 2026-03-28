import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Rocket } from "lucide-react";
import type { TrackModule } from "@/data/learningTrackData";
import type { useLearningTrackProgress } from "@/hooks/useLearningTrackProgress";
import { TrackWeekSection } from "./TrackWeekSection";
import { TrackItemRow } from "./TrackItemRow";

interface TrackDetailProps {
  track: TrackModule;
  progressHook: ReturnType<typeof useLearningTrackProgress>;
}

const iconMap: Record<string, React.ElementType> = {
  graduation: GraduationCap,
  rocket: Rocket,
};

export function TrackDetail({ track, progressHook }: TrackDetailProps) {
  const Icon = iconMap[track.icon] ?? GraduationCap;

  const allIds = track.weeks
    ? track.weeks.flatMap((w) => w.sessions.map((s) => s.id))
    : track.items?.map((i) => i.id) ?? [];

  const completed = progressHook.getCompletedCount(allIds);
  const total = allIds.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold leading-tight">{track.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{track.description}</p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <div className="flex items-center gap-2">
            {percent === 100 && (
              <Badge variant="default" className="bg-green-600 hover:bg-green-600 text-xs">
                Completed
              </Badge>
            )}
            <span className="text-sm font-semibold tabular-nums">
              {completed}/{total} ({percent}%)
            </span>
          </div>
        </div>
        <Progress value={percent} className="h-3" />
      </div>

      {/* Weekly tracks */}
      {track.weeks?.map((week) => (
        <TrackWeekSection key={week.id} week={week} progressHook={progressHook} />
      ))}

      {/* Flat items (F.A.S.T.) */}
      {track.items && (
        <div className="space-y-2">
          {track.items.map((item) => (
            <TrackItemRow
              key={item.id}
              item={item}
              isCompleted={progressHook.isCompleted(item.id)}
              onToggle={() => progressHook.toggleItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
