import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Lock,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useBatchVideoProgress } from "@/hooks/useBatchVideoProgress";
import type { Product } from "@/hooks/useProducts";

interface CMFASExamModuleListProps {
  modules: Product[];
  locked: boolean;
  isAdmin: boolean;
  onProductClick: (productId: string) => void;
  onEditProduct?: (
    productId: string,
    data: { title: string; description: string; tags: string[]; highlights: string[] },
  ) => void;
  onDeleteProduct?: (productId: string) => void;
  onTogglePublish?: (productId: string, published: boolean) => void;
  onCreateModule?: () => void;
}

// Strip a leading "CMFAS " from the title so rows read like "M9 Module" not
// "CMFAS M9 Module" — titles are already inside a section labelled CMFAS.
function cleanTitle(title: string): string {
  return title.replace(/^CMFAS\s+/i, "").trim() || title;
}

export function CMFASExamModuleList({
  modules,
  locked,
  isAdmin,
  onProductClick,
  onEditProduct,
  onDeleteProduct,
  onTogglePublish,
  onCreateModule,
}: CMFASExamModuleListProps) {
  const productIds = useMemo(() => modules.map((m) => m.id), [modules]);
  const videoCountsByProduct = useMemo(() => {
    const map: Record<string, number> = {};
    for (const m of modules) {
      map[m.id] = m.training_videos?.length ?? 0;
    }
    return map;
  }, [modules]);
  const progressMap = useBatchVideoProgress(productIds, videoCountsByProduct);

  const { completed, total } = useMemo(() => {
    let c = 0;
    const t = modules.length;
    for (const m of modules) {
      if ((progressMap[m.id]?.percentage ?? 0) >= 100) c += 1;
    }
    return { completed: c, total: t };
  }, [modules, progressMap]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Exam modules
          </h2>
          {total > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="tabular-nums">{completed} of {total}</span> complete
              {locked && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Finish setup to open these papers
                </span>
              )}
            </p>
          )}
        </div>
        {isAdmin && onCreateModule && (
          <Button
            type="button"
            size="sm"
            className="h-10 shrink-0 gap-2"
            onClick={onCreateModule}
          >
            <Plus className="h-4 w-4" /> New module
          </Button>
        )}
      </div>

      {/* Rows */}
      {modules.length === 0 ? (
        <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
          No exam modules yet.
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-lg border bg-card overflow-hidden">
          {modules.map((module) => (
            <ModuleRow
              key={module.id}
              module={module}
              percentage={progressMap[module.id]?.percentage ?? 0}
              locked={locked}
              isAdmin={isAdmin}
              onProductClick={onProductClick}
              onEditProduct={onEditProduct}
              onDeleteProduct={onDeleteProduct}
              onTogglePublish={onTogglePublish}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface ModuleRowProps {
  module: Product;
  percentage: number;
  locked: boolean;
  isAdmin: boolean;
  onProductClick: (productId: string) => void;
  onEditProduct?: CMFASExamModuleListProps["onEditProduct"];
  onDeleteProduct?: CMFASExamModuleListProps["onDeleteProduct"];
  onTogglePublish?: CMFASExamModuleListProps["onTogglePublish"];
}

function ModuleRow({
  module,
  percentage,
  locked,
  isAdmin,
  onProductClick,
  onEditProduct,
  onDeleteProduct,
  onTogglePublish,
}: ModuleRowProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(module.title);
  const [editDescription, setEditDescription] = useState(module.description || "");
  const [editTags, setEditTags] = useState((module.tags || []).join(", "));
  const [editHighlights, setEditHighlights] = useState((module.highlights || []).join(", "));

  const published = module.published !== false;
  const isLockedForUser = locked && !isAdmin;
  const isComplete = percentage >= 100;
  const hasStarted = percentage > 0 && percentage < 100;

  const handleRowClick = () => {
    if (isLockedForUser) return;
    onProductClick(module.id);
  };

  const handleEditOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTitle(module.title);
    setEditDescription(module.description || "");
    setEditTags((module.tags || []).join(", "));
    setEditHighlights((module.highlights || []).join(", "));
    setEditOpen(true);
  };

  const handleEditSave = () => {
    onEditProduct?.(module.id, {
      title: editTitle,
      description: editDescription,
      tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
      highlights: editHighlights.split(",").map((h) => h.trim()).filter(Boolean),
    });
    setEditOpen(false);
  };

  const handleDeleteConfirm = () => {
    onDeleteProduct?.(module.id);
    setDeleteOpen(false);
  };

  return (
    <li>
      <div
        role="button"
        tabIndex={isLockedForUser ? -1 : 0}
        aria-disabled={isLockedForUser}
        onClick={handleRowClick}
        onKeyDown={(e) => {
          if (isLockedForUser) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleRowClick();
          }
        }}
        className={cn(
          "flex items-center gap-3 px-4 py-3 transition-colors sm:gap-4 sm:px-5 sm:py-4",
          isLockedForUser
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:bg-muted/40",
        )}
      >
        {/* Status indicator */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center">
          {isLockedForUser ? (
            <Lock className="h-4 w-4 text-muted-foreground" />
          ) : isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : hasStarted ? (
            <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-label="In progress" />
          ) : (
            <span
              className="h-2.5 w-2.5 rounded-full border border-muted-foreground/40"
              aria-label="Not started"
            />
          )}
        </div>

        {/* Title + description + progress */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground sm:text-base">
              {cleanTitle(module.title)}
            </p>
            {isAdmin && !published && (
              <span className="shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                Draft
              </span>
            )}
          </div>
          {module.description?.trim() && (
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {module.description}
            </p>
          )}
          {hasStarted && (
            <div className="flex items-center gap-2 pt-0.5">
              <Progress value={percentage} className="h-1 flex-1" />
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {percentage}%
              </span>
            </div>
          )}
        </div>

        {/* Admin controls */}
        {isAdmin && (
          <div
            className="flex shrink-0 items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {onTogglePublish && (
              <label
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                onClick={(e) => e.stopPropagation()}
              >
                <Switch
                  checked={published}
                  onCheckedChange={(checked) => onTogglePublish(module.id, checked)}
                  className="h-3.5 w-6 data-[state=checked]:bg-emerald-500 [&>span]:h-2.5 [&>span]:w-2.5 [&>span]:data-[state=checked]:translate-x-2.5"
                  aria-label={published ? "Unpublish module" : "Publish module"}
                />
                <span
                  className={cn(
                    published
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground",
                  )}
                >
                  {published ? "Live" : "Draft"}
                </span>
              </label>
            )}
            {(onEditProduct || onDeleteProduct) && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Module actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background z-50">
                  {onEditProduct && (
                    <DropdownMenuItem className="cursor-pointer" onClick={handleEditOpen}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDeleteProduct && (
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}

        {/* Chevron */}
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground",
            isLockedForUser && "opacity-40",
          )}
          aria-hidden
        />
      </div>

      {/* Edit dialog */}
      {onEditProduct && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Edit Module</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor={`edit-title-${module.id}`}>Title *</Label>
                <Input
                  id={`edit-title-${module.id}`}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`edit-desc-${module.id}`}>Description</Label>
                <Textarea
                  id={`edit-desc-${module.id}`}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor={`edit-tags-${module.id}`}>Tags (comma-separated)</Label>
                <Input
                  id={`edit-tags-${module.id}`}
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`edit-highlights-${module.id}`}>
                  Key highlights (comma-separated)
                </Label>
                <Input
                  id={`edit-highlights-${module.id}`}
                  value={editHighlights}
                  onChange={(e) => setEditHighlights(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSave} disabled={!editTitle.trim()}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirmation */}
      {onDeleteProduct && (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Delete module</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete <strong>{cleanTitle(module.title)}</strong>?
              This cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </li>
  );
}
