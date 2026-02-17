import { useState, memo, useMemo, useCallback } from "react";
import { 
  Home, 
  BookOpen, 
  Bookmark, 
  HelpCircle, 
  TrendingUp,
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
  Loader2
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
import { useCategories, invalidateCategoriesCache } from "@/hooks/useProducts";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/usePermissions";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const allResourceItems = [
  { title: "How to Use Portal", url: "/how-to-use", icon: HelpCircle, sectionId: "how-to-use" },
  { title: "Search by Client Profile", url: "/search-by-profile", icon: Users, sectionId: "search-by-profile" },
  { title: "Sales Tools & Objection Handling", url: "/product/sales-tools-objections", icon: TrendingUp, sectionId: "sales-tools" },
];

const AppSidebar = memo(function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { categories, refetch: refetchCategories } = useCategories();
  const { isMasterAdmin, canAccessSection, isAdmin, hasRole } = usePermissions();
  const { user } = useSimplifiedAuth();
  const { isAdmin: isAdminUser } = useAdmin();

  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [deletingCategory, setDeletingCategory] = useState<{ id: string; name: string } | null>(null);
  const [deleteCategoryProductCount, setDeleteCategoryProductCount] = useState<number | null>(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryCreateName, setNewCategoryCreateName] = useState("");
  const [newCategoryCreateDescription, setNewCategoryCreateDescription] = useState("");
  const queryClient = useQueryClient();

  const allMainNavItems = useMemo(() => [
    { title: "Dashboard", url: "/", icon: Home, dataAttr: undefined, sectionId: "dashboard" },
    { title: "Bookmarks", url: "/bookmarks", icon: Bookmark, dataAttr: "bookmarks", sectionId: "bookmarks" },
    { title: "CMFAS Exams", url: "/cmfas-exams", icon: GraduationCap, dataAttr: undefined, sectionId: "cmfas-exams" },
    { title: "Roleplay Training", url: "/roleplay", icon: MessageCircle, dataAttr: undefined, sectionId: "roleplay" },
    { title: "My Account", url: "/my-account", icon: User, dataAttr: undefined, sectionId: "my-account" },
    ...(isMasterAdmin() || hasRole('admin') ? [{ title: "Admin Panel", url: "/admin", icon: Shield, dataAttr: undefined, sectionId: "admin-panel" }] : []),
  ], [isMasterAdmin, hasRole]);

  const mainNavItems = useMemo(() => 
    allMainNavItems.filter(item => canAccessSection(item.sectionId)), 
    [allMainNavItems, canAccessSection]
  );
  
  const resourceItems = useMemo(() => 
    allResourceItems.filter(item => canAccessSection(item.sectionId)), 
    [canAccessSection]
  );

  const isCollapsed = state === "collapsed";
  const currentPath = location.pathname;

  const isActive = useMemo(() => (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  }, [currentPath]);

  const getNavClassName = useMemo(() => (path: string) => {
    const isCurrentlyActive = isActive(path);
    return `flex items-center w-full text-left transition-colors ${
      isCurrentlyActive
        ? "bg-primary text-primary-foreground font-medium cursor-default hover:!bg-primary hover:!text-primary-foreground"
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
        description: newCategoryCreateDescription.trim() || null
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
      navigate(`/category/${data.id}`);
      return;
    }
    setCreatingCategory(false);
    setNewCategoryCreateName("");
    setNewCategoryCreateDescription("");
  };

  if (!user) return null;

  return (
    <>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="border-b py-3 px-4 group-data-[collapsible=icon]:px-2">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-semibold text-sm">FINternship Learning</h2>
                <p className="text-micro text-muted-foreground">Platform</p>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={isCollapsed ? item.title : undefined}>
                      <NavLink
                        to={item.url}
                        className={getNavClassName(item.url)}
                        onClick={(e) => {
                          if (item.url === "/") {
                            e.preventDefault();
                            navigate("/", { replace: true });
                          }
                        }}
                        {...(item.dataAttr && { 'data-onboarding': item.dataAttr })}
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Product Categories */}
          <SidebarGroup>
            <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="group/catHeader flex items-center justify-between w-full">
                  <span>Product Categories</span>
                  <div className="flex items-center gap-0.5">
                    {!isCollapsed && isAdminUser && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setCreatingCategory(true); }}
                        className="opacity-0 group-hover/catHeader:opacity-100 h-5 w-5 rounded hover:bg-muted flex items-center justify-center transition-all duration-300 ease-in-out"
                        aria-label="Create new category"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {!isCollapsed && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {categories
                      .filter((category) => canAccessSection(`product-category-${category.id}`))
                      .map((category) => {
                        const isActiveCategory = currentPath.includes(`/category/${category.id}`);
                        return (
                          <SidebarMenuItem key={category.id}>
                            <SidebarMenuButton asChild tooltip={isCollapsed ? category.name : undefined}>
                              <NavLink
                                to={`/category/${category.id}`}
                                className={`flex items-center w-full text-left transition-colors ${
                                  isActiveCategory
                                    ? "bg-primary text-primary-foreground font-medium cursor-default hover:!bg-primary hover:!text-primary-foreground"
                                    : "hover:bg-accent hover:text-accent-foreground"
                                }`}
                              >
                                <Archive className="h-4 w-4" />
                                {!isCollapsed && (
                                  <span className="truncate">{category.name}</span>
                                )}
                              </NavLink>
                            </SidebarMenuButton>
                            {isAdminUser && !isCollapsed && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <SidebarMenuAction showOnHover className="h-6 w-6 cursor-pointer hover:bg-muted rounded-md transition-colors">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </SidebarMenuAction>
                                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="start" className="shadow-sm bg-popover z-50">
                                  <DropdownMenuItem
                                    className="cursor-pointer focus:bg-muted focus:text-foreground"
                                    onClick={() => {
                                      setEditingCategory({ id: category.id, name: category.name });
                                      setNewCategoryName(category.name);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit Name
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive focus:bg-muted cursor-pointer"
                                    onClick={() => handleOpenDeleteDialog({ id: category.id, name: category.name })}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </SidebarMenuItem>
                        );
                      })}
                    {isAdminUser && !isCollapsed && (
                      <SidebarMenuItem>
                        <button
                          onClick={() => setCreatingCategory(true)}
                          className="flex items-center gap-2 w-full rounded-md px-2 h-8 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300 ease-in-out border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add New Category</span>
                        </button>
                      </SidebarMenuItem>
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>

          {/* Resources */}
          <SidebarGroup>
            <SidebarGroupLabel>Resources</SidebarGroupLabel>
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

        <SidebarFooter className="border-t p-4">
          {!isCollapsed && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              {isAdmin() && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-micro">
                    {isMasterAdmin() ? 'Master Admin' : 'Admin'}
                  </Badge>
                </div>
              )}
              <div className="text-micro text-muted-foreground">
                <p>© 2024 FINternship Learning Platform</p>
                <p>Version 2.0</p>
              </div>
            </div>
          )}
          {isCollapsed && <ThemeToggle />}
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
      <AlertDialog open={!!deletingCategory} onOpenChange={(open) => { if (!open) { setDeletingCategory(null); setDeleteCategoryProductCount(null); setDeletingInProgress(false); } }}>
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
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span className="text-sm">
                        This category contains <strong>{deleteCategoryProductCount} product{deleteCategoryProductCount !== 1 ? 's' : ''}</strong> that will be permanently deleted along with all associated files.
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
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
              disabled={deleteCategoryProductCount === null || deletingInProgress}
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
      <Dialog open={creatingCategory} onOpenChange={(open) => { if (!open) { setCreatingCategory(false); setNewCategoryCreateName(""); setNewCategoryCreateDescription(""); } }}>
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
          </div>
          <DialogFooter>
            <Button variant="outline" size="default" onClick={() => { setCreatingCategory(false); setNewCategoryCreateName(""); setNewCategoryCreateDescription(""); }}>Cancel</Button>
            <Button size="default" onClick={handleCreateCategory} disabled={!newCategoryCreateName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
});

export { AppSidebar };
