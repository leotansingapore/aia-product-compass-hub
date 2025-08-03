import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useCategories } from "@/hooks/useProducts";
import { NavigationHeader } from "@/components/NavigationHeader";
import { EnhancedSearchBar } from "@/components/EnhancedSearchBar";
import { UserStats } from "@/components/UserStats";
import { QuickActions } from "@/components/QuickActions";
import { AuthPrompt } from "@/components/dashboard/AuthPrompt";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, Bug } from "lucide-react";
import { toast } from "sonner";

import { RecentlyViewedSection } from "@/components/dashboard/RecentlyViewedSection";
import { RecommendationsSection } from "@/components/recommendations/RecommendationsSection";
import { ProductCategoriesSection } from "@/components/dashboard/ProductCategoriesSection";
import { ProtectedSection } from "@/components/ProtectedSection";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useNavigate } from "react-router-dom";
import { getCategoryIdFromName } from "@/hooks/useProducts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, loading } = useCategories();
  const { 
    startOnboarding, 
    resetTour, 
    getProgress, 
    completedStepsCount, 
    totalSteps,
    isOnboardingActive 
  } = useOnboarding();

  // Debug logging
  console.log('Dashboard - Categories:', categories.length, 'Loading:', loading);

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleCategoryClick = (categoryName: string) => {
    const categoryId = getCategoryIdFromName(categoryName);
    navigate(`/category/${categoryId}`);
  };


  const progress = getProgress();

  return (
    <ProtectedPage pageId="dashboard">
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Dashboard - AIA Product Compass Hub</title>
        <meta name="description" content="Access your personalized dashboard with product categories, learning progress, and recommendations. Navigate investment, endowment, whole life, term, and medical insurance products." />
      </Helmet>
      <NavigationHeader 
        title="AIA Product Learning Platform"
        subtitle="Your comprehensive resource for product knowledge and sales excellence"
      />
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-8 space-y-4 sm:space-y-6 md:space-y-8">

        {/* Search Section - Enhanced for onboarding */}
        <ProtectedSection sectionId="dashboard-search">
          <div className="text-center px-2 sm:px-3" data-onboarding="search">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4">Find What You Need</h2>
            <div className="max-w-2xl mx-auto">
              <EnhancedSearchBar onSearch={handleSearch} />
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Search for products, documents, training materials, and more
              </p>
            </div>
          </div>
        </ProtectedSection>

        {/* Quick Actions - Enhanced for onboarding */}
        <ProtectedSection sectionId="dashboard-quick-actions">
          <div data-onboarding="profile-search">
            <QuickActions />
          </div>
        </ProtectedSection>

        {/* User Stats */}
        <ProtectedSection sectionId="dashboard-user-stats">
          {user ? <UserStats /> : <AuthPrompt />}
        </ProtectedSection>

        {/* Product Categories - Enhanced for onboarding */}
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
    </ProtectedPage>
  );
}
