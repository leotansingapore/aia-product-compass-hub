import { useState, useEffect, useCallback, useMemo } from 'react';
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

// Cache for categories to prevent unnecessary re-fetches
let categoriesCache: Category[] | null = null;
let categoriesCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const CATEGORIES_CHANGED_EVENT = 'categories-changed';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(categoriesCache || []);
  const [loading, setLoading] = useState(!categoriesCache);
  const [error, setError] = useState<string | null>(null);

  const fetchFromServer = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      const fetched = data || [];
      categoriesCache = fetched;
      categoriesCacheTime = Date.now();
      setCategories(fetched);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      if (categoriesCache && Date.now() - categoriesCacheTime < CACHE_DURATION) {
        setCategories(categoriesCache);
        setLoading(false);
        return;
      }
      fetchFromServer();
    }

    fetchCategories();
  }, [fetchFromServer]);

  // Listen for cross-instance refetch signals
  useEffect(() => {
    const handler = () => {
      if (categoriesCache) {
        setCategories(categoriesCache);
      } else {
        fetchFromServer();
      }
    };
    window.addEventListener(CATEGORIES_CHANGED_EVENT, handler);
    return () => window.removeEventListener(CATEGORIES_CHANGED_EVENT, handler);
  }, [fetchFromServer]);

  const refetch = useCallback(async () => {
    categoriesCache = null;
    categoriesCacheTime = 0;
    setLoading(true);
    await fetchFromServer();
    // Notify all other hook instances to sync
    window.dispatchEvent(new Event(CATEGORIES_CHANGED_EVENT));
  }, [fetchFromServer]);

  return { categories, loading, error, refetch };
}

export function invalidateCategoriesCache() {
  categoriesCache = null;
  categoriesCacheTime = 0;
}

export function useProducts(categoryId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
        let query = supabase
          .from('products')
          .select(`
            *,
            categories:category_id (
              id,
              name
            )
          `)
          .order('title');

        if (categoryId) {
          // Use the categoryId directly as it's now a UUID
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;

        if (error) throw error;
        // Preserve useful_links exactly as stored (array or folder_structure object)
        const transformedData = (data || []).map(product => ({
          ...product,
          useful_links: product.useful_links,
          training_videos: Array.isArray(product.training_videos)
            ? (product.training_videos as unknown as TrainingVideo[])
            : []
        }));
        setProducts(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }, [categoryId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

export function useAllProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories:category_id (
              id,
              name
            )
          `)
          .order('title');

        if (error) throw error;
        // Preserve useful_links exactly as stored (array or folder_structure object)
        const transformedData = (data || []).map(product => ({
          ...product,
          useful_links: product.useful_links,
          training_videos: Array.isArray(product.training_videos)
            ? (product.training_videos as unknown as TrainingVideo[])
            : []
        }));
        setAllProducts(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }

    fetchAllProducts();
  }, []);

  return { allProducts, loading, error };
}

export function useProductById(productId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories:category_id (
              id,
              name
            )
          `)
          .eq('id', productId)
          .maybeSingle();

        if (error) throw error;
        // Preserve useful_links exactly as stored (array or folder_structure object)
        if (data) {
          const transformedData = {
            ...data,
            useful_links: data.useful_links,
            training_videos: Array.isArray(data.training_videos)
              ? (data.training_videos as unknown as TrainingVideo[])
              : []
          };
          setProduct(transformedData);
        } else {
          setProduct(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
}

export function useProductBySlugOrId(slugOrId: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async (silent: boolean = false) => {
    if (!slugOrId) {
      if (!silent) setLoading(false);
      return;
    }

    // Only show loading state if not a silent refetch
    if (!silent) setLoading(true);

    try {
      const selectQuery = `
        *,
        categories:category_id (
          id,
          name
        )
      `;

      // First, try exact ID match (handles UUIDs, module IDs, AND SEO-friendly slugs)
      const { data: exactMatch, error: exactError } = await supabase
        .from('products')
        .select(selectQuery)
        .eq('id', slugOrId)
        .maybeSingle();

      if (!exactError && exactMatch) {
        // Found by exact ID match
        const transformedData = {
          ...exactMatch,
          useful_links: exactMatch.useful_links,
          training_videos: Array.isArray(exactMatch.training_videos)
            ? (exactMatch.training_videos as unknown as TrainingVideo[])
            : []
        };
        setProduct(transformedData);
        return;
      }

      // Fall back to slug-to-title conversion for legacy URLs
      const titleFromSlug = slugOrId
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const { data, error } = await supabase
        .from('products')
        .select(selectQuery)
        .ilike('title', `%${titleFromSlug}%`)
        .maybeSingle();

      if (error) throw error;

      // Preserve useful_links exactly as stored (array or folder_structure object)
      if (data) {
        const transformedData = {
          ...data,
          useful_links: data.useful_links,
          training_videos: Array.isArray(data.training_videos)
            ? (data.training_videos as unknown as TrainingVideo[])
            : []
        };
        setProduct(transformedData);
      } else {
        setProduct(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [slugOrId]);

  // Initial fetch on mount
  useEffect(() => {
    fetchProduct(false);
  }, [fetchProduct]);

  // Wrapper functions for different refetch behaviors
  const refetch = useCallback(() => fetchProduct(false), [fetchProduct]);
  const silentRefetch = useCallback(() => fetchProduct(true), [fetchProduct]);

  return { product, loading, error, refetch, silentRefetch };
}

// Helper function to map category IDs to names for backward compatibility
function getCategoryNameFromId(categoryId: string): string {
  const categoryMap: Record<string, string> = {
    'investment': 'Investment Products',
    'endowment': 'Endowment Products',
    'whole-life': 'Whole Life Products',
    'term': 'Term Products',
    'medical': 'Medical Insurance Products'
  };
  return categoryMap[categoryId] || categoryId;
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