import { useState, memo, useMemo, useCallback } from "react";
import { 
  Home, 
  BookOpen, 
  Bookmark, 
  HelpCircle, 
  TrendingUp,
  FileText,
  GitBranch,
  Users,
  ChevronDown,
  Archive,
  Plus,
  GraduationCap,
  Shield,
  User,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertTriangle,
  Loader2,
  Eye,
  Globe,
  ArchiveRestore,
  LogOut,
  Sparkles,
  Brain,
  Target,
  Headset,
  Trophy,
  
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useCategories, invalidateCategoriesCache, useProducts } from "@/hooks/useProducts";
import { useQueryClient } from "@tanstack/react-query";
import {
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { usePermissions } from "@/hooks/usePermissions";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { featuresForNavSection } from "@/lib/nav-features";
import { useLearningTrackOverallProgress } from "@/hooks/learning-track/useLearningTrackOverallProgress";

function LtBadge() {
  const { user } = useSimplifiedAuth();
  const { data } = useLearningTrackOverallProgress(user?.id);
  const pct = data?.combinedPct ?? 0;
  if (pct === 0 || pct === 100) return null;
  return <span className="ml-auto text-xs text-muted-foreground">{pct}%</span>;
}
import { useAdmin } from "@/hooks/useAdmin";
import { useViewMode } from "@/components/admin/AdminViewSwitcher";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";


const allResourceItems = [
  { title: "Changelog", url: "/changelog", icon: Sparkles, sectionId: "changelog" },
];

/** Sub-component that fetches and renders products for a single category */
const CategoryProductsSub = memo(function CategoryProductsSub({ categoryId, isCollapsed }: { categoryId: string; isCollapsed: boolean }) {
  const { products, loading } = useProducts(categoryId);
  const location = useLocation();

  if (isCollapsed || loading || products.length === 0) return null;

  return (
    <SidebarMenuSub>
      {products
        .filter(p => p.published !== false)
        .map(product => {
          const isActiveProduct = location.pathname.includes(`/product/${product.id}`);
          return (
            <SidebarMenuSubItem key={product.id}>
              <SidebarMenuSubButton asChild isActive={isActiveProduct}>
                <NavLink to={`/product/${product.id}`}>
                  <span className="truncate">{product.title}</span>
                </NavLink>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          );
        })}
    </SidebarMenuSub>
  );
});

const AppSidebar = memo(function AppSidebar({ onProfileClick }: { onProfileClick?: () => void }) {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { categories, refetch: refetchCategories } = useCategories();
  const { isMasterAdmin, canAccessSection, isAdmin, hasRole } = usePermissions();
  const { user, signOut } = useSimplifiedAuth();
  const { isAdmin: isAdminUser } = useAdmin();
  const { isViewingAsUser } = useViewMode();
  const { canAny, isAdminBypass } = useFeatureAccess();

  // Nav-section-level tier gate. Returns true if the section has no tier
  // requirement OR the user's tier unlocks any of the required features.
  // Admins always pass.
  const sectionVisibleForTier = useCallback((sectionId: string | undefined) => {
    if (isAdminBypass) return true;
    const required = featuresForNavSection(sectionId);
    if (!required) return true;
    return canAny(required);
  }, [canAny, isAdminBypass]);

  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [deletingCategory, setDeletingCategory] = useState<{ id: string; name: string } | null>(null);
  const [deleteCategoryProductCount, setDeleteCategoryProductCount] = useState<number | null>(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryCreateName, setNewCategoryCreateName] = useState("");
  const [newCategoryCreateDescription, setNewCategoryCreateDescription] = useState("");
  const [newCategoryPublishImmediately, setNewCategoryPublishImmediately] = useState(false);
  
  const queryClient = useQueryClient();

  const allMainNavItems = useMemo(() => [
    { title: "Home", url: "/", icon: Home, dataAttr: undefined, sectionId: "home" },
    { title: "Learning Track", url: "/learning-track", icon: TrendingUp, dataAttr: undefined, sectionId: "learning-track" },
    { title: "Leaderboard", url: "/leaderboard", icon: Trophy, dataAttr: undefined, sectionId: "leaderboard" },
    { title: "Library", url: "/library", icon: BookOpen, dataAttr: undefined, sectionId: "library" },
    { title: "Bookmarks", url: "/bookmarks", icon: Bookmark, dataAttr: "bookmarks", sectionId: "bookmarks" },
    { title: "CMFAS Exams", url: "/cmfas-exams", icon: GraduationCap, dataAttr: undefined, sectionId: "cmfas-exams" },
    { title: "Roleplay Training", url: "/roleplay", icon: MessageCircle, dataAttr: undefined, sectionId: "roleplay" },
    ...(isAdminUser ? [{ title: "Admin Panel", url: "/admin", icon: Shield, dataAttr: undefined, sectionId: "admin-panel" }] : []),
  ], [isMasterAdmin, hasRole]);

  const mainNavItems = useMemo(() =>
    allMainNavItems.filter(item =>
      canAccessSection(item.sectionId) && sectionVisibleForTier(item.sectionId)
    ),
    [allMainNavItems, canAccessSection, sectionVisibleForTier]
  );

  const resourceItems = useMemo(() =>
    allResourceItems.filter(item =>
      canAccessSection(item.sectionId) && sectionVisibleForTier(item.sectionId)
    ),
    [canAccessSection, sectionVisibleForTier]
  );

  const isCollapsed = state === "collapsed";
  const currentPath = location.pathname;

  const salesPlaybookRoutes = ['/scripts', '/servicing', '/objections', '/playbooks', '/flows', '/concept-cards'];
  const isActive = useMemo(() => (path: string) => {
    if (path === "/") return currentPath === "/";
    // "Sales Playbooks" link should be active on any sales sub-route
    if (path === "/scripts") return salesPlaybookRoutes.some(r => currentPath.startsWith(r));
    return currentPath.startsWith(path);
  }, [currentPath]);

  const getNavClassName = useMemo(() => (path: string) => {
    const isCurrentlyActive = isActive(path);
    return `flex items-center w-full text-left transition-colors ${
      isCurrentlyActive
        ? "bg-primary/10 text-primary font-semibold border-l-[3px] border-primary cursor-default hover:!bg-primary/10 hover:!text-primary"
        : "hover:bg-accent hover:text-accent-foreground"
    }`;
  }, [isActive]);

  const handleRenameCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) return;
    
    const { error } = await supabase
      .from('categories')
      .update({ name: newCategoryName.trim() })
      .eq('id', editingCategory.id);

    if (error) {
      toast({ title: "Error", description: "Failed to rename category", variant: "destructive" });
    } else {
      invalidateCategoriesCache();
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      await refetchCategories();
      toast({ title: "Success", description: "Category renamed successfully" });
    }
    setEditingCategory(null);
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    setDeletingInProgress(true);
    
    // First, delete all products in this category
    const { error: productsError } = await supabase
      .from('products')
      .delete()
      .eq('category_id', deletingCategory.id);

    if (productsError) {
      toast({ title: "Error", description: "Failed to remove products in this category", variant: "destructive" });
      setDeletingInProgress(false);
      setDeletingCategory(null);
      return;
    }

    // Also delete any files linked to this category
    await supabase
      .from('files')
      .delete()
      .eq('category_id', deletingCategory.id);

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', deletingCategory.id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
    } else {
      invalidateCategoriesCache();
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      await refetchCategories();
      toast({ title: "Success", description: "Category deleted successfully" });
      navigate("/");
    }
    setDeletingInProgress(false);
    setDeletingCategory(null);
    setDeleteCategoryProductCount(null);
    setDeleteConfirmName("");
  };

  const handleOpenDeleteDialog = async (category: { id: string; name: string }) => {
    setDeletingCategory(category);
    setDeleteCategoryProductCount(null);
    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', category.id);
    setDeleteCategoryProductCount(count ?? 0);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryCreateName.trim()) return;
    const { data, error } = await supabase
      .from('categories')
      .insert({ 
        name: newCategoryCreateName.trim(),
        description: newCategoryCreateDescription.trim() || null,
        published: newCategoryPublishImmediately
      })
      .select('id')
      .single();
    if (error) {
      toast({ title: "Error", description: "Failed to create category", variant: "destructive" });
    } else if (data) {
      // Invalidate cache and wait for refetch before navigating
      invalidateCategoriesCache();
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      await refetchCategories();
      toast({ title: "Success", description: "Category created successfully" });
      setCreatingCategory(false);
      setNewCategoryCreateName("");
      setNewCategoryCreateDescription("");
      setNewCategoryPublishImmediately(false);
      navigate(`/category/${data.id}`);
      return;
    }
    setCreatingCategory(false);
    setNewCategoryCreateName("");
    setNewCategoryCreateDescription("");
    setNewCategoryPublishImmediately(false);
  };

  if (!user) return null;

  return (
    <>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="border-b py-3 px-3 group-data-[collapsible=icon]:px-2">
          {isCollapsed ? (
            /* Collapsed state: just the expand button, no logo */
            <div className="flex items-center justify-center">
              <SidebarTrigger
                data-onboarding="sidebar-trigger"
                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors flex items-center justify-center"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              />
            </div>
          ) : (
            /* Expanded state: logo + title + collapse button */
            <div className="flex items-center gap-2">
              <NavLink to="/" className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-sm leading-tight truncate">FINternship</h2>
                  <p className="text-[10px] text-muted-foreground">Learning Platform</p>
                </div>
              </NavLink>
              <SidebarTrigger
                className="shrink-0 h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              />
            </div>
          )}
        </SidebarHeader>

        <SidebarContent>
          {/* Learning & Training */}
          <SidebarGroup>
            <SidebarGroupLabel>Your Journey</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                      <NavLink
                        to={item.url}
                        className={getNavClassName(item.url)}
                        {...(item.dataAttr && { 'data-onboarding': item.dataAttr })}
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                        {!isCollapsed && item.sectionId === "learning-track" && <LtBadge />}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Reference — products and sales tools */}
          {(sectionVisibleForTier('categories') || sectionVisibleForTier('sales-playbooks')) && (
            <SidebarGroup>
              <SidebarGroupLabel>Library</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sectionVisibleForTier('categories') && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip={isCollapsed ? "Product Categories" : undefined}>
                        <NavLink
                          to="/categories"
                          className={getNavClassName('/categories')}
                        >
                          <Archive className="h-4 w-4" />
                          {!isCollapsed && <span>Product Categories</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {sectionVisibleForTier('sales-playbooks') && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip={isCollapsed ? "Sales Playbooks" : undefined}>
                        <NavLink
                          to={(() => { try { return localStorage.getItem('sales-playbooks-last-route') || '/scripts'; } catch { return '/scripts'; } })()}
                          className={getNavClassName('/scripts')}
                        >
                          <TrendingUp className="h-4 w-4" />
                          {!isCollapsed && <span>Sales Playbooks</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <SidebarGroup>
            <SidebarGroupLabel>More</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {resourceItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                      <NavLink to={item.url} className={getNavClassName(item.url)}>
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t p-3">
          {!isCollapsed ? (
            <div className="space-y-1">
              {/* Profile row */}
              <div className="flex items-center gap-1 w-full">
                <button
                  onClick={() => onProfileClick ? onProfileClick() : navigate('/my-account')}
                  className="flex items-center gap-3 flex-1 min-w-0 rounded-lg px-2 py-2 hover:bg-muted transition-colors text-left group"
                  aria-label="My Profile"
                >
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                    <span className="text-xs font-bold text-primary-foreground">
                      {user?.email?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate text-foreground">{user?.email || "Account"}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {isMasterAdmin() ? 'Master Admin' : isAdmin() ? 'Admin' : 'My Account'}
                    </p>
                  </div>
                </button>
                <ThemeToggle />
              </div>
              {/* Sign Out — min tap target ~44px for sidebar footer */}
              <button
                type="button"
                onClick={signOut}
                className="flex min-h-11 items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => onProfileClick ? onProfileClick() : navigate('/my-account')}
                title="My Profile"
                className="h-8 w-8 rounded-full bg-primary flex items-center justify-center hover:opacity-80 transition-opacity ring-2 ring-primary/20"
                aria-label="My Profile"
              >
                <span className="text-xs font-bold text-primary-foreground">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </span>
              </button>
              <ThemeToggle />
              <button
                type="button"
                onClick={signOut}
                title="Sign out"
                className="min-h-11 min-w-11 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      

      {/* Rename Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name"
              maxLength={50}
              onKeyDown={(e) => e.key === 'Enter' && handleRenameCategory()}
            />
            <p className="text-xs text-right text-muted-foreground">{newCategoryName.length} / 50</p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="default" onClick={() => setEditingCategory(null)}>Cancel</Button>
            <Button size="default" onClick={handleRenameCategory} disabled={!newCategoryName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => { if (!open) { setDeletingCategory(null); setDeleteCategoryProductCount(null); setDeletingInProgress(false); setDeleteConfirmName(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deletingCategory?.name}"?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                {deleteCategoryProductCount === null ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Checking category contents…</span>
                  </div>
                ) : deleteCategoryProductCount > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span className="text-sm">
                        This category contains <strong>{deleteCategoryProductCount} product{deleteCategoryProductCount !== 1 ? 's' : ''}</strong> that will be permanently deleted along with all associated files.
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                    <div className="space-y-1.5">
                      <label htmlFor="delete-confirm-input" className="text-sm text-muted-foreground">
                        Type <strong className="text-foreground">{deletingCategory?.name}</strong> to confirm:
                      </label>
                      <input
                        id="delete-confirm-input"
                        type="text"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder={deletingCategory?.name}
                        value={deleteConfirmName}
                        onChange={(e) => setDeleteConfirmName(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">This category is empty. It will be permanently removed.</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingInProgress}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCategoryProductCount === null || deletingInProgress || (deleteCategoryProductCount > 0 && deleteConfirmName !== deletingCategory?.name)}
            >
              {deletingInProgress ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Deleting…</span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Category Dialog */}
      <Dialog open={creatingCategory} onOpenChange={(open) => { if (!open) { setCreatingCategory(false); setNewCategoryCreateName(""); setNewCategoryCreateDescription(""); setNewCategoryPublishImmediately(false); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <p className="text-sm text-muted-foreground">Add a new product category to organize your content.</p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-category-name">Name</Label>
              <Input
                id="new-category-name"
                value={newCategoryCreateName}
                onChange={(e) => setNewCategoryCreateName(e.target.value)}
                placeholder="e.g. Investment Products"
                maxLength={50}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    document.getElementById('new-category-description')?.focus();
                  }
                }}
              />
              <p className="text-xs text-right text-muted-foreground">{newCategoryCreateName.length} / 50</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-category-description">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                id="new-category-description"
                value={newCategoryCreateDescription}
                onChange={(e) => setNewCategoryCreateDescription(e.target.value)}
                placeholder="Briefly describe what products belong in this category..."
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-right text-muted-foreground">{newCategoryCreateDescription.length} / 200</p>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="publish-immediately" className="text-sm cursor-pointer">Publish immediately</Label>
              <Switch
                id="publish-immediately"
                checked={newCategoryPublishImmediately}
                onCheckedChange={setNewCategoryPublishImmediately}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="default" onClick={() => { setCreatingCategory(false); setNewCategoryCreateName(""); setNewCategoryCreateDescription(""); setNewCategoryPublishImmediately(false); }}>Cancel</Button>
            <Button size="default" onClick={handleCreateCategory} disabled={!newCategoryCreateName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

export { AppSidebar };
