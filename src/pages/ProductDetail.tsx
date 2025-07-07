import { useParams, useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const productData = {
  'pro-achiever': {
    name: 'Pro Achiever',
    category: 'Investment Products',
    categoryId: 'investment',
    tags: ['ILP', 'High Net Worth', 'Flexible Premium'],
    summary: "A comprehensive investment-linked plan designed for affluent individuals seeking wealth accumulation with flexibility. Ideal for clients who want to balance growth potential with premium payment flexibility, suitable for those with surplus income looking for long-term wealth building.",
    highlights: [
      "Wide range of fund choices across different risk profiles and geographical regions",
      "Flexible premium payment - increase, decrease, or pause premiums based on financial situation",
      "Premium booster feature that rewards consistent premium payments with bonus allocations",
      "3-year lock-in period with penalty-free partial withdrawals after the 3rd year",
      "Free fund switching up to 12 times per year to optimize portfolio performance",
      "Top-up facility to accelerate wealth accumulation during favorable market conditions",
      "Multiple currency options (SGD, USD) for international diversification"
    ],
    links: {
      benefitIllustration: "#",
      productSummary: "#",
      aiaWebsite: "#",
      supplementaryMaterials: "#",
      flashcards: "#",
      trainingSlides: "#",
      aiaBrochure: "#",
      presentationSlides: "#"
    },
    customGPT: "#",
    videos: [
      {
        title: "Product Overview",
        description: "Comprehensive introduction to Pro Achiever features and benefits",
        embed: "https://www.loom.com/embed/placeholder-overview"
      },
      {
        title: "Sales Presentation",
        description: "How to present Pro Achiever to high net worth clients",
        embed: "https://www.loom.com/embed/placeholder-sales"
      },
      {
        title: "Objection Handling",
        description: "Common objections and how to address them effectively",
        embed: "https://www.loom.com/embed/placeholder-objections"
      }
    ],
    misconceptions: [
      {
        misconception: "\"ILPs are too risky and complicated for conservative clients\"",
        reality: "Pro Achiever offers conservative fund options and the flexibility to adjust risk levels. The lock-in period provides discipline while partial withdrawals offer liquidity.",
        advisorTip: "Show clients the range of fund options, from money market to balanced funds. Emphasize that they control the risk level through fund selection."
      },
      {
        misconception: "\"The fees are too high compared to direct investing\"",
        reality: "Pro Achiever includes insurance protection, professional fund management, and administrative convenience that direct investing doesn't provide.",
        advisorTip: "Break down the value proposition: insurance coverage + professional management + tax efficiency + convenience. Compare total costs including their time and effort for direct investing."
      }
    ]
  },
  'smart-wealth-builder': {
    name: 'Smart Wealth Builder',
    category: 'Endowment Products',
    categoryId: 'endowment',
    tags: ['Endowment', 'Guaranteed Returns', 'Mass Market'],
    summary: "A participating endowment plan that combines guaranteed returns with potential bonuses. Perfect for conservative clients who want capital protection with upside potential, ideal for medium-term financial goals like children's education or retirement planning.",
    highlights: [
      "100% capital guarantee with competitive guaranteed returns",
      "Annual bonus declarations based on company performance",
      "Terminal bonus at maturity for additional returns",
      "5, 10, 15, or 20-year policy terms to match financial goals",
      "Loan facility available against policy cash value after 2nd year",
      "Death benefit protection throughout the policy term",
      "Automatic premium payment options for convenience"
    ],
    links: {
      benefitIllustration: "#",
      productSummary: "#",
      aiaWebsite: "#",
      supplementaryMaterials: "#",
      flashcards: "#",
      trainingSlides: "#",
      aiaBrochure: "#",
      presentationSlides: "#"
    },
    customGPT: "#",
    videos: [
      {
        title: "Product Overview",
        description: "Introduction to Smart Wealth Builder's guaranteed returns",
        embed: "https://www.loom.com/embed/placeholder-overview"
      },
      {
        title: "Client Presentation",
        description: "How to explain endowment benefits to conservative clients",
        embed: "https://www.loom.com/embed/placeholder-presentation"
      }
    ],
    misconceptions: [
      {
        misconception: "\"Endowment returns are too low compared to investments\"",
        reality: "Smart Wealth Builder provides guaranteed returns plus potential bonuses, offering better risk-adjusted returns with capital protection.",
        advisorTip: "Focus on the guarantee aspect and show historical bonus rates. Emphasize peace of mind and suitability for conservative portfolios."
      },
      {
        misconception: "\"I can't access my money during the policy term\"",
        reality: "Policy loans are available after the 2nd year, and early surrender is possible with adjusted returns.",
        advisorTip: "Explain the loan facility and partial withdrawal options. Position early surrender as emergency option while emphasizing benefits of staying till maturity."
      }
    ]
  },
  'guaranteed-protect-plus': {
    name: 'Guaranteed Protect Plus',
    category: 'Whole Life Products',
    categoryId: 'whole-life',
    tags: ['Whole Life', 'Participating', 'Estate Planning'],
    summary: "A participating whole life insurance plan providing lifelong protection with guaranteed cash value growth. Ideal for clients seeking permanent protection with wealth transfer benefits, suitable for estate planning and long-term financial security.",
    highlights: [
      "Guaranteed death benefit for entire lifetime with no term limits",
      "Guaranteed cash value accumulation that increases annually",
      "Participating policy with annual dividend distributions",
      "Paid-up insurance option after sufficient cash value accumulation",
      "Policy loan facility against cash value for liquidity needs",
      "Automatic premium loan feature to prevent policy lapse",
      "Estate planning benefits with tax-efficient wealth transfer"
    ],
    links: {
      benefitIllustration: "#",
      productSummary: "#",
      aiaWebsite: "#",
      supplementaryMaterials: "#",
      flashcards: "#",
      trainingSlides: "#",
      aiaBrochure: "#",
      presentationSlides: "#"
    },
    customGPT: "#",
    videos: [
      {
        title: "Product Overview",
        description: "Complete guide to Guaranteed Protect Plus whole life benefits",
        embed: "https://www.loom.com/embed/placeholder-overview"
      },
      {
        title: "Estate Planning Focus",
        description: "How to position whole life for estate planning clients",
        embed: "https://www.loom.com/embed/placeholder-estate"
      }
    ],
    misconceptions: [
      {
        misconception: "\"Whole life is too expensive compared to term insurance\"",
        reality: "Guaranteed Protect Plus builds cash value and provides lifelong protection, making it a savings and protection tool combined.",
        advisorTip: "Show the cash value projection and compare the total value proposition. Position as 'forced savings' with insurance protection rather than just insurance cost."
      },
      {
        misconception: "\"I don't need life insurance for my whole life\"",
        reality: "Life insurance needs often increase with age due to estate taxes, final expenses, and wealth transfer needs.",
        advisorTip: "Discuss changing life insurance needs: mortgage protection, business succession, estate planning, and final expenses that don't disappear with age."
      }
    ]
  }
};

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  
  const product = productData[productId as keyof typeof productData];

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        title={`🧾 ${product.name}`}
        subtitle={product.category}
        showBackButton
        onBack={() => navigate(`/category/${product.categoryId}`)}
      />
      
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag, index) => (
            <Badge key={index} variant="secondary">{tag}</Badge>
          ))}
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🗂️</span> Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{product.summary}</p>
          </CardContent>
        </Card>

        {/* Key Highlights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊</span> Key Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {product.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-success mr-2 mt-1">•</span>
                  <span className="text-muted-foreground">{highlight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Useful Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🔗</span> Useful Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start" asChild>
                <a href={product.links.benefitIllustration} target="_blank" rel="noopener noreferrer">
                  📄 Benefit Illustration (PDF)
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href={product.links.productSummary} target="_blank" rel="noopener noreferrer">
                  📋 Product Summary (PDF)
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href={product.links.aiaWebsite} target="_blank" rel="noopener noreferrer">
                  🌐 AIA Website
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href={product.links.supplementaryMaterials} target="_blank" rel="noopener noreferrer">
                  📚 Supplementary Materials
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href={product.links.flashcards} target="_blank" rel="noopener noreferrer">
                  🃏 Flashcards
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href={product.links.trainingSlides} target="_blank" rel="noopener noreferrer">
                  📊 Training Slides
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href={product.links.aiaBrochure} target="_blank" rel="noopener noreferrer">
                  📖 AIA Brochure
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href={product.links.presentationSlides} target="_blank" rel="noopener noreferrer">
                  🎯 Presentation Slides
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant */}
        <Card className="border-primary/20 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🤖</span> Ask the AI (Custom GPT)
            </CardTitle>
            <CardDescription>
              Get instant answers about this product's features, benefits, and objection handling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="hero" size="lg" asChild>
              <a href={product.customGPT} target="_blank" rel="noopener noreferrer">
                ➡️ Click here to consult the AI for this product
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Training Videos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🎥</span> Training Videos
            </CardTitle>
            <CardDescription>
              Comprehensive video library for different learning purposes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {product.videos ? product.videos.map((video, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{video.title}</h4>
                      <p className="text-sm text-muted-foreground">{video.description}</p>
                    </div>
                    <Badge variant="outline">{index + 1}</Badge>
                  </div>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🎬</div>
                      <p className="text-muted-foreground text-sm">Video will be embedded here</p>
                      <p className="text-xs text-muted-foreground mt-1">{video.title}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🎬</div>
                    <p className="text-muted-foreground">Video will be embedded here</p>
                    <p className="text-sm text-muted-foreground mt-2">Loom-style explainer video</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Common Misconceptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🧠</span> Notes / Common Misconceptions
            </CardTitle>
            <CardDescription>
              Address common client concerns and objections effectively
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {product.misconceptions.map((item, index) => (
                <div key={index} className="border-l-4 border-primary pl-4">
                  <h4 className="font-semibold text-destructive mb-2">
                    ❌ Misconception: {item.misconception}
                  </h4>
                  <p className="text-muted-foreground mb-2">
                    <strong className="text-success">✅ Reality:</strong> {item.reality}
                  </p>
                  <p className="text-sm bg-accent/50 p-3 rounded-md">
                    <strong>💡 Advisor Tip:</strong> {item.advisorTip}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}