import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { LearningTrackPhase } from "@/types/learning-track";
import { LearningItemRow } from "./LearningItemRow";

interface PhaseSectionProps {
  phase: LearningTrackPhase;
  isCompleted: (itemId: string) => boolean;
  defaultOpen?: boolean;
  expandedItemId?: string;
  readOnly?: boolean;
  viewAsUserId?: string;
}

export function PhaseSection({
  phase,
  isCompleted,
  defaultOpen = true,
  expandedItemId,
  readOnly = false,
  viewAsUserId,
}: PhaseSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const completedCount = phase.items.filter((i) => isCompleted(i.id)).length;

  return (
    <section className="rounded-lg border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <div>
            <h2 className="font-semibold">{phase.title}</h2>
            {phase.description && (
              <p className="text-sm text-muted-foreground">{phase.description}</p>
            )}
          </div>
        </div>
        <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
          {completedCount} / {phase.items.length}
        </span>
      </button>
      {open && (
        <div className="border-t divide-y">
          {phase.items.map((item) => (
            <LearningItemRow
              key={item.id}
              item={item}
              isCompleted={isCompleted(item.id)}
              defaultExpanded={item.id === expandedItemId}
              readOnly={readOnly}
              viewAsUserId={viewAsUserId}
            />
          ))}
        </div>
      )}
    </section>
  );
}
