import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrackPhase } from "@/data/learningTrackData";
import type { useLearningTrackProgress } from "@/hooks/useLearningTrackProgress";
import type { useLearningTrackContent } from "@/hooks/useLearningTrackContent";
import type { useTrackOverrides } from "@/hooks/useTrackOverrides";
import { TrackItemRow } from "./TrackItemRow";
import { InlineEditableText } from "./InlineEditableText";

interface TrackPhaseSectionProps {
  phase: TrackPhase;
  progressHook: ReturnType<typeof useLearningTrackProgress>;
  contentHook: ReturnType<typeof useLearningTrackContent>;
  isAdmin: boolean;
  overrides?: ReturnType<typeof useTrackOverrides>;
}

export function TrackPhaseSection({ phase, progressHook, contentHook, isAdmin, overrides }: TrackPhaseSectionProps) {
  const [open, setOpen] = useState(true);
  const ids = phase.items.map((s) => s.id);
  const completed = progressHook.getCompletedCount(ids);
  const total = ids.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const phaseTitle = overrides?.getPhaseTitle(phase.id, phase.title) ?? phase.title;
  const phaseDesc = overrides?.getPhaseDescription(phase.id, phase.description) ?? phase.description;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent/50">
          <div className="flex items-center gap-3 min-w-0">
            <ChevronDown
              className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", !open && "-rotate-90")}
            />
            <div className="min-w-0">
              {isAdmin && overrides ? (
                <InlineEditableText
                  value={phaseTitle}
                  onSave={(v) => overrides.setPhaseField(phase.id, "title", v)}
                  isAdmin={isAdmin}
                  className="font-semibold text-sm leading-tight"
                  as="h3"
                />
              ) : (
                <h3 className="font-semibold text-sm leading-tight">{phaseTitle}</h3>
              )}
              {isAdmin && overrides ? (
                <InlineEditableText
                  value={phaseDesc}
                  onSave={(v) => overrides.setPhaseField(phase.id, "description", v)}
                  isAdmin={isAdmin}
                  className="text-xs text-muted-foreground mt-0.5 line-clamp-1"
                  as="p"
                />
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{phaseDesc}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <Progress value={percent} className="h-1.5 w-24" />
                <span className="text-xs text-muted-foreground tabular-nums">
                  {completed}/{total}
                </span>
                {percent === 100 && (
                  <Badge variant="default" className="bg-green-600 hover:bg-green-600 text-[10px] px-1.5 py-0">
                    Done
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-2 pl-2">
          {phase.items.map((item) => (
            <TrackItemRow
              key={item.id}
              item={item}
              isCompleted={progressHook.isCompleted(item.id)}
              onToggle={() => progressHook.toggleItem(item.id)}
              contentBlocks={contentHook.getBlocks(item.id)}
              onAddBlock={(block) => contentHook.addBlock(item.id, block)}
              onUpdateBlock={(blockId, updates) => contentHook.updateBlock(item.id, blockId, updates)}
              onRemoveBlock={(blockId) => contentHook.removeBlock(item.id, blockId)}
              isAdmin={isAdmin}
              overrides={overrides}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
