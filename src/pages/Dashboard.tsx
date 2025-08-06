import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useProducts";
import { NavigationHeader } from "@/components/NavigationHeader";
import { ProtectedSection } from "@/components/ProtectedSection";
import { ProtectedPage } from "@/components/ProtectedPage";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { HeroSearchCard } from "@/components/dashboard/HeroSearchCard";

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
        <meta name="description" content="Access your personalized dashboard with product categories, learning progress, and recommendations." />
      </Helmet>
      
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden md:block">
        <NavigationHeader 
          title="AIA Product Learning Platform"
          subtitle="Your comprehensive resource for product knowledge and sales excellence"
        />
      </div>
      
      {/* Simplified Layout for Testing */}
      <div className="max-w-md mx-auto md:max-w-7xl px-4 py-4 md:py-8 space-y-6 md:space-y-8">
        
        <ProtectedSection sectionId="dashboard-search">
          <HeroSearchCard onSearch={handleSearch} />
        </ProtectedSection>

        <ProtectedSection sectionId="dashboard-quick-actions">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <p className="text-muted-foreground">Feature tiles coming back...</p>
          </Card>
        </ProtectedSection>

      </div>
    </div>
    </ProtectedPage>
  );
}
