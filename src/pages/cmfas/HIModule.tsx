import { Helmet } from "react-helmet-async";
import { NavigationHeader } from "@/components/NavigationHeader";

export default function HIModule() {
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
    </div>
  );
}