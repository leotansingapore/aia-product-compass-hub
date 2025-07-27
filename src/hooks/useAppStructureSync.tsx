import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';

// Enhanced APP_STRUCTURE with pages and tabs
export const APP_STRUCTURE = {
  pages: {
    'dashboard': {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Main dashboard with overview and quick actions',
      path: '/',
      category: 'main',
      tabs: {
        'overview': { id: 'overview', name: 'Overview', tab_order: 0 },
        'analytics': { id: 'analytics', name: 'Learning Analytics', tab_order: 1 },
        'recent': { id: 'recent', name: 'Recent Activity', tab_order: 2 }
      }
    },
    'my-account': {
      id: 'my-account',
      name: 'My Account',
      description: 'User profile and account settings',
      path: '/my-account',
      category: 'account',
      tabs: {
        'profile': { id: 'profile', name: 'Profile', tab_order: 0 },
        'security': { id: 'security', name: 'Security', tab_order: 1 },
        'preferences': { id: 'preferences', name: 'Preferences', tab_order: 2 }
      }
    },
    'admin-dashboard': {
      id: 'admin-dashboard',
      name: 'Admin Dashboard',
      description: 'Administrative controls and user management',
      path: '/admin',
      category: 'admin',
      tabs: {
        'users': { id: 'users', name: 'User Management', tab_order: 0 },
        'permissions': { id: 'permissions', name: 'Permissions', tab_order: 1 },
        'analytics': { id: 'admin-analytics', name: 'System Analytics', tab_order: 2 }
      }
    },
    'product-categories': {
      id: 'product-categories',
      name: 'Product Categories',
      description: 'Browse products by category',
      path: '/categories/*',
      category: 'products',
      tabs: {}
    },
    'bookmarks': {
      id: 'bookmarks',
      name: 'Bookmarks',
      description: 'Saved products and materials',
      path: '/bookmarks',
      category: 'learning',
      tabs: {}
    },
    'cmfas-exams': {
      id: 'cmfas-exams',
      name: 'CMFAS Exams',
      description: 'CMFAS examination preparation',
      path: '/cmfas-exams',
      category: 'exams',
      tabs: {}
    }
  },
  sections: {
    'product-categories': {
      id: 'product-categories',
      name: 'Product Categories',
      description: 'Main product categories section',
      category: 'products'
    },
    'product-category-investment': {
      id: 'product-category-investment',
      name: 'Investment Products',
      description: 'Investment-related insurance products',
      category: 'products'
    },
    'product-category-endowment': {
      id: 'product-category-endowment',
      name: 'Endowment Products',
      description: 'Endowment insurance products',
      category: 'products'
    },
    'product-category-whole-life': {
      id: 'product-category-whole-life',
      name: 'Whole Life Products',
      description: 'Whole life insurance products',
      category: 'products'
    },
    'product-category-term': {
      id: 'product-category-term',
      name: 'Term Products',
      description: 'Term insurance products',
      category: 'products'
    },
    'product-category-medical': {
      id: 'product-category-medical',
      name: 'Medical Insurance Products',
      description: 'Medical and health insurance products',
      category: 'products'
    },
    'useful-links': {
      id: 'useful-links',
      name: 'Useful Links',
      description: 'Collection of useful external links and resources',
      category: 'resources'
    },
    'learning-analytics': {
      id: 'learning-analytics',
      name: 'Learning Analytics',
      description: 'Progress tracking and learning statistics',
      category: 'analytics'
    },
    'recent-updates': {
      id: 'recent-updates',
      name: 'Recent Updates',
      description: 'Latest updates and announcements',
      category: 'updates'
    },
    'continue-learning': {
      id: 'continue-learning',
      name: 'Continue Learning',
      description: 'Resume learning from where you left off',
      category: 'learning'
    },
    'recently-viewed': {
      id: 'recently-viewed',
      name: 'Recently Viewed',
      description: 'Recently accessed products and materials',
      category: 'history'
    },
    'recommendations': {
      id: 'recommendations',
      name: 'Recommendations',
      description: 'Personalized content recommendations',
      category: 'ai'
    },
    'user-management': {
      id: 'user-management',
      name: 'User Management',
      description: 'Manage user accounts and roles',
      category: 'admin'
    },
    'permission-management': {
      id: 'permission-management',
      name: 'Permission Management',
      description: 'Manage section and page permissions',
      category: 'admin'
    }
  }
};

interface SyncResult {
  added: number;
  updated: number;
  unchanged: number;
}

