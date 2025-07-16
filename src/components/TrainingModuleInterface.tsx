import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Play, Pause, CheckCircle, Clock, Edit, Save, Plus, Trash2 } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";

interface TrainingModuleInterfaceProps {
  moduleName: string;
  duration: string;
  category: string;
  onClose: () => void;
}

interface ModuleContent {
  title: string;
  content: string;
  duration: number; // in seconds
  videoUrl?: string; // Optional video URL
}

// Sample training content - in a real app, this would come from a database
const trainingContent: { [key: string]: ModuleContent[] } = {
  "Investment Products Deep Dive": [
    {
      title: "Introduction to Investment-Linked Products",
      content: "Investment-linked products combine insurance protection with investment opportunities. These products allow policyholders to participate in the performance of underlying investment funds while maintaining life insurance coverage.\n\nKey features include:\n• Flexibility in premium payments\n• Choice of investment funds\n• Potential for higher returns\n• Transparency in charges and performance",
      duration: 300
    },
    {
      title: "Fund Selection and Asset Allocation",
      content: "Proper fund selection is crucial for optimal performance. Consider these factors:\n\n1. Risk tolerance of the client\n2. Investment horizon\n3. Financial objectives\n4. Market conditions\n\nAsset allocation strategies:\n• Conservative: 70% bonds, 30% equities\n• Balanced: 50% bonds, 50% equities\n• Aggressive: 30% bonds, 70% equities",
      duration: 450
    },
    {
      title: "Charges and Fees Structure",
      content: "Understanding the fee structure is essential for client education:\n\n• Premium allocation rate: Percentage of premium invested\n• Management fees: Annual charges on fund value\n• Switching fees: Costs for changing fund allocation\n• Surrender charges: Early withdrawal penalties\n\nTransparency in fee disclosure builds client trust and ensures informed decision-making.",
      duration: 360
    }
  ],
  "Endowment Product Features": [
    {
      title: "Guaranteed vs Non-Guaranteed Benefits",
      content: "Endowment products offer a combination of guaranteed and non-guaranteed benefits:\n\nGuaranteed Benefits:\n• Maturity benefits at specified policy years\n• Death benefits\n• Cash surrender values\n\nNon-Guaranteed Benefits:\n• Annual bonuses\n• Terminal bonuses\n• Special bonuses\n\nThe final payout depends on the insurance company's performance and investment returns.",
      duration: 240
    },
    {
      title: "Premium Payment Options",
      content: "Flexible premium payment structures accommodate different financial situations:\n\n• Single premium: One-time lump sum payment\n• Regular premium: Monthly, quarterly, or annual payments\n• Limited payment: Pay for a shorter period, coverage continues\n\nPayment flexibility helps clients match their cash flow with their insurance needs.",
      duration: 180
    }
  ],
  "Consultative Selling Approach": [
    {
      title: "Building Rapport and Trust",
      content: "Successful consultative selling starts with building genuine relationships:\n\n• Active listening to understand client needs\n• Asking open-ended questions\n• Showing empathy and understanding\n• Demonstrating expertise without being pushy\n\nRemember: People buy from people they like and trust. Focus on being genuinely helpful rather than just making a sale.",
      duration: 400
    },
    {
      title: "Needs Assessment Techniques",
      content: "Effective needs assessment is the foundation of consultative selling:\n\n1. Discovery Questions:\n   • What are your financial goals?\n   • What concerns keep you awake at night?\n   • How would your family cope financially if something happened to you?\n\n2. Fact-Finding:\n   • Current financial situation\n   • Existing insurance coverage\n   • Risk tolerance\n   • Timeline for goals\n\n3. Solution Mapping:\n   • Match products to identified needs\n   • Explain how features become benefits\n   • Address specific concerns",
      duration: 480
    }
  ],
  "Objection Handling Mastery": [
    {
      title: "Understanding Client Objections",
      content: "Objections are often signs of interest, not rejection. Common types:\n\n• Price objections: 'It's too expensive'\n• Trust objections: 'I need to think about it'\n• Authority objections: 'I need to discuss with my spouse'\n• Need objections: 'I don't need insurance'\n\nEach objection type requires a different approach and response strategy.",
      duration: 300
    },
    {
      title: "The HEAR Method",
      content: "Use the HEAR method to handle objections effectively:\n\nH - HALT: Stop talking and listen\nE - EMPATHIZE: Show understanding\nA - ASK: Clarify the real concern\nR - RESPOND: Address the specific issue\n\nExample:\n'I understand your concern about the cost. Can you help me understand what aspect of the investment you'd like to explore further?'",
      duration: 420
    }
  ],
  "Digital Presentation Skills": [
    {
      title: "Virtual Meeting Best Practices",
      content: "Master digital presentations for better client engagement:\n\n• Technology setup: Good lighting, clear audio, stable internet\n• Engagement techniques: Interactive polls, screen sharing, breakout discussions\n• Visual aids: Clear, simple slides with minimal text\n• Follow-up: Record sessions (with permission), send summaries\n\nRemember: The fundamentals of good presenting apply whether virtual or in-person.",
      duration: 180
    }
  ]
};

