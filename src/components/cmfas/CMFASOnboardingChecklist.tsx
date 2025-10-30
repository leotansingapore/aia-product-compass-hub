import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { ChecklistHeader } from '@/components/onboarding/checklist/ChecklistHeader';
import { ChecklistItem } from '@/components/onboarding/checklist/ChecklistItem';
import { CompletionCelebration } from '@/components/onboarding/checklist/CompletionCelebration';
import { useChecklistProgress } from '@/hooks/useChecklistProgress';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Calendar, Database, BookOpen, Trophy } from 'lucide-react';
import { EditableText } from '@/components/EditableText';
import { useAdmin } from '@/hooks/useAdmin';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: () => void;
  points: number;
  category: 'essential' | 'explore' | 'advanced';
}

interface CMFASOnboardingChecklistProps {
  onUpdate?: (field: string, value: any) => Promise<void>;
}

export function CMFASOnboardingChecklist({ onUpdate }: CMFASOnboardingChecklistProps) {
  const navigate = useNavigate();
  const { completeItem, isItemCompleted } = useChecklistProgress();
  const { isAdmin: isAdminMode } = useAdmin();
  const [isExpanded, setIsExpanded] = useState(true);

  const [checklistData, setChecklistData] = useState({
    title: "🚀 CMFAS Getting Started Checklist",
    subtitle: "Complete these essential setup steps before you begin studying for your CMFAS exams.",
    items: [
      {
        id: 'create-student-account',
        title: 'Create Student Account',
        description: 'Register your student account at SCI College to access exam booking and materials.',
        icon: UserPlus,
        points: 20,
        category: 'essential' as const,
        detailsTitle: 'Step 1: Create Student Account',
        detailsContent: `Create your student account at <a href="https://www.scicollege.org.sg/Account/Register" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-medium">SCI College Registration</a>

**Fill in the form with these details:**
- Training Co-ordinator: NA
- Email: NA  
- Agency: NA

📧 **Important:** Send us a screenshot of your email confirmation once your student account is created.`
      },
      {
        id: 'register-m9-exam',
        title: 'Register for M9 Exam',
        description: 'Book your M9 exam first to create a study deadline. Aim to pass 1-2 exams per month.',
        icon: Calendar,
        points: 15,
        category: 'essential' as const,
        detailsTitle: 'Step 2: Register for M9 Exam',
        detailsContent: `Book your M9 exam first to create a study deadline. Aim to pass 1-2 exams per month starting with M9.

💡 **Pro Tip:** Book your exam before you start studying to create accountability and motivation!`
      },
      {
        id: 'access-question-bank',
        title: 'Get Access to Question Bank',
        description: 'Essential 5-minute setup to access practice questions through iRecruit platform.',
        icon: Database,
        points: 25,
        category: 'essential' as const,
        detailsTitle: 'Step 3: Get Access to Exam Question Bank',
        detailsContent: `This is essential for exam preparation - a quick 5-minute setup to access practice questions.

**🔐 Initial Setup:**
1. Send Leo your **name**, **email**, and **handphone number**
2. Login to **iRecruit** using the credentials provided

**📚 Accessing the Question Bank:**
Navigate: iLearn → Pre-Contract → Pre-Contract (Online) → CMFAS M9 → Practice Questions → Chapter Revision and Premium Papers → Launch

**⚙️ Optimal Study Settings:**
Configure: Launch → Restart → OK → Select Module 9 → All Questions → 50 Questions → Redo Cleared Questions → Learning Mode → Start Session

💡 **Study Strategy:** Use the speed reference to answer questions and learn by doing instead of reading the textbook first.

📱 **Mobile Access:** Login to iLearn on mobile and download the iLearn mobile app for studying on-the-go.`
      },
      {
        id: 'understand-costs-timeline',
        title: 'Understand Study Timeline & Costs',
        description: 'Learn about exam costs, subsidies, and expected study time commitments.',
        icon: BookOpen,
        points: 10,
        category: 'explore' as const,
        detailsTitle: '📚 Study Timeline & Costs',
        detailsContent: `Each exam requires approximately **20-30 hours** of dedicated study time.

**Exam Costs (First Attempt - Subsidized):**
- M9: S$109.00
- M9A: S$109.00  
- HI: S$76.30
- RES5: S$185.30

**Our Support Package:**
- 📚 Comprehensive Flashcards
- 👨‍🏫 Personal Tutoring
- ❓ Extensive Question Bank
- 🤖 AI Chatbot Support
- 🔑 Key Concepts Summary
- 💡 Expert Study Tips

⚠️ **Important:** We subsidize only the first attempt of each exam. Subsequent attempts will be at your own cost.`
      },
      {
        id: 'complete-first-practice',
        title: 'Complete First Practice Session',
        description: 'Take your first practice test to establish baseline knowledge and identify study areas.',
        icon: Trophy,
        points: 30,
        category: 'advanced' as const,
        detailsTitle: 'Complete Your First Practice Session',
        detailsContent: `Take your first practice test using the question bank to establish your baseline knowledge.

This will help you:
- Identify areas that need more focus
- Get familiar with the exam format
- Build confidence with the platform

Start with 20-30 questions in learning mode to get comfortable with the system.`
      }
    ]
  });

  const handleTextUpdate = async (field: string, value: string) => {
    const newData = { ...checklistData, [field]: value };
    setChecklistData(newData);
    if (onUpdate) {
      await onUpdate('checklist_data', newData);
    }
  };

  const handleItemUpdate = async (itemId: string, field: string, value: string) => {
    const newItems = checklistData.items.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    );
    const newData = { ...checklistData, items: newItems };
    setChecklistData(newData);
    if (onUpdate) {
      await onUpdate('checklist_data', newData);
    }
  };

  const createChecklistItems = (): ChecklistItem[] => {
    return checklistData.items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      icon: item.icon,
      action: () => {
        completeItem(item.id);
        // You could add navigation or other actions here
      },
      points: item.points,
      category: item.category
    }));
  };

  const checklistItems = createChecklistItems();
  const completedItems = checklistItems.filter(item => isItemCompleted(item.id));
  const totalPoints = checklistItems.reduce((sum, item) => sum + item.points, 0);
  const earnedPoints = completedItems.reduce((sum, item) => sum + item.points, 0);
  const progressPercentage = Math.round((completedItems.length / checklistItems.length) * 100);

  return (
    <div className="mb-8">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <ChecklistHeader
            isExpanded={isExpanded}
            completedCount={completedItems.length}
            totalCount={checklistItems.length}
            earnedPoints={earnedPoints}
            totalPoints={totalPoints}
            progressPercentage={progressPercentage}
          />
          
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="mb-6">
                <EditableText
                  value={checklistData.title}
                  onSave={(value) => handleTextUpdate('title', value)}
                  className="text-3xl font-bold mb-4"
                  placeholder="Enter checklist title..."
                />
                <EditableText
                  value={checklistData.subtitle}
                  onSave={(value) => handleTextUpdate('subtitle', value)}
                  className="text-muted-foreground text-lg"
                  placeholder="Enter checklist subtitle..."
                />
              </div>

              <div className="space-y-4">
                {checklistItems.map((item, index) => {
                  const itemData = checklistData.items[index];
                  const completed = isItemCompleted(item.id);
                  
                  return (
                    <div key={item.id} className="space-y-4">
                      <ChecklistItem
                        item={item}
                        completed={completed}
                      />
                      
                      {/* Expandable details section */}
                      <div className="border-l-4 border-primary pl-6 bg-muted/30 p-4 rounded-lg">
                        <EditableText
                          value={itemData.detailsTitle}
                          onSave={(value) => handleItemUpdate(item.id, 'detailsTitle', value)}
                          className="font-semibold text-xl mb-3"
                          placeholder="Enter step title..."
                        />
                        <EditableText
                          value={itemData.detailsContent}
                          onSave={(value) => handleItemUpdate(item.id, 'detailsContent', value)}
                          className="text-muted-foreground"
                          multiline={true}
                          placeholder="Enter step details..."
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {progressPercentage === 100 && (
                <div className="mt-6">
                  <CompletionCelebration
                    onStartLearning={() => navigate('/cmfas/module/m9')}
                  />
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}