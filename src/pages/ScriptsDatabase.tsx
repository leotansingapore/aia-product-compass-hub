import { useState, useMemo } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { EnhancedSearchBar } from "@/components/EnhancedSearchBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Phone, MessageSquare, HelpCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ScriptEntry {
  id: string;
  stage: string;
  category: "cold-calling" | "follow-up" | "faq";
  versions: { author: string; content: string }[];
}

const SCRIPTS_DATA: ScriptEntry[] = [
  {
    id: "cold-calling",
    stage: "Script for Cold Calling",
    category: "cold-calling",
    versions: [
      {
        author: "Script A",
        content: `First start by SMSing them: "is this XXX?"

Then, give them a call:

Hello, is this XXX?
Understand that you're currently serving NS?

XXX here from themoneybees. I'll just keep this call short, less than a minute. Basically we help young adults, including NSFs, save their money 60 times faster than the bank during their national service, and we meet many of them over their weekends.

So if you're interested to grow your savings faster, we can set a short session for you to find out more. Just to check, around where do you stay?

Okay, we will set a meeting sometime this/next weekend at (XXX mall) at 10am, and you can reply after this call to confirm the meeting, is that okay?

Alright so just one last thing, this session is just for you to learn more, so as long as you come down and learn something beneficial for you, then that's good enough!`,
      },
      {
        author: "Jamie's Script",
        content: `Text first: "Good morning/afternoon! is this xxx?"

**The CALL:**

Hi, [Name]! This is Jamie from themoneybees.
Do you have a quick moment?

**If No:** When is a better time for me to call you back? (confirm specific timing)

**If Yes:**
I'll keep this call short, less than a minute.
May I know if you are currently serving NS?

**If Yes (NS):**
That's great, because we are actually a financial education platform for NSFs and young working adults.

The reason I am calling is because we are giving away a FREE adulting guidebook to help NSFs like yourself learn more about saving, investing and other personal finance skills.

Would this be something you'd be interested in receiving?

**If Interested:** Great! Would you mind me sharing more details about this with you over WA?

**If Not Interested:** No worries, I understand. Thank you so much for your time and have a great day!

**If Not NS:** Ok, are you currently studying/working now? We are currently conducting a financial literacy campaign and just launched a FREE adulting guidebook for young working adults and students.`,
      },
    ],
  },
  {
    id: "1st-message",
    stage: "1st Message (After Call)",
    category: "follow-up",
    versions: [
      {
        author: "Script A",
        content: `Hello XXX!

XXXX here, from the @moneybeesacademy! https://www.instagram.com/moneybeesacademy

Spoke to you just now, about how we help young adults, including NSFs save and grow their money faster!

The reason why I'm doing this is that I have gone through the entire education system in Singapore and they actually didn't really teach anything much about personal finance, and hence I was pretty frustrated about this, and wrote a book.

It aims to empower and educate more youths about investing and financial literacy!

Would sometime this *saturday 10am or 2pm* work for you? And where is your nearest MRT? Will pass you the book over a short *30 min meetup* and give you a personalised financial report afterwards!`,
      },
      {
        author: "Jamie's Script",
        content: `Hello, [name]!

This is Jamie from themoneybeesacademy! (http://www.instagram.com/moneybeesacademy)

We spoke on the phone earlier about our financial literacy campaign. Our goal is to help young adults & NSFs develop a greater understanding of financial literacy, that's why we are giving away this free adulting guidebook.

We want to raise awareness and educate more youths on the power of financial literacy, as well as empower them to take charge of their (financial) lives!

---

To express our appreciation for your interest in our campaign, we would like to invite you for a *free 20 min zoom consultation* to send you the guidebook, and take you through some important financial concepts within it.

We will also do a quick financial health check for you to kickstart your journey towards your financial independence and freedom!

---

Would sometime [date] at 11am or 1pm work for you? ◡̈`,
      },
    ],
  },
  {
    id: "2nd-message",
    stage: "2nd Follow-Up Message",
    category: "follow-up",
    versions: [
      {
        author: "Script A",
        content: `Hello XXX! Just following up on my previous message. I'd love to meet with you this Saturday at either 10am or 2pm to discuss how we can help you with your financial goals. Let me know if either of those times work for you and your nearest MRT station. Looking forward to connecting with you!`,
      },
      {
        author: "Jamie's Script",
        content: `Hi xxx!

Hope you had a wonderful weekend! / Hope you are having a great week so far!

At themoneybees, we want to ensure financial education is accessible to all, so that everyone is able to achieve their financial goals, and eventually, their financial freedom.

We are dedicated to helping NSFs like yourself who are interested in taking their first steps towards learning more about the world of finance and upgrading their financial skills!

I am confident that our meeting will be enlightening and useful to you right now, not only for when you finish your NS and venture into the working world.

Are you available this/next Sat/Sun at xxam/xxpm for a quick meetup/zoom call?

If you are unavailable at my proposed date and time, let me know your preferred date and time/location, and I will schedule you in.

I look forward to connecting with you and sharing more on the power of financial literacy!

Have a great day/weekend! ◡̈`,
      },
    ],
  },
  {
    id: "3rd-message",
    stage: "3rd Follow-Up Message",
    category: "follow-up",
    versions: [
      {
        author: "Script A",
        content: `Hello XXX! I hope you're doing well. I wanted to check in and see if you had a chance to review my previous message about meeting up to discuss your financial goals. I'm still available this Saturday at either 10am or 2pm. Please let me know if either of those times work for you, and feel free to share your nearest MRT station for convenience. Looking forward to the opportunity to connect with you and provide valuable insights tailored to your financial needs.`,
      },
      {
        author: "Jamie's Script",
        content: `Hi xxx, hope you're doing well!

I understand that your current schedule may be hectic, but I am hoping that you will open up a chance/give me an opportunity to provide valuable insights on any kind of financial questions or future financial goals you may have.

It can be anything from budgeting, saving, investing, or even just organising and allocating your resources, you can be sure that I will answer all your questions.

Are you available this/next Sat/Sun at xxxam/xxxpm for a quick meetup/zoom call?

Let me know if that sounds good to you, or if you prefer a different timing/date instead.

Hope to hear from you soon, have a great day/weekend! ◡̈`,
      },
    ],
  },
  {
    id: "4th-message",
    stage: "4th Follow-Up Message",
    category: "follow-up",
    versions: [
      {
        author: "Script A",
        content: `Hi XXX, just wanted to follow up on my previous message about meeting to discuss your financial goals. I understand you're busy, but I truly believe I can offer valuable insights that could benefit you. I still have availability this Saturday at either 10am or 2pm. Let me know if either of those times work for you. Your financial well-being is important, and I'm here to help.`,
      },
      {
        author: "Jamie's Script",
        content: `Good morning/afternoon/Hi xxx!

Hope you are having a great week!

I know how busy NS life can be, so I'll be brief.

I was wondering if you have given some thought to my previous message on learning more about managing your personal finances.

I am certain that our financial literacy sharing/session and our free adulting guidebook will benefit you immensely, and want the opportunity to share more with you.

Are you available this/next Sat/Sun at xxam/xxpm for a quick meetup/zoom call?

Awaiting your response at your earliest convenience.

Have a great day/weekend! ◡̈`,
      },
    ],
  },
  {
    id: "faq-number",
    stage: "If they ask how you got their number",
    category: "faq",
    versions: [
      {
        author: "Jamie's Script",
        content: `"You did a survey with us at Pasir Ris bus interchange a few weeks ago."`,
      },
    ],
  },
  {
    id: "faq-company",
    stage: "Which company are you from?",
    category: "faq",
    versions: [
      {
        author: "Jamie's Script",
        content: `"We're from themoneybees, we're a financial education platform."`,
      },
    ],
  },
];

