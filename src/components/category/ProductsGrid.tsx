import { NestedProductsGrid, type NestedProduct } from "./NestedProductsGrid";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  highlights?: string[];
  published?: boolean;
  parent_product_id?: string | null;
  sort_order?: number;
}

interface ProductsGridProps {
  products: Product[];
  categoryName: string;
  onProductClick: (productId: string) => void;
  onClearFilters?: () => void;
  onEditProduct?: (productId: string, data: { title: string; description: string; tags: string[]; highlights: string[] }) => void;
  onDeleteProduct?: (productId: string) => void;
  onTogglePublish?: (productId: string, published: boolean) => void;
  onNestingChange?: () => void;
}

export function ProductsGrid({ 
  products, 
  categoryName, 
  onProductClick, 
  onClearFilters,
  onEditProduct,
  onDeleteProduct,
  onTogglePublish,
  onNestingChange,
}: ProductsGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-sm">No products found matching your search.</p>
        {onClearFilters && (
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={onClearFilters}
          >
            Clear search &amp; show all products
          </Button>
        )}
      </div>
    );
  }

  return (
    <NestedProductsGrid
      products={products as NestedProduct[]}
      categoryName={categoryName}
      onProductClick={onProductClick}
      onClearFilters={onClearFilters}
      onEditProduct={onEditProduct}
      onDeleteProduct={onDeleteProduct}
      onTogglePublish={onTogglePublish}
      onNestingChange={onNestingChange || (() => {})}
    />
  );
}
