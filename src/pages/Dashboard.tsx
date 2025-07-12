import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useProducts";
import { NavigationHeader } from "@/components/NavigationHeader";
import { EnhancedSearchBar } from "@/components/EnhancedSearchBar";
import { UserStats } from "@/components/UserStats";
import { QuickActions } from "@/components/QuickActions";
import { AuthPrompt } from "@/components/dashboard/AuthPrompt";
import { GettingStartedChecklist } from "@/components/onboarding/GettingStartedChecklist";

import { RecentlyViewedSection } from "@/components/dashboard/RecentlyViewedSection";
import { RecommendationsSection } from "@/components/recommendations/RecommendationsSection";
import { useNavigate } from "react-router-dom";
import { getCategoryIdFromName } from "@/hooks/useProducts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, loading } = useCategories();

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
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
      
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* User Stats or Auth Prompt */}
        {user ? <UserStats /> : <AuthPrompt />}

        {/* Search Section */}
        <div className="text-center" data-onboarding="search">
          <h2 className="text-2xl font-bold mb-4">Find What You Need</h2>
          <EnhancedSearchBar onSearch={handleSearch} />
        </div>

        {/* Quick Actions */}
        <div data-onboarding="profile-search">
          <QuickActions />
        </div>

        {/* Onboarding - Only show if logged in */}
        {user && <GettingStartedChecklist />}

        {/* Product Categories */}
        <div data-onboarding="categories">
          <h2 className="text-2xl font-bold mb-6">Product Categories</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-accent/20 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => handleCategoryClick(category.name)}
                  className="p-6 bg-card border rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
                  <p className="text-muted-foreground text-sm">{category.description || 'Explore products in this category'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User-specific sections - Only show if logged in */}
        {user && (
          <>
            <RecentlyViewedSection />
            <RecommendationsSection limit={6} />
          </>
        )}
      </div>
    </div>
  );
}