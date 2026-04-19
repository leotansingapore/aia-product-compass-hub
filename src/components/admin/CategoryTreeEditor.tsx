import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Move,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useCategories, type Category } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

// Editable copy of a category with just the fields the editor mutates.
// We track original values to detect dirty rows on save.
interface EditRow {
  id: string;
  name: string;
  published: boolean;
  parent_id: string | null;
  sort_order: number;
  _origParent: string | null;
  _origOrder: number;
}

function toEditRow(c: Category): EditRow {
  return {
    id: c.id,
    name: c.name,
    published: c.published ?? true,
    parent_id: c.parent_id,
    sort_order: c.sort_order,
    _origParent: c.parent_id,
    _origOrder: c.sort_order,
  };
}

function isDirty(r: EditRow): boolean {
  return r.parent_id !== r._origParent || r.sort_order !== r._origOrder;
}

function sortBy<T extends { sort_order: number; name: string }>(rows: T[]): T[] {
  return [...rows].sort(
    (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
  );
}

// Renumber rows in 10-increment steps so future inserts don't need a full
// reorder. Returns a new array; does not mutate in place.
function renumber(rows: EditRow[]): EditRow[] {
  return rows.map((r, i) => ({ ...r, sort_order: (i + 1) * 10 }));
}

interface SortableRowProps {
  row: EditRow;
  level: 0 | 1;
  hasChildren?: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
  moveTargets: { id: string; name: string }[]; // valid parent targets for this row
  onMove: (rowId: string, newParentId: string | null) => void;
  canDemote: boolean;
}

function SortableRow({
  row,
  level,
  hasChildren,
  expanded,
  onToggleExpand,
  moveTargets,
  onMove,
  canDemote,
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const dirty = isDirty(row);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border border-border bg-card px-2 py-2",
        "hover:border-primary/40 transition-colors",
        dirty && "ring-2 ring-amber-500/50",
        level === 1 && "ml-6 sm:ml-8",
      )}
    >
      <button
        type="button"
        className="shrink-0 cursor-grab touch-none p-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label={`Drag ${row.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {level === 0 && hasChildren ? (
        <button
          type="button"
          onClick={onToggleExpand}
          className="shrink-0 p-1 text-muted-foreground hover:text-foreground"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      ) : (
        <span className="w-6 shrink-0" aria-hidden />
      )}

      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {row.name}
      </span>

      {!row.published && (
        <Badge
          variant="outline"
          className="h-5 shrink-0 px-1.5 text-[10px] font-normal text-muted-foreground"
        >
          <EyeOff className="mr-1 h-3 w-3" />
          Draft
        </Badge>
      )}
      {dirty && (
        <Badge className="h-5 shrink-0 bg-amber-500 px-1.5 text-[10px] font-normal text-white hover:bg-amber-500">
          Unsaved
        </Badge>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 gap-1 px-2 text-xs"
          >
            <Move className="h-3.5 w-3.5" />
            Move
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[12rem]">
          <DropdownMenuLabel className="text-xs">Move to…</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {level === 1 && (
            <DropdownMenuItem onClick={() => onMove(row.id, null)}>
              Top level
            </DropdownMenuItem>
          )}
          {level === 0 && !canDemote && (
            <DropdownMenuItem disabled>
              Cannot demote — has children
            </DropdownMenuItem>
          )}
          {moveTargets.length === 0 ? (
            <DropdownMenuItem disabled>No other parents</DropdownMenuItem>
          ) : (
            moveTargets.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => onMove(row.id, t.id)}
              >
                Under "{t.name}"
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function CategoryTreeEditor() {
  const { categories, loading, refetch } = useCategories();
  const [rows, setRows] = useState<EditRow[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  // Hydrate local edit state when server data arrives / changes.
  useEffect(() => {
    setRows(categories.map(toEditRow));
  }, [categories]);

  const topLevel = useMemo(
    () => sortBy(rows.filter((r) => r.parent_id === null)),
    [rows],
  );

  const childrenOf = (parentId: string) =>
    sortBy(rows.filter((r) => r.parent_id === parentId));

  const hasChildrenMap = useMemo(() => {
    const map = new Set<string>();
    rows.forEach((r) => {
      if (r.parent_id) map.add(r.parent_id);
    });
    return map;
  }, [rows]);

  const dirtyCount = rows.filter(isDirty).length;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEndGroup = (
    group: EditRow[],
    parentScope: string | null,
    e: DragEndEvent,
  ) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = group.findIndex((r) => r.id === active.id);
    const newIndex = group.findIndex((r) => r.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = renumber(arrayMove(group, oldIndex, newIndex));

    // Merge reordered group back into the full rows list.
    setRows((prev) => {
      const byId = new Map(prev.map((r) => [r.id, r]));
      reordered.forEach((r) => byId.set(r.id, r));
      return Array.from(byId.values());
    });
  };

  const handleMove = (rowId: string, newParentId: string | null) => {
    setRows((prev) => {
      const target = prev.find((r) => r.id === rowId);
      if (!target) return prev;

      // Guard: demoting a top-level that has children would violate the
      // 2-level invariant the DB trigger enforces. Block it client-side too.
      if (
        target.parent_id === null &&
        newParentId !== null &&
        prev.some((r) => r.parent_id === rowId)
      ) {
        toast.error(
          `Cannot move "${target.name}" — it has children. Move them out first.`,
        );
        return prev;
      }
      // Guard: making a row a child of another child (grandchildren).
      if (newParentId !== null) {
        const newParent = prev.find((r) => r.id === newParentId);
        if (newParent && newParent.parent_id !== null) {
          toast.error(
            `Cannot nest under "${newParent.name}" — only top-level categories can hold children.`,
          );
          return prev;
        }
      }

      // Place the moved row at the end of its new group; renumber that group.
      const destGroup = sortBy(
        prev.filter((r) => r.parent_id === newParentId && r.id !== rowId),
      );
      const moved: EditRow = { ...target, parent_id: newParentId };
      const reordered = renumber([...destGroup, moved]);

      // Also renumber the old group to close the gap left by the moved row.
      const originGroup = sortBy(
        prev.filter(
          (r) => r.parent_id === target.parent_id && r.id !== rowId,
        ),
      );
      const originRenum = renumber(originGroup);

      const byId = new Map(prev.map((r) => [r.id, r]));
      reordered.forEach((r) => byId.set(r.id, r));
      originRenum.forEach((r) => byId.set(r.id, r));
      return Array.from(byId.values());
    });
  };

  const handleReset = () => {
    setRows(categories.map(toEditRow));
    toast.info("Reverted unsaved changes");
  };

  const handleSave = async () => {
    const dirty = rows.filter(isDirty);
    if (dirty.length === 0) {
      toast.info("No changes to save");
      return;
    }
    setSaving(true);
    try {
      // Apply updates sequentially so any trigger error surfaces per-row.
      for (const r of dirty) {
        const { error } = await supabase
          .from("categories")
          .update({ parent_id: r.parent_id, sort_order: r.sort_order })
          .eq("id", r.id);
        if (error) throw new Error(`${r.name}: ${error.message}`);
      }
      toast.success(`Saved ${dirty.length} change${dirty.length !== 1 ? "s" : ""}`);
      await refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Loading categories…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Drag the handle to reorder within a group. Use <em>Move</em> to change
          parent. Strict 2-level hierarchy.
        </div>
        <div className="flex items-center gap-2">
          {dirtyCount > 0 && (
            <Badge className="bg-amber-500 hover:bg-amber-500">
              {dirtyCount} unsaved
            </Badge>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={dirtyCount === 0 || saving}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={dirtyCount === 0 || saving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e) => handleDragEndGroup(topLevel, null, e)}
      >
        <SortableContext
          items={topLevel.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {topLevel.map((row) => {
              const kids = childrenOf(row.id);
              const isOpen = expanded[row.id] ?? true;
              const moveTargets = topLevel
                .filter((t) => t.id !== row.id)
                .map((t) => ({ id: t.id, name: t.name }));
              return (
                <div key={row.id} className="space-y-2">
                  <SortableRow
                    row={row}
                    level={0}
                    hasChildren={hasChildrenMap.has(row.id)}
                    expanded={isOpen}
                    onToggleExpand={() =>
                      setExpanded((e) => ({ ...e, [row.id]: !isOpen }))
                    }
                    moveTargets={moveTargets.filter((t) => {
                      // Can't move a row under itself; can't move a parent-with-
                      // children under anyone (would violate 2-level).
                      if (kids.length > 0) return false;
                      return true;
                    })}
                    canDemote={kids.length === 0}
                    onMove={handleMove}
                  />
                  {isOpen && kids.length > 0 && (
                    <ChildGroup
                      parentId={row.id}
                      rows={kids}
                      allTopLevelTargets={topLevel
                        .filter((t) => t.id !== row.id)
                        .map((t) => ({ id: t.id, name: t.name }))}
                      onDragEnd={(e) => handleDragEndGroup(kids, row.id, e)}
                      onMove={handleMove}
                      sensors={sensors}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

interface ChildGroupProps {
  parentId: string;
  rows: EditRow[];
  allTopLevelTargets: { id: string; name: string }[];
  onDragEnd: (e: DragEndEvent) => void;
  onMove: (rowId: string, newParentId: string | null) => void;
  sensors: ReturnType<typeof useSensors>;
}

function ChildGroup({
  rows,
  allTopLevelTargets,
  onDragEnd,
  onMove,
  sensors,
}: ChildGroupProps) {
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={rows.map((r) => r.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1.5">
          {rows.map((row) => (
            <SortableRow
              key={row.id}
              row={row}
              level={1}
              moveTargets={allTopLevelTargets}
              canDemote
              onMove={onMove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
