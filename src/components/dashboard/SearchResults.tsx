import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, SlidersHorizontal, X, Package, GraduationCap, FileText, BookOpen } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import type { UnifiedSearchResult, SearchResultType } from "@/hooks/useUnifiedSearch";

const typeConfig: Record<SearchResultType, { icon: React.ReactNode; label: string; color: string }> = {
  product: { icon: <Package className="h-4 w-4" />, label: 'Products', color: 'bg-primary/10 text-primary border-primary/20' },
  cmfas: { icon: <GraduationCap className="h-4 w-4" />, label: 'CMFAS', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' },
  script: { icon: <FileText className="h-4 w-4" />, label: 'Scripts', color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' },
  kb: { icon: <BookOpen className="h-4 w-4" />, label: 'Knowledge Base', color: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800' },
};

interface SearchResultsProps {
  query: string;
  results: UnifiedSearchResult[];
  resultCounts?: { total: number; product: number; cmfas: number; script: number; kb: number };
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
  onTypeFilter?: (type: string, checked: boolean) => void;
  onSetFilters: (filters: any) => void;
  onClearSearch?: () => void;
}

function ResultCard({ result }: { result: UnifiedSearchResult }) {
  const navigate = useNavigate();
  const config = typeConfig[result.type];

  return (
    <button
      onClick={() => navigate(result.route)}
      className="w-full text-left bg-card border border-border rounded-lg p-4 hover:shadow-md hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start gap-3">
        <span className="mt-1 text-muted-foreground group-hover:text-primary transition-colors">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
              {result.title}
            </h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${config.color}`}>
              {result.typeLabel}
            </span>
          </div>
          {result.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{result.description}</p>
          )}
          <div className="flex items-center gap-1.5 flex-wrap">
            {result.categoryName && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {result.categoryName}
              </Badge>
            )}
            {result.tags?.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

export function SearchResults({
  query,
  results,
  resultCounts,
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
  onTypeFilter,
  onSetFilters,
  onClearSearch
}: SearchResultsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex-1">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <h2 className="text-lg md:text-xl font-semibold">
            {isSearching ? "Searching..." : `${results.length} results`}
            {hasQuery && !isSearching && (
              <span className="text-muted-foreground font-normal"> for "{query}"</span>
            )}
          </h2>

          {onClearSearch && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSearch}
              className="flex items-center gap-1 bg-primary text-white hover:bg-primary/90"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onShowFilters(!showFilters)}
            className="lg:hidden"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">{activeFilterCount}</Badge>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <Select value={sortBy} onValueChange={onSortBy}>
            <SelectTrigger className="w-32 md:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="type">Type</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Type filter pills */}
      {resultCounts && onTypeFilter && (
        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.entries(typeConfig) as [SearchResultType, typeof typeConfig[SearchResultType]][]).map(([type, config]) => {
            const count = resultCounts[type];
            if (count === 0 && !filters.types?.includes(type)) return null;
            const isActive = filters.types?.includes(type);
            return (
              <button
                key={type}
                onClick={() => onTypeFilter(type, !isActive)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isActive ? config.color + ' ring-1 ring-offset-1' : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {config.icon}
                {config.label}
                <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.category && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {availableCategories.find((c: any) => c.id === filters.category)?.name}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onSetFilters((prev: any) => ({ ...prev, category: undefined }))} />
            </Badge>
          )}
          {filters.tags?.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              {tag}
              <X className="h-3 w-3 cursor-pointer" onClick={() => onTagFilter(tag, false)} />
            </Badge>
          ))}
        </div>
      )}

      {/* Results */}
      {isSearching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonLoader key={i} type="card" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {results.map((result) => (
            <ResultCard key={`${result.type}-${result.id}`} result={result} />
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
