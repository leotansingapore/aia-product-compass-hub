import { useState, useMemo } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, FileText, Pencil, Trash2, User, Clock, Star, EyeOff, Eye, MoreVertical, Loader2, Globe, Search, BookOpen, ListOrdered } from "lucide-react";
import { usePlaybooks } from "@/hooks/usePlaybooks";
import { usePlaybookPrefs } from "@/hooks/usePlaybookPrefs";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { format } from "date-fns";
import { ScriptsHubHeaderTabs } from "@/components/scripts/ScriptsTabBar";
import { cn } from "@/lib/utils";
import { Playbook } from "@/hooks/usePlaybooks";


function PlaybookCard({
  pb,
  canManage,
  isFav,
  isHid,
  onFav,
  onHide,
  onEdit,
  onDelete,
}: {
  pb: Playbook;
  canManage: boolean;
  isFav: boolean;
  isHid: boolean;
  onFav: () => void;
  onHide: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const navigate = useNavigate();
  const itemCount = pb.item_count || 0;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98] group relative border-l-4 border-l-transparent hover:border-l-primary/40"
      onClick={() => navigate(`/playbooks/${pb.id}`)}
    >
      <CardHeader className="pb-2 px-4 sm:px-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            {isFav && <Star className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5 fill-primary" />}
            <CardTitle className="text-sm sm:text-base leading-snug line-clamp-2 break-words">{pb.title}</CardTitle>
          </div>
          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0"
                onClick={e => e.stopPropagation()}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44" onClick={e => e.stopPropagation()}>
              <DropdownMenuItem onClick={onFav} className="gap-2">
                <Star className={cn("h-3.5 w-3.5", isFav && "fill-primary text-primary")} />
                {isFav ? "Remove from Favourites" : "Add to Favourites"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onHide} className="gap-2">
                {isHid ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {isHid ? "Unhide" : "Hide this Playbook"}
              </DropdownMenuItem>
              {canManage && (
                <>
                  <DropdownMenuItem onClick={onEdit} className="gap-2">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive focus:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {pb.description && (
          <CardDescription className="line-clamp-2 text-xs sm:text-sm">{pb.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0 px-4 sm:px-5">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {pb.creator_name}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(new Date(pb.updated_at), "MMM d")}
          </span>
          <span className="flex items-center gap-1">
            <ListOrdered className="h-3 w-3" />
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
          {pb.is_public && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 gap-0.5 border-blue-200 text-blue-600">
              <Globe className="h-2.5 w-2.5" /> Public
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message, cta, icon: Icon = FileText }: { message: string; cta?: React.ReactNode; icon?: React.ElementType }) {
  return (
    <Card className="text-center py-10 sm:py-12 border-dashed">
      <CardContent>
        <div className="rounded-full bg-muted w-14 h-14 mx-auto flex items-center justify-center mb-4">
          <Icon className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm mb-4">{message}</p>
        {cta}
      </CardContent>
    </Card>
  );
}

export default function Playbooks() {
  const { user } = useSimplifiedAuth();
  const { isMasterAdmin, hasRole } = usePermissions();
  const { playbooks, isLoading, createPlaybook, updatePlaybook, deletePlaybook, userId } = usePlaybooks();
  const { isFavourite, isHidden, toggleFavourite, toggleHidden } = usePlaybookPrefs();
  const navigate = useNavigate();

  const canManage = (createdBy: string) => userId === createdBy || isMasterAdmin() || hasRole('admin');

  const [tab, setTab] = useState("mine");
  const [createOpen, setCreateOpen] = useState(false);
  const [editPlaybook, setEditPlaybook] = useState<{ id: string; title: string; description: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");

  const handleCreate = () => {
    if (!title.trim()) return;
    createPlaybook.mutate({ title: title.trim(), description: description.trim() || undefined }, {
      onSuccess: () => { setCreateOpen(false); setTitle(""); setDescription(""); }
    });
  };

  const handleUpdate = () => {
    if (!editPlaybook || !title.trim()) return;
    updatePlaybook.mutate({ id: editPlaybook.id, title: title.trim(), description: description.trim() || undefined }, {
      onSuccess: () => { setEditPlaybook(null); setTitle(""); setDescription(""); }
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deletePlaybook.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
  };

  // Split playbooks into categories
  const myPlaybooks = userId ? playbooks.filter(pb => pb.created_by === userId) : [];
  const othersPlaybooks = userId
    ? playbooks.filter(pb => pb.created_by !== userId && !isHidden(pb.id))
    : playbooks.filter(pb => !isHidden(pb.id));
  const favourites = playbooks.filter(pb => isFavourite(pb.id) && !isHidden(pb.id));
  const hiddenPlaybooks = playbooks.filter(pb => isHidden(pb.id));

  // Apply search filter to current tab
  const filterBySearch = (list: Playbook[]) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(pb =>
      pb.title.toLowerCase().includes(q) ||
      (pb.description || "").toLowerCase().includes(q) ||
      (pb.creator_name || "").toLowerCase().includes(q)
    );
  };

  const filteredMine = useMemo(() => filterBySearch(myPlaybooks), [myPlaybooks, search]);
  const filteredOthers = useMemo(() => filterBySearch(othersPlaybooks), [othersPlaybooks, search]);
  const filteredFavourites = useMemo(() => filterBySearch(favourites), [favourites, search]);
  const filteredHidden = useMemo(() => filterBySearch(hiddenPlaybooks), [hiddenPlaybooks, search]);

  const cardProps = (pb: Playbook) => ({
    pb,
    canManage: canManage(pb.created_by),
    isFav: isFavourite(pb.id),
    isHid: isHidden(pb.id),
    onFav: () => toggleFavourite(pb.id),
    onHide: () => toggleHidden(pb.id),
    onEdit: () => { setEditPlaybook({ id: pb.id, title: pb.title, description: pb.description || "" }); setTitle(pb.title); setDescription(pb.description || ""); },
    onDelete: () => setDeleteTarget(pb.id),
  });

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
        tone="dark"
        showOnMobile
        title="Script Playbooks"
        subtitle="Create curated collections of scripts for different scenarios"
        headerTabs={<ScriptsHubHeaderTabs />}
      />

      <div className="px-3 md:px-6 lg:px-8 max-w-6xl mx-auto pb-20">

        {/* Top bar: Search + New Playbook */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {playbooks.length > 0 && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search playbooks by title, description, or creator..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          )}
          {user && (
            <Button onClick={() => { setTitle(""); setDescription(""); setCreateOpen(true); }} className="gap-2 shrink-0">
              <Plus className="h-4 w-4" /> New Playbook
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="mine" className="gap-1.5">
              My Playbooks
              {myPlaybooks.length > 0 && (
                <span className="text-xs bg-muted rounded-full px-1.5 py-0.5 font-medium leading-none">{myPlaybooks.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="favourites" className="gap-1.5">
              <Star className="h-3.5 w-3.5" />
              Favourites
              {favourites.length > 0 && (
                <span className="text-xs bg-muted rounded-full px-1.5 py-0.5 font-medium leading-none">{favourites.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="others" className="gap-1.5">
              Discover
              {othersPlaybooks.length > 0 && (
                <span className="text-xs bg-muted rounded-full px-1.5 py-0.5 font-medium leading-none">{othersPlaybooks.length}</span>
              )}
            </TabsTrigger>
            {hiddenPlaybooks.length > 0 && (
              <TabsTrigger value="hidden" className="gap-1.5 text-muted-foreground">
                <EyeOff className="h-3.5 w-3.5" />
                Hidden ({hiddenPlaybooks.length})
              </TabsTrigger>
            )}
          </TabsList>

          {/* My Playbooks */}
          <TabsContent value="mine">
            {myPlaybooks.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                message="You haven't created any playbooks yet. Playbooks let you group scripts and objection handlers into curated collections for different scenarios."
                cta={
                  <Button onClick={() => { setTitle(""); setDescription(""); setCreateOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" /> Create Your First Playbook
                  </Button>
                }
              />
            ) : filteredMine.length === 0 ? (
              <EmptyState icon={Search} message={`No playbooks matching "${search}"`} />
            ) : (
              <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredMine.map(pb => <PlaybookCard key={pb.id} {...cardProps(pb)} />)}
              </div>
            )}
          </TabsContent>

          {/* Favourites */}
          <TabsContent value="favourites">
            {favourites.length === 0 ? (
              <EmptyState icon={Star} message="No favourites yet — star a playbook from the menu on any card to add it here." />
            ) : filteredFavourites.length === 0 ? (
              <EmptyState icon={Search} message={`No favourites matching "${search}"`} />
            ) : (
              <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredFavourites.map(pb => <PlaybookCard key={pb.id} {...cardProps(pb)} />)}
              </div>
            )}
          </TabsContent>

          {/* Discover (others) */}
          <TabsContent value="others">
            <p className="text-xs text-muted-foreground mb-4">Playbooks created by other team members. Use the <strong>...</strong> menu to favourite or hide any of these.</p>
            {othersPlaybooks.length === 0 ? (
              <EmptyState message="No playbooks from others to show — you may have hidden them all." />
            ) : filteredOthers.length === 0 ? (
              <EmptyState icon={Search} message={`No playbooks matching "${search}"`} />
            ) : (
              <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredOthers.map(pb => <PlaybookCard key={pb.id} {...cardProps(pb)} />)}
              </div>
            )}
          </TabsContent>

          {/* Hidden */}
          <TabsContent value="hidden">
            <p className="text-xs text-muted-foreground mb-4">These playbooks are hidden from your other tabs. Use the <strong>...</strong> menu to unhide them.</p>
            {filteredHidden.length === 0 && search ? (
              <EmptyState icon={Search} message={`No hidden playbooks matching "${search}"`} />
            ) : (
              <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {filteredHidden.map(pb => <PlaybookCard key={pb.id} {...cardProps(pb)} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Playbook</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="e.g. First Meeting Scripts, Objection Handling for HNW" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
              <Textarea placeholder="What is this playbook for?" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!title.trim() || createPlaybook.isPending}>
              {createPlaybook.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editPlaybook} onOpenChange={() => setEditPlaybook(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Playbook</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title</label>
              <Input placeholder="Playbook title" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
              <Textarea placeholder="What is this playbook for?" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
            </div>
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
            <AlertDialogDescription>This will permanently delete this playbook and all its script selections. This action cannot be undone.</AlertDialogDescription>
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
