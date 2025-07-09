import { useState, useEffect, useMemo } from 'react';
import { useAllProducts } from './useProducts';
import { SearchResult } from './useSearch';

// Enhanced semantic search with NLP-like capabilities
export function useSemanticSearch() {
  const { allProducts, loading } = useAllProducts();
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Semantic search algorithm
  const performSemanticSearch = (query: string): SearchResult[] => {
    if (!query.trim() || loading) return [];

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
    const searchQuery = query.toLowerCase();

    const scoredResults = allProducts.map(product => {
      let score = 0;
      const title = product.title.toLowerCase();
      const description = product.description?.toLowerCase() || '';
      const tags = product.tags?.map(tag => tag.toLowerCase()) || [];
      const highlights = product.highlights?.map(h => h.toLowerCase()) || [];
      const categoryName = (product as any).categories?.name?.toLowerCase() || '';

      // Exact phrase matching (highest priority)
      if (title.includes(searchQuery)) score += 100;
      if (description.includes(searchQuery)) score += 80;
      if (categoryName.includes(searchQuery)) score += 60;

      // Individual term matching
      searchTerms.forEach(term => {
        // Title matches
        if (title.includes(term)) score += 40;
        if (title.startsWith(term)) score += 20; // Boost for prefix matches
        
        // Description matches
        if (description.includes(term)) score += 20;
        
        // Tag matches
        tags.forEach(tag => {
          if (tag.includes(term)) score += 30;
          if (tag === term) score += 50; // Exact tag match
        });
        
        // Highlight matches
        highlights.forEach(highlight => {
          if (highlight.includes(term)) score += 25;
        });
        
        // Category matches
        if (categoryName.includes(term)) score += 35;
      });

      // Semantic associations (basic financial product understanding)
      const semanticBoosts = getSemanticBoosts(searchQuery, product);
      score += semanticBoosts;

      return {
        product,
        score
      };
    }).filter(result => result.score > 0);

    // Sort by score and return top results
    return scoredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(result => ({
        id: result.product.id,
        title: result.product.title,
        description: result.product.description,
        type: 'product' as const,
        categoryName: (result.product as any).categories?.name || '',
        categoryId: result.product.category_id,
        tags: result.product.tags,
        highlights: result.product.highlights,
        relevanceScore: result.score
      }));
  };

  // Basic semantic understanding for financial products
  const getSemanticBoosts = (query: string, product: any): number => {
    let boost = 0;
    const queryLower = query.toLowerCase();
    const title = product.title.toLowerCase();
    const description = product.description?.toLowerCase() || '';
    const tags = product.tags?.map((tag: string) => tag.toLowerCase()) || [];

    // Financial term associations
    const associations = {
      'retirement': ['pension', 'savings', 'endowment', 'saver', 'wealth', 'future'],
      'protection': ['life', 'term', 'critical', 'cover', 'secure', 'shield', 'guard'],
      'investment': ['wealth', 'growth', 'returns', 'portfolio', 'achiever', 'venture'],
      'health': ['medical', 'critical', 'healthcare', 'wellness', 'insurance'],
      'insurance': ['protect', 'cover', 'policy', 'premium', 'benefit'],
      'savings': ['wealth', 'builder', 'saver', 'accumulation', 'growth'],
      'income': ['salary', 'earnings', 'revenue', 'cash flow', 'benefits'],
      'family': ['dependents', 'children', 'spouse', 'legacy', 'future'],
      'business': ['corporate', 'company', 'enterprise', 'commercial'],
      'young': ['starter', 'basic', 'entry', 'beginner', 'first time'],
      'premium': ['plus', 'max', 'gold', 'platinum', 'ultimate', 'enhanced']
    };

    for (const [concept, related] of Object.entries(associations)) {
      if (queryLower.includes(concept)) {
        related.forEach(relatedTerm => {
          if (title.includes(relatedTerm) || description.includes(relatedTerm) || 
              tags.some(tag => tag.includes(relatedTerm))) {
            boost += 15;
          }
        });
      }
    }

    return boost;
  };

  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return;
    
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const getSearchSuggestions = (query: string): string[] => {
    if (!query.trim()) return searchHistory.slice(0, 5);

    const suggestions = new Set<string>();
    const queryLower = query.toLowerCase();

    // Add matching search history
    searchHistory.forEach(historyItem => {
      if (historyItem.toLowerCase().includes(queryLower)) {
        suggestions.add(historyItem);
      }
    });

    // Add product-based suggestions
    allProducts.forEach(product => {
      const title = product.title.toLowerCase();
      if (title.includes(queryLower) && suggestions.size < 8) {
        suggestions.add(product.title);
      }
      
      product.tags?.forEach(tag => {
        if (tag.toLowerCase().includes(queryLower) && suggestions.size < 8) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions).slice(0, 8);
  };

  return {
    performSemanticSearch,
    addToSearchHistory,
    getSearchSuggestions,
    searchHistory,
    clearSearchHistory: () => {
      setSearchHistory([]);
      localStorage.removeItem('searchHistory');
    }
  };
}