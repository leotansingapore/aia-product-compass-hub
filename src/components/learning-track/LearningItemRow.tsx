import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Clock } from "lucide-react";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import type { LearningTrackItem, ItemStatus } from "@/types/learning-track";
import { ItemContentBlocks } from "./ItemContentBlocks";
import { SubmissionPanel } from "./SubmissionPanel";
import { cn } from "@/lib/utils";

interface LearningItemRowProps {
  item: LearningTrackItem;
  isCompleted: boolean;
  defaultExpanded?: boolean;
  readOnly?: boolean;
  viewAsUserId?: string;
}

const STATUS_ICON: Record<ItemStatus, JSX.Element> = {
  not_started: <Circle className="h-5 w-5 text-muted-foreground" />,
  in_progress: <Clock className="h-5 w-5 text-amber-500" />,
  completed: <CheckCircle2 className="h-5 w-5 text-green-600" />,
};

export function LearningItemRow({
  item,
  isCompleted,
  defaultExpanded = false,
  readOnly = false,
  viewAsUserId,
}: LearningItemRowProps) {
  const { user } = useSimplifiedAuth();
  const targetUserId = viewAsUserId ?? user?.id;
  const { setStatus, getStatus } = useLearningTrackProgress(targetUserId);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const status = getStatus(item.id);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (defaultExpanded) {
      setExpanded(true);
      // Scroll deep-linked item into view
      const t = setTimeout(() => rowRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      return () => clearTimeout(t);
    }
  }, [defaultExpanded]);

  return (
    <div ref={rowRef} className="px-4 py-3" id={`item-${item.id}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          disabled={readOnly}
          onClick={() => {
            const next: ItemStatus = isCompleted ? "not_started" : "completed";
            setStatus.mutate({ itemId: item.id, status: next });
          }}
          aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
          className="mt-1"
        >
          {STATUS_ICON[status]}
        </button>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex-1 text-left"
          aria-expanded={expanded}
        >
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <h3 className={cn("font-medium", isCompleted && "line-through text-muted-foreground")}>
              {item.title}
            </h3>
          </div>
          {item.description && (
            <p className="ml-6 mt-1 text-sm text-muted-foreground">{item.description}</p>
          )}
        </button>
      </div>

      {expanded && (
        <div className="ml-8 mt-4 space-y-4">
          {item.objectives && item.objectives.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold">Objectives</h4>
              <ul className="ml-4 list-disc text-sm">
                {item.objectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          )}
          {item.action_items && item.action_items.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold">Action items</h4>
              <ul className="ml-4 list-disc text-sm">
                {item.action_items.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}
          <ItemContentBlocks blocks={item.content_blocks} />
          {/* RelatedResources component lands in Phase 10 (deferred) */}
          {item.requires_submission && (
            <SubmissionPanel itemId={item.id} userId={targetUserId} readOnly={readOnly} />
          )}
        </div>
      )}
    </div>
  );
}