export function TrainingModuleInterface({ moduleName, duration, category, onClose }: TrainingModuleInterfaceProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [editableSections, setEditableSections] = useState<ModuleContent[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [editingDuration, setEditingDuration] = useState("");
  const [editingVideoUrl, setEditingVideoUrl] = useState("");
  
  const { isAdminMode } = useAdmin();
  const { toast } = useToast();
  
  // Initialize editable sections from the static data
  useEffect(() => {
    const originalSections = trainingContent[moduleName] || [];
    setEditableSections([...originalSections]);
  }, [moduleName]);
  
  const sections = editableSections;
  const currentSection = sections[currentSectionIndex];
  const totalSections = sections.length;
  const overallProgress = ((completedSections.size) / totalSections) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentSection) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          if (newTime >= currentSection.duration) {
            setIsPlaying(false);
            setCompletedSections(prev => new Set(prev).add(currentSectionIndex));
            return currentSection.duration;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSection, currentSectionIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextSection = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setTimeElapsed(0);
      setIsPlaying(false);
    }
  };

  const prevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setTimeElapsed(0);
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const markAsCompleted = () => {
    setCompletedSections(prev => new Set(prev).add(currentSectionIndex));
    setTimeElapsed(currentSection.duration);
    setIsPlaying(false);
  };

  // Admin editing functions
  const startEditing = () => {
    if (!isAdminMode) return;
    setIsEditing(true);
    setEditingTitle(currentSection.title);
    setEditingContent(currentSection.content);
    setEditingDuration((currentSection.duration / 60).toString()); // Convert to minutes for easier editing
    setEditingVideoUrl(currentSection.videoUrl || "");
  };

  const saveEdit = () => {
    if (!editingTitle.trim() || !editingContent.trim() || !editingDuration.trim()) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive"
      });
      return;
    }

    const durationInSeconds = Math.floor(parseFloat(editingDuration) * 60);
    if (durationInSeconds <= 0) {
      toast({
        title: "Error",
        description: "Duration must be greater than 0 minutes",
        variant: "destructive"
      });
      return;
    }

    const updatedSections = [...editableSections];
    updatedSections[currentSectionIndex] = {
      title: editingTitle.trim(),
      content: editingContent.trim(),
      duration: durationInSeconds,
      videoUrl: editingVideoUrl.trim() || undefined
    };
    setEditableSections(updatedSections);
    setIsEditing(false);
    setTimeElapsed(0);
    setIsPlaying(false);
    
    toast({
      title: "Section Updated",
      description: "Training section has been successfully updated"
    });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingTitle("");
    setEditingContent("");
    setEditingDuration("");
    setEditingVideoUrl("");
  };

  const addNewSection = () => {
    const newSection: ModuleContent = {
      title: "New Training Section",
      content: "Enter the content for this training section...",
      duration: 300 // 5 minutes default
    };
    const updatedSections = [...editableSections, newSection];
    setEditableSections(updatedSections);
    setCurrentSectionIndex(updatedSections.length - 1);
    setTimeElapsed(0);
    setIsPlaying(false);
    setIsEditing(true);
    setEditingTitle(newSection.title);
    setEditingContent(newSection.content);
    setEditingDuration("5");
    
    toast({
      title: "New Section Added",
      description: "A new training section has been created"
    });
  };

  const deleteSection = () => {
    if (editableSections.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete the last remaining section",
        variant: "destructive"
      });
      return;
    }

    const updatedSections = editableSections.filter((_, index) => index !== currentSectionIndex);
    setEditableSections(updatedSections);
    
    // Adjust current index if necessary
    if (currentSectionIndex >= updatedSections.length) {
      setCurrentSectionIndex(updatedSections.length - 1);
    }
    
    setTimeElapsed(0);
    setIsPlaying(false);
    setIsEditing(false);
    
    toast({
      title: "Section Deleted",
      description: "Training section has been removed"
    });
  };

  if (!currentSection) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
        <Card className="w-full max-w-md mx-4 my-8">
          <CardHeader>
            <CardTitle>Module Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Training content for "{moduleName}" is not yet available.
            </p>
            <Button onClick={onClose} className="w-full">Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sectionProgress = (timeElapsed / currentSection.duration) * 100;
  const isCurrentSectionCompleted = completedSections.has(currentSectionIndex);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto p-4">
      <Card className="w-full max-w-4xl mx-4 my-8">
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{moduleName}</CardTitle>
              <p className="text-sm text-muted-foreground">{category} • {duration}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Overall Progress: {completedSections.size}/{totalSections} sections</span>
              <span>Section {currentSectionIndex + 1} of {totalSections}</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-6">
            {isEditing && isAdminMode ? (
              /* Admin Editing Mode */
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Section Title</label>
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    placeholder="Enter section title..."
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={editingDuration}
                    onChange={(e) => setEditingDuration(e.target.value)}
                    placeholder="Enter duration in minutes..."
                    min="1"
                    step="0.5"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Video URL (optional)</label>
                  <Input
                    value={editingVideoUrl}
                    onChange={(e) => setEditingVideoUrl(e.target.value)}
                    placeholder="Enter video URL (YouTube, Vimeo, etc.)..."
                    type="url"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add a video URL to include video content in this training section
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    placeholder="Enter the training content..."
                    className="min-h-[300px]"
                  />
                </div>

                <div className="flex gap-2 justify-center">
                  <Button onClick={saveEdit} size="sm" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button onClick={cancelEdit} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* Normal Training Mode */
              <>
                <div className="text-center">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-semibold flex-1">{currentSection.title}</h2>
                    {isAdminMode && (
                      <Button onClick={startEditing} variant="ghost" size="sm" className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(timeElapsed)} / {formatTime(currentSection.duration)}</span>
                    </div>
                    {isCurrentSectionCompleted && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  <Progress value={sectionProgress} className="h-1 mt-2" />
                </div>

                {/* Video Display */}
                {currentSection.videoUrl && (
                  <div className="bg-accent/10 rounded-lg p-4 border">
                    <h4 className="font-medium mb-3 text-center">Training Video</h4>
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <iframe
                        src={currentSection.videoUrl}
                        title={currentSection.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                <div className="bg-accent/20 rounded-lg p-6 max-h-[400px] overflow-y-auto">
                  <div className="prose prose-sm max-w-none text-foreground">
                    {currentSection.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    onClick={togglePlayPause}
                    variant={isPlaying ? "secondary" : "default"}
                    size="lg"
                    className="flex items-center gap-2"
                    disabled={isCurrentSectionCompleted}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        {timeElapsed > 0 ? 'Resume' : 'Start'}
                      </>
                    )}
                  </Button>
                  
                  {!isCurrentSectionCompleted && timeElapsed > currentSection.duration * 0.8 && (
                    <Button
                      onClick={markAsCompleted}
                      variant="outline"
                      size="lg"
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </CardContent>

        <div className="border-t p-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevSection}
              disabled={currentSectionIndex === 0}
            >
              Previous Section
            </Button>

            <div className="flex gap-1 items-center">
              {isAdminMode && (
                <div className="flex gap-1 mr-4">
                  <Button
                    variant="outline"
                    onClick={addNewSection}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Section
                  </Button>
                  <Button
                    variant="outline"
                    onClick={deleteSection}
                    size="sm"
                    className="flex items-center gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
              
              {sections.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    completedSections.has(index)
                      ? 'bg-success'
                      : index === currentSectionIndex
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={nextSection}
              disabled={currentSectionIndex === sections.length - 1}
            >
              Next Section
            </Button>
          </div>
        </div>

        {completedSections.size === totalSections && (
          <div className="border-t bg-success/10 p-4 text-center">
            <p className="text-success font-semibold">
              🎉 Congratulations! You've completed the entire training module!
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}