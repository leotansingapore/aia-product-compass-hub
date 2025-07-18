import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useProducts";
import { NavigationHeader } from "@/components/NavigationHeader";
import { EnhancedSearchBar } from "@/components/EnhancedSearchBar";
import { UserStats } from "@/components/UserStats";
import { QuickActions } from "@/components/QuickActions";
import { AuthPrompt } from "@/components/dashboard/AuthPrompt";

import { RecentlyViewedSection } from "@/components/dashboard/RecentlyViewedSection";
import { RecommendationsSection } from "@/components/recommendations/RecommendationsSection";
import { ProductCategoriesSection } from "@/components/dashboard/ProductCategoriesSection";
import { ProtectedSection } from "@/components/ProtectedSection";
import { useNavigate } from "react-router-dom";
import { getCategoryIdFromName } from "@/hooks/useProducts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, loading } = useCategories();

  // Debug logging
  console.log('Dashboard - Categories:', categories.length, 'Loading:', loading);

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleCategoryClick = (categoryName: string) => {
    const categoryId = getCategoryIdFromName(categoryName);
    navigate(`/category/${categoryId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Dashboard - AIA Product Compass Hub</title>
        <meta name="description" content="Access your personalized dashboard with product categories, learning progress, and recommendations. Navigate investment, endowment, whole life, term, and medical insurance products." />
      </Helmet>
      <NavigationHeader 
        title="AIA Product Learning Platform"
        subtitle="Your comprehensive resource for product knowledge and sales excellence"
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        

        {/* Search Section */}
        <ProtectedSection sectionId="dashboard-search">
          <div className="text-center" data-onboarding="search">
            <h2 className="text-2xl font-bold mb-4">Find What You Need</h2>
            <EnhancedSearchBar onSearch={handleSearch} />
          </div>
        </ProtectedSection>

        {/* Quick Actions */}
        <ProtectedSection sectionId="dashboard-quick-actions">
          <div data-onboarding="profile-search">
            <QuickActions />
          </div>
        </ProtectedSection>

        {/* User Stats */}
        <ProtectedSection sectionId="dashboard-user-stats">
          {user ? <UserStats /> : <AuthPrompt />}
        </ProtectedSection>

        {/* Product Categories */}
        <ProtectedSection sectionId="product-categories">
          <div data-onboarding="categories">
            <ProductCategoriesSection 
              categories={categories}
              loading={loading}
              onCategoryClick={handleCategoryClick}
            />
          </div>
        </ProtectedSection>

        {/* User-specific sections - Only show if logged in */}
        {user && (
          <>
            <ProtectedSection sectionId="dashboard-recently-viewed">
              <RecentlyViewedSection />
            </ProtectedSection>
            <ProtectedSection sectionId="dashboard-recommendations">
              <RecommendationsSection limit={6} />
            </ProtectedSection>
          </>
        )}
      </div>
    </div>
  );
}