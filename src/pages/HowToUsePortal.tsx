import { Helmet } from "react-helmet-async";
import { ProtectedPage } from "@/components/ProtectedPage";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";

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
    <ProtectedPage pageId="how-to-use-portal">
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>How to Use Portal - Navigation Guide | FINternship</title>
        <meta name="description" content="Master the FINternship Learning Platform with our comprehensive guide. Learn navigation, discover features like video learning, AI assistance, resource access, and effective objection handling strategies." />
        <meta name="keywords" content="platform guide, navigation tutorial, learning platform help, financial advisor training guide, portal tutorial" />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content="How to Use Portal - Navigation Guide | FINternship" />
        <meta property="og:description" content="Master the FINternship Learning Platform with our comprehensive navigation guide and discover powerful features for financial advisors." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${window.location.origin}${window.location.pathname}`} />
        <meta property="og:image" content={`${window.location.origin}/og-default.jpg`} />
        <meta property="article:section" content="Help & Guides" />
        <meta property="article:tag" content="Tutorial" />
        <meta property="article:tag" content="Navigation" />
        <meta property="article:tag" content="Platform Guide" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="How to Use Portal - Navigation Guide | FINternship" />
        <meta name="twitter:description" content="Master the FINternship Learning Platform with our comprehensive navigation guide." />
        <meta name="twitter:image" content={`${window.location.origin}/og-default.jpg`} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Use FINternship Learning Platform",
            "description": "Complete guide to navigating and using the FINternship Learning Platform effectively",
            "image": `${window.location.origin}/og-default.jpg`,
            "totalTime": "PT10M",
            "supply": ["Internet connection", "Web browser"],
            "tool": ["FINternship Learning Platform"],
            "step": [
              {
                "@type": "HowToStep",
                "name": "Sign In",
                "text": "Sign in to access your personalized dashboard"
              },
              {
                "@type": "HowToStep", 
                "name": "Browse Categories",
                "text": "Explore product categories to find relevant training materials"
              },
              {
                "@type": "HowToStep",
                "name": "Use Search",
                "text": "Search for specific products or topics using the search functionality"
              },
              {
                "@type": "HowToStep",
                "name": "Access Resources",
                "text": "View training videos, documents, and AI assistance for each product"
              }
            ]
          })}
        </script>
      </Helmet>
      <BrandedPageHeader
        title="📖 How to Use This Portal"
        subtitle="Your comprehensive guide to mastering the FINternship Learning Platform"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "How to Use Portal" }
        ]}
      />

      <div className="mx-auto px-1 sm:px-4 md:px-6 py-2 sm:py-6 md:py-8">
        {/* Welcome Section */}
        <Card className="mb-6 sm:mb-8 bg-gradient-card border-l-4 border-primary shadow-elegant">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Welcome to Your Learning Hub 🎯</CardTitle>
            <CardDescription className="text-sm sm:text-base md:text-lg">
              This portal is designed to make you a more effective financial advisor by providing instant access
              to product knowledge, training materials, and sales tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <span>Who is this for?</span>
                </h4>
                <ul className="text-sm space-y-2 text-muted-foreground pl-1">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Financial advisors and consultants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Sales teams and relationship managers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>New hires learning AIA products</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Experienced advisors seeking quick reference</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3 md:border-l md:border-border md:pl-6">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  <span>What you'll achieve</span>
                </h4>
                <ul className="text-sm space-y-2 text-muted-foreground pl-1">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Faster product knowledge acquisition</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Confident client presentations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Effective objection handling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>Access to always-updated materials</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-primary rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-semibold">Key Features</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-elegant hover:scale-[1.02] hover:border-primary/30 transition-all duration-300 bg-gradient-card relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <CardHeader className="pb-3 relative">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Navigation Tips */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-primary rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-semibold">Navigation Tips</h2>
          </div>
          <p className="text-muted-foreground mb-6">Get the most out of your learning experience</p>
          <div className="grid gap-3">
            {navigationTips.map((tip, index) => (
              <div
                key={index}
                className="group flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-gradient-card hover:shadow-card hover:border-primary/30 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                  {index + 1}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pt-0.5">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Product Categories Overview */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-1 w-12 bg-gradient-primary rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-semibold">Product Categories</h2>
          </div>
          <p className="text-muted-foreground mb-6">Understand our product organization</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/category/investment-products"
              className="group text-center p-5 bg-card border-2 border-blue-200 hover:border-blue-400 hover:shadow-card rounded-lg transition-all duration-300 hover:scale-[1.02] block"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📈</div>
              <h4 className="font-semibold text-blue-700 mb-1">Investment Products</h4>
              <p className="text-sm text-muted-foreground">Growth & wealth building</p>
            </Link>
            <Link
              to="/category/endowment-products"
              className="group text-center p-5 bg-card border-2 border-green-200 hover:border-green-400 hover:shadow-card rounded-lg transition-all duration-300 hover:scale-[1.02] block"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">💰</div>
              <h4 className="font-semibold text-green-700 mb-1">Endowment Products</h4>
              <p className="text-sm text-muted-foreground">Savings & protection</p>
            </Link>
            <Link
              to="/category/whole-life-products"
              className="group text-center p-5 bg-card border-2 border-purple-200 hover:border-purple-400 hover:shadow-card rounded-lg transition-all duration-300 hover:scale-[1.02] block"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🛡️</div>
              <h4 className="font-semibold text-purple-700 mb-1">Whole Life Products</h4>
              <p className="text-sm text-muted-foreground">Lifelong coverage</p>
            </Link>
            <Link
              to="/category/term-products"
              className="group text-center p-5 bg-card border-2 border-orange-200 hover:border-orange-400 hover:shadow-card rounded-lg transition-all duration-300 hover:scale-[1.02] block"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">⏳</div>
              <h4 className="font-semibold text-orange-700 mb-1">Term Products</h4>
              <p className="text-sm text-muted-foreground">Affordable protection</p>
            </Link>
            <Link
              to="/category/medical-insurance-products"
              className="group text-center p-5 bg-card border-2 border-red-200 hover:border-red-400 hover:shadow-card rounded-lg transition-all duration-300 hover:scale-[1.02] block"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">🏥</div>
              <h4 className="font-semibold text-red-700 mb-1">Medical Insurance</h4>
              <p className="text-sm text-muted-foreground">Health protection</p>
            </Link>
          </div>
        </div>

        {/* Quick Start */}
        <Card className="bg-gradient-card border-2 border-primary/20 shadow-elegant">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xl">
                🚀
              </div>
              <div>
                <CardTitle className="text-xl">Quick Start</CardTitle>
                <CardDescription>Ready to dive in?</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="hero"
                onClick={() => navigate('/')}
                className="min-h-[44px] flex-1 shadow-card hover:shadow-elegant"
              >
                Browse All Categories
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/category/investment-products')}
                className="min-h-[44px] flex-1 hover:bg-primary/5 hover:border-primary"
              >
                Start with Investment Products
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/search-by-profile')}
                className="min-h-[44px] flex-1 hover:bg-primary/5 hover:border-primary"
              >
                Search by Client Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedPage>
  );
}