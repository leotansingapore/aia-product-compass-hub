import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useLearningTrackOverallProgress } from "@/hooks/learning-track/useLearningTrackOverallProgress";
import { cn } from "@/lib/utils";

interface AvatarWithProgressProps {
  size?: number; // px, avatar diameter
  initials: string;
  avatarUrl?: string | null;
  className?: string;
  ringWidth?: number; // stroke width of progress ring
  showTooltip?: boolean;
}

/**
 * Avatar wrapped in a circular SVG progress ring representing the user's
 * combined Pre-RNF + Post-RNF learning track completion.
 */
export function AvatarWithProgress({
  size = 32,
  initials,
  avatarUrl,
  className,
  ringWidth = 2,
  showTooltip = true,
}: AvatarWithProgressProps) {
  const { user } = useSimplifiedAuth();
  const { data } = useLearningTrackOverallProgress(user?.id);

  // Combined Pre + Post RNF progress (exclude explorer track)
  const pct = (() => {
    if (!data) return 0;
    // Reconstruct counts from percentages is lossy; recompute from totals instead.
    // We have totalCompleted/totalItems but those include explorer. So derive
    // pre+post counts from percentages and item totals via simple weighting:
    // Use preRnfPct/postRnfPct combined by summing completed/total of those tracks.
    // We don't have raw counts here, so approximate: average if both have items,
    // else use whichever is non-zero.
    const pre = data.preRnfPct;
    const post = data.postRnfPct;
    // If only one track has any items (the other will still be 0 and have 0 items),
    // return that one. Otherwise average them.
    if (pre === 0 && post === 0) return 0;
    return Math.round((pre + post) / 2);
  })();

  const outerSize = size + ringWidth * 2 + 4; // padding for ring
  const radius = (outerSize - ringWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const tooltip = showTooltip ? `Learning track: ${pct}% complete` : undefined;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: outerSize, height: outerSize }}
      title={tooltip}
      aria-label={tooltip}
    >
      <svg
        width={outerSize}
        height={outerSize}
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={outerSize / 2}
          cy={outerSize / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={ringWidth}
        />
        {/* Progress */}
        <circle
          cx={outerSize / 2}
          cy={outerSize / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={ringWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
      <Avatar style={{ width: size, height: size }}>
        {avatarUrl && <AvatarImage src={avatarUrl} />}
        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
