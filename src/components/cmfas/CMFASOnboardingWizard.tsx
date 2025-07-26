import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, ArrowLeft, Trophy, Sparkles, UserPlus, Calendar, Database, BookOpen, ExternalLink, Image, Video, Plus, Trash2 } from 'lucide-react';
import { useChecklistProgress } from '@/hooks/useChecklistProgress';
import { useNavigate } from 'react-router-dom';
import { EditableText } from '@/components/EditableText';
import { useAdmin } from '@/hooks/useAdmin';
import ReactMarkdown from 'react-markdown';
import { MediaUploadZone } from '@/components/MediaUploadZone';

interface MediaItem {
  id: string;
  type: 'gif' | 'image' | 'youtube' | 'loom';
  url: string;
  title?: string;
  position: number; // Position in content flow
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  points: number;
  content: string;
  media?: MediaItem[];
  actionTitle?: string;
  actionUrl?: string;
}

interface CMFASOnboardingWizardProps {
  onUpdate?: (field: string, value: any) => Promise<void>;
}

export function CMFASOnboardingWizard({ onUpdate }: CMFASOnboardingWizardProps) {
  const navigate = useNavigate();
  const { completeItem, isItemCompleted } = useChecklistProgress();
  const { isAdminMode } = useAdmin();
  
  const [currentStep, setCurrentStep] = useState(0);
  
  const [wizardData, setWizardData] = useState({
    title: "🎯 Get Ready for CMFAS Success!",
    subtitle: "Follow these simple steps to start your certification journey",
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to CMFAS',
        description: 'Your journey to becoming a certified financial advisor starts here!',
        icon: Sparkles,
        points: 0,
        media: [] as MediaItem[],
        content: `# Welcome! 🎉

It is puzzling to me how people spend years on a degree just to earn $3-4k/mth but don't have the patience to spend a few months clearing some certifications to have the chance to earn a 5 figure income within a few months.

## 🎯 Your CMFAS Journey Starts Here

In the next few months, you will be spending the majority of the time studying financial certifications, called the **CMFAS exams**.

### 📖 Study Commitment
I would suggest that you spend **at least 1 hour a day** studying for the exams.

There are **4 exams**, and it should take **at most 1 month** to study for each exam.

## 💪 Tests of Conviction

Treat these as **"obstacles"** or **"tests"** of your conviction and commitment.

The more you pass these exams, the more content I will **"unlock"** for you.

Just as how anyone and everyone can enter into BMT, not everyone can go into OCS, or make it to becoming a commando.

## 🔄 Two-Way Test

So treat this as a **two way test**:
- **For yourself:** to learn more about the business before placing your bets
- **For myself:** to check for your convictions and commitment to us

The more you study and pass the exams, the more courses you will unlock, and you will progress to the next level.

Think of it this way: Anyone can join BMT, but not everyone will enter OCS Foundation Term, and OCS Pro Term, and eventually commission as an Officer.

## 🎓 Progression Levels

**Finternship™ Bootcamp** → Everyone Starts here

**Finternship™ Fastrack** → Progress here after passing 1 exam

**Finternship™ Accelerator** → Progress here after passing 4 exams

---

Ready to prove your commitment? Let's begin your certification journey! 🚀`
      },
      {
        id: 'create-student-account',
        title: 'Create Your Student Account',
        description: 'Set up your official student account at SCI College',
        icon: UserPlus,
        points: 25,
        media: [] as MediaItem[],
        content: `# Create Your Student Account

Create a student account here on SCI College.

**Registration Details:**
- Training Co-ordinator: **NG CHUN HIONG**
- Email: **junxiong@aiafa.com.sg**
- Agency: **JUNXIONG-WFG ORG**
- Company: **AIA Financial Advisers Pte Ltd**

**After registration:** Send me a screenshot of the email confirmation of student account creation completion.`,
        actionTitle: 'Register at SCI College',
        actionUrl: 'https://www.scicollege.org.sg/Account/Register'
      },
      {
        id: 'access-question-bank',
        title: 'Access Question Bank',
        description: 'Get access to our comprehensive practice questions',
        icon: Database,
        points: 30,
        media: [] as MediaItem[],
        content: `# Step 3: Get Access to Question Bank 🎯

**Essential 5-minute setup** to access our comprehensive practice questions.

## 🔐 Initial Setup:
**[Click here to submit your details](https://nsgukkz32942.sg.larksuite.com/share/base/form/shrlgzgwycA7f2m2JVxP5T2qhyd)** and I'll create your iRecruit login credentials:
- 📝 **Full Name**
- 📧 **Email Address** 
- 📱 **Phone Number**

You'll receive **iRecruit login credentials** within 24 hours.

## 📚 Accessing Questions:
**Navigation Path:**
iLearn → Pre-Contract → Pre-Contract (Online) → CMFAS M9 → Practice Questions → Chapter Revision and Premium Papers → **Launch**

## ⚙️ Optimal Study Settings:
**Configure:** Launch → Restart → OK → Select Module 9 → All Questions → 50 Questions → Redo Cleared Questions → **Learning Mode** → Start Session

## 💡 Study Strategy:
Use the **speed reference** to answer questions and **learn by doing** instead of reading textbook first.

## 📱 Mobile Access:
Download the **iLearn mobile app** for studying on-the-go!`
      },
      {
        id: 'understand-costs-timeline',
        title: 'Know Your Investment',
        description: 'Understand exam costs, timeline, and our support',
        icon: BookOpen,
        points: 15,
        media: [] as MediaItem[],
        content: `# Step 4: Know Your Investment 💰

Each exam requires approximately **20-30 hours** of dedicated study time.

## 💸 Exam Costs (First Attempt - Subsidized):
- **M9:** S$109.00
- **M9A:** S$109.00  
- **HI:** S$76.30
- **RES5:** S$185.30

## 🎁 Our Complete Support Package:
- 📚 **Comprehensive Flashcards**
- 👨‍🏫 **Personal Tutoring Support**
- ❓ **Extensive Question Bank** (1000+ questions)
- 🤖 **AI Chatbot Support** (24/7)
- 🔑 **Key Concepts Summary**
- 💡 **Expert Study Tips & Strategies**

## ⚠️ Important Note:
We **subsidize only the first attempt** of each exam. Subsequent attempts will be at your own cost.

**That's why our proven system focuses on helping you pass on the first try!**`
      },
      {
        id: 'register-m9-exam',
        title: 'Book Your First Exam',
        description: 'Register for M9 exam to create a study deadline',
        icon: Calendar,
        points: 20,
        media: [] as MediaItem[],
        content: `# Step 5: Register for M9 Exam 📅

**Book your M9 exam first** to create a study deadline and build momentum.

## Why Start with M9?
- 🎯 **Foundation Module** - Essential knowledge for all advisors
- ⏰ **Quick Win** - Can be completed in 2-3 weeks
- 🚀 **Momentum Builder** - Success breeds success

## Study Timeline:
- **Aim for 1-2 exams per month**
- **M9 → M9A → HI → RES5** (recommended sequence)
- **20-30 hours study time** per exam

### 💡 Pro Tip:
Book your exam **before you start studying** to create accountability and motivation!

Having a deadline makes you more focused and committed to your study schedule.`
      },
      {
        id: 'first-practice',
        title: 'Take Practice Test',
        description: 'Complete your first practice session to get started',
        icon: Trophy,
        points: 40,
        media: [] as MediaItem[],
        content: `# Step 6: Complete First Practice 🏆

**Take your first practice test** using the question bank to establish your baseline knowledge.

## 🎯 This will help you:
- ✅ **Identify knowledge gaps** - See what areas need focus
- 📋 **Get familiar with exam format** - Know what to expect
- 💪 **Build confidence** - Get comfortable with the platform
- 📊 **Track your progress** - See improvement over time

## 🚀 Getting Started:
Start with **20-30 questions in learning mode** to get comfortable with the system.

Don't worry about your initial score - everyone starts somewhere!

## 💡 Pro Tip:
**Focus on understanding WHY** answers are correct rather than memorizing. This builds deep knowledge that sticks.

### Ready to begin your practice?
Click "Complete Step" and start your first practice session!`
      }
    ] as OnboardingStep[]
  });

  const currentStepData = wizardData.steps[currentStep];
  const completedSteps = wizardData.steps.filter(step => isItemCompleted(step.id));
  const totalPoints = wizardData.steps.reduce((sum, step) => sum + step.points, 0);
  const earnedPoints = completedSteps.reduce((sum, step) => sum + step.points, 0);
  const progressPercentage = Math.round((currentStep / wizardData.steps.length) * 100);

  const handleNext = () => {
    if (currentStep < wizardData.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    completeItem(currentStepData.id);
    if (currentStep < wizardData.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleTextUpdate = async (field: string, value: string) => {
    const newData = { ...wizardData, [field]: value };
    setWizardData(newData);
    if (onUpdate) {
      await onUpdate('wizard_data', newData);
    }
  };

  const handleStepUpdate = async (stepIndex: number, updates: Partial<OnboardingStep>) => {
    const newSteps = [...wizardData.steps];
    newSteps[stepIndex] = { ...newSteps[stepIndex], ...updates };
    const newData = { ...wizardData, steps: newSteps };
    setWizardData(newData);
    if (onUpdate) {
      await onUpdate('wizard_data', newData);
    }
  };

  const addMediaItem = (type: 'gif' | 'image' | 'youtube' | 'loom', url?: string) => {
    const stepData = wizardData.steps[currentStep];
    const newMedia: MediaItem = {
      id: Date.now().toString(),
      type,
      url: url || '',
      position: (stepData.media?.length || 0) + 1
    };
    const updatedMedia = [...(stepData.media || []), newMedia];
    handleStepUpdate(currentStep, { media: updatedMedia });
  };

  const handleMediaUpload = (url: string, type: 'gif' | 'image') => {
    addMediaItem(type, url);
  };

  const updateMediaItem = (mediaId: string, updates: Partial<MediaItem>) => {
    const updatedMedia = (currentStepData.media || []).map(item =>
      item.id === mediaId ? { ...item, ...updates } : item
    );
    handleStepUpdate(currentStep, { media: updatedMedia });
  };

  const removeMediaItem = (mediaId: string) => {
    const updatedMedia = (currentStepData.media || []).filter(item => item.id !== mediaId);
    handleStepUpdate(currentStep, { media: updatedMedia });
  };

  const getEmbedUrl = (url: string, type: string) => {
    if (type === 'youtube') {
      const youtubeId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];
      return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : url;
    }
    if (type === 'loom') {
      const loomId = url.match(/loom\.com\/share\/([^?]+)/)?.[1];
      return loomId ? `https://www.loom.com/embed/${loomId}` : url;
    }
    return url;
  };

  const isWelcomeStep = currentStep === 0;
  const isCompleted = isItemCompleted(currentStepData.id);
  const allCompleted = wizardData.steps.every(step => isItemCompleted(step.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <EditableText
          value={wizardData.title}
          onSave={(value) => handleTextUpdate('title', value)}
          className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
          placeholder="Enter wizard title..."
        />
        <EditableText
          value={wizardData.subtitle}
          onSave={(value) => handleTextUpdate('subtitle', value)}
          className="text-xl text-muted-foreground"
          placeholder="Enter wizard subtitle..."
        />
      </div>

      {/* Progress Overview */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Your Progress</h3>
              <p className="text-sm text-muted-foreground">
                {completedSteps.length} of {wizardData.steps.length} steps completed
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{earnedPoints}</div>
              <div className="text-sm text-muted-foreground">/ {totalPoints} points</div>
            </div>
          </div>
          
          <Progress value={progressPercentage} className="mb-4" />
          
          {/* Step Indicators */}
          <div className="flex justify-between">
            {wizardData.steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all ${
                  index === currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : isItemCompleted(step.id)
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'hover:bg-muted'
                }`}
              >
                {isItemCompleted(step.id) ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <step.icon className="w-6 h-6" />
                )}
                <span className="text-xs font-medium hidden sm:block">{index + 1}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      <Card className="border-2 border-primary/20">
        <CardContent className="p-6 md:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
            <div className="flex items-start space-x-4 flex-1">
              <div className={`p-4 rounded-xl shadow-sm ${isCompleted ? 'bg-green-100 dark:bg-green-900/20' : 'bg-primary/10'}`}>
                {isCompleted ? (
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                ) : (
                  <currentStepData.icon className="w-8 h-8 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <EditableText
                  value={currentStepData.title}
                  onSave={async (value) => {
                    const newSteps = [...wizardData.steps];
                    newSteps[currentStep] = { ...currentStepData, title: value };
                    const newData = { ...wizardData, steps: newSteps };
                    setWizardData(newData);
                    if (onUpdate) {
                      await onUpdate('wizard_data', newData);
                    }
                  }}
                  className="text-2xl lg:text-3xl font-bold leading-tight"
                  placeholder="Enter step title..."
                />
                <EditableText
                  value={currentStepData.description}
                  onSave={async (value) => {
                    const newSteps = [...wizardData.steps];
                    newSteps[currentStep] = { ...currentStepData, description: value };
                    const newData = { ...wizardData, steps: newSteps };
                    setWizardData(newData);
                    if (onUpdate) {
                      await onUpdate('wizard_data', newData);
                    }
                  }}
                  className="text-muted-foreground mt-2 text-base lg:text-lg leading-relaxed"
                  placeholder="Enter step description..."
                />
                {currentStepData.points > 0 && (
                  <Badge variant="secondary" className="mt-3 font-medium">
                    +{currentStepData.points} points
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Admin Edit Button */}
            {isAdminMode && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Toggle edit mode for content
                    const contentElement = document.querySelector(`[data-step-content="${currentStep}"]`);
                    if (contentElement) {
                      const editButton = contentElement.querySelector('.edit-trigger');
                      if (editButton) {
                        (editButton as HTMLElement).click();
                      }
                    }
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </Button>
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Step Content */}
          <div className="mb-8 space-y-6" data-step-content={currentStep}>
            {isAdminMode ? (
              <div className="space-y-4">
                <EditableText
                  value={currentStepData.content}
                  onSave={async (value) => {
                    await handleStepUpdate(currentStep, { content: value });
                  }}
                  richText
                  className="prose prose-lg max-w-none text-foreground"
                  placeholder="Enter step content..."
                />
                
                {/* Media Management for Admins */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-sm text-muted-foreground">Media Content</h4>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => addMediaItem('youtube')}>
                        <Video className="w-4 h-4 mr-1" />
                        YouTube
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => addMediaItem('loom')}>
                        <Video className="w-4 h-4 mr-1" />
                        Loom
                      </Button>
                    </div>
                  </div>
                  
                  {/* Image/GIF Upload Zone */}
                  <div className="mb-4">
                    <MediaUploadZone onMediaAdd={handleMediaUpload} className="mb-4" />
                  </div>
                  
                  {currentStepData.media?.map((mediaItem) => (
                    <div key={mediaItem.id} className="border rounded-lg p-4 mb-3 bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{mediaItem.type.toUpperCase()}</Badge>
                        <Button size="sm" variant="ghost" onClick={() => removeMediaItem(mediaItem.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder={`Enter ${mediaItem.type} URL...`}
                          value={mediaItem.url}
                          onChange={(e) => updateMediaItem(mediaItem.id, { url: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Optional title..."
                          value={mediaItem.title || ''}
                          onChange={(e) => updateMediaItem(mediaItem.id, { title: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Rendered Content */}
                <div className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground">
                  {currentStepData.content.includes('<') ? (
                    // Content is HTML
                    <div 
                      dangerouslySetInnerHTML={{ __html: currentStepData.content }}
                      className="prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4 prose-h1:text-primary prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:text-primary prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-2 prose-h3:text-primary prose-p:mb-4 prose-p:text-foreground prose-p:leading-relaxed prose-ul:mb-4 prose-ul:space-y-2 prose-li:flex prose-li:items-start prose-li:space-x-2 prose-li:text-foreground prose-strong:font-semibold prose-strong:text-primary prose-em:italic prose-em:text-foreground [&_a]:text-blue-600 [&_a]:underline [&_a:hover]:text-blue-800"
                    />
                  ) : (
                    // Content is Markdown
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 text-primary">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-2xl font-semibold mb-3 text-primary">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xl font-semibold mb-2 text-primary">{children}</h3>,
                        p: ({ children }) => <p className="mb-4 text-foreground leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="mb-4 space-y-2">{children}</ul>,
                        li: ({ children }) => <li className="flex items-start space-x-2 text-foreground"><span className="text-primary mt-1">•</span><span>{children}</span></li>,
                        strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                        em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground mb-4">{children}</blockquote>,
                        a: ({ children, href }) => <a href={href} className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">{children}</a>
                      }}
                    >
                      {currentStepData.content}
                    </ReactMarkdown>
                  )}
                </div>
                
                {/* Rendered Media */}
                {currentStepData.media?.map((mediaItem) => (
                  <div key={mediaItem.id} className="my-6">
                    {mediaItem.title && (
                      <h4 className="text-lg font-semibold mb-3 text-center">{mediaItem.title}</h4>
                    )}
                    {(mediaItem.type === 'gif' || mediaItem.type === 'image') && mediaItem.url && (
                      <div className="flex justify-center">
                        <img 
                          src={mediaItem.url} 
                          alt={mediaItem.title || (mediaItem.type === 'gif' ? 'GIF' : 'Image')} 
                          className="max-w-full h-auto rounded-lg shadow-lg"
                        />
                      </div>
                    )}
                    {(mediaItem.type === 'youtube' || mediaItem.type === 'loom') && mediaItem.url && (
                      <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                        <iframe
                          src={getEmbedUrl(mediaItem.url, mediaItem.type)}
                          className="w-full h-full"
                          frameBorder="0"
                          allowFullScreen
                          title={mediaItem.title || `${mediaItem.type} video`}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Button for External Links */}
          {currentStepData.actionUrl && (
            <div className="mb-6">
              <Button asChild className="w-full sm:w-auto">
                <a 
                  href={currentStepData.actionUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {currentStepData.actionTitle}
                </a>
              </Button>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-2">
              {!isWelcomeStep && (
                <Button
                  onClick={handleComplete}
                  disabled={isCompleted}
                  variant={isCompleted ? "secondary" : "default"}
                  className="flex items-center"
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    'Complete Step'
                  )}
                </Button>
              )}

              <Button
                onClick={handleNext}
                disabled={currentStep === wizardData.steps.length - 1}
                className="flex items-center"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Celebration */}
      {allCompleted && (
        <Card className="border-2 border-green-500/20 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10">
          <CardContent className="p-8 text-center">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">🎉 Congratulations!</h3>
            <p className="text-lg text-muted-foreground mb-6">
              You've completed the onboarding process! You're ready to start your CMFAS journey.
            </p>
            <Button 
              onClick={() => navigate('/cmfas/module/m9')}
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              Start M9 Module
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}