import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface UserNote {
  id: string;
  user_id: string;
  product_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function useNotes(productId: string) {
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's notes for this product
  useEffect(() => {
    const isDevelopment = import.meta.env.DEV;
    if ((!user && !isDevelopment) || !productId) {
      setLoading(false);
      return;
    }

    async function fetchNotes() {
      try {
        const userId = user?.id || '00000000-0000-0000-0000-000000000000';
        const { data, error } = await supabase
          .from('user_notes')
          .select('*')
          .eq('user_id', userId)
          .eq('product_id', productId)
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setNotes(data || []);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
  }, [user, productId]);

  // Add note
  const addNote = async (content: string) => {
    const isDevelopment = import.meta.env.DEV;
    if (!user && !isDevelopment) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add notes",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Invalid Note",
        description: "Note content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const userId = user?.id || '00000000-0000-0000-0000-000000000000';
      const { data, error } = await supabase
        .from('user_notes')
        .insert({
          user_id: userId,
          product_id: productId,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      
      setNotes(prev => [data, ...prev]);
      toast({
        title: "Note Added",
        description: "Your note has been saved",
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    }
  };

  // Update note
  const updateNote = async (noteId: string, content: string) => {
    if (!content.trim()) {
      toast({
        title: "Invalid Note",
        description: "Note content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_notes')
        .update({
          content: content.trim(),
        })
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;
      
      setNotes(prev => prev.map(note => 
        note.id === noteId ? data : note
      ));
      toast({
        title: "Note Updated",
        description: "Your note has been updated",
      });
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  // Delete note
  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('user_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      
      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast({
        title: "Note Deleted",
        description: "Your note has been deleted",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    }
  };

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
  };
}