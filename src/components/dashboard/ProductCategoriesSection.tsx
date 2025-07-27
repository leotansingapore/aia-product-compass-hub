import { CategoryCard } from "@/components/CategoryCard";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { ProtectedSection } from "@/components/ProtectedSection";
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
    <ProtectedSection sectionId="product-categories">
      <div className="mb-12">
        <h3 className="text-xl font-semibold mb-6">Product Categories</h3>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Learning modules have been removed</p>
        </div>
      </div>
    </ProtectedSection>
  );
}