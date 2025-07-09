import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { EnhancedSearchBar } from "@/components/EnhancedSearchBar";
import { CategoryCard } from "@/components/CategoryCard";
import { ContinueLearningCard } from "@/components/ContinueLearningCard";
import { UserStats } from "@/components/UserStats";
import { QuickActions } from "@/components/QuickActions";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { useAuth } from "@/hooks/useAuth";
import { useCategories, getCategoryIdFromName, useAllProducts } from "@/hooks/useProducts";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock } from "lucide-react";

// Configuration for category display (icons, gradients, etc.)
function getCategoryConfig(categoryName: string) {
  const configs: Record<string, { icon: string; gradient: string; productCount: number }> = {
    'Investment Products': {
      icon: '📈',
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
      productCount: 3
    },
    'Endowment Products': {
      icon: '💰',
      gradient: 'bg-gradient-to-r from-green-500 to-green-600',
      productCount: 2
    },
    'Whole Life Products': {
      icon: '🛡️',
      gradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
      productCount: 1
    },
    'Term Products': {
      icon: '⏳',
      gradient: 'bg-gradient-to-r from-orange-500 to-orange-600',
      productCount: 2
    },
    'Medical Insurance Products': {
      icon: '🏥',
      gradient: 'bg-gradient-to-r from-red-500 to-red-600',
      productCount: 2
    }
  };
  
  return configs[categoryName] || {
    icon: '📄',
    gradient: 'bg-gradient-to-r from-gray-500 to-gray-600',
    productCount: 0
  };
}

// Moved to QuickActions component

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const { allProducts, loading: productsLoading } = useAllProducts();
  const { getRecentProducts } = useRecentlyViewed();
  const [searchQuery, setSearchQuery] = useState("");

  // Get products with training videos for "Continue Learning" section
  const productsWithVideos = allProducts.filter(product => 
    product.training_videos && Array.isArray(product.training_videos) && product.training_videos.length > 0
  ).slice(0, 3);

  // Get recently viewed products
  const recentProducts = getRecentProducts();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Navigate to search results or implement inline search
    console.log('Searching for:', query);
  };

  const handleCategoryClick = (categoryName: string) => {
    const categoryId = getCategoryIdFromName(categoryName);
    navigate(`/category/${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        title="AIA Product Learning Platform"
        subtitle="Your comprehensive resource for product knowledge and sales excellence"
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* User Stats - Only show if logged in */}
        {user && (
          productsLoading ? (
            <SkeletonLoader type="stats" />
          ) : (
            <UserStats />
          )
        )}
        
        {/* Authentication Prompt - Only show if not logged in */}
        {!user && (
          <Card className="mb-8 border-primary/20 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">🚀 Unlock Your Learning Journey</h3>
                <p className="text-muted-foreground mb-4">
                  Sign in to track your progress, earn achievements, and level up your expertise!
                </p>
                <Button 
                  variant="hero" 
                  onClick={() => navigate('/auth')}
                  className="px-8"
                >
                  Sign In to Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Section */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Find What You Need</h2>
          <EnhancedSearchBar onSearch={handleSearch} />
        </div>

        {/* Recently Viewed Section */}
        {recentProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Recently Viewed</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Quick access to your history</span>
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {recentProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="hover:shadow-card transition-all cursor-pointer group"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <CardContent className="p-4">
                    <h4 className="font-medium truncate group-hover:text-primary transition-colors">
                      {product.title}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline" className="text-xs">
                        {product.categoryName}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Continue Learning Section */}
        {productsWithVideos.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-6">Continue Learning</h3>
            {productsLoading ? (
              <SkeletonLoader type="card" count={3} />
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
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
        )}

        {/* Quick Actions */}
        <div className="mb-12">
          <QuickActions />
        </div>

        {/* Product Categories */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-6">Product Categories</h3>
          {categoriesLoading ? (
            <SkeletonLoader type="card" count={6} />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const categoryConfig = getCategoryConfig(category.name);
                return (
                  <CategoryCard
                    key={category.id}
                    title={category.name}
                    description={category.description || ''}
                    icon={categoryConfig.icon}
                    productCount={categoryConfig.productCount}
                    gradient={categoryConfig.gradient}
                    onClick={() => handleCategoryClick(category.name)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Updates */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Recent Updates</h3>
          <Card className="bg-gradient-card">
            <CardHeader>
              <CardTitle>Platform Updates</CardTitle>
              <CardDescription>Stay updated with the latest product information and training materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div>
                    <p className="font-medium">New Video: Investment Product Overview</p>
                    <p className="text-sm text-muted-foreground">Added comprehensive training video for investment products</p>
                  </div>
                  <span className="text-sm text-muted-foreground">2 days ago</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div>
                    <p className="font-medium">Updated: Medical Insurance Brochures</p>
                    <p className="text-sm text-muted-foreground">Latest product brochures and benefit summaries</p>
                  </div>
                  <span className="text-sm text-muted-foreground">1 week ago</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">New: AI Assistant for Whole Life Products</p>
                    <p className="text-sm text-muted-foreground">Get instant answers about whole life product features</p>
                  </div>
                  <span className="text-sm text-muted-foreground">2 weeks ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}