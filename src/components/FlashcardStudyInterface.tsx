import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react";

interface FlashcardData {
  question: string;
  answer: string;
}

interface FlashcardStudyInterfaceProps {
  setName: string;
  category: string;
  totalCards: number;
  onClose: () => void;
}

// Sample flashcard data - in a real app, this would come from a database
const flashcardData: { [key: string]: FlashcardData[] } = {
  "Pro Achiever Key Features": [
    { question: "What is the minimum premium for Pro Achiever?", answer: "SGD 100 per month or SGD 1,200 annually" },
    { question: "What investment funds are available?", answer: "Over 40 funds including equity, bond, and balanced funds" },
    { question: "Can premiums be increased?", answer: "Yes, regular and ad-hoc top-ups are allowed" },
    { question: "What is the surrender charge period?", answer: "First 5 years with decreasing charges" },
    { question: "Is there partial withdrawal?", answer: "Yes, after policy year 1 with minimum balance requirements" }
  ],
  "Investment Risks & Benefits": [
    { question: "What is market risk?", answer: "The risk that investment values may fluctuate due to market conditions" },
    { question: "How is currency risk managed?", answer: "Currency hedged funds are available to minimize exchange rate exposure" },
    { question: "What are the potential benefits?", answer: "Capital growth, regular income, and tax efficiency" },
    { question: "What is dollar cost averaging?", answer: "Regular investing that helps smooth out market volatility over time" }
  ],
  "Fund Options Overview": [
    { question: "What are equity funds?", answer: "Funds that invest primarily in stocks for long-term growth" },
    { question: "What are bond funds?", answer: "Funds that invest in fixed-income securities for stable returns" },
    { question: "What are balanced funds?", answer: "Funds that combine stocks and bonds for moderate risk/return" },
    { question: "Can funds be switched?", answer: "Yes, fund switching is allowed with certain restrictions" }
  ],
  "Smart Wealth Builder Benefits": [
    { question: "What is the guaranteed return?", answer: "Guaranteed cash benefits at specified policy years" },
    { question: "Are there bonuses?", answer: "Yes, non-guaranteed annual and terminal bonuses may be declared" },
    { question: "What is the premium payment term?", answer: "Flexible options from 5 to 20 years" },
    { question: "Is there death benefit?", answer: "Yes, 100% of premiums paid or account value, whichever is higher" }
  ],
  "Guaranteed vs Non-Guaranteed": [
    { question: "What are guaranteed benefits?", answer: "Benefits that are contractually promised and will definitely be paid" },
    { question: "What are non-guaranteed benefits?", answer: "Bonuses and returns that depend on company performance and market conditions" },
    { question: "How are bonuses determined?", answer: "Based on investment performance, mortality experience, and expenses" }
  ],
  "Policy Loans & Withdrawals": [
    { question: "When can policy loans be taken?", answer: "After the policy has sufficient cash value, typically after year 2" },
    { question: "What is the loan interest rate?", answer: "Competitive rates, typically around 5-6% per annum" },
    { question: "Are partial withdrawals allowed?", answer: "Yes, subject to minimum policy value requirements" }
  ],
  "Term vs Whole Life": [
    { question: "What is term insurance?", answer: "Temporary coverage for a specific period with no cash value" },
    { question: "What is whole life insurance?", answer: "Permanent coverage with guaranteed cash value accumulation" },
    { question: "Which costs more?", answer: "Whole life has higher premiums but builds cash value" },
    { question: "Which is better for young families?", answer: "Term insurance provides maximum coverage at lowest cost" }
  ],
  "Conversion Options": [
    { question: "Can term policies be converted?", answer: "Yes, most term policies have conversion options" },
    { question: "When must conversion occur?", answer: "Typically before age 65 or policy expiry, whichever is earlier" },
    { question: "Is medical underwriting required?", answer: "No, conversion is usually guaranteed without medical exams" }
  ],
  "Underwriting Guidelines": [
    { question: "What medical information is required?", answer: "Health questionnaire, medical exams may be required for large amounts" },
    { question: "What are the age limits?", answer: "Typically 18-70 for new applications, varies by product" },
    { question: "How long does underwriting take?", answer: "Standard cases: 2-4 weeks, complex cases may take longer" }
  ]
};

export function FlashcardStudyInterface({ setName, category, totalCards, onClose }: FlashcardStudyInterfaceProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());
  
  const cards = flashcardData[setName] || [];
  const currentCard = cards[currentCardIndex];
  const progress = ((studiedCards.size) / cards.length) * 100;

  const nextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const markAsStudied = () => {
    setStudiedCards(prev => new Set(prev).add(currentCardIndex));
    setShowAnswer(true);
  };

  const resetProgress = () => {
    setStudiedCards(new Set());
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  if (!currentCard) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
        <Card className="w-full max-w-md mx-4 my-8">
          <CardHeader>
            <CardTitle>No Flashcards Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Flashcards for "{setName}" are not yet available.
            </p>
            <Button onClick={onClose} className="w-full">Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto p-4">
      <Card className="w-full max-w-2xl mx-4 my-8">
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{setName}</CardTitle>
              <p className="text-sm text-muted-foreground">{category}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress: {studiedCards.size}/{cards.length}</span>
              <span>Card {currentCardIndex + 1} of {cards.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="min-h-[300px] flex flex-col justify-center">
            <div className="text-center space-y-6">
              <div className="p-6 bg-accent/20 rounded-lg">
                <h3 className="font-semibold mb-4 text-lg">Question</h3>
                <p className="text-lg leading-relaxed">{currentCard.question}</p>
              </div>

              {showAnswer && (
                <div className="p-6 bg-primary/10 rounded-lg border-2 border-primary/20">
                  <h3 className="font-semibold mb-4 text-lg text-primary">Answer</h3>
                  <p className="text-lg leading-relaxed">{currentCard.answer}</p>
                </div>
              )}

              {!showAnswer ? (
                <Button onClick={markAsStudied} size="lg" className="px-8">
                  Show Answer
                </Button>
              ) : (
                <div className="flex gap-2 justify-center">
                  <Badge variant="secondary" className="px-3 py-1">
                    ✓ Studied
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <div className="border-t p-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevCard}
              disabled={currentCardIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetProgress}
                size="sm"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={nextCard}
              disabled={currentCardIndex === cards.length - 1}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {studiedCards.size === cards.length && (
          <div className="border-t bg-success/10 p-4 text-center">
            <p className="text-success font-semibold">🎉 Congratulations! You've studied all cards in this set!</p>
          </div>
        )}
      </Card>
    </div>
  );
}