const categoryLabels = {
  "cold-calling": { label: "Cold Calling", icon: Phone, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  "follow-up": { label: "Follow-Up Messages", icon: MessageSquare, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  "faq": { label: "FAQ / Objections", icon: HelpCircle, color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Script copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 gap-1.5 text-xs">
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function ScriptCard({ script }: { script: ScriptEntry }) {
  const [open, setOpen] = useState(false);
  const cat = categoryLabels[script.category];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <cat.icon className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <CardTitle className="text-base">{script.stage}</CardTitle>
                  <Badge variant="secondary" className={`mt-1 text-[10px] ${cat.color}`}>
                    {cat.label}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {script.versions.length} version{script.versions.length > 1 ? "s" : ""}
                </Badge>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            {script.versions.length > 1 ? (
              <Tabs defaultValue="0">
                <TabsList className="mb-3">
                  {script.versions.map((v, i) => (
                    <TabsTrigger key={i} value={String(i)} className="text-xs">
                      {v.author}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {script.versions.map((v, i) => (
                  <TabsContent key={i} value={String(i)}>
                    <div className="flex justify-end mb-2">
                      <CopyButton text={v.content} />
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed border">
                      {v.content}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground font-medium">{script.versions[0].author}</span>
                  <CopyButton text={script.versions[0].content} />
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed border">
                  {script.versions[0].content}
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function ScriptsDatabase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const navigate = useNavigate();

  const filteredScripts = useMemo(() => {
    let result = SCRIPTS_DATA;
    if (activeCategory !== "all") {
      result = result.filter((s) => s.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.stage.toLowerCase().includes(q) ||
          s.versions.some((v) => v.content.toLowerCase().includes(q) || v.author.toLowerCase().includes(q))
      );
    }
    return result;
  }, [searchQuery, activeCategory]);

  const counts = useMemo(() => ({
    all: SCRIPTS_DATA.length,
    "cold-calling": SCRIPTS_DATA.filter((s) => s.category === "cold-calling").length,
    "follow-up": SCRIPTS_DATA.filter((s) => s.category === "follow-up").length,
    faq: SCRIPTS_DATA.filter((s) => s.category === "faq").length,
  }), []);

  return (
    <PageLayout
      title="Scripts Database - FINternship"
      description="Reference scripts for cold calling, follow-up messages, and handling common objections."
    >
      <BrandedPageHeader
        title="📝 Scripts Database"
        subtitle="Reference scripts for cold calling, follow-ups, and objection handling"
        showBackButton
        onBack={() => navigate("/")}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Scripts Database" }]}
      />

      <div className="mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-4xl">
        {/* Search */}
        <div className="mb-6">
          <EnhancedSearchBar onSearch={setSearchQuery} placeholder="Search scripts..." />
        </div>

        {/* Category filter tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="cold-calling">
              <Phone className="h-3.5 w-3.5 mr-1" /> Cold Calling ({counts["cold-calling"]})
            </TabsTrigger>
            <TabsTrigger value="follow-up">
              <MessageSquare className="h-3.5 w-3.5 mr-1" /> Follow-Ups ({counts["follow-up"]})
            </TabsTrigger>
            <TabsTrigger value="faq">
              <HelpCircle className="h-3.5 w-3.5 mr-1" /> FAQ ({counts.faq})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Scripts list */}
        <div className="space-y-3">
          {filteredScripts.length > 0 ? (
            filteredScripts.map((script) => <ScriptCard key={script.id} script={script} />)
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No scripts found</p>
              <p className="text-sm">Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
