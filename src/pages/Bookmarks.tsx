import { Helmet } from "react-helmet-async";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useAllProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { NavigationHeader } from "@/components/NavigationHeader";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { Bookmark, BookmarkX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ProtectedPage } from "@/components/ProtectedPage";

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
    <ProtectedPage pageId="bookmarks">
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>My Bookmarks - Saved Resources | FINternship</title>
        <meta name="description" content="Access your saved products and training resources in one place. Quickly find your bookmarked insurance and investment products, guides, and materials for easy reference and continued learning." />
        <meta name="keywords" content="bookmarks, saved products, financial advisor resources, saved training materials, quick access" />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content="My Bookmarks - Saved Resources | FINternship" />
        <meta property="og:description" content="Access your saved products and training resources in one organized location for quick reference." />
        <meta property="og:type" content="webapp" />
        <meta property="og:url" content={`${window.location.origin}${window.location.pathname}`} />
        <meta property="og:image" content={`${window.location.origin}/og-default.jpg`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="My Bookmarks - Saved Resources | FINternship" />
        <meta name="twitter:description" content="Access your saved products and training resources in one organized location." />
        <meta name="twitter:image" content={`${window.location.origin}/og-default.jpg`} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
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
          })}
        </script>
      </Helmet>
      <NavigationHeader
        title="My Bookmarks"
        subtitle="Your saved products and resources"
        showBackButton={true}
        onBack={() => navigate('/')}
      />
      
      <div className="max-w-6xl mx-auto px-1 sm:px-4 md:px-6 py-2 sm:py-6 md:py-8">
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
    </div>
    </ProtectedPage>
  );
}