export function useAppStructureSync() {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();
  const { isMasterAdmin } = usePermissions();

  const extractPagesFromStructure = useCallback(() => {
    return Object.values(APP_STRUCTURE.pages).map(page => ({
      id: page.id,
      name: page.name,
      description: page.description || '',
      path: page.path,
      category: page.category
    }));
  }, []);

  const extractTabsFromStructure = useCallback(() => {
    const tabs: Array<{
      id: string;
      page_id: string;
      name: string;
      description: string;
      tab_order: number;
    }> = [];

    Object.values(APP_STRUCTURE.pages).forEach(page => {
      Object.values(page.tabs).forEach(tab => {
        tabs.push({
          id: tab.id,
          page_id: page.id,
          name: tab.name,
          description: '',
          tab_order: tab.tab_order
        });
      });
    });

    return tabs;
  }, []);

  const extractSectionsFromStructure = useCallback(() => {
    return Object.values(APP_STRUCTURE.sections).map(section => ({
      id: section.id,
      name: section.name,
      description: section.description || '',
      category: section.category
    }));
  }, []);

  const syncPages = useCallback(async (): Promise<SyncResult> => {
    const pages = extractPagesFromStructure();
    let added = 0, updated = 0, unchanged = 0;

    console.log('🔧 Syncing pages to database...', pages);

    for (const page of pages) {
      // Check if page exists
      const { data: existingPage, error: fetchError } = await supabase
        .from('app_pages')
        .select('*')
        .eq('id', page.id)
        .maybeSingle();

      if (fetchError) {
        console.error('🔧 Error fetching page:', fetchError);
        continue;
      }

      if (!existingPage) {
        // Insert new page
        const { error: insertError } = await supabase
          .from('app_pages')
          .insert(page);

        if (insertError) {
          console.error('🔧 Error inserting page:', insertError);
        } else {
          added++;
          console.log('🔧 Added page:', page.id);
        }
      } else {
        // Check if update is needed
        const needsUpdate = 
          existingPage.name !== page.name ||
          existingPage.description !== page.description ||
          existingPage.path !== page.path ||
          existingPage.category !== page.category;

        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('app_pages')
            .update({
              name: page.name,
              description: page.description,
              path: page.path,
              category: page.category
            })
            .eq('id', page.id);

          if (updateError) {
            console.error('🔧 Error updating page:', updateError);
          } else {
            updated++;
            console.log('🔧 Updated page:', page.id);
          }
        } else {
          unchanged++;
        }
      }
    }

    const result = { added, updated, unchanged };
    console.log('🔧 Pages sync result:', result);
    return result;
  }, [extractPagesFromStructure]);

  const syncTabs = useCallback(async (): Promise<SyncResult> => {
    const tabs = extractTabsFromStructure();
    let added = 0, updated = 0, unchanged = 0;

    console.log('🔧 Syncing tabs to database...', tabs);

    for (const tab of tabs) {
      // Check if tab exists
      const { data: existingTab, error: fetchError } = await supabase
        .from('app_tabs')
        .select('*')
        .eq('id', tab.id)
        .maybeSingle();

      if (fetchError) {
        console.error('🔧 Error fetching tab:', fetchError);
        continue;
      }

      if (!existingTab) {
        // Insert new tab
        const { error: insertError } = await supabase
          .from('app_tabs')
          .insert(tab);

        if (insertError) {
          console.error('🔧 Error inserting tab:', insertError);
        } else {
          added++;
          console.log('🔧 Added tab:', tab.id);
        }
      } else {
        // Check if update is needed
        const needsUpdate = 
          existingTab.name !== tab.name ||
          existingTab.description !== tab.description ||
          existingTab.page_id !== tab.page_id ||
          existingTab.tab_order !== tab.tab_order;

        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('app_tabs')
            .update({
              name: tab.name,
              description: tab.description,
              page_id: tab.page_id,
              tab_order: tab.tab_order
            })
            .eq('id', tab.id);

          if (updateError) {
            console.error('🔧 Error updating tab:', updateError);
          } else {
            updated++;
            console.log('🔧 Updated tab:', tab.id);
          }
        } else {
          unchanged++;
        }
      }
    }

    const result = { added, updated, unchanged };
    console.log('🔧 Tabs sync result:', result);
    return result;
  }, [extractTabsFromStructure]);

  const syncSections = useCallback(async (): Promise<SyncResult> => {
    const sections = extractSectionsFromStructure();
    let added = 0, updated = 0, unchanged = 0;

    console.log('🔧 Syncing sections to database...', sections);

    for (const section of sections) {
      // Check if section exists
      const { data: existingSection, error: fetchError } = await supabase
        .from('app_sections')
        .select('*')
        .eq('id', section.id)
        .maybeSingle();

      if (fetchError) {
        console.error('🔧 Error fetching section:', fetchError);
        continue;
      }

      if (!existingSection) {
        // Insert new section
        const { error: insertError } = await supabase
          .from('app_sections')
          .insert(section);

        if (insertError) {
          console.error('🔧 Error inserting section:', insertError);
        } else {
          added++;
          console.log('🔧 Added section:', section.id);
        }
      } else {
        // Check if update is needed
        const needsUpdate = 
          existingSection.name !== section.name ||
          existingSection.description !== section.description ||
          existingSection.category !== section.category;

        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('app_sections')
            .update({
              name: section.name,
              description: section.description,
              category: section.category
            })
            .eq('id', section.id);

          if (updateError) {
            console.error('🔧 Error updating section:', updateError);
          } else {
            updated++;
            console.log('🔧 Updated section:', section.id);
          }
        } else {
          unchanged++;
        }
      }
    }

    const result = { added, updated, unchanged };
    console.log('🔧 Sections sync result:', result);
    return result;
  }, [extractSectionsFromStructure]);

  const applyDefaultPermissionsToAllUsers = useCallback(async (
    pagesAdded: number, 
    tabsAdded: number, 
    sectionsAdded: number
  ) => {
    if (pagesAdded === 0 && tabsAdded === 0 && sectionsAdded === 0) {
      return; // No new items to assign permissions for
    }

    try {
      console.log('🔧 Applying default permissions to all users for new items...');
      
      // Get all users from profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id');
      
      if (profilesError) {
        console.error('🔧 Error fetching profiles:', profilesError);
        return;
      }

      const allPages = extractPagesFromStructure();
      const allTabs = extractTabsFromStructure();
      const allSections = extractSectionsFromStructure();
      
      // For each user, ensure they have permissions for all new items
      for (const profile of profiles || []) {
        // Page permissions
        if (pagesAdded > 0) {
          for (const page of allPages) {
            const { data: existingPermission } = await supabase
              .from('user_page_permissions')
              .select('id')
              .eq('user_id', profile.user_id)
              .eq('page_id', page.id)
              .maybeSingle();
            
            if (!existingPermission) {
              await supabase
                .from('user_page_permissions')
                .insert({
                  user_id: profile.user_id,
                  page_id: page.id,
                  permission_type: 'view'
                });
            }
          }
        }

        // Tab permissions
        if (tabsAdded > 0) {
          for (const tab of allTabs) {
            const { data: existingPermission } = await supabase
              .from('user_tab_permissions')
              .select('id')
              .eq('user_id', profile.user_id)
              .eq('tab_id', tab.id)
              .maybeSingle();
            
            if (!existingPermission) {
              await supabase
                .from('user_tab_permissions')
                .insert({
                  user_id: profile.user_id,
                  tab_id: tab.id,
                  permission_type: 'view'
                });
            }
          }
        }

        // Section permissions
        if (sectionsAdded > 0) {
          for (const section of allSections) {
            const { data: existingPermission } = await supabase
              .from('user_section_permissions')
              .select('id')
              .eq('user_id', profile.user_id)
              .eq('section_id', section.id)
              .maybeSingle();
            
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
      }
      
      console.log('🔧 Default permissions applied successfully');
    } catch (error) {
      console.error('🔧 Error applying default permissions:', error);
    }
  }, [extractPagesFromStructure, extractTabsFromStructure, extractSectionsFromStructure]);

  const autoSync = useCallback(async () => {
    if (!isMasterAdmin()) {
      return;
    }

    // Check if auto-sync has already been completed for this session
    const alreadyCompleted = sessionStorage.getItem('admin_auto_sync_completed');
    if (alreadyCompleted) {
      return;
    }

    try {
      setSyncing(true);
      console.log('🔧 Starting automatic app structure sync...');
      
      // Sync all components of the app structure
      const [pagesResult, tabsResult, sectionsResult] = await Promise.all([
        syncPages(),
        syncTabs(),
        syncSections()
      ]);
      
      // Apply default permissions for any new items
      if (pagesResult.added > 0 || tabsResult.added > 0 || sectionsResult.added > 0) {
        await applyDefaultPermissionsToAllUsers(
          pagesResult.added, 
          tabsResult.added, 
          sectionsResult.added
        );
      }
      
      // Mark as completed for this session
      sessionStorage.setItem('admin_auto_sync_completed', 'true');
      
      const totalAdded = pagesResult.added + tabsResult.added + sectionsResult.added;
      const totalUpdated = pagesResult.updated + tabsResult.updated + sectionsResult.updated;
      
      if (totalAdded > 0 || totalUpdated > 0) {
        const permissionsMsg = totalAdded > 0 ? ' (permissions applied)' : '';
        toast({
          title: "App Structure Auto-Synced",
          description: `Pages: +${pagesResult.added}/~${pagesResult.updated}, Tabs: +${tabsResult.added}/~${tabsResult.updated}, Sections: +${sectionsResult.added}/~${sectionsResult.updated}${permissionsMsg}`,
        });
      }

      console.log('🔧 Auto-sync completed successfully');
    } catch (error) {
      console.error('Auto sync failed:', error);
      // Silent fail for auto-sync to avoid disrupting the admin experience
    } finally {
      setSyncing(false);
    }
  }, [isMasterAdmin, syncPages, syncTabs, syncSections, toast, applyDefaultPermissionsToAllUsers]);

  return {
    syncing,
    syncPages,
    syncTabs,
    syncSections,
    autoSync,
    extractPagesFromStructure,
    extractTabsFromStructure,
    extractSectionsFromStructure
  };
}