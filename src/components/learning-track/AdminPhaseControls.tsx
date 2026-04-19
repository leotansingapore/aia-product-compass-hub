import { useState } from "react";
import { Plus, Trash2, GripVertical, FileText, Copy, Upload, ChevronRight, Eye, EyeOff } from "lucide-react";
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
import {
  useCreateItem,
  useCreateItemFromTemplate,
  useUpdatePhase,
  useDeletePhase,
  useDuplicatePhase,
  useReorderItems,
} from "@/hooks/learning-track/useAdminLearningTrackMutations";
import type { Track, LearningTrackPhase, LearningTrackItem } from "@/types/learning-track";
import type { LockMap } from "@/hooks/learning-track/useLockMap";
import { InlineEditableText } from "./InlineEditableText";
import { AdminLessonEditor } from "./AdminLessonEditor";
import { TemplatePreviewDialog } from "./TemplatePreviewDialog";
import { BulkImportDialog } from "./BulkImportDialog";
import { PublishToggle } from "./PublishToggle";
import { PrerequisitePhasePicker } from "./admin/PrerequisitePhasePicker";
import { LEARNING_ITEM_TEMPLATES, type TemplateCategory, type LearningItemTemplate } from "@/data/learningItemTemplates";
import { useCustomTemplates, useDeleteCustomTemplate } from "@/hooks/learning-track/useCustomTemplates";
import { cn } from "@/lib/utils";

/** Clean lesson row for the admin list view. Click to edit. Drag to reorder. */
function SortableLessonRow({
  item,
  published,
  blockCount,
  onClick,
}: {
  item: LearningTrackItem;
  published: boolean;
  blockCount: number;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center border-b last:border-b-0 hover:bg-muted/40 transition-colors group">
      <button
        {...attributes}
        {...listeners}
        className="px-2 py-3 cursor-grab active:cursor-grabbing text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onClick}
        className="flex-1 flex items-center gap-3 px-2 py-3 text-left min-w-0"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{item.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn(
              "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
              published
                ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
            )}>
              {published ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
              {published ? "Published" : "Draft"}
            </span>
            {blockCount > 0 && (
              <span className="text-[10px] text-muted-foreground">{blockCount} block{blockCount !== 1 ? "s" : ""}</span>
            )}
            {item.requires_submission && (
              <span className="text-[10px] text-muted-foreground">Submission</span>
            )}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}

/** Compact sidebar lesson row with active highlight. */
function SidebarLessonItem({
  item,
  isActive,
  onClick,
}: {
  item: LearningTrackItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const published = !!item.published_at;

  return (
    <div ref={setNodeRef} style={style} className="flex items-center group">
      <button
        {...attributes}
        {...listeners}
        className="px-1 py-2 cursor-grab active:cursor-grabbing text-muted-foreground/20 group-hover:text-muted-foreground/50"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex-1 flex items-center gap-2 px-2 py-2 text-left min-w-0 text-xs transition-colors rounded-r-lg",
          isActive
            ? "bg-primary/10 text-primary font-semibold border-l-[3px] border-primary"
            : "hover:bg-muted/50",
        )}
      >
        <span className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0",
          published ? "bg-green-500" : "bg-amber-400",
        )} />
        <span className="truncate">{item.title}</span>
      </button>
    </div>
  );
}

const TEMPLATE_CATEGORY_ORDER: TemplateCategory[] = ["General", "Lesson", "Practice", "Assessment"];

interface Props {
  phase: LearningTrackPhase;
  isCompleted: (itemId: string) => boolean;
  expandedItemId?: string;
  readOnly?: boolean;
  viewAsUserId?: string;
  lockMap?: LockMap;
  trackPhases?: LearningTrackPhase[];
}

