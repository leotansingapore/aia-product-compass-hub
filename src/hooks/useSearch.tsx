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

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { allProducts, loading } = useAllProducts();

  useEffect(() => {
    if (!query.trim() || loading) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    const searchQuery = query.toLowerCase();
    const filtered = allProducts.filter(product => {
      const titleMatch = product.title.toLowerCase().includes(searchQuery);
      const descriptionMatch = product.description?.toLowerCase().includes(searchQuery);
      const tagMatch = product.tags?.some(tag => tag.toLowerCase().includes(searchQuery));
      const highlightMatch = product.highlights?.some(highlight => 
        highlight.toLowerCase().includes(searchQuery)
      );
      const categoryMatch = (product as any).categories?.name?.toLowerCase().includes(searchQuery);

      return titleMatch || descriptionMatch || tagMatch || highlightMatch || categoryMatch;
    });

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
  }, [query, allProducts, loading]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasQuery: query.trim().length > 0
  };
}