import { useState, useRef, useEffect, useMemo } from "react";
import { Search, Package, GraduationCap, FileText, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUnifiedSearch, type UnifiedSearchResult, type SearchResultType } from "@/hooks/useUnifiedSearch";

interface SearchHeroProps {
  onSearch: (query: string) => void;
  variant?: "default" | "compact";
}

const typeIcons: Record<SearchResultType, React.ReactNode> = {
  product: <Package className="h-3.5 w-3.5 text-primary" />,
  cmfas: <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />,
  script: <FileText className="h-3.5 w-3.5 text-amber-600" />,
  kb: <BookOpen className="h-3.5 w-3.5 text-violet-600" />,
};

const typeBadgeColors: Record<SearchResultType, string> = {
  product: "bg-primary/10 text-primary",
  cmfas: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  script: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  kb: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
};

export function SearchHero({ onSearch, variant = "default" }: SearchHeroProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { getSuggestions } = useUnifiedSearch();

  const suggestions = useMemo(() => 
    query.length >= 2 ? getSuggestions(query) : [],
    [query, getSuggestions]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(value.length >= 2);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (result: UnifiedSearchResult) => {
    setQuery(result.title);
    setShowSuggestions(false);
    onSearch(result.title);
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
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const content = (
    <div className={variant === "compact" ? "space-y-2" : "space-y-3"}>
      {variant === "compact" && (
        <p className="text-sm text-muted-foreground text-center">Search products, CMFAS modules, scripts, and more</p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1" ref={containerRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(query.length >= 2)}
            placeholder="Search products, modules, scripts..."
            className={variant === "compact" ? "pl-10 h-10 text-base bg-white/90 text-foreground" : "pl-10 h-12 text-base bg-white text-foreground"}
            autoComplete="off"
          />

          {/* Rich Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-xl z-[9999] max-h-[400px] overflow-y-auto">
              {suggestions.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  type="button"
                  className={`w-full px-3 py-2.5 text-left cursor-pointer transition-colors border-none bg-transparent ${
                    selectedIndex === index ? 'bg-accent' : 'hover:bg-muted'
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSuggestionClick(result);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex-shrink-0">{typeIcons[result.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">{result.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${typeBadgeColors[result.type]}`}>
                          {result.typeLabel}
                        </span>
                      </div>
                      {result.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{result.description}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              <div className="px-3 py-2 border-t border-border">
                <button 
                  type="submit"
                  className="text-xs text-primary hover:underline bg-transparent border-none cursor-pointer"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (query.trim()) onSearch(query.trim());
                    setShowSuggestions(false);
                  }}
                >
                  See all results for "{query}"
                </button>
              </div>
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
    </div>
  );

  if (variant === "compact") {
    return content;
  }

  // Default mobile variant — slim pill-shaped bar
  return (
    <div className="px-1">
      {content}
    </div>
  );
}