export default function AdminPhaseControls({
  phase,
  isCompleted: _isCompleted,
  expandedItemId,
  readOnly: _readOnly,
  viewAsUserId: _viewAsUserId,
  lockMap: _lockMap,
  trackPhases,
}: Props) {
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

  // Auto-select first lesson so sidebar + content shows immediately
  const [activeLessonId, setActiveLessonId] = useState<string | null>(
    expandedItemId ?? phase.items[0]?.id ?? null
  );
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
    const reordered = [...phase.items];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorderItems.mutate(reordered.map((item, idx) => ({ id: item.id, order_index: idx })));
  };

  const nextOrderIndex = () =>
    phase.items.length > 0 ? Math.max(...phase.items.map((i) => i.order_index)) + 1 : 0;

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

  // Build copy-to targets: all tracks except the current one
  const ALL_TRACKS: { value: Track; label: string }[] = [
    { value: "explorer", label: "Explorer" },
    { value: "pre_rnf", label: "Pre-RNF" },
    { value: "post_rnf", label: "Post-RNF" },
  ];
  const TRACK_OPTIONS = ALL_TRACKS.filter((t) => t.value !== phase.track);

  return (
    <>
      {/* Module header — always visible */}
      <div className="px-4 py-4 bg-muted/30 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <InlineEditableText
              value={phase.title}
              onSave={(v) => updatePhase.mutate({ id: phase.id, title: v })}
              isAdmin
              as="h3"
              className="text-lg font-semibold"
            />
            {phase.description && (
              <InlineEditableText
                value={phase.description}
                onSave={(v) => updatePhase.mutate({ id: phase.id, description: v || null })}
                isAdmin
                as="p"
                className="text-sm text-muted-foreground mt-1"
                placeholder="Add module description..."
              />
            )}
            {!phase.description && (
              <button
                type="button"
                onClick={() => updatePhase.mutate({ id: phase.id, description: "Module description" })}
                className="text-xs text-muted-foreground/60 hover:text-primary mt-1 italic"
              >
                + Add description
              </button>
            )}
          </div>
          <PublishToggle
            publishedAt={phase.published_at}
            onToggle={(next) => updatePhase.mutate({ id: phase.id, published_at: next })}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {TRACK_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => handleCopyPhase(t.value)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition-colors"
              title={`Copy entire phase to ${t.label}`}
            >
              <Copy className="h-3 w-3" />
              Copy to {t.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleDeletePhase}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors ml-auto"
            aria-label="Delete module"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
          {trackPhases && trackPhases.length > 1 && (
            <PrerequisitePhasePicker phase={phase} trackPhases={trackPhases} />
          )}
        </div>
      </div>

      {/* Desktop: sidebar + content layout when a lesson is active */}
      {activeLessonId && (() => {
        const activeItem = phase.items.find((i) => i.id === activeLessonId);
        if (!activeItem) return null;
        return (
          <>
            {/* Mobile: back-and-forth fallback */}
            <div className="lg:hidden border-t">
              <AdminLessonEditor
                item={activeItem}
                trackPhases={trackPhases}
                onBack={() => setActiveLessonId(null)}
              />
            </div>

            {/* Desktop: sidebar + editor */}
            <div className="hidden lg:flex border-t min-h-[500px]">
              {/* Sidebar — lesson outline */}
              <div className="w-64 xl:w-72 border-r bg-muted/30 overflow-y-auto shrink-0 flex flex-col">
                <div className="px-3 py-2 border-b">
                  <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground/70">
                    {phase.items.length} {phase.items.length === 1 ? "lesson" : "lessons"}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={phase.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                      {phase.items.map((item) => (
                        <SidebarLessonItem
                          key={item.id}
                          item={item}
                          isActive={item.id === activeLessonId}
                          onClick={() => setActiveLessonId(item.id)}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>

                {/* Add lesson controls in sidebar */}
                <div className="border-t p-3 space-y-1.5">
                  {addingItem ? (
                    <div className="space-y-1.5">
                      <input
                        value={newItemTitle}
                        onChange={(e) => setNewItemTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddItem();
                          if (e.key === "Escape") { setAddingItem(false); setNewItemTitle(""); }
                        }}
                        placeholder="Lesson title..."
                        className="w-full bg-background border rounded-lg px-2.5 py-1.5 outline-none text-xs focus:ring-2 focus:ring-primary/30"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button onClick={handleAddItem} disabled={!newItemTitle.trim()} className="flex-1 px-2 py-1 text-[10px] bg-primary text-primary-foreground rounded font-medium disabled:opacity-40">Add</button>
                        <button onClick={() => { setAddingItem(false); setNewItemTitle(""); }} className="px-2 py-1 text-[10px] text-muted-foreground">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setAddingItem(true)}
                        className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        Add lesson
                      </button>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setShowTemplates(true)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-medium border rounded-lg hover:bg-muted transition-colors"
                        >
                          <FileText className="h-3 w-3" />
                          Template
                        </button>
                        <button
                          onClick={() => setBulkImportOpen(true)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-medium border rounded-lg hover:bg-muted transition-colors"
                        >
                          <Upload className="h-3 w-3" />
                          Import
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Main editor — right side */}
              <div className="flex-1 min-w-0 overflow-y-auto">
                <AdminLessonEditor
                  item={activeItem}
                  trackPhases={trackPhases}
                  onBack={() => setActiveLessonId(null)}
                  hideBackButton
                />
              </div>
            </div>
          </>
        );
      })()}

      {/* Lesson list (when no lesson is selected) */}
      {!activeLessonId && (
      <div className="border-t">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={phase.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {phase.items.map((item) => {
              const itemPublished = !!item.published_at;
              const blockCount = item.content_blocks?.length ?? 0;
              return (
                <SortableLessonRow
                  key={item.id}
                  item={item}
                  published={itemPublished}
                  blockCount={blockCount}
                  onClick={() => setActiveLessonId(item.id)}
                />
              );
            })}
          </SortableContext>
        </DndContext>

        {/* Add lesson controls */}
        <div className="px-4 py-3 bg-muted/20">
          <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground/70 mb-2">
            {phase.items.length > 0 ? `${phase.items.length} lesson${phase.items.length === 1 ? "" : "s"}` : "No lessons yet"}
          </div>
          {addingItem ? (
            <div className="flex items-center gap-2">
              <input
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddItem();
                  if (e.key === "Escape") { setAddingItem(false); setNewItemTitle(""); }
                }}
                placeholder="Lesson title..."
                className="flex-1 bg-background border rounded-lg px-3 py-2 outline-none text-sm focus:ring-2 focus:ring-primary/30"
                autoFocus
              />
              <button onClick={handleAddItem} disabled={!newItemTitle.trim()} className="px-3 py-2 text-xs bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-40">Add</button>
              <button onClick={() => { setAddingItem(false); setNewItemTitle(""); }} className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          ) : showTemplates ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Pick a template — click to preview before inserting</span>
                <button onClick={() => setShowTemplates(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
              </div>
              {TEMPLATE_CATEGORY_ORDER.map((cat) => {
                const items = allTemplates.filter((t) => t.category === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground/70 mb-1">{cat}</div>
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
                                {custom && <span className="text-[9px] px-1 py-px rounded bg-primary/10 text-primary">custom</span>}
                              </div>
                              <div className="text-[11px] text-muted-foreground">{t.hint}</div>
                            </button>
                            {custom && (
                              <button
                                onClick={(e) => { e.stopPropagation(); if (!confirm(`Delete template "${t.label}"?`)) return; deleteCustomTemplate.mutate((t as unknown as { id: string }).id); }}
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
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setAddingItem(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add lesson
              </button>
              <button
                onClick={() => setShowTemplates(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-lg hover:bg-muted transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                Use template
              </button>
              <button
                onClick={() => setBulkImportOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-lg hover:bg-muted transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
                Bulk import
              </button>
            </div>
          )}
        </div>
      </div>
      )}

      <TemplatePreviewDialog template={previewTemplate} onConfirm={handleConfirmTemplate} onClose={() => setPreviewTemplate(null)} />
      <BulkImportDialog open={bulkImportOpen} onClose={() => setBulkImportOpen(false)} phaseId={phase.id} phaseTitle={phase.title} />
    </>
  );
}
