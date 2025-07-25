import { Helmet } from "react-helmet-async";
import { NavigationHeader } from "@/components/NavigationHeader";
import { CMFASTutorialLectures } from "@/components/cmfas/CMFASTutorialLectures";
import { CMFASOnboardingWizard } from "@/components/cmfas/CMFASOnboardingWizard";
import { useState } from "react";

const OnboardingModule = () => {
  const [tutorialLectures, setTutorialLectures] = useState([
    {
      id: 'onboarding-intro',
      title: 'CMFAS Onboarding Overview',
      description: 'Complete guide to getting started with CMFAS exams',
      url: '/lectures/onboarding-intro.mp4',
      duration: 1200, // 20 minutes
      order: 0,
      category: 'Getting Started'
    },
    {
      id: 'onboarding-account-setup',
      title: 'Student Account Creation',
      description: 'Step-by-step guide to create your student account',
      url: '/lectures/onboarding-account-setup.mp4',
      duration: 900, // 15 minutes
      order: 1,
      category: 'Setup'
    },
    {
      id: 'onboarding-exam-registration',
      title: 'Exam Registration Process',
      description: 'How to register for your first CMFAS exam',
      url: '/lectures/onboarding-exam-registration.mp4',
      duration: 1500, // 25 minutes
      order: 2,
      category: 'Setup'
    },
    {
      id: 'onboarding-question-bank',
      title: 'Accessing Question Bank',
      description: 'Complete guide to accessing and using the question bank',
      url: '/lectures/onboarding-question-bank.mp4',
      duration: 1800, // 30 minutes
      order: 3,
      category: 'Study Tools'
    },
    {
      id: 'onboarding-study-strategy',
      title: 'Effective Study Strategy',
      description: 'Proven strategies for CMFAS exam success',
      url: '/lectures/onboarding-study-strategy.mp4',
      duration: 2100, // 35 minutes
      order: 4,
      category: 'Study Strategy'
    }
  ]);

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
        {/* CMFAS Onboarding Wizard */}
        <CMFASOnboardingWizard onUpdate={handleUpdate} />

        {/* Tutorial Lectures Section */}
        <div className="mt-8">
          <CMFASTutorialLectures
            videos={tutorialLectures}
            moduleId="onboarding"
            moduleName="CMFAS Onboarding"
            onUpdate={handleUpdate}
          />
        </div>

      </div>
    </div>
  );
};

export default OnboardingModule;