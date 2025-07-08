import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { SearchBar } from "@/components/SearchBar";
import { CategoryCard } from "@/components/CategoryCard";
import { UserStats } from "@/components/UserStats";
import { useAuth } from "@/hooks/useAuth";
import { useCategories, getCategoryIdFromName } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

const quickActions = [
  {
    title: 'How to Use This Portal',
    description: 'Get started with the learning platform',
    action: 'Learn More',
    route: '/how-to-use'
  },
  {
    title: 'Search by Client Profile',
    description: 'Find products for specific client needs',
    action: 'Search Now',
    route: '/search-by-profile'
  },
  {
    title: 'Sales Tools & Objection Handling',
    description: 'Access training materials and responses',
    action: 'Access Tools',
    route: '/sales-tools'
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
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
        {user && <UserStats />}
        
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
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-card transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(action.route)}
                  >
                    {action.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Product Categories */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-6">Product Categories</h3>
          {categoriesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
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