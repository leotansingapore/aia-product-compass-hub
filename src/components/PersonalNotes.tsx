import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Trash2, Plus, Search, GripVertical } from 'lucide-react';
import { NotionStyleEditor } from './notion-editor/NotionStyleEditor';
import { useNotes } from '../hooks/useNotes';
import { useAuth } from '../hooks/useAuth';
import ReactMarkdown from 'react-markdown';
import { useToast } from './ui/use-toast';
import { Input } from './ui/input';

interface PersonalNotesProps {
  productId: string;
}

export function PersonalNotes({ productId }: PersonalNotesProps) {
  const { user } = useAuth();
  const { notes, loading, addNote, updateNote, deleteNote } = useNotes(productId);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewNoteEditor, setShowNewNoteEditor] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');

  const handleAddNote = async (content: string) => {
    if (!content.trim()) return;

    try {
      await addNote(content);
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
    }
  };

  const handleUpdateNote = async (noteId: string, content: string) => {
    try {
      await updateNote(noteId, content);
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
    }
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

  // Filter notes based on search query
  const filteredNotes = notes.filter(note => 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <div className="space-y-6">
      {/* Header with search */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Personal Notes</h3>
        <div className="flex items-center gap-3">
          {notes.length > 0 && (
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
          )}
          <Button 
            onClick={() => setShowNewNoteEditor(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        </div>
      </div>

      {/* New note editor */}
      {showNewNoteEditor && (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <div className="p-4">
            <NotionStyleEditor
              value={newNoteContent}
              onChange={setNewNoteContent}
              onSave={handleAddNote}
              placeholder="Start writing your note... Type '/' for formatting options"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewNoteEditor(false);
                  setNewNoteContent('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Notes list */}
      {filteredNotes.length === 0 ? (
        <Card className="p-6 text-center">
          {searchQuery ? (
            <div>
              <p className="text-muted-foreground mb-4">
                No notes found matching "{searchQuery}"
              </p>
              <Button 
                variant="outline"
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </Button>
            </div>
          ) : notes.length === 0 ? (
            <div>
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4 text-lg">
                No personal notes yet
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Capture your thoughts, insights, and important information about this product.
              </p>
              {!showNewNoteEditor && (
                <Button 
                  onClick={() => setShowNewNoteEditor(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Note
                </Button>
              )}
            </div>
          ) : null}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => {
            const noteTitle = note.content.split('\n')[0] || 'Untitled Note';
            const notePreview = note.content.length > 100 
              ? note.content.substring(0, 100) + '...' 
              : note.content;

            return (
              <Card key={note.id} className="group hover:shadow-md transition-all duration-200">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground line-clamp-1">
                          {noteTitle}
                        </h4>
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
                        onClick={() => handleDeleteNote(note.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <NotionStyleEditor
                    value={note.content}
                    onChange={() => {}} // Controlled by onSave
                    onSave={(content) => handleUpdateNote(note.id, content)}
                    placeholder="Click to edit this note..."
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}