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

  // Debug controls for tour testing
  const handleDebugTour = () => {
    resetTour();
    setTimeout(() => {
      startOnboarding('basic');
      toast.success('Debug tour started!');
    }, 100);
  };

  const progress = getProgress();

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
        {/* Debug Tour Controls - Dev/Testing Only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-4 left-4 z-40 bg-background/90 backdrop-blur-sm p-3 rounded-lg border shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Bug className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Tour Debug</span>
              {progress > 0 && (
                <Badge variant="outline" className="text-xs">
                  {completedStepsCount}/{totalSteps}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDebugTour}
                disabled={isOnboardingActive}
                className="text-xs"
              >
                <Play className="w-3 h-3 mr-1" />
                Fresh Tour
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={resetTour}
                className="text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset
              </Button>
            </div>
          </div>
        )}

        {/* Search Section - Enhanced for onboarding */}
        <ProtectedSection sectionId="dashboard-search">
          <div className="text-center" data-onboarding="search">
            <h2 className="text-2xl font-bold mb-4">Find What You Need</h2>
            <div className="max-w-2xl mx-auto">
              <EnhancedSearchBar onSearch={handleSearch} />
              <p className="text-sm text-muted-foreground mt-2">
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
  );
}
