import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Bookmark {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's bookmarks
  useEffect(() => {
    const isDevelopment = import.meta.env.DEV;
    if (!user && !isDevelopment) {
      setLoading(false);
      return;
    }

    async function fetchBookmarks() {
      try {
        const userId = user?.id || '00000000-0000-0000-0000-000000000000';
        const { data, error } = await supabase
          .from('user_bookmarks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookmarks(data || []);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookmarks();
  }, [user]);

  // Check if product is bookmarked
  const isBookmarked = (productId: string) => {
    return bookmarks.some(bookmark => bookmark.product_id === productId);
  };

  // Add bookmark
  const addBookmark = async (productId: string) => {
    const isDevelopment = import.meta.env.DEV;
    if (!user && !isDevelopment) {
      toast({
        title: "Authentication Required",
        description: "Please log in to bookmark products",
        variant: "destructive",
      });
      return;
    }

    try {
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';
      const { data, error } = await supabase
        .from('user_bookmarks')
        .insert({
          user_id: userId,
          product_id: productId,
        })
        .select()
        .single();

      if (error) throw error;
      
      setBookmarks(prev => [data, ...prev]);
      toast({
        title: "Bookmarked!",
        description: "Product added to your bookmarks",
      });
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to add bookmark",
        variant: "destructive",
      });
    }
  };

  // Remove bookmark
  const removeBookmark = async (productId: string) => {
    const isDevelopment = import.meta.env.DEV;
    if (!user && !isDevelopment) return;

    try {
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;
      
      setBookmarks(prev => prev.filter(bookmark => bookmark.product_id !== productId));
      toast({
        title: "Removed",
        description: "Product removed from bookmarks",
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to remove bookmark",
        variant: "destructive",
      });
    }
  };

  // Toggle bookmark
  const toggleBookmark = async (productId: string) => {
    if (isBookmarked(productId)) {
      await removeBookmark(productId);
    } else {
      await addBookmark(productId);
    }
  };

  return {
    bookmarks,
    loading,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
  };
}