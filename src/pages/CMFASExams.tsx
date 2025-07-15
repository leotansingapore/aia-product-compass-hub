import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { CategoryCard } from "@/components/CategoryCard";
import { BookOpen, Scale, TrendingUp, PieChart, FileText, Download } from "lucide-react";

export default function CMFASExams() {
  const navigate = useNavigate();

  const cmfasModules = [
    {
      title: "CMFAS Module 1",
      description: "Rules and Regulations - Essential foundations for capital markets",
      icon: BookOpen,
      productCount: 25,
      gradient: "from-blue-500 to-blue-600",
      route: "/cmfas/module-1"
    },
    {
      title: "CMFAS Module 5", 
      description: "Securities & Futures Act - Legal framework and compliance",
      icon: Scale,
      productCount: 30,
      gradient: "from-green-500 to-green-600",
      route: "/cmfas/module-5"
    },
    {
      title: "CMFAS Module 6",
      description: "Investment Analysis - Fundamental and technical analysis", 
      icon: TrendingUp,
      productCount: 35,
      gradient: "from-purple-500 to-purple-600",
      route: "/cmfas/module-6"
    },
    {
      title: "CMFAS Module 8",
      description: "Collective Investment Schemes - Unit trusts and funds",
      icon: PieChart,
      productCount: 28,
      gradient: "from-orange-500 to-orange-600",
      route: "/cmfas/module-8"
    },
    {
      title: "Practice Tests",
      description: "Comprehensive mock exams and practice questions",
      icon: FileText,
      productCount: 150,
      gradient: "from-red-500 to-red-600",
      route: "/cmfas/practice-tests"
    },
    {
      title: "Study Materials",
      description: "Downloadable guides, flashcards, and reference materials",
      icon: Download,
      productCount: 45,
      gradient: "from-teal-500 to-teal-600",
      route: "/cmfas/study-materials"
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
              Our comprehensive preparation materials cover all essential modules with practice questions, study guides, and expert insights to help you succeed in your certification journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}