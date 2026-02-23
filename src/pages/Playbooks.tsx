import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, FileText, Pencil, Trash2, User, Clock, BookOpen } from "lucide-react";
import { usePlaybooks } from "@/hooks/usePlaybooks";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Playbooks() {
  const navigate = useNavigate();
  const { user } = useSimplifiedAuth();
  const { playbooks, isLoading, createPlaybook, updatePlaybook, deletePlaybook, userId } = usePlaybooks();

  const [createOpen, setCreateOpen] = useState(false);
  const [editPlaybook, setEditPlaybook] = useState<{ id: string; title: string; description: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!title.trim()) return;
    createPlaybook.mutate({ title: title.trim(), description: description.trim() || undefined }, {
      onSuccess: () => {
        setCreateOpen(false);
        setTitle("");
        setDescription("");
      }
    });
  };

  const handleUpdate = () => {
    if (!editPlaybook || !title.trim()) return;
    updatePlaybook.mutate({ id: editPlaybook.id, title: title.trim(), description: description.trim() || undefined }, {
      onSuccess: () => {
        setEditPlaybook(null);
        setTitle("");
        setDescription("");
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deletePlaybook.mutate(deleteTarget, {
      onSuccess: () => setDeleteTarget(null)
    });
  };

  if (isLoading) {
    return (
      <PageLayout title="Script Playbooks" description="Curated collections of scripts">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Script Playbooks" description="Create curated collections of scripts for different scenarios">
      <BrandedPageHeader
        title="Script Playbooks"
        subtitle="Create curated collections of scripts for different scenarios"
      />

      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-20">
        {/* Create Button */}
        {user && (
          <div className="mb-6">
            <Button onClick={() => { setTitle(""); setDescription(""); setCreateOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              New Playbook
            </Button>
          </div>
        )}

        {/* Playbooks Grid */}
        {playbooks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No playbooks yet</h3>
              <p className="text-muted-foreground mb-4">Create your first playbook to curate scripts for different scenarios.</p>
              {user && (
                <Button onClick={() => { setTitle(""); setDescription(""); setCreateOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" /> Create Playbook
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {playbooks.map((pb) => (
              <Card
                key={pb.id}
                className="cursor-pointer hover:shadow-md transition-shadow group"
                onClick={() => navigate(`/playbooks/${pb.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{pb.title}</CardTitle>
                    {userId === pb.created_by && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditPlaybook({ id: pb.id, title: pb.title, description: pb.description || "" });
                            setTitle(pb.title);
                            setDescription(pb.description || "");
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(pb.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {pb.description && (
                    <CardDescription className="line-clamp-2">{pb.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {pb.creator_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(pb.updated_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Playbook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input placeholder="Playbook title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <Textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!title.trim() || createPlaybook.isPending}>
              {createPlaybook.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editPlaybook} onOpenChange={() => setEditPlaybook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Playbook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Playbook title" value={title} onChange={e => setTitle(e.target.value)} />
            <Textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlaybook(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={!title.trim() || updatePlaybook.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete playbook?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this playbook and all its script selections.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
