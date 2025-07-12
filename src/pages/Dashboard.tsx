import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { EnhancedSearchBar } from "@/components/EnhancedSearchBar";
import { UserStats } from "@/components/UserStats";
import { QuickActions } from "@/components/QuickActions";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { AuthPrompt } from "@/components/dashboard/AuthPrompt";
import { DragDropDashboard } from "@/components/dashboard/DragDropDashboard";
import { GettingStartedChecklist } from "@/components/onboarding/GettingStartedChecklist";
import { ProgressiveDisclosure } from "@/components/onboarding/ProgressiveDisclosure";
import { useAuth } from "@/hooks/useAuth";
import { getCategoryIdFromName } from "@/hooks/useProducts";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Navigate to search results page
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
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* User Stats - Only show if logged in */}
        {user ? (
          <UserStats />
        ) : (
          <AuthPrompt />
        )}

        {/* Search Section */}
        <div className="text-center mb-12" data-onboarding="search">
          <h2 className="text-2xl font-bold mb-4">Find What You Need</h2>
          <EnhancedSearchBar onSearch={handleSearch} />
        </div>

        {/* Quick Actions */}
        <div className="mb-12" data-onboarding="profile-search">
          <QuickActions />
        </div>

        {/* Onboarding Components - Only show if logged in */}
        {user && (
          <>
            <GettingStartedChecklist />
            <ProgressiveDisclosure />
          </>
        )}

        {/* Drag & Drop Dashboard - Only show if logged in */}
        {user ? (
          <div data-onboarding="categories">
            <DragDropDashboard onCategoryClick={handleCategoryClick} />
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Sign in to access personalized dashboard features</p>
          </div>
        )}
      </div>
    </div>
  );
}