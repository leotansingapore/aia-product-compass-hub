import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNotes } from "@/hooks/useNotes";
import { formatDistanceToNow } from 'date-fns';
import { Plus, Edit2, Trash2, Save, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonalNotesProps {
  productId: string;
}

export function PersonalNotes({ productId }: PersonalNotesProps) {
  const { notes, loading, addNote, updateNote, deleteNote } = useNotes(productId);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showNewNote, setShowNewNote] = useState(false);

  const handleAddNote = async () => {
    if (newNoteContent.trim()) {
      await addNote(newNoteContent);
      setNewNoteContent('');
      setShowNewNote(false);
    }
  };

  const handleStartEdit = (noteId: string, content: string) => {
    setEditingId(noteId);
    setEditContent(content);
  };

  const handleSaveEdit = async () => {
    if (editingId && editContent.trim()) {
      await updateNote(editingId, editContent);
      setEditingId(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote(noteId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Personal Notes
        </CardTitle>
        <CardDescription>
          Keep track of your thoughts and insights about this product
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Note Button */}
        {!showNewNote && (
          <Button
            variant="outline"
            onClick={() => setShowNewNote(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Note
          </Button>
        )}

        {/* New Note Form */}
        {showNewNote && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
            <Textarea
              placeholder="Write your note here..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddNote}
                disabled={!newNoteContent.trim()}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Note
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewNote(false);
                  setNewNoteContent('');
                }}
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Notes List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No notes yet. Add your first note above!
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  "p-4 border rounded-lg transition-colors",
                  editingId === note.id ? "bg-muted/50" : "bg-card"
                )}
              >
                {editingId === note.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveEdit}
                        disabled={!editContent.trim()}
                        size="sm"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(note.id, note.content)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}