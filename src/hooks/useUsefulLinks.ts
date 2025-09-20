import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { UsefulLink } from '@/hooks/useProducts';

export function useUsefulLinks(productId: string, defaultLinks: UsefulLink[] = []) {
  const [usefulLinks, setUsefulLinks] = useState<UsefulLink[]>(defaultLinks);
  const [loading, setLoading] = useState(false);

  // Load useful links from database
  useEffect(() => {
    const loadUsefulLinks = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('useful_links')
          .eq('id', productId)
          .single();

        if (data && data.useful_links && Array.isArray(data.useful_links)) {
          setUsefulLinks(data.useful_links as unknown as UsefulLink[]);
        }
      } catch (error) {
        console.log('No existing useful links found, using defaults');
        setUsefulLinks(defaultLinks);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadUsefulLinks();
    }
  }, [productId, defaultLinks]);

  // Handler for updating useful links
  const updateUsefulLinks = async (newLinks: UsefulLink[]) => {
    const previousLinks = [...usefulLinks];
    setUsefulLinks(newLinks);
    
    try {
      // Save to database using update instead of upsert
      const { error } = await supabase
        .from('products')
        .update({ useful_links: newLinks as any })
        .eq('id', productId);

      if (error) {
        console.error('Error saving useful links:', error);
        throw error;
      }
      
      console.log('Useful links saved successfully to database');
    } catch (error) {
      console.error('Failed to save useful links:', error);
      // Revert the local state on error
      setUsefulLinks(previousLinks);
      throw error;
    }
  };

  return {
    usefulLinks,
    setUsefulLinks,
    updateUsefulLinks,
    loading
  };
}