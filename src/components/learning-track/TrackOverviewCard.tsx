import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, Rocket, ChevronRight } from "lucide-react";
import type { TrackModule } from "@/data/learningTrackData";

interface TrackOverviewCardProps {
  track: TrackModule;
  completedCount: number;
  totalCount: number;
  onSelect: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  graduation: GraduationCap,
  rocket: Rocket,
};

export function TrackOverviewCard({ track, completedCount, totalCount, onSelect }: TrackOverviewCardProps) {
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const Icon = iconMap[track.icon] ?? GraduationCap;

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/40"
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base leading-tight">{track.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalCount} {totalCount === 1 ? "item" : "items"}
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{track.description}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium tabular-nums">
              {completedCount}/{totalCount} ({percent}%)
            </span>
          </div>
          <Progress value={percent} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
