import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UsefulLink {
  name: string;
  url: string;
  icon: string;
}

export interface TrainingVideo {
  id: string;
  title: string;
  url: string;
  description?: string;
  notes?: string;
  transcript?: string;
  duration?: number; // in seconds
  order: number;
  published?: boolean;
  category?: string; // folder/category name
  useful_links?: UsefulLink[];
  attachments?: VideoAttachment[];
  // Rich text editor migration fields
  rich_content?: string; // Rich HTML/markdown content (new editor mode)
  legacy_fields?: {
    description?: string;
    notes?: string;
    transcript?: string;
    useful_links?: UsefulLink[];
    attachments?: VideoAttachment[];
    migrated_at?: string;
  }; // Backup of original structured data when converted to rich editor
}

export interface VideoAttachment {
  id: string;
  name: string;
  url: string;
  file_size?: number;
  file_type?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category_id: string;
  tags: string[];
  highlights: string[];
  useful_links?: any; // Can be flat array or folder_structure object
  training_videos?: TrainingVideo[];
  custom_gpt_link?: string;
  chatbot_1_name?: string;
  assistant_id?: string;
  assistant_instructions?: string;
  chatbot_link_2?: string;
  chatbot_link_3?: string;
  chatbot_2_name?: string;
  chatbot_3_name?: string;
  chatbot_button_text?: string;
  published?: boolean;
  parent_product_id?: string | null;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  published?: boolean;
  created_at: string;
  updated_at: string;
}

const PRODUCTS_SELECT = `
  *,
  categories:category_id (
    id,
    name
  )
`;

function transformProduct(product: any): Product {
  return {
    ...product,
    useful_links: product.useful_links,
    training_videos: Array.isArray(product.training_videos)
      ? (product.training_videos as unknown as TrainingVideo[])
      : []
  };
}

async function fetchCategoriesFromServer(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

async function fetchProductsFromServer(categoryId?: string): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select(PRODUCTS_SELECT)
    .order('title');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(transformProduct);
}

async function fetchProductByIdFromServer(productId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCTS_SELECT)
    .eq('id', productId)
    .maybeSingle();
  if (error) throw error;
  return data ? transformProduct(data) : null;
}

async function fetchProductBySlugOrIdFromServer(slugOrId: string): Promise<Product | null> {
  // First, try exact ID match
  const { data: exactMatch, error: exactError } = await supabase
    .from('products')
    .select(PRODUCTS_SELECT)
    .eq('id', slugOrId)
    .maybeSingle();

  if (!exactError && exactMatch) {
    return transformProduct(exactMatch);
  }

  // Fall back to slug-to-title conversion for legacy URLs
  const titleFromSlug = slugOrId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCTS_SELECT)
    .ilike('title', `%${titleFromSlug}%`)
    .maybeSingle();

  if (error) throw error;
  return data ? transformProduct(data) : null;
}

export function useCategories() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategoriesFromServer,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['categories'] });
  }, [queryClient]);

  return {
    categories: data || [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch categories') : null,
    refetch,
  };
}

export function invalidateCategoriesCache() {
  // No-op: callers should use queryClient.invalidateQueries instead.
  // Kept for backward compatibility — the cache is now managed by TanStack Query.
}

export function useProducts(categoryId?: string) {
  const { data, isLoading, error, refetch: queryRefetch } = useQuery({
    queryKey: ['products', categoryId ?? 'all'],
    queryFn: () => fetchProductsFromServer(categoryId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const refetch = useCallback(async () => {
    await queryRefetch();
  }, [queryRefetch]);

  return {
    products: data || [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch products') : null,
    refetch,
  };
}

export function useAllProducts() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => fetchProductsFromServer(),
    staleTime: 2 * 60 * 1000,
  });

  return {
    allProducts: data || [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch products') : null,
  };
}

export function useProductById(productId: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProductByIdFromServer(productId),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    product: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch product') : null,
  };
}

export function useProductBySlugOrId(slugOrId: string) {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['product', 'slug', slugOrId],
    queryFn: () => fetchProductBySlugOrIdFromServer(slugOrId),
    enabled: !!slugOrId,
    staleTime: 2 * 60 * 1000,
    // Keep embedded video players stable when users switch browser tabs.
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const refetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['product', 'slug', slugOrId] });
  }, [queryClient, slugOrId]);

  const silentRefetch = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['product', 'slug', slugOrId] });
  }, [queryClient, slugOrId]);

  return {
    product: data ?? null,
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch product') : null,
    refetch,
    silentRefetch,
  };
}

// Helper function to map category names to IDs for backward compatibility
export function getCategoryIdFromName(categoryName: string): string {
  const nameMap: Record<string, string> = {
    'Investment Products': 'c7cde8f4-12d4-4ddc-9150-7b32008a4e19',
    'Endowment Products': '3adb6155-c158-408d-b910-9b3db532d435',
    'Whole Life Products': '19b8c528-f36e-4731-827c-0cdb1de25059',
    'Term Products': '291cf475-d918-40c0-b37d-33794534d469',
    'Medical Insurance Products': 'b1024527-481f-4d85-9192-b43633e9be4a'
  };
  return nameMap[categoryName] || categoryName;
}
