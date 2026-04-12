import { Helmet } from "react-helmet-async";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { CMFASTutorialLectures } from "@/components/cmfas/CMFASTutorialLectures";
import { CMFASOnboardingWizard } from "@/components/cmfas/CMFASOnboardingWizard";
import { CMFASChatLauncher } from "@/components/cmfas/CMFASChatLauncher";
import { SkipNavigation } from "@/components/SkipNavigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useState, useEffect } from "react";
import { Home, Info } from "lucide-react";
import { getCMFASModuleVideos } from "@/data/cmfasModuleData";

const OnboardingModule = () => {
  const moduleId = 'onboarding';
  const [tutorialLectures, setTutorialLectures] = useState(getCMFASModuleVideos(moduleId));

  const [usefulLinks, setUsefulLinks] = useState([
    {
      id: 'onboarding-scicollege',
      name: 'SCI College Registration',
      url: 'https://www.scicollege.org.sg/Account/Register',
      description: 'Create your student account here',
      icon: 'UserPlus'
    },
    {
      id: 'onboarding-exam-booking',
      name: 'Exam Booking Portal',
      url: 'https://example.com/exam-booking',
      description: 'Book your CMFAS exams',
      icon: 'Calendar'
    }
  ]);

  const [customGptLink, setCustomGptLink] = useState<string>("https://chatgpt.com/g/g-example-onboarding");

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Helmet>
        <title>CMFAS Onboarding - Getting Started Guide</title>
        <meta name="description" content="Essential setup steps to begin your CMFAS exam preparation journey including student account creation and question bank access." />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
      </Helmet>

      {/* Skip Navigation for Accessibility */}
      <SkipNavigation />

      {/* Header with Banner Role */}
      <header role="banner">
        <BrandedPageHeader
          title="🎯 CMFAS Onboarding"
          subtitle="Essential setup steps to begin your certification journey"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "CMFAS Exams", href: "/cmfas-exams" },
            { label: "Onboarding" }
          ]}
        />
      </header>

      {/* Main Content Area */}
      <main
        id="main-content"
        role="main"
        className="mx-auto px-1 sm:px-4 md:px-6 py-2 sm:py-4 md:py-8 space-y-3 sm:space-y-6 md:space-y-8"
        aria-label="CMFAS Onboarding Content"
      >
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  <Home className="h-4 w-4" />
                  <span className="sr-only">Home</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/cmfas">CMFAS</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Onboarding</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>

        {/* Important Notice Alert */}
        <Alert>
          <Info className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Getting Started with CMFAS</AlertTitle>
          <AlertDescription>
            Follow the steps below to set up your account and access study materials. Each step brings you closer to your certification goal.
          </AlertDescription>
        </Alert>

        <Separator className="my-6" aria-hidden="true" />

        {/* CMFAS Chat Launcher */}
        <div className="animate-fade-in">
          <CMFASChatLauncher
            moduleId="onboarding"
            moduleName="Getting Started - CMFAS Onboarding"
            description="Get instant help with account setup, exam registration, and getting started with your CMFAS journey"
          />
        </div>

        {/* Main Content with Tabs */}
        <article className="bg-card rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
          <div className="p-4 md:p-8 border-b">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg" aria-hidden="true">
                <span className="text-xl md:text-3xl" role="img" aria-label="Checklist">📋</span>
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-800 bg-clip-text text-transparent">
                  Getting Started
                </h1>
                <p className="text-sm md:text-lg text-muted-foreground">Essential onboarding steps and setup guide</p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            {/* Mobile-First Tab Navigation */}
            <div className="px-3 md:px-8 pt-4 md:pt-6">
              <TabsList
                className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 p-1 h-auto"
                role="tablist"
                aria-label="Onboarding content sections"
              >
                <TabsTrigger
                  value="overview"
                  className="mobile-touch-target text-sm font-medium px-4 py-2 min-h-[44px] data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  role="tab"
                  aria-controls="overview-panel"
                  aria-label="Overview section"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-lg" role="img" aria-label="Overview">📋</span>
                    <span>Overview</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="checklist"
                  className="mobile-touch-target text-sm font-medium px-4 py-2 min-h-[44px] data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  role="tab"
                  aria-controls="checklist-panel"
                  aria-label="Checklist section"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-lg" role="img" aria-label="Checklist">✅</span>
                    <span>Checklist</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="setup"
                  className="mobile-touch-target text-sm font-medium px-4 py-2 min-h-[44px] data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  role="tab"
                  aria-controls="setup-panel"
                  aria-label="Setup instructions section"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-lg" role="img" aria-label="Setup">⚙️</span>
                    <span>Setup</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="resources"
                  className="mobile-touch-target text-sm font-medium px-4 py-2 min-h-[44px] data-[state=active]:bg-gradient-to-br data-[state=active]:from-cyan-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  role="tab"
                  aria-controls="resources-panel"
                  aria-label="Resources section"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-lg" role="img" aria-label="Resources">📚</span>
                    <span>Resources</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-2 sm:p-4 md:p-8">
              <TabsContent
                value="overview"
                className="space-y-4 sm:space-y-6"
                role="tabpanel"
                id="overview-panel"
                aria-labelledby="overview-tab"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                      <span className="text-primary font-bold" role="img" aria-label="Target">🎯</span>
                    </div>
                    <h2 className="text-2xl font-bold">Welcome to CMFAS</h2>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-6 border-l-4 border-cyan-500">
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      The Capital Markets and Financial Advisory Services (CMFAS) Examination is a regulatory requirement for representatives conducting regulated activities in Singapore's financial services industry.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      This onboarding module will guide you through all essential steps to begin your certification journey, from account creation to exam registration and study resource access.
                    </p>
                  </div>
                </div>

                {/* Key Steps */}
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: "👤", title: "Create Account", desc: "Register with SCI College" },
                    { icon: "📝", title: "Register for Exam", desc: "Book your examination slot" },
                    { icon: "📚", title: "Access Materials", desc: "Get study resources & eBooks" },
                    { icon: "🎯", title: "Start Studying", desc: "Begin your preparation" }
                  ].map((step, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-muted/80 to-muted/40 rounded-xl border hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center text-xl">
                          {step.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{step.title}</h3>
                          <p className="text-sm text-muted-foreground">{step.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent
                value="checklist"
                className="space-y-4 sm:space-y-6"
                role="tabpanel"
                id="checklist-panel"
                aria-labelledby="checklist-tab"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <span className="text-green-600 font-bold" role="img" aria-label="Checkmark">✅</span>
                  </div>
                  <h2 className="text-2xl font-bold">Onboarding Checklist</h2>
                </div>
                <CMFASOnboardingWizard onUpdate={handleUpdate} />
              </TabsContent>

              <TabsContent
                value="setup"
                className="space-y-4 sm:space-y-6"
                role="tabpanel"
                id="setup-panel"
                aria-labelledby="setup-tab"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <span className="text-blue-600 font-bold" role="img" aria-label="Settings">⚙️</span>
                  </div>
                  <h2 className="text-2xl font-bold">Setup Instructions</h2>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      title: "Create SCI College Account",
                      description: "Visit SCI College website and register for a student account. You'll need your NRIC and contact details.",
                      link: "https://www.scicollege.org.sg/Account/Register"
                    },
                    {
                      step: 2,
                      title: "Register for CMFAS Modules",
                      description: "Choose which CMFAS modules you need based on your role (M9, M9A, HI, RES5, etc.)",
                      link: null
                    },
                    {
                      step: 3,
                      title: "Access Question Bank",
                      description: "Log in to access the official CMFAS question bank and practice materials",
                      link: null
                    },
                    {
                      step: 4,
                      title: "Book Your Exam",
                      description: "Schedule your exam date through the examination booking portal",
                      link: null
                    }
                  ].map((item) => (
                    <div key={item.step} className="p-6 bg-muted/50 rounded-xl border-l-4 border-cyan-500">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-white">{item.step}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                          {item.link && (
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                            >
                              Visit Website →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent
                value="resources"
                className="space-y-4 sm:space-y-6"
                role="tabpanel"
                id="resources-panel"
                aria-labelledby="resources-tab"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <span className="text-purple-600 font-bold" role="img" aria-label="Books">📚</span>
                  </div>
                  <h2 className="text-2xl font-bold">Essential Resources</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: "SCI College Portal", desc: "Student account and materials", icon: "🎓" },
                    { title: "MAS Guidelines", desc: "Official regulatory guidelines", icon: "📋" },
                    { title: "Question Bank", desc: "Practice questions and tests", icon: "📝" },
                    { title: "Study Materials", desc: "eBooks and reference guides", icon: "📚" },
                    { title: "Exam Booking", desc: "Schedule your exams", icon: "📅" },
                    { title: "Support Help", desc: "Technical and exam support", icon: "💬" }
                  ].map((resource, index) => (
                    <div key={index} className="p-4 bg-gradient-to-r from-muted/80 to-muted/40 rounded-xl border hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{resource.icon}</div>
                        <div>
                          <h3 className="font-semibold">{resource.title}</h3>
                          <p className="text-sm text-muted-foreground">{resource.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </article>

        <Separator className="my-8" aria-hidden="true" />

        {/* Tutorial Lectures Section */}
        <section className="animate-fade-in" aria-labelledby="tutorial-lectures-heading">
          <h2 id="tutorial-lectures-heading" className="sr-only">Tutorial Lectures</h2>
          <CMFASTutorialLectures
            videos={tutorialLectures}
            moduleId={moduleId}
            moduleName="CMFAS Onboarding"
            onUpdate={handleUpdate}
          />
        </section>

      </main>

      {/* Footer */}
      <footer role="contentinfo" className="mt-16 py-8 border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Contact your training coordinator or use the chat assistant above.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default OnboardingModule;
