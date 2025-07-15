import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { NavigationHeader } from "@/components/NavigationHeader";
import { EnhancedSearchBar } from "@/components/EnhancedSearchBar";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Filter, SlidersHorizontal, X } from "lucide-react";
import { useSearch } from "@/hooks/useSearch";
import { SkeletonLoader } from "@/components/SkeletonLoader";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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

  const availableCategories = getAvailableCategories();
  const availableTags = getAvailableTags();

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    // Update URL
    navigate(`/search?q=${encodeURIComponent(newQuery)}`, { replace: true });
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

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Search Results - AIA Product Compass Hub</title>
        <meta name="description" content={`Search results for "${query || 'products'}" - Find AIA insurance and investment products with detailed information, training videos, and AI assistance.`} />
      </Helmet>
      <NavigationHeader
        title="Search Results"
        subtitle={hasQuery ? `Results for "${query}"` : "Search our knowledge base"}
        showBackButton
        onBack={() => navigate(-1)}
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Search Results" }
        ]}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <EnhancedSearchBar 
              onSearch={handleSearch}
              placeholder="Search products, categories, or content..."
            />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-80 space-y-6`}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Filters</CardTitle>
                  <div className="flex items-center gap-2">
                    {activeFilterCount > 0 && (
                      <Badge variant="secondary">{activeFilterCount}</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      disabled={!hasActiveFilters}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h4 className="font-medium mb-3">Category</h4>
                  <div className="space-y-2">
                    {availableCategories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={filters.category === category.id}
                          onCheckedChange={(checked) => 
                            handleCategoryFilter(category.id, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={`category-${category.id}`}
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Content Type Filter */}
                <div>
                  <h4 className="font-medium mb-3">Content Type</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has-videos"
                        checked={filters.hasVideos || false}
                        onCheckedChange={(checked) => 
                          handleContentFilter('hasVideos', checked as boolean)
                        }
                      />
                      <label htmlFor="has-videos" className="text-sm">
                        Has Training Videos
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has-links"
                        checked={filters.hasLinks || false}
                        onCheckedChange={(checked) => 
                          handleContentFilter('hasLinks', checked as boolean)
                        }
                      />
                      <label htmlFor="has-links" className="text-sm">
                        Has Useful Links
                      </label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tags Filter */}
                {availableTags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Tags</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableTags.slice(0, 20).map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag}`}
                            checked={filters.tags?.includes(tag) || false}
                            onCheckedChange={(checked) => 
                              handleTagFilter(tag, checked as boolean)
                            }
                          />
                          <label 
                            htmlFor={`tag-${tag}`}
                            className="text-sm leading-none"
                          >
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold">
                  {isSearching ? "Searching..." : `${results.length} results`}
                  {hasQuery && !isSearching && (
                    <span className="text-muted-foreground font-normal"> for "{query}"</span>
                  )}
                </h2>
                
                {/* Mobile Filter Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Category: {availableCategories.find(c => c.id === filters.category)?.name}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setFilters(prev => ({ ...prev, category: undefined }))}
                    />
                  </Badge>
                )}
                {filters.tags?.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleTagFilter(tag, false)}
                    />
                  </Badge>
                ))}
                {filters.hasVideos && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Has Videos
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleContentFilter('hasVideos', false)}
                    />
                  </Badge>
                )}
                {filters.hasLinks && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Has Links
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleContentFilter('hasLinks', false)}
                    />
                  </Badge>
                )}
              </div>
            )}

            {/* Results Grid */}
            {isSearching ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonLoader key={i} type="card" />
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedResults.map((result) => (
                  <ProductCard
                    key={result.id}
                    title={result.title}
                    description={result.description || ""}
                    category={result.categoryName}
                    tags={result.tags || []}
                    highlights={result.highlights || []}
                    onClick={() => navigate(`/product/${result.id}`)}
                  />
                ))}
              </div>
            ) : hasQuery || hasActiveFilters ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <p className="text-lg font-medium mb-2">No results found</p>
                  <p>Try adjusting your search terms or filters</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <p className="text-lg font-medium mb-2">Start searching</p>
                  <p>Enter a search term to find products and content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}