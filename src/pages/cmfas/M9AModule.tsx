import { Helmet } from "react-helmet-async";
import { NavigationHeader } from "@/components/NavigationHeader";
import { CMFASTutorialLectures } from "@/components/cmfas/CMFASTutorialLectures";
import { CMFASUsefulLinks } from "@/components/cmfas/CMFASUsefulLinks";
import { CMFASChatbot } from "@/components/cmfas/CMFASChatbot";
import { useState } from "react";

export default function M9AModule() {
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

  const handleUpdate = async (field: string, value: any) => {
    if (field === 'tutorial_lectures') {
      setTutorialLectures(value);
    } else if (field === 'useful_links') {
      setUsefulLinks(value);
    } else if (field === 'custom_gpt_link') {
      setCustomGptLink(value);
    }
  };
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
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Top Section - Useful Links and AI Assistant */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <CMFASUsefulLinks
            links={usefulLinks}
            onUpdate={handleUpdate}
          />
          <CMFASChatbot
            moduleId="m9a"
            moduleName="M9A Module - Life Insurance & Investment-Linked Policies II"
          />
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📘</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">M9A Exam</h1>
              <p className="text-muted-foreground">Life Insurance & Investment-Linked Policies II</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">For Whom</h2>
              <p className="text-muted-foreground">
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
              <div className="grid md:grid-cols-2 gap-6">
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
              <div className="grid md:grid-cols-3 gap-4">
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
            moduleId="m9a"
            moduleName="M9A Module"
            onUpdate={handleUpdate}
          />
        </div>

    </div>
  );
}