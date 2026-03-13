import { PageLayout } from "@/components/layout/PageLayout";
import { ProtectedPage } from "@/components/ProtectedPage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Video, 
  Brain, 
  Award, 
  Search, 
  BookmarkPlus, 
  BarChart3, 
  Users, 
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Star,
  Trophy,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

const ConsultantLanding = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Comprehensive Knowledge Base",
      description: "Access detailed product information, highlights, and documentation for all financial products across investment, endowment, whole life, term, and medical insurance categories."
    },
    {
      icon: Video,
      title: "Interactive Training Videos",
      description: "Learn through professional training videos with progress tracking, downloadable resources, and supplementary materials."
    },
    {
      icon: Brain,
      title: "AI-Powered Assistant",
      description: "Get instant answers and guidance from custom GPT assistants trained specifically on each product's details and common questions."
    },
    {
      icon: Award,
      title: "Progress Tracking",
      description: "Track your learning progress across products, exams, and training videos all in one place."
    },
    {
      icon: Search,
      title: "Advanced Search & Discovery",
      description: "Find exactly what you need with semantic search, client profile matching, and intelligent product recommendations."
    },
    {
      icon: BarChart3,
      title: "Learning Analytics",
      description: "Track your progress, identify knowledge gaps, and optimize your learning journey with detailed analytics."
    }
  ];

  const benefits = [
    "Reduce onboarding time by 60%",
    "Access 24/7 learning resources", 
    "Personalized learning paths",
    "Instant product expertise",
    "Client-ready presentations",
    "Continuous skill development"
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior Financial Consultant", 
      avatar: "SC",
      rating: 5,
      quote: "This platform transformed how I approach client consultations. The AI assistant helps me provide instant, accurate answers, and the training videos keep me updated on all product features."
    },
    {
      name: "Marcus Tan",
      role: "Financial Advisor",
      avatar: "MT", 
      rating: 5,
      quote: "The gamified learning system made product training actually enjoyable. I've earned 2,500 XP points and unlocked 8 achievements while mastering investment products."
    },
    {
      name: "Jennifer Wong",
      role: "Insurance Specialist",
      avatar: "JW",
      rating: 5, 
      quote: "The search functionality is incredible. I can find specific product information in seconds, and the client profile matching feature helps me recommend the perfect solutions."
    }
  ];

  const demoFeatures = [
    {
      title: "Interactive Product Catalog",
      description: "Browse 50+ financial products with detailed specifications, highlights, and real-world applications",
      demo: "Try searching 'high net worth investment' or 'medical coverage for families'"
    },
    {
      title: "AI-Powered Learning Assistant", 
      description: "Get instant answers to complex product questions and client scenarios",
      demo: "Ask: 'What's the difference between Pro Achiever and Platinum Wealth Venture?'"
    },
    {
      title: "Progress Tracking Dashboard",
      description: "Monitor your learning journey with detailed analytics and achievement badges",
      demo: "View your XP progress, completion rates, and unlock new learning paths"
    }
  ];

  const stats = [
    { number: "50+", label: "Product Guides" },
    { number: "100+", label: "Training Videos" },
    { number: "24/7", label: "AI Support" },
    { number: "95%", label: "Consultant Satisfaction" }
  ];

  return (
    <ProtectedPage pageId="consultant-landing">
      <PageLayout
        title="For Financial Consultants - FINternship Learning Platform"
        description="Accelerate your success as a financial consultant with our comprehensive learning platform. Access 50+ product guides, 100+ training videos, AI assistance, and gamified learning to excel in your career."
        className="min-h-screen bg-gradient-subtle"
      >
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-primary text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-1 sm:px-4 py-8 sm:py-16 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              For Financial Consultants
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              Accelerate Your Success with
              <span className="block text-accent-glow">FINternship Learning Platform</span>
            </h1>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-white max-w-2xl mx-auto">
              Join hundreds of successful consultants who use our comprehensive platform to master financial products, 
              serve clients better, and accelerate their career growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              <Button size="xl" className="bg-white text-primary hover:bg-white/90 min-h-[44px]">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="xl" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 min-h-[44px]">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Everything You Need to Excel</h2>
            <p className="text-lg sm:text-xl text-foreground max-w-2xl mx-auto">
              Our platform provides comprehensive tools and resources designed specifically for financial consultants
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-card hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="bg-gradient-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">See It In Action</h2>
            <p className="text-lg sm:text-xl text-foreground max-w-2xl mx-auto">
              Experience the power of our platform with these interactive demonstrations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {demoFeatures.map((feature, index) => (
              <Card key={index} className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-foreground mb-4">{feature.description}</p>
                  <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
                    <p className="text-sm font-medium text-primary mb-2">Try this:</p>
                    <p className="text-sm text-foreground italic">{feature.demo}</p>
                  </div>
                  <Link to="/">
                    <Button className="w-full mt-4 min-h-[44px]" variant="outline">
                      Try Demo
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-foreground">What Our Consultants Say</h2>
            <p className="text-lg sm:text-xl text-foreground">
              Real feedback from consultants who transformed their practice with our platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white shadow-card hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                      <span className="font-semibold text-primary text-sm sm:text-base">{testimonial.avatar}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-foreground truncate">{testimonial.name}</h4>
                      <p className="text-xs sm:text-sm text-foreground truncate">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-warning fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-sm sm:text-base text-foreground italic">
                    "{testimonial.quote}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Why Consultants Choose Us</h2>
              <p className="text-lg sm:text-xl text-foreground">
                Join the ranks of top-performing consultants who leverage our platform for success
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 flex items-center">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-primary mr-2" />
                  Key Benefits
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-success mr-3 flex-shrink-0" />
                      <span className="text-sm sm:text-base">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-card">
                <div className="flex items-center mb-4">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-warning fill-current" />
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-warning fill-current" />
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-warning fill-current" />
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-warning fill-current" />
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-warning fill-current" />
                  <span className="ml-2 font-semibold text-sm sm:text-base">4.9/5</span>
                </div>
                <blockquote className="text-base sm:text-lg mb-4">
                  "This platform transformed how I approach client consultations. The AI assistant 
                  helps me provide instant, accurate answers, and the training videos keep me 
                  updated on all product features."
                </blockquote>
                <div className="text-xs sm:text-sm text-foreground">
                  — Sarah Chen, Senior Financial Consultant
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Ready to Accelerate Your Success?</h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-white max-w-2xl mx-auto">
            Join our platform today and start leveraging the tools that top consultants use to excel
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link to="/auth">
              <Button size="xl" className="bg-white text-primary hover:bg-white/90 w-full sm:w-auto min-h-[44px]">
                <Zap className="mr-2 h-5 w-5" />
                Get Started Now
              </Button>
            </Link>
            <Link to="/how-to-use">
              <Button size="xl" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 w-full sm:w-auto min-h-[44px]">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </PageLayout>
    </ProtectedPage>
  );
};

export default ConsultantLanding;