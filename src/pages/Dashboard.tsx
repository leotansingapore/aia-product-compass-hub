import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { EnhancedSearchBar } from "@/components/EnhancedSearchBar";
import { UserStats } from "@/components/UserStats";
import { QuickActions } from "@/components/QuickActions";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { AuthPrompt } from "@/components/dashboard/AuthPrompt";
import { RecentlyViewedSection } from "@/components/dashboard/RecentlyViewedSection";
import { ContinueLearningSection } from "@/components/dashboard/ContinueLearningSection";
import { ProductCategoriesSection } from "@/components/dashboard/ProductCategoriesSection";
import { RecentUpdatesSection } from "@/components/dashboard/RecentUpdatesSection";
import { LearningAnalyticsDashboard } from "@/components/dashboard/LearningAnalyticsDashboard";
import { RecommendationsSection } from "@/components/recommendations/RecommendationsSection";
import { useAuth } from "@/hooks/useAuth";
import { useCategories, getCategoryIdFromName, useAllProducts } from "@/hooks/useProducts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const { allProducts, loading: productsLoading } = useAllProducts();
  const [searchQuery, setSearchQuery] = useState("");

  // Get products with training videos for "Continue Learning" section
  const productsWithVideos = allProducts.filter(product => 
    product.training_videos && Array.isArray(product.training_videos) && product.training_videos.length > 0
  ).slice(0, 3);

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
        {!user && <AuthPrompt />}

        {/* Search Section */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Find What You Need</h2>
          <EnhancedSearchBar onSearch={handleSearch} />
        </div>

        {/* Analytics Dashboard - Only show if logged in */}
        {user && (
          <div className="mb-12">
            <LearningAnalyticsDashboard />
          </div>
        )}

        {/* Personalized Recommendations */}
        <div className="mb-12">
          <RecommendationsSection limit={6} />
        </div>


        {/* Recently Viewed Section */}
        <RecentlyViewedSection />

        {/* Continue Learning Section */}
        <ContinueLearningSection 
          productsWithVideos={productsWithVideos}
          loading={productsLoading}
        />

        {/* Quick Actions */}
        <div className="mb-12">
          <QuickActions />
        </div>

        {/* Product Categories */}
        <ProductCategoriesSection 
          categories={categories}
          loading={categoriesLoading}
          onCategoryClick={handleCategoryClick}
        />

        {/* Recent Updates */}
        <RecentUpdatesSection />
      </div>
    </div>
  );
}