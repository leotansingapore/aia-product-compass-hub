import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  highlights?: string[];
  category_id?: string;
}

interface ProductsGridProps {
  products: Product[];
  categoryName: string;
  categoryId?: string;
  onProductClick: (productId: string, productTitle: string, categoryId?: string) => void;
  onClearFilters?: () => void;
}

export function ProductsGrid({ 
  products, 
  categoryName,
  categoryId,
  onProductClick, 
  onClearFilters 
}: ProductsGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found matching your criteria.</p>
        {onClearFilters && (
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={onClearFilters}
          >
            Clear all filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 animate-fade-in">
      {products.map((product, index) => (
        <div key={product.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in h-full">
          <ProductCard
            title={product.title}
            description={product.description || ''}
            category={categoryName}
            tags={product.tags || []}
            highlights={product.highlights || []}
            onClick={() => onProductClick(product.id, product.title, product.category_id || categoryId)}
          />
        </div>
      ))}
    </div>
  );
}