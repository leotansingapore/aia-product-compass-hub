import { useMemo, useState } from "react";
import { Lock, Check, X } from "lucide-react";
import { useUpdateItem } from "@/hooks/learning-track/useAdminLearningTrackMutations";
import { cn } from "@/lib/utils";
import type { LearningTrackItem, LearningTrackPhase } from "@/types/learning-track";

interface Props {
  item: LearningTrackItem;
  /** All phases in the same track — used to enumerate eligible prerequisite items. */
  trackPhases: LearningTrackPhase[];
}

/**
 * Admin-only multi-select for `learning_track_items.prerequisite_item_ids`.
 *
 * Eligible items: any sibling item in the same phase, OR any item in a phase with a
 * lower `order_index` than the current phase. Items in later phases are excluded to
 * avoid circular dependencies.
 */
export function PrerequisiteItemPicker({ item, trackPhases }: Props) {
  const updateItem = useUpdateItem();
  const [open, setOpen] = useState(false);
  const selected = item.prerequisite_item_ids ?? [];

  const ownPhase = trackPhases.find((p) => p.id === item.phase_id);
  const ownOrder = ownPhase?.order_index ?? 0;

  const eligible = useMemo(() => {
    return trackPhases
      .filter((p) => p.order_index <= ownOrder)
      .flatMap((p) =>
        p.items
          .filter((i) => i.id !== item.id)
          .map((i) => ({
            id: i.id,
            title: i.title,
            phaseTitle: p.title,
            phaseOrder: p.order_index,
            itemOrder: i.order_index,
          })),
      )
      .sort((a, b) => a.phaseOrder - b.phaseOrder || a.itemOrder - b.itemOrder);
  }, [trackPhases, ownOrder, item.id]);

  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    updateItem.mutate({ id: item.id, prerequisite_item_ids: next.length === 0 ? null : next });
  };

  const clear = () => updateItem.mutate({ id: item.id, prerequisite_item_ids: null });

  return (
    <div className="rounded border border-dashed border-muted-foreground/30 p-3 text-sm">
      <div className="flex items-center gap-2 mb-2">
        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Prerequisites
          {selected.length > 0 && (
            <span className="ml-1 text-foreground">({selected.length})</span>
          )}
        </span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-xs text-primary hover:underline ml-auto"
        >
          {open ? "Done" : selected.length === 0 ? "Add" : "Edit"}
        </button>
        {selected.length > 0 && !open && (
          <button
            type="button"
            onClick={clear}
            className="text-xs text-muted-foreground hover:text-destructive"
            aria-label="Clear prerequisites"
            title="Clear all prerequisites"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {!open && selected.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No prerequisites — this item is unlocked from the start.
        </p>
      )}

      {!open && selected.length > 0 && (
        <ul className="text-xs space-y-1">
          {selected.map((id) => {
            const match = eligible.find((e) => e.id === id);
            return (
              <li key={id} className="text-muted-foreground">
                · {match?.title ?? "(unknown item)"}{" "}
                {match && <span className="text-muted-foreground/60">— {match.phaseTitle}</span>}
              </li>
            );
          })}
        </ul>
      )}

      {open && (
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {eligible.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No eligible items yet — add items in this phase or earlier phases first.
            </p>
          ) : (
            Object.entries(
              eligible.reduce<Record<string, typeof eligible>>((acc, e) => {
                (acc[e.phaseTitle] ??= []).push(e);
                return acc;
              }, {}),
            ).map(([phaseTitle, items]) => (
              <div key={phaseTitle}>
                <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground/70 mb-1">
                  {phaseTitle}
                </div>
                <ul className="space-y-0.5">
                  {items.map((e) => {
                    const checked = selected.includes(e.id);
                    return (
                      <li key={e.id}>
                        <button
                          type="button"
                          onClick={() => toggle(e.id)}
                          className={cn(
                            "w-full flex items-center gap-2 text-left px-2 py-1 rounded text-xs hover:bg-muted/60",
                            checked && "bg-primary/5",
                          )}
                        >
                          <span
                            className={cn(
                              "h-3.5 w-3.5 shrink-0 rounded border flex items-center justify-center",
                              checked
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground/40",
                            )}
                          >
                            {checked && <Check className="h-2.5 w-2.5" />}
                          </span>
                          <span className="truncate">{e.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
