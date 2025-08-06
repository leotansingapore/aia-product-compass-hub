import { useState } from "react";
import { Search, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SearchHeroProps {
  onSearch: (query: string) => void;
}

export function SearchHero({ onSearch }: SearchHeroProps) {
  const [query, setQuery] = useState("");
  
  const recentSearches = ["Pro Achiever", "Medical Insurance", "Term Life"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      console.log("SearchHero: Submitting search query:", query.trim());
      onSearch(query.trim());
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Find What You Need</h2>
          <p className="text-sm text-muted-foreground">Search products, documents, and training materials</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products or training..."
              className="pl-10 h-12 text-base"
            />
          </div>
          <Button type="submit" size="lg" className="h-12">
            Search
          </Button>
        </form>

        {recentSearches.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Recent searches</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search) => (
                <Badge 
                  key={search}
                  variant="secondary" 
                  className="cursor-pointer hover:bg-secondary/80 text-xs"
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
    </Card>
  );
}