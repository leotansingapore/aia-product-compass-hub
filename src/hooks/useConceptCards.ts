import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ConceptCard {
  id: string;
  title: string;
  description?: string | null;
  image_url?: string | null;
  original_image_url?: string | null;
  image_urls?: string[] | null;
  audience: string[];
  product_type: string[];
  tags: string[];
  sort_order: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export function useConceptCards() {
  const { data: cards = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['concept-cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('concept_cards')
        .select('id, title, description, image_url, original_image_url, image_urls, audience, product_type, tags, sort_order, created_by, created_at, updated_at')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching concept cards:', error);
        toast.error('Failed to load concept cards');
        throw error;
      }
      return (data || []) as ConceptCard[];
    },
  });

  return { cards, loading, refetch };
}

const BUCKET = 'concept-card-images';

/**
 * Derive the storage object path from a public URL on the concept-card-images
 * bucket. Returns null for anything else (external URLs pass through untouched).
 */
export function conceptCardStoragePath(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const path = url.slice(idx + marker.length).split('?')[0];
  return path ? decodeURIComponent(path) : null;
}

/**
 * Best-effort removal of the storage objects behind the given URLs.
 * Never blocks the user flow — failures are logged and swallowed.
 */
export async function removeConceptCardImages(urls: Array<string | null | undefined>): Promise<void> {
  const paths = [...new Set(
    urls
      .filter((u): u is string => !!u)
      .map(conceptCardStoragePath)
      .filter((p): p is string => !!p)
  )];
  if (paths.length === 0) return;
  try {
    const { error } = await supabase.storage.from(BUCKET).remove(paths);
    if (error) console.error('Concept card storage cleanup failed (non-blocking):', error);
  } catch (e) {
    console.error('Concept card storage cleanup failed (non-blocking):', e);
  }
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
    // Grab the card's image URLs first so its storage objects can be cleaned up.
    const { data: card } = await supabase
      .from('concept_cards')
      .select('image_url, original_image_url, image_urls')
      .eq('id', id)
      .maybeSingle();
    const { error } = await supabase.from('concept_cards').delete().eq('id', id);
    if (error) { toast.error('Failed to delete card'); console.error(error); return false; }
    toast.success('Card deleted');
    if (card) {
      // Best-effort: remove the card's files from storage; never block deletion.
      void removeConceptCardImages([card.image_url, card.original_image_url, ...(card.image_urls ?? [])]);
    }
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
