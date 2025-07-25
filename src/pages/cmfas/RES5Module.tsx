import { Helmet } from "react-helmet-async";
import { NavigationHeader } from "@/components/NavigationHeader";
import { CMFASTutorialLectures } from "@/components/cmfas/CMFASTutorialLectures";
import { CMFASUsefulLinks } from "@/components/cmfas/CMFASUsefulLinks";
import { CMFASChatbot } from "@/components/cmfas/CMFASChatbot";
import { useState } from "react";

export default function RES5Module() {
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
        <title>CMFAS RES5 - Rules, Ethics & Skills for Financial Advisory Services</title>
        <meta name="description" content="Complete guide to CMFAS RES5 exam covering rules, ethics, and skills for financial advisory services with detailed syllabus and exam format." />
      </Helmet>

      <NavigationHeader 
        title="CMFAS RES5 Module"
        subtitle="Rules, Ethics & Skills for Financial Advisory Services"
      />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* CMFAS Chatbot */}
        <div className="mb-8">
          <CMFASChatbot
            moduleId="res5"
            moduleName="RES5 Module - Rules, Ethics & Skills for Financial Advisory Services"
          />
        </div>

        <div className="bg-card rounded-lg p-6 border">
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
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-muted p-4 rounded-lg">
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
                <div className="bg-muted p-4 rounded-lg">
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
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">150</div>
                  <p className="text-sm font-medium">Multiple Choice Questions</p>
                  <p className="text-xs text-muted-foreground mt-1">(110 Part I + 40 Part II)</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">3</div>
                  <p className="text-sm font-medium">Hours Duration</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800 text-center">
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">75% & 80%</div>
                  <p className="text-sm font-medium">Passing Grades</p>
                  <p className="text-xs text-muted-foreground mt-1">(Part I & Part II)</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <h3 className="font-medium mb-2 text-red-800 dark:text-red-200">Critical Passing Requirements</h3>
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>You must achieve at least 75% for Part I AND at least 80% for Part II to pass.</strong> 
                Both parts must be passed simultaneously - you cannot pass one part and retake only the other.
              </p>
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
            moduleId="res5"
            moduleName="RES5 Module"
            onUpdate={handleUpdate}
          />
        </div>

    </div>
  );
}