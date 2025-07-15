import { useState, useEffect } from 'react';
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
  category?: string; // folder/category name
  useful_links?: UsefulLink[];
  attachments?: VideoAttachment[];
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
  useful_links?: UsefulLink[];
  training_videos?: TrainingVideo[];
  custom_gpt_link?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

export function useProducts(categoryId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
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
        // Transform the data to ensure useful_links is properly typed
        const transformedData = (data || []).map(product => ({
          ...product,
          useful_links: Array.isArray(product.useful_links) ? product.useful_links as unknown as UsefulLink[] : [],
          training_videos: Array.isArray(product.training_videos) ? product.training_videos as unknown as TrainingVideo[] : []
        }));
        setProducts(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [categoryId]);

  return { products, loading, error };
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
        // Transform the data to ensure useful_links is properly typed
        const transformedData = (data || []).map(product => ({
          ...product,
          useful_links: Array.isArray(product.useful_links) ? product.useful_links as unknown as UsefulLink[] : [],
          training_videos: Array.isArray(product.training_videos) ? product.training_videos as unknown as TrainingVideo[] : []
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
        // Transform the data to ensure useful_links is properly typed
        if (data) {
          const transformedData = {
            ...data,
            useful_links: Array.isArray(data.useful_links) ? data.useful_links as unknown as UsefulLink[] : [],
            training_videos: Array.isArray(data.training_videos) ? data.training_videos as unknown as TrainingVideo[] : []
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