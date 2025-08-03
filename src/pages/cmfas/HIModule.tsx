import { Helmet } from "react-helmet-async";
import { NavigationHeader } from "@/components/NavigationHeader";
import { CMFASTutorialLectures } from "@/components/cmfas/CMFASTutorialLectures";
import { CMFASUsefulLinks } from "@/components/cmfas/CMFASUsefulLinks";
import { CMFASChatLauncher } from "@/components/cmfas/CMFASChatLauncher";
import { useState, useEffect } from "react";
import { useProductUpdate } from "@/hooks/useProductUpdate";
import { supabase } from "@/integrations/supabase/client";

export default function HIModule() {
  const productId = 'hi-module';
  const { updateProduct } = useProductUpdate();
  
  const [tutorialLectures, setTutorialLectures] = useState([
    {
      id: 'hi-intro',
      title: 'HI Introduction & Overview',
      description: 'Introduction to health insurance and Singapore healthcare system',
      url: '/lectures/hi-intro.mp4',
      duration: 1800, // 30 minutes
      order: 0,
      category: 'Introduction'
    },
    {
      id: 'hi-medical-expense',
      title: 'Medical Expense Insurance',
      description: 'Understanding medical expense insurance products',
      url: '/lectures/hi-medical-expense.mp4',
      duration: 2400, // 40 minutes
      order: 1,
      category: 'Core Products'
    },
    {
      id: 'hi-disability-income',
      title: 'Disability Income Insurance',
      description: 'Disability income insurance concepts and applications',
      url: '/lectures/hi-disability-income.mp4',
      duration: 2100, // 35 minutes
      order: 2,
      category: 'Core Products'
    },
    {
      id: 'hi-critical-illness',
      title: 'Critical Illness Insurance',
      description: 'Critical illness insurance features and benefits',
      url: '/lectures/hi-critical-illness.mp4',
      duration: 2700, // 45 minutes
      order: 3,
      category: 'Core Products'
    },
    {
      id: 'hi-underwriting',
      title: 'Health Insurance Underwriting',
      description: 'Underwriting principles and processes',
      url: '/lectures/hi-underwriting.mp4',
      duration: 2400, // 40 minutes
      order: 4,
      category: 'Technical'
    },
    {
      id: 'hi-case-studies',
      title: 'Case Studies & Financial Needs Analysis',
      description: 'Practical applications and case studies',
      url: '/lectures/hi-case-studies.mp4',
      duration: 3000, // 50 minutes
      order: 5,
      category: 'Applications'
    }
  ]);

  const [usefulLinks, setUsefulLinks] = useState([
    {
      id: 'hi-study-guide',
      name: 'Official HI Study Guide',
      url: 'https://example.com/hi-study-guide',
      description: 'Comprehensive study guide for HI exam',
      icon: 'Heart'
    },
    {
      id: 'hi-healthcare-system',
      name: 'Singapore Healthcare System',
      url: 'https://www.moh.gov.sg',
      description: 'MOH healthcare system overview',
      icon: 'Building'
    }
  ]);

  const [customGptLink, setCustomGptLink] = useState<string>("https://chatgpt.com/g/g-example-hi");
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
          console.error('Error loading HI module data:', error);
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
          const categoryResult = await supabase.from('categories').select('id').eq('name', 'Learning Modules').single();
          const { error: insertError } = await supabase
            .from('products')
            .insert({
              id: productId,
              title: 'CMFAS HI Module',
              description: 'Health Insurance',
              category_id: categoryResult.data?.id,
              training_videos: tutorialLectures,
              useful_links: usefulLinks,
              custom_gpt_link: customGptLink
            });

          if (insertError) {
            console.error('Error creating HI module entry:', insertError);
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
      console.error('Error updating HI module:', error);
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
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading HI Module...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>CMFAS HI - Health Insurance</title>
        <meta name="description" content="Complete guide to CMFAS HI exam covering health insurance products including medical expense, disability income, and critical illness insurance." />
      </Helmet>

      <NavigationHeader 
        title="CMFAS HI Module"
        subtitle="Health Insurance"
      />
      
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* CMFAS Chat Launcher */}
        <div className="mb-6 md:mb-8">
          <CMFASChatLauncher
            moduleId="hi"
            moduleName="HI Module - Health Insurance"
            description="Get instant help with HI exam topics including healthcare systems, medical insurance products, and claims processes"
          />
        </div>

        <div className="bg-card rounded-lg p-4 md:p-6 border mobile-card">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <span className="text-xl md:text-2xl">📘</span>
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold">HI Exam</h1>
              <p className="text-sm md:text-base text-muted-foreground">Health Insurance</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">For Whom</h2>
              <p className="text-muted-foreground mb-4">
                The HI exam is intended for all life and general insurance intermediaries and company staff members who are involved in advising and/or selling any Health Insurance products including:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Objectives</h2>
              <p className="text-muted-foreground">
                The objective of this course is to ensure insurance intermediaries and company staff members who are involved in advising and/or selling Health Insurance products have the requisite knowledge of the healthcare environment in Singapore, as well as the various types of Health Insurance products in the insurance market.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Course Contents</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 1</p>
                    <p className="text-sm">Overview Of Healthcare Environment In Singapore</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 2</p>
                    <p className="text-sm">Medical Expense Insurance</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 3</p>
                    <p className="text-sm">Group Medical Expense Insurance</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 4</p>
                    <p className="text-sm">Disability Income Insurance</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 5</p>
                    <p className="text-sm">Long-Term Care Insurance</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 6</p>
                    <p className="text-sm">Critical Illness Insurance</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 7</p>
                    <p className="text-sm">Other Types of Health Insurance</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 8</p>
                    <p className="text-sm">Managed Healthcare</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 9</p>
                    <p className="text-sm">Healthcare Financing</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 10</p>
                    <p className="text-sm">Common Policy Provisions</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 11</p>
                    <p className="text-sm">Health Insurance Pricing</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 12</p>
                    <p className="text-sm">Health Insurance Underwriting</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 13</p>
                    <p className="text-sm">MAS 120 – Disclosure And Advisory Process</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 14</p>
                    <p className="text-sm">Financial Needs Analysis</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 15</p>
                    <p className="text-sm">Case Studies</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Exam Format</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">50</div>
                  <p className="text-sm font-medium">Multiple Choice Questions</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">1:15</div>
                  <p className="text-sm font-medium">Hour 15 Minutes</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">70%</div>
                  <p className="text-sm font-medium">Passing Grade</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="font-medium mb-2">Important Notes</h3>
              <ul className="text-sm space-y-1">
                <li>• Computer Screen Examination (CSE) in English medium</li>
                <li>• One mark awarded for each correct answer</li>
                <li>• No marks deducted for wrong or blank answers</li>
                <li>• Use eBook for preparation - no hard-copy texts issued</li>
                <li>• Only Result Slip will be issued, no certificate</li>
                <li>• Self-study for closed-book examination</li>
              </ul>
            </div>
            </div>
          </div>
        </div>

        {/* Tutorial Lectures Section */}
        <div className="mt-8">
          <CMFASTutorialLectures
            videos={tutorialLectures}
            moduleId="hi-module"
            moduleName="HI Module"
            onUpdate={handleUpdate}
          />
        </div>

    </div>
  );
}