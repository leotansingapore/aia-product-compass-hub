import { useState, useMemo } from "react";
import { ScriptsChatWidget } from "@/components/scripts/ScriptsChatWidget";
import { ScriptEditorDialog } from "@/components/scripts/ScriptEditorDialog";
import { KnowledgeManagement } from "@/components/scripts/KnowledgeManagement";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { EnhancedSearchBar } from "@/components/EnhancedSearchBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Phone, MessageSquare, HelpCircle, Copy, Check, UserPlus, CalendarCheck, Lightbulb, Megaphone, Users, Plus, Pencil, Trash2, Loader2, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useScripts, useScriptsMutations } from "@/hooks/useScripts";
import type { ScriptEntry, ScriptVersion } from "@/hooks/useScripts";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type CategoryKey = "cold-calling" | "follow-up" | "ad-campaign" | "referral" | "confirmation" | "faq" | "tips" | "post-meeting";

const categoryLabels: Record<CategoryKey, { label: string; icon: typeof Phone; color: string }> = {
  "cold-calling": { label: "Cold Calling", icon: Phone, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  "follow-up": { label: "Follow-Up Messages", icon: MessageSquare, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  "ad-campaign": { label: "Ad Campaign / Lead Gen", icon: Megaphone, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  "referral": { label: "Referral Scripts", icon: UserPlus, color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" },
  "confirmation": { label: "Appointment Confirmation", icon: CalendarCheck, color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300" },
  "post-meeting": { label: "Post-Meeting", icon: Users, color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
  "faq": { label: "FAQ / Objections", icon: HelpCircle, color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  "tips": { label: "Tips & Best Practices", icon: Lightbulb, color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
};

const audienceLabels: Record<string, string> = {
  general: "General",
  nsf: "NSF / NS",
  "working-adult": "Working Adults",
  parent: "Parents",
  "pre-retiree": "Pre-Retirees (50-65)",
  hnw: "High Net Worth",
  referral: "Referrals",
  "cold-lead": "Cold Leads",
};

// ===== FALLBACK HARDCODED SCRIPTS (used when DB is empty) =====
const FALLBACK_SCRIPTS: ScriptEntry[] = [
  {
    id: "cold-calling-original",
    stage: "Cold Calling — Original Script",
    category: "cold-calling",
    target_audience: "nsf",
    versions: [
      { author: "Script A", content: "First start by SMSing them: \"is this XXX?\"\n\nThen, give them a call:\n\nHello, is this XXX?\nUnderstand that you're currently serving NS?\n\nXXX here from themoneybees. I'll just keep this call short, less than a minute. Basically we help young adults, including NSFs, save their money 60 times faster than the bank during their national service, and we meet many of them over their weekends.\n\nSo if you're interested to grow your savings faster, we can set a short session for you to find out more. Just to check, around where do you stay?\n\nOkay, we will set a meeting sometime this/next weekend at (XXX mall) at 10am, and you can reply after this call to confirm the meeting, is that okay?\n\nAlright so just one last thing, this session is just for you to learn more, so as long as you come down and learn something beneficial for you, then that's good enough!" },
      { author: "Jamie's Script", content: "Text first: \"Good morning/afternoon! is this xxx?\"\n\n**The CALL:**\n\nHi, [Name]! This is Jamie from themoneybees.\nDo you have a quick moment?\n\n**If No:** When is a better time for me to call you back?\n\n**If Yes:**\nI'll keep this call short, less than a minute.\nMay I know if you are currently serving NS?\n\n**If Yes (NS):**\nWe are giving away a FREE adulting guidebook to help NSFs learn about saving, investing and other personal finance skills.\nWould this be something you'd be interested in receiving?\n\n**If Interested:** Great! Would you mind me sharing more details about this with you over WA?" },
    ],
    sort_order: 1,
  },
  {
    id: "cold-calling-cpf-retiree",
    stage: "Cold Calling — CPF Retirement Changes",
    category: "cold-calling",
    target_audience: "pre-retiree",
    versions: [
      { author: "CPF Pre-Retiree Script", content: "## Greetings\n\nHi good evening, is this xxx? I am XXX calling on behalf of xxx.\n\nWe are reaching out to you because we understand that you are over 55 this year am I right?\n\n## Purpose\n\nANW, The PURPOSE of this call, is to share with you 2 important changes mentioned in Budget 2024 last year that affect your CPF Retirement Account after you turn 55. This impacts your retirement and legacy that many people do not know.\n\nDo you have a min? Let me give you a QUICK one\n\nThe first change that REALLY affect most Singaporean is that SA account will be closed for all age 55 and above which has already implemented.\n\nA lot of Singaporean used to collect the 4% interest from SA yearly, However, SA will be shut down and all of your CPF savings are forced to earn 2.5% in the OA which is even lower than the inflation rate.\n\nSECONDLY based on Budget 2024, alot of Singaporeans don't realise that interest generated in CPF Life will not be part of their legacy, in fact this interest is more than $150,000 for the majority that hit FRS. This amount will be returned to CPF pool instead of your loved ones in an event of legacy.\n\n## Leading to Closing\n\nFrom these two changes, those who are most affected are people Working for more than 20-30 Years as they would have hit the FRS of $205,800\n\nSir / Mdm, can I check if you fall in this majority group? Because 8 out of 10 Singaporeans hit FRS before age 55.\n\n## If Yes\n\nSir / Mdm, many at your age group have benefitted from meeting our specialist, can I arrange an appointment for you. Basically, He will be going through 3 important items that will affect your CPF Retirement Account.\n\nIt will only take 20 min of your time, at least you will be able to make a more informed decision.\n\nWould you prefer to meet during weekday or weekend?" },
    ],
    sort_order: 2,
  },
  {
    id: "cold-calling-fb-cpf-retiree",
    stage: "Cold Calling — Facebook Ad Opt-In (CPF eBook)",
    category: "cold-calling",
    target_audience: "pre-retiree",
    versions: [
      { author: "Retiresmart Script", content: "Hello, is this [Lead's Name]?\n\nHi [Lead's Name], I'm Xenia/Angeli, calling from Retiresmart, I'll just keep this call short.\n\nThis is just to confirm that we've received your interest to get a free copy of our CPF & retirement planning guides recently and we'll be passing you a copy of them later on!\n\nCan my retirement specialist give you a quick 5min call later on today to pass you some of the materials and also to explain the recent CPF life changes?\n\n## Qualifying Question\n\nAre you still looking for more information on retirement planning?\n\n**If Yes:**\nThat's great! Let's go into more details.\n\n**If No:**\nI see, no worries. Just to clarify, are you above 55?\n\nRegardless of age, how has your retirement planning been going so far?\n\n## Building Rapport\n\nMany of our clients in a similar situation have found our resources very useful in navigating their retirement planning. Would you be keen to hear more about how we can help?\n\n## Introducing Common Concerns\n\nMost of the people we speak to fall into one of these two groups:\n\n**Group 1:** Those concerned about the SA account closure for those aged 55 and above, looking for ways to grow their savings beyond the 2.5% p.a. in the OA.\n\n**Group 2:** Those considering the upcoming increase in the ERS to 4X of the BRS, wanting to know if topping up is worthwhile or exploring alternative options.\n\nDo either of these apply to you?\n\n## Engaging Based on Their Response\n\n(Engage in conversation based on their specific concerns.)\n\n## For Leads Within 2 Months\n\nThat's great, (Lead)! As a thank-you for opting into our resources, you're entitled to a complimentary 30-minute Zoom session with one of our retirement specialists.\n\nThey'll assess your current retirement readiness and explore ways to optimise your CPF and savings for a better retirement. Would that be helpful for you?\n\n**If they say yes:**\n\nSo after this call, I'll just send over the resource guide, and get my retirement specialist to drop you a call to schedule the session. Would that be okay?\n\nIs [time] a good time for you later for a quick call?" },
    ],
    sort_order: 3,
  },
  {
    id: "faq-company",
    stage: "Which company are you from?",
    category: "faq",
    target_audience: "general",
    versions: [
      { author: "Jamie's Script", content: "\"We're from themoneybees, we're a financial education platform.\"" },
      { author: "Alternative", content: "Never say AIA, or whatever insurance company. \"Actually I just started this job a while back, I'm just helping my friend, not sure which company he's from actually.\"" },
    ],
    sort_order: 20,
  },
  {
    id: "tips-calling",
    stage: "Calling Tips & Best Practices",
    category: "tips",
    target_audience: "general",
    versions: [
      { author: "Team Guide", content: "**Key emphasis:** Giving away FREE adulting book + share more details on WhatsApp.\n\n**Call duration:** Good to call 1-2hrs a day. Usually about 40-50 dials an hour.\n\n**After getting \"Yes to WA\":** Follow up to try and set appointment using the message templates." },
    ],
    sort_order: 30,
  },
  {
    id: "follow-up-fb-cpf-post-call",
    stage: "Post-Call Text — Facebook Ad CPF Lead",
    category: "follow-up",
    target_audience: "pre-retiree",
    versions: [
      { author: "Retiresmart Script", content: "## Message 1 — Send right after the call\n\nHi (Lead Name), this is Xenia here from Retiresmart\n\nPleasure speaking to you earlier\n\nAs mentioned, I'll be sending over the resource guide on retirement planning:\n\nHope you find the information to be useful.\n\n[insert guidebook]\n\n## Message 2 — Send right after Message 1\n\nI'll also get our retirement specialist to drop you a call at (date/time) to schedule for your complimentary zoom session :)\n\nWishing you a pleasant day/evening/weekend/week ahead!" },
    ],
    sort_order: 4,
  },
  {
    id: "confirmation-fb-cpf-meeting",
    stage: "Meeting Confirmation Text — Facebook Ad CPF Lead",
    category: "confirmation",
    target_audience: "pre-retiree",
    versions: [
      { author: "Golden Year Partners Script", content: "Hello\n\nCalled you earlier, and I've scheduled our meeting to be on:\n\n*Date/Time:*\n\n*Location:*\n\n*Duration:*\n\nJust a brief overview of what we can go through:\n\n1) Ways to increase passive income during retirement\n\n2) Ways to reduce unnecessary expenses during retirement\n\n3) How to potentially optimise your CPF and existing resources\n\n*Which of these 1), 2), 3)* are your retirement concerns?\n\nFor more info: http://consult.goldenyearpartners.com/\n\nWorst case is that you get more info and a yakun voucher, and the best case is that we can improve your current situation!\n\nI've reserved the slot on my calendar, do kindly reply this message \"ok\" to acknowledge\n\nLooking forward to our chat and God Bless! 😊" },
    ],
    sort_order: 5,
  },
];

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

function ScriptCard({ script, isAdmin, onEdit, onDelete }: { script: ScriptEntry; isAdmin: boolean; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const cat = categoryLabels[script.category as CategoryKey] || categoryLabels["faq"];

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <cat.icon className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">{script.stage}</CardTitle>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <Badge variant="secondary" className={`text-[10px] ${cat.color}`}>
                      {cat.label}
                    </Badge>
                    {script.target_audience && script.target_audience !== "general" && (
                      <Badge variant="outline" className="text-[10px]">
                        {audienceLabels[script.target_audience] || script.target_audience}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {isAdmin && (
                  <>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Edit script">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete script">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
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
                <TabsList className="mb-3 flex-wrap h-auto gap-1">
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
                  <span className="text-xs text-muted-foreground font-medium">{script.versions[0]?.author}</span>
                  <CopyButton text={script.versions[0]?.content || ""} />
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap leading-relaxed border">
                  {script.versions[0]?.content}
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
  const [activeAudience, setActiveAudience] = useState<string>("all");
  const navigate = useNavigate();
  
  const { scripts: dbScripts, loading, refetch } = useScripts();
  const { createScript, updateScript, deleteScript, isAdmin } = useScriptsMutations();
  
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<ScriptEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScriptEntry | null>(null);

  // Use DB scripts if available, otherwise fallback
  const scriptsData = dbScripts.length > 0 ? dbScripts : FALLBACK_SCRIPTS;

  const filteredScripts = useMemo(() => {
    let result = scriptsData;
    if (activeCategory !== "all") {
      result = result.filter((s) => s.category === activeCategory);
    }
    if (activeAudience !== "all") {
      result = result.filter((s) => s.target_audience === activeAudience);
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
  }, [searchQuery, activeCategory, activeAudience, scriptsData]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: scriptsData.length };
    Object.keys(categoryLabels).forEach((key) => {
      c[key] = scriptsData.filter((s) => s.category === key).length;
    });
    return c;
  }, [scriptsData]);

  const audienceCounts = useMemo(() => {
    const c: Record<string, number> = { all: scriptsData.length };
    Object.keys(audienceLabels).forEach((key) => {
      c[key] = scriptsData.filter((s) => s.target_audience === key).length;
    });
    return c;
  }, [scriptsData]);

  const activeCategoriesWithData = useMemo(() => 
    (Object.keys(categoryLabels) as CategoryKey[]).filter(key => counts[key] > 0),
    [counts]
  );

  const handleSave = async (data: { stage: string; category: string; target_audience: string; versions: ScriptVersion[]; sort_order: number }) => {
    if (editingScript) {
      await updateScript(editingScript.id, data);
    } else {
      await createScript(data);
    }
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteScript(deleteTarget.id);
    setDeleteTarget(null);
    refetch();
  };

  return (
    <PageLayout
      title="Scripts Database - FINternship"
      description="Reference scripts for cold calling, follow-up messages, referrals, appointment confirmations, and handling common objections."
    >
      <BrandedPageHeader
        title="📝 Scripts Database"
        subtitle="Reference scripts for cold calling, follow-ups, referrals, confirmations, and objection handling"
        showBackButton
        onBack={() => navigate("/")}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Scripts Database" }]}
      />

      <div className="mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-4xl">
        {/* Search + Add button */}
        <div className="mb-6 flex gap-3 items-start">
          <div className="flex-1">
            <EnhancedSearchBar onSearch={setSearchQuery} placeholder="Search scripts..." />
          </div>
          {isAdmin && (
            <Button onClick={() => { setEditingScript(null); setEditorOpen(true); }} className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" /> Add Script
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-3">
          {/* Category filter - horizontal scrollable bar */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Filter className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</span>
              {(activeCategory !== "all" || activeAudience !== "all") && (
                <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] text-muted-foreground ml-auto" onClick={() => { setActiveCategory("all"); setActiveAudience("all"); }}>
                  <X className="h-3 w-3 mr-0.5" /> Clear filters
                </Button>
              )}
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <Button
                variant={activeCategory === "all" ? "default" : "outline"}
                size="sm"
                className="text-xs shrink-0 h-8"
                onClick={() => setActiveCategory("all")}
              >
                All ({counts.all})
              </Button>
              {activeCategoriesWithData.map((key) => {
                const cat = categoryLabels[key];
                const Icon = cat.icon;
                return (
                  <Button
                    key={key}
                    variant={activeCategory === key ? "default" : "outline"}
                    size="sm"
                    className="text-xs shrink-0 h-8 gap-1"
                    onClick={() => setActiveCategory(key)}
                  >
                    <Icon className="h-3 w-3" /> {cat.label} ({counts[key]})
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Target audience filter */}
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5 block">Target Audience</span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <Button
                variant={activeAudience === "all" ? "default" : "outline"}
                size="sm"
                className="text-xs shrink-0 h-7"
                onClick={() => setActiveAudience("all")}
              >
                All
              </Button>
              {Object.entries(audienceLabels).filter(([key]) => audienceCounts[key] > 0).map(([key, label]) => (
                <Button
                  key={key}
                  variant={activeAudience === key ? "default" : "outline"}
                  size="sm"
                  className="text-xs shrink-0 h-7"
                  onClick={() => setActiveAudience(key)}
                >
                  {label} ({audienceCounts[key]})
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-3 text-xs text-muted-foreground">
          {filteredScripts.length} script{filteredScripts.length !== 1 ? "s" : ""} found
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Scripts list */}
        {!loading && (
          <div className="space-y-3">
            {filteredScripts.length > 0 ? (
              filteredScripts.map((script) => (
                <ScriptCard
                  key={script.id}
                  script={script}
                  isAdmin={isAdmin}
                  onEdit={() => { setEditingScript(script); setEditorOpen(true); }}
                  onDelete={() => setDeleteTarget(script)}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No scripts found</p>
                <p className="text-sm">Try adjusting your search or category filter.</p>
              </div>
            )}
          </div>
        )}

        {/* Knowledge Base Management (admin only) */}
        {isAdmin && (
          <div className="mt-8">
            <KnowledgeManagement />
          </div>
        )}
      </div>

      {/* Editor Dialog */}
      <ScriptEditorDialog
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setEditingScript(null); }}
        onSave={handleSave}
        script={editingScript}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Script</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.stage}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Floating AI Chat Widget */}
      <ScriptsChatWidget />
    </PageLayout>
  );
}
