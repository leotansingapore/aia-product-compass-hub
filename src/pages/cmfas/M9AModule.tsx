import { Helmet } from "react-helmet-async";
import { NavigationHeader } from "@/components/NavigationHeader";
import { CMFASTutorialLectures } from "@/components/cmfas/CMFASTutorialLectures";
import { CMFASUsefulLinks } from "@/components/cmfas/CMFASUsefulLinks";
import { CMFASChatLauncher } from "@/components/cmfas/CMFASChatLauncher";
import { useState, useEffect } from "react";
import { useProductUpdate } from "@/hooks/useProductUpdate";
import { supabase } from "@/integrations/supabase/client";

export default function M9AModule() {
  const productId = 'm9a-module';
  const { updateProduct } = useProductUpdate();
  
  const [tutorialLectures, setTutorialLectures] = useState([
    {
      id: 'm9a-intro',
      title: 'M9A Introduction & Overview',
      description: 'Introduction to structured products and investment-linked policies',
      url: '/lectures/m9a-intro.mp4',
      duration: 1800, // 30 minutes
      order: 0,
      category: 'Introduction'
    },
    {
      id: 'm9a-structured-products',
      title: 'Introduction to Structured Products',
      description: 'Understanding structured products and their features',
      url: '/lectures/m9a-structured-products.mp4',
      duration: 2400, // 40 minutes
      order: 1,
      category: 'Core Concepts'
    },
    {
      id: 'm9a-derivatives',
      title: 'Understanding Derivatives',
      description: 'Derivatives in structured products',
      url: '/lectures/m9a-derivatives.mp4',
      duration: 2700, // 45 minutes
      order: 2,
      category: 'Core Concepts'
    },
    {
      id: 'm9a-structured-ilps',
      title: 'Introduction to Structured ILPs',
      description: 'Structured investment-linked policies',
      url: '/lectures/m9a-structured-ilps.mp4',
      duration: 3000, // 50 minutes
      order: 3,
      category: 'Products'
    },
    {
      id: 'm9a-case-studies',
      title: 'Case Studies & Applications',
      description: 'Real-world applications and case studies',
      url: '/lectures/m9a-case-studies.mp4',
      duration: 2100, // 35 minutes
      order: 4,
      category: 'Applications'
    }
  ]);

  const [usefulLinks, setUsefulLinks] = useState([
    {
      id: 'm9a-study-guide',
      name: 'Official M9A Study Guide',
      url: 'https://example.com/m9a-study-guide',
      description: 'Comprehensive study guide for M9A exam',
      icon: 'Book'
    },
    {
      id: 'm9a-derivatives-guide',
      name: 'Derivatives Reference Guide',
      url: 'https://example.com/derivatives-guide',
      description: 'Understanding derivatives in structured products',
      icon: 'TrendingUp'
    }
  ]);

  const [customGptLink, setCustomGptLink] = useState<string>("https://chatgpt.com/g/g-example-m9a");
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
          console.error('Error loading M9A module data:', error);
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
              title: 'CMFAS M9A Module',
              description: 'Life Insurance & Investment-Linked Policies II',
              category_id: categoryResult.data?.id,
              training_videos: tutorialLectures,
              useful_links: usefulLinks,
              custom_gpt_link: customGptLink
            });

          if (insertError) {
            console.error('Error creating M9A module entry:', insertError);
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
      console.error('Error updating M9A module:', error);
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
          <p className="mt-4 text-muted-foreground">Loading M9A Module...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>CMFAS M9A - Life Insurance & Investment-Linked Policies II</title>
        <meta name="description" content="Complete guide to CMFAS M9A exam covering structured products and investment-linked policies with detailed syllabus and exam format." />
      </Helmet>

      <NavigationHeader 
        title="CMFAS M9A Module"
        subtitle="Life Insurance & Investment-Linked Policies II"
      />
      
      <div className="max-w-4xl mx-auto px-1 sm:px-4 md:px-6 py-2 sm:py-6 md:py-8">
        {/* CMFAS Chat Launcher */}
        <div className="mb-6 md:mb-8">
          <CMFASChatLauncher
            moduleId="m9a"
            moduleName="M9A Module - Life Insurance & Investment-Linked Policies II"
            description="Get instant help with M9A exam topics including structured products, funds, and advanced investment-linked policies"
          />
        </div>

        <div className="bg-card rounded-lg p-4 md:p-6 border mobile-card">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <span className="text-xl md:text-2xl">📘</span>
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold">M9A Exam</h1>
              <p className="text-sm md:text-base text-muted-foreground">Life Insurance & Investment-Linked Policies II</p>
            </div>
          </div>
          
          <div className="space-y-6 md:space-y-8">
            <div>
              <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">For Whom</h2>
              <p className="text-sm md:text-base text-muted-foreground">
                The M9A is intended for new or existing representatives of financial advisers who need to comply with the MAS requirement to possess the requisite knowledge to advise others and/or arrange Investment-linked Life Insurance Policies (ILPs).
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Objectives</h2>
              <p className="text-muted-foreground mb-4">The objective of this course is to test candidates on their knowledge and understanding of:</p>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside ml-4">
                <li>Features, types, advantages, and disadvantages of structured products, comparison with other investment options, governance structure</li>
                <li>Documentation and risks associated with the investment of structured products, particularly Structured ILPs</li>
                <li>Structured ILPs on product features, inherent risks, and performance under various market conditions</li>
                <li>Various types of derivatives in the market, both on-the-exchange and over-the-counter</li>
                <li>Applications of structured funds relating to product features, inherent risks, and performance</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Course Contents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 1</p>
                    <p className="text-sm">Introduction To Structured Products</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 2</p>
                    <p className="text-sm">Risk Considerations Of Structured Products</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 3</p>
                    <p className="text-sm">Understanding Derivatives</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 4</p>
                    <p className="text-sm">Introduction To Structured ILPs</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 5</p>
                    <p className="text-sm">Portfolio Of Investments With An Insurance</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 6</p>
                    <p className="text-sm">Case Studies</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Exam Format</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">50</div>
                  <p className="text-sm font-medium">Multiple Choice Questions</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">1</div>
                  <p className="text-sm font-medium">Hour Duration</p>
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
            moduleId="m9a-module"
            moduleName="M9A Module"
            onUpdate={handleUpdate}
          />
        </div>

    </div>
  );
}