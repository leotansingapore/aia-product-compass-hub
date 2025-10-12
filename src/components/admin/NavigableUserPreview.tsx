import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Home,
  BookOpen,
  Search,
  Bookmark,
  Settings,
  HelpCircle,
  TrendingUp,
  Users,
  Archive,
  GraduationCap,
  Shield,
  User,
  Monitor,
  Edit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useProducts';
import { APP_STRUCTURE } from '@/hooks/useAppSectionSync';

interface User {
  id: string;
  email?: string;
  roles?: string[];
}

interface Section {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface UserPermission {
  user_id: string;
  section_id: string;
  permission_type: string;
  lock_message?: string;
}

interface NavigableUserPreviewProps {
  selectedUser: User | null;
  sections: Section[];
  permissions: UserPermission[];
  onPermissionUpdate: () => void;
}

// Define the actual app structure with pages and their sections and icons
const APP_STRUCTURE_WITH_ICONS = {
  dashboard: {
    name: "Dashboard",
    icon: Home,
    path: "/",
    sections: APP_STRUCTURE.dashboard.sections
  },
  search: {
    name: "Search",
    icon: Search,
    path: "/search",
    sections: APP_STRUCTURE.search.sections
  },
  bookmarks: {
    name: "Bookmarks",
    icon: Bookmark,
    path: "/bookmarks",
    sections: APP_STRUCTURE.bookmarks.sections
  },
  "cmfas-exams": {
    name: "CMFAS Exams",
    icon: GraduationCap,
    path: "/cmfas-exams",
    sections: APP_STRUCTURE["cmfas-exams"].sections
  },
  "my-account": {
    name: "My Account",
    icon: User,
    path: "/my-account",
    sections: APP_STRUCTURE["my-account"].sections
  },
  "admin-panel": {
    name: "Admin Panel",
    icon: Shield,
    path: "/admin",
    sections: APP_STRUCTURE["admin-panel"].sections
  },
  "search-by-profile": {
    name: "Search by Client Profile",
    icon: Users,
    path: "/search-by-profile",
    sections: APP_STRUCTURE["search-by-profile"].sections
  },
  "product-categories": {
    name: "Product Categories",
    icon: Archive,
    path: "/category/*",
    sections: APP_STRUCTURE["product-categories"].sections
  },
  "product-detail": {
    name: "Product Detail",
    icon: BookOpen,
    path: "/product/*",
    sections: APP_STRUCTURE["product-detail"].sections
  }
};

export function NavigableUserPreview({ 
  selectedUser, 
  sections, 
  permissions, 
  onPermissionUpdate 
}: NavigableUserPreviewProps) {
  const { toast } = useToast();
  const { categories } = useCategories();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  if (!selectedUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            User Interface Preview
          </CardTitle>
          <CardDescription>
            Select a user above to preview their navigable interface and manage section permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No user selected</p>
        </CardContent>
      </Card>
    );
  }

  const getUserPermissionForSection = (sectionId: string): UserPermission | null => {
    return permissions.find(p => p.user_id === selectedUser.id && p.section_id === sectionId) || null;
  };

  const getSectionPermissionType = (sectionId: string): string => {
    const permission = getUserPermissionForSection(sectionId);
    return permission?.permission_type || 'view';
  };

  const updateSectionPermission = async (sectionId: string, permissionType: string, lockMsg?: string) => {
    // Section permissions are now handled by tier system
    console.log('Section permissions updated via tier system');
    
    toast({
      title: "Info",
      description: "Permissions are now managed through the tier system",
    });
  };

  const getPermissionIcon = (permissionType: string) => {
    switch (permissionType) {
      case 'hidden': return <EyeOff className="h-4 w-4" />;
      case 'locked': return <Lock className="h-4 w-4" />;
      case 'read_only': return <Eye className="h-4 w-4" />;
      case 'edit': return <Edit className="h-4 w-4" />;
      default: return <Unlock className="h-4 w-4" />;
    }
  };

  const getPermissionColor = (permissionType: string) => {
    switch (permissionType) {
      case 'hidden': return 'destructive';
      case 'locked': return 'secondary';
      case 'read_only': return 'outline';
      case 'edit': return 'default';
      default: return 'default';
    }
  };

  const isPageAccessible = (pageKey: string): boolean => {
    const pageData = APP_STRUCTURE_WITH_ICONS[pageKey as keyof typeof APP_STRUCTURE_WITH_ICONS];
    if (!pageData) return true;

    // Check if at least one section in the page is accessible
    return pageData.sections.some(section => {
      const permissionType = getSectionPermissionType(section.id);
      return permissionType !== 'hidden';
    });
  };

  const getPagePermissionSummary = (pageKey: string): string => {
    const pageData = APP_STRUCTURE_WITH_ICONS[pageKey as keyof typeof APP_STRUCTURE_WITH_ICONS];
    if (!pageData) return '';

    const sectionCount = pageData.sections.length;
    const hiddenCount = pageData.sections.filter(section => 
      getSectionPermissionType(section.id) === 'hidden'
    ).length;
    const lockedCount = pageData.sections.filter(section => 
      getSectionPermissionType(section.id) === 'locked'
    ).length;

    if (hiddenCount === sectionCount) return 'All sections hidden';
    if (hiddenCount > 0) return `${hiddenCount}/${sectionCount} hidden`;
    if (lockedCount > 0) return `${lockedCount} locked`;
    return 'Full access';
  };

