import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, Target, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrackItem } from "@/data/learningTrackData";

interface TrackItemRowProps {
  item: TrackItem;
  isCompleted: boolean;
  onToggle: () => void;
}

export function TrackItemRow({ item, isCompleted, onToggle }: TrackItemRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border transition-all",
        isCompleted ? "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900" : "bg-card"
      )}
    >
      <div className="flex items-start gap-3 p-3">
        {/* Checkbox */}
        <Checkbox
          checked={isCompleted}
          onCheckedChange={onToggle}
          className="mt-0.5 shrink-0"
          aria-label={`Mark "${item.title}" as ${isCompleted ? "incomplete" : "complete"}`}
        />

        {/* Content */}
        <Collapsible open={expanded} onOpenChange={setExpanded} className="flex-1 min-w-0">
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-start justify-between text-left group">
              <div className="min-w-0">
                <span
                  className={cn(
                    "text-sm font-medium leading-tight block",
                    isCompleted && "line-through text-muted-foreground"
                  )}
                >
                  {item.title}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5 block line-clamp-1">
                  {item.description}
                </span>
              </div>
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform mt-0.5 ml-2",
                  expanded && "rotate-90"
                )}
              />
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="mt-3 space-y-3 text-sm">
              {/* Objectives */}
              {item.objectives.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    <Target className="h-3 w-3" />
                    Learning Objectives
                  </div>
                  <ul className="space-y-1 pl-1">
                    {item.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="text-primary mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action items */}
              {item.actionItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    <ClipboardList className="h-3 w-3" />
                    Action Items
                  </div>
                  <ul className="space-y-1 pl-1">
                    {item.actionItems.map((action, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-orange-500 shrink-0" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
