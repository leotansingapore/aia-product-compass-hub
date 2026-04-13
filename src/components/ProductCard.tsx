import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Trash2,
  Globe,
  ArchiveRestore,
  ChevronRight,
} from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

/** Maps full or short category labels from the API to header badge gradients. */
function categoryAccentClass(category: string): string {
  const c = category.trim().toLowerCase();
  if (c.includes("core")) return "bg-gradient-to-r from-amber-500 to-amber-600";
  if (c.includes("investment")) return "bg-gradient-to-r from-blue-500 to-blue-600";
  if (c.includes("endowment")) return "bg-gradient-to-r from-green-500 to-emerald-600";
  if (c.includes("whole life")) return "bg-gradient-to-r from-purple-500 to-violet-600";
  if (c.includes("term")) return "bg-gradient-to-r from-orange-500 to-amber-600";
  if (c.includes("medical")) return "bg-gradient-to-r from-red-500 to-rose-600";
  if (c.includes("supplementary") || c.includes("training")) return "bg-gradient-to-r from-teal-500 to-cyan-600";
  // Legacy short names
  if (c === "investment") return "bg-gradient-to-r from-blue-500 to-blue-600";
  if (c === "endowment") return "bg-gradient-to-r from-green-500 to-emerald-600";
  if (c === "whole life") return "bg-gradient-to-r from-purple-500 to-violet-600";
  if (c === "term") return "bg-gradient-to-r from-orange-500 to-amber-600";
  if (c === "medical") return "bg-gradient-to-r from-red-500 to-rose-600";
  return "bg-gradient-to-r from-primary to-primary/80";
}

interface ProductCardProps {
  title: string;
  description: string;
  category: string;
  tags: string[];
  highlights: string[];
  onClick: () => void;
  productId?: string;
  published?: boolean;
  completionPct?: number;
  onEdit?: (productId: string, data: { title: string; description: string; tags: string[]; highlights: string[] }) => void;
  onDelete?: (productId: string) => void;
  onTogglePublish?: (productId: string, published: boolean) => void;
}

