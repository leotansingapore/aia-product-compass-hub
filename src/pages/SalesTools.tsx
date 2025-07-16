import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FlashcardStudyInterface } from "@/components/FlashcardStudyInterface";
import { TrainingModuleInterface } from "@/components/TrainingModuleInterface";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Save, X, ChevronDown, ChevronUp } from "lucide-react";

interface ToolSection {
  title: string;
  content: string;
  url?: string;
}

interface BaseTool {
  name: string;
  description: string;
}

interface ScriptTool extends BaseTool {
  scripts: string[];
  questions?: never;
  techniques?: never;
  action?: never;
  sections?: never;
  link?: never;
}

interface QuestionTool extends BaseTool {
  questions: string[];
  techniques?: never;
  scripts?: never;
  action?: never;
  sections?: never;
  link?: never;
}

interface TechniqueTool extends BaseTool {
  techniques: string[];
  questions?: never;
  scripts?: never;
  action?: never;
  sections?: never;
  link?: never;
}

interface ActionTool extends BaseTool {
  action: string;
  sections: ToolSection[];
  scripts?: never;
  questions?: never;
  techniques?: never;
  link?: never;
}

interface LinkTool extends BaseTool {
  link: string;
  scripts?: never;
  questions?: never;
  techniques?: never;
  action?: never;
  sections?: never;
}

type Tool = ScriptTool | QuestionTool | TechniqueTool | ActionTool | LinkTool;

interface ToolCategory {
  id: string;
  title: string;
  description: string;
  tools: Tool[];
}

