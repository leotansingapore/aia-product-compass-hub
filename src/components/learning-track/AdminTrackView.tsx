import { useState, useMemo } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Folder,
  FileText,
  MoreHorizontal,
  Trash2,
  Copy,
  Globe,
  ArchiveRestore,
  Loader2,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useCreateItem,
  useDeleteItem,
  useDuplicateItem,
  useUpdateItem,
  useUpdatePhase,
  useDeletePhase,
  useReorderItems,
} from "@/hooks/learning-track/useAdminLearningTrackMutations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminLessonEditor } from "./AdminLessonEditor";
import type { LearningTrackPhase, LearningTrackItem, Track } from "@/types/learning-track";
import type { LockMap } from "@/hooks/learning-track/useLockMap";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  buildOutlineSegments,
  groupItemsIntoModules,
  isModuleFolder,
  isStandaloneRootPage,
  nextHiddenResourcesForLesson,
  outlineSegmentsToFlat,
  STANDALONE_PAGE_TAG,
  type OutlineSegment,
} from "@/lib/learning-track/moduleGrouping";

interface AdminTrackViewProps {
  phases: LearningTrackPhase[];
  isCompleted: (itemId: string) => boolean;
  expandedItemId?: string;
  lockMap?: LockMap;
}

export function AdminTrackView({
  phases,
  isCompleted,
  expandedItemId,
  lockMap,
}: AdminTrackViewProps) {
  const [activePhaseId, setActivePhaseId] = useState<string | null>(() => {
    if (expandedItemId) {
      const p = phases.find((ph) => ph.items.some((i) => i.id === expandedItemId));
      return p?.id ?? null;
    }
    return null;
  });

  const activePhase = activePhaseId ? phases.find((p) => p.id === activePhaseId) : null;

  if (activePhase) {
    return (
      <CourseEditor
        phase={activePhase}
        phases={phases}
        expandedItemId={expandedItemId}
        onBack={() => setActivePhaseId(null)}
      />
    );
  }

  // ---- Course card list ----
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {phases.map((phase) => {
        const lessonCount = phase.items.filter((i) => !isModuleFolder(i)).length;
        const moduleCount = phase.items.filter(isModuleFolder).length;
        const isPublished = !!phase.published_at;
        return (
          <div
            key={phase.id}
            className="flex h-full cursor-pointer flex-col rounded-xl border bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg group"
            onClick={() => setActivePhaseId(phase.id)}
          >
            <div className="space-y-3 p-4 pb-0 sm:p-5 sm:pb-0">
              <span className={cn(
                "inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white rounded-full",
                isPublished ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-amber-500 to-amber-600",
              )}>
                {isPublished ? "Published" : "Draft"}
              </span>
              <div className="space-y-1">
                <h3 className="line-clamp-2 text-lg font-bold font-serif leading-snug tracking-tight">{phase.title}</h3>
                {phase.description && <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{phase.description}</p>}
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4 pt-3 sm:p-5 sm:pt-4">
              <div className="flex flex-1 flex-col border-t border-border/60 pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {moduleCount} {moduleCount === 1 ? "module" : "modules"} · {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
                </p>
              </div>
              <button className="mt-auto h-10 w-full gap-2 text-sm font-semibold inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                Open track <ChevronRight className="h-4 w-4 shrink-0 opacity-90" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Course editor: sidebar (modules → lessons tree) + content
// ============================================================

function CourseEditor({
  phase,
  phases,
  expandedItemId,
  onBack,
}: {
  phase: LearningTrackPhase;
  phases: LearningTrackPhase[];
  expandedItemId?: string;
  onBack: () => void;
}) {
  const [activeLessonId, setActiveLessonId] = useState<string | null>(expandedItemId ?? null);
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());
  const [addingLessonToModuleId, setAddingLessonToModuleId] = useState<string | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [creatingLesson, setCreatingLesson] = useState(false);
  const [addingModule, setAddingModule] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");

  const createItem = useCreateItem();
  const updatePhase = useUpdatePhase();
  const deletePhase = useDeletePhase();
  const reorderItems = useReorderItems();
  const qc = useQueryClient();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Reorder lessons within a module
  const handleLessonDragEnd = (moduleId: string, event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const group = groups.find((g) => g.module.id === moduleId);
    if (!group) return;
    const lessons = [...group.lessons];
    const oldIdx = lessons.findIndex((i) => i.id === active.id);
    const newIdx = lessons.findIndex((i) => i.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const [moved] = lessons.splice(oldIdx, 1);
    lessons.splice(newIdx, 0, moved);
    const newSegs = buildOutlineSegments(phase.items).map((s) =>
      s.type === "module" && s.module.id === moduleId ? { ...s, lessons } : s,
    );
    const newOrder = outlineSegmentsToFlat(newSegs);
    reorderItems.mutate(newOrder.map((item, idx) => ({ id: item.id, order_index: idx })));
  };

  const [editingCourseTitle, setEditingCourseTitle] = useState(false);
  const [courseTitleValue, setCourseTitleValue] = useState(phase.title);
  const isPublished = !!phase.published_at;

  const { groups, orphanLessons, segments } = useMemo(() => groupItemsIntoModules(phase.items), [phase.items]);
  const moduleFolders = useMemo(() => phase.items.filter(isModuleFolder), [phase.items]);
  const standaloneLessons = useMemo(
    () => orphanLessons.filter((i) => !isModuleFolder(i)),
    [orphanLessons],
  );

  /** Top-level sidebar order: standalone lessons (pages) interleaved with module folders — same drag plane. */
  const outlineSortableIds = useMemo(
    () => segments.flatMap((s) => (s.type === "standalone" ? [s.item.id] : [s.module.id])),
    [segments],
  );

  const handleOutlineDragEnd = async (event: { active: { id: string | number }; over: { id: string | number } | null }) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const topLevelIds = segments.flatMap((s) => (s.type === "standalone" ? [s.item.id] : [s.module.id]));
    const oldIndex = topLevelIds.indexOf(active.id as string);
    const newIndex = topLevelIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;
    const nextIds = arrayMove(topLevelIds, oldIndex, newIndex);
    const flat: LearningTrackItem[] = [];
    for (const id of nextIds) {
      const seg = segments.find((s) => s.type === "standalone" && s.item.id === id) as Extract<OutlineSegment, { type: "standalone" }> | undefined;
      if (seg) {
        flat.push(seg.item);
        continue;
      }
      const group = groups.find((g) => g.module.id === id);
      if (group) flat.push(group.module, ...group.lessons);
    }
    await reorderItems.mutateAsync(flat.map((item, idx) => ({ id: item.id, order_index: idx })));
    const hrPatches: { id: string; hidden_resources: string[] }[] = [];
    for (const item of flat) {
      if (isModuleFolder(item)) continue;
      const isRootOutlineSlot = nextIds.includes(item.id);
      const nextHr = nextHiddenResourcesForLesson(item, isRootOutlineSlot);
      const prev = JSON.stringify([...(item.hidden_resources ?? [])].sort());
      const nxt = JSON.stringify([...nextHr].sort());
      if (prev !== nxt) hrPatches.push({ id: item.id, hidden_resources: nextHr });
    }
    if (hrPatches.length > 0) {
      await Promise.all(
        hrPatches.map((p) =>
          supabase.from("learning_track_items").update({ hidden_resources: p.hidden_resources }).eq("id", p.id),
        ),
      );
    }
    await qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
  };

  const activeItem = phase.items.find((i) => i.id === activeLessonId);

  // Auto-select first available lesson (not a module folder) if none selected
  if (!activeLessonId || (activeItem && isModuleFolder(activeItem))) {
    const firstOrphan = orphanLessons.find((i) => !isModuleFolder(i))?.id;
    const firstGroupLesson = groups.flatMap((g) => g.lessons).find((i) => !isModuleFolder(i))?.id;
    const autoSelect = firstOrphan ?? firstGroupLesson;
    if (autoSelect && autoSelect !== activeLessonId) setActiveLessonId(autoSelect);
  }

  const toggleModule = (id: string) => {
    setCollapsedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleAddModule = async () => {
    const title = newModuleTitle.trim();
    if (!title) return;
    const maxOrder = Math.max(...phase.items.map((i) => i.order_index), -1);
    const { error } = await supabase.from("learning_track_items").insert({
      phase_id: phase.id,
      title,
      order_index: maxOrder + 1,
      requires_submission: false,
      hidden_resources: ["module"],
    });
    if (!error) {
      qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
    }
    setNewModuleTitle("");
    setAddingModule(false);
  };

  const handleAddLessonInstant = async (moduleId: string) => {
    if (creatingLesson) return;
    setCreatingLesson(true);
    try {
    // 1. Insert at end (safe — avoids unique constraint)
    const maxOrder = Math.max(...phase.items.map((i) => i.order_index), -1);
    const { data, error } = await supabase
      .from("learning_track_items")
      .insert({ phase_id: phase.id, title: "Untitled lesson", order_index: maxOrder + 1, requires_submission: false })
      .select("id")
      .single();
    if (error || !data) return;

    // 2. Reorder: place the new lesson right after the target module's last lesson
    const ordered = [...phase.items].sort((a, b) => a.order_index - b.order_index);
    const modulePos = ordered.findIndex((i) => i.id === moduleId);
    if (modulePos === -1) {
      // Module not found, just refresh
      qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
      setActiveLessonId(data.id);
      return;
    }
    // Find the end of this module's lessons (next module or end of list)
    let insertAfter = modulePos;
    for (let i = modulePos + 1; i < ordered.length; i++) {
      if (isModuleFolder(ordered[i])) break;
      if (isStandaloneRootPage(ordered[i])) break;
      insertAfter = i;
    }
    // Build new order: insert the new item right after insertAfter
    const newItem = { id: data.id, order_index: 0 } as any;
    const reordered = [...ordered];
    reordered.splice(insertAfter + 1, 0, newItem);
    // Batch update all order_indexes
    const updates = reordered.map((item, idx) => ({ id: item.id, order_index: idx }));
    // Use individual updates to avoid unique constraint issues
    for (let i = 0; i < updates.length; i++) {
      await supabase.from("learning_track_items").update({ order_index: 10000 + i }).eq("id", updates[i].id);
    }
    for (let i = 0; i < updates.length; i++) {
      await supabase.from("learning_track_items").update({ order_index: i }).eq("id", updates[i].id);
    }

    qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
    setActiveLessonId(data.id);
    } finally {
      setCreatingLesson(false);
    }
  };

  /** Inserts a standalone page at the end of the outline (`order_index` = max + 1). */
  const handleAddStandaloneLesson = async () => {
    if (creatingLesson) return;
    setCreatingLesson(true);
    try {
      const maxOrder = Math.max(...phase.items.map((i) => i.order_index), -1);
      const { data, error } = await supabase
        .from("learning_track_items")
        .insert({
          phase_id: phase.id,
          title: "Untitled lesson",
          order_index: maxOrder + 1,
          requires_submission: false,
          hidden_resources: [STANDALONE_PAGE_TAG],
        })
        .select("id")
        .single();
      if (error || !data) return;

      await qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
      setActiveLessonId(data.id);
    } finally {
      setCreatingLesson(false);
    }
  };

  const handleSaveCourseTitle = () => {
    const trimmed = courseTitleValue.trim();
    if (trimmed && trimmed !== phase.title) updatePhase.mutate({ id: phase.id, title: trimmed });
    setEditingCourseTitle(false);
  };

  // No content at all — empty state (or “add module” flow without leaving the page)
  if (phase.items.length === 0 && !addingModule) {
    return (
      <div className="space-y-3">
        <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to tracks
        </button>
        <div className="rounded-xl border bg-card p-8">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="text-left flex-1 min-w-0">
              <div className="mx-auto sm:mx-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Folder className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">{phase.title}</h3>
              <p className="text-sm text-muted-foreground">
                Add a module (folder) to group lessons, or add standalone lessons without a folder.
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="shrink-0 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Track options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => setAddingModule(true)}>
                  <Folder className="h-3.5 w-3.5 mr-2" /> Add module
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void handleAddStandaloneLesson()} disabled={creatingLesson}>
                  <Plus className="h-3.5 w-3.5 mr-2" /> Add standalone page
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setCourseTitleValue(phase.title); setEditingCourseTitle(true); }}>
                  <FileText className="h-3.5 w-3.5 mr-2" /> Rename track
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => updatePhase.mutate({ id: phase.id, published_at: isPublished ? null : new Date().toISOString() })}>
                  {isPublished ? <ArchiveRestore className="h-3.5 w-3.5 mr-2" /> : <Globe className="h-3.5 w-3.5 mr-2" />}
                  {isPublished ? "Unpublish" : "Publish"}
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { if (confirm(`Delete "${phase.title}"?`)) deletePhase.mutate(phase.id, { onSuccess: onBack }); }}>
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete track
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={() => setAddingModule(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add module
            </button>
            <button
              type="button"
              onClick={() => void handleAddStandaloneLesson()}
              disabled={creatingLesson}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted/60 transition-colors disabled:opacity-50"
            >
              {creatingLesson ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add standalone page
            </button>
          </div>
        </div>
        {editingCourseTitle && (
          <div className="rounded-lg border bg-card p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Rename track</p>
            <input
              value={courseTitleValue}
              onChange={(e) => setCourseTitleValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSaveCourseTitle(); if (e.key === "Escape") { setCourseTitleValue(phase.title); setEditingCourseTitle(false); } }}
              className="w-full bg-background border rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-primary/30"
              autoFocus
            />
            <div className="flex gap-2">
              <button type="button" onClick={handleSaveCourseTitle} className="text-xs px-3 py-1 bg-primary text-primary-foreground rounded">Save</button>
              <button type="button" onClick={() => { setCourseTitleValue(phase.title); setEditingCourseTitle(false); }} className="text-xs px-3 py-1 text-muted-foreground">Cancel</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to tracks
      </button>

      <div className="rounded-xl border bg-card overflow-hidden flex min-h-[550px]">
        {/* Sidebar */}
        <div className="w-64 xl:w-72 border-r bg-muted/30 overflow-y-auto shrink-0 flex flex-col">
          {/* Add module — prominent at top */}
          <div className="px-3 py-2 border-b">
            {addingModule ? (
              <div className="space-y-1.5">
                <input
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddModule(); if (e.key === "Escape") { setAddingModule(false); setNewModuleTitle(""); } }}
                  placeholder="Module name..."
                  className="w-full bg-background border rounded px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-primary/30"
                  autoFocus
                />
                <div className="flex gap-1">
                  <button onClick={handleAddModule} disabled={!newModuleTitle.trim()} className="flex-1 px-2 py-1 text-[10px] bg-primary text-primary-foreground rounded font-medium disabled:opacity-40">Add</button>
                  <button onClick={() => { setAddingModule(false); setNewModuleTitle(""); }} className="px-2 py-1 text-[10px] text-muted-foreground">Cancel</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingModule(true)}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Folder className="h-3.5 w-3.5" /> Add module
              </button>
            )}
          </div>

          {/* Course title + kebab */}
          <div className="px-3 py-3 border-b">
            <div className="flex items-start justify-between gap-1">
              {editingCourseTitle ? (
                <input
                  value={courseTitleValue}
                  onChange={(e) => setCourseTitleValue(e.target.value)}
                  onBlur={handleSaveCourseTitle}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveCourseTitle(); if (e.key === "Escape") { setCourseTitleValue(phase.title); setEditingCourseTitle(false); } }}
                  className="flex-1 bg-background border rounded px-2 py-1 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary/30"
                  autoFocus
                />
              ) : (
                <button type="button" onClick={() => setEditingCourseTitle(true)} className="text-xs font-semibold truncate text-left hover:text-primary transition-colors flex-1" title="Click to edit">
                  {phase.title}
                </button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="shrink-0 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => setAddingModule(true)}>
                    <Folder className="h-3.5 w-3.5 mr-2" /> Add module
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void handleAddStandaloneLesson()} disabled={creatingLesson}>
                    <Plus className="h-3.5 w-3.5 mr-2" /> Add standalone page
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setCourseTitleValue(phase.title); setEditingCourseTitle(true); }}>
                    <FileText className="h-3.5 w-3.5 mr-2" /> Rename track
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updatePhase.mutate({ id: phase.id, published_at: isPublished ? null : new Date().toISOString() })}>
                    {isPublished ? <ArchiveRestore className="h-3.5 w-3.5 mr-2" /> : <Globe className="h-3.5 w-3.5 mr-2" />}
                    {isPublished ? "Unpublish" : "Publish"}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { if (confirm(`Delete "${phase.title}"?`)) deletePhase.mutate(phase.id, { onSuccess: onBack }); }}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete track
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <span className={cn(
              "inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1",
              isPublished ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
            )}>
              {isPublished ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>

          {/* Modules → Lessons tree: render segments in order so standalone pages stay at their actual position */}
          <div className="flex-1 overflow-y-auto">
            {segments.length > 0 && (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleOutlineDragEnd}>
                <SortableContext items={outlineSortableIds} strategy={verticalListSortingStrategy}>
                  {segments.map((seg) => {
                    if (seg.type === "standalone") {
                      return (
                        <SortableLessonWrapper key={seg.item.id} id={seg.item.id}>
                          <SidebarLesson
                            item={seg.item}
                            isActive={seg.item.id === activeLessonId}
                            onClick={() => setActiveLessonId(seg.item.id)}
                            moduleFolders={moduleFolders}
                            currentModuleId={null}
                            allItems={phase.items}
                            isOrphan
                          />
                        </SortableLessonWrapper>
                      );
                    }
                    const group = seg;
                    const isCollapsed = collapsedModules.has(group.module.id);
                    return (
                      <SortableModule key={group.module.id} id={group.module.id}>
                        <SidebarModuleHeader
                          item={group.module}
                          isCollapsed={isCollapsed}
                          lessonCount={group.lessons.length}
                          onToggle={() => toggleModule(group.module.id)}
                          onAddLesson={() => handleAddLessonInstant(group.module.id)}
                        />

                        {!isCollapsed && (
                          <div className="pb-1">
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleLessonDragEnd(group.module.id, e)}>
                              <SortableContext items={group.lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                                {group.lessons.map((lesson) => (
                                  <SortableLessonWrapper key={lesson.id} id={lesson.id}>
                                    <SidebarLesson
                                      item={lesson}
                                      isActive={lesson.id === activeLessonId}
                                      onClick={() => setActiveLessonId(lesson.id)}
                                      moduleFolders={moduleFolders}
                                      currentModuleId={group.module.id}
                                      allItems={phase.items}
                                    />
                                  </SortableLessonWrapper>
                                ))}
                              </SortableContext>
                            </DndContext>

                            <button
                              type="button"
                              onClick={() => handleAddLessonInstant(group.module.id)}
                              disabled={creatingLesson}
                              className={cn(
                                "flex items-center gap-1 px-3 py-1 pl-8 text-[10px] text-muted-foreground/50 hover:text-primary transition-colors w-full",
                                creatingLesson && "opacity-50 pointer-events-none",
                              )}
                            >
                              {creatingLesson ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                              {creatingLesson ? "Creating..." : "Add lesson"}
                            </button>
                          </div>
                        )}
                      </SortableModule>
                    );
                  })}
                </SortableContext>
              </DndContext>
            )}
          </div>

        </div>

        {/* Content editor */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          {activeItem && !isModuleFolder(activeItem) ? (
            <AdminLessonEditor
              key={activeItem.id}
              item={activeItem}
              trackPhases={phases}
              onBack={() => setActiveLessonId(null)}
              hideBackButton
            />
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {groups.length === 0
                ? "Use ⋮ beside the track title to add a module or a standalone lesson, or pick a lesson in the sidebar."
                : "Select a lesson from the sidebar to start editing."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Sidebar module folder header
// ============================================================

/** Sortable wrapper for a module (folder + its lessons). */
function SortableModule({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="border-b border-border/30 last:border-b-0 relative">
      {/* Drag handle for module */}
      <button
        {...attributes}
        {...listeners}
        className="absolute left-0 top-2.5 z-10 px-0.5 py-1 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground"
        aria-label="Drag to reorder module"
      >
        <GripVertical className="h-3 w-3" />
      </button>
      {children}
    </div>
  );
}

/** Sortable wrapper for a lesson inside a module. */
function SortableLessonWrapper({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="relative">
      <button
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1.5 z-10 px-0.5 py-1 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground"
        aria-label="Drag to reorder lesson"
      >
        <GripVertical className="h-3 w-3" />
      </button>
      {children}
    </div>
  );
}

function SidebarModuleHeader({
  item,
  isCollapsed,
  lessonCount,
  onToggle,
  onAddLesson,
}: {
  item: LearningTrackItem;
  isCollapsed: boolean;
  lessonCount: number;
  onToggle: () => void;
  onAddLesson: () => void;
}) {
  const deleteItem = useDeleteItem();
  const updateItem = useUpdateItem();
  const qc = useQueryClient();
  const published = !!item.published_at;
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(item.title);

  const handleSave = () => {
    const trimmed = titleValue.trim();
    if (trimmed && trimmed !== item.title) updateItem.mutate({ id: item.id, title: trimmed });
    setEditingTitle(false);
  };

  return (
    <div className="flex items-center group">
      <button type="button" onClick={onToggle} className="flex items-center gap-1.5 px-3 py-2 text-left flex-1 min-w-0 hover:bg-muted/50 transition-colors">
        <span className="shrink-0 text-muted-foreground">
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </span>
        <Folder className="h-3.5 w-3.5 shrink-0 text-amber-500" />
        {editingTitle ? (
          <input
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setTitleValue(item.title); setEditingTitle(false); } }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-background border rounded px-1.5 py-0.5 text-xs font-semibold outline-none focus:ring-1 focus:ring-primary/30 min-w-0"
            autoFocus
          />
        ) : (
          <span className="text-xs font-semibold truncate flex-1">{item.title}</span>
        )}
        <span className="text-[10px] text-muted-foreground shrink-0">{lessonCount}</span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="pr-2 py-2 text-muted-foreground/0 group-hover:text-muted-foreground/60 hover:!text-foreground transition-colors" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => { setTitleValue(item.title); setEditingTitle(true); }}>
            <FileText className="h-3.5 w-3.5 mr-2" /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateItem.mutate({ id: item.id, published_at: published ? null : new Date().toISOString() })}>
            {published ? <ArchiveRestore className="h-3.5 w-3.5 mr-2" /> : <Globe className="h-3.5 w-3.5 mr-2" />}
            {published ? "Unpublish" : "Publish"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAddLesson}>
            <Plus className="h-3.5 w-3.5 mr-2" /> Add lesson
          </DropdownMenuItem>
          <DropdownMenuItem onClick={async () => {
            await supabase.from("learning_track_items").update({ hidden_resources: [] }).eq("id", item.id);
            qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
          }}>
            <FileText className="h-3.5 w-3.5 mr-2" /> Convert to lesson
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { if (confirm(`Delete module "${item.title}" and all its lessons?`)) deleteItem.mutate(item.id); }}>
            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete module
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ============================================================
// Sidebar lesson row
// ============================================================

function SidebarLesson({
  item,
  isActive,
  onClick,
  moduleFolders,
  currentModuleId,
  allItems,
  isOrphan,
}: {
  item: LearningTrackItem;
  isActive: boolean;
  onClick: () => void;
  moduleFolders: LearningTrackItem[];
  currentModuleId: string | null;
  allItems: LearningTrackItem[];
  isOrphan?: boolean;
}) {
  const published = !!item.published_at;
  const deleteItem = useDeleteItem();
  const duplicateItem = useDuplicateItem();
  const updateItem = useUpdateItem();
  const reorderItems = useReorderItems();
  const qc = useQueryClient();
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const otherModules = moduleFolders.filter((m) => m.id !== currentModuleId);

  const handleMoveToModule = (targetModuleId: string) => {
    // Move lesson right after the target module header by reordering
    const targetIdx = allItems.findIndex((i) => i.id === targetModuleId);
    if (targetIdx === -1) return;
    const reordered = allItems.filter((i) => i.id !== item.id);
    // Insert right after the target module header
    const insertIdx = targetIdx; // after filtering, the module header shifts
    const finalIdx = reordered.findIndex((i) => i.id === targetModuleId);
    // Find the last lesson under this module to insert at the end of the group
    let insertAt = finalIdx + 1;
    while (insertAt < reordered.length && !isModuleFolder(reordered[insertAt])) {
      insertAt++;
    }
    reordered.splice(insertAt, 0, item);
    reorderItems.mutate(reordered.map((it, idx) => ({ id: it.id, order_index: idx })));
    setShowMoveMenu(false);
  };

  return (
    <div className="flex items-center group">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex-1 flex items-center gap-2 pl-8 pr-1 py-1.5 text-left text-xs transition-colors min-w-0",
          isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
        )}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", published ? "bg-green-500" : "bg-amber-400")} />
        <span className="truncate">{item.title}</span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className="pr-2 py-1.5 text-muted-foreground/0 group-hover:text-muted-foreground/60 hover:!text-foreground transition-colors" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => updateItem.mutate({ id: item.id, published_at: published ? null : new Date().toISOString() })}>
            {published ? <ArchiveRestore className="h-3.5 w-3.5 mr-2" /> : <Globe className="h-3.5 w-3.5 mr-2" />}
            {published ? "Unpublish" : "Publish"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => duplicateItem.mutate({ sourceItemId: item.id })}>
            <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
          </DropdownMenuItem>
          {otherModules.length > 0 && (
            <DropdownMenuItem onClick={() => setShowMoveMenu(true)}>
              <Folder className="h-3.5 w-3.5 mr-2" /> Move to module
            </DropdownMenuItem>
          )}
          {isOrphan && (
            <DropdownMenuItem onClick={async () => {
              await supabase.from("learning_track_items").update({ hidden_resources: ["module"] }).eq("id", item.id);
              qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
            }}>
              <Folder className="h-3.5 w-3.5 mr-2" /> Convert to module
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { if (confirm(`Delete "${item.title}"?`)) deleteItem.mutate(item.id); }}>
            <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showMoveMenu && (
        <div className="fixed inset-0 z-50" onClick={() => setShowMoveMenu(false)}>
          <div className="absolute right-4 top-1/3 bg-popover border rounded-lg shadow-lg py-1 min-w-[200px] max-h-[300px] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">Move to module…</div>
            {otherModules.map((mod) => (
              <button
                key={mod.id}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                onClick={() => handleMoveToModule(mod.id)}
              >
                <Folder className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="truncate">{mod.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
