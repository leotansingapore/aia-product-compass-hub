import { useState, useRef, useEffect } from "react";
import { Search, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSearch } from "@/hooks/useSearch";
import { useSemanticSearch } from "@/hooks/useSemanticSearch";

interface SearchHeroProps {
  onSearch: (query: string) => void;
  variant?: "default" | "compact";
}

export function SearchHero({ onSearch, variant = "default" }: SearchHeroProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getSearchSuggestions } = useSearch();
  const { searchHistory } = useSemanticSearch();

  const recentSearches = searchHistory.slice(0, 3);
  const suggestions = query.length > 0 ? getSearchSuggestions(query).slice(0, 5) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      console.log("SearchHero: Submitting search query:", query.trim());
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(value.length > 0);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.parentElement?.contains(event.target as Node)) {
        setTimeout(() => setShowSuggestions(false), 150);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const content = (
    <div className={variant === "compact" ? "space-y-3" : "space-y-4"}>
      {variant === "default" && (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Find What You Need</h2>
          <p className="text-sm text-muted-foreground">Search products, documents, and training materials</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(query.length > 0)}
              placeholder="Search products or training..."
              className={variant === "compact" ? "pl-10 h-10 text-base bg-white/90 text-foreground" : "pl-10 h-12 text-base bg-white text-foreground"}
              autoComplete="off"
            />
            
            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-[9999] max-h-60 overflow-y-auto pointer-events-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`suggestion-${index}-${suggestion}`}
                    type="button"
                    className={`w-full px-3 py-2 text-left cursor-pointer text-sm text-foreground hover:bg-muted transition-colors border-none bg-transparent ${
                      selectedIndex === index ? 'bg-muted' : ''
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      console.log("MouseDown on suggestion:", suggestion);
                      handleSuggestionClick(suggestion);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center gap-2 pointer-events-none">
                      <Search className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            type="submit"
            variant="outline"
            size={variant === "compact" ? "default" : "lg"}
            className={variant === "compact" ? "h-10 bg-white text-primary hover:bg-white hover:text-primary hover:shadow-md border-white" : "h-12 bg-white text-primary hover:bg-white hover:text-primary hover:shadow-md border-white"}
          >
            Search
          </Button>
        </form>

      {recentSearches.length > 0 && (
        <div className="space-y-2">
          <div className={`flex items-center gap-1 text-micro ${variant === "compact" ? "text-white/70" : "text-muted-foreground"}`}>
            <Clock className="h-3 w-3" />
            <span>Recent searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search) => (
              <Badge
                key={search}
                variant="secondary"
                className={`cursor-pointer text-micro text-primary ${variant === "compact" ? "bg-white/90 hover:bg-white" : "bg-white hover:bg-white/90"}`}
                onClick={() => {
                  console.log("SearchHero: Clicked recent search:", search);
                  onSearch(search);
                }}
              >
                {search}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (variant === "compact") {
    return content;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      {content}
    </Card>
  );
}