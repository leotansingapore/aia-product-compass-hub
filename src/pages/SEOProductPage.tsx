import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { useProductBySlugOrId, useCategories } from "@/hooks/useProducts";
import { getCategoryIdFromSlug, getProductSlug, getVideoSlug, isDirectProductId } from "@/utils/slugUtils";
import ProductDetail from "./ProductDetail";
import VideoDetail from "./VideoDetail";

/**
 * SEOProductPage handles the new SEO-friendly URL structure:
 * - /[category-slug]/[product-slug] -> Product page
 * - /[category-slug]/[product-slug]/[lesson-slug] -> Video/lesson page
 */
export default function SEOProductPage() {
  const { categorySlug, productSlug, lessonSlug } = useParams<{
    categorySlug: string;
    productSlug: string;
    lessonSlug?: string;
  }>();
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategories();

  // Get category ID from slug
  const categoryId = getCategoryIdFromSlug(categorySlug || '');
  
  // Find the category to validate it exists
  const category = categories.find(c => c.id === categoryId);

  // If the categorySlug doesn't match a known category, this might not be a product URL
  // Let it fall through to 404 or other routes
  useEffect(() => {
    if (!categoriesLoading && categorySlug && !categoryId) {
      // Unknown category slug - navigate to 404
      navigate('/not-found', { replace: true });
    }
  }, [categoriesLoading, categorySlug, categoryId, navigate]);

  if (categoriesLoading) {
    return <SkeletonLoader type="product" />;
  }

  // If category doesn't exist, show 404-like state while redirecting
  if (!category) {
    return <SkeletonLoader type="product" />;
  }

  // Render appropriate component based on whether lesson/video is specified
  if (lessonSlug) {
    // This is a video/lesson page - render with video context
    return <SEOVideoPage categorySlug={categorySlug!} productSlug={productSlug!} lessonSlug={lessonSlug} />;
  }

  // This is a product page
  return <SEOProductDetail categorySlug={categorySlug!} productSlug={productSlug!} />;
}

interface SEOProductDetailProps {
  categorySlug: string;
  productSlug: string;
}

function SEOProductDetail({ categorySlug, productSlug }: SEOProductDetailProps) {
  // The productSlug needs to be converted to a format the existing hook can use
  // The hook already handles slug-to-title conversion via ilike query
  const { product, loading } = useProductBySlugOrId(productSlug);

  if (loading) {
    return <SkeletonLoader type="product" />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground">The requested product could not be found.</p>
        </div>
      </div>
    );
  }

  // Render the existing ProductDetail component
  // We need to provide context via URL params that ProductDetail expects
  return <ProductDetail />;
}

interface SEOVideoPageProps {
  categorySlug: string;
  productSlug: string;
  lessonSlug: string;
}

function SEOVideoPage({ categorySlug, productSlug, lessonSlug }: SEOVideoPageProps) {
  const { product, loading } = useProductBySlugOrId(productSlug);

  if (loading) {
    return <SkeletonLoader type="product" />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground">The requested product could not be found.</p>
        </div>
      </div>
    );
  }

  // Find the video by matching the lesson slug against video titles
  const videos = product.training_videos || [];
  const videoIndex = videos.findIndex(v => getVideoSlug(v.title) === lessonSlug);

  if (videoIndex === -1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Lesson Not Found</h1>
          <p className="text-muted-foreground">The requested lesson could not be found.</p>
        </div>
      </div>
    );
  }

  // Render the existing VideoDetail component
  return <VideoDetail />;
}
