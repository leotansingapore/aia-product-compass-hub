import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { useProductBySlugOrId } from "@/hooks/useProducts";
import { getProductUrl } from "@/utils/slugUtils";

/**
 * ProductRedirect handles backward compatibility for old /product/[id] URLs
 * by redirecting to the new SEO-friendly /[category]/[product] format
 */
export default function ProductRedirect() {
  const { productSlugOrId } = useParams<{ productSlugOrId: string }>();
  const navigate = useNavigate();
  const { product, loading } = useProductBySlugOrId(productSlugOrId || '');

  useEffect(() => {
    if (!loading && product) {
      // Generate SEO-friendly URL and redirect
      const newUrl = getProductUrl(product.category_id, product.title);
      navigate(newUrl, { replace: true });
    }
  }, [product, loading, navigate]);

  if (loading) {
    return <SkeletonLoader type="product" />;
  }

  // If product not found, let the redirect happen naturally to 404
  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  return <SkeletonLoader type="product" />;
}
