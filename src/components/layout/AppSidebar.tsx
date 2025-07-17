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
  User
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

const resourceItems = [
  { title: "How to Use Portal", url: "/how-to-use", icon: HelpCircle },
  { title: "Search by Client Profile", url: "/search-by-profile", icon: Users },
];

export function AppSidebar() {
  console.log("AppSidebar rendering");
  const { state } = useSidebar();
  const location = useLocation();
  const { categories } = useCategories();
  const { isMasterAdmin } = usePermissions();

  const mainNavItems = [
    { title: "Dashboard", url: "/", icon: Home, dataAttr: undefined },
    { title: "Search", url: "/search", icon: Search, dataAttr: undefined },
    { title: "Bookmarks", url: "/bookmarks", icon: Bookmark, dataAttr: "bookmarks" },
    { title: "CMFAS Exams", url: "/cmfas-exams", icon: GraduationCap, dataAttr: undefined },
    { title: "Sales Tools", url: "/sales-tools", icon: TrendingUp, dataAttr: undefined },
    { title: "My Account", url: "/my-account", icon: User, dataAttr: undefined },
    ...(isMasterAdmin() ? [{ title: "Admin Panel", url: "/admin", icon: Shield, dataAttr: undefined }] : []),
  ];
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
                  {categories.map((category) => {
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
          <div className="text-xs text-muted-foreground">
            <p>© 2024 AIA Learning Platform</p>
            <p>Version 2.0</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}