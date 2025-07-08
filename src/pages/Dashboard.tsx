import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { SearchBar } from "@/components/SearchBar";
import { CategoryCard } from "@/components/CategoryCard";
import { UserStats } from "@/components/UserStats";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const categories = [
  {
    id: 'investment',
    title: 'Investment Products',
    description: 'Growth-focused solutions for wealth building',
    icon: '📈',
    productCount: 3,
    gradient: 'bg-gradient-to-r from-blue-500 to-blue-600'
  },
  {
    id: 'endowment',
    title: 'Endowment Products', 
    description: 'Balanced savings and protection plans',
    icon: '💰',
    productCount: 1,
    gradient: 'bg-gradient-to-r from-green-500 to-green-600'
  },
  {
    id: 'whole-life',
    title: 'Whole Life Products',
    description: 'Lifelong protection with cash value',
    icon: '🛡️',
    productCount: 1,
    gradient: 'bg-gradient-to-r from-purple-500 to-purple-600'
  },
  {
    id: 'term',
    title: 'Term Products',
    description: 'Affordable protection for specific periods',
    icon: '⏳',
    productCount: 1,
    gradient: 'bg-gradient-to-r from-orange-500 to-orange-600'
  },
  {
    id: 'medical',
    title: 'Medical Insurance Products',
    description: 'Comprehensive health protection',
    icon: '🏥',
    productCount: 1,
    gradient: 'bg-gradient-to-r from-red-500 to-red-600'
  }
];

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
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement search functionality
    console.log('Searching for:', query);
  };

  const handleCategoryClick = (categoryId: string) => {
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                title={category.title}
                description={category.description}
                icon={category.icon}
                productCount={category.productCount}
                gradient={category.gradient}
                onClick={() => handleCategoryClick(category.id)}
              />
            ))}
          </div>
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