import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAdmin } from "@/hooks/useAdmin";
import {
  useCreateItem,
  useUpdatePhase,
  useDeletePhase,
  useReorderItems,
} from "@/hooks/learning-track/useAdminLearningTrackMutations";
import { InlineEditableText } from "./InlineEditableText";
import { LearningItemRow } from "./LearningItemRow";
import type { LearningTrackPhase, LearningTrackItem } from "@/types/learning-track";

interface PhaseSectionProps {
  phase: LearningTrackPhase;
  isCompleted: (itemId: string) => boolean;
  defaultOpen?: boolean;
  expandedItemId?: string;
  readOnly?: boolean;
  viewAsUserId?: string;
}

function SortableItemWrapper({
  item,
  isCompleted,
  expandedItemId,
  readOnly,
  viewAsUserId,
  showDragHandle,
}: {
  item: LearningTrackItem;
  isCompleted: boolean;
  expandedItemId?: string;
  readOnly?: boolean;
  viewAsUserId?: string;
  showDragHandle: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {showDragHandle && (
        <button
          {...attributes}
          {...listeners}
          className="absolute left-0 top-3 z-10 cursor-grab active:cursor-grabbing p-1 text-muted-foreground/40 hover:text-muted-foreground"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      <div className={showDragHandle ? "pl-6" : ""}>
        <LearningItemRow
          item={item}
          isCompleted={isCompleted}
          defaultExpanded={item.id === expandedItemId}
          readOnly={readOnly}
          viewAsUserId={viewAsUserId}
        />
      </div>
    </div>
  );
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

  const updatePhase = useUpdatePhase();
  const deletePhase = useDeletePhase();
  const createItem = useCreateItem();
  const reorderItems = useReorderItems();

  const [addingItem, setAddingItem] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = phase.items.findIndex((i) => i.id === active.id);
    const newIndex = phase.items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Build new order
    const reordered = [...phase.items];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    reorderItems.mutate(
      reordered.map((item, idx) => ({ id: item.id, order_index: idx }))
    );
  };

  const handleAddItem = () => {
    const title = newItemTitle.trim();
    if (!title) return;
    const nextOrder = phase.items.length > 0
      ? Math.max(...phase.items.map((i) => i.order_index)) + 1
      : 0;
    createItem.mutate({ phase_id: phase.id, title, order_index: nextOrder });
    setNewItemTitle("");
    setAddingItem(false);
  };

  const handleDeletePhase = () => {
    if (!confirm(`Delete phase "${phase.title}" and all its items? This cannot be undone.`)) return;
    deletePhase.mutate(phase.id);
  };

  const showAdmin = isAdmin && !readOnly;

  return (
    <section className="rounded-lg border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
          <div className="min-w-0 flex-1">
            {showAdmin ? (
              <InlineEditableText
                value={phase.title}
                onSave={(v) => updatePhase.mutate({ id: phase.id, title: v })}
                isAdmin
                as="h3"
                className="font-semibold"
              />
            ) : (
              <h2 className="font-semibold">{phase.title}</h2>
            )}
            {showAdmin ? (
              <InlineEditableText
                value={phase.description ?? ""}
                onSave={(v) => updatePhase.mutate({ id: phase.id, description: v || null })}
                isAdmin
                as="p"
                className="text-sm text-muted-foreground"
                placeholder="Add description..."
              />
            ) : (
              phase.description && (
                <p className="text-sm text-muted-foreground">{phase.description}</p>
              )
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showAdmin && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleDeletePhase(); }}
              className="h-6 w-6 flex items-center justify-center rounded text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Delete phase"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium">
            {completedCount} / {phase.items.length}
          </span>
        </div>
      </button>

      {open && (
        <div className="border-t divide-y">
          {showAdmin ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={phase.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                {phase.items.map((item) => (
                  <SortableItemWrapper
                    key={item.id}
                    item={item}
                    isCompleted={isCompleted(item.id)}
                    expandedItemId={expandedItemId}
                    readOnly={readOnly}
                    viewAsUserId={viewAsUserId}
                    showDragHandle
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            phase.items.map((item) => (
              <LearningItemRow
                key={item.id}
                item={item}
                isCompleted={isCompleted(item.id)}
                defaultExpanded={item.id === expandedItemId}
                readOnly={readOnly}
                viewAsUserId={viewAsUserId}
              />
            ))
          )}

          {/* Add item button */}
          {showAdmin && (
            <div className="px-4 py-2">
              {addingItem ? (
                <div className="flex items-center gap-2">
                  <input
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddItem();
                      if (e.key === "Escape") { setAddingItem(false); setNewItemTitle(""); }
                    }}
                    placeholder="New item title..."
                    className="flex-1 bg-transparent border-b border-dashed border-primary/50 outline-none text-sm py-1"
                    autoFocus
                  />
                  <button
                    onClick={handleAddItem}
                    disabled={!newItemTitle.trim()}
                    className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded disabled:opacity-40"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setAddingItem(false); setNewItemTitle(""); }}
                    className="px-2 py-1 text-xs text-muted-foreground"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingItem(true)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  Add item
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
