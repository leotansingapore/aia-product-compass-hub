import { useState } from "react";
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
import { NavLink, useLocation } from "react-router-dom";
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
import { useAuth } from "@/hooks/useAuth";

const allResourceItems = [
  { title: "How to Use Portal", url: "/how-to-use", icon: HelpCircle, sectionId: "how-to-use" },
  { title: "Search by Client Profile", url: "/search-by-profile", icon: Users, sectionId: "search-by-profile" },
  { title: "Sales Tools & Objection Handling", url: "/product/sales-tools-objections", icon: TrendingUp, sectionId: "sales-tools" },
];

export function AppSidebar() {
  console.log("AppSidebar rendering");
  const { state } = useSidebar();
  const location = useLocation();
  const { categories } = useCategories();
  const { isMasterAdmin, canAccessSection, getUserTier } = usePermissions();
  const { user } = useAuth();
  
  const userTier = getUserTier();

  // Don't render sidebar for unauthenticated users
  if (!user) {
    return null;
  }

  const allMainNavItems = [
    { title: "Dashboard", url: "/", icon: Home, dataAttr: undefined, sectionId: "dashboard" },
    { title: "Search", url: "/search", icon: Search, dataAttr: undefined, sectionId: "search" },
    { title: "Bookmarks", url: "/bookmarks", icon: Bookmark, dataAttr: "bookmarks", sectionId: "bookmarks" },
    { title: "CMFAS Exams", url: "/cmfas-exams", icon: GraduationCap, dataAttr: undefined, sectionId: "cmfas-exams" },
    { title: "Roleplay Training", url: "/roleplay", icon: MessageCircle, dataAttr: undefined, sectionId: "roleplay" },
    { title: "My Account", url: "/my-account", icon: User, dataAttr: undefined, sectionId: "my-account" },
    ...(isMasterAdmin() ? [{ title: "Admin Panel", url: "/admin", icon: Shield, dataAttr: undefined, sectionId: "admin-panel" }] : []),
  ];

  // Filter navigation items based on user permissions
  const mainNavItems = allMainNavItems.filter(item => canAccessSection(item.sectionId));
  const resourceItems = allResourceItems.filter(item => canAccessSection(item.sectionId));
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  
  const isCollapsed = state === "collapsed";
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    const isCurrentlyActive = isActive(path);
    return `flex items-center w-full text-left transition-colors ${
      isCurrentlyActive 
        ? "bg-primary text-primary-foreground font-medium" 
        : "hover:bg-accent hover:text-accent-foreground"
    }`;
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-sm">AIA Learning</h2>
              <p className="text-xs text-muted-foreground">Knowledge Portal</p>
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
                                  ? "bg-primary text-primary-foreground font-medium" 
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
          <div className="space-y-2">
            {userTier && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {userTier === 'master_admin' ? 'Master Admin' : 
                   userTier === 'tier_4' ? 'Tier 4' :
                   userTier === 'tier_3' ? 'Tier 3' :
                   userTier === 'tier_2' ? 'Tier 2' :
                   userTier === 'tier_1' ? 'Tier 1' : 'Standard'}
                </Badge>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              <p>© 2024 AIA Learning Platform</p>
              <p>Version 2.0</p>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}