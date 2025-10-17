import { useNavigate } from "react-router-dom";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { CategoryCard } from "@/components/CategoryCard";
import { CMFASUsefulLinks } from "@/components/cmfas/CMFASUsefulLinks";
import { CMFASChatLauncher } from "@/components/cmfas/CMFASChatLauncher";
import { BookOpen, Scale, TrendingUp, PieChart, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageLayout, StructuredData } from "@/components/layout/PageLayout";
import { useUsefulLinks } from "@/hooks/useUsefulLinks";
import type { UsefulLink } from "@/hooks/useProducts";

export default function CMFASExams() {
  console.log('CMFASExams component loaded - no UsefulLinksSection here');
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Default useful links
  const defaultLinks: UsefulLink[] = [
    {
      name: "SCI College Student Portal",
      url: "https://www.scicollege.org.sg/Account/Register",
      icon: "🎓"
    },
    {
      name: "MAS Guidelines",
      url: "https://www.mas.gov.sg/regulation/guidelines",
      icon: "📋"
    },
    {
      name: "AIA Singapore",
      url: "https://www.aia.com.sg",
      icon: "🌐"
    },
    {
      name: "Life Insurance Calculator",
      url: "https://www.aia.com.sg/en/our-products/life-insurance.html",
      icon: "🧮"
    },
    {
      name: "CMFAS Practice Tests",
      url: "/cmfas-exams",
      icon: "📚"
    },
    {
      name: "Technical Support",
      url: "mailto:support@aiaproductcompass.com",
      icon: "📞"
    }
  ];

  const { usefulLinks, updateUsefulLinks } = useUsefulLinks('cmfas-exams-page', defaultLinks);

  // Handler for updating useful links
  const handleUpdate = async (field: string, value: any) => {
    if (field === 'useful_links') {
      await updateUsefulLinks(value);
    }
  };

  const cmfasModules = [
    {
      title: "Getting Started",
      description: "Essential onboarding steps and setup guide",
      icon: BookOpen,
      productCount: 4,
      gradient: "from-cyan-500 to-cyan-600",
      borderColor: "group-hover:border-cyan-300",
      route: "/cmfas/module/onboarding"
    },
    {
      title: "M9 Module",
      description: "Life Insurance And Investment-Linked Policies",
      icon: Scale,
      productCount: 17,
      gradient: "from-blue-500 to-blue-600",
      borderColor: "group-hover:border-blue-300",
      route: "/cmfas/module/m9"
    },
    {
      title: "M9A Module",
      description: "Life Insurance And Investment-Linked Policies II",
      icon: TrendingUp,
      productCount: 6,
      gradient: "from-green-500 to-green-600",
      borderColor: "group-hover:border-green-300",
      route: "/cmfas/module/m9a"
    },
    {
      title: "HI Module",
      description: "Health Insurance",
      icon: PieChart,
      productCount: 15,
      gradient: "from-purple-500 to-purple-600",
      borderColor: "group-hover:border-purple-300",
      route: "/cmfas/module/hi"
    },
    {
      title: "RES5 Module",
      description: "Rules, Ethics And Skills For Financial Advisory Services",
      icon: FileText,
      productCount: 28,
      gradient: "from-red-500 to-red-600",
      borderColor: "group-hover:border-red-300",
      route: "/cmfas/module/res5"
    }
  ];

  const structuredData: StructuredData = {
    "@context": "https://schema.org" as const,
    "@type": "Course",
    "name": "CMFAS Exam Preparation",
    "description": "Comprehensive CMFAS exam preparation materials including modules M9, M9A, HI, RES5, practice tests, and study materials for capital markets financial advisory services certification.",
    "url": `${window.location.origin}${window.location.pathname}`,
    "courseMode": "online",
    "educationalLevel": "professional"
  };

  return (
    <PageLayout
      title="CMFAS Exam Preparation - FINternship Learning Platform"
      description="Comprehensive CMFAS exam preparation materials including modules 1, 5, 6, 8, practice tests, and study materials for capital markets financial advisory services certification."
      keywords="CMFAS exam, capital markets, financial advisory, certification, exam preparation, modules, practice tests"
      structuredData={structuredData}
    >
      <BrandedPageHeader
        title="📚 CMFAS Exam Preparation"
        subtitle="Capital Markets Financial Advisory Services - Your path to certification"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "CMFAS Exams" }
        ]}
      />

      <div className="mx-auto px-4 sm:px-6 py-4 sm:py-8">

        {/* Useful Links Section - Positioned Higher */}
        <div className={cn("mb-6", isMobile && "mb-4")}>
          <CMFASUsefulLinks
            links={usefulLinks}
            onUpdate={handleUpdate}
          />
        </div>

        {/* CMFAS AI Tutor - Below Useful Links */}
        <div className={cn("mb-8", isMobile && "mb-6")}>
          <CMFASChatLauncher
            description="Get general help with CMFAS exam preparation, study strategies, and certification requirements"
          />
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {cmfasModules.map((module) => (
            <CategoryCard
              key={module.title}
              title={module.title}
              description={module.description}
              icon={<module.icon />}
              productCount={module.productCount}
              gradient={module.gradient}
              borderColor={module.borderColor}
              onClick={() => navigate(module.route)}
            />
          ))}
        </div>

        <div className="mt-8 sm:mt-12 bg-card rounded-lg p-6 border shadow-card">
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
    </PageLayout>
  );
}