  const renderSectionControls = (section: any, pageKey: string) => {
    const permissionType = getSectionPermissionType(section.id);
    const permission = getUserPermissionForSection(section.id);
    const isHidden = permissionType === 'hidden';
    const isLocked = permissionType === 'locked';

    return (
      <div key={section.id} className={`border rounded-lg p-4 space-y-3 ${isHidden ? 'opacity-50 bg-muted/20' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h5 className="font-medium">{section.name}</h5>
              <p className="text-sm text-muted-foreground">{section.description}</p>
            </div>
            <Badge variant={getPermissionColor(permissionType)} className="flex items-center gap-1">
              {getPermissionIcon(permissionType)}
              {permissionType}
            </Badge>
          </div>
          
          <select
            value={permissionType}
            onChange={(e) => updateSectionPermission(section.id, e.target.value)}
            className="text-sm border rounded px-2 py-1 min-w-24"
          >
            <option value="view">Full</option>
            <option value="read_only">Read Only</option>
            <option value="locked">Locked</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        {/* Show different states */}
        {isHidden && (
          <div className="bg-destructive/10 border border-destructive/20 rounded p-2">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <EyeOff className="h-3 w-3" />
              <span className="font-medium">Hidden from user</span>
            </div>
          </div>
        )}

        {isLocked && (
          <div className="bg-secondary/50 border border-secondary rounded p-2 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Lock className="h-3 w-3" />
              <span className="font-medium">Section Locked</span>
            </div>
            <Textarea
              value={permission?.lock_message || ''}
              onChange={(e) => updateSectionPermission(section.id, 'locked', e.target.value)}
              placeholder="Enter custom lock message..."
              className="text-micro h-12"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Navigable Interface Preview - {selectedUser.email}
          </CardTitle>
          <CardDescription>
            Navigate through the app as this user would see it. Toggle sections on/off to control their experience.
          </CardDescription>
          <div className="flex gap-2">
            {selectedUser.roles?.map(role => (
              <Badge key={role} variant="outline">{role}</Badge>
            )) || <Badge variant="outline">user</Badge>}
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Tabs mimicking the real app */}
      <Card>
        <CardHeader>
          <CardTitle>App Navigation</CardTitle>
          <CardDescription>
            This shows the main navigation as the user sees it. Grayed out pages have restricted sections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 2xl:grid-cols-10 w-full h-auto p-2">
            {Object.entries(APP_STRUCTURE_WITH_ICONS).map(([key, page]) => {
              const isAccessible = isPageAccessible(key);
              const permissionSummary = getPagePermissionSummary(key);
              const PageIcon = page.icon;
              
              return (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className={`flex flex-col gap-1 h-auto py-3 px-2 text-micro min-w-0 ${!isAccessible ? 'opacity-50' : ''}`}
                  // Remove disabled prop so admins can always access tabs to change permissions
                >
                  <PageIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-center leading-tight whitespace-normal break-words">{page.name}</span>
                  {permissionSummary && (
                    <span className="text-[10px] text-muted-foreground text-center leading-tight whitespace-normal break-words">
                      {permissionSummary}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

            {/* Page Content */}
            {Object.entries(APP_STRUCTURE_WITH_ICONS).map(([key, page]) => (
              <TabsContent key={key} value={key} className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <page.icon className="h-5 w-5" />
                      {page.name}
                    </CardTitle>
                    <CardDescription>
                      Page: {page.path} • Sections: {page.sections.length}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {page.sections.map(section => renderSectionControls(section, key))}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Product Categories Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Product Categories
          </CardTitle>
          <CardDescription>
            These are the subcategories users see under "Products" in the sidebar navigation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {categories.map(category => {
              const categoryPermissionType = getSectionPermissionType(`product-category-${category.id}`);
              const categoryPermission = getUserPermissionForSection(`product-category-${category.id}`);
              const isHidden = categoryPermissionType === 'hidden';
              const isLocked = categoryPermissionType === 'locked';

              return (
                <div key={category.id} className={`border rounded-lg p-4 space-y-3 ${isHidden ? 'opacity-50 bg-muted/20' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Archive className="h-4 w-4" />
                      <div>
                        <h5 className="font-medium">{category.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          Category: {category.description || 'Product category navigation'}
                        </p>
                        <p className="text-micro text-muted-foreground">
                          Path: /category/{category.id}
                        </p>
                      </div>
                      <Badge variant={getPermissionColor(categoryPermissionType)} className="flex items-center gap-1">
                        {getPermissionIcon(categoryPermissionType)}
                        {categoryPermissionType}
                      </Badge>
                    </div>
                    
                    <select
                      value={categoryPermissionType}
                      onChange={(e) => updateSectionPermission(`product-category-${category.id}`, e.target.value)}
                      className="text-sm border rounded px-2 py-1 min-w-24"
                    >
                      <option value="view">Full</option>
                      <option value="read_only">Read Only</option>
                      <option value="locked">Locked</option>
                      <option value="hidden">Hidden</option>
                    </select>
                  </div>

                  {/* Show different states */}
                  {isHidden && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded p-2">
                      <div className="flex items-center gap-2 text-destructive text-sm">
                        <EyeOff className="h-3 w-3" />
                        <span className="font-medium">Category hidden from user - won't appear in sidebar</span>
                      </div>
                    </div>
                  )}

                  {isLocked && (
                    <div className="bg-secondary/50 border border-secondary rounded p-2 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Lock className="h-3 w-3" />
                        <span className="font-medium">Category Locked</span>
                      </div>
                      <Textarea
                        value={categoryPermission?.lock_message || ''}
                        onChange={(e) => updateSectionPermission(`product-category-${category.id}`, 'locked', e.target.value)}
                        placeholder="Enter custom lock message for this category..."
                        className="text-micro h-12"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}