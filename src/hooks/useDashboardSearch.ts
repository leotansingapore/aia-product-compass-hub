import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUnifiedSearch } from '@/hooks/useUnifiedSearch';

export function useDashboardSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    groupedResults,
    resultCounts,
    isSearching,
    hasQuery,
    hasActiveFilters,
    getAvailableCategories,
    getAvailableTags,
  } = useUnifiedSearch();

  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");

  // Initialize search with URL params — only run once on mount
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    setFilters({}); // Clear filters on new search
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

  const handleTypeFilter = (type: string, checked: boolean) => {
    setFilters(prev => {
      const current = prev.types || [];
      const updated = checked
        ? [...current, type as any]
        : current.filter(t => t !== type);
      return { ...prev, types: updated.length > 0 ? updated : undefined };
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const clearSearch = () => {
    setQuery("");
    setFilters({});
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("q");
    setSearchParams(newSearchParams);
  };

  const activeFilterCount = [
    filters.category,
    filters.tags?.length,
    filters.types?.length,
  ].filter(Boolean).length;

  const sortedResults = [...results].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "type":
        return a.typeLabel.localeCompare(b.typeLabel);
      default:
        return 0; // Keep relevance order
    }
  });

  return {
    query,
    filters,
    results: sortedResults,
    groupedResults,
    resultCounts,
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
    handleTypeFilter,
    clearFilters,
    clearSearch
  };
}
