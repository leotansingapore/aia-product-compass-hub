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