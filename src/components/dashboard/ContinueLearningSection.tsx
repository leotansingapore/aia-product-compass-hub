import { useNavigate } from "react-router-dom";
import { ContinueLearningCard } from "@/components/ContinueLearningCard";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { getProductUrl } from "@/utils/slugUtils";
import type { Product } from "@/hooks/useProducts";

interface ContinueLearningSectionProps {
  productsWithVideos: Product[];
  loading: boolean;
}

export function ContinueLearningSection({ productsWithVideos, loading }: ContinueLearningSectionProps) {
  const navigate = useNavigate();

  if (productsWithVideos.length === 0) {
    return null;
  }

  const handleNavigate = (product: Product) => {
    navigate(getProductUrl(product.category_id, product.title));
  };

  return (
    <div className="mb-12">
      <h3 className="text-xl font-semibold mb-6">Continue Learning</h3>
      {loading ? (
        <SkeletonLoader type="card" count={3} />
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {productsWithVideos.map((product) => (
            <ContinueLearningCard 
              key={product.id} 
              product={product} 
              onNavigate={() => handleNavigate(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
}