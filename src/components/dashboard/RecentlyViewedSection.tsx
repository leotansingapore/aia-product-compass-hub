import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock } from "lucide-react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { getProductUrl, getCategorySlugFromId } from "@/utils/slugUtils";

export function RecentlyViewedSection() {
  const navigate = useNavigate();
  const { getRecentProducts } = useRecentlyViewed();
  const recentProducts = getRecentProducts();

  if (recentProducts.length === 0) {
    return null;
  }

  const handleProductClick = (product: any) => {
    // Use SEO-friendly URL if we have category_id
    if (product.category_id && product.title) {
      navigate(getProductUrl(product.category_id, product.title));
    } else {
      navigate(`/product/${product.id}`);
    }
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Recently Viewed</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Quick access to your history</span>
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        {recentProducts.map((product) => (
          <Card 
            key={product.id} 
            className="hover:shadow-card transition-all cursor-pointer group"
            onClick={() => handleProductClick(product)}
          >
            <CardContent className="p-4">
              <h4 className="font-medium truncate group-hover:text-primary transition-colors">
                {product.title}
              </h4>
              <p className="text-sm text-muted-foreground truncate mt-1">
                {product.description}
              </p>
              <div className="flex items-center justify-between mt-3">
                <Badge variant="outline" className="text-micro">
                  {product.categoryName}
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}