const salesTools: ToolCategory[] = [
  {
    id: 'generic-objections',
    title: 'Generic Objections',
    description: 'Common objection types across all sales situations',
    tools: [
      {
        name: '🔐 Trust Objections',
        description: 'Building credibility and trust',
        link: 'https://example.com/trust-objections-guide'
      },
      {
        name: 'Cost Objections',
        description: 'Price concerns and affordability',
        link: 'https://example.com/cost-objections-guide'
      },
      {
        name: '⏳ Delay Objections',
        description: 'Postponing decisions',
        link: 'https://example.com/delay-objections-guide'
      },
      {
        name: '💼 Entrepreneurial Objections',
        description: 'Business owner concerns',
        link: 'https://example.com/entrepreneurial-objections-guide'
      },
      {
        name: '❤️ Emotional Objections',
        description: 'Emotional concerns and fears',
        link: 'https://example.com/emotional-objections-guide'
      },
      {
        name: '🔁 Loyalty Objections',
        description: 'Existing provider loyalty',
        link: 'https://example.com/loyalty-objections-guide'
      },
      {
        name: '🧠 Analytical Objections',
        description: 'Data-driven concerns',
        link: 'https://example.com/analytical-objections-guide'
      }
    ]
  },
  {
    id: 'tactical-objections',
    title: 'Tactical Objections',
    description: 'Specific tactical objections and competitive scenarios',
    tools: [
      {
        name: 'Portfolio Performance Issues',
        description: 'Market downturns and poor performance',
        link: 'https://example.com/portfolio-performance-objections'
      },
      {
        name: 'Market Timing & DIY Investing',
        description: 'Self-directed investment preferences',
        link: 'https://example.com/diy-market-timing-objections'
      },
      {
        name: 'ILP Concerns',
        description: 'Investment-linked product objections',
        link: 'https://example.com/ilp-concerns-objections'
      },
      {
        name: 'Policy Loadings & Exclusions',
        description: 'Insurance terms and conditions',
        link: 'https://example.com/policy-loadings-exclusions'
      },
      {
        name: 'FWD Par Fund Comparisons',
        description: 'Competitive product comparisons',
        link: 'https://example.com/fwd-par-fund-objections'
      },
      {
        name: 'IFA Referral Requests',
        description: 'Independent advisor preferences',
        link: 'https://example.com/ifa-referral-objections'
      },
      {
        name: 'Group Term Life (GTL)',
        description: 'Employer insurance benefits',
        link: 'https://example.com/gtl-objections'
      },
      {
        name: 'Robo Advisor Competition',
        description: 'Automated investment platforms',
        link: 'https://example.com/robo-advisor-objections'
      },
      {
        name: 'MHA & GTL Concerns',
        description: 'Medical and group insurance',
        link: 'https://example.com/mha-gtl-objections'
      },
      {
        name: 'S&P 500 Preferences',
        description: 'Index fund comparisons',
        link: 'https://example.com/sp500-objections'
      },
      {
        name: 'Premium Structure Debates',
        description: 'Single vs regular premiums',
        link: 'https://example.com/premium-structure-objections'
      },
      {
        name: 'Market Stress Testing',
        description: 'Uncertainty and risk management',
        link: 'https://example.com/market-stress-tests'
      }
    ]
  },
  {
    id: 'presentation-tools',
    title: 'Presentation Tools',
    description: 'Visual aids and templates for client meetings',
    tools: [
      {
        name: 'Need Analysis Worksheet',
        description: 'Structured approach to identify client needs',
        action: 'worksheet',
        sections: [
          { title: 'Client Information', content: 'Basic client demographics and contact details', url: 'https://example.com/client-info-template' },
          { title: 'Financial Goals', content: 'Short-term and long-term financial objectives', url: 'https://example.com/financial-goals-guide' },
          { title: 'Risk Assessment', content: 'Current insurance coverage and protection gaps' },
          { title: 'Budget Analysis', content: 'Monthly income, expenses, and available premium budget' }
        ]
      },
      {
        name: 'Comparison Charts',
        description: 'Side-by-side product comparisons',
        action: 'comparison',
        sections: [
          { title: 'Feature Comparison', content: 'Side-by-side comparison of product features' },
          { title: 'Premium Comparison', content: 'Cost analysis across different products' },
          { title: 'Benefit Comparison', content: 'Coverage amounts and benefit structures' }
        ]
      },
      {
        name: 'Benefit Illustrations',
        description: 'Customizable benefit projections',
        action: 'illustrations',
        sections: [
          { title: 'Projection Scenarios', content: 'Different growth rate scenarios' },
          { title: 'Withdrawal Options', content: 'Various withdrawal strategies and timing' },
          { title: 'Legacy Planning', content: 'Death benefit illustrations and estate planning' }
        ]
      }
    ]
  },
  {
    id: 'sales-process',
    title: 'Sales Process Guide',
    description: 'Step-by-step methodology for effective selling',
    tools: [
      {
        name: 'Discovery Questions',
        description: 'Questions to uncover client needs and motivations',
        questions: [
          'What would happen to your family if you couldn\'t work tomorrow?',
          'What are your biggest financial concerns for the future?',
          'How important is it to leave a legacy for your children?',
          'What\'s your experience with investment products?'
        ]
      },
      {
        name: 'Closing Techniques',
        description: 'Natural ways to move clients toward a decision',
        techniques: [
          'Assumptive Close: "When would you like the coverage to start?"',
          'Alternative Close: "Would you prefer monthly or annual premiums?"',
          'Urgency Close: "Let\'s get this in place before any health changes occur."'
        ]
      }
    ]
  }
];

const flashcardSets = [
  {
    category: 'Investment Products',
    sets: [
      { name: 'Pro Achiever Key Features', cards: 15 },
      { name: 'Investment Risks & Benefits', cards: 12 },
      { name: 'Fund Options Overview', cards: 18 }
    ]
  },
  {
    category: 'Endowment Products',
    sets: [
      { name: 'Smart Wealth Builder Benefits', cards: 10 },
      { name: 'Guaranteed vs Non-Guaranteed', cards: 8 },
      { name: 'Policy Loans & Withdrawals', cards: 6 }
    ]
  },
  {
    category: 'Term Products',
    sets: [
      { name: 'Term vs Whole Life', cards: 12 },
      { name: 'Conversion Options', cards: 8 },
      { name: 'Underwriting Guidelines', cards: 15 }
    ]
  }
];

const trainingModules = [
  {
    title: 'Product Knowledge Mastery',
    modules: [
      { name: 'Investment Products Deep Dive', duration: '45 min', status: 'available' },
      { name: 'Endowment Product Features', duration: '30 min', status: 'available' },
      { name: 'Medical Insurance Overview', duration: '35 min', status: 'available' }
    ]
  },
  {
    title: 'Sales Skills Development',
    modules: [
      { name: 'Consultative Selling Approach', duration: '60 min', status: 'available' },
      { name: 'Objection Handling Mastery', duration: '40 min', status: 'available' },
      { name: 'Digital Presentation Skills', duration: '25 min', status: 'available' }
    ]
  }
];

