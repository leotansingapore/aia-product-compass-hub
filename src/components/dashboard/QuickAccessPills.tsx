import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useCategories } from "@/hooks/useProducts";
import { getCategorySlug } from "@/utils/slugUtils";

export function QuickAccessPills() {
  const navigate = useNavigate();
  const { categories, loading } = useCategories();

  const handleCategoryClick = (categoryName: string) => {
    const slug = getCategorySlug(categoryName);
    navigate(`/category/${slug}`);
  };

  if (loading || categories.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Product Categories</h3>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors flex-shrink-0 px-4 py-2 text-sm active:scale-95"
            onClick={() => handleCategoryClick(category.name)}
          >
            {category.name}
          </Badge>
        ))}
      </div>
    </div>
  );
}