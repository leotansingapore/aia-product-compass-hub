import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Trash2, Plus, GripVertical, Save, X } from 'lucide-react';
import { NotionStyleEditor } from './notion-editor/NotionStyleEditor';
import { useNotes, UserNote } from '../hooks/useNotes';
import { useAuth } from '../hooks/useAuth';
import { useToast } from './ui/use-toast';
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

interface PersonalNotesProps {
  productId: string;
}

export function PersonalNotes({ productId }: PersonalNotesProps) {
  const { user } = useAuth();
  const { notes, loading, addNote, updateNote, deleteNote, reorderNotes } = useNotes(productId);
  const { toast } = useToast();
  const [showNewNoteEditor, setShowNewNoteEditor] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, string>>({});
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    setSavingNoteId('new');
    try {
      await addNote(newNoteContent);
      setNewNoteContent('');
      setShowNewNoteEditor(false);
      toast({
        title: "Note added",
        description: "Your note has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    const content = unsavedChanges[noteId];
    if (!content || !content.trim()) return;

    setSavingNoteId(noteId);
    try {
      await updateNote(noteId, content);
      setUnsavedChanges(prev => {
        const newChanges = { ...prev };
        delete newChanges[noteId];
        return newChanges;
      });
      setEditingNoteId(null);
      toast({
        title: "Note updated",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleDiscardChanges = (noteId: string) => {
    setUnsavedChanges(prev => {
      const newChanges = { ...prev };
      delete newChanges[noteId];
      return newChanges;
    });
    setEditingNoteId(null);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(noteId);
        toast({
          title: "Note deleted",
          description: "Your note has been removed.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete note. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    const oldIndex = notes.findIndex((note) => note.id === active.id);
    const newIndex = notes.findIndex((note) => note.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;
    
    const reordered = arrayMove(notes, oldIndex, newIndex);
    
    try {
      await reorderNotes(reordered);
    } catch (error) {
      console.error('Failed to reorder notes:', error);
    }
  };

  if (!user) {
    return (
      <Card className="p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Please log in to view and add personal notes.
          </p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-4">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mx-auto mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/4 mx-auto"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm sm:text-lg font-semibold">Personal Notes</h3>
        <Button 
          onClick={() => setShowNewNoteEditor(true)}
          size="sm"
          className="gap-1.5 text-xs sm:text-sm h-7 sm:h-9"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">New Note</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* New note editor */}
      {showNewNoteEditor && (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <div className="p-4">
            <NotionStyleEditor
              value={newNoteContent}
              onChange={setNewNoteContent}
              placeholder="Start writing your note... Type '/' for formatting options"
              autoFocus
              autoSave={false}
            />
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewNoteEditor(false);
                  setNewNoteContent('');
                }}
                disabled={savingNoteId === 'new'}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={!newNoteContent.trim() || savingNoteId === 'new'}
                className="gap-2"
              >
                {savingNoteId === 'new' ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Note
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Notes list */}
      {notes.length === 0 ? (
        <Card className="p-3 sm:p-6 text-center">
          <div className="w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 bg-muted rounded-full flex items-center justify-center">
            <Plus className="w-5 h-5 sm:w-8 sm:h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-1 sm:mb-4 text-sm sm:text-lg">
            No personal notes yet
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-6 hidden sm:block">
            Capture your thoughts, insights, and important information about this product.
          </p>
          {!showNewNoteEditor && (
            <Button 
              onClick={() => setShowNewNoteEditor(true)}
              className="gap-2 text-xs sm:text-sm h-8 sm:h-10"
              size="sm"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Create Your First Note
            </Button>
          )}
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={notes.map(note => note.id)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {notes.map((note) => {
                const hasUnsavedChanges = unsavedChanges[note.id] !== undefined;
                const displayContent = hasUnsavedChanges ? unsavedChanges[note.id] : note.content;

                return (
                  <SortableNoteItem
                    key={note.id}
                    note={note}
                    hasUnsavedChanges={hasUnsavedChanges}
                    displayContent={displayContent}
                    onContentChange={(content) => {
                      setUnsavedChanges(prev => ({ ...prev, [note.id]: content }));
                      setEditingNoteId(note.id);
                    }}
                    onSave={() => handleUpdateNote(note.id)}
                    onDiscard={() => handleDiscardChanges(note.id)}
                    onDelete={() => handleDeleteNote(note.id)}
                    isSaving={savingNoteId === note.id}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

interface SortableNoteItemProps {
  note: UserNote;
  hasUnsavedChanges: boolean;
  displayContent: string;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onDiscard: () => void;
  onDelete: () => void;
  isSaving: boolean;
}

function SortableNoteItem({ 
  note, 
  hasUnsavedChanges, 
  displayContent,
  onContentChange,
  onSave,
  onDiscard,
  onDelete,
  isSaving
}: SortableNoteItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const noteTitle = note.content.split('\n')[0] || 'Untitled Note';

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`group hover:shadow-md transition-all duration-200 ${hasUnsavedChanges ? 'ring-2 ring-warning/50' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Drag handle - visible on hover */}
            <div 
              className="cursor-grab active:cursor-grabbing opacity-40 group-hover:opacity-100 transition-opacity"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground line-clamp-1">
                  {noteTitle}
                </h4>
                {hasUnsavedChanges && (
                  <span className="text-xs text-warning">• Unsaved changes</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-micro text-muted-foreground">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
                {note.updated_at !== note.created_at && (
                  <span className="text-micro text-muted-foreground">
                    • Edited {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              disabled={isSaving}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <NotionStyleEditor
          value={displayContent}
          onChange={onContentChange}
          placeholder="Click to edit this note..."
          autoSave={false}
        />

        {hasUnsavedChanges && (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDiscard}
              disabled={isSaving}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Discard Changes
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
