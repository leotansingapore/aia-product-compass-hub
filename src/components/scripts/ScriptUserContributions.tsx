import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Check, X, Copy, Users } from "lucide-react";
import { useScriptUserVersions, type ScriptUserVersion } from "@/hooks/useScriptUserVersions";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markdownComponents } from "@/lib/markdown-config";
import { toast } from "sonner";

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1 text-xs"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

interface Props {
  scriptId: string;
  isAuthenticated: boolean;
  displayName?: string;
}

export function ScriptUserContributions({ scriptId, isAuthenticated, displayName }: Props) {
  const { userVersions, addVersion, updateVersion, deleteVersion, userId } = useScriptUserVersions(scriptId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newAuthorName, setNewAuthorName] = useState(displayName || "");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editAuthorName, setEditAuthorName] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newContent.trim()) return;
    addVersion.mutate(
      { content: newContent.trim(), authorName: newAuthorName.trim() || "Anonymous" },
      {
        onSuccess: () => {
          setNewContent("");
          setNewAuthorName(displayName || "");
          setShowAddForm(false);
        },
      }
    );
  };

  const startEdit = (v: ScriptUserVersion) => {
    setEditingId(v.id);
    setEditContent(v.content);
    setEditAuthorName(v.author_name);
  };

  const handleUpdate = () => {
    if (!editingId || !editContent.trim()) return;
    updateVersion.mutate(
      { id: editingId, content: editContent.trim(), authorName: editAuthorName.trim() || undefined },
      { onSuccess: () => setEditingId(null) }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteVersion.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
  };

  if (userVersions.length === 0 && !isAuthenticated) return null;

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Community Contributions</span>
          {userVersions.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">{userVersions.length}</Badge>
          )}
        </div>
        {isAuthenticated && !showAddForm && (
          <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => setShowAddForm(true)}>
            <Plus className="h-3 w-3" /> Add Your Version
          </Button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-4 border rounded-lg p-3 bg-muted/20 space-y-2">
          <Input
            value={newAuthorName}
            onChange={(e) => setNewAuthorName(e.target.value)}
            placeholder="Your name / label"
            className="text-sm"
          />
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Write your version... (supports markdown)"
            rows={6}
            className="text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setShowAddForm(false); setNewContent(""); }}>
              <X className="h-3.5 w-3.5 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={!newContent.trim() || addVersion.isPending}>
              <Check className="h-3.5 w-3.5 mr-1" /> Submit
            </Button>
          </div>
        </div>
      )}

      {/* User Versions List */}
      <div className="space-y-3">
        {userVersions.map((v) => (
          <div key={v.id} className="border rounded-lg overflow-hidden">
            {editingId === v.id ? (
              <div className="p-3 space-y-2 bg-muted/20">
                <Input
                  value={editAuthorName}
                  onChange={(e) => setEditAuthorName(e.target.value)}
                  placeholder="Your name / label"
                  className="text-sm"
                />
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  className="text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                    <X className="h-3.5 w-3.5 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleUpdate} disabled={!editContent.trim() || updateVersion.isPending}>
                    <Check className="h-3.5 w-3.5 mr-1" /> Save
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-3 py-2 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{v.author_name}</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(v.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CopyBtn text={v.content} />
                    {userId === v.user_id && (
                      <>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(v)} title="Edit">
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget(v.id)} title="Delete">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-3 prose prose-sm dark:prose-invert max-w-none text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>
                    {v.content}
                  </ReactMarkdown>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your version?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
