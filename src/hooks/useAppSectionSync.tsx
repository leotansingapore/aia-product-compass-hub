import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from './usePermissions';
import { useToast } from './use-toast';

// Import the APP_STRUCTURE - we'll extract this to a shared file
export const APP_STRUCTURE = {
  dashboard: {
    name: "Dashboard",
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
    path: "/search",
    sections: [
      { id: "search-interface", name: "Search Interface", description: "Advanced search with filters" },
      { id: "search-results", name: "Search Results", description: "Product and content results" },
      { id: "search-history", name: "Search History", description: "Previous searches" }
    ]
  },
  bookmarks: {
    name: "Bookmarks",
    path: "/bookmarks",
    sections: [
      { id: "bookmarks-list", name: "Bookmarks List", description: "Saved products and content" },
      { id: "bookmark-categories", name: "Bookmark Categories", description: "Organized bookmark groups" }
    ]
  },
  "cmfas-exams": {
    name: "CMFAS Exams",
    path: "/cmfas-exams",
    sections: [
      { id: "exam-modules", name: "Exam Modules", description: "Available CMFAS modules" },
      { id: "practice-tests", name: "Practice Tests", description: "Mock exams and quizzes" },
      { id: "study-materials", name: "Study Materials", description: "PDFs, videos, flashcards" },
      { id: "progress-tracking", name: "Progress Tracking", description: "Study progress and analytics" }
    ]
  },
  "my-account": {
    name: "My Account",
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
    path: "/admin",
    sections: [
      { id: "user-management", name: "User Management", description: "Manage users and roles" },
      { id: "content-management", name: "Content Management", description: "Edit products and content" },
      { id: "analytics-dashboard", name: "Analytics Dashboard", description: "Platform usage analytics" },
      { id: "system-settings", name: "System Settings", description: "Global configuration" }
    ]
  },
  "search-by-profile": {
    name: "Search by Client Profile",
    path: "/search-by-profile",
    sections: [
      { id: "client-profile-search", name: "Client Profile Search", description: "Search products by client demographics" },
      { id: "profile-filters", name: "Profile Filters", description: "Age, income, risk tolerance filters" },
      { id: "recommendation-engine", name: "Recommendation Engine", description: "AI-powered product suggestions" }
    ]
  },
  "product-categories": {
    name: "Product Categories",
    path: "/category/*",
    sections: [
      { id: "category-overview", name: "Category Overview", description: "Category description and stats" },
      { id: "product-filters", name: "Product Filters", description: "Search and tag filters" },
      { id: "product-grid", name: "Product Grid", description: "List of products in category" }
    ]
  },
  "product-detail": {
    name: "Product Detail",
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

export interface SyncResult {
  added: number;
  updated: number;
  removed: number;
  errors: string[];
}

export function useAppSectionSync() {
  const { isMasterAdmin } = usePermissions();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const extractSectionsFromStructure = useCallback(() => {
    const sections: Array<{
      id: string;
      name: string;
      description: string;
      category: string;
    }> = [];

    Object.entries(APP_STRUCTURE).forEach(([pageKey, pageData]) => {
      pageData.sections.forEach(section => {
        sections.push({
          id: section.id,
          name: section.name,
          description: section.description,
          category: pageKey
        });
      });
    });

    return sections;
  }, []);

  const syncSections = useCallback(async (): Promise<SyncResult> => {
    if (!isMasterAdmin()) {
      throw new Error('Only master admins can sync app sections');
    }

    setSyncing(true);
    const result: SyncResult = { added: 0, updated: 0, removed: 0, errors: [] };

    try {
      // Add a small delay to prevent resource exhaustion
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get current sections from database
      const { data: currentSections, error: fetchError } = await supabase
        .from('app_sections')
        .select('*');

      if (fetchError) {
        throw fetchError;
      }

      // Get sections from code structure
      const codeSections = extractSectionsFromStructure();
      const currentSectionMap = new Map(currentSections?.map(s => [s.id, s]) || []);
      const codeSectionMap = new Map(codeSections.map(s => [s.id, s]));

      // Find sections to add or update
      const sectionsToUpsert = [];
      for (const codeSection of codeSections) {
        const currentSection = currentSectionMap.get(codeSection.id);
        
        if (!currentSection) {
          // New section to add
          sectionsToUpsert.push(codeSection);
          result.added++;
        } else if (
          currentSection.name !== codeSection.name ||
          currentSection.description !== codeSection.description ||
          currentSection.category !== codeSection.category
        ) {
          // Existing section to update
          sectionsToUpsert.push(codeSection);
          result.updated++;
        }
      }

      // Insert or update sections
      if (sectionsToUpsert.length > 0) {
        const { error: upsertError } = await supabase
          .from('app_sections')
          .upsert(sectionsToUpsert, { onConflict: 'id' });

        if (upsertError) {
          result.errors.push(`Failed to upsert sections: ${upsertError.message}`);
        }
      }

      // Find orphaned sections (in database but not in code)
      const orphanedSections = currentSections?.filter(s => !codeSectionMap.has(s.id)) || [];
      
      if (orphanedSections.length > 0) {
        console.warn('Found orphaned sections:', orphanedSections.map(s => s.id));
        
        // For now, we'll just log orphaned sections and not auto-delete them
        // This is a safety measure to prevent accidental data loss
        result.errors.push(`Found ${orphanedSections.length} orphaned sections that weren't removed automatically for safety. Manual review recommended.`);
      }

    } catch (error) {
      console.error('Error syncing app sections:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setSyncing(false);
    }

    setLastSyncResult(result);
    return result;
  }, [isMasterAdmin, extractSectionsFromStructure]);

  const applyDefaultPermissionsToAllUsers = useCallback(async () => {
    try {
      console.log('🔧 Applying default permissions to all users for new sections...');
      
      // Get all users from profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id');
      
      if (profilesError) {
        console.error('🔧 Error fetching profiles:', profilesError);
        return;
      }
      
      const allSections = extractSectionsFromStructure();
      
      // For each user, ensure they have permissions for all sections
      for (const profile of profiles || []) {
        for (const section of allSections) {
          // Check if permission already exists
          const { data: existingPermission } = await supabase
            .from('user_section_permissions')
            .select('id')
            .eq('user_id', profile.user_id)
            .eq('section_id', section.id)
            .maybeSingle();
          
          // If no permission exists, create default 'view' permission
          if (!existingPermission) {
            await supabase
              .from('user_section_permissions')
              .insert({
                user_id: profile.user_id,
                section_id: section.id,
                permission_type: 'view'
              });
          }
        }
      }
      
      console.log('🔧 Default permissions applied successfully');
    } catch (error) {
      console.error('🔧 Error applying default permissions:', error);
    }
  }, [extractSectionsFromStructure]);

  const autoSync = useCallback(async () => {
    if (!isMasterAdmin()) {
      return;
    }

    try {
      // Check if we should run auto-sync (only once per session)
      const hasAutoSynced = sessionStorage.getItem('admin_auto_sync_completed');
      if (hasAutoSynced) {
        return;
      }

      // Wait a bit after page load to avoid resource conflicts
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const result = await syncSections();
      
      // If new sections were added, apply default permissions to all users
      if (result.added > 0) {
        await applyDefaultPermissionsToAllUsers();
        console.log('🔧 Applied default permissions for new sections');
      }
      
      // Mark as completed for this session
      sessionStorage.setItem('admin_auto_sync_completed', 'true');
      
      if (result.added > 0 || result.updated > 0) {
        const permissionsMsg = result.added > 0 ? ' (permissions applied)' : '';
        toast({
          title: "App Sections Auto-Synced",
          description: `Added: ${result.added}, Updated: ${result.updated}${permissionsMsg}`,
        });
      }

      if (result.errors.length > 0) {
        console.warn('Auto-sync warnings:', result.errors);
        // Don't show toast for auto-sync warnings to avoid spam
      }
    } catch (error) {
      console.error('Auto sync failed:', error);
      // Silent fail for auto-sync to avoid disrupting the admin experience
    }
  }, [isMasterAdmin, syncSections, toast, applyDefaultPermissionsToAllUsers]);

  return {
    syncing,
    lastSyncResult,
    syncSections,
    autoSync,
    extractSectionsFromStructure
  };
}
