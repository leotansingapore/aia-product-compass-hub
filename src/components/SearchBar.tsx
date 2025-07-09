import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSearch } from "@/hooks/useSearch";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  showResults?: boolean;
}

export function SearchBar({ onSearch, placeholder = "Search products, benefits, or client profiles...", showResults = true }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const { results, isSearching } = useSearch();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
    setShowDropdown(false);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowDropdown(value.length > 0 && showResults);
  };

  const handleResultClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setShowDropdown(false);
    setQuery('');
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setShowDropdown(query.length > 0 && showResults)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            className="pl-10 h-12 text-base"
          />
        </div>
        <Button type="submit" size="lg" className="h-12">
          Search
        </Button>
      </form>

      {/* Search Results Dropdown */}
      {showDropdown && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-2">
            {results.slice(0, 5).map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result.id)}
                className="w-full text-left p-3 hover:bg-muted rounded-lg transition-colors"
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
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            ))}
            {results.length > 5 && (
              <div className="text-center p-2 text-sm text-muted-foreground">
                +{results.length - 5} more results
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}