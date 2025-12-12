import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Plus, Edit, Trash2, ExternalLink, GripVertical } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import type { UsefulLink } from '@/hooks/useProducts';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface EditableLinksProps {
  links: UsefulLink[];
  onSave?: (newLinks: UsefulLink[]) => Promise<void>;
  className?: string;
  readOnly?: boolean;
}

const defaultIcons = ['📄', '📋', '🌐', '📚', '📊', '🎥', '🔗', '📱'];

interface SortableLinkItemProps {
  link: UsefulLink;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (updatedLink: UsefulLink) => void;
  onRemove: () => void;
  onEmojiSelect: (emoji: string) => void;
}

function SortableLinkItem({ link, index, isEditing, onEdit, onUpdate, onRemove, onEmojiSelect }: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `link-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [emojiPopoverOpen, setEmojiPopoverOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setEmojiPopoverOpen(false);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    onRemove();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow w-full overflow-hidden"
    >
      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div
              {...attributes}
              {...listeners}
              className="mt-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            >
              <GripVertical className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
                <Popover open={emojiPopoverOpen} onOpenChange={setEmojiPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-12 w-12 text-2xl p-0 hover:scale-110 transition-transform"
                    >
                      {link.icon}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 border-0" align="start">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      width={350}
                      height={400}
                      searchPlaceHolder="Search emoji..."
                      previewConfig={{ showPreview: false }}
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  value={link.name}
                  onChange={(e) => onUpdate({ ...link, name: e.target.value })}
                  placeholder="Link name (e.g., Product Brochure)"
                  className="w-full font-medium"
                />
              </div>
              <Input
                value={link.url}
                onChange={(e) => onUpdate({ ...link, url: e.target.value })}
                placeholder="https://example.com"
                className="w-full"
                type="url"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={onEdit}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Done Editing
                </Button>
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Link
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this link?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete <strong>"{link.name}"</strong>? This will be removed from the list when you save changes.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteConfirm}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Link
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 w-full">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          <span className="text-2xl flex-shrink-0">{link.icon}</span>
          <div className="min-w-0 flex-1 max-w-full">
            <div className="font-semibold text-base break-words">{link.name}</div>
            <div className="text-xs text-muted-foreground break-all">
              {link.url}
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={onEdit}
              className="hover:bg-blue-100 dark:hover:bg-blue-900"
              title="Edit this link"
            >
              <Edit className="h-4 w-4 text-foreground" />
            </Button>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="hover:bg-red-100 dark:hover:bg-red-900"
                  title="Delete this link"
                >
                  <Trash2 className="h-4 w-4 text-foreground" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this link?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete <strong>"{link.name}"</strong>? This will be removed from the list when you save changes.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteConfirm}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Link
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  );
}

export function EditableLinks({ links, onSave, className = "", readOnly = false }: EditableLinksProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLinks, setEditLinks] = useState<UsefulLink[]>(links);
  const [newLink, setNewLink] = useState<UsefulLink>({ name: '', url: '', icon: '📄' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [newLinkEmojiPopoverOpen, setNewLinkEmojiPopoverOpen] = useState(false);
  const { isAdmin, isAdmin: isAdminMode } = useAdmin();
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update editLinks when links prop changes, but not while editing
  useEffect(() => {
    if (!isEditing) {
      setEditLinks(links);
    }
  }, [links, isEditing]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setEditLinks((items) => {
        const oldIndex = parseInt(active.id.toString().replace('link-', ''));
        const newIndex = parseInt(over.id.toString().replace('link-', ''));
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    if (!onSave) {
      console.warn('EditableLinks: onSave callback not provided');
      return;
    }

    setSaving(true);
    console.log('🔗 EditableLinks handleSave called with:', editLinks);

    try {
      // Validate links before saving
      const validLinks = editLinks.filter(link => link.name.trim() && link.url.trim());
      console.log('🔗 Valid links to save:', validLinks);

      await onSave(validLinks);
      setIsEditing(false);
      setEditingIndex(null);
      console.log('✅ EditableLinks save successful');
      toast({
        title: "Success",
        description: "Useful links saved successfully",
      });
    } catch (error) {
      console.error('❌ EditableLinks save failed:', error);
      toast({
        title: "Error",
        description: "Failed to save links. Please try again.",
        variant: "destructive",
      });
      // Reset to original links on failure
      setEditLinks(links);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditLinks(links);
    setNewLink({ name: '', url: '', icon: '📄' });
    setEditingIndex(null);
    setIsEditing(false);
  };

  const addLink = () => {
    if (newLink.name.trim() && newLink.url.trim()) {
      const updatedLinks = [...editLinks, { ...newLink }];
      setEditLinks(updatedLinks);
      setNewLink({ name: '', url: '', icon: '📄' });
      console.log('🔗 Added new link:', newLink);
      toast({
        title: "Link Added",
        description: "Don't forget to save your changes!",
      });
    }
  };

  const updateLink = (index: number, updatedLink: UsefulLink) => {
    const updated = [...editLinks];
    updated[index] = updatedLink;
    setEditLinks(updated);
    console.log('🔗 Updated link at index', index, ':', updatedLink);
  };

  const removeLink = (index: number) => {
    const updated = editLinks.filter((_, i) => i !== index);
    setEditLinks(updated);
    console.log('🔗 Removed link at index', index);
    toast({
      title: "Link Removed",
      description: "Don't forget to save your changes!",
    });
  };

  const isValidUrl = (url: string) => {
    try {
      // Allow URLs without protocol by prepending https://
      const urlToTest = url.startsWith('http') ? url : `https://${url}`;
      new URL(urlToTest);
      return true;
    } catch {
      return false;
    }
  };

  const handleNewLinkEmojiClick = (emojiData: EmojiClickData) => {
    setNewLink({ ...newLink, icon: emojiData.emoji });
    setNewLinkEmojiPopoverOpen(false);
  };

  // Check if editing is allowed based on props
  const canEdit = !readOnly && !!onSave;

  if (!canEdit) {
    return (
      <div className={`grid grid-cols-1 3xl:grid-cols-2 gap-3 ${className}`}>
        {links.map((link, index) => (
          <Button
            key={index}
            variant="outline"
            className="justify-start min-w-0 h-auto py-2 whitespace-normal text-left"
            asChild
            disabled={!isValidUrl(link.url)}
          >
            <a
              href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-full"
            >
              <span className="mr-2 flex-shrink-0">{link.icon}</span>
              <span className="break-words whitespace-normal text-left">{link.name}</span>
              <ExternalLink className="h-4 w-4 ml-auto flex-shrink-0" />
            </a>
          </Button>
        ))}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={editLinks.map((_, i) => `link-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-4">
              {editLinks.map((link, index) => (
                <SortableLinkItem
                  key={`link-${index}`}
                  link={link}
                  index={index}
                  isEditing={editingIndex === index}
                  onEdit={() => setEditingIndex(editingIndex === index ? null : index)}
                  onUpdate={(updatedLink) => updateLink(index, updatedLink)}
                  onRemove={() => removeLink(index)}
                  onEmojiSelect={(emoji) => updateLink(index, { ...link, icon: emoji })}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="border-2 border-dashed border-primary/40 rounded-lg p-5 bg-primary/5">
          <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Link
          </h4>
          <div className="space-y-3">
            <div className="grid grid-cols-[auto_1fr] gap-3 items-center">
              <Popover open={newLinkEmojiPopoverOpen} onOpenChange={setNewLinkEmojiPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-12 w-12 text-2xl p-0 hover:scale-110 transition-transform"
                  >
                    {newLink.icon}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 border-0" align="start">
                  <EmojiPicker
                    onEmojiClick={handleNewLinkEmojiClick}
                    width={350}
                    height={400}
                    searchPlaceHolder="Search emoji..."
                    previewConfig={{ showPreview: false }}
                  />
                </PopoverContent>
              </Popover>
              <Input
                value={newLink.name}
                onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                placeholder="Link name (e.g., Product Brochure)"
                className="w-full"
              />
            </div>
            <Input
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder="https://example.com"
              onKeyPress={(e) => e.key === 'Enter' && addLink()}
              type="url"
            />
            <Button
              size="sm"
              onClick={addLink}
              disabled={!newLink.name.trim() || !newLink.url.trim()}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Link
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t">
          <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-initial">
            <Check className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={saving} className="flex-1 sm:flex-initial">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 3xl:grid-cols-2 gap-3">
        {links.length > 0 ? (
          links.map((link, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start hover:bg-primary/90 hover:text-primary-foreground min-w-0 transition-all h-auto py-2 whitespace-normal text-left"
              asChild
              disabled={!isValidUrl(link.url)}
            >
              <a
                href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center w-full"
              >
                <span className="mr-2 flex-shrink-0 text-lg">{link.icon}</span>
                <span className="break-words whitespace-normal text-left font-medium">{link.name}</span>
                <ExternalLink className="h-4 w-4 ml-auto flex-shrink-0" />
              </a>
            </Button>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            <p className="text-sm">No useful links yet. Click below to add some!</p>
          </div>
        )}
      </div>
      <Button
        variant="outline"
        className="w-full border-2 border-dashed border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:text-foreground transition-all duration-200 bg-primary/5"
        onClick={() => setIsEditing(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        <span className="font-medium">Add / Edit Links</span>
      </Button>
    </div>
  );
}
