import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { EnhancedSearchBar } from "@/components/EnhancedSearchBar";
import { ProductCard } from "@/components/ProductCard";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { useProducts, getCategoryIdFromName } from "@/hooks/useProducts";
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
  const { products, loading } = useProducts(categoryId);
  const { addToRecent } = useRecentlyViewed();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const category = getCategoryInfo(categoryId || '');

  // Track category view
  useEffect(() => {
    if (categoryId) {
      addToRecent(categoryId, 'category');
    }
  }, [categoryId, addToRecent]);

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

  if (!category) {
    return <div>Category not found</div>;
  }

  if (loading) {
    return <SkeletonLoader type="category" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        title={category.title}
        subtitle={category.description}
        showBackButton
        onBack={() => window.history.back()}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: category.title }
        ]}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="mb-6">
            <EnhancedSearchBar 
              onSearch={handleSearch} 
              placeholder={`Search ${category.title.toLowerCase()}...`}
            />
          </div>
          
          {/* Tag Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-2">Filter by tags:</span>
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTagClick(tag)}
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredProducts.map((product, index) => (
            <div key={product.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-fade-in">
              <ProductCard
                title={product.title}
                description={product.description || ''}
                category={category.title}
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
  );
}