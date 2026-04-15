import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, GripVertical, FileText, Copy, Upload } from "lucide-react";
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
  useCreateItemFromTemplate,
  useUpdatePhase,
  useDeletePhase,
  useDuplicatePhase,
  useReorderItems,
} from "@/hooks/learning-track/useAdminLearningTrackMutations";
import type { Track } from "@/types/learning-track";
import { InlineEditableText } from "./InlineEditableText";
import { LearningItemRow } from "./LearningItemRow";
import { TemplatePreviewDialog } from "./TemplatePreviewDialog";
import { BulkImportDialog } from "./BulkImportDialog";
import { PublishToggle } from "./PublishToggle";
import { LEARNING_ITEM_TEMPLATES, type TemplateCategory, type LearningItemTemplate } from "@/data/learningItemTemplates";
import { useCustomTemplates, useDeleteCustomTemplate } from "@/hooks/learning-track/useCustomTemplates";
import type { LearningTrackPhase, LearningTrackItem } from "@/types/learning-track";

const TEMPLATE_CATEGORY_ORDER: TemplateCategory[] = ["General", "Lesson", "Practice", "Assessment"];

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
  const duplicatePhase = useDuplicatePhase();
  const createItem = useCreateItem();
  const createItemFromTemplate = useCreateItemFromTemplate();
  const reorderItems = useReorderItems();
  const { data: customTemplates = [] } = useCustomTemplates();
  const deleteCustomTemplate = useDeleteCustomTemplate();

  const allTemplates: LearningItemTemplate[] = [
    ...LEARNING_ITEM_TEMPLATES,
    ...customTemplates,
  ];

  const [addingItem, setAddingItem] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<LearningItemTemplate | null>(null);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

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

  const nextOrderIndex = () =>
    phase.items.length > 0
      ? Math.max(...phase.items.map((i) => i.order_index)) + 1
      : 0;

  const handleAddItem = () => {
    const title = newItemTitle.trim();
    if (!title) return;
    createItem.mutate({ phase_id: phase.id, title, order_index: nextOrderIndex() });
    setNewItemTitle("");
    setAddingItem(false);
  };

  const handleConfirmTemplate = () => {
    if (!previewTemplate) return;
    createItemFromTemplate.mutate({
      phase_id: phase.id,
      order_index: nextOrderIndex(),
      template: previewTemplate,
    });
    setPreviewTemplate(null);
    setShowTemplates(false);
  };

  const handleDeletePhase = () => {
    if (!confirm(`Delete phase "${phase.title}" and all its items? This cannot be undone.`)) return;
    deletePhase.mutate(phase.id);
  };

  const handleCopyPhase = (targetTrack: Track) => {
    const trackLabel = targetTrack === "pre_rnf" ? "Pre-RNF" : "Post-RNF";
    if (!confirm(`Copy "${phase.title}" and all items to ${trackLabel}?`)) return;
    duplicatePhase.mutate({ sourcePhaseId: phase.id, targetTrack });
  };

  const otherTrack: Track = phase.track === "pre_rnf" ? "post_rnf" : "pre_rnf";
  const otherTrackLabel = otherTrack === "pre_rnf" ? "Pre-RNF" : "Post-RNF";

  const showAdmin = isAdmin && !readOnly;

  const handleSectionKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!showAdmin || !open) return;
    const target = e.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
    if (addingItem || showTemplates || previewTemplate || bulkImportOpen) return;
    if (e.key.toLowerCase() === "n" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      setAddingItem(true);
    }
    if (e.key.toLowerCase() === "t" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      setShowTemplates(true);
    }
  };

  return (
    <section
      className="rounded-lg border bg-card focus:outline-none"
      onKeyDown={handleSectionKeyDown}
      tabIndex={showAdmin ? 0 : -1}
      aria-label={showAdmin ? `Phase: ${phase.title}. Press N for new item, T for template.` : undefined}
    >
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
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {showAdmin && (
            <>
              <PublishToggle
                publishedAt={phase.published_at}
                onToggle={(next) => updatePhase.mutate({ id: phase.id, published_at: next })}
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleCopyPhase(otherTrack); }}
                className="min-h-[44px] min-w-[36px] sm:min-h-0 sm:min-w-0 h-7 w-7 sm:h-6 sm:w-6 flex items-center justify-center rounded text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
                aria-label={`Copy phase to ${otherTrackLabel}`}
                title={`Copy entire phase to ${otherTrackLabel}`}
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDeletePhase(); }}
                className="min-h-[44px] min-w-[36px] sm:min-h-0 sm:min-w-0 h-7 w-7 sm:h-6 sm:w-6 flex items-center justify-center rounded text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Delete phase"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium whitespace-nowrap">
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
              ) : showTemplates ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Pick a template — click to preview before inserting
                    </span>
                    <button
                      onClick={() => setShowTemplates(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                  {TEMPLATE_CATEGORY_ORDER.map((cat) => {
                    const items = allTemplates.filter((t) => t.category === cat);
                    if (items.length === 0) return null;
                    return (
                      <div key={cat}>
                        <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground/70 mb-1">
                          {cat}
                        </div>
                        <div className="grid gap-1 sm:grid-cols-2">
                          {items.map((t) => {
                            const custom = "isCustom" in t && t.isCustom;
                            return (
                              <div key={t.key} className="relative group">
                                <button
                                  onClick={() => setPreviewTemplate(t)}
                                  className="w-full text-left rounded border border-border/60 hover:border-primary/50 hover:bg-muted/40 px-2 py-1.5 transition-colors"
                                >
                                  <div className="text-xs font-medium flex items-center gap-1">
                                    {t.label}
                                    {custom && (
                                      <span className="text-[9px] px-1 py-px rounded bg-primary/10 text-primary">
                                        custom
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground">{t.hint}</div>
                                </button>
                                {custom && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!confirm(`Delete template "${t.label}"?`)) return;
                                      deleteCustomTemplate.mutate((t as unknown as { id: string }).id);
                                    }}
                                    className="absolute top-1 right-1 hidden group-hover:flex h-5 w-5 items-center justify-center rounded text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                                    aria-label="Delete template"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowTemplates(true)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <FileText className="h-3 w-3" />
                    Add from template
                  </button>
                  <span className="text-muted-foreground/40">·</span>
                  <button
                    onClick={() => setAddingItem(true)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-3 w-3" />
                    Quick blank item
                  </button>
                  <span className="text-muted-foreground/40">·</span>
                  <button
                    onClick={() => setBulkImportOpen(true)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <Upload className="h-3 w-3" />
                    Bulk import
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <TemplatePreviewDialog
        template={previewTemplate}
        onConfirm={handleConfirmTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
      <BulkImportDialog
        open={bulkImportOpen}
        onClose={() => setBulkImportOpen(false)}
        phaseId={phase.id}
        phaseTitle={phase.title}
      />
    </section>
  );
}
