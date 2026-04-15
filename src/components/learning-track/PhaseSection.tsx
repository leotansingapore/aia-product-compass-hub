import { useState, lazy, Suspense } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import type { LearningTrackPhase, LearningTrackItem } from "@/types/learning-track";
import { LearningItemRow } from "./LearningItemRow";

const AdminPhaseControls = lazy(() => import("./AdminPhaseControls"));

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
  const { isAdmin } = useAdmin();
  const completedCount = phase.items.filter((i) => isCompleted(i.id)).length;
  const showAdmin = isAdmin && !readOnly;

  return (
    <section className="rounded-lg border bg-card">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); } }}
        className="w-full px-4 py-3 text-left cursor-pointer"
        aria-expanded={open}
      >
        <div className="flex items-start gap-2">
          <div className="mt-1 shrink-0">
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">{phase.title}</h2>
            {phase.description && (
              <p className="text-sm text-muted-foreground">{phase.description}</p>
            )}
            <div className="flex items-center mt-2">
              <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium whitespace-nowrap">
                {completedCount} / {phase.items.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {open && showAdmin && (
        <Suspense fallback={<div className="border-t px-4 py-6 text-center text-sm text-muted-foreground">Loading editor…</div>}>
          <AdminPhaseControls
            phase={phase}
            isCompleted={isCompleted}
            expandedItemId={expandedItemId}
            readOnly={readOnly}
            viewAsUserId={viewAsUserId}
          />
        </Suspense>
      )}

      {open && !showAdmin && (
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
