import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/hooks/useNotes";
import { formatDistanceToNow } from 'date-fns';
import { Plus, Edit2, Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { MinimalRichEditor } from './MinimalRichEditor';
import ReactMarkdown from 'react-markdown';

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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Personal Notes</h3>
        </div>
        {!showNewNote && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNewNote(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* New Note Form */}
      {showNewNote && (
        <div className="border border-border/40 rounded-lg bg-card/50 backdrop-blur-sm">
          <MinimalRichEditor
            value={newNoteContent}
            onChange={setNewNoteContent}
            onSave={handleAddNote}
            onCancel={() => {
              setShowNewNote(false);
              setNewNoteContent('');
            }}
            placeholder="Write your note... (⌘+Enter to save, Esc to cancel)"
            autoFocus={true}
            showToolbar={true}
          />
          <div className="px-3 pb-3 flex gap-2">
            <Button
              onClick={handleAddNote}
              disabled={!newNoteContent.trim()}
              size="sm"
              className="h-7 text-xs"
            >
              Save
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowNewNote(false);
                setNewNoteContent('');
              }}
              size="sm"
              className="h-7 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Loading notes...
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {showNewNote ? "Your notes will appear here" : "No notes yet. Click + to add your first note"}
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className={cn(
                "group border border-border/40 rounded-lg transition-all duration-200 hover:border-border/60",
                editingId === note.id ? "bg-card/50 backdrop-blur-sm" : "bg-card/30 hover:bg-card/50"
              )}
            >
              {editingId === note.id ? (
                <div>
                  <MinimalRichEditor
                    value={editContent}
                    onChange={setEditContent}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                    placeholder="Edit your note..."
                    autoFocus={true}
                    showToolbar={true}
                  />
                  <div className="px-3 pb-3 flex gap-2">
                    <Button
                      onClick={handleSaveEdit}
                      disabled={!editContent.trim()}
                      size="sm"
                      className="h-7 text-xs"
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleCancelEdit}
                      size="sm"
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => handleStartEdit(note.id, note.content)}
                >
                  <div className="space-y-3">
                    <div className="prose prose-sm max-w-none text-foreground">
                      <ReactMarkdown
                        components={{
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {children}
                            </a>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-foreground">{children}</strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic">{children}</em>
                          ),
                          p: ({ children }) => (
                            <p className="leading-relaxed text-foreground last:mb-0">{children}</p>
                          )
                        }}
                      >
                        {note.content}
                      </ReactMarkdown>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(note.id, note.content);
                          }}
                          className="h-7 w-7 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}