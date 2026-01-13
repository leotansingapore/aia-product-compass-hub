import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { SkeletonLoader } from "@/components/SkeletonLoader";

interface SearchResultsProps {
  query: string;
  results: any[];
  isSearching: boolean;
  hasQuery: boolean;
  hasActiveFilters: boolean;
  filters: any;
  showFilters: boolean;
  sortBy: string;
  activeFilterCount: number;
  availableCategories: any[];
  onShowFilters: (show: boolean) => void;
  onSortBy: (sort: string) => void;
  onTagFilter: (tag: string, checked: boolean) => void;
  onContentFilter: (type: 'hasVideos' | 'hasLinks', checked: boolean) => void;
  onSetFilters: (filters: any) => void;
  onClearSearch?: () => void;
}

export function SearchResults({
  query,
  results,
  isSearching,
  hasQuery,
  hasActiveFilters,
  filters,
  showFilters,
  sortBy,
  activeFilterCount,
  availableCategories,
  onShowFilters,
  onSortBy,
  onTagFilter,
  onContentFilter,
  onSetFilters,
  onClearSearch
}: SearchResultsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex-1">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <h2 className="text-lg md:text-xl font-semibold">
            {isSearching ? "Searching..." : `${results.length} results`}
            {hasQuery && !isSearching && (
              <span className="text-muted-foreground font-normal"> for "{query}"</span>
            )}
          </h2>

          {/* Clear Search Button */}
          {onClearSearch && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSearch}
              className="flex items-center gap-1 bg-primary text-white hover:bg-primary/90"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Clear Search</span>
            </Button>
          )}

          {/* Mobile Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShowFilters(!showFilters)}
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
          <Select value={sortBy} onValueChange={onSortBy}>
            <SelectTrigger className="w-32 md:w-40">
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
                onClick={() => onSetFilters(prev => ({ ...prev, category: undefined }))}
              />
            </Badge>
          )}
          {filters.tags?.map(tag => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onTagFilter(tag, false)}
              />
            </Badge>
          ))}
          {filters.hasVideos && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Has Videos
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onContentFilter('hasVideos', false)}
              />
            </Badge>
          )}
          {filters.hasLinks && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Has Links
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onContentFilter('hasLinks', false)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {results.map((result) => (
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
      ) : null}
    </div>
  );
}