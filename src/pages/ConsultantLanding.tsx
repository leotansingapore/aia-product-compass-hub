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
      description: "Access detailed product information, highlights, and documentation for all AIA products across investment, endowment, whole life, term, and medical insurance categories."
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
      title: "Gamified Learning",
      description: "Earn XP, unlock achievements, and track your learning progress with our engaging gamification system."
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

  const stats = [
    { number: "50+", label: "Product Guides" },
    { number: "100+", label: "Training Videos" },
    { number: "24/7", label: "AI Support" },
    { number: "95%", label: "Consultant Satisfaction" }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-primary text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              For Financial Consultants
            </Badge>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Accelerate Your Success with
              <span className="block text-accent-glow">AIA Product Compass</span>
            </h1>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join hundreds of successful consultants who use our comprehensive platform to master AIA products, 
              serve clients better, and accelerate their career growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="xl" className="bg-white text-primary hover:bg-white/90">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Excel</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform provides comprehensive tools and resources designed specifically for AIA consultants
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-card hover:shadow-elegant transition-all duration-300">
                <CardContent className="p-6">
                  <div className="bg-gradient-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Consultants Choose Us</h2>
              <p className="text-xl text-muted-foreground">
                Join the ranks of top-performing consultants who leverage our platform for success
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold mb-6 flex items-center">
                  <Trophy className="h-6 w-6 text-primary mr-2" />
                  Key Benefits
                </h3>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-success mr-3 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-card">
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 text-warning fill-current" />
                  <Star className="h-5 w-5 text-warning fill-current" />
                  <Star className="h-5 w-5 text-warning fill-current" />
                  <Star className="h-5 w-5 text-warning fill-current" />
                  <Star className="h-5 w-5 text-warning fill-current" />
                  <span className="ml-2 font-semibold">4.9/5</span>
                </div>
                <blockquote className="text-lg mb-4">
                  "This platform transformed how I approach client consultations. The AI assistant 
                  helps me provide instant, accurate answers, and the training videos keep me 
                  updated on all product features."
                </blockquote>
                <div className="text-sm text-muted-foreground">
                  — Sarah Chen, Senior Financial Consultant
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Accelerate Your Success?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join our platform today and start leveraging the tools that top consultants use to excel
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="xl" className="bg-white text-primary hover:bg-white/90">
                <Zap className="mr-2 h-5 w-5" />
                Get Started Now
              </Button>
            </Link>
            <Link to="/how-to-use">
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConsultantLanding;