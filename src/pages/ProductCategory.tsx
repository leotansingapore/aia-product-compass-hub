import { ProtectedSection } from "@/components/ProtectedSection";
import { CreateModuleForm } from "@/components/admin/CreateModuleForm";
import { usePermissions } from "@/hooks/usePermissions";
import { EnhancedSearchBar } from "@/components/EnhancedSearchBar";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { PageLayout, StructuredData } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { ProductsGrid } from "@/components/category/ProductsGrid";
import { useProductCategory } from "@/hooks/useProductCategory";


// Helper function to get category info for backward compatibility
function getCategoryInfo(categoryId: string) {
  const categoryInfo = {
    investment: {
      title: 'Investment Products',
      description: 'Grow your wealth with our range of investment-linked and guaranteed products',
      icon: '📈'
    },
    endowment: {
      title: 'Endowment Products', 
      description: 'Balanced solutions combining savings and protection for your financial goals',
      icon: '💰'
    },
    'whole-life': {
      title: 'Whole Life Products',
      description: 'Lifelong protection with cash value accumulation and estate planning benefits',
      icon: '🛡️'
    },
    term: {
      title: 'Term Products',
      description: 'Affordable life protection for specific periods and life stages',
      icon: '⏳'
    },
    medical: {
      title: 'Medical Insurance Products',
      description: 'Comprehensive health protection for you and your family',
      icon: '🏥'
    }
  };
  
  return categoryInfo[categoryId as keyof typeof categoryInfo];
}

export default function ProductCategory() {
  const {
    categorySlugOrId,
    categoryId,
    category,
    products: filteredProducts,
    loading,
    searchQuery,
    refetch,
    handleSearch,
    handleProductClick,
    clearFilters
  } = useProductCategory();
  
  const { isAdmin } = usePermissions();
  
  // Get category info for meta tags
  const categoryInfo = getCategoryInfo(categoryId || '');

  if (loading) {
    return <SkeletonLoader type="category" />;
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Category not found</h1>
          <p className="text-muted-foreground mb-4">
            The category "{categorySlugOrId}" doesn't exist. 
            Category ID: {categoryId}
          </p>
          <button 
            onClick={() => window.history.back()}
            className="text-primary hover:underline"
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  const structuredData: StructuredData = {
    "@context": "https://schema.org" as const,
    "@type": "CollectionPage",
    "name": `${categoryInfo?.title || 'Product Category'} Training`,
    "description": categoryInfo?.description || 'Professional financial product training resources',
    "url": `${window.location.origin}${window.location.pathname}`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "FINternship Learning Platform",
      "url": window.location.origin
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": filteredProducts.length,
      "itemListElement": filteredProducts.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Course",
          "name": product.title,
          "description": product.description || `Learn about ${product.title}`,
          "url": `${window.location.origin}/product/${product.id}`,
          "courseMode": "online",
          "educationalLevel": "professional"
        }
      }))
    }
  };

  return (
    <PageLayout
      title={`${categoryInfo?.title || 'Product Category'} - Training & Resources | FINternship`}
      description={`Master ${categoryInfo?.title.toLowerCase() || 'products'} with comprehensive training resources. ${categoryInfo?.description || 'Professional insurance and investment solutions'} featuring expert guides, training videos, and AI assistance.`}
      keywords={`${categoryInfo?.title.toLowerCase() || 'products'}, financial advisor training, product knowledge, insurance training, investment education`}
      structuredData={structuredData}
      openGraph={{
        title: `${categoryInfo?.title || 'Product Category'} - Training & Resources | FINternship`,
        description: `Master ${categoryInfo?.title.toLowerCase() || 'products'} with comprehensive training resources and expert guidance.`,
        type: "section"
      }}
    >
      <BrandedPageHeader
        title={categoryInfo?.icon ? `${categoryInfo.icon} ${categoryInfo.title}` : category.name}
        subtitle={categoryInfo?.description || category.description}
        showBackButton
        onBack={() => window.history.back()}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: category.name }
        ]}
      />

      <div className="mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Admin Module Creation */}
        {isAdmin() && categoryId && (
          <CreateModuleForm 
            categoryId={categoryId} 
            onModuleCreated={refetch}
          />
        )}

        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8">
          <EnhancedSearchBar
            onSearch={handleSearch}
            placeholder={`Search ${category.name.toLowerCase()}...`}
          />
        </div>

        <ProductsGrid
          products={filteredProducts}
          categoryName={category.name}
          onProductClick={handleProductClick}
          onClearFilters={clearFilters}
        />
      </div>
    </PageLayout>
  );
}