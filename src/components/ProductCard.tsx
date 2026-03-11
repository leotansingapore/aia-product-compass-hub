import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bookmark, BookmarkCheck, MoreVertical, Pencil, Trash2, Globe, ArchiveRestore } from "lucide-react";
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

interface ProductCardProps {
  title: string;
  description: string;
  category: string;
  tags: string[];
  highlights: string[];
  onClick: () => void;
  productId?: string;
  published?: boolean;
  onEdit?: (productId: string, data: { title: string; description: string; tags: string[]; highlights: string[] }) => void;
  onDelete?: (productId: string) => void;
  onTogglePublish?: (productId: string, published: boolean) => void;
}

export const ProductCard = memo(function ProductCard({ title, description, category, tags, highlights, onClick, productId, published, onEdit, onDelete, onTogglePublish }: ProductCardProps) {
  const { isBookmarked, toggleBookmark, loading } = useBookmarks();
  const { isAdmin } = usePermissions();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);
  const [editTags, setEditTags] = useState(tags.join(', '));
  const [editHighlights, setEditHighlights] = useState(highlights.join(', '));

  const categoryColors = {
    'Investment': 'bg-gradient-to-r from-blue-500 to-blue-600',
    'Endowment': 'bg-gradient-to-r from-green-500 to-green-600',
    'Whole Life': 'bg-gradient-to-r from-purple-500 to-purple-600',
    'Term': 'bg-gradient-to-r from-orange-500 to-orange-600',
    'Medical': 'bg-gradient-to-r from-red-500 to-red-600'
  };

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
    setEditTags(tags.join(', '));
    setEditHighlights(highlights.join(', '));
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
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
        highlights: editHighlights.split(',').map(h => h.trim()).filter(Boolean),
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

  return (
    <>
      <Card className={`hover:shadow-md transition-all duration-300 ease-in-out cursor-pointer mobile-card h-full flex flex-col ${published === false && isAdmin() ? "opacity-50" : ""}`} onClick={onClick}>
        <CardHeader className="p-2.5 sm:p-3 md:p-6 pb-1.5 sm:pb-2 md:pb-3">
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className={`text-[10px] sm:text-xs px-1.5 sm:px-2 text-white ${categoryColors[category as keyof typeof categoryColors] || 'bg-primary'}`}>
                {category}
              </Badge>
              {published === false && isAdmin() && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal text-muted-foreground border-muted-foreground/30">
                  Draft
                </Badge>
              )}
            </div>
            <TooltipProvider delayDuration={300}>
              <div className="flex items-center gap-0">
                {productId && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBookmarkClick}
                        disabled={loading}
                        className={cn(
                          "h-7 w-7 sm:h-8 sm:w-8 p-0 transition-all duration-300 ease-in-out hover:bg-muted/80 dark:hover:bg-muted hover:text-foreground",
                          bookmarked && "text-primary"
                        )}
                      >
                        {bookmarked ? (
                          <BookmarkCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        ) : (
                          <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                          <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-8 p-0 transition-all duration-300 ease-in-out hover:bg-muted/80 dark:hover:bg-muted hover:text-foreground">
                            <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
                        className="cursor-pointer focus:bg-muted focus:text-foreground"
                        onClick={(e) => { e.stopPropagation(); if (productId) onTogglePublish(productId, !published); }}
                      >
                        {published ? <ArchiveRestore className="h-4 w-4 mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
                        {published ? "Unpublish" : "Publish"}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="cursor-pointer focus:bg-muted focus:text-foreground" onClick={handleEditOpen}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-muted focus:text-destructive" onClick={handleDeleteOpen}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </TooltipProvider>
          </div>
          <CardTitle className="text-sm sm:text-base md:text-card-title leading-snug">{title}</CardTitle>
          <CardDescription className="text-xs sm:text-sm line-clamp-2">{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-2.5 sm:p-3 md:p-6 pt-0 flex-1 flex flex-col justify-end">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-[10px] sm:text-xs px-1.5 sm:px-2">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 text-muted-foreground">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
            
            {/* Hide highlights on mobile, show on sm+ */}
            <div className="hidden sm:block">
              <h4 className="font-medium text-micro md:text-sm mb-2">Key Highlights:</h4>
              <ul className="text-micro md:text-sm text-muted-foreground space-y-1">
                {highlights.slice(0, 3).map((highlight, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-success mr-2">•</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
            
            <Button variant="outline" className="w-full mt-2 sm:mt-4 h-8 sm:h-10 text-xs sm:text-sm mobile-touch-target transition-all duration-300 ease-in-out">
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
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
              <Input id="edit-tags" value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="e.g. ILP, HNW, Mass Market" />
            </div>
            <div>
              <Label htmlFor="edit-highlights">Highlights (comma-separated)</Label>
              <Input id="edit-highlights" value={editHighlights} onChange={(e) => setEditHighlights(e.target.value)} placeholder="e.g. High returns, Low risk" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={!editTitle.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
