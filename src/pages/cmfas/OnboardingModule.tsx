import { Helmet } from "react-helmet-async";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { CMFASModuleCourseLayout } from "@/components/cmfas/CMFASModuleCourseLayout";
import { CMFASOnboardingWizard } from "@/components/cmfas/CMFASOnboardingWizard";
import { CMFASHubChatFAB } from "@/components/cmfas/CMFASHubChatFAB";
import { SkipNavigation } from "@/components/SkipNavigation";
import { useState } from "react";
import { getCMFASModuleVideos } from "@/data/cmfasModuleData";
import { Link } from "react-router-dom";

const OnboardingModule = () => {
  const moduleId = "onboarding";
  const [tutorialLectures, setTutorialLectures] = useState(getCMFASModuleVideos(moduleId));

  const handleUpdate = async (field: string, value: any) => {
    if (field === "tutorial_lectures") {
      setTutorialLectures(value);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-background via-background to-muted/20">
      <Helmet>
        <title>CMFAS Onboarding - Getting Started Guide</title>
        <meta
          name="description"
          content="Essential setup steps to begin your CMFAS exam preparation journey including student account creation and question bank access."
        />
        <link rel="canonical" href={`${window.location.origin}${window.location.pathname}`} />
      </Helmet>

      <SkipNavigation />

      <header role="banner">
        <BrandedPageHeader
          layout="course"
          title="CMFAS Onboarding"
          subtitle="Essential setup steps to begin your certification journey"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "CMFAS Exams", href: "/cmfas-exams" },
            { label: "Onboarding" },
          ]}
        />
      </header>

      <main id="main-content" role="main" aria-label="CMFAS Onboarding Content">
        <CMFASModuleCourseLayout
          routeModuleId="onboarding"
          videos={tutorialLectures}
          moduleName="CMFAS Onboarding"
          defaultTab="overview"
          tabCourseContent={
            <>
              <div className="flex items-center gap-3 md:gap-4 mb-6 p-4 rounded-2xl border bg-card">
                <div
                  className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg"
                  aria-hidden="true"
                >
                  <span className="text-xl md:text-3xl" role="img" aria-label="Checklist">
                    📋
                  </span>
                </div>
                <div>
                  <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-800 bg-clip-text text-transparent">
                    Getting started
                  </h2>
                  <p className="text-sm md:text-lg text-muted-foreground">Essential onboarding steps and setup guide</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-4">Onboarding checklist</h3>
                  <CMFASOnboardingWizard onUpdate={handleUpdate} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Setup instructions</h3>
                  <div className="space-y-4">
                    {[
                      {
                        step: 1,
                        title: "Create SCI College Account",
                        description:
                          "Visit SCI College website and register for a student account. You'll need your NRIC and contact details.",
                        link: "https://www.scicollege.org.sg/Account/Register",
                      },
                      {
                        step: 2,
                        title: "Register for CMFAS Modules",
                        description: "Choose which CMFAS modules you need based on your role (M9, M9A, HI, RES5, etc.)",
                        link: null,
                      },
                      {
                        step: 3,
                        title: "Access Question Bank",
                        description: "Log in to access the official CMFAS question bank and practice materials",
                        link: null,
                      },
                      {
                        step: 4,
                        title: "Book Your Exam",
                        description: "Schedule your exam date through the examination booking portal",
                        link: null,
                      },
                    ].map((item) => (
                      <div key={item.step} className="p-6 bg-muted/50 rounded-xl border-l-4 border-cyan-500">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-white">{item.step}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">{item.title}</h4>
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
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">Essential resources</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: "SCI College Portal", desc: "Student account and materials", icon: "🎓" },
                      { title: "MAS Guidelines", desc: "Official regulatory guidelines", icon: "📋" },
                      { title: "Question Bank", desc: "Practice questions and tests", icon: "📝" },
                      { title: "Study Materials", desc: "eBooks and reference guides", icon: "📚" },
                      { title: "Exam Booking", desc: "Schedule your exams", icon: "📅" },
                      { title: "Support Help", desc: "Technical and exam support", icon: "💬" },
                    ].map((resource, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gradient-to-r from-muted/80 to-muted/40 rounded-xl border hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{resource.icon}</div>
                          <div>
                            <h4 className="font-semibold">{resource.title}</h4>
                            <p className="text-sm text-muted-foreground">{resource.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          }
          tabOverview={
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <span className="text-primary font-bold" role="img" aria-label="Target">
                      🎯
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">Welcome to CMFAS</h2>
                </div>
                <div className="bg-muted/50 rounded-xl p-6 border-l-4 border-cyan-500">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    The Capital Markets and Financial Advisory Services (CMFAS) Examination is a regulatory requirement
                    for representatives conducting regulated activities in Singapore&apos;s financial services industry.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    This onboarding module will guide you through all essential steps to begin your certification
                    journey, from account creation to exam registration and study resource access.
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                {[
                  { icon: "👤", title: "Create Account", desc: "Register with SCI College" },
                  { icon: "📝", title: "Register for Exam", desc: "Book your examination slot" },
                  { icon: "📚", title: "Access Materials", desc: "Get study resources & eBooks" },
                  { icon: "🎯", title: "Start Studying", desc: "Begin your preparation" },
                ].map((step, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-r from-muted/80 to-muted/40 rounded-xl border hover:shadow-md transition-all duration-200"
                  >
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
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <span className="text-green-600 font-bold" role="img" aria-label="Goals">
                      🎯
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">Learning objectives</h2>
                </div>
                <div className="bg-muted/50 rounded-xl p-6">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    By the end of this onboarding you should be able to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Create and verify your SCI College student account</li>
                    <li>Understand which CMFAS modules apply to your role</li>
                    <li>Locate official study materials and the question bank</li>
                    <li>Navigate exam booking and know where to get support</li>
                  </ul>
                </div>
              </div>
            </>
          }
          tabUsefulLinks={
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Useful links</h2>
              <p className="text-muted-foreground">
                Official registration, SCI College, and shared exam resources live in the CMFAS Exams hub.
              </p>
              <Link
                to="/cmfas-exams?tab=resources"
                className="inline-flex text-primary font-medium hover:underline"
              >
                Open exam resources →
              </Link>
            </div>
          }
          tabExam={
            <>
              <h2 className="text-2xl font-bold mb-4">CMFAS examinations</h2>
              <p className="text-muted-foreground mb-6">
                CMFAS exams are computer-based and module-specific. After onboarding, open the CMFAS Exams hub to explore
                modules (M9, M9A, HI, RES5), tutorial lectures, and the AI tutor.
              </p>
              <Link
                to="/cmfas-exams"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
              >
                Go to CMFAS Exams
              </Link>
            </>
          }
        />
      </main>

      <footer role="contentinfo" className="mt-8 py-8 border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need help? Contact your training coordinator or use the AI tutor button (bottom-right).
          </p>
        </div>
      </footer>
      <CMFASHubChatFAB moduleId="onboarding" />
    </div>
  );
};

export default OnboardingModule;