export default function SalesTools() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('generic-objections');
  const [studyingFlashcard, setStudyingFlashcard] = useState<{
    setName: string;
    category: string;
    totalCards: number;
  } | null>(null);
  const [studyingModule, setStudyingModule] = useState<{
    moduleName: string;
    duration: string;
    category: string;
  } | null>(null);
  const [editableTrainingModules, setEditableTrainingModules] = useState(trainingModules);
  const [editableSalesTools, setEditableSalesTools] = useState(() => salesTools);
  const [expandedTools, setExpandedTools] = useState<{[key: string]: boolean}>({});
  const [editingSections, setEditingSections] = useState<{[key: string]: boolean}>({});
  const [tempSectionData, setTempSectionData] = useState<{[key: string]: {title: string, content: string, url?: string}}>({});
  const [editingTools, setEditingTools] = useState<{[key: string]: boolean}>({});
  const [tempToolData, setTempToolData] = useState<{[key: string]: {name: string, description: string, link?: string}}>({});
  
  const { isAdminMode } = useAdmin();
  const { toast } = useToast();

  // Admin functions for training modules
  const addNewTrainingModule = (categoryTitle: string) => {
    const newModule = {
      name: 'New Training Module',
      duration: '30 min',
      status: 'available' as const
    };

    const updatedModules = editableTrainingModules.map(group => 
      group.title === categoryTitle 
        ? { ...group, modules: [...group.modules, newModule] }
        : group
    );

    setEditableTrainingModules(updatedModules);
    
    toast({
      title: "New Module Added",
      description: `Added new training module to ${categoryTitle}`
    });
  };

  const deleteTrainingModule = (categoryTitle: string, moduleIndex: number) => {
    const updatedModules = editableTrainingModules.map(group => 
      group.title === categoryTitle 
        ? { ...group, modules: group.modules.filter((_, index) => index !== moduleIndex) }
        : group
    );

    setEditableTrainingModules(updatedModules);
    
    toast({
      title: "Module Deleted",
      description: "Training module has been removed"
    });
  };

  // Tool section management functions
  const toggleToolExpansion = (toolCategoryId: string, toolIndex: number) => {
    const key = `${toolCategoryId}-${toolIndex}`;
    setExpandedTools(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const startEditingSection = (toolCategoryId: string, toolIndex: number, sectionIndex: number, section: any) => {
    const key = `${toolCategoryId}-${toolIndex}-${sectionIndex}`;
    setEditingSections(prev => ({ ...prev, [key]: true }));
    setTempSectionData(prev => ({ 
      ...prev, 
      [key]: { title: section.title, content: section.content, url: section.url || '' } 
    }));
  };

  const cancelEditingSection = (toolCategoryId: string, toolIndex: number, sectionIndex: number) => {
    const key = `${toolCategoryId}-${toolIndex}-${sectionIndex}`;
    setEditingSections(prev => ({ ...prev, [key]: false }));
    setTempSectionData(prev => {
      const newData = { ...prev };
      delete newData[key];
      return newData;
    });
  };

  const saveSection = (toolCategoryId: string, toolIndex: number, sectionIndex: number) => {
    const key = `${toolCategoryId}-${toolIndex}-${sectionIndex}`;
    const tempData = tempSectionData[key];
    
    if (!tempData || !tempData.title.trim()) {
      toast({
        title: "Error",
        description: "Section title is required",
        variant: "destructive"
      });
      return;
    }

    const updatedTools = editableSalesTools.map(toolCategory => {
      if (toolCategory.id === toolCategoryId) {
        const updatedTools = [...toolCategory.tools];
        const tool = updatedTools[toolIndex];
        if (tool && 'sections' in tool && tool.sections) {
          updatedTools[toolIndex] = {
            ...tool,
            sections: tool.sections.map((section, idx) => 
              idx === sectionIndex 
                ? { title: tempData.title.trim(), content: tempData.content.trim(), url: tempData.url?.trim() || undefined }
                : section
            )
          } as ActionTool;
        }
        return { ...toolCategory, tools: updatedTools };
      }
      return toolCategory;
    });

    setEditableSalesTools(updatedTools);
    setEditingSections(prev => ({ ...prev, [key]: false }));
    setTempSectionData(prev => {
      const newData = { ...prev };
      delete newData[key];
      return newData;
    });

    toast({
      title: "Section Updated",
      description: "Section has been successfully updated"
    });
  };

  const addNewSection = (toolCategoryId: string, toolIndex: number) => {
    const updatedTools = editableSalesTools.map(toolCategory => {
      if (toolCategory.id === toolCategoryId) {
        const updatedTools = [...toolCategory.tools];
        const tool = updatedTools[toolIndex];
        if (tool && 'sections' in tool) {
          const sections = tool.sections || [];
          updatedTools[toolIndex] = {
            ...tool,
            sections: [...sections, { title: 'New Section', content: 'Section content here...', url: '' }]
          } as ActionTool;
        }
        return { ...toolCategory, tools: updatedTools };
      }
      return toolCategory;
    });

    setEditableSalesTools(updatedTools);
    
    toast({
      title: "Section Added",
      description: "New section has been added"
    });
  };

  const deleteSection = (toolCategoryId: string, toolIndex: number, sectionIndex: number) => {
    const updatedTools = editableSalesTools.map(toolCategory => {
      if (toolCategory.id === toolCategoryId) {
        const updatedTools = [...toolCategory.tools];
        const tool = updatedTools[toolIndex];
        if (tool && 'sections' in tool && tool.sections) {
          updatedTools[toolIndex] = {
            ...tool,
            sections: tool.sections.filter((_, idx) => idx !== sectionIndex)
          } as ActionTool;
        }
        return { ...toolCategory, tools: updatedTools };
      }
      return toolCategory;
    });

    setEditableSalesTools(updatedTools);
    
    toast({
      title: "Section Deleted",
      description: "Section has been removed"
    });
  };

  // Tool management functions
  const startEditingTool = (toolCategoryId: string, toolIndex: number, tool: any) => {
    const key = `${toolCategoryId}-${toolIndex}`;
    setEditingTools(prev => ({ ...prev, [key]: true }));
    setTempToolData(prev => ({ 
      ...prev, 
      [key]: { 
        name: tool.name, 
        description: tool.description, 
        link: (tool as LinkTool).link || '' 
      } 
    }));
  };

  const cancelEditingTool = (toolCategoryId: string, toolIndex: number) => {
    const key = `${toolCategoryId}-${toolIndex}`;
    setEditingTools(prev => ({ ...prev, [key]: false }));
    setTempToolData(prev => {
      const newData = { ...prev };
      delete newData[key];
      return newData;
    });
  };

  const saveTool = (toolCategoryId: string, toolIndex: number) => {
    const key = `${toolCategoryId}-${toolIndex}`;
    const tempData = tempToolData[key];
    
    if (!tempData || !tempData.name.trim()) {
      toast({
        title: "Error",
        description: "Tool name is required",
        variant: "destructive"
      });
      return;
    }

    if (!tempData.link?.trim()) {
      toast({
        title: "Error", 
        description: "Tool link is required",
        variant: "destructive"
      });
      return;
    }

    const updatedTools = editableSalesTools.map(toolCategory => {
      if (toolCategory.id === toolCategoryId) {
        const updatedTools = [...toolCategory.tools];
        updatedTools[toolIndex] = {
          name: tempData.name.trim(),
          description: tempData.description.trim(),
          link: tempData.link.trim()
        } as LinkTool;
        return { ...toolCategory, tools: updatedTools };
      }
      return toolCategory;
    });

    setEditableSalesTools(updatedTools);
    setEditingTools(prev => ({ ...prev, [key]: false }));
    setTempToolData(prev => {
      const newData = { ...prev };
      delete newData[key];
      return newData;
    });

    toast({
      title: "Tool Updated",
      description: "Tool has been successfully updated"
    });
  };

  const addNewTool = (toolCategoryId: string) => {
    const updatedTools = editableSalesTools.map(toolCategory => {
      if (toolCategory.id === toolCategoryId) {
        const newTool: LinkTool = {
          name: 'New Objection',
          description: 'New objection handling guide',
          link: 'https://example.com/new-objection-guide'
        };
        return { ...toolCategory, tools: [...toolCategory.tools, newTool] };
      }
      return toolCategory;
    });

    setEditableSalesTools(updatedTools);
    
    toast({
      title: "New Tool Added",
      description: "New objection handling tool has been added"
    });
  };

  const deleteTool = (toolCategoryId: string, toolIndex: number) => {
    const updatedTools = editableSalesTools.map(toolCategory => {
      if (toolCategory.id === toolCategoryId) {
        return { 
          ...toolCategory, 
          tools: toolCategory.tools.filter((_, idx) => idx !== toolIndex) 
        };
      }
      return toolCategory;
    });

    setEditableSalesTools(updatedTools);
    
    toast({
      title: "Tool Deleted",
      description: "Objection handling tool has been removed"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        title="Sales Tools & Objection Handling"
        subtitle="Everything you need to excel in client interactions and close more sales"
        showBackButton
        onBack={() => navigate('/')}
      />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Quick Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {salesTools.map((tool) => (
            <Button
              key={tool.id}
              variant={activeTab === tool.id ? "default" : "outline"}
              onClick={() => setActiveTab(tool.id)}
            >
              {tool.title}
            </Button>
          ))}
        </div>

        {/* Sales Tools Content */}
        <div className="mb-12">
          {editableSalesTools.map((toolCategory) => (
            <div key={toolCategory.id} className={activeTab === toolCategory.id ? 'block' : 'hidden'}>
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{toolCategory.title}</CardTitle>
                      <CardDescription>{toolCategory.description}</CardDescription>
                    </div>
                    {isAdminMode && (toolCategory.id === 'generic-objections' || toolCategory.id === 'tactical-objections') && (
                      <Button
                        onClick={() => addNewTool(toolCategory.id)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Objection
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {toolCategory.tools.map((tool, index) => (
                      <div key={index} className="border border-border/50 rounded-lg p-4 hover:bg-accent/20 transition-colors">
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <h3 className="font-medium text-sm leading-tight">{tool.name}</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">{tool.description}</p>
                          </div>

                          {tool.link && (
                            <div className="space-y-2">
                              {isAdminMode && editingTools[`${toolCategory.id}-${index}`] ? (
                                <div className="space-y-2 p-3 border border-border rounded-md bg-accent/20">
                                  <Input
                                    value={tempToolData[`${toolCategory.id}-${index}`]?.name || tool.name}
                                    onChange={(e) => setTempToolData(prev => ({
                                      ...prev,
                                      [`${toolCategory.id}-${index}`]: { 
                                        ...prev[`${toolCategory.id}-${index}`], 
                                        name: e.target.value 
                                      }
                                    }))}
                                    placeholder="Tool name..."
                                    className="text-xs"
                                  />
                                  <Textarea
                                    value={tempToolData[`${toolCategory.id}-${index}`]?.description || tool.description}
                                    onChange={(e) => setTempToolData(prev => ({
                                      ...prev,
                                      [`${toolCategory.id}-${index}`]: { 
                                        ...prev[`${toolCategory.id}-${index}`], 
                                        description: e.target.value 
                                      }
                                    }))}
                                    placeholder="Tool description..."
                                    rows={2}
                                    className="text-xs"
                                  />
                                  <Input
                                    value={tempToolData[`${toolCategory.id}-${index}`]?.link || (tool as LinkTool).link}
                                    onChange={(e) => setTempToolData(prev => ({
                                      ...prev,
                                      [`${toolCategory.id}-${index}`]: { 
                                        ...prev[`${toolCategory.id}-${index}`], 
                                        link: e.target.value 
                                      }
                                    }))}
                                    placeholder="https://example.com/objection-guide"
                                    type="url"
                                    className="text-xs"
                                  />
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      onClick={() => saveTool(toolCategory.id, index)}
                                      className="flex items-center gap-1 text-xs h-7"
                                    >
                                      <Save className="h-3 w-3" />
                                      Save
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => cancelEditingTool(toolCategory.id, index)}
                                      className="flex items-center gap-1 text-xs h-7"
                                    >
                                      <X className="h-3 w-3" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-2">
                                  <Button variant="outline" size="sm" className="w-full text-xs h-8" asChild>
                                    <a href={(tool as LinkTool).link} target="_blank" rel="noopener noreferrer">
                                      Access Tool
                                    </a>
                                  </Button>
                                  {isAdminMode && (toolCategory.id === 'generic-objections' || toolCategory.id === 'tactical-objections') && (
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => startEditingTool(toolCategory.id, index, tool)}
                                        className="flex items-center gap-1 text-xs h-7 flex-1"
                                      >
                                        <Edit className="h-3 w-3" />
                                        Edit
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => deleteTool(toolCategory.id, index)}
                                        className="flex items-center gap-1 text-xs h-7 text-destructive hover:text-destructive flex-1"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                        Delete
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {tool.scripts && (
                            <div className="space-y-2">
                              {tool.scripts.map((script, scriptIndex) => (
                                <div key={scriptIndex} className="bg-accent/30 p-2 rounded-md">
                                  <p className="text-xs">{script}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {tool.questions && (
                            <div className="space-y-2">
                              {tool.questions.map((question, questionIndex) => (
                                <div key={questionIndex} className="flex items-start">
                                  <span className="text-primary mr-1 mt-0.5 text-xs">Q:</span>
                                  <p className="text-xs text-muted-foreground">{question}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {tool.techniques && (
                            <div className="space-y-2">
                              {tool.techniques.map((technique, techIndex) => (
                                <div key={techIndex} className="bg-success/10 p-2 rounded-md">
                                  <p className="text-xs">{technique}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {tool.action && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => toggleToolExpansion(toolCategory.id, index)}
                                  className="flex items-center gap-1 text-xs h-8 flex-1"
                                >
                                  Access Tool
                                  {expandedTools[`${toolCategory.id}-${index}`] ? 
                                    <ChevronUp className="h-3 w-3" /> : 
                                    <ChevronDown className="h-3 w-3" />
                                  }
                                </Button>
                                {isAdminMode && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addNewSection(toolCategory.id, index)}
                                    className="flex items-center gap-1 text-xs h-8"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                              
                              {expandedTools[`${toolCategory.id}-${index}`] && 'sections' in tool && tool.sections && (
                                <div className="space-y-2 border-t pt-2">
                                  {tool.sections.map((section, sectionIndex) => {
                                    const sectionKey = `${toolCategory.id}-${index}-${sectionIndex}`;
                                    const isEditing = editingSections[sectionKey];
                                    const tempData = tempSectionData[sectionKey];
                                    
                                    return (
                                      <div key={sectionIndex} className="bg-accent/20 p-2 rounded-md">
                                        {isEditing ? (
                                          <div className="space-y-2">
                                            <Input
                                              value={tempData?.title || section.title}
                                              onChange={(e) => setTempSectionData(prev => ({
                                                ...prev,
                                                [sectionKey]: { ...tempData, title: e.target.value }
                                              }))}
                                              placeholder="Section title..."
                                              className="text-xs"
                                            />
                                            <Textarea
                                              value={tempData?.content || section.content}
                                              onChange={(e) => setTempSectionData(prev => ({
                                                ...prev,
                                                [sectionKey]: { ...tempData, content: e.target.value }
                                              }))}
                                              placeholder="Section content..."
                                              rows={2}
                                              className="text-xs"
                                            />
                                            <Input
                                              value={tempData?.url || section.url || ''}
                                              onChange={(e) => setTempSectionData(prev => ({
                                                ...prev,
                                                [sectionKey]: { ...tempData, url: e.target.value }
                                              }))}
                                              placeholder="Optional URL"
                                              type="url"
                                              className="text-xs"
                                            />
                                            <div className="flex gap-1">
                                              <Button
                                                size="sm"
                                                onClick={() => saveSection(toolCategory.id, index, sectionIndex)}
                                                className="flex items-center gap-1 text-xs h-6"
                                              >
                                                <Save className="h-3 w-3" />
                                                Save
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => cancelEditingSection(toolCategory.id, index, sectionIndex)}
                                                className="flex items-center gap-1 text-xs h-6"
                                              >
                                                <X className="h-3 w-3" />
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div>
                                            <div className="flex justify-between items-start mb-1">
                                              <h4 className="font-medium text-xs">{section.title}</h4>
                                              {isAdminMode && (
                                                <div className="flex gap-1">
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => startEditingSection(toolCategory.id, index, sectionIndex, section)}
                                                    className="p-0.5 h-5 w-5"
                                                  >
                                                    <Edit className="h-3 w-3" />
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => deleteSection(toolCategory.id, index, sectionIndex)}
                                                    className="p-0.5 h-5 w-5 text-destructive hover:text-destructive"
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-1">{section.content}</p>
                                            {section.url && (
                                              <Button
                                                variant="link"
                                                size="sm"
                                                className="h-auto p-0 text-xs"
                                                asChild
                                              >
                                                <a href={section.url} target="_blank" rel="noopener noreferrer">
                                                  View Resource →
                                                </a>
                                              </Button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Flashcards Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">🃏 Study Flashcards</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcardSets.map((category, index) => (
              <Card key={index} className="hover:shadow-card transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.sets.map((set, setIndex) => (
                      <div key={setIndex} className="flex items-center justify-between p-3 bg-accent/30 rounded-md">
                        <div>
                          <p className="font-medium text-sm">{set.name}</p>
                          <p className="text-xs text-muted-foreground">{set.cards} cards</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setStudyingFlashcard({
                            setName: set.name,
                            category: category.category,
                            totalCards: set.cards
                          })}
                        >
                          Study
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Training Modules */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">🎓 Training Modules</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {editableTrainingModules.map((moduleGroup, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{moduleGroup.title}</CardTitle>
                    {isAdminMode && (
                      <Button
                        onClick={() => addNewTrainingModule(moduleGroup.title)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Module
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {moduleGroup.modules.map((module, moduleIndex) => (
                      <div key={moduleIndex} className="flex items-center justify-between p-3 border border-border/50 rounded-md">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{module.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{module.duration}</span>
                            <Badge 
                              variant={module.status === 'available' ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {module.status === 'available' ? 'Available' : 'Coming Soon'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isAdminMode && (
                            <Button
                              onClick={() => deleteTrainingModule(moduleGroup.title, moduleIndex)}
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant={module.status === 'available' ? 'default' : 'outline'}
                            disabled={module.status !== 'available'}
                            onClick={() => {
                              if (module.status === 'available') {
                                setStudyingModule({
                                  moduleName: module.name,
                                  duration: module.duration,
                                  category: moduleGroup.title
                                });
                              }
                            }}
                          >
                            Start
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Reference */}
        <Card>
          <CardHeader>
            <CardTitle>📚 Quick Reference Guide</CardTitle>
            <CardDescription>Essential information at your fingertips</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="comparison">
                <AccordionTrigger>Product Comparison Cheat Sheet</AccordionTrigger>
                <AccordionContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Product Type</th>
                          <th className="text-left p-2">Best For</th>
                          <th className="text-left p-2">Key Benefit</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-2">Investment-Linked</td>
                          <td className="p-2">Growth seekers</td>
                          <td className="p-2">Flexibility & upside potential</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Endowment</td>
                          <td className="p-2">Conservative savers</td>
                          <td className="p-2">Guaranteed returns</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-2">Whole Life</td>
                          <td className="p-2">Estate planning</td>
                          <td className="p-2">Lifelong protection</td>
                        </tr>
                        <tr>
                          <td className="p-2">Term</td>
                          <td className="p-2">Young families</td>
                          <td className="p-2">Maximum coverage, low cost</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="contact-info">
                <AccordionTrigger>Emergency Contact Information</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p><strong>Technical Support:</strong> 1800-248-8000</p>
                    <p><strong>Underwriting Hotline:</strong> 6248-8888</p>
                    <p><strong>Claims Department:</strong> 6248-8777</p>
                    <p><strong>After Hours Emergency:</strong> 9000-1234</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Flashcard Study Interface */}
      {studyingFlashcard && (
        <FlashcardStudyInterface
          setName={studyingFlashcard.setName}
          category={studyingFlashcard.category}
          totalCards={studyingFlashcard.totalCards}
          onClose={() => setStudyingFlashcard(null)}
        />
      )}

      {/* Training Module Interface */}
      {studyingModule && (
        <TrainingModuleInterface
          moduleName={studyingModule.moduleName}
          duration={studyingModule.duration}
          category={studyingModule.category}
          onClose={() => setStudyingModule(null)}
        />
      )}
    </div>
  );
}