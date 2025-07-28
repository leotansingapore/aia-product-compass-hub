import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { NavigationHeader } from "@/components/NavigationHeader";
import { ProtectedPage } from "@/components/ProtectedPage";
import { 
  Target, 
  MessageCircle, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  Users, 
  HelpCircle,
  ArrowRight,
  Quote,
  Lightbulb,
  TrendingUp
} from "lucide-react";

interface ObjectionExample {
  objection: string;
  type: string;
  response: string;
  tips: string[];
}

interface ObjectionCategory {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  examples: ObjectionExample[];
}

const ObjectionHandling = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("price");

  const objectionCategories: ObjectionCategory[] = [
    {
      id: "price",
      title: "Price Objections",
      description: "When clients feel the premium is too high",
      icon: DollarSign,
      color: "text-red-500",
      examples: [
        {
          objection: "It's too expensive",
          type: "Price",
          response: "I understand cost is an important consideration. Let's look at the value this provides compared to the potential financial impact on your family if something happens. When you break it down to just $X per day, that's less than a cup of coffee, but provides $X in protection.",
          tips: [
            "Break down annual premium to daily cost",
            "Compare to other discretionary spending",
            "Focus on value, not just cost",
            "Show cost of NOT having insurance"
          ]
        },
        {
          objection: "I can't afford it right now",
          type: "Price",
          response: "I appreciate your honesty about your budget. Can you afford NOT to have this protection? Let's explore options - we have different premium payment frequencies, and I can show you how starting with basic coverage now is better than waiting.",
          tips: [
            "Acknowledge their financial concerns",
            "Explore payment options",
            "Offer basic coverage as starting point",
            "Emphasize urgency of protection"
          ]
        }
      ]
    },
    {
      id: "trust",
      title: "Trust & Authority Objections",
      description: "When clients need time to think or consult others",
      icon: Clock,
      color: "text-blue-500",
      examples: [
        {
          objection: "I need to think about it",
          type: "Trust",
          response: "That's perfectly reasonable - this is an important decision. What specifically would you like to think about? Is it the coverage amount, the premium, or how it fits with your other plans? Let me address those concerns now while we're together.",
          tips: [
            "Ask what specifically they need to think about",
            "Address concerns immediately",
            "Create urgency without pressure",
            "Offer to follow up with specific timeline"
          ]
        },
        {
          objection: "I need to discuss with my spouse",
          type: "Authority",
          response: "Absolutely, this should be a joint decision. Would it be helpful if I could meet with both of you? Or I can provide you with a summary of our discussion and the proposal to share with them. What questions do you think they might have?",
          tips: [
            "Respect the decision-making process",
            "Offer to meet with decision makers",
            "Provide materials to share",
            "Anticipate spouse's concerns"
          ]
        }
      ]
    },
    {
      id: "need",
      title: "Need Objections",
      description: "When clients don't see the necessity",
      icon: HelpCircle,
      color: "text-orange-500",
      examples: [
        {
          objection: "I don't need insurance",
          type: "Need",
          response: "I hear you saying you don't feel you need insurance. Help me understand - do you have anyone who depends on your income? What would happen to your family's lifestyle if your income stopped tomorrow? Insurance isn't for you - it's for the people you care about.",
          tips: [
            "Focus on dependents, not the client",
            "Paint picture of financial impact",
            "Use emotional connection",
            "Ask about responsibilities"
          ]
        },
        {
          objection: "I'm young and healthy",
          type: "Need",
          response: "Being young and healthy is exactly why now is the perfect time! Premiums are lowest when you're healthy, and coverage is easier to obtain. Plus, accidents can happen to anyone at any age. The question isn't if something will happen, but when.",
          tips: [
            "Emphasize advantages of being young",
            "Address unpredictability of life",
            "Focus on accidents, not just illness",
            "Lock in insurability while healthy"
          ]
        }
      ]
    },
    {
      id: "competition",
      title: "Competition Objections",
      description: "When clients compare with other providers",
      icon: TrendingUp,
      color: "text-green-500",
      examples: [
        {
          objection: "Another company offered me a better deal",
          type: "Competition",
          response: "That's great that you're shopping around - it shows you're taking this seriously. Let's make sure we're comparing apples to apples. Often, lower premiums mean different coverage levels or terms. What specific benefits were you offered, and what's most important to you?",
          tips: [
            "Praise them for shopping around",
            "Ensure fair comparison",
            "Focus on value differences",
            "Highlight unique benefits"
          ]
        }
      ]
    }
  ];

  const hearMethod = {
    steps: [
      {
        letter: "H",
        word: "HALT",
        description: "Stop talking and listen completely to their concern",
        icon: MessageCircle
      },
      {
        letter: "E", 
        word: "EMPATHIZE",
        description: "Show understanding and acknowledge their feelings",
        icon: Target
      },
      {
        letter: "A",
        word: "ASK",
        description: "Clarify the real concern with follow-up questions",
        icon: HelpCircle
      },
      {
        letter: "R",
        word: "RESPOND",
        description: "Address the specific issue with a tailored solution",
        icon: CheckCircle
      }
    ]
  };

  const generalTips = [
    "Welcome objections - they show interest and engagement",
    "Never argue or become defensive with a client",
    "Use the 'Feel, Felt, Found' technique for empathy",
    "Ask questions to understand the root concern",
    "Provide specific examples and stories",
    "Address objections before they arise when possible",
    "Always confirm understanding before moving forward",
    "Practice your responses until they feel natural"
  ];

  const selectedCategoryData = objectionCategories.find(cat => cat.id === selectedCategory);

  return (
    <ProtectedPage pageId="objection-handling">
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Objection Handling - AIA Product Compass Hub</title>
          <meta name="description" content="Master objection handling techniques with proven responses to common client concerns. Learn the HEAR method and build confidence in sales conversations." />
        </Helmet>
        
        <NavigationHeader 
          title="Objection Handling Mastery"
          subtitle="Turn client concerns into opportunities with proven techniques"
          showBackButton
          onBack={() => navigate('/')}
        />

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Introduction Section */}
          <Card className="border-border/50 shadow-elegant">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Welcome Client Objections</CardTitle>
                  <CardDescription>
                    Objections are not rejections - they're signs of interest and opportunities to help
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>Remember:</strong> Every objection is a chance to better understand your client's needs and provide tailored solutions. The goal is not to "overcome" objections but to address genuine concerns.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* HEAR Method Section */}
          <Card className="border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Quote className="h-5 w-5 text-primary" />
                The HEAR Method
              </CardTitle>
              <CardDescription>
                A proven 4-step approach to handle any objection professionally
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {hearMethod.steps.map((step, index) => (
                  <div key={step.letter} className="relative">
                    <Card className="h-full bg-gradient-to-br from-background to-muted/20">
                      <CardContent className="p-6 text-center">
                        <div className="mb-4">
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                            <span className="text-primary-foreground font-bold text-lg">{step.letter}</span>
                          </div>
                          <step.icon className="h-6 w-6 text-primary mx-auto" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{step.word}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </CardContent>
                    </Card>
                    {index < hearMethod.steps.length - 1 && (
                      <ArrowRight className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-primary h-5 w-5" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Objection Categories */}
          <Card className="border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Common Objection Types & Responses</CardTitle>
              <CardDescription>
                Learn proven responses to the most frequent client concerns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
                  {objectionCategories.map((category) => (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="flex items-center gap-2"
                    >
                      <category.icon className={`h-4 w-4 ${category.color}`} />
                      <span className="hidden sm:inline">{category.title}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {objectionCategories.map((category) => (
                  <TabsContent key={category.id} value={category.id} className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                      <div>
                        <h3 className="text-xl font-semibold">{category.title}</h3>
                        <p className="text-muted-foreground">{category.description}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {category.examples.map((example, index) => (
                        <Card key={index} className="bg-muted/30">
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-orange-500 mt-1 flex-shrink-0" />
                                <div>
                                  <Badge variant="outline" className="mb-2">{example.type} Objection</Badge>
                                  <blockquote className="text-lg font-medium border-l-4 border-orange-500 pl-4">
                                    "{example.objection}"
                                  </blockquote>
                                </div>
                              </div>

                              <Separator />

                              <div className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" />
                                <div>
                                  <h4 className="font-semibold mb-2">Suggested Response:</h4>
                                  <p className="text-muted-foreground italic">"{example.response}"</p>
                                </div>
                              </div>

                              <div className="bg-background rounded-lg p-4">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <Lightbulb className="h-4 w-4 text-amber-500" />
                                  Key Tips:
                                </h4>
                                <ul className="space-y-1">
                                  {example.tips.map((tip, tipIndex) => (
                                    <li key={tipIndex} className="flex items-start gap-2 text-sm">
                                      <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* General Tips Section */}
          <Card className="border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                General Objection Handling Tips
              </CardTitle>
              <CardDescription>
                Universal principles that apply to all objection situations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generalTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="border-border/50 shadow-elegant">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-4">Ready to Practice?</h3>
              <p className="text-muted-foreground mb-6">
                The best way to master objection handling is through practice. Use these techniques in your next client conversation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => navigate('/search-by-profile')} variant="default">
                  Find Products by Client Profile
                </Button>
                <Button onClick={() => navigate('/cmfas-exams')} variant="outline">
                  Practice with CMFAS Scenarios
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedPage>
  );
};

export default ObjectionHandling;