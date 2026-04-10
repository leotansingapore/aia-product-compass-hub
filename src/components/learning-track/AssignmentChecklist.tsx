import { useState, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Pencil, Plus, Trash2, GripVertical, Paperclip, CheckCircle2, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import type { AssignmentSection, AssignmentItem } from "@/data/learningTrackData";
import type { useAssignmentProgress } from "@/hooks/useAssignmentProgress";
import type { useAssignmentOverrides } from "@/hooks/useAssignmentOverrides";
import type { useAssignmentSubmissions } from "@/hooks/useAssignmentSubmissions";
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
        <div className="mt-2 space-y-2 pl-2">
          {effectiveItems.map((item, index) => (
            <AssignmentItemRow
              key={item.id}
              item={item}
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
            />
          ))}

          {/* Admin: Add new item */}
          {isAdmin && overrides && (
            <div className="px-3 py-2">
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

function AssignmentItemRow({
  item,
  displayIndex,
  progressHook,
  isAdmin,
  overrides,
  submissionsHook,
  onRemove,
}: {
  item: AssignmentItem;
  displayIndex: number;
  progressHook: ReturnType<typeof useAssignmentProgress>;
  isAdmin: boolean;
  overrides?: ReturnType<typeof useAssignmentOverrides>;
  submissionsHook?: ReturnType<typeof useAssignmentSubmissions>;
  onRemove?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = progressHook.isCompleted(item.id);
  const completedAt = progressHook.getCompletedAt(item.id);
  const remarks = progressHook.getRemarks(item.id);
  const [editingRemarks, setEditingRemarks] = useState(false);
  const [remarkValue, setRemarkValue] = useState(remarks);

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
    <div
      className={cn(
        "rounded-lg border transition-all",
        isCompleted
          ? "bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
          : "bg-card"
      )}
    >
      <div className="flex items-start gap-3 p-3">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => progressHook.toggleItem(item.id)}
          className="mt-0.5 shrink-0"
          aria-label={`Mark "${itemTitle}" as ${isCompleted ? "incomplete" : "complete"}`}
        />

        {isAdmin && onRemove && (
          <button
            onClick={onRemove}
            className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive transition-colors"
            aria-label={`Delete "${itemTitle}"`}
            title="Remove assignment"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}

        <Collapsible open={expanded} onOpenChange={setExpanded} className="flex-1 min-w-0">
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-start justify-between text-left group">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0 w-5">{displayIndex}.</span>
                  {isAdmin && overrides ? (
                    <InlineEditableText
                      value={itemTitle}
                      onSave={(v) => overrides.setItemTitle(item.id, v)}
                      isAdmin={isAdmin}
                      className={cn(
                        "text-sm font-medium leading-tight",
                        isCompleted && "line-through text-muted-foreground"
                      )}
                    />
                  ) : (
                    <span
                      className={cn(
                        "text-sm font-medium leading-tight",
                        isCompleted && "line-through text-muted-foreground"
                      )}
                    >
                      {itemTitle}
                    </span>
                  )}
                </div>

                {/* Compact info row when collapsed */}
                {!expanded && (
                  <div className="flex items-center gap-3 mt-1 ml-7">
                    {isCompleted && completedAt && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        {format(new Date(completedAt), "dd MMM yyyy")}
                      </span>
                    )}
                    {submissionCount > 0 && (
                      <span className="text-[10px] text-primary flex items-center gap-1">
                        <Paperclip className="h-3 w-3" />
                        {submissionCount} file{submissionCount !== 1 ? "s" : ""}
                      </span>
                    )}
                    {remarks && (
                      <span className="text-[10px] text-muted-foreground italic truncate max-w-[140px]">
                        {remarks}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform mt-0.5 ml-2",
                  expanded && "rotate-90"
                )}
              />
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="mt-3 space-y-4 text-sm ml-7">
              {/* Status details */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <ClipboardList className="h-3 w-3" />
                  Details
                </div>

                <div className="space-y-2">
                  {/* Date completed */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground text-xs">Date Completed</span>
                    {isCompleted && completedAt ? (
                      <span className="text-xs flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        {format(new Date(completedAt), "dd MMM yyyy")}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">—</span>
                    )}
                  </div>

                  {/* Remarks */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground text-xs">Remarks</span>
                    {editingRemarks ? (
                      <Input
                        value={remarkValue}
                        onChange={(e) => setRemarkValue(e.target.value)}
                        className="h-6 text-xs max-w-[200px]"
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
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        {remarks || (
                          <span className="text-muted-foreground/40 flex items-center gap-1">
                            <Pencil className="h-2.5 w-2.5" /> Add note
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Submissions */}
              {submissionsHook && (
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    <Paperclip className="h-3 w-3" />
                    Submissions
                  </div>
                  <AssignmentSubmissionPanel
                    itemId={item.id}
                    submissionsHook={submissionsHook}
                  />
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
