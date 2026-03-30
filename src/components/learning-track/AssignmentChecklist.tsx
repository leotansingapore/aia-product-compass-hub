import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Calendar, CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { AssignmentSection, AssignmentItem } from "@/data/learningTrackData";
import type { useAssignmentProgress } from "@/hooks/useAssignmentProgress";
import { format } from "date-fns";

interface AssignmentChecklistProps {
  sections: AssignmentSection[];
  progressHook: ReturnType<typeof useAssignmentProgress>;
  isAdmin: boolean;
  onAddItem?: (sectionId: string, title: string) => void;
  onRemoveItem?: (sectionId: string, itemId: string) => void;
}

export function AssignmentChecklist({
  sections,
  progressHook,
  isAdmin,
  onAddItem,
  onRemoveItem,
}: AssignmentChecklistProps) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <AssignmentSectionCard
          key={section.id}
          section={section}
          progressHook={progressHook}
          isAdmin={isAdmin}
          onAddItem={onAddItem}
          onRemoveItem={onRemoveItem}
        />
      ))}
    </div>
  );
}

function AssignmentSectionCard({
  section,
  progressHook,
  isAdmin,
  onAddItem,
  onRemoveItem,
}: {
  section: AssignmentSection;
  progressHook: ReturnType<typeof useAssignmentProgress>;
  isAdmin: boolean;
  onAddItem?: (sectionId: string, title: string) => void;
  onRemoveItem?: (sectionId: string, itemId: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const [addingNew, setAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const ids = section.items.map((i) => i.id);
  const completed = progressHook.getCompletedCount(ids);
  const total = ids.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleAddItem = () => {
    if (newTitle.trim() && onAddItem) {
      onAddItem(section.id, newTitle.trim());
      setNewTitle("");
      setAddingNew(false);
    }
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
              <h3 className="font-semibold text-sm leading-tight">{section.title}</h3>
              {section.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{section.description}</p>
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
          <div className="grid grid-cols-[auto_1fr_140px_140px] gap-2 px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b">
            <div className="w-5" />
            <div>Task</div>
            <div className="text-center">Date Completed</div>
            <div className="text-center">Remarks</div>
          </div>

          {/* Items */}
          {section.items.map((item, index) => (
            <AssignmentRow
              key={item.id}
              item={item}
              index={index + 1}
              progressHook={progressHook}
              isAdmin={isAdmin}
              onRemove={onRemoveItem ? () => onRemoveItem(section.id, item.id) : undefined}
            />
          ))}

          {/* Admin: Add new item */}
          {isAdmin && (
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
  progressHook,
  isAdmin,
  onRemove,
}: {
  item: AssignmentItem;
  index: number;
  progressHook: ReturnType<typeof useAssignmentProgress>;
  isAdmin: boolean;
  onRemove?: () => void;
}) {
  const completed = progressHook.isCompleted(item.id);
  const completedAt = progressHook.getCompletedAt(item.id);
  const remarks = progressHook.getRemarks(item.id);
  const [editingRemarks, setEditingRemarks] = useState(false);
  const [remarkValue, setRemarkValue] = useState(remarks);

  const saveRemarks = () => {
    progressHook.setRemarks(item.id, remarkValue);
    setEditingRemarks(false);
  };

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_1fr_140px_140px] gap-2 px-3 py-2.5 items-center border-b last:border-b-0 group transition-colors",
        completed ? "bg-green-50/50 dark:bg-green-950/20" : "hover:bg-accent/30"
      )}
    >
      {/* Checkbox */}
      <Checkbox
        checked={completed}
        onCheckedChange={() => progressHook.toggleItem(item.id)}
        className="shrink-0"
        aria-label={`Mark "${item.title}" as ${completed ? "incomplete" : "complete"}`}
      />

      {/* Title */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-5">{index}.</span>
        <span
          className={cn(
            "text-sm leading-tight",
            completed && "line-through text-muted-foreground"
          )}
        >
          {item.title}
        </span>
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
        {completed && completedAt ? (
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
    </div>
  );
}
