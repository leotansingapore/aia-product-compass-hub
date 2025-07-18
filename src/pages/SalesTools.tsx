
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
import { EditableLinks } from "@/components/EditableLinks";
import type { UsefulLink } from "@/hooks/useProducts";

interface ToolSection {
  title: string;
  content: string;
  url?: string;
}

interface BaseTool {
  name: string;
  description: string;
}

interface LinkTool extends BaseTool {
  link: string;
}

type Tool = LinkTool;

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
  }
];

// Convert LinkTool to UsefulLink
const convertToUsefulLinks = (tools: Tool[]): UsefulLink[] => {
  return tools.map(tool => ({
    name: tool.name,
    url: tool.link,
    icon: '📄'
  }));
};

// Convert UsefulLink back to LinkTool 
const convertToLinkTools = (links: UsefulLink[]): Tool[] => {
  return links.map(link => ({
    name: link.name,
    description: '', // We don't have description in UsefulLink, so use empty string
    link: link.url
  }));
};

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
  const [editableSalesTools, setEditableSalesTools] = useState(() => salesTools);
  
  const { isAdminMode } = useAdmin();
  const { toast } = useToast();

  const handleUpdateLinks = async (toolCategoryId: string, newLinks: UsefulLink[]) => {
    try {
      console.log('🔧 Updating sales tool links for category:', toolCategoryId, newLinks);
      
      const updatedTools = editableSalesTools.map(toolCategory => {
        if (toolCategory.id === toolCategoryId) {
          return { 
            ...toolCategory, 
            tools: convertToLinkTools(newLinks)
          };
        }
        return toolCategory;
      });
      
      setEditableSalesTools(updatedTools);
      
      toast({
        title: "Success",
        description: "Sales tool links updated successfully",
      });
      
    } catch (error) {
      console.error('❌ Failed to update sales tool links:', error);
      toast({
        title: "Error",
        description: "Failed to update links. Please try again.",
        variant: "destructive",
      });
    }
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
                        onClick={() => {}}
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
                  {(toolCategory.id === 'generic-objections' || toolCategory.id === 'tactical-objections') ? (
                    <div className="mb-6">
                      <EditableLinks
                        links={convertToUsefulLinks(toolCategory.tools)}
                        onSave={(newLinks) => handleUpdateLinks(toolCategory.id, newLinks)}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {toolCategory.tools.map((tool, index) => (
                        <div key={index} className="border border-border/50 rounded-lg p-4 hover:bg-accent/20 transition-colors">
                          <h3 className="font-medium text-sm">{tool.name}</h3>
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                            <a href={(tool as LinkTool).link} target="_blank" rel="noopener noreferrer">
                              Access Tool
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
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
    </div>
  );
}
