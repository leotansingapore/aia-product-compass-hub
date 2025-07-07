import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const salesTools = [
  {
    id: 'objection-handling',
    title: 'Objection Handling Scripts',
    description: 'Ready-to-use responses for common client objections',
    tools: [
      {
        name: 'Price Objections',
        description: 'When clients say products are too expensive',
        scripts: [
          '"I understand cost is a concern. Let me show you the value you\'re getting..."',
          '"What\'s the cost of not having this protection when you need it most?"',
          '"Let\'s break this down to a daily amount - it\'s less than a coffee..."'
        ]
      },
      {
        name: 'Investment Risk Concerns',
        description: 'Addressing fears about investment-linked products',
        scripts: [
          '"That\'s exactly why we have multiple fund options, including conservative ones..."',
          '"The real risk is inflation eroding your savings in low-yield accounts..."',
          '"You can start conservative and adjust as you become more comfortable..."'
        ]
      },
      {
        name: 'Timing Objections',
        description: 'When clients want to postpone decisions',
        scripts: [
          '"I understand you want to think about it. What specific concerns can I address?"',
          '"The best time to plant a tree was 20 years ago. The second best time is now."',
          '"Waiting doesn\'t make insurance cheaper or your need for protection smaller..."'
        ]
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
        link: '#'
      },
      {
        name: 'Comparison Charts',
        description: 'Side-by-side product comparisons',
        link: '#'
      },
      {
        name: 'Benefit Illustrations',
        description: 'Customizable benefit projections',
        link: '#'
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
      { name: 'Medical Insurance Overview', duration: '35 min', status: 'coming-soon' }
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
  const [activeTab, setActiveTab] = useState('objection-handling');

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
          {salesTools.map((toolCategory) => (
            <div key={toolCategory.id} className={activeTab === toolCategory.id ? 'block' : 'hidden'}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{toolCategory.title}</CardTitle>
                  <CardDescription>{toolCategory.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {toolCategory.tools.map((tool, index) => (
                      <Card key={index} className="border border-border/50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{tool.name}</CardTitle>
                          <CardDescription>{tool.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {tool.scripts && (
                            <div className="space-y-2">
                              {tool.scripts.map((script, scriptIndex) => (
                                <div key={scriptIndex} className="bg-accent/30 p-3 rounded-md">
                                  <p className="text-sm">{script}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {tool.questions && (
                            <div className="space-y-2">
                              {tool.questions.map((question, questionIndex) => (
                                <div key={questionIndex} className="flex items-start">
                                  <span className="text-primary mr-2 mt-1">Q:</span>
                                  <p className="text-sm text-muted-foreground">{question}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {tool.techniques && (
                            <div className="space-y-2">
                              {tool.techniques.map((technique, techIndex) => (
                                <div key={techIndex} className="bg-success/10 p-3 rounded-md">
                                  <p className="text-sm">{technique}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          {tool.link && (
                            <Button variant="outline" className="mt-3" asChild>
                              <a href={tool.link} target="_blank" rel="noopener noreferrer">
                                Access Tool
                              </a>
                            </Button>
                          )}
                        </CardContent>
                      </Card>
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
                        <Button size="sm" variant="outline">Study</Button>
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
            {trainingModules.map((moduleGroup, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{moduleGroup.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {moduleGroup.modules.map((module, moduleIndex) => (
                      <div key={moduleIndex} className="flex items-center justify-between p-3 border border-border/50 rounded-md">
                        <div>
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
                        <Button 
                          size="sm" 
                          variant={module.status === 'available' ? 'default' : 'outline'}
                          disabled={module.status !== 'available'}
                        >
                          {module.status === 'available' ? 'Start' : 'Soon'}
                        </Button>
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
    </div>
  );
}