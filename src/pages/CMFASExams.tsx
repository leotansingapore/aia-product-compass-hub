import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { CategoryCard } from "@/components/CategoryCard";
import { BookOpen, Scale, TrendingUp, PieChart, FileText, Download } from "lucide-react";

export default function CMFASExams() {
  const navigate = useNavigate();

  const cmfasModules = [
    {
      title: "CMFAS Module 1",
      description: "Rules and Regulations - Essential foundations for capital markets",
      icon: BookOpen,
      productCount: 25,
      gradient: "from-blue-500 to-blue-600",
      route: "/cmfas/module-1"
    },
    {
      title: "CMFAS Module 5", 
      description: "Securities & Futures Act - Legal framework and compliance",
      icon: Scale,
      productCount: 30,
      gradient: "from-green-500 to-green-600",
      route: "/cmfas/module-5"
    },
    {
      title: "CMFAS Module 6",
      description: "Investment Analysis - Fundamental and technical analysis", 
      icon: TrendingUp,
      productCount: 35,
      gradient: "from-purple-500 to-purple-600",
      route: "/cmfas/module-6"
    },
    {
      title: "CMFAS Module 8",
      description: "Collective Investment Schemes - Unit trusts and funds",
      icon: PieChart,
      productCount: 28,
      gradient: "from-orange-500 to-orange-600",
      route: "/cmfas/module-8"
    },
    {
      title: "Practice Tests",
      description: "Comprehensive mock exams and practice questions",
      icon: FileText,
      productCount: 150,
      gradient: "from-red-500 to-red-600",
      route: "/cmfas/practice-tests"
    },
    {
      title: "Study Materials",
      description: "Downloadable guides, flashcards, and reference materials",
      icon: Download,
      productCount: 45,
      gradient: "from-teal-500 to-teal-600",
      route: "/cmfas/study-materials"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>CMFAS Exam Preparation - AIA Product Compass Hub</title>
        <meta name="description" content="Comprehensive CMFAS exam preparation materials including modules 1, 5, 6, 8, practice tests, and study materials for capital markets financial advisory services certification." />
      </Helmet>

      <NavigationHeader 
        title="CMFAS Exam Preparation"
        subtitle="Capital Markets Financial Advisory Services - Your path to certification"
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">CMFAS Certification Program</h1>
          <p className="text-muted-foreground text-lg">
            Prepare for your Capital Markets Financial Advisory Services certification with our comprehensive study materials, practice tests, and expert guidance across all essential modules.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cmfasModules.map((module) => (
            <CategoryCard
              key={module.title}
              title={module.title}
              description={module.description}
              icon={<module.icon />}
              productCount={module.productCount}
              gradient={module.gradient}
              onClick={() => navigate(module.route)}
            />
          ))}
        </div>

        {/* Getting Started Section */}
        <div className="mt-12 bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">🚀 Getting Started - Required Setup</h2>
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold text-lg mb-2">Step 1: Create Student Account</h3>
              <p className="text-muted-foreground mb-3">
                Create your student account at <a href="https://www.scicollege.org.sg/Account/Register" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">SCI College Registration</a>
              </p>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm font-medium mb-2">Fill in the form with these details:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Training Co-ordinator: <span className="font-mono">NA</span></li>
                  <li>• Email: <span className="font-mono">NA</span></li>
                  <li>• Agency: <span className="font-mono">NA</span></li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                📧 <strong>Important:</strong> Send us a screenshot of your email confirmation once your student account is created.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold text-lg mb-2">Step 2: Register for M9 Exam</h3>
              <p className="text-muted-foreground mb-2">
                Book your M9 exam first to create a study deadline. Aim to pass 1-2 exams per month starting with M9.
              </p>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-800">
                <p className="text-sm font-medium">💡 Pro Tip: Book your exam before you start studying to create accountability!</p>
              </div>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold text-lg mb-2">Step 3: Get Access to Exam Question Bank</h3>
              <p className="text-muted-foreground mb-3">
                This is essential for exam preparation - a quick 5-minute setup to access practice questions.
              </p>
              
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">🔐 Initial Setup</h4>
                  <ol className="text-sm space-y-2 list-decimal list-inside">
                    <li>Send Leo your <strong>name</strong>, <strong>email</strong>, and <strong>handphone number</strong></li>
                    <li>Login to <strong>iRecruit</strong> using the credentials provided</li>
                  </ol>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">📚 Accessing the Question Bank</h4>
                  <p className="text-sm mb-2">Navigate through the platform:</p>
                  <div className="bg-background p-3 rounded border font-mono text-sm">
                    iLearn → Pre-Contract → Pre-Contract (Online) → CMFAS M9 → Practice Questions → Chapter Revision and Premium Papers → Launch
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">⚙️ Optimal Study Settings</h4>
                  <p className="text-sm mb-2">Configure your practice session:</p>
                  <div className="bg-background p-3 rounded border font-mono text-sm">
                    Launch → Restart → OK → Select Module 9 → All Questions → 50 Questions → Redo Cleared Questions → Learning Mode → Start Session
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium mb-2">💡 Study Strategy</h4>
                  <p className="text-sm">
                    Use the <strong>speed reference</strong> to answer questions and learn by doing instead of reading the textbook first. 
                    Understand concepts through practice, then refer to the relevant textbook sections for deeper comprehension.
                  </p>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800">
                  <h4 className="font-medium mb-2">📱 Mobile Access</h4>
                  <p className="text-sm">
                    <strong>Highly recommended:</strong> Login to iLearn on mobile as well. Follow the same steps above and you'll be prompted to download the iLearn mobile app for studying on-the-go.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h3 className="font-semibold text-lg mb-2">📚 Study Timeline & Costs</h3>
              <p className="text-muted-foreground mb-3">
                Each exam requires approximately <strong>20-30 hours</strong> of dedicated study time.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Exam Costs (First Attempt - Subsidized)</h4>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                    <ul className="text-sm space-y-1">
                      <li>• M9: <strong>S$109.00</strong></li>
                      <li>• M9A: <strong>S$109.00</strong></li>
                      <li>• HI: <strong>S$76.30</strong></li>
                      <li>• RES5: <strong>S$185.30</strong></li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Our Support Package</h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                    <ul className="text-sm space-y-1">
                      <li>• 📚 Comprehensive Flashcards</li>
                      <li>• 👨‍🏫 Personal Tutoring</li>
                      <li>• ❓ Extensive Question Bank</li>
                      <li>• 🤖 AI Chatbot Support</li>
                      <li>• 🔑 Key Concepts Summary</li>
                      <li>• 💡 Expert Study Tips</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  ⚠️ Important: We subsidize only the first attempt of each exam. Subsequent attempts will be at your own cost.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Exam Information */}
        <div className="mt-12 space-y-8">
          {/* M9 Exam */}
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              📘 M9 Exam
              <span className="text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">Life Insurance & Investment-Linked Policies</span>
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">For Whom</h3>
                <p className="text-muted-foreground">
                  The M9 exam is intended for those who are looking to provide advice on and/or arrange life insurance policies (whether or not including investment-linked policies). 
                  You are required to pass this module, together with Module 5 on Rules And Regulations For Financial Advisory Services, in compliance with the requirements as laid down by the Monetary Authority of Singapore (MAS).
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Objectives</h3>
                <p className="text-muted-foreground mb-3">The objective of this course is to test candidates on their knowledge and understanding of:</p>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Life insurance and life insurance concepts, including setting life insurance premiums and classification of life insurance products</li>
                  <li>Different types of traditional life insurance products</li>
                  <li>Various types of riders; investment-linked policies; and annuities</li>
                  <li>Industry practices including the application and underwriting process; policy services and claims practices</li>
                  <li>Contractual provisions and legal issues such as the law of agency and other relevant aspects such as income tax, insurance nomination, wills, and trust</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Course Contents</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-sm">
                    <p>Chapter 1 – Risk And Life Insurance</p>
                    <p>Chapter 2 – Setting Life Insurance Premium</p>
                    <p>Chapter 3 – Classification Of Life Insurance Products</p>
                    <p>Chapter 4 – Traditional Life Insurance Products</p>
                    <p>Chapter 5 – Riders (Or Supplementary Benefits)</p>
                    <p>Chapter 6 – Participating Life Insurance Policies</p>
                    <p>Chapter 7 – Investment-linked Life Insurance Policies (ILPS)</p>
                    <p>Chapter 8 – Investment-linked Sub-Funds</p>
                    <p>Chapter 9 – Investment-linked Life Insurance Products: Computational Aspects</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>Chapter 10 – Annuities</p>
                    <p>Chapter 11 – Application And Underwriting</p>
                    <p>Chapter 12 – Policy Services</p>
                    <p>Chapter 13 – Life Insurance Claims</p>
                    <p>Chapter 14 – The Insurance Contract</p>
                    <p>Chapter 15 – Law Of Agency</p>
                    <p>Chapter 16 – Income Tax And Life Insurance</p>
                    <p>Chapter 17 – Insurance Nomination, Wills And Trusts</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded">
                  <h4 className="font-medium mb-2">Format</h4>
                  <p className="text-sm">100 multiple-choice questions</p>
                </div>
                <div className="bg-muted p-4 rounded">
                  <h4 className="font-medium mb-2">Duration</h4>
                  <p className="text-sm">2 hours</p>
                </div>
                <div className="bg-muted p-4 rounded">
                  <h4 className="font-medium mb-2">Passing Grade</h4>
                  <p className="text-sm">70%</p>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded border border-amber-200 dark:border-amber-800">
                <p className="text-sm"><strong>Note:</strong> Computer Screen Examination (CSE) in English. Use eBook for preparation - no hard-copy texts issued.</p>
              </div>
            </div>
          </div>

          {/* M9A Exam */}
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              📘 M9A Exam
              <span className="text-sm bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-2 py-1 rounded">Life Insurance & Investment-Linked Policies II</span>
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">For Whom</h3>
                <p className="text-muted-foreground">
                  The M9A is intended for new or existing representatives of financial advisers who need to comply with the MAS requirement to possess the requisite knowledge to advise others and/or arrange Investment-linked Life Insurance Policies (ILPs).
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Objectives</h3>
                <p className="text-muted-foreground mb-3">The objective of this course is to test candidates on their knowledge and understanding of:</p>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Features, types, advantages, and disadvantages of structured products, comparison with other investment options, governance structure</li>
                  <li>Documentation and risks associated with the investment of structured products, particularly Structured ILPs</li>
                  <li>Structured ILPs on product features, inherent risks, and performance under various market conditions</li>
                  <li>Various types of derivatives in the market, both on-the-exchange and over-the-counter</li>
                  <li>Applications of structured funds relating to product features, inherent risks, and performance</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Course Contents</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-sm">
                    <p>Chapter 1 – Introduction To Structured Products</p>
                    <p>Chapter 2 – Risk Considerations Of Structured Products</p>
                    <p>Chapter 3 – Understanding Derivatives</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>Chapter 4 – Introduction To Structured ILPs</p>
                    <p>Chapter 5 – Portfolio Of Investments With An Insurance</p>
                    <p>Chapter 6 – Case Studies</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded">
                  <h4 className="font-medium mb-2">Format</h4>
                  <p className="text-sm">50 multiple-choice questions</p>
                </div>
                <div className="bg-muted p-4 rounded">
                  <h4 className="font-medium mb-2">Duration</h4>
                  <p className="text-sm">1 hour</p>
                </div>
                <div className="bg-muted p-4 rounded">
                  <h4 className="font-medium mb-2">Passing Grade</h4>
                  <p className="text-sm">70%</p>
                </div>
              </div>
            </div>
          </div>

          {/* HI Exam */}
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              📘 HI Exam
              <span className="text-sm bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">Health Insurance</span>
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">For Whom</h3>
                <p className="text-muted-foreground mb-3">
                  The HI exam is intended for all life and general insurance intermediaries and company staff members who are involved in advising and/or selling any Health Insurance products including:
                </p>
                <ul className="text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Medical Expense Insurance</li>
                  <li>Disability Income Insurance</li>
                  <li>Long-Term Care Insurance</li>
                  <li>Critical Illness Insurance</li>
                  <li>Managed Healthcare Insurance</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Course Contents</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-sm">
                    <p>Chapter 1 – Overview Of Healthcare Environment In Singapore</p>
                    <p>Chapter 2 – Medical Expense Insurance</p>
                    <p>Chapter 3 – Group Medical Expense Insurance</p>
                    <p>Chapter 4 – Disability Income Insurance</p>
                    <p>Chapter 5 – Long-Term Care Insurance</p>
                    <p>Chapter 6 – Critical Illness Insurance</p>
                    <p>Chapter 7 – Other Types of Health Insurance</p>
                    <p>Chapter 8 – Managed Healthcare</p>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>Chapter 9 – Healthcare Financing</p>
                    <p>Chapter 10 – Common Policy Provisions</p>
                    <p>Chapter 11 – Health Insurance Pricing</p>
                    <p>Chapter 12 – Health Insurance Underwriting</p>
                    <p>Chapter 13 – MAS 120 – Disclosure And Advisory Process</p>
                    <p>Chapter 14 – Financial Needs Analysis</p>
                    <p>Chapter 15 – Case Studies</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded">
                  <h4 className="font-medium mb-2">Format</h4>
                  <p className="text-sm">50 multiple-choice questions</p>
                </div>
                <div className="bg-muted p-4 rounded">
                  <h4 className="font-medium mb-2">Duration</h4>
                  <p className="text-sm">1 hour 15 minutes</p>
                </div>
                <div className="bg-muted p-4 rounded">
                  <h4 className="font-medium mb-2">Passing Grade</h4>
                  <p className="text-sm">70%</p>
                </div>
              </div>
            </div>
          </div>

          {/* RES5 Exam */}
          <div className="bg-card rounded-lg p-6 border">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              📘 RES5 Exam
              <span className="text-sm bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-2 py-1 rounded">Rules, Ethics & Skills for Financial Advisory Services</span>
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">For Whom</h3>
                <p className="text-muted-foreground mb-3">
                  Those intending to advise others concerning securities, collective investment schemes, derivatives contracts, foreign exchange trading, or provide advice on life insurance policies.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Course Structure</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded">
                    <h4 className="font-medium mb-2">Part I - Regulations (110 Questions)</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Financial Advisers Act & Regulations</li>
                      <li>• MAS Notices (FAA-N16, FAA-N03, FAA-N11, etc.)</li>
                      <li>• Money Laundering Prevention</li>
                      <li>• Investment-linked Policies (ILPs)</li>
                      <li>• Collective Investment Schemes</li>
                      <li>• Securities Dealing & Market Conduct</li>
                      <li>• Central Provident Fund</li>
                    </ul>
                  </div>
                  <div className="bg-muted p-4 rounded">
                    <h4 className="font-medium mb-2">Part II - Ethics & Skills (40 Questions)</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Professional Ethics</li>
                      <li>• Ethical Behavior & Conflicts of Interest</li>
                      <li>• Fair Dealing</li>
                      <li>• Client Relationships</li>
                      <li>• Fact Finding & Needs Analysis</li>
                      <li>• Financial Planning</li>
                      <li>• Portfolio Review</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded">
                  <h4 className="font-medium mb-2">Format</h4>
                  <p className="text-sm">150 multiple-choice questions</p>
                </div>
                <div className="bg-muted p-4 rounded">
                  <h4 className="font-medium mb-2">Duration</h4>
                  <p className="text-sm">3 hours</p>
                </div>
                <div className="bg-muted p-4 rounded">
                  <h4 className="font-medium mb-2">Passing Grade</h4>
                  <p className="text-sm">Part I: 75% | Part II: 80%</p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded border border-red-200 dark:border-red-800">
                <p className="text-sm font-medium"><strong>Important:</strong> You must achieve at least 75% for Part I AND at least 80% for Part II to pass.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-card rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">About CMFAS Certification</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              The Capital Markets Financial Advisory Services (CMFAS) certification is required for financial advisors in Singapore to provide investment advice on capital market products.
            </p>
            <p>
              With our comprehensive support package, passing on your first attempt should be highly achievable. Our materials are designed to maximize your success rate and minimize study time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}