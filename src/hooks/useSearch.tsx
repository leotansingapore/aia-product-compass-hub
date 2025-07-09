import { useState, useEffect } from 'react';
import { useAllProducts } from './useProducts';

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'product';
  categoryName: string;
  categoryId: string;
  tags?: string[];
  highlights?: string[];
}

export interface SearchFilters {
  category?: string;
  tags?: string[];
  hasVideos?: boolean;
  hasLinks?: boolean;
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { allProducts, loading } = useAllProducts();

  useEffect(() => {
    if ((!query.trim() && !hasActiveFilters()) || loading) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    const searchQuery = query.toLowerCase();
    let filtered = allProducts;

    // Apply text search
    if (query.trim()) {
      filtered = filtered.filter(product => {
        const titleMatch = product.title.toLowerCase().includes(searchQuery);
        const descriptionMatch = product.description?.toLowerCase().includes(searchQuery);
        const tagMatch = product.tags?.some(tag => tag.toLowerCase().includes(searchQuery));
        const highlightMatch = product.highlights?.some(highlight => 
          highlight.toLowerCase().includes(searchQuery)
        );
        const categoryMatch = (product as any).categories?.name?.toLowerCase().includes(searchQuery);

        return titleMatch || descriptionMatch || tagMatch || highlightMatch || categoryMatch;
      });
    }

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(product => product.category_id === filters.category);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(product => 
        product.tags?.some(tag => filters.tags!.includes(tag))
      );
    }

    if (filters.hasVideos) {
      filtered = filtered.filter(product => 
        product.training_videos && Array.isArray(product.training_videos) && product.training_videos.length > 0
      );
    }

    if (filters.hasLinks) {
      filtered = filtered.filter(product => 
        product.useful_links && Array.isArray(product.useful_links) && product.useful_links.length > 0
      );
    }

    const searchResults: SearchResult[] = filtered.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      type: 'product',
      categoryName: (product as any).categories?.name || '',
      categoryId: product.category_id,
      tags: product.tags,
      highlights: product.highlights
    }));

    setResults(searchResults);
    setIsSearching(false);
  }, [query, filters, allProducts, loading]);

  const hasActiveFilters = () => {
    return filters.category || 
           (filters.tags && filters.tags.length > 0) ||
           filters.hasVideos ||
           filters.hasLinks;
  };

  // Get unique categories for filter dropdown
  const getAvailableCategories = () => {
    const categories = new Set(allProducts.map(p => ({
      id: p.category_id,
      name: (p as any).categories?.name || ''
    })));
    return Array.from(categories);
  };

  // Get unique tags for filter dropdown
  const getAvailableTags = () => {
    const tags = new Set(allProducts.flatMap(p => p.tags || []));
    return Array.from(tags);
  };

  return {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    isSearching,
    hasQuery: query.trim().length > 0,
    hasActiveFilters: hasActiveFilters(),
    getAvailableCategories,
    getAvailableTags,
  };
}