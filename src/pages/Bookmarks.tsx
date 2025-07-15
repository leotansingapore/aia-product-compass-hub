import { Helmet } from "react-helmet-async";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useAllProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { NavigationHeader } from "@/components/NavigationHeader";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { Bookmark, BookmarkX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>My Bookmarks - AIA Product Compass Hub</title>
        <meta name="description" content="Access your saved products and resources in one place. Quickly find your bookmarked AIA insurance and investment products for easy reference." />
      </Helmet>
      <NavigationHeader
        title="My Bookmarks"
        subtitle="Your saved products and resources"
        showBackButton={true}
        onBack={() => navigate('/')}
      />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}