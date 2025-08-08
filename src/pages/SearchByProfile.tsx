import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { SearchBar } from "@/components/SearchBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const clientProfiles = [
  {
    id: 'young-professional',
    title: 'Young Professional (25-35)',
    description: 'Starting career, moderate income, looking for protection and savings',
    characteristics: ['Limited savings', 'Career growth potential', 'Basic protection needs'],
    recommendedProducts: [
      { name: 'Secure Flexi Term', category: 'Term', reason: 'Affordable high coverage during peak earning years' },
      { name: 'Smart Wealth Builder', category: 'Endowment', reason: 'Build disciplined savings habit' },
      { name: 'HealthShield Gold Max', category: 'Medical', reason: 'Comprehensive health protection' }
    ]
  },
  {
    id: 'growing-family',
    title: 'Growing Family (30-45)',
    description: 'Married with children, increased responsibilities, education planning',
    characteristics: ['Family protection priority', 'Education funding needs', 'Mortgage protection'],
    recommendedProducts: [
      { name: 'Pro Lifetime Protector', category: 'Investment', reason: 'Flexible premiums for changing income' },
      { name: 'Guaranteed Protect Plus', category: 'Whole Life', reason: 'Permanent family protection' },
      { name: 'Ultimate Critical Cover', category: 'Term', reason: 'Critical illness protection' }
    ]
  },
  {
    id: 'high-net-worth',
    title: 'High Net Worth (40+)',
    description: 'Established wealth, sophisticated needs, estate planning',
    characteristics: ['Estate planning focus', 'Tax efficiency needs', 'Legacy planning'],
    recommendedProducts: [
      { name: 'Pro Achiever', category: 'Investment', reason: 'Maximum flexibility and growth potential' },
      { name: 'Platinum Wealth Venture', category: 'Investment', reason: 'Premium investment solutions' },
      { name: 'Guaranteed Protect Plus', category: 'Whole Life', reason: 'Estate planning and wealth transfer' }
    ]
  },
  {
    id: 'pre-retiree',
    title: 'Pre-Retiree (50-65)',
    description: 'Nearing retirement, capital preservation, income planning',
    characteristics: ['Capital preservation', 'Income generation', 'Healthcare preparation'],
    recommendedProducts: [
      { name: 'Smart Wealth Builder', category: 'Endowment', reason: 'Guaranteed returns with capital protection' },
      { name: 'Retirement Saver', category: 'Endowment', reason: 'Structured retirement income' },
      { name: 'HealthShield Gold Max', category: 'Medical', reason: 'Enhanced medical coverage for aging' }
    ]
  },
  {
    id: 'business-owner',
    title: 'Business Owner (35-55)',
    description: 'Self-employed, irregular income, business succession needs',
    characteristics: ['Irregular income', 'Business protection', 'Key person insurance'],
    recommendedProducts: [
      { name: 'Pro Achiever', category: 'Investment', reason: 'Flexible premiums for irregular income' },
      { name: 'Secure Flexi Term', category: 'Term', reason: 'Business loan protection' },
      { name: 'Guaranteed Protect Plus', category: 'Whole Life', reason: 'Business succession planning' }
    ]
  }
];

const lifeEvents = [
  {
    event: 'Getting Married',
    products: ['Secure Flexi Term', 'Smart Wealth Builder'],
    reason: 'Start joint financial planning with basic protection'
  },
  {
    event: 'Having a Baby',
    products: ['Guaranteed Protect Plus', 'Smart Wealth Builder'],
    reason: 'Increase protection and start education savings'
  },
  {
    event: 'Buying a House',
    products: ['Secure Flexi Term', 'Ultimate Critical Cover'],
    reason: 'Mortgage protection and critical illness coverage'
  },
  {
    event: 'Career Advancement',
    products: ['Pro Achiever', 'Platinum Wealth Venture'],
    reason: 'Upgrade to premium products with higher coverage'
  },
  {
    event: 'Starting a Business',
    products: ['Pro Achiever', 'Secure Flexi Term'],
    reason: 'Flexible premiums and business protection'
  },
  {
    event: 'Planning Retirement',
    products: ['Retirement Saver', 'Smart Wealth Builder'],
    reason: 'Guaranteed income and capital preservation'
  }
];

export default function SearchByProfile() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleProfileClick = (profileId: string) => {
    setSelectedProfile(selectedProfile === profileId ? null : profileId);
  };

  const filteredProfiles = clientProfiles.filter(profile =>
    !searchQuery || 
    profile.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.characteristics.some(char => char.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Search by Client Profile - FINternship</title>
        <meta name="description" content="Find tailored product recommendations by client profile and life events." />
        <link rel="canonical" href={`${window.location.origin}/search-by-profile`} />
      </Helmet>
      <NavigationHeader 
        title="Search by Client Profile"
        subtitle="Find the right products for your client's life stage and needs"
        showBackButton
        onBack={() => navigate('/')}
      />
      
      <div className="max-w-6xl mx-auto px-1 sm:px-4 md:px-6 py-2 sm:py-6 md:py-8">
        
        {/* Search Section */}
        <div className="mb-6 sm:mb-8">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search by age, profession, life stage, or needs..."
          />
        </div>

        {/* Client Profiles */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">👥 Client Profiles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredProfiles.map((profile) => (
              <Card 
                key={profile.id} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-elegant ${
                  selectedProfile === profile.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleProfileClick(profile.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {profile.title}
                    <Badge variant="outline">
                      {selectedProfile === profile.id ? 'Hide' : 'Show'} Products
                    </Badge>
                  </CardTitle>
                  <CardDescription>{profile.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Key Characteristics:</h4>
                    <div className="flex flex-wrap gap-1">
                      {profile.characteristics.map((char, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {char}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {selectedProfile === profile.id && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <h4 className="font-medium mb-3">🎯 Recommended Products:</h4>
                      <div className="space-y-3">
                        {profile.recommendedProducts.map((product, index) => (
                          <div key={index} className="bg-accent/30 p-3 rounded-md">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{product.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {product.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{product.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Life Events */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">🎉 Life Events & Product Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lifeEvents.map((event, index) => (
              <Card key={index} className="hover:shadow-card transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">{event.event}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-sm">Recommended:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {event.products.map((product, productIndex) => (
                          <Badge key={productIndex} variant="secondary" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{event.reason}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 sm:mt-12 text-center">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Need More Specific Guidance?</h3>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md mx-auto">
            <Button variant="hero" onClick={() => navigate('/')}>
              Browse All Products
            </Button>
            <Button variant="outline" onClick={() => navigate('/how-to-use')}>
              How to Use Portal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}