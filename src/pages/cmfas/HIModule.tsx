import { Helmet } from "react-helmet-async";
import { NavigationHeader } from "@/components/NavigationHeader";
import { CMFASTutorialLectures } from "@/components/cmfas/CMFASTutorialLectures";
import { CMFASUsefulLinks } from "@/components/cmfas/CMFASUsefulLinks";
import { CMFASAIAssistant } from "@/components/cmfas/CMFASAIAssistant";
import { useState } from "react";

export default function HIModule() {
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
        <title>CMFAS HI - Health Insurance</title>
        <meta name="description" content="Complete guide to CMFAS HI exam covering health insurance products including medical expense, disability income, and critical illness insurance." />
      </Helmet>

      <NavigationHeader 
        title="CMFAS HI Module"
        subtitle="Health Insurance"
      />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Useful Links Section */}
        <div className="mb-8">
          <CMFASUsefulLinks
            links={usefulLinks}
            onUpdate={handleUpdate}
          />
        </div>

        {/* AI Assistant Section */}
        <div className="mb-8">
          <CMFASAIAssistant
            customGptLink={customGptLink}
            onUpdate={handleUpdate}
          />
        </div>

        <div className="bg-card rounded-lg p-6 border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📘</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">HI Exam</h1>
              <p className="text-muted-foreground">Health Insurance</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">For Whom</h2>
              <p className="text-muted-foreground mb-4">
                The HI exam is intended for all life and general insurance intermediaries and company staff members who are involved in advising and/or selling any Health Insurance products including:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
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
              <div className="grid md:grid-cols-3 gap-4">
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
            moduleId="hi"
            moduleName="HI Module"
            onUpdate={handleUpdate}
          />
        </div>

    </div>
  );
}