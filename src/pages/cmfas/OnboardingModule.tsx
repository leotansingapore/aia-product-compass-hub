import { Helmet } from "react-helmet-async";
import { NavigationHeader } from "@/components/NavigationHeader";

const OnboardingModule = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>CMFAS Onboarding - Getting Started Guide</title>
        <meta name="description" content="Essential setup steps to begin your CMFAS exam preparation journey including student account creation and question bank access." />
      </Helmet>

      <NavigationHeader 
        title="CMFAS Onboarding"
        subtitle="Essential setup steps to begin your certification journey"
      />
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">🚀 Getting Started - Required Setup</h1>
          <p className="text-muted-foreground text-lg">
            Complete these essential setup steps before you begin studying for your CMFAS exams.
          </p>
        </div>

        <div className="space-y-8">
          <div className="border-l-4 border-primary pl-6">
            <h3 className="font-semibold text-xl mb-3">Step 1: Create Student Account</h3>
            <p className="text-muted-foreground mb-4">
              Create your student account at <a href="https://www.scicollege.org.sg/Account/Register" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">SCI College Registration</a>
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="font-medium mb-3">Fill in the form with these details:</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="font-medium">Training Co-ordinator:</span>
                  <code className="bg-background px-2 py-1 rounded text-sm">NA</code>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <code className="bg-background px-2 py-1 rounded text-sm">NA</code>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-medium">Agency:</span>
                  <code className="bg-background px-2 py-1 rounded text-sm">NA</code>
                </li>
              </ul>
            </div>
            <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="font-medium">📧 Important</p>
              <p className="text-sm mt-1">Send us a screenshot of your email confirmation once your student account is created.</p>
            </div>
          </div>

          <div className="border-l-4 border-primary pl-6">
            <h3 className="font-semibold text-xl mb-3">Step 2: Register for M9 Exam</h3>
            <p className="text-muted-foreground mb-4">
              Book your M9 exam first to create a study deadline. Aim to pass 1-2 exams per month starting with M9.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-medium">💡 Pro Tip</p>
              <p className="text-sm mt-1">Book your exam before you start studying to create accountability and motivation!</p>
            </div>
          </div>

          <div className="border-l-4 border-primary pl-6">
            <h3 className="font-semibold text-xl mb-3">Step 3: Get Access to Exam Question Bank</h3>
            <p className="text-muted-foreground mb-4">
              This is essential for exam preparation - a quick 5-minute setup to access practice questions.
            </p>
            
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-3">🔐 Initial Setup</h4>
                <ol className="space-y-2 list-decimal list-inside">
                  <li>Send Leo your <strong>name</strong>, <strong>email</strong>, and <strong>handphone number</strong></li>
                  <li>Login to <strong>iRecruit</strong> using the credentials provided</li>
                </ol>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-3">📚 Accessing the Question Bank</h4>
                <p className="mb-3">Navigate through the platform:</p>
                <div className="bg-background p-3 rounded border font-mono text-sm overflow-x-auto">
                  iLearn → Pre-Contract → Pre-Contract (Online) → CMFAS M9 → Practice Questions → Chapter Revision and Premium Papers → Launch
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-3">⚙️ Optimal Study Settings</h4>
                <p className="mb-3">Configure your practice session:</p>
                <div className="bg-background p-3 rounded border font-mono text-sm overflow-x-auto">
                  Launch → Restart → OK → Select Module 9 → All Questions → 50 Questions → Redo Cleared Questions → Learning Mode → Start Session
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium mb-2">💡 Study Strategy</h4>
                <p className="text-sm">
                  Use the <strong>speed reference</strong> to answer questions and learn by doing instead of reading the textbook first. 
                  Understand concepts through practice, then refer to the relevant textbook sections for deeper comprehension.
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium mb-2">📱 Mobile Access</h4>
                <p className="text-sm">
                  <strong>Highly recommended:</strong> Login to iLearn on mobile as well. Follow the same steps above and you'll be prompted to download the iLearn mobile app for studying on-the-go.
                </p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-primary pl-6">
            <h3 className="font-semibold text-xl mb-3">📚 Study Timeline & Costs</h3>
            <p className="text-muted-foreground mb-4">
              Each exam requires approximately <strong>20-30 hours</strong> of dedicated study time.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Exam Costs (First Attempt - Subsidized)</h4>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>M9:</span>
                      <strong>S$109.00</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>M9A:</span>
                      <strong>S$109.00</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>HI:</span>
                      <strong>S$76.30</strong>
                    </li>
                    <li className="flex justify-between">
                      <span>RES5:</span>
                      <strong>S$185.30</strong>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Our Support Package</h4>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <ul className="space-y-2">
                    <li>📚 Comprehensive Flashcards</li>
                    <li>👨‍🏫 Personal Tutoring</li>
                    <li>❓ Extensive Question Bank</li>
                    <li>🤖 AI Chatbot Support</li>
                    <li>🔑 Key Concepts Summary</li>
                    <li>💡 Expert Study Tips</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <p className="font-medium text-red-800 dark:text-red-200">
                ⚠️ Important: We subsidize only the first attempt of each exam. Subsequent attempts will be at your own cost.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModule;