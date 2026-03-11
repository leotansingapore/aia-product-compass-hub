import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ConceptCard {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  original_image_url?: string | null;
  audience: string[];
  product_type: string[];
  tags: string[];
  sort_order: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export function useConceptCards() {
  const [cards, setCards] = useState<ConceptCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('concept_cards')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching concept cards:', error);
      toast.error('Failed to load concept cards');
    } else {
      setCards((data || []) as ConceptCard[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return { cards, loading, refetch: fetchCards };
}

export function useConceptCardsMutations() {
  const createCard = async (card: Omit<ConceptCard, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('concept_cards')
      .insert([{
        title: card.title,
        description: card.description || null,
        image_url: card.image_url || null,
        original_image_url: card.original_image_url || null,
        audience: card.audience || [],
        product_type: card.product_type || [],
        tags: card.tags || [],
        sort_order: card.sort_order || 0,
        created_by: card.created_by || null,
      }])
      .select()
      .single();
    if (error) { toast.error('Failed to create card'); console.error(error); return null; }
    toast.success('Concept card created');
    return data;
  };

  const updateCard = async (id: string, updates: Partial<Omit<ConceptCard, 'id' | 'created_at' | 'updated_at'>>) => {
    const { error } = await supabase.from('concept_cards').update(updates).eq('id', id);
    if (error) { toast.error('Failed to update card'); console.error(error); return false; }
    toast.success('Card updated');
    return true;
  };

  const deleteCard = async (id: string) => {
    const { error } = await supabase.from('concept_cards').delete().eq('id', id);
    if (error) { toast.error('Failed to delete card'); console.error(error); return false; }
    toast.success('Card deleted');
    return true;
  };

  const uploadOriginalImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop();
    const path = `originals/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from('concept-card-images')
      .upload(path, file, { upsert: false });
    if (error) { console.error('Upload error:', error); return null; }
    const { data: { publicUrl } } = supabase.storage.from('concept-card-images').getPublicUrl(path);
    return publicUrl;
  };

  return { createCard, updateCard, deleteCard, uploadOriginalImage };
}
