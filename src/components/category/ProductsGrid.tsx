import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  highlights?: string[];
  published?: boolean;
}

interface ProductsGridProps {
  products: Product[];
  categoryName: string;
  onProductClick: (productId: string) => void;
  onClearFilters?: () => void;
  onEditProduct?: (productId: string, data: { title: string; description: string; tags: string[]; highlights: string[] }) => void;
  onDeleteProduct?: (productId: string) => void;
  onTogglePublish?: (productId: string, published: boolean) => void;
}

export function ProductsGrid({ 
  products, 
  categoryName, 
  onProductClick, 
  onClearFilters,
  onEditProduct,
  onDeleteProduct,
  onTogglePublish
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
            onClick={() => onProductClick(product.id)}
            productId={product.id}
            published={product.published}
            onEdit={onEditProduct}
            onDelete={onDeleteProduct}
            onTogglePublish={onTogglePublish}
          />
        </div>
      ))}
    </div>
  );
}
