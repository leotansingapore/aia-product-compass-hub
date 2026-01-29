import { useState, memo, useMemo } from "react";
import { 
  Home, 
  BookOpen, 
  Search, 
  Bookmark, 
  Settings, 
  HelpCircle, 
  TrendingUp,
  Users,
  ChevronDown,
  Archive,
  GraduationCap,
  Shield,
  User,
  MessageCircle
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
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useCategories } from "@/hooks/useProducts";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/usePermissions";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";

const allResourceItems = [
  { title: "How to Use Portal", url: "/how-to-use", icon: HelpCircle, sectionId: "how-to-use" },
  { title: "Search by Client Profile", url: "/search-by-profile", icon: Users, sectionId: "search-by-profile" },
  { title: "Sales Tools & Objection Handling", url: "/product/sales-tools-objections", icon: TrendingUp, sectionId: "sales-tools" },
];

const AppSidebar = memo(function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { isMasterAdmin, canAccessSection, isAdmin, hasRole } = usePermissions();
  const { user } = useSimplifiedAuth();

  // Don't render sidebar for unauthenticated users
  if (!user) {
    return null;
  }

  // Memoize navigation items to prevent recalculation on every render
  const allMainNavItems = useMemo(() => [
    { title: "Dashboard", url: "/", icon: Home, dataAttr: undefined, sectionId: "dashboard" },
    { title: "Bookmarks", url: "/bookmarks", icon: Bookmark, dataAttr: "bookmarks", sectionId: "bookmarks" },
    { title: "CMFAS Exams", url: "/cmfas-exams", icon: GraduationCap, dataAttr: undefined, sectionId: "cmfas-exams" },
    { title: "Roleplay Training", url: "/roleplay", icon: MessageCircle, dataAttr: undefined, sectionId: "roleplay" },
    { title: "My Account", url: "/my-account", icon: User, dataAttr: undefined, sectionId: "my-account" },
    ...(isMasterAdmin() || hasRole('admin') ? [{ title: "Admin Panel", url: "/admin", icon: Shield, dataAttr: undefined, sectionId: "admin-panel" }] : []),
  ], [isMasterAdmin, hasRole]);

  // Filter navigation items based on user permissions - memoized
  const mainNavItems = useMemo(() => 
    allMainNavItems.filter(item => canAccessSection(item.sectionId)), 
    [allMainNavItems, canAccessSection]
  );
  
  const resourceItems = useMemo(() => 
    allResourceItems.filter(item => canAccessSection(item.sectionId)), 
    [canAccessSection]
  );
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  
  const isCollapsed = state === "collapsed";
  const currentPath = location.pathname;

  // Memoize helper functions to prevent recreating on every render
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

  return (
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
                        // Clear search params when clicking Dashboard
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
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <span>Product Categories</span>
                {!isCollapsed && (
                  <ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
                )}
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {categories
                    .filter((category) => {
                      // Check if this category is accessible to the current user
                      const sectionId = `product-category-${category.id}`;
                      return canAccessSection(sectionId);
                    })
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
                        </SidebarMenuItem>
                      );
                    })}
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
            {/* Theme Toggle */}
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
  );
});

export { AppSidebar };
