import { useState, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, CheckCircle2, Pencil, Plus, Trash2, GripVertical, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { AssignmentSection, AssignmentItem } from "@/data/learningTrackData";
import type { useAssignmentProgress } from "@/hooks/useAssignmentProgress";
import type { useAssignmentOverrides } from "@/hooks/useAssignmentOverrides";
import type { useAssignmentSubmissions } from "@/hooks/useAssignmentSubmissions";
import { format } from "date-fns";
import { InlineEditableText } from "./InlineEditableText";
import { AssignmentSubmissionPanel } from "./AssignmentSubmissionPanel";

interface AssignmentChecklistProps {
  sections: AssignmentSection[];
  progressHook: ReturnType<typeof useAssignmentProgress>;
  isAdmin: boolean;
  overrides?: ReturnType<typeof useAssignmentOverrides>;
  submissionsHook?: ReturnType<typeof useAssignmentSubmissions>;
}

export function AssignmentChecklist({
  sections,
  progressHook,
  isAdmin,
  overrides,
  submissionsHook,
}: AssignmentChecklistProps) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <AssignmentSectionCard
          key={section.id}
          section={section}
          progressHook={progressHook}
          isAdmin={isAdmin}
          overrides={overrides}
          submissionsHook={submissionsHook}
        />
      ))}
    </div>
  );
}

