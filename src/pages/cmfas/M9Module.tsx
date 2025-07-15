import { Helmet } from "react-helmet-async";
import { NavigationHeader } from "@/components/NavigationHeader";
import { CMFASTutorialLectures } from "@/components/cmfas/CMFASTutorialLectures";
import { useState } from "react";

export default function M9Module() {
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

  const handleLectureUpdate = async (field: string, value: any) => {
    if (field === 'tutorial_lectures') {
      setTutorialLectures(value);
    }
  };
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>CMFAS M9 - Life Insurance & Investment-Linked Policies</title>
        <meta name="description" content="Complete guide to CMFAS M9 exam covering life insurance and investment-linked policies with detailed syllabus and exam format." />
      </Helmet>

      <NavigationHeader 
        title="CMFAS M9 Module"
        subtitle="Life Insurance & Investment-Linked Policies"
      />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-card rounded-lg p-6 border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📘</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">M9 Exam</h1>
              <p className="text-muted-foreground">Life Insurance & Investment-Linked Policies</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">For Whom</h2>
              <p className="text-muted-foreground">
                The M9 exam is intended for those who are looking to provide advice on and/or arrange life insurance policies (whether or not including investment-linked policies). 
                You are required to pass this module, together with Module 5 on Rules And Regulations For Financial Advisory Services, in compliance with the requirements as laid down by the Monetary Authority of Singapore (MAS).
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Objectives</h2>
              <p className="text-muted-foreground mb-4">The objective of this course is to test candidates on their knowledge and understanding of:</p>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside ml-4">
                <li>Life insurance and life insurance concepts, including setting life insurance premiums and classification of life insurance products</li>
                <li>Different types of traditional life insurance products</li>
                <li>Various types of riders; investment-linked policies; and annuities</li>
                <li>Industry practices including the application and underwriting process; policy services and claims practices</li>
                <li>Contractual provisions and legal issues such as the law of agency and other relevant aspects such as income tax, insurance nomination, wills, and trust</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Course Contents</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 1</p>
                    <p className="text-sm">Risk And Life Insurance</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 2</p>
                    <p className="text-sm">Setting Life Insurance Premium</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 3</p>
                    <p className="text-sm">Classification Of Life Insurance Products</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 4</p>
                    <p className="text-sm">Traditional Life Insurance Products</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 5</p>
                    <p className="text-sm">Riders (Or Supplementary Benefits)</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 6</p>
                    <p className="text-sm">Participating Life Insurance Policies</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 7</p>
                    <p className="text-sm">Investment-linked Life Insurance Policies (ILPS)</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 8</p>
                    <p className="text-sm">Investment-linked Sub-Funds</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 9</p>
                    <p className="text-sm">Investment-linked Life Insurance Products: Computational Aspects</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 10</p>
                    <p className="text-sm">Annuities</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 11</p>
                    <p className="text-sm">Application And Underwriting</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 12</p>
                    <p className="text-sm">Policy Services</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 13</p>
                    <p className="text-sm">Life Insurance Claims</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 14</p>
                    <p className="text-sm">The Insurance Contract</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 15</p>
                    <p className="text-sm">Law Of Agency</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 16</p>
                    <p className="text-sm">Income Tax And Life Insurance</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium text-sm">Chapter 17</p>
                    <p className="text-sm">Insurance Nomination, Wills And Trusts</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Exam Format</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">100</div>
                  <p className="text-sm font-medium">Multiple Choice Questions</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">2</div>
                  <p className="text-sm font-medium">Hours Duration</p>
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
              </ul>
            </div>
            </div>
          </div>
        </div>

        {/* Tutorial Lectures Section */}
        <div className="mt-8">
          <CMFASTutorialLectures
            videos={tutorialLectures}
            moduleId="m9"
            moduleName="M9 Module"
            onUpdate={handleLectureUpdate}
          />
        </div>
    </div>
  );
}