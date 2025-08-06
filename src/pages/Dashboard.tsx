import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useCategories } from "@/hooks/useProducts";
import { NavigationHeader } from "@/components/NavigationHeader";
import { ProtectedSection } from "@/components/ProtectedSection";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useNavigate } from "react-router-dom";
import { HeroSearchCard } from "@/components/dashboard/HeroSearchCard";
import { FeatureTiles } from "@/components/dashboard/FeatureTiles";
import { LearningPathCards } from "@/components/dashboard/LearningPathCards";
import { QuickAccessPills } from "@/components/dashboard/QuickAccessPills";
import { RecentActivityFeed } from "@/components/dashboard/RecentActivityFeed";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, loading } = useCategories();

  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <ProtectedPage pageId="dashboard">
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Dashboard - AIA Product Compass Hub</title>
        <meta name="description" content="Access your personalized dashboard with product categories, learning progress, and recommendations. Navigate investment, endowment, whole life, term, and medical insurance products." />
      </Helmet>
      
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden md:block">
        <NavigationHeader 
          title="AIA Product Learning Platform"
          subtitle="Your comprehensive resource for product knowledge and sales excellence"
        />
      </div>
      
      {/* Mobile-First Tile Layout */}
      <div className="max-w-md mx-auto md:max-w-7xl px-4 py-4 md:py-8 space-y-6 md:space-y-8">
        
        {/* Hero Search Card */}
        <ProtectedSection sectionId="dashboard-search">
          <HeroSearchCard onSearch={handleSearch} />
        </ProtectedSection>

        {/* Feature Tiles - Quick Actions */}
        <ProtectedSection sectionId="dashboard-quick-actions">
          <FeatureTiles />
        </ProtectedSection>

        {/* Learning Path Cards */}
        <ProtectedSection sectionId="learning-paths">
          <LearningPathCards />
        </ProtectedSection>

        {/* Quick Access Pills - Categories */}
        <ProtectedSection sectionId="product-categories">
          <QuickAccessPills />
        </ProtectedSection>

        {/* Recent Activity Feed */}
        <ProtectedSection sectionId="recent-activity">
          <RecentActivityFeed />
        </ProtectedSection>

      </div>
    </div>
    </ProtectedPage>
  );
}
