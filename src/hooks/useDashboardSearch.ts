import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';

export function useDashboardSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    isSearching,
    hasQuery,
    hasActiveFilters,
    getAvailableCategories,
    getAvailableTags
  } = useSearch();

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");

  // Initialize search with URL params
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery, query, setQuery]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    // Update URL
    const newSearchParams = new URLSearchParams(searchParams);
    if (newQuery) {
      newSearchParams.set("q", newQuery);
    } else {
      newSearchParams.delete("q");
    }
    setSearchParams(newSearchParams);
  };

  const handleCategoryFilter = (categoryId: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      category: checked ? categoryId : undefined
    }));
  };

  const handleTagFilter = (tag: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      tags: checked 
        ? [...(prev.tags || []), tag]
        : (prev.tags || []).filter(t => t !== tag)
    }));
  };

  const handleContentFilter = (type: 'hasVideos' | 'hasLinks', checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [type]: checked
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const activeFilterCount = [
    filters.category,
    filters.tags?.length,
    filters.hasVideos,
    filters.hasLinks
  ].filter(Boolean).length;

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "category":
        return a.categoryName.localeCompare(b.categoryName);
      default:
        return 0; // Keep original order for relevance
    }
  });

  return {
    query,
    filters,
    results: sortedResults,
    isSearching,
    hasQuery,
    hasActiveFilters,
    showFilters,
    setShowFilters,
    sortBy,
    setSortBy,
    activeFilterCount,
    availableCategories: getAvailableCategories(),
    availableTags: getAvailableTags(),
    handleSearch,
    handleCategoryFilter,
    handleTagFilter,
    handleContentFilter,
    clearFilters
  };
}