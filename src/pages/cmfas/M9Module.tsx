import { Helmet } from "react-helmet-async";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { CMFASTutorialLectures } from "@/components/cmfas/CMFASTutorialLectures";
import { CMFASUsefulLinks } from "@/components/cmfas/CMFASUsefulLinks";
import { CMFASChatLauncher } from "@/components/cmfas/CMFASChatLauncher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useProductUpdate } from "@/hooks/useProductUpdate";
import { supabase } from "@/integrations/supabase/client";

export default function M9Module() {
  const productId = 'm9-module';
  const { updateProduct } = useProductUpdate();
  
  const [tutorialLectures, setTutorialLectures] = useState([
    {
      id: 'm9-intro',
      title: 'M9 Introduction & Overview',
      description: 'Introduction to life insurance and exam structure',
      url: '/lectures/m9-intro.mp4',
      duration: 1800, // 30 minutes
      order: 0,
      category: 'Introduction'
    },
    {
      id: 'm9-risk-insurance',
      title: 'Risk and Life Insurance',
      description: 'Understanding risk concepts and life insurance fundamentals',
      url: '/lectures/m9-risk-insurance.mp4',
      duration: 2400, // 40 minutes
      order: 1,
      category: 'Core Concepts'
    },
    {
      id: 'm9-premium-setting',
      title: 'Setting Life Insurance Premium',
      description: 'Premium calculation methods and factors',
      url: '/lectures/m9-premium-setting.mp4',
      duration: 2100, // 35 minutes
      order: 2,
      category: 'Core Concepts'
    },
    {
      id: 'm9-traditional-products',
      title: 'Traditional Life Insurance Products',
      description: 'Overview of traditional life insurance products',
      url: '/lectures/m9-traditional-products.mp4',
      duration: 2700, // 45 minutes
      order: 3,
      category: 'Products'
    },
    {
      id: 'm9-investment-linked',
      title: 'Investment-Linked Policies',
      description: 'Understanding ILPs and their features',
      url: '/lectures/m9-investment-linked.mp4',
      duration: 3000, // 50 minutes
      order: 4,
      category: 'Products'
    }
  ]);

  const [usefulLinks, setUsefulLinks] = useState([
    {
      id: 'm9-study-guide',
      name: 'Official M9 Study Guide',
      url: 'https://example.com/m9-study-guide',
      description: 'Comprehensive study guide for M9 exam',
      icon: 'Book'
    },
    {
      id: 'm9-practice-questions',
      name: 'M9 Practice Questions',
      url: 'https://example.com/m9-practice',
      description: 'Practice questions and mock exams',
      icon: 'FileQuestion'
    },
    {
      id: 'm9-regulations',
      name: 'MAS Life Insurance Regulations',
      url: 'https://mas.gov.sg',
      description: 'Latest regulations and guidelines',
      icon: 'Scale'
    }
  ]);

  const [customGptLink, setCustomGptLink] = useState<string>("https://chatgpt.com/g/g-example-m9");
  const [loading, setLoading] = useState(true);

  // Load data from database on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
          console.error('Error loading M9 module data:', error);
          return;
        }

        if (data) {
          // Load data from database if exists
          if (data.training_videos && Array.isArray(data.training_videos)) {
            setTutorialLectures(data.training_videos as any[]);
          }
          if (data.useful_links && Array.isArray(data.useful_links)) {
            setUsefulLinks(data.useful_links as any[]);
          }
          if (data.custom_gpt_link && typeof data.custom_gpt_link === 'string') {
            setCustomGptLink(data.custom_gpt_link);
          }
        } else {
          // Create initial product entry if it doesn't exist
          const { error: insertError } = await supabase
            .from('products')
            .insert({
              id: productId,
              title: 'CMFAS M9 Module',
              description: 'Life Insurance & Investment-Linked Policies',
              category_id: (await supabase.from('categories').select('id').eq('name', 'CMFAS').single()).data?.id,
              training_videos: tutorialLectures,
              useful_links: usefulLinks,
              custom_gpt_link: customGptLink
            });

          if (insertError) {
            console.error('Error creating M9 module entry:', insertError);
          }
        }
      } catch (error) {
        console.error('Error in loadData:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId]);

  const handleUpdate = async (field: string, value: any) => {
    try {
      // Update local state
      if (field === 'tutorial_lectures') {
        setTutorialLectures(value);
        // Save to database with correct field name
        await updateProduct(productId, 'training_videos', value);
      } else if (field === 'useful_links') {
        setUsefulLinks(value);
        await updateProduct(productId, 'useful_links', value);
      } else if (field === 'custom_gpt_link') {
        setCustomGptLink(value);
        await updateProduct(productId, 'custom_gpt_link', value);
      }
    } catch (error) {
      console.error('Error updating M9 module:', error);
      // Revert local state if database update failed
      if (field === 'tutorial_lectures') {
        // Reload from database to get the previous state
        const { data } = await supabase
          .from('products')
          .select('training_videos')
          .eq('id', productId)
          .single();
        if (data && Array.isArray(data.training_videos)) {
          setTutorialLectures(data.training_videos as any[]);
        }
      }
      // Similar for other fields...
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading M9 Module...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Helmet>
        <title>CMFAS M9 - Life Insurance & Investment-Linked Policies</title>
        <meta name="description" content="Complete guide to CMFAS M9 exam covering life insurance and investment-linked policies with detailed syllabus and exam format." />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
      </Helmet>

      <BrandedPageHeader
        title="📘 CMFAS M9 Module"
        subtitle="Life Insurance & Investment-Linked Policies"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "CMFAS Exams", href: "/cmfas-exams" },
          { label: "M9 Module" }
        ]}
        showBackButton={true}
        onBack={() => window.history.back()}
      />

      <div className="mx-auto px-1 sm:px-4 md:px-6 py-2 sm:py-4 md:py-8 space-y-3 sm:space-y-6 md:space-y-8">

        {/* CMFAS Chat Launcher */}
        <div className="animate-fade-in">
          <CMFASChatLauncher
            moduleId="m9"
            moduleName="M9 Module - Life Insurance & Investment-Linked Policies"
            description="Get instant help with M9 exam topics including life insurance, ILPs, premiums, and industry practices"
          />
        </div>

        {/* Main Content with Tabs */}
        <div className="bg-card rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
          <div className="p-4 md:p-8 border-b">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-xl md:text-3xl">📘</span>
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  M9 Exam
                </h1>
                <p className="text-sm md:text-lg text-muted-foreground">Life Insurance & Investment-Linked Policies</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            {/* Mobile-First Tab Navigation */}
            <div className="px-3 md:px-8 pt-4 md:pt-6">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 h-auto p-1">
                <TabsTrigger 
                  value="overview" 
                  className="mobile-touch-target text-sm font-medium px-4 py-3 min-h-[48px] data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">📋</span>
                    <span>Overview</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="objectives" 
                  className="mobile-touch-target text-sm font-medium px-4 py-3 min-h-[48px] data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">🎯</span>
                    <span>Objectives</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="content" 
                  className="mobile-touch-target text-sm font-medium px-4 py-3 min-h-[48px] data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">📚</span>
                    <span>Content</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="exam" 
                  className="mobile-touch-target text-sm font-medium px-4 py-3 min-h-[48px] data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-lg">📝</span>
                    <span>Exam</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-2 sm:p-4 md:p-8">
              <TabsContent value="overview" className="space-y-4 sm:space-y-6">
                {/* For Whom Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-primary font-bold">👥</span>
                    </div>
                    <h2 className="text-2xl font-bold">For Whom</h2>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-6 border-l-4 border-primary">
                    <p className="text-muted-foreground leading-relaxed">
                      The M9 exam is intended for those who are looking to provide advice on and/or arrange life insurance policies (whether or not including investment-linked policies). 
                      You are required to pass this module, together with Module 5 on Rules And Regulations For Financial Advisory Services, in compliance with the requirements as laid down by the Monetary Authority of Singapore (MAS).
                    </p>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold">⚠️</span>
                    </div>
                    <h3 className="font-bold text-amber-800 dark:text-amber-200">Important Notes</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {[
                      "Computer Screen Examination (CSE) in English medium",
                      "One mark awarded for each correct answer",
                      "No marks deducted for wrong or blank answers",
                      "Use eBook for preparation - no hard-copy texts issued",
                      "Only Result Slip will be issued, no certificate"
                    ].map((note, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded-lg">
                        <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                        <p className="text-sm text-amber-800 dark:text-amber-200">{note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="objectives" className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold">🎯</span>
                  </div>
                  <h2 className="text-2xl font-bold">Learning Objectives</h2>
                </div>
                <div className="bg-muted/50 rounded-xl p-6">
                  <p className="text-muted-foreground mb-6 leading-relaxed">The objective of this course is to test candidates on their knowledge and understanding of:</p>
                  <div className="grid gap-3">
                    {[
                      "Life insurance and life insurance concepts, including setting life insurance premiums and classification of life insurance products",
                      "Different types of traditional life insurance products",
                      "Various types of riders; investment-linked policies; and annuities",
                      "Industry practices including the application and underwriting process; policy services and claims practices",
                      "Contractual provisions and legal issues such as the law of agency and other relevant aspects such as income tax, insurance nomination, wills, and trust"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-background transition-colors duration-200">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                          <span className="text-micro font-bold text-primary">{index + 1}</span>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold">📚</span>
                  </div>
                  <h2 className="text-2xl font-bold">Course Contents</h2>
                </div>
                <div className="grid lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <div className="space-y-3">
                    {[
                      { chapter: 1, title: "Risk And Life Insurance" },
                      { chapter: 2, title: "Setting Life Insurance Premium" },
                      { chapter: 3, title: "Classification Of Life Insurance Products" },
                      { chapter: 4, title: "Traditional Life Insurance Products" },
                      { chapter: 5, title: "Riders (Or Supplementary Benefits)" },
                      { chapter: 6, title: "Participating Life Insurance Policies" },
                      { chapter: 7, title: "Investment-linked Life Insurance Policies (ILPS)" },
                      { chapter: 8, title: "Investment-linked Sub-Funds" },
                      { chapter: 9, title: "Investment-linked Life Insurance Products: Computational Aspects" }
                    ].map((item, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-muted/80 to-muted/40 rounded-xl border hover:shadow-md transition-all duration-200 hover-scale group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <span className="text-micro font-bold text-primary-foreground">{item.chapter}</span>
                          </div>
                          <p className="font-medium text-sm leading-relaxed">{item.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {[
                      { chapter: 10, title: "Annuities" },
                      { chapter: 11, title: "Application And Underwriting" },
                      { chapter: 12, title: "Policy Services" },
                      { chapter: 13, title: "Life Insurance Claims" },
                      { chapter: 14, title: "The Insurance Contract" },
                      { chapter: 15, title: "Law Of Agency" },
                      { chapter: 16, title: "Income Tax And Life Insurance" },
                      { chapter: 17, title: "Insurance Nomination, Wills And Trusts" }
                    ].map((item, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-muted/80 to-muted/40 rounded-xl border hover:shadow-md transition-all duration-200 hover-scale group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <span className="text-micro font-bold text-primary-foreground">{item.chapter}</span>
                          </div>
                          <p className="font-medium text-sm leading-relaxed">{item.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="exam" className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 font-bold">📝</span>
                  </div>
                  <h2 className="text-2xl font-bold">Exam Format</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 sm:p-6 rounded-2xl border border-blue-200 dark:border-blue-800 flex items-center gap-3 sm:gap-4 hover-scale group">
                    <div className="text-2xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200">100</div>
                    <p className="font-medium text-blue-800 dark:text-blue-300">Multiple Choice Questions</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 sm:p-6 rounded-2xl border border-green-200 dark:border-green-800 flex items-center gap-3 sm:gap-4 hover-scale group">
                    <div className="text-2xl sm:text-4xl font-bold text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-200">2</div>
                    <p className="font-medium text-green-800 dark:text-green-300">Hours Duration</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-3 sm:p-6 rounded-2xl border border-orange-200 dark:border-orange-800 flex items-center gap-3 sm:gap-4 hover-scale group">
                    <div className="text-2xl sm:text-4xl font-bold text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-200">70%</div>
                    <p className="font-medium text-orange-800 dark:text-orange-300">Passing Grade</p>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Tutorial Lectures Section */}
        <div className="animate-fade-in">
          <CMFASTutorialLectures
            videos={tutorialLectures}
            moduleId="m9"
            moduleName="M9 Module"
            onUpdate={handleUpdate}
          />
        </div>
      </div>
    </div>
  );
}