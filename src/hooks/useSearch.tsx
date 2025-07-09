import { useState, useEffect } from 'react';
import { useAllProducts } from './useProducts';
import { useSemanticSearch } from './useSemanticSearch';

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
  const { performSemanticSearch, addToSearchHistory, getSearchSuggestions } = useSemanticSearch();

  useEffect(() => {
    if ((!query.trim() && !hasActiveFilters()) || loading) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    let searchResults: SearchResult[] = [];

    // Use semantic search if there's a query
    if (query.trim()) {
      searchResults = performSemanticSearch(query);
      addToSearchHistory(query);
    } else {
      // If no query but filters are active, use original filtering logic
      let filtered = allProducts;

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

      searchResults = filtered.map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        type: 'product',
        categoryName: (product as any).categories?.name || '',
        categoryId: product.category_id,
        tags: product.tags,
        highlights: product.highlights
      }));
    }

    // Apply filters to semantic search results as well
    if (query.trim() && hasActiveFilters()) {
      if (filters.category) {
        searchResults = searchResults.filter(result => result.categoryId === filters.category);
      }

      if (filters.tags && filters.tags.length > 0) {
        searchResults = searchResults.filter(result => 
          result.tags?.some(tag => filters.tags!.includes(tag))
        );
      }

      if (filters.hasVideos || filters.hasLinks) {
        const productIds = searchResults.map(r => r.id);
        const productsWithContent = allProducts.filter(product => {
          if (!productIds.includes(product.id)) return false;
          
          let hasRequiredContent = true;
          
          if (filters.hasVideos) {
            hasRequiredContent = hasRequiredContent && 
              product.training_videos && Array.isArray(product.training_videos) && product.training_videos.length > 0;
          }
          
          if (filters.hasLinks) {
            hasRequiredContent = hasRequiredContent && 
              product.useful_links && Array.isArray(product.useful_links) && product.useful_links.length > 0;
          }
          
          return hasRequiredContent;
        });

        searchResults = searchResults.filter(result => 
          productsWithContent.some(p => p.id === result.id)
        );
      }
    }

    setResults(searchResults);
    setIsSearching(false);
  }, [query, filters, allProducts, loading, performSemanticSearch, addToSearchHistory]);

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
    getSearchSuggestions: (q: string) => getSearchSuggestions(q),
  };
}