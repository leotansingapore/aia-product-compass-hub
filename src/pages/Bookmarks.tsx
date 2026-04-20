import { useBookmarks } from "@/hooks/useBookmarks";
import { useAllProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { BookmarkX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ProtectedPage } from "@/components/ProtectedPage";
import { PageLayout, StructuredData } from "@/components/layout/PageLayout";

export default function Bookmarks() {
  const { bookmarks, loading: bookmarksLoading } = useBookmarks();
  const { allProducts, loading: productsLoading } = useAllProducts();
  const navigate = useNavigate();

  const loading = bookmarksLoading || productsLoading;

  // Get bookmarked products
  const bookmarkedProducts = allProducts.filter(product => 
    bookmarks.some(bookmark => bookmark.product_id === product.id)
  );

  if (loading) {
    return <SkeletonLoader type="dashboard" />;
  }

  const structuredData: StructuredData = {
    "@context": "https://schema.org" as const,
    "@type": "CollectionPage",
    "name": "My Bookmarks - FINternship",
    "description": "Personal collection of saved financial products and training resources",
    "url": `${window.location.origin}${window.location.pathname}`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "FINternship Learning Platform",
      "url": window.location.origin
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": bookmarkedProducts.length,
      "itemListElement": bookmarkedProducts.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Course",
          "name": product.title,
          "description": product.description || `Bookmarked training resource: ${product.title}`,
          "url": `${window.location.origin}/product/${product.id}`
        }
      }))
    }
  };

  return (
    <ProtectedPage pageId="bookmarks">
      <PageLayout
        title="My Bookmarks - Saved Resources | FINternship"
        description="Access your saved products and training resources in one place. Quickly find your bookmarked insurance and investment products, guides, and materials for easy reference and continued learning."
        keywords="bookmarks, saved products, financial advisor resources, saved training materials, quick access"
        structuredData={structuredData}
        openGraph={{
          title: "My Bookmarks - Saved Resources | FINternship",
          description: "Access your saved products and training resources in one organized location for quick reference.",
          type: "webapp"
        }}
      >
      <BrandedPageHeader
        title="📚 My Bookmarks"
        subtitle="Your saved products and resources"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "My Bookmarks" }
        ]}
      />

      <div className="mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        {bookmarkedProducts.length === 0 ? (
          <div className="text-center py-12">
            <BookmarkX className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No bookmarks yet</h2>
            <p className="text-muted-foreground mb-6">
              Save your favorite products to quickly access them later
            </p>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {bookmarkedProducts.map((product) => (
              <ProductCard
                key={product.id}
                title={product.title}
                description={product.description || ''}
                category={(product as any).categories?.name || ''}
                tags={product.tags || []}
                highlights={product.highlights || []}
                onClick={() => navigate(`/product/${product.id}`)}
              />
            ))}
          </div>
        )}
      </div>
      </PageLayout>
    </ProtectedPage>
  );
}