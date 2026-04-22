import { Helmet } from "react-helmet-async";
import { CMFASModuleHeader } from "@/components/cmfas/CMFASHubHero";
import { CMFASModuleCourseLayout } from "@/components/cmfas/CMFASModuleCourseLayout";
import { CMFASUsefulLinks } from "@/components/cmfas/CMFASUsefulLinks";
import { CMFASHubChatFAB } from "@/components/cmfas/CMFASHubChatFAB";
import { useState, useEffect } from "react";
import { useProductUpdate } from "@/hooks/useProductUpdate";
import { supabase } from "@/integrations/supabase/client";

export default function HIModule() {
  const productId = "hi-module";
  const { updateProduct } = useProductUpdate();

  const [tutorialLectures, setTutorialLectures] = useState([
    {
      id: "hi-intro",
      title: "HI Introduction & Overview",
      description: "Introduction to health insurance and Singapore healthcare system",
      url: "/lectures/hi-intro.mp4",
      duration: 1800,
      order: 0,
      category: "Introduction",
    },
    {
      id: "hi-medical-expense",
      title: "Medical Expense Insurance",
      description: "Understanding medical expense insurance products",
      url: "/lectures/hi-medical-expense.mp4",
      duration: 2400,
      order: 1,
      category: "Core Products",
    },
    {
      id: "hi-disability-income",
      title: "Disability Income Insurance",
      description: "Disability income insurance concepts and applications",
      url: "/lectures/hi-disability-income.mp4",
      duration: 2100,
      order: 2,
      category: "Core Products",
    },
    {
      id: "hi-critical-illness",
      title: "Critical Illness Insurance",
      description: "Critical illness insurance features and benefits",
      url: "/lectures/hi-critical-illness.mp4",
      duration: 2700,
      order: 3,
      category: "Core Products",
    },
    {
      id: "hi-underwriting",
      title: "Health Insurance Underwriting",
      description: "Underwriting principles and processes",
      url: "/lectures/hi-underwriting.mp4",
      duration: 2400,
      order: 4,
      category: "Technical",
    },
    {
      id: "hi-case-studies",
      title: "Case Studies & Financial Needs Analysis",
      description: "Practical applications and case studies",
      url: "/lectures/hi-case-studies.mp4",
      duration: 3000,
      order: 5,
      category: "Applications",
    },
  ]);

  const [usefulLinks, setUsefulLinks] = useState([
    {
      id: "hi-study-guide",
      name: "Official HI Study Guide",
      url: "https://example.com/hi-study-guide",
      description: "Comprehensive study guide for HI exam",
      icon: "Heart",
    },
    {
      id: "hi-healthcare-system",
      name: "Singapore Healthcare System",
      url: "https://www.moh.gov.sg",
      description: "MOH healthcare system overview",
      icon: "Building",
    },
  ]);

  const [customGptLink, setCustomGptLink] = useState<string>("https://chatgpt.com/g/g-example-hi");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data, error } = await supabase.from("products").select("*").eq("id", productId).single();

        if (error && error.code !== "PGRST116") {
          console.error("Error loading HI module data:", error);
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
            title: "CMFAS HI Module",
            description: "Health Insurance",
            category_id: categoryResult.data?.id,
            training_videos: tutorialLectures,
            useful_links: usefulLinks,
            custom_gpt_link: customGptLink,
          });

          if (insertError) {
            console.error("Error creating HI module entry:", insertError);
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
      console.error("Error updating HI module:", error);
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
      <div className="flex min-h-screen items-center justify-center overflow-x-hidden bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading HI Module...</p>
        </div>
      </div>
    );
  }

  const chaptersCol1 = [
    { chapter: 1, title: "Overview Of Healthcare Environment In Singapore" },
    { chapter: 2, title: "Medical Expense Insurance" },
    { chapter: 3, title: "Group Medical Expense Insurance" },
    { chapter: 4, title: "Disability Income Insurance" },
    { chapter: 5, title: "Long-Term Care Insurance" },
    { chapter: 6, title: "Critical Illness Insurance" },
    { chapter: 7, title: "Other Types of Health Insurance" },
    { chapter: 8, title: "Managed Healthcare" },
  ];
  const chaptersCol2 = [
    { chapter: 9, title: "Healthcare Financing" },
    { chapter: 10, title: "Common Policy Provisions" },
    { chapter: 11, title: "Health Insurance Pricing" },
    { chapter: 12, title: "Health Insurance Underwriting" },
    { chapter: 13, title: "MAS 120 – Disclosure And Advisory Process" },
    { chapter: 14, title: "Financial Needs Analysis" },
    { chapter: 15, title: "Case Studies" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Helmet>
        <title>CMFAS HI - Health Insurance</title>
        <meta
          name="description"
          content="Complete guide to CMFAS HI exam covering health insurance products including medical expense, disability income, and critical illness insurance."
        />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
      </Helmet>

      <header role="banner">
        <CMFASModuleHeader
          title="CMFAS HI Module"
          subtitle="Health Insurance"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "CMFAS Exams", href: "/cmfas-exams" },
            { label: "HI Module" },
          ]}
        />
      </header>

      <CMFASModuleCourseLayout
        routeModuleId="hi"
        videos={tutorialLectures}
        moduleName="HI Module"
        defaultTab="overview"
        tabCourseContent={
          <>
            <div className="bg-card rounded-lg p-4 md:p-6 border mobile-card mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl md:text-2xl">📘</span>
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-bold">HI Exam</h2>
                  <p className="text-sm md:text-base text-muted-foreground">Health Insurance</p>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-4">Syllabus chapters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3">
                {chaptersCol1.map((item, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter {item.chapter}</p>
                    <p className="text-sm">{item.title}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {chaptersCol2.map((item, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter {item.chapter}</p>
                    <p className="text-sm">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        }
        tabOverview={
          <>
            <h2 className="text-xl font-semibold mb-4">For whom</h2>
            <p className="text-muted-foreground mb-4">
              The HI exam is intended for all life and general insurance intermediaries and company staff members who are
              involved in advising and/or selling any Health Insurance products including:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <ul className="text-muted-foreground space-y-2 list-disc list-inside ml-4">
                <li>Medical Expense Insurance</li>
                <li>Disability Income Insurance</li>
                <li>Long-Term Care Insurance</li>
              </ul>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside ml-4">
                <li>Critical Illness Insurance</li>
                <li>Managed Healthcare Insurance</li>
              </ul>
            </div>
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-semibold">Learning objectives</h2>
              <p className="text-muted-foreground">
                The objective of this course is to ensure insurance intermediaries and company staff members who are
                involved in advising and/or selling Health Insurance products have the requisite knowledge of the
                healthcare environment in Singapore, as well as the various types of Health Insurance products in the
                insurance market.
              </p>
            </div>
          </>
        }
        tabUsefulLinks={<CMFASUsefulLinks links={usefulLinks} onUpdate={handleUpdate} />}
        tabExam={
          <>
            <h2 className="text-xl font-semibold mb-4">Exam format</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center gap-3 sm:gap-4">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 shrink-0">50</div>
                <p className="text-sm font-medium">Multiple Choice Questions</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-3 sm:gap-4">
                <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 shrink-0">1:15</div>
                <p className="text-sm font-medium">Hour 15 Minutes</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 sm:p-4 rounded-lg border border-orange-200 dark:border-orange-800 flex items-center gap-3 sm:gap-4">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400 shrink-0">70%</div>
                <p className="text-sm font-medium">Passing Grade</p>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="font-medium mb-2">Important notes</h3>
              <ul className="text-sm space-y-1">
                <li>• Computer Screen Examination (CSE) in English medium</li>
                <li>• One mark awarded for each correct answer</li>
                <li>• No marks deducted for wrong or blank answers</li>
                <li>• Use eBook for preparation - no hard-copy texts issued</li>
                <li>• Only Result Slip will be issued, no certificate</li>
                <li>• Self-study for closed-book examination</li>
              </ul>
            </div>
          </>
        }
      />

      <CMFASHubChatFAB moduleId="hi" />
    </div>
  );
}
