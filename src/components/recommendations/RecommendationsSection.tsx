import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Heart, TrendingUp } from "lucide-react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useNavigate } from "react-router-dom";

interface RecommendationsSectionProps {
  limit?: number;
  showHeader?: boolean;
}

export function RecommendationsSection({ limit = 6, showHeader = true }: RecommendationsSectionProps) {
  const { getPersonalizedRecommendations, loading } = useRecommendations();
  const navigate = useNavigate();
  
  const recommendations = getPersonalizedRecommendations(limit);

  if (loading || recommendations.length === 0) {
    return null;
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'similar':
        return <Heart className="h-4 w-4" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4" />;
      case 'complementary':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'similar':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'trending':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'complementary':
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'popular':
        return 'bg-orange-500/10 text-orange-700 border-orange-200';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg md:text-xl font-bold">Recommended for You</h2>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {recommendations.map((recommendation) => (
          <Card 
            key={recommendation.id} 
            className="hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => navigate(`/product/${recommendation.id}`)}
          >
            <CardHeader className="p-3 pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm md:text-base group-hover:text-primary transition-colors line-clamp-2">
                  {recommendation.title}
                </CardTitle>
                <div className={`p-1 rounded-md ${getRecommendationColor(recommendation.type)} hidden sm:block`}>
                  {getRecommendationIcon(recommendation.type)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-3 pt-0 space-y-3">
              
              {/* Recommendation Reason - Priority on mobile */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5">
                <Sparkles className="h-3 w-3 text-primary flex-shrink-0" />
                <span className="text-micro text-primary font-medium line-clamp-1">
                  {recommendation.reason}
                </span>
              </div>

              {/* Category - Mobile optimized */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-micro">
                  {recommendation.categoryName}
                </Badge>
              </div>

              {/* Action Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
              >
                <span className="text-micro">Explore</span>
                <ArrowRight className="h-3 w-3 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Show more recommendations link */}
      {recommendations.length >= limit && (
        <div className="text-center pt-4">
          <Button variant="outline">
            View More Recommendations
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}