import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { NavigationHeader } from "@/components/NavigationHeader";
import { EnhancedSearchBar } from "@/components/EnhancedSearchBar";
import { ProductCard } from "@/components/ProductCard";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { ProtectedSection } from "@/components/ProtectedSection";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useProducts, useCategories } from "@/hooks/useProducts";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { products, loading } = useProducts(categoryId);
  const { addToRecent } = useRecentlyViewed();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Find the category by ID from the database
  const category = categories.find(cat => cat.id === categoryId);
  
  // Get category info for meta tags
  const categoryInfo = getCategoryInfo(categoryId || '');

  // Track category view
  useEffect(() => {
    if (categoryId && category?.id) {
      addToRecent(categoryId, 'category');
    }
  }, [categoryId, category?.id]);

  // Get all unique tags from products
  const allTags = Array.from(new Set(products.flatMap(product => product.tags || [])));

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => product.tags?.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return <SkeletonLoader type="category" />;
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Category not found</h1>
          <p className="text-muted-foreground mb-4">The category you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/')}
            className="text-primary hover:underline"
          >
            Go back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedPage pageId="product-category">
    <ProtectedSection sectionId={`product-category-${categoryId}`}>
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>{categoryInfo?.title || 'Product Category'} - AIA Product Compass Hub</title>
          <meta name="description" content={`Explore ${categoryInfo?.title.toLowerCase() || 'products'} - ${categoryInfo?.description || 'Comprehensive insurance and investment solutions'} with detailed guides, videos, and AI assistance.`} />
        </Helmet>
        <NavigationHeader 
          title={category.name}
          subtitle={category.description || ''}
          showBackButton
          onBack={() => window.history.back()}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: category.name }
          ]}
        />
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-8">
        {/* Search and Filters */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="mb-3 sm:mb-4 md:mb-6">
            <EnhancedSearchBar 
              onSearch={handleSearch} 
              placeholder={`Search ${category.name.toLowerCase()}...`}
            />
          </div>
          
          {/* Tag Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs md:text-sm font-medium text-muted-foreground mr-2">Filter by tags:</span>
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent/50 transition-colors mobile-touch-target text-xs md:text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  handleTagClick(tag);
                }}
              >
                {tag}
              </Badge>
            ))}
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTags([])}
                className="text-xs"
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 animate-fade-in">
          {filteredProducts.map((product, index) => (
            <div key={product.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in">
              <ProductCard
                title={product.title}
                description={product.description || ''}
                category={category.name}
                tags={product.tags || []}
                highlights={product.highlights || []}
                onClick={() => handleProductClick(product.id)}
              />
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedTags([]);
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
        </div>
      </div>
    </ProtectedSection>
    </ProtectedPage>
  );
}