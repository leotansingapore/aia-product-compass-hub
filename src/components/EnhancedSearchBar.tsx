import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, Clock, X, Keyboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSearch } from "@/hooks/useSearch";

interface EnhancedSearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  showResults?: boolean;
}

export function EnhancedSearchBar({ 
  onSearch, 
  placeholder = "Search products, benefits, or client profiles...", 
  showResults = true 
}: EnhancedSearchBarProps) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, isSearching, setQuery: setSearchQuery } = useSearch();
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const recent = localStorage.getItem('recentSearches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setShowDropdown(true);
      }
      
      // Escape to close dropdown
      if (e.key === 'Escape') {
        setShowDropdown(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update search query when input changes
  useEffect(() => {
    setSearchQuery(query);
  }, [query, setSearchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query);
    }
  };

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      // Save to recent searches
      const newRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));
      
      onSearch?.(searchQuery);
      setShowDropdown(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    setShowDropdown(value.length > 0 || recentSearches.length > 0);
  };

  const handleResultClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setShowDropdown(false);
    setQuery('');
  };

  const removeRecentSearch = (searchToRemove: string) => {
    const newRecent = recentSearches.filter(s => s !== searchToRemove);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    const totalItems = results.length + recentSearches.length;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < recentSearches.length) {
            handleSearch(recentSearches[selectedIndex]);
          } else {
            const resultIndex = selectedIndex - recentSearches.length;
            if (results[resultIndex]) {
              handleResultClick(results[resultIndex].id);
            }
          }
        } else if (query.trim()) {
          handleSubmit(e);
        }
        break;
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setShowDropdown(query.length > 0 || recentSearches.length > 0)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            onKeyDown={handleKeyDown}
            className="pl-10 pr-16 h-12 text-base border-2 focus:border-primary transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-70">
              <Keyboard className="h-3 w-3" />
              ⌘K
            </kbd>
          </div>
        </div>
        <Button type="submit" size="lg" className="h-12 px-6">
          Search
        </Button>
      </form>

      {/* Enhanced Search Results Dropdown */}
      {showDropdown && showResults && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-hidden border-2 shadow-elegant">
          <CardContent className="p-0">
            
            {/* Recent Searches */}
            {recentSearches.length > 0 && query.length === 0 && (
              <div className="p-3 border-b">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Recent Searches</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllRecent}
                    className="h-6 text-xs"
                  >
                    Clear all
                  </Button>
                </div>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={search}
                      onClick={() => handleSearch(search)}
                      className={`w-full flex items-center justify-between p-2 text-left rounded-md hover:bg-muted transition-colors ${
                        selectedIndex === index ? 'bg-muted' : ''
                      }`}
                    >
                      <span className="text-sm">{search}</span>
                      <X 
                        className="h-3 w-3 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeRecentSearch(search);
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <div className="max-h-64 overflow-y-auto">
                {recentSearches.length > 0 && query.length > 0 && <Separator />}
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      {results.length} result{results.length !== 1 ? 's' : ''}
                    </span>
                    {isSearching && (
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs text-muted-foreground">Searching...</span>
                      </div>
                    )}
                  </div>
                  {results.slice(0, 5).map((result, index) => {
                    const adjustedIndex = recentSearches.length + index;
                    return (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedIndex === adjustedIndex ? 'bg-muted' : 'hover:bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{result.title}</h4>
                            <p className="text-sm text-muted-foreground truncate">
                              {result.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {result.categoryName}
                              </Badge>
                              {result.tags?.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground ml-2 flex-shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                  {results.length > 5 && (
                    <div className="text-center p-2 text-sm text-muted-foreground border-t">
                      +{results.length - 5} more results
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No Results */}
            {query.length > 0 && results.length === 0 && !isSearching && (
              <div className="p-6 text-center">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">No results found for "{query}"</p>
                <p className="text-xs text-muted-foreground">Try different keywords or browse categories</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}