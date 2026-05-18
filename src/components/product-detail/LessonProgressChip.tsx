import { useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { useVideoProgress } from "@/hooks/useVideoProgress";

interface LessonProgressChipProps {
  productId: string;
  totalLessons: number;
  /** Render on a dark surface (the brand-hero banner). */
  onDarkSurface?: boolean;
}

/** Tight progress badge for the product header — shows "N / total" plus a
 *  short bar. Keeps the reader aware of where they are in the module without
 *  having to scroll down to the sidebar.
 *  Hidden when the module has zero lessons. */
export function LessonProgressChip({ productId, totalLessons, onDarkSurface }: LessonProgressChipProps) {
  const { videoProgress, getCourseProgress } = useVideoProgress(productId);
  const completed = useMemo(
    () => videoProgress.filter((p) => p.completed).length,
    [videoProgress],
  );
  const pct = getCourseProgress(totalLessons);
  if (totalLessons === 0) return null;

  const allDone = pct === 100;

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur ${
        onDarkSurface
          ? "border border-white/20 bg-white/10 text-white"
          : "border border-border bg-background/80 text-foreground"
      }`}
      title={`${completed} of ${totalLessons} lessons complete (${pct}%)`}
      aria-label={`${completed} of ${totalLessons} lessons complete`}
    >
      {allDone ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <span
          className={`relative inline-block h-1.5 w-12 overflow-hidden rounded-full ${
            onDarkSurface ? "bg-white/25" : "bg-muted"
          }`}
          aria-hidden
        >
          <span
            className={`absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ${
              onDarkSurface ? "bg-white" : "bg-primary"
            }`}
            style={{ width: `${pct}%` }}
          />
        </span>
      )}
      <span className="whitespace-nowrap tabular-nums">
        {completed}/{totalLessons}
        <span className={onDarkSurface ? "ml-1 text-white/70" : "ml-1 text-muted-foreground"}>
          · {pct}%
        </span>
      </span>
    </div>
  );
}