function AssignmentSectionCard({
  section,
  progressHook,
  isAdmin,
  overrides,
  submissionsHook,
}: {
  section: AssignmentSection;
  progressHook: ReturnType<typeof useAssignmentProgress>;
  isAdmin: boolean;
  overrides?: ReturnType<typeof useAssignmentOverrides>;
  submissionsHook?: ReturnType<typeof useAssignmentSubmissions>;
}) {
  const [open, setOpen] = useState(true);
  const [addingNew, setAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const effectiveItems = overrides
    ? overrides.getEffectiveItems(section)
    : section.items;

  const ids = effectiveItems.map((i) => i.id);
  const completed = progressHook.getCompletedCount(ids);
  const total = ids.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const sectionTitle = overrides
    ? overrides.getSectionTitle(section.id, section.title)
    : section.title;
  const sectionDesc = overrides
    ? overrides.getSectionDescription(section.id, section.description)
    : section.description;

  const handleAddItem = () => {
    if (newTitle.trim()) {
      if (overrides) {
        overrides.addItem(section.id, newTitle.trim());
      }
      setNewTitle("");
      setAddingNew(false);
    }
  };

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    // Reorder
    const newItems = [...effectiveItems];
    const [moved] = newItems.splice(draggedIdx, 1);
    newItems.splice(idx, 0, moved);
    if (overrides) {
      overrides.reorderItems(section.id, newItems.map((i) => i.id));
    }
    setDraggedIdx(idx);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

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
                  value={sectionTitle}
                  onSave={(v) => overrides.setSectionField(section.id, "title", v)}
                  isAdmin={isAdmin}
                  className="font-semibold text-sm leading-tight"
                  as="h3"
                />
              ) : (
                <h3 className="font-semibold text-sm leading-tight">{sectionTitle}</h3>
              )}
              {sectionDesc && (
                isAdmin && overrides ? (
                  <InlineEditableText
                    value={sectionDesc}
                    onSave={(v) => overrides.setSectionField(section.id, "description", v)}
                    isAdmin={isAdmin}
                    className="text-xs text-muted-foreground mt-0.5 line-clamp-1"
                    as="p"
                  />
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{sectionDesc}</p>
                )
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
        <div className="mt-1">
          {/* Table header */}
          <div className="grid grid-cols-[auto_auto_1fr_120px_120px_auto] gap-2 px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b">
            {isAdmin && <div className="w-4" />}
            <div className="w-5" />
            <div>Task</div>
            <div className="text-center">Date Completed</div>
            <div className="text-center">Remarks</div>
            <div className="text-center w-8">Files</div>
          </div>

          {/* Items */}
          {effectiveItems.map((item, index) => (
            <AssignmentRow
              key={item.id}
              item={item}
              index={index}
              displayIndex={index + 1}
              progressHook={progressHook}
              isAdmin={isAdmin}
              overrides={overrides}
              submissionsHook={submissionsHook}
              onRemove={
                isAdmin && overrides
                  ? () => overrides.removeItem(section.id, item.id)
                  : undefined
              }
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              isDragging={draggedIdx === index}
            />
          ))}

          {/* Admin: Add new item */}
          {isAdmin && overrides && (
            <div className="px-3 py-2 border-t">
              {addingNew ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="New assignment title..."
                    className="h-7 text-sm flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddItem();
                      if (e.key === "Escape") { setAddingNew(false); setNewTitle(""); }
                    }}
                  />
                  <button
                    onClick={handleAddItem}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setAddingNew(false); setNewTitle(""); }}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingNew(true)}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" />
                  Add assignment
                </button>
              )}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function AssignmentRow({
  item,
  index,
  displayIndex,
  progressHook,
  isAdmin,
  overrides,
  submissionsHook,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: {
  item: AssignmentItem;
  index: number;
  displayIndex: number;
  progressHook: ReturnType<typeof useAssignmentProgress>;
  isAdmin: boolean;
  overrides?: ReturnType<typeof useAssignmentOverrides>;
  submissionsHook?: ReturnType<typeof useAssignmentSubmissions>;
  onRemove?: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}) {
  const isCompleted = progressHook.isCompleted(item.id);
  const completedAt = progressHook.getCompletedAt(item.id);
  const remarks = progressHook.getRemarks(item.id);
  const [editingRemarks, setEditingRemarks] = useState(false);
  const [remarkValue, setRemarkValue] = useState(remarks);
  const [showSubmissions, setShowSubmissions] = useState(false);

  const itemTitle = overrides
    ? overrides.getItemTitle(item.id, item.title)
    : item.title;

  const submissionCount = submissionsHook
    ? submissionsHook.getSubmissions(item.id).length
    : 0;

  const saveRemarks = () => {
    progressHook.setRemarks(item.id, remarkValue);
    setEditingRemarks(false);
  };

  return (
    <>
      <div
        className={cn(
          "grid gap-2 px-3 py-2.5 items-center border-b last:border-b-0 group transition-colors",
          isAdmin
            ? "grid-cols-[auto_auto_1fr_120px_120px_auto]"
            : "grid-cols-[auto_1fr_120px_120px_auto]",
          isCompleted ? "bg-green-50/50 dark:bg-green-950/20" : "hover:bg-accent/30",
          isDragging && "opacity-50 bg-accent/40"
        )}
        draggable={isAdmin}
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          onDragStart();
        }}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        {/* Drag handle (admin only) */}
        {isAdmin && (
          <div className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground">
            <GripVertical className="h-3.5 w-3.5" />
          </div>
        )}

        {/* Checkbox */}
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => progressHook.toggleItem(item.id)}
          className="shrink-0"
          aria-label={`Mark "${itemTitle}" as ${isCompleted ? "incomplete" : "complete"}`}
        />

        {/* Title */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-5">{displayIndex}.</span>
          {isAdmin && overrides ? (
            <InlineEditableText
              value={itemTitle}
              onSave={(v) => overrides.setItemTitle(item.id, v)}
              isAdmin={isAdmin}
              className={cn(
                "text-sm leading-tight",
                isCompleted && "line-through text-muted-foreground"
              )}
            />
          ) : (
            <span
              className={cn(
                "text-sm leading-tight",
                isCompleted && "line-through text-muted-foreground"
              )}
            >
              {itemTitle}
            </span>
          )}
          {isAdmin && onRemove && (
            <button
              onClick={onRemove}
              className="hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full text-destructive opacity-60 hover:opacity-100"
              aria-label="Remove assignment"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Date Completed */}
        <div className="text-center">
          {isCompleted && completedAt ? (
            <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              {format(new Date(completedAt), "dd MMM yyyy")}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/40">—</span>
          )}
        </div>

        {/* Remarks */}
        <div className="text-center">
          {editingRemarks ? (
            <Input
              value={remarkValue}
              onChange={(e) => setRemarkValue(e.target.value)}
              className="h-6 text-xs"
              autoFocus
              onBlur={saveRemarks}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveRemarks();
                if (e.key === "Escape") setEditingRemarks(false);
              }}
            />
          ) : (
            <button
              onClick={() => { setRemarkValue(remarks); setEditingRemarks(true); }}
              className="text-xs text-muted-foreground hover:text-foreground w-full text-center min-h-[20px] flex items-center justify-center gap-1"
            >
              {remarks || (
                <span className="text-muted-foreground/40 flex items-center gap-1">
                  <Pencil className="h-2.5 w-2.5" /> Add
                </span>
              )}
            </button>
          )}
        </div>

        {/* Submissions toggle */}
        <div className="text-center">
          <button
            onClick={() => setShowSubmissions(!showSubmissions)}
            className={cn(
              "relative inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors",
              showSubmissions
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
            aria-label="Submissions"
          >
            <Paperclip className="h-3.5 w-3.5" />
            {submissionCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">
                {submissionCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Submission panel */}
      {showSubmissions && submissionsHook && (
        <AssignmentSubmissionPanel
          itemId={item.id}
          submissionsHook={submissionsHook}
        />
      )}
    </>
  );
}
