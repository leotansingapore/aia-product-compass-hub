import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/SearchBar";
import { NavigationHeader } from "@/components/NavigationHeader";
import { ProtectedPage } from "@/components/ProtectedPage";

export default function Dashboard() {
  const navigate = useNavigate();

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
        
        {/* Main Content */}
        <div className="max-w-md mx-auto md:max-w-7xl px-4 py-4 md:py-8 space-y-6 md:space-y-8">
          
          {/* Search Section */}
          <div className="text-center space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Find What You Need</h2>
              <p className="text-muted-foreground">Search products, documents, and training materials</p>
            </div>
            <SearchBar onSearch={handleSearch} />
          </div>

        </div>
      </div>
    </ProtectedPage>
  );
}
