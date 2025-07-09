import { CategoryCard } from "@/components/CategoryCard";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { getCategoryConfig } from "@/utils/categoryConfig";
import type { Category } from "@/hooks/useProducts";

interface ProductCategoriesSectionProps {
  categories: Category[];
  loading: boolean;
  onCategoryClick: (categoryName: string) => void;
}

export function ProductCategoriesSection({ 
  categories, 
  loading, 
  onCategoryClick 
}: ProductCategoriesSectionProps) {
  return (
    <div className="mb-12">
      <h3 className="text-xl font-semibold mb-6">Product Categories</h3>
      {loading ? (
        <SkeletonLoader type="card" count={6} />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const categoryConfig = getCategoryConfig(category.name);
            return (
              <CategoryCard
                key={category.id}
                title={category.name}
                description={category.description || ''}
                icon={categoryConfig.icon}
                productCount={categoryConfig.productCount}
                gradient={categoryConfig.gradient}
                onClick={() => onCategoryClick(category.name)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}