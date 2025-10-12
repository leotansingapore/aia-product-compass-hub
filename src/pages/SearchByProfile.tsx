import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
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
      <BrandedPageHeader
        title="👥 Search by Client Profile"
        subtitle="Find the right products for your client's life stage and needs"
        showBackButton
        onBack={() => navigate('/')}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Client Profiles" }
        ]}
      />

      <div className="mx-auto px-1 sm:px-4 md:px-6 py-2 sm:py-6 md:py-8">
        
        {/* Search Section */}
        <div className="mb-6 sm:mb-8">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search by age, profession, life stage, or needs..."
          />
        </div>

        {/* Client Profiles */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-primary rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-semibold">Client Profiles</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {filteredProfiles.map((profile) => (
              <Card
                key={profile.id}
                className={`cursor-pointer transition-all duration-300 bg-gradient-card hover:shadow-elegant hover:scale-[1.01] ${
                  selectedProfile === profile.id ? 'ring-2 ring-primary shadow-elegant' : 'hover:border-primary/30'
                }`}
                onClick={() => handleProfileClick(profile.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {profile.title}
                    <Badge variant="outline" className="text-xs px-2">
                      {selectedProfile === profile.id ? 'Hide' : 'Show'} Products
                    </Badge>
                  </CardTitle>
                  <CardDescription>{profile.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-medium mb-3 text-sm">Key Characteristics:</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.characteristics.map((char, index) => (
                        <Badge key={index} variant="secondary" className="text-xs px-2.5 py-1">
                          {char}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {selectedProfile === profile.id && (
                    <div className="mt-4 pt-4 border-t border-primary/20">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">🎯</span>
                        <h4 className="font-semibold">Recommended Products</h4>
                      </div>
                      <div className="space-y-3">
                        {profile.recommendedProducts.map((product, index) => (
                          <div key={index} className="bg-primary/5 hover:bg-primary/10 p-4 rounded-lg border border-primary/20 transition-colors duration-300">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-sm">{product.name}</span>
                              <Badge variant="outline" className="text-xs px-2 border-primary/30">
                                {product.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{product.reason}</p>
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
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-primary rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-semibold">Life Events & Recommendations</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lifeEvents.map((event, index) => (
              <Card
                key={index}
                className="group hover:shadow-elegant hover:scale-[1.02] hover:border-primary/30 transition-all duration-300 bg-gradient-card relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <CardHeader className="relative">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                    {event.event}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-sm text-primary">Recommended Products:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {event.products.map((product, productIndex) => (
                          <Badge key={productIndex} variant="secondary" className="text-xs px-2.5 py-1">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{event.reason}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-card border-2 border-primary/20 shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xl">
                💡
              </div>
              <div>
                <CardTitle className="text-xl">Need More Specific Guidance?</CardTitle>
                <CardDescription>Explore additional resources to help your clients</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="hero"
                onClick={() => navigate('/')}
                className="min-h-[44px] flex-1 sm:flex-none shadow-card hover:shadow-elegant"
              >
                Browse All Products
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/how-to-use')}
                className="min-h-[44px] flex-1 sm:flex-none hover:bg-primary/5 hover:border-primary"
              >
                How to Use Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}