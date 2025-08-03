import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  title: string;
  description: string;
  category: string;
  tags: string[];
  highlights: string[];
  onClick: () => void;
}

export function ProductCard({ title, description, category, tags, highlights, onClick }: ProductCardProps) {
  const categoryColors = {
    'Investment': 'bg-gradient-to-r from-blue-500 to-blue-600',
    'Endowment': 'bg-gradient-to-r from-green-500 to-green-600', 
    'Whole Life': 'bg-gradient-to-r from-purple-500 to-purple-600',
    'Term': 'bg-gradient-to-r from-orange-500 to-orange-600',
    'Medical': 'bg-gradient-to-r from-red-500 to-red-600'
  };

  return (
    <Card className="hover:shadow-elegant transition-all duration-300 hover:scale-105 cursor-pointer mobile-card" onClick={onClick}>
      <CardHeader className="p-3 md:p-6">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className={`text-xs md:text-sm ${categoryColors[category as keyof typeof categoryColors] || 'bg-primary'}`}>
            {category}
          </Badge>
        </div>
        <CardTitle className="text-base md:text-lg">{title}</CardTitle>
        <CardDescription className="text-sm md:text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 md:p-6">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1">
            {tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div>
            <h4 className="font-medium text-xs md:text-sm mb-2">Key Highlights:</h4>
            <ul className="text-xs md:text-sm text-muted-foreground space-y-1">
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