import { Helmet } from "react-helmet-async";
import { CMFASModuleHeader } from "@/components/cmfas/CMFASHubHero";
import { CMFASModuleCourseLayout } from "@/components/cmfas/CMFASModuleCourseLayout";
import { CMFASUsefulLinks } from "@/components/cmfas/CMFASUsefulLinks";
import { CMFASHubChatFAB } from "@/components/cmfas/CMFASHubChatFAB";
import { useState, useEffect } from "react";
import { useProductUpdate } from "@/hooks/useProductUpdate";
import { supabase } from "@/integrations/supabase/client";

export default function M9AModule() {
  const productId = "m9a-module";
  const { updateProduct } = useProductUpdate();

  const [tutorialLectures, setTutorialLectures] = useState([
    {
      id: "m9a-intro",
      title: "M9A Introduction & Overview",
      description: "Introduction to structured products and investment-linked policies",
      url: "/lectures/m9a-intro.mp4",
      duration: 1800,
      order: 0,
      category: "Introduction",
    },
    {
      id: "m9a-structured-products",
      title: "Introduction to Structured Products",
      description: "Understanding structured products and their features",
      url: "/lectures/m9a-structured-products.mp4",
      duration: 2400,
      order: 1,
      category: "Core Concepts",
    },
    {
      id: "m9a-derivatives",
      title: "Understanding Derivatives",
      description: "Derivatives in structured products",
      url: "/lectures/m9a-derivatives.mp4",
      duration: 2700,
      order: 2,
      category: "Core Concepts",
    },
    {
      id: "m9a-structured-ilps",
      title: "Introduction to Structured ILPs",
      description: "Structured investment-linked policies",
      url: "/lectures/m9a-structured-ilps.mp4",
      duration: 3000,
      order: 3,
      category: "Products",
    },
    {
      id: "m9a-case-studies",
      title: "Case Studies & Applications",
      description: "Real-world applications and case studies",
      url: "/lectures/m9a-case-studies.mp4",
      duration: 2100,
      order: 4,
      category: "Applications",
    },
  ]);

  const [usefulLinks, setUsefulLinks] = useState([
    {
      id: "m9a-study-guide",
      name: "Official M9A Study Guide",
      url: "https://example.com/m9a-study-guide",
      description: "Comprehensive study guide for M9A exam",
      icon: "Book",
    },
    {
      id: "m9a-derivatives-guide",
      name: "Derivatives Reference Guide",
      url: "https://example.com/derivatives-guide",
      description: "Understanding derivatives in structured products",
      icon: "TrendingUp",
    },
  ]);

  const [customGptLink, setCustomGptLink] = useState<string>("https://chatgpt.com/g/g-example-m9a");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase.from("products").select("*").eq("id", productId).single();

        if (error && error.code !== "PGRST116") {
          console.error("Error loading M9A module data:", error);
          return;
        }

        if (data) {
          if (data.training_videos && Array.isArray(data.training_videos)) {
            setTutorialLectures(data.training_videos as any[]);
          }
          if (data.useful_links && Array.isArray(data.useful_links)) {
            setUsefulLinks(data.useful_links as any[]);
          }
          if (data.custom_gpt_link && typeof data.custom_gpt_link === "string") {
            setCustomGptLink(data.custom_gpt_link);
          }
        } else {
          const categoryResult = await supabase.from("categories").select("id").eq("name", "Learning Modules").single();
          const { error: insertError } = await supabase.from("products").insert({
            id: productId,
            title: "CMFAS M9A Module",
            description: "Life Insurance & Investment-Linked Policies II",
            category_id: categoryResult.data?.id,
            training_videos: tutorialLectures,
            useful_links: usefulLinks,
            custom_gpt_link: customGptLink,
          });

          if (insertError) {
            console.error("Error creating M9A module entry:", insertError);
          }
        }
      } catch (error) {
        console.error("Error in loadData:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId]);

  const handleUpdate = async (field: string, value: any) => {
    try {
      if (field === "tutorial_lectures") {
        setTutorialLectures(value);
        await updateProduct(productId, "training_videos", value);
      } else if (field === "useful_links") {
        setUsefulLinks(value);
        await updateProduct(productId, "useful_links", value);
      } else if (field === "custom_gpt_link") {
        setCustomGptLink(value);
        await updateProduct(productId, "custom_gpt_link", value);
      }
    } catch (error) {
      console.error("Error updating M9A module:", error);
      if (field === "tutorial_lectures") {
        const { data } = await supabase.from("products").select("training_videos").eq("id", productId).single();
        if (data && Array.isArray(data.training_videos)) {
          setTutorialLectures(data.training_videos as any[]);
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center overflow-x-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading M9A Module...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-background via-background to-muted/20">
      <Helmet>
        <title>CMFAS M9A - Life Insurance & Investment-Linked Policies II</title>
        <meta
          name="description"
          content="Complete guide to CMFAS M9A exam covering structured products and investment-linked policies with detailed syllabus and exam format."
        />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
      </Helmet>

      <header role="banner">
        <CMFASModuleHeader
          title="CMFAS M9A Module"
          subtitle="Life Insurance & Investment-Linked Policies II"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "CMFAS Exams", href: "/cmfas-exams" },
            { label: "M9A Module" },
          ]}
        />
      </header>

      <CMFASModuleCourseLayout
        routeModuleId="m9a"
        videos={tutorialLectures}
        moduleName="M9A Module"
        defaultTab="overview"
        tabCourseContent={
          <>
            <div className="bg-card rounded-2xl border p-4 md:p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-xl md:text-3xl">📘</span>
                </div>
                <div>
                  <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                    M9A Exam
                  </h2>
                  <p className="text-sm md:text-lg text-muted-foreground">Life Insurance & Investment-Linked Policies II</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold">📚</span>
              </div>
              <h2 className="text-2xl font-bold">Course contents</h2>
            </div>
            <div className="grid lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <div className="space-y-3">
                {[
                  { chapter: 1, title: "Introduction To Structured Products" },
                  { chapter: 2, title: "Risk Considerations Of Structured Products" },
                  { chapter: 3, title: "Understanding Derivatives" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-muted/80 to-muted/40 rounded-xl border hover:shadow-md transition-all duration-200 hover-scale group"
                  >
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
                  { chapter: 4, title: "Introduction To Structured ILPs" },
                  { chapter: 5, title: "Portfolio Of Investments With An Insurance" },
                  { chapter: 6, title: "Case Studies" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-muted/80 to-muted/40 rounded-xl border hover:shadow-md transition-all duration-200 hover-scale group"
                  >
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
          </>
        }
        tabOverview={
          <>
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary font-bold">👥</span>
                </div>
                <h2 className="text-2xl font-bold">For whom</h2>
              </div>
              <div className="bg-muted/50 rounded-xl p-6 border-l-4 border-green-500">
                <p className="text-muted-foreground leading-relaxed">
                  The M9A is intended for new or existing representatives of financial advisers who need to comply with
                  the MAS requirement to possess the requisite knowledge to advise others and/or arrange
                  Investment-linked Life Insurance Policies (ILPs).
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-6 rounded-2xl border border-amber-200 dark:border-amber-800 mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">⚠️</span>
                </div>
                <h3 className="font-bold text-amber-800 dark:text-amber-200">Important notes</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  "Computer Screen Examination (CSE) in English medium",
                  "One mark awarded for each correct answer",
                  "No marks deducted for wrong or blank answers",
                  "Use eBook for preparation - no hard-copy texts issued",
                  "Only Result Slip will be issued, no certificate",
                  "Self-study for closed-book examination",
                ].map((note, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0"></div>
                    <p className="text-sm text-amber-800 dark:text-amber-200">{note}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold">🎯</span>
                </div>
                <h2 className="text-2xl font-bold">Learning objectives</h2>
              </div>
              <div className="bg-muted/50 rounded-xl p-6">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  The objective of this course is to test candidates on their knowledge and understanding of:
                </p>
                <div className="grid gap-3">
                  {[
                    "Features, types, advantages, and disadvantages of structured products, comparison with other investment options, governance structure",
                    "Documentation and risks associated with the investment of structured products, particularly Structured ILPs",
                    "Structured ILPs on product features, inherent risks, and performance under various market conditions",
                    "Various types of derivatives in the market, both on-the-exchange and over-the-counter",
                    "Applications of structured funds relating to product features, inherent risks, and performance",
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
            </div>
          </>
        }
        tabUsefulLinks={<CMFASUsefulLinks links={usefulLinks} onUpdate={handleUpdate} />}
        tabExam={
          <>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold">📝</span>
              </div>
              <h2 className="text-2xl font-bold">Exam format</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 sm:p-6 rounded-2xl border border-blue-200 dark:border-blue-800 flex items-center gap-3 sm:gap-4 hover-scale group">
                <div className="text-2xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-200">
                  50
                </div>
                <p className="font-medium text-blue-800 dark:text-blue-300">Multiple Choice Questions</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 sm:p-6 rounded-2xl border border-green-200 dark:border-green-800 flex items-center gap-3 sm:gap-4 hover-scale group">
                <div className="text-2xl sm:text-4xl font-bold text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform duration-200">
                  1
                </div>
                <p className="font-medium text-green-800 dark:text-green-300">Hour Duration</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-3 sm:p-6 rounded-2xl border border-orange-200 dark:border-orange-800 flex items-center gap-3 sm:gap-4 hover-scale group">
                <div className="text-2xl sm:text-4xl font-bold text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-200">
                  70%
                </div>
                <p className="font-medium text-orange-800 dark:text-orange-300">Passing Grade</p>
              </div>
            </div>
          </>
        }
      />

      <CMFASHubChatFAB moduleId="m9a" />
    </div>
  );
}
