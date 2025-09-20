import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

interface Category {
  id: string;
  name: string;
}

interface SearchFiltersProps {
  filters: any;
  activeFilterCount: number;
  hasActiveFilters: boolean;
  availableCategories: Category[];
  availableTags: string[];
  onCategoryFilter: (categoryId: string, checked: boolean) => void;
  onTagFilter: (tag: string, checked: boolean) => void;
  onContentFilter: (type: 'hasVideos' | 'hasLinks', checked: boolean) => void;
  onClearFilters: () => void;
}

export function SearchFilters({
  filters,
  activeFilterCount,
  hasActiveFilters,
  availableCategories,
  availableTags,
  onCategoryFilter,
  onTagFilter,
  onContentFilter,
  onClearFilters
}: SearchFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base md:text-lg">Filters</CardTitle>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">{activeFilterCount}</Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
            >
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 md:space-y-6">
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
                    onCategoryFilter(category.id, Boolean(checked))
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
                  onContentFilter('hasVideos', Boolean(checked))
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
                  onContentFilter('hasLinks', Boolean(checked))
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
                      onTagFilter(tag, Boolean(checked))
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
  );
}