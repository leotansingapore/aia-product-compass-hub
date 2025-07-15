import { Helmet } from "react-helmet-async";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function HowToUsePortal() {
  const navigate = useNavigate();

  const features = [
    {
      title: "🔍 Search Functionality",
      description: "Use the search bar to quickly find products, benefits, or client-specific solutions."
    },
    {
      title: "📂 Category Navigation",  
      description: "Browse products by category: Investment, Endowment, Whole Life, Term, and Medical Insurance."
    },
    {
      title: "🎥 Video Learning",
      description: "Watch Loom-style explainer videos for each product to understand key features and selling points."
    },
    {
      title: "📄 Resource Access",
      description: "Access PDFs, brochures, benefit illustrations, and training materials for each product."
    },
    {
      title: "🤖 AI Assistance",
      description: "Consult product-specific GPT assistants for instant answers about features and objections."
    },
    {
      title: "🧠 Objection Handling",
      description: "Review common misconceptions and learn effective responses to client objections."
    }
  ];

  const navigationTips = [
    "Start with the category that matches your client's primary need",
    "Use tags to filter products by characteristics (e.g., 'High Net Worth', 'Conservative')",
    "Watch the explainer video before your first client meeting",
    "Keep the product summary PDF handy during presentations",
    "Use the AI assistant for quick clarifications during client calls"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>How to Use Portal - AIA Product Compass Hub</title>
        <meta name="description" content="Learn how to navigate and use the AIA Product Learning Platform effectively. Discover features like video learning, AI assistance, resource access, and objection handling tools." />
      </Helmet>
      <NavigationHeader 
        title="How to Use This Portal"
        subtitle="Your comprehensive guide to mastering the AIA Product Learning Platform"
        showBackButton
        onBack={() => navigate('/')}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "How to Use Portal" }
        ]}
      />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <Card className="mb-8 bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to Your Learning Hub 🎯</CardTitle>
            <CardDescription className="text-lg">
              This portal is designed to make you a more effective financial advisor by providing instant access 
              to product knowledge, training materials, and sales tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">🎯 Who is this for?</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Financial advisors and consultants</li>
                  <li>• Sales teams and relationship managers</li>
                  <li>• New hires learning AIA products</li>
                  <li>• Experienced advisors seeking quick reference</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">✨ What you'll achieve</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Faster product knowledge acquisition</li>
                  <li>• Confident client presentations</li>
                  <li>• Effective objection handling</li>
                  <li>• Access to always-updated materials</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6">🔧 Key Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-card transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Navigation Tips */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🧭 Navigation Tips</CardTitle>
            <CardDescription>Get the most out of your learning experience</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {navigationTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-2 font-bold">{index + 1}.</span>
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Product Categories Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📂 Product Categories</CardTitle>
            <CardDescription>Understand our product organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg">
                <div className="text-2xl mb-2">📈</div>
                <h4 className="font-semibold">Investment Products</h4>
                <p className="text-sm text-blue-100">Growth & wealth building</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg">
                <div className="text-2xl mb-2">💰</div>
                <h4 className="font-semibold">Endowment Products</h4>
                <p className="text-sm text-green-100">Savings & protection</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg">
                <div className="text-2xl mb-2">🛡️</div>
                <h4 className="font-semibold">Whole Life Products</h4>
                <p className="text-sm text-purple-100">Lifelong coverage</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg">
                <div className="text-2xl mb-2">⏳</div>
                <h4 className="font-semibold">Term Products</h4>
                <p className="text-sm text-orange-100">Affordable protection</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg">
                <div className="text-2xl mb-2">🏥</div>
                <h4 className="font-semibold">Medical Insurance</h4>
                <p className="text-sm text-red-100">Health protection</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Quick Start</CardTitle>
            <CardDescription>Ready to dive in?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="hero" 
                onClick={() => navigate('/')}
              >
                Browse All Categories
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/category/investment')}
              >
                Start with Investment Products
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/search-by-profile')}
              >
                Search by Client Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}