export const ProductCard = memo(function ProductCard({
  title,
  description,
  category,
  tags,
  highlights,
  onClick,
  productId,
  published,
  completionPct,
  onEdit,
  onDelete,
  onTogglePublish,
}: ProductCardProps) {
  const { isBookmarked, toggleBookmark, loading } = useBookmarks();
  const { isAdmin } = usePermissions();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);
  const [editTags, setEditTags] = useState(tags.join(", "));
  const [editHighlights, setEditHighlights] = useState(highlights.join(", "));

  const accent = categoryAccentClass(category);
  const bookmarked = productId ? isBookmarked(productId) : false;

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (productId) {
      toggleBookmark(productId);
    }
  };

  const handleEditOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTitle(title);
    setEditDescription(description);
    setEditTags(tags.join(", "));
    setEditHighlights(highlights.join(", "));
    setShowEditDialog(true);
  };

  const handleDeleteOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleEditSave = () => {
    if (productId && onEdit) {
      onEdit(productId, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
        highlights: editHighlights.split(",").map((h) => h.trim()).filter(Boolean),
      });
    }
    setShowEditDialog(false);
  };

  const handleDeleteConfirm = () => {
    if (productId && onDelete) {
      onDelete(productId);
    }
    setShowDeleteDialog(false);
  };

  const handleCtaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <>
      <Card
        className={cn(
          "mobile-card flex h-full cursor-pointer flex-col transition-all duration-300 ease-in-out",
          "hover:border-primary/20 hover:shadow-lg",
          published === false && isAdmin() && "opacity-50"
        )}
        onClick={onClick}
      >
        <CardHeader className="space-y-4 p-4 pb-0 sm:p-5 sm:pb-0">
          {/* Eyebrow: category + draft — visually subordinate to title */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className={cn(
                  "inline-flex max-w-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white sm:text-xs",
                  accent
                )}
              >
                <span className="truncate">{category}</span>
              </Badge>
              {published === false && isAdmin() && (
                <Badge
                  variant="outline"
                  className="h-5 shrink-0 px-1.5 text-[10px] font-medium text-muted-foreground"
                >
                  Draft
                </Badge>
              )}
            </div>

            <TooltipProvider delayDuration={300}>
              <div className="flex shrink-0 items-center gap-0.5">
                {productId && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBookmarkClick}
                        disabled={loading}
                        className={cn("h-8 w-8 p-0", bookmarked && "text-primary")}
                      >
                        {bookmarked ? (
                          <BookmarkCheck className="h-4 w-4" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{bookmarked ? "Remove bookmark" : "Bookmark"}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {isAdmin() && productId && (
                  <DropdownMenu modal={false}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>More options</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      {onTogglePublish && (
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (productId) onTogglePublish(productId, !published);
                          }}
                        >
                          {published ? (
                            <ArchiveRestore className="mr-2 h-4 w-4" />
                          ) : (
                            <Globe className="mr-2 h-4 w-4" />
                          )}
                          {published ? "Unpublish" : "Publish"}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="cursor-pointer" onClick={handleEditOpen}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:text-destructive"
                        onClick={handleDeleteOpen}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </TooltipProvider>
          </div>

          {/* Title — primary headline */}
          <div className="space-y-2">
            <CardTitle
              title={title}
              className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-foreground sm:text-xl"
            >
              {title}
            </CardTitle>
            <CardDescription
              title={description}
              className="line-clamp-2 min-h-[2.75rem] text-sm leading-relaxed text-muted-foreground"
            >
              {description?.trim() ? description : "No description yet."}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4 p-4 pt-5 sm:p-5 sm:pt-6">
          {completionPct != null && completionPct > 0 && (
            <div className="flex items-center gap-2.5">
              <Progress value={completionPct} className="h-1.5 flex-1" />
              <span className="flex shrink-0 items-center gap-1 tabular-nums text-xs font-medium text-muted-foreground">
                {completionPct >= 100 && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                <span>{completionPct}%</span>
              </span>
            </div>
          )}

          <div className="flex min-h-[5.5rem] flex-1 flex-col border-t border-border/60 pt-4">
            {highlights.length > 0 ? (
              <div className="space-y-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Key points
                </p>
                <ul className="space-y-2 text-sm leading-snug text-muted-foreground">
                  {highlights.slice(0, 3).map((highlight, index) => (
                    <li key={index} className="flex gap-2.5">
                      <span className="mt-0.5 shrink-0 text-primary" aria-hidden>
                        •
                      </span>
                      <span className="min-w-0 line-clamp-2 [overflow-wrap:anywhere]">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : tags.length > 0 ? (
              <div className="space-y-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.slice(0, 4).map((tag, index) => (
                    <Badge key={index} variant="outline" className="px-2 py-0.5 text-xs font-normal">
                      <span className="max-w-[10rem] truncate">{tag}</span>
                    </Badge>
                  ))}
                  {tags.length > 4 && (
                    <Badge variant="outline" className="px-2 py-0.5 text-xs text-muted-foreground">
                      +{tags.length - 4}
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground/80">
                Open the module for videos, resources, and notes.
              </p>
            )}
          </div>

          <Button
            type="button"
            variant="default"
            className="mt-auto h-10 w-full gap-2 text-sm font-semibold sm:h-11"
            onClick={handleCtaClick}
          >
            Learn more
            <ChevronRight className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input id="edit-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-tags"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="e.g. ILP, HNW, Mass Market"
              />
            </div>
            <div>
              <Label htmlFor="edit-highlights">Highlights (comma-separated)</Label>
              <Input
                id="edit-highlights"
                value={editHighlights}
                onChange={(e) => setEditHighlights(e.target.value)}
                placeholder="e.g. High returns, Low risk"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={!editTitle.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{title}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
