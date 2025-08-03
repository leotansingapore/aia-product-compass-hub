import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { CategoryCard } from "@/components/CategoryCard";
import { CMFASUsefulLinks } from "@/components/cmfas/CMFASUsefulLinks";
import { CMFASChatbot } from "@/components/cmfas/CMFASChatbot";
import { BookOpen, Scale, TrendingUp, PieChart, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { UsefulLink } from "@/hooks/useProducts";

export default function CMFASExams() {
  console.log('CMFASExams component loaded - no UsefulLinksSection here');
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // State for editable useful links
  const [usefulLinks, setUsefulLinks] = useState<UsefulLink[]>([
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
  ]);

  // Load and save useful links to/from database
  const productId = 'cmfas-exams-page';

  useEffect(() => {
    const loadUsefulLinks = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('useful_links')
          .eq('id', productId)
          .single();

        if (data && data.useful_links && Array.isArray(data.useful_links)) {
          setUsefulLinks(data.useful_links as unknown as UsefulLink[]);
        }
      } catch (error) {
        console.log('No existing useful links found, using defaults');
      }
    };

    loadUsefulLinks();
  }, []);

  // Handler for updating useful links
  const handleUpdate = async (field: string, value: any) => {
    if (field === 'useful_links') {
      setUsefulLinks(value);
      
      try {
        // Save to database
        const { error } = await supabase
          .from('products')
          .upsert({
            id: productId,
            title: 'CMFAS Exams Page',
            description: 'Main CMFAS exams page useful links',
            category_id: (await supabase.from('categories').select('id').eq('name', 'Learning Modules').single()).data?.id || null,
            useful_links: value
          });

        if (error) {
          console.error('Error saving useful links:', error);
          throw error;
        }
        
        console.log('Useful links saved successfully to database');
      } catch (error) {
        console.error('Failed to save useful links:', error);
        // Revert the local state on error
        setUsefulLinks(usefulLinks);
        throw error;
      }
    }
  };

  const cmfasModules = [
    {
      title: "Getting Started",
      description: "Essential onboarding steps and setup guide",
      icon: BookOpen,
      productCount: 4,
      gradient: "from-cyan-500 to-cyan-600",
      route: "/cmfas/module/onboarding"
    },
    {
      title: "M9 Module",
      description: "Life Insurance And Investment-Linked Policies",
      icon: Scale,
      productCount: 17,
      gradient: "from-blue-500 to-blue-600",
      route: "/cmfas/module/m9"
    },
    {
      title: "M9A Module", 
      description: "Life Insurance And Investment-Linked Policies II",
      icon: TrendingUp,
      productCount: 6,
      gradient: "from-green-500 to-green-600",
      route: "/cmfas/module/m9a"
    },
    {
      title: "HI Module",
      description: "Health Insurance", 
      icon: PieChart,
      productCount: 15,
      gradient: "from-purple-500 to-purple-600",
      route: "/cmfas/module/hi"
    },
    {
      title: "RES5 Module",
      description: "Rules, Ethics And Skills For Financial Advisory Services",
      icon: FileText,
      productCount: 28,
      gradient: "from-red-500 to-red-600",
      route: "/cmfas/module/res5"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>CMFAS Exam Preparation - AIA Product Compass Hub</title>
        <meta name="description" content="Comprehensive CMFAS exam preparation materials including modules 1, 5, 6, 8, practice tests, and study materials for capital markets financial advisory services certification." />
      </Helmet>

      {!isMobile && (
        <NavigationHeader 
          title="CMFAS Exam Preparation"
          subtitle="Capital Markets Financial Advisory Services - Your path to certification"
        />
      )}
      
      <div className={cn(
        "max-w-7xl mx-auto",
        isMobile ? "px-4 py-4" : "px-6 py-8"
      )}>
        {!isMobile && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">CMFAS Certification Program</h1>
            <p className="text-muted-foreground text-lg">
              Prepare for your Capital Markets Financial Advisory Services certification with our comprehensive study materials, practice tests, and expert guidance across all essential modules.
            </p>
          </div>
        )}

        {/* Useful Links Section - Positioned Higher */}
        <div className={cn("mb-6", isMobile && "mb-4")}>
          <CMFASUsefulLinks
            links={usefulLinks}
            onUpdate={handleUpdate}
          />
        </div>

        {/* CMFAS AI Tutor - Below Useful Links */}
        <div className={cn("mb-8", isMobile && "mb-6")}>
          <CMFASChatbot
            moduleName="CMFAS Exam Preparation - General"
          />
        </div>

        <div className={cn(
          "grid gap-4",
          isMobile ? "grid-cols-1" : "md:grid-cols-2 lg:grid-cols-3 gap-6"
        )}>
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

        {!isMobile && (
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
        )}
      </div>
    </div>
  );
}