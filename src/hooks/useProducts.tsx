import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  title: string;
  description: string;
  category_id: string;
  tags: string[];
  highlights: string[];
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
          // We need to find the category by name to get its UUID
          const { data: category } = await supabase
            .from('categories')
            .select('id')
            .eq('name', getCategoryNameFromId(categoryId))
            .single();

          if (category) {
            query = query.eq('category_id', category.id);
          }
        }

        const { data, error } = await query;

        if (error) throw error;
        setProducts(data || []);
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
        setProduct(data);
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
    'Investment Products': 'investment',
    'Endowment Products': 'endowment',
    'Whole Life Products': 'whole-life',
    'Term Products': 'term',
    'Medical Insurance Products': 'medical'
  };
  return nameMap[categoryName] || categoryName.toLowerCase().replace(/\s+/g, '-');
}