import { Helmet } from "react-helmet-async";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { CMFASTutorialLectures } from "@/components/cmfas/CMFASTutorialLectures";
import { CMFASUsefulLinks } from "@/components/cmfas/CMFASUsefulLinks";
import { CMFASChatLauncher } from "@/components/cmfas/CMFASChatLauncher";
import { useState, useEffect } from "react";
import { useProductUpdate } from "@/hooks/useProductUpdate";
import { supabase } from "@/integrations/supabase/client";

export default function RES5Module() {
  const productId = 'res5-module';
  const { updateProduct } = useProductUpdate();
  
  const [tutorialLectures, setTutorialLectures] = useState([
    {
      id: 'res5-intro',
      title: 'RES5 Introduction & Overview',
      description: 'Introduction to financial advisory rules and regulations',
      url: '/lectures/res5-intro.mp4',
      duration: 1800, // 30 minutes
      order: 0,
      category: 'Introduction'
    },
    {
      id: 'res5-faa-regulations',
      title: 'Financial Advisers Act & Regulations',
      description: 'Understanding the Financial Advisers Act and key regulations',
      url: '/lectures/res5-faa-regulations.mp4',
      duration: 3000, // 50 minutes
      order: 1,
      category: 'Regulations'
    },
    {
      id: 'res5-mas-notices',
      title: 'MAS Notices Overview',
      description: 'Key MAS notices and their applications',
      url: '/lectures/res5-mas-notices.mp4',
      duration: 2700, // 45 minutes
      order: 2,
      category: 'Regulations'
    },
    {
      id: 'res5-conduct-business',
      title: 'Conduct of Business Rules',
      description: 'Business conduct requirements and compliance',
      url: '/lectures/res5-conduct-business.mp4',
      duration: 2400, // 40 minutes
      order: 3,
      category: 'Regulations'
    },
    {
      id: 'res5-ethics',
      title: 'Professional Ethics',
      description: 'Ethics, professionalism, and conflict of interest',
      url: '/lectures/res5-ethics.mp4',
      duration: 2100, // 35 minutes
      order: 4,
      category: 'Ethics'
    },
    {
      id: 'res5-client-relations',
      title: 'Client Relations & Advisory Process',
      description: 'Client relationships and advisory best practices',
      url: '/lectures/res5-client-relations.mp4',
      duration: 2400, // 40 minutes
      order: 5,
      category: 'Skills'
    },
    {
      id: 'res5-financial-planning',
      title: 'Financial Planning & Needs Analysis',
      description: 'Financial planning process and needs analysis',
      url: '/lectures/res5-financial-planning.mp4',
      duration: 3000, // 50 minutes
      order: 6,
      category: 'Skills'
    }
  ]);

  const [usefulLinks, setUsefulLinks] = useState([
    {
      id: 'res5-study-guide',
      name: 'Official RES5 Study Guide',
      url: 'https://example.com/res5-study-guide',
      description: 'Comprehensive study guide for RES5 exam',
      icon: 'Scale'
    },
    {
      id: 'res5-mas-notices',
      name: 'MAS Notices & Guidelines',
      url: 'https://mas.gov.sg/regulation/notices',
      description: 'Latest MAS notices and guidelines',
      icon: 'FileText'
    }
  ]);

  const [customGptLink, setCustomGptLink] = useState<string>("https://chatgpt.com/g/g-example-res5");
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
          console.error('Error loading RES5 module data:', error);
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
              title: 'CMFAS RES5 Module',
              description: 'Rules, Ethics & Skills for Financial Advisory Services',
              category_id: categoryResult.data?.id,
              training_videos: tutorialLectures,
              useful_links: usefulLinks,
              custom_gpt_link: customGptLink
            });

          if (insertError) {
            console.error('Error creating RES5 module entry:', insertError);
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
      console.error('Error updating RES5 module:', error);
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
          <p className="mt-4 text-muted-foreground">Loading RES5 Module...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>CMFAS RES5 - Rules, Ethics & Skills for Financial Advisory Services</title>
        <meta name="description" content="Complete guide to CMFAS RES5 exam covering rules, ethics, and skills for financial advisory services with detailed syllabus and exam format." />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
      </Helmet>

      <BrandedPageHeader
        title="📘 CMFAS RES5 Module"
        subtitle="Rules, Ethics & Skills for Financial Advisory Services"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "CMFAS Exams", href: "/cmfas-exams" },
          { label: "RES5 Module" }
        ]}
        showBackButton={true}
        onBack={() => window.history.back()}
      />

      <div className="mx-auto px-1 sm:px-4 md:px-6 py-2 sm:py-6 md:py-8">
        {/* CMFAS Chat Launcher */}
        <div className="mb-8">
          <CMFASChatLauncher
            moduleId="res5"
            moduleName="RES5 Module - Rules, Ethics & Skills for Financial Advisory Services"
            description="Get instant help with RES5 exam topics including regulations, ethics, compliance, and professional conduct"
          />
        </div>

        <div className="bg-card rounded-lg p-3 sm:p-4 md:p-6 border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📘</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">RES5 Exam</h1>
              <p className="text-muted-foreground">Rules, Ethics & Skills for Financial Advisory Services</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">For Whom</h2>
              <p className="text-muted-foreground mb-4">
                Those intending to advise others concerning:
              </p>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside ml-4">
                <li>Securities</li>
                <li>Units in a collective investment scheme</li>
                <li>Exchange-traded derivatives contracts</li>
                <li>Spot foreign exchange contracts for leveraged trading</li>
                <li>Over-the-counter derivatives contracts</li>
                <li>Life insurance policies (whether or not including investment-linked policies)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Course Structure</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-muted p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Part I - Regulations (110 Questions)</h3>
                  <ul className="text-sm space-y-2">
                    <li>[1] Financial Advisers Act & Regulations</li>
                    <li>[2] Conduct of Business & Authority Powers</li>
                    <li>[3] MAS Notices - Part I (FAA-N16, FAA-N03, FAA-N11)</li>
                    <li>[4] MAS Notices - Part II (FAA-N02, FAA-N10, etc.)</li>
                    <li>[5] Prevention of Money Laundering (FAA-N06)</li>
                    <li>[6] MAS Notices - Part III (FAA-N17, FAA-N18, etc.)</li>
                    <li>[7] Investment-linked Policies (MAS 307)</li>
                    <li>[8] MAS Guidelines - Part I</li>
                    <li>[9] MAS Guidelines - Part II</li>
                    <li>[10] MAS Guidelines - Part III</li>
                    <li>[11] Collective Investment Schemes Code</li>
                    <li>[12] Securities Dealing - Market Conduct</li>
                    <li>[13] Central Provident Fund</li>
                  </ul>
                </div>
                <div className="bg-muted p-3 sm:p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Part II - Ethics & Skills (40 Questions)</h3>
                  <ul className="text-sm space-y-2">
                    <li>[14] Why Professional Ethics Matter</li>
                    <li>[15] Professionalism</li>
                    <li>[16] Ethical Behavior</li>
                    <li>[17] Unethical Behavior</li>
                    <li>[18] Conflict Of Interest</li>
                    <li>[20] Fair Dealing</li>
                    <li>[21] Ethical Marketing & Sales</li>
                    <li>[22] Client-Representative Relationships</li>
                    <li>[23] Fact Finding & Needs Analysis</li>
                    <li>[24] Analyzing Financial Status</li>
                    <li>[25] Developing Strategies & Solutions</li>
                    <li>[26] Presenting Analysis to Clients</li>
                    <li>[27] Reviewing Client Portfolios</li>
                    <li>[28] Basic Financial Planning Guide</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Exam Format</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center gap-3 sm:gap-4">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 shrink-0">150</div>
                  <div>
                    <p className="text-sm font-medium">Multiple Choice Questions</p>
                    <p className="text-micro text-muted-foreground mt-1">(110 Part I + 40 Part II)</p>
                  </div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-3 sm:gap-4">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 shrink-0">3</div>
                  <p className="text-sm font-medium">Hours Duration</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 sm:p-4 rounded-lg border border-orange-200 dark:border-orange-800 flex items-center gap-3 sm:gap-4">
                  <div className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400 shrink-0">75% & 80%</div>
                  <div>
                    <p className="text-sm font-medium">Passing Grades</p>
                    <p className="text-micro text-muted-foreground mt-1">(Part I & Part II)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h3 className="font-medium mb-2 text-red-800 dark:text-red-200">Critical Passing Requirements</h3>
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>You must achieve at least 75% for Part I AND at least 80% for Part II to pass.</strong> 
                Both parts must be passed simultaneously - you cannot pass one part and retake only the other.
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 sm:p-4 rounded-lg border border-amber-200 dark:border-amber-800">
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
            moduleId="res5-module"
            moduleName="RES5 Module"
            onUpdate={handleUpdate}
          />
        </div>

    </div>
  );
}