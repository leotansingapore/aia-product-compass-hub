import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { CategoryCard } from "@/components/CategoryCard";
import { UsefulLinksSection } from "@/components/dashboard/UsefulLinksSection";
import { BookOpen, Scale, TrendingUp, PieChart, FileText } from "lucide-react";

export default function CMFASExams() {
  const navigate = useNavigate();

  const cmfasModules = [
    {
      title: "Getting Started",
      description: "Essential onboarding steps and setup guide",
      icon: BookOpen,
      productCount: 4,
      gradient: "from-cyan-500 to-cyan-600",
      route: "/cmfas/onboarding"
    },
    {
      title: "M9 Module",
      description: "Life Insurance And Investment-Linked Policies",
      icon: Scale,
      productCount: 17,
      gradient: "from-blue-500 to-blue-600",
      route: "/cmfas/m9"
    },
    {
      title: "M9A Module", 
      description: "Life Insurance And Investment-Linked Policies II",
      icon: TrendingUp,
      productCount: 6,
      gradient: "from-green-500 to-green-600",
      route: "/cmfas/m9a"
    },
    {
      title: "HI Module",
      description: "Health Insurance", 
      icon: PieChart,
      productCount: 15,
      gradient: "from-purple-500 to-purple-600",
      route: "/cmfas/hi"
    },
    {
      title: "RES5 Module",
      description: "Rules, Ethics And Skills For Financial Advisory Services",
      icon: FileText,
      productCount: 28,
      gradient: "from-red-500 to-red-600",
      route: "/cmfas/res5"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>CMFAS Exam Preparation - AIA Product Compass Hub</title>
        <meta name="description" content="Comprehensive CMFAS exam preparation materials including modules 1, 5, 6, 8, practice tests, and study materials for capital markets financial advisory services certification." />
      </Helmet>

      <NavigationHeader 
        title="CMFAS Exam Preparation"
        subtitle="Capital Markets Financial Advisory Services - Your path to certification"
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">CMFAS Certification Program</h1>
          <p className="text-muted-foreground text-lg">
            Prepare for your Capital Markets Financial Advisory Services certification with our comprehensive study materials, practice tests, and expert guidance across all essential modules.
          </p>
        </div>

        {/* Useful Links Section */}
        <div className="mb-12">
          <UsefulLinksSection />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cmfasModules.map((module) => (
            <CategoryCard
              key={module.title}
              title={module.title}
              description={module.description}
              icon={<module.icon />}
              productCount={module.productCount}
              gradient={module.gradient}
              onClick={() => navigate(module.route)}
            />
          ))}
        </div>

        <div className="mt-12 bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">About CMFAS Certification</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              The Capital Markets Financial Advisory Services (CMFAS) certification is required for financial advisors in Singapore to provide investment advice on capital market products.
            </p>
            <p>
              Our comprehensive preparation materials are organized by module, each containing detailed syllabi, practice questions, and expert guidance. Start with the Getting Started module to complete your essential setup, then proceed through each exam module systematically.
            </p>
            <p>
              With our support package including flashcards, personal tutoring, question banks, and AI assistance, passing on your first attempt should be highly achievable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}