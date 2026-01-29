import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useBookmarks } from "@/hooks/useBookmarks";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  title: string;
  description: string;
  category: string;
  tags: string[];
  highlights: string[];
  onClick: () => void;
  productId?: string;
}

export function ProductCard({ title, description, category, tags, highlights, onClick, productId }: ProductCardProps) {
  const { isBookmarked, toggleBookmark, loading } = useBookmarks();
  
  const categoryColors = {
    'Investment': 'bg-gradient-to-r from-blue-500 to-blue-600',
    'Endowment': 'bg-gradient-to-r from-green-500 to-green-600', 
    'Whole Life': 'bg-gradient-to-r from-purple-500 to-purple-600',
    'Term': 'bg-gradient-to-r from-orange-500 to-orange-600',
    'Medical': 'bg-gradient-to-r from-red-500 to-red-600'
  };

  const bookmarked = productId ? isBookmarked(productId) : false;

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (productId) {
      toggleBookmark(productId);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer mobile-card h-full flex flex-col" onClick={onClick}>
      <CardHeader className="p-3 md:p-6">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className={`text-xs px-2 text-white ${categoryColors[category as keyof typeof categoryColors] || 'bg-primary'}`}>
            {category}
          </Badge>
          {productId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmarkClick}
              disabled={loading}
              className={cn(
                "h-8 w-8 p-0 hover:bg-muted",
                bookmarked && "text-primary"
              )}
            >
              {bookmarked ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <CardTitle className="text-card-title">{title}</CardTitle>
        <CardDescription className="text-card-description">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 md:p-6 flex-1 flex flex-col justify-end">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs px-2">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div>
            <h4 className="font-medium text-micro md:text-sm mb-2">Key Highlights:</h4>
            <ul className="text-micro md:text-sm text-muted-foreground space-y-1">
              {highlights.slice(0, 3).map((highlight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-success mr-2">•</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
          
          <Button variant="outline" className="w-full mt-4 mobile-touch-target">
            Learn More
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
