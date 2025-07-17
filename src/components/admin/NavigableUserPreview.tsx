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

// Define the actual app structure with pages and their sections
const APP_STRUCTURE = {
  dashboard: {
    name: "Dashboard",
    icon: Home,
    path: "/",
    sections: [
      { id: "user-stats", name: "User Stats", description: "XP, level, streak, achievements" },
      { id: "search-section", name: "Search Section", description: "Main search interface" },
      { id: "quick-actions", name: "Quick Actions", description: "Profile search and shortcuts" },
      { id: "product-categories", name: "Product Categories", description: "Category grid" },
      { id: "recently-viewed", name: "Recently Viewed", description: "Recent activity" },
      { id: "recommendations", name: "Recommendations", description: "AI-powered suggestions" }
    ]
  },
  search: {
    name: "Search",
    icon: Search,
    path: "/search",
    sections: [
      { id: "search-interface", name: "Search Interface", description: "Advanced search with filters" },
      { id: "search-results", name: "Search Results", description: "Product and content results" },
      { id: "search-history", name: "Search History", description: "Previous searches" }
    ]
  },
  bookmarks: {
    name: "Bookmarks",
    icon: Bookmark,
    path: "/bookmarks",
    sections: [
      { id: "bookmarks-list", name: "Bookmarks List", description: "Saved products and content" },
      { id: "bookmark-categories", name: "Bookmark Categories", description: "Organized bookmark groups" }
    ]
  },
  "cmfas-exams": {
    name: "CMFAS Exams",
    icon: GraduationCap,
    path: "/cmfas-exams",
    sections: [
      { id: "exam-modules", name: "Exam Modules", description: "Available CMFAS modules" },
      { id: "practice-tests", name: "Practice Tests", description: "Mock exams and quizzes" },
      { id: "study-materials", name: "Study Materials", description: "PDFs, videos, flashcards" },
      { id: "progress-tracking", name: "Progress Tracking", description: "Study progress and analytics" }
    ]
  },
  "sales-tools": {
    name: "Sales Tools",
    icon: TrendingUp,
    path: "/sales-tools",
    sections: [
      { id: "presentation-tools", name: "Presentation Tools", description: "Sales presentations and calculators" },
      { id: "client-profiling", name: "Client Profiling", description: "Customer analysis tools" },
      { id: "proposal-generators", name: "Proposal Generators", description: "Automated proposal creation" }
    ]
  },
  "my-account": {
    name: "My Account",
    icon: User,
    path: "/my-account",
    sections: [
      { id: "profile-settings", name: "Profile Settings", description: "Personal information and preferences" },
      { id: "learning-analytics", name: "Learning Analytics", description: "Progress and performance insights" },
      { id: "achievements", name: "Achievements", description: "Badges and accomplishments" },
      { id: "account-security", name: "Account Security", description: "Password and security settings" }
    ]
  },
  "admin-panel": {
    name: "Admin Panel",
    icon: Shield,
    path: "/admin",
    sections: [
      { id: "user-management", name: "User Management", description: "Manage users and roles" },
      { id: "content-management", name: "Content Management", description: "Edit products and content" },
      { id: "analytics-dashboard", name: "Analytics Dashboard", description: "Platform usage analytics" },
      { id: "system-settings", name: "System Settings", description: "Global configuration" }
    ]
  },
  "product-categories": {
    name: "Product Categories",
    icon: Archive,
    path: "/category/*",
    sections: [
      { id: "category-overview", name: "Category Overview", description: "Category description and stats" },
      { id: "product-filters", name: "Product Filters", description: "Search and tag filters" },
      { id: "product-grid", name: "Product Grid", description: "List of products in category" }
    ]
  },
  "product-detail": {
    name: "Product Detail",
    icon: BookOpen,
    path: "/product/*",
    sections: [
      { id: "product-summary", name: "Product Summary", description: "Basic product information" },
      { id: "key-highlights", name: "Key Highlights", description: "Important features and benefits" },
      { id: "training-videos", name: "Training Videos", description: "Educational content" },
      { id: "useful-links", name: "Useful Links", description: "PDFs, brochures, external links" },
      { id: "ai-assistant", name: "AI Assistant", description: "Custom GPT integration" },
      { id: "personal-notes", name: "Personal Notes", description: "User's private notes" },
      { id: "quiz-section", name: "Quiz Section", description: "Knowledge assessment" }
    ]
  }
};

export function NavigableUserPreview({ 
  selectedUser, 
  sections, 
  permissions, 
  onPermissionUpdate 
}: NavigableUserPreviewProps) {
  const { toast } = useToast();
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
    try {
      if (permissionType === 'view') {
        // Remove permission (default to view)
        const { error } = await supabase
          .from('user_section_permissions')
          .delete()
          .eq('user_id', selectedUser.id)
          .eq('section_id', sectionId);

        if (error) throw error;
      } else {
        // Upsert permission
        const { error } = await supabase
          .from('user_section_permissions')
          .upsert({
            user_id: selectedUser.id,
            section_id: sectionId,
            permission_type: permissionType,
            lock_message: lockMsg || null
          }, { onConflict: 'user_id,section_id' });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Section permission updated successfully",
      });

      onPermissionUpdate();
    } catch (error) {
      console.error('Error updating section permission:', error);
      toast({
        title: "Error",
        description: "Failed to update section permission",
        variant: "destructive",
      });
    }
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
    const pageData = APP_STRUCTURE[pageKey as keyof typeof APP_STRUCTURE];
    if (!pageData) return true;

    // Check if at least one section in the page is accessible
    return pageData.sections.some(section => {
      const permissionType = getSectionPermissionType(section.id);
      return permissionType !== 'hidden';
    });
  };

  const getPagePermissionSummary = (pageKey: string): string => {
    const pageData = APP_STRUCTURE[pageKey as keyof typeof APP_STRUCTURE];
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
              className="text-xs h-12"
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
            <TabsList className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 w-full">
              {Object.entries(APP_STRUCTURE).map(([key, page]) => {
                const isAccessible = isPageAccessible(key);
                const permissionSummary = getPagePermissionSummary(key);
                const PageIcon = page.icon;
                
                return (
                  <TabsTrigger 
                    key={key} 
                    value={key}
                    className={`flex flex-col gap-1 h-auto py-2 text-xs ${!isAccessible ? 'opacity-50' : ''}`}
                    disabled={!isAccessible}
                  >
                    <PageIcon className="h-4 w-4" />
                    <span className="truncate max-w-16">{page.name}</span>
                    {permissionSummary && (
                      <span className="text-[10px] text-muted-foreground truncate max-w-20">
                        {permissionSummary}
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Page Content */}
            {Object.entries(APP_STRUCTURE).map(([key, page]) => (
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
    </div>
  );
}