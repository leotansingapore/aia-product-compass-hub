import { useNavigate } from "react-router-dom";
import { ContinueLearningCard } from "@/components/ContinueLearningCard";
import { SkeletonLoader } from "@/components/SkeletonLoader";
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

  return (
    <div className="mb-12">
      <h3 className="text-xl font-semibold mb-6">Continue Learning</h3>
      {loading ? (
        <SkeletonLoader type="card" count={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {productsWithVideos.map((product) => (
            <ContinueLearningCard 
              key={product.id} 
              product={product} 
              onNavigate={() => navigate(`/product/${product.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}