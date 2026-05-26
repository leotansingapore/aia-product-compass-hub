import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Download, User, Briefcase, Users, Target, MessageSquare, Lightbulb, BookOpen, Loader2, Sparkles, Copy, CheckCircle2, Trophy, Flame, Heart, Star, Shield, Zap, FileText, Mail, Layout, Mic, MessageCircle, Presentation, Quote, ListChecks, GraduationCap, Share2, Image as ImageIcon, AlertCircle, ChevronRight, CircleDot, Code2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { supabase } from "@/integrations/supabase/client";
import { BrochureBuilderCard } from "@/components/learning-track/BrochureBuilderCard";

// Base path inside the Pre-RNF assignment shell. Tab segment is appended.
const BASE_PATH = "/learning-track/pre-rnf/assignments/audience-differentiation/tool";
const STORAGE_PREFIX = "fads-tool-v1";

// ============ DATA ============

const CLIENT_PROFILES = {
  profileA: {
    name: "Working Father (Auditor/Accountant)",
    demographics: "30-48, Male, Married, >=1 child, Singapore Citizen",
    occupation: "Auditor / Accountant",
    income: "Middle to upper-middle income",
    challenges: "Lack of time to invest. Too much information and jargon. Gets too tired after overtime during audit engagements.",
    fears: "Afraid financial situation is unstable and unattractive to provide for wife and kids. Don't want to feel like a loser.",
    keepsAwake: "Worry about job sustainability. Panic about investments falling. Too little time with children.",
    holdsBack: "Lost and not sure where to start. Requires too much time. Don't know how to invest. Insufficient passive income to quit job.",
    environment: "Stressful work environment but loving family. Supportive parents and wife.",
    entertainment: "Netflix and YouTube. Occasionally goes out with friends.",
    moneyRelationship: "Love having money. Believe money is good.",
    desiredState: "Financially free, out of poverty cycle. Stay-home dad without financial worries. More passive income.",
    secretDesires: "Live in any country with just laptop and phone. Spend 24/7 with family watching kids grow up.",
    communication: "Telegram (casual), WhatsApp (work-related)",
    mistakes: "Not taking action. Letting money sit in bank. Afraid of >5yr commitment.",
    objections: "Payment term too long. What-ifs about withdrawal. No time. Need wife's approval.",
    groupDescription: "Generally outspoken and optimistic. Humble and not a show-off. Values loyalty.",
    advisorFears: ["Worry about being scammed", "Can't trust advisors - most put interests before client", "Unsure of advisor's capability to earn returns with certainty", "", ""],
    problems: "Working 60-70h weeks, no energy to review investments, $30-50k idle in low-yield accounts",
    tangibleSolutions: "Passive income roadmap; automate DCA; protection audit",
    intangibleSolutions: "Sleep-well design; weekly updates; on-call reassurance",
    differentiators: "Quarterly one-page plan with decision log, proactive check-ins after major life events"
  },
  profileB: {
    name: "Fresh Graduate / Young Working Adult",
    demographics: "21-30, M/F, Single, SG Citizen",
    occupation: "Any",
    income: "Entry-level to mid-range",
    challenges: "Unable to control spending. Too much pressure keeping up with adulthood. No savings habit.",
    fears: "Afraid peers earn more and retire earlier. Can't afford things for themselves. Ashamed they can't provide for parents.",
    keepsAwake: "How to pay off student loans and HDB loans without going broke.",
    holdsBack: "No discipline, can't control spending. Procrastination. Too many daily commitments.",
    environment: "Low to middle income family. Implied expectations of giving allowance to family.",
    entertainment: "Hanging out with friends, shopping, Netflix, some alcohol on Friday nights.",
    moneyRelationship: "Always overspend budget. Believe money is earned to be spent, YOLO mindset.",
    desiredState: "Save and invest for family. Buy house without worrying about money after big purchases.",
    secretDesires: "Nicely renovated HDB with spouse. Spend money without thinking of the price.",
    communication: "WhatsApp, Telegram",
    mistakes: "Unable to stick to budget. Can't save. Delaying investment for house purchase.",
    objections: "Goals too far away. Other priorities. No money. Parents already bought.",
    groupDescription: "Values fun and excitement over financial security. YOLO mindset. Unaware of repercussions of not planning.",
    advisorFears: ["Don't know what advisors can help with", "Don't know purpose of having an advisor", "Worry advisors will leave after earning their money", "Same age as me, how would they know better? (ego)", ""],
    problems: "Low discipline, procrastination, competing priorities, no savings habit",
    tangibleSolutions: "Starter safety stack (ED fund + term/PA), $X/mo DCA",
    intangibleSolutions: "Adulting roadmap, 1-1 coaching, bite-size learning",
    differentiators: "90-day setup: budget autopilot, risk basics, starter portfolio"
  },
  profileC: {
    name: "Single Mother",
    demographics: "28-45, Female, 1-2 kids, SG Citizen/PR",
    occupation: "Various",
    income: "Low to middle income",
    challenges: "Income stability, sole responsibility, childcare costs",
    fears: "Emergency events, medical bills, kids' education costs",
    keepsAwake: "Being the sole provider, what if something happens to me",
    holdsBack: "Time bandwidth, trust issues, analysis paralysis, sole financial responsibility",
    environment: "Community-oriented, practical content consumption",
    entertainment: "Community activities, social media, practical content",
    moneyRelationship: "Cautious, every dollar counts",
    desiredState: "Calm control, predictable runway, future-proof kids",
    secretDesires: "Freedom to say 'yes' to kids' opportunities",
    communication: "WhatsApp voice + evening calls",
    mistakes: "Under-insured, no runway, no auto-save",
    objections: "Budget sensitivity, 'we'll do it later'",
    groupDescription: "Resilient, resourceful, community-driven. Prioritizes children over self.",
    advisorFears: ["Sales pressure", "Hidden fees", "Advisor churn", "Being judged for financial situation", ""],
    problems: "Time bandwidth, trust issues, analysis paralysis, sole financial responsibility",
    tangibleSolutions: "Income protection, ED fund ladder, education sinking fund",
    intangibleSolutions: "Emotional safety, clear decision criteria, regular check-ins",
    differentiators: "Protection first, then automate savings, then growth via S.P.A.C.E."
  }
};

const FRAMEWORKS = {
  fat: {
    name: "F.A.T. Method",
    description: "Foundation, Accelerate, Transfer",
    steps: [
      "Foundation: Establish cashflow and protection base",
      "Accelerate: Build growth engine through systematic investing",
      "Transfer: Optimize legacy and tax efficiency"
    ]
  },
  pisa: {
    name: "P.I.S.A. Method",
    description: "Protect Income, Scale Assets",
    steps: [
      "Protect: Income protection and emergency runway",
      "Invest: Automated accumulation systems",
      "Scale: Portfolio growth and optimization",
      "Adjust: Periodic rebalancing and reviews"
    ]
  },
  space: {
    name: "S.P.A.C.E. Method",
    description: "Safe, Protect, Accelerate, Conserve, Estate",
    steps: [
      "Safe: Emergency funds and risk floors",
      "Protect: Core insurance coverage",
      "Accelerate: Growth investments",
      "Conserve: Capital preservation strategies",
      "Estate: Legacy and estate planning"
    ]
  },
  huat: {
    name: "H.U.A.T. Method",
    description: "Horizon, Upside, Allocation, Triage",
    steps: [
      "Horizon: Timeline mapping and goal setting",
      "Upside: Risk/return optimization",
      "Allocation: Strategic asset allocation",
      "Triage: Decision frameworks and reviews"
    ]
  }
};

const PERSONALITY_STYLES = [
  { value: "analytical", label: "Analytical & Data-Driven", desc: "You lead with numbers, charts, and evidence" },
  { value: "empathetic", label: "Empathetic & Relationship-Focused", desc: "You lead with emotional connection and trust" },
  { value: "strategic", label: "Strategic & Big-Picture", desc: "You help clients see the long-term vision" },
  { value: "practical", label: "Practical & Solution-Oriented", desc: "You focus on actionable steps and quick wins" },
  { value: "visionary", label: "Visionary & Forward-Thinking", desc: "You inspire clients with future possibilities" },
];

const CORE_VALUES_OPTIONS = [
  "Integrity", "Trust", "Transparency", "Family-First", "Excellence", "Growth",
  "Service", "Stewardship", "Empowerment", "Accountability", "Patience",
  "Discipline", "Education", "Compassion", "Independence"
];

// ============ TYPES ============

interface FormData {
  // Personality
  personalityStyle: string;
  coreValues: string;
  beliefs: string;
  moneyPhilosophy: string;
  // Purpose
  originStory: string;
  purpose: string;
  mission: string;
  vision: string;
  // Work Experience
  yearsInIndustry: string;
  claimsCount: string;
  memorableStories: string;
  investmentExperience: string;
  certifications: string;
  companyTransitions: string;
  careerGoals: string;
  careerInspiration: string;
  // Personal Experience
  pastJobs: string;
  education: string;
  schoolLife: string;
  activitiesEnjoy: string;
  activitiesDislike: string;
  strengths: string;
  strengthsWhy: string;
  weaknesses: string;
  weaknessesWhy: string;
  personalGoals: string;
  goalInspiration: string;
  // Defining Moments
  moment1: string;
  moment2: string;
  moment3: string;
  moment4: string;
  moment5: string;
  momentsWhy: string;
  momentsFeel: string;
  momentsMind: string;
  momentsImpact: string;
  // Audience 1
  audience1Demographics: string;
  audience1Age: string;
  audience1Gender: string;
  audience1Occupation: string;
  audience1Income: string;
  audience1MaritalStatus: string;
  audience1Kids: string;
  audience1Citizenship: string;
  audience1Challenges: string;
  audience1KeepsAwake: string;
  audience1HoldsBack: string;
  audience1Fears: string;
  audience1Environment: string;
  audience1Entertainment: string;
  audience1MoneyRelationship: string;
  audience1DesiredState: string;
  audience1SecretDesires: string;
  audience1Communication: string;
  audience1Mistakes: string;
  audience1Objections: string;
  audience1GroupDescription: string;
  audience1AdvisorFear1: string;
  audience1AdvisorFear2: string;
  audience1AdvisorFear3: string;
  audience1AdvisorFear4: string;
  audience1AdvisorFear5: string;
  // Audience 2
  audience2Demographics: string;
  audience2Age: string;
  audience2Gender: string;
  audience2Occupation: string;
  audience2Income: string;
  audience2MaritalStatus: string;
  audience2Kids: string;
  audience2Citizenship: string;
  audience2Challenges: string;
  audience2KeepsAwake: string;
  audience2HoldsBack: string;
  audience2Fears: string;
  audience2Environment: string;
  audience2Entertainment: string;
  audience2MoneyRelationship: string;
  audience2DesiredState: string;
  audience2SecretDesires: string;
  audience2Communication: string;
  audience2Mistakes: string;
  audience2Objections: string;
  audience2GroupDescription: string;
  audience2AdvisorFear1: string;
  audience2AdvisorFear2: string;
  audience2AdvisorFear3: string;
  audience2AdvisorFear4: string;
  audience2AdvisorFear5: string;
  // Solutions
  audience1Problems: string;
  audience1TangibleSolutions: string;
  audience1IntangibleProblems: string;
  audience1IntangibleSolutions: string;
  audience1Differentiators: string;
  audience2Problems: string;
  audience2TangibleSolutions: string;
  audience2IntangibleProblems: string;
  audience2IntangibleSolutions: string;
  audience2Differentiators: string;
  // Delivery
  missionStatement: string;
  processStatement: string;
  selectedFramework: string;
  customFramework: string;
  endResultStatement: string;
}

const INITIAL_FORM: FormData = {
  personalityStyle: "", coreValues: "", beliefs: "", moneyPhilosophy: "",
  originStory: "", purpose: "", mission: "", vision: "",
  yearsInIndustry: "", claimsCount: "", memorableStories: "", investmentExperience: "",
  certifications: "", companyTransitions: "", careerGoals: "", careerInspiration: "",
  pastJobs: "", education: "", schoolLife: "", activitiesEnjoy: "", activitiesDislike: "",
  strengths: "", strengthsWhy: "", weaknesses: "", weaknessesWhy: "",
  personalGoals: "", goalInspiration: "",
  moment1: "", moment2: "", moment3: "", moment4: "", moment5: "",
  momentsWhy: "", momentsFeel: "", momentsMind: "", momentsImpact: "",
  audience1Demographics: "", audience1Age: "", audience1Gender: "", audience1Occupation: "",
  audience1Income: "", audience1MaritalStatus: "", audience1Kids: "", audience1Citizenship: "",
  audience1Challenges: "", audience1KeepsAwake: "", audience1HoldsBack: "", audience1Fears: "",
  audience1Environment: "", audience1Entertainment: "", audience1MoneyRelationship: "",
  audience1DesiredState: "", audience1SecretDesires: "", audience1Communication: "",
  audience1Mistakes: "", audience1Objections: "", audience1GroupDescription: "",
  audience1AdvisorFear1: "", audience1AdvisorFear2: "", audience1AdvisorFear3: "",
  audience1AdvisorFear4: "", audience1AdvisorFear5: "",
  audience2Demographics: "", audience2Age: "", audience2Gender: "", audience2Occupation: "",
  audience2Income: "", audience2MaritalStatus: "", audience2Kids: "", audience2Citizenship: "",
  audience2Challenges: "", audience2KeepsAwake: "", audience2HoldsBack: "", audience2Fears: "",
  audience2Environment: "", audience2Entertainment: "", audience2MoneyRelationship: "",
  audience2DesiredState: "", audience2SecretDesires: "", audience2Communication: "",
  audience2Mistakes: "", audience2Objections: "", audience2GroupDescription: "",
  audience2AdvisorFear1: "", audience2AdvisorFear2: "", audience2AdvisorFear3: "",
  audience2AdvisorFear4: "", audience2AdvisorFear5: "",
  audience1Problems: "", audience1TangibleSolutions: "", audience1IntangibleProblems: "",
  audience1IntangibleSolutions: "", audience1Differentiators: "",
  audience2Problems: "", audience2TangibleSolutions: "", audience2IntangibleProblems: "",
  audience2IntangibleSolutions: "", audience2Differentiators: "",
  missionStatement: "", processStatement: "", selectedFramework: "", customFramework: "",
  endResultStatement: "",
};

// Fields per tab for progress tracking
const TAB_FIELDS: Record<string, (keyof FormData)[]> = {
  personality: ["personalityStyle", "coreValues", "beliefs", "moneyPhilosophy"],
  purpose: ["originStory", "purpose", "mission", "vision"],
  experience: [
    "yearsInIndustry", "claimsCount", "memorableStories", "investmentExperience",
    "certifications", "companyTransitions", "careerGoals", "careerInspiration",
    "pastJobs", "education", "strengths", "weaknesses", "personalGoals",
    "moment1", "moment2", "moment3", "momentsImpact"
  ],
  audience: [
    "audience1Age", "audience1Occupation", "audience1Challenges", "audience1Fears",
    "audience1KeepsAwake", "audience1DesiredState", "audience1SecretDesires",
    "audience1Mistakes", "audience1Objections", "audience1AdvisorFear1",
    "audience2Age", "audience2Occupation", "audience2Challenges", "audience2Fears",
    "audience2KeepsAwake", "audience2DesiredState", "audience2SecretDesires",
    "audience2Mistakes", "audience2Objections", "audience2AdvisorFear1",
  ],
  solutions: [
    "audience1Problems", "audience1TangibleSolutions", "audience1IntangibleProblems",
    "audience1IntangibleSolutions", "audience1Differentiators",
    "audience2Problems", "audience2TangibleSolutions", "audience2IntangibleProblems",
    "audience2IntangibleSolutions", "audience2Differentiators",
  ],
  messaging: ["missionStatement", "processStatement", "selectedFramework", "endResultStatement"],
};

const TABS = [
  { id: "personality", label: "Personality", icon: Heart },
  { id: "purpose", label: "Purpose", icon: Flame },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "audience", label: "Audience", icon: Users },
  { id: "solutions", label: "Solutions", icon: Target },
  { id: "messaging", label: "Delivery", icon: MessageSquare },
  { id: "output", label: "Brand Output", icon: Sparkles },
];

// ============ SECTION PROGRESS BAR ============

function SectionProgress({ label, fields, formData }: { label: string; fields: (keyof FormData)[]; formData: FormData }) {
  const filled = fields.filter(f => formData[f]?.trim()).length;
  const pct = Math.round((filled / fields.length) * 100);
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-muted-foreground min-w-[80px]">{label}</span>
      <Progress value={pct} className="h-2 flex-1" />
      <span className={`font-medium min-w-[40px] text-right ${pct === 100 ? 'text-green-500' : 'text-muted-foreground'}`}>
        {pct === 100 ? <CheckCircle2 className="h-4 w-4 inline" /> : `${pct}%`}
      </span>
    </div>
  );
}

// ============ CONVICTION CARD ============

function ConvictionCard({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text: string }) {
  return (
    <div className="flex gap-3 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border border-primary/10">
      <Icon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{text}</p>
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============

export default function FinancialAdvisorDifferentiation() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const { user } = useSimplifiedAuth();
  const userId = user?.id ?? null;
  const storageKey = userId ? `${STORAGE_PREFIX}-${userId}` : `${STORAGE_PREFIX}-anon`;
  const polishStorageKey = userId
    ? `${STORAGE_PREFIX}-ai-${userId}`
    : `${STORAGE_PREFIX}-ai-anon`;

  const [activeTab, setActiveTab] = useState(tab || "personality");
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState("");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [copied, setCopied] = useState(false);
  // Per-collateral AI polish state. Keyed by `${kind}:${id}` (e.g. "asset:wa-tagline", "slide:why-im-here").
  const [aiPolish, setAiPolish] = useState<Record<string, string>>({});
  const [polishingId, setPolishingId] = useState<string | null>(null);
  // Submission state for "Submit to mentor".
  const [isSubmittingToMentor, setIsSubmittingToMentor] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const hasHydrated = useRef(false);

  // Hydrate from localStorage once we know the user.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setFormData((prev) => ({ ...prev, ...parsed }));
        }
      }
      const rawPolish = localStorage.getItem(polishStorageKey);
      if (rawPolish) {
        const parsedPolish = JSON.parse(rawPolish);
        if (parsedPolish && typeof parsedPolish === "object") {
          setAiPolish(parsedPolish);
        }
      }
    } catch (e) {
      console.warn("FADS tool: failed to hydrate from localStorage", e);
    } finally {
      hasHydrated.current = true;
    }
  }, [storageKey, polishStorageKey]);

  // Persist on every change (after hydration).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasHydrated.current) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(formData));
    } catch (e) {
      console.warn("FADS tool: failed to persist", e);
    }
  }, [formData, storageKey]);

  // Persist AI-polished collateral separately so refresh doesn't wipe it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasHydrated.current) return;
    try {
      if (Object.keys(aiPolish).length === 0) {
        localStorage.removeItem(polishStorageKey);
      } else {
        localStorage.setItem(polishStorageKey, JSON.stringify(aiPolish));
      }
    } catch (e) {
      console.warn("FADS tool: failed to persist AI polish", e);
    }
  }, [aiPolish, polishStorageKey]);

  // Check if learner has already submitted this assignment so the submit
  // button reflects that state across refreshes.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await (supabase.from as any)("assignment_submissions")
          .select("id")
          .eq("user_id", userId)
          .eq("product_id", "first-60-days-assignments")
          .eq("item_id", "assignment-08")
          .limit(1);
        if (cancelled) return;
        if (error) {
          console.warn("FADS tool: failed to check submission state", error);
          return;
        }
        if (Array.isArray(data) && data.length > 0) setHasSubmitted(true);
      } catch (e) {
        console.warn("FADS tool: submission state check threw", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!tab) {
      navigate(`${BASE_PATH}/personality`, { replace: true });
    } else {
      setActiveTab(tab);
    }
  }, [tab, navigate]);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Overall progress
  const overallProgress = useMemo(() => {
    const allFields = Object.values(TAB_FIELDS).flat();
    const filled = allFields.filter(f => formData[f]?.trim()).length;
    return Math.round((filled / allFields.length) * 100);
  }, [formData]);

  // Tab progress
  const tabProgress = useMemo(() => {
    const result: Record<string, number> = {};
    for (const [tabId, fields] of Object.entries(TAB_FIELDS)) {
      const filled = fields.filter(f => formData[f]?.trim()).length;
      result[tabId] = Math.round((filled / fields.length) * 100);
    }
    return result;
  }, [formData]);

  const getTabIndex = (tabId: string) => TABS.findIndex(t => t.id === tabId);

  const goToNextTab = () => {
    const idx = getTabIndex(activeTab);
    if (idx < TABS.length - 1) {
      const next = TABS[idx + 1].id;
      setActiveTab(next);
      navigate(`${BASE_PATH}/${next}`);
    }
  };

  const goToPrevTab = () => {
    const idx = getTabIndex(activeTab);
    if (idx > 0) {
      const prev = TABS[idx - 1].id;
      setActiveTab(prev);
      navigate(`${BASE_PATH}/${prev}`);
    }
  };

  // Prefill audience from profile
  const applyProfilePrefill = (profileKey: keyof typeof CLIENT_PROFILES, num: 1 | 2) => {
    const p = CLIENT_PROFILES[profileKey];
    const pre = num === 1 ? "audience1" : "audience2";
    setFormData(prev => ({
      ...prev,
      [`${pre}Demographics`]: p.demographics,
      [`${pre}Age`]: p.demographics.split(",")[0]?.trim() || "",
      [`${pre}Gender`]: p.demographics.includes("Male") ? (p.demographics.includes("Female") ? "Male / Female" : "Male") : "Female",
      [`${pre}Occupation`]: p.occupation,
      [`${pre}Income`]: p.income,
      [`${pre}Challenges`]: p.challenges,
      [`${pre}Fears`]: p.fears,
      [`${pre}KeepsAwake`]: p.keepsAwake,
      [`${pre}HoldsBack`]: p.holdsBack,
      [`${pre}Environment`]: p.environment,
      [`${pre}Entertainment`]: p.entertainment,
      [`${pre}MoneyRelationship`]: p.moneyRelationship,
      [`${pre}DesiredState`]: p.desiredState,
      [`${pre}SecretDesires`]: p.secretDesires,
      [`${pre}Communication`]: p.communication,
      [`${pre}Mistakes`]: p.mistakes,
      [`${pre}Objections`]: p.objections,
      [`${pre}GroupDescription`]: p.groupDescription,
      [`${pre}AdvisorFear1`]: p.advisorFears[0] || "",
      [`${pre}AdvisorFear2`]: p.advisorFears[1] || "",
      [`${pre}AdvisorFear3`]: p.advisorFears[2] || "",
      [`${pre}AdvisorFear4`]: p.advisorFears[3] || "",
      [`${pre}AdvisorFear5`]: p.advisorFears[4] || "",
      [`${pre}Problems`]: p.problems,
      [`${pre}TangibleSolutions`]: p.tangibleSolutions,
      [`${pre}IntangibleSolutions`]: p.intangibleSolutions,
      [`${pre}Differentiators`]: p.differentiators,
    } as any));
    toast.success(`Filled Audience #${num} with ${p.name} profile`);
  };

  const applyFrameworkTemplate = (key: keyof typeof FRAMEWORKS) => {
    const fw = FRAMEWORKS[key];
    setFormData(prev => ({
      ...prev,
      selectedFramework: key,
      processStatement: `I believe in helping my clients by ${fw.description.toLowerCase()}`,
      endResultStatement: `I help [AUDIENCE] achieve [OUTCOME] through my ${fw.name}`,
    }));
  };

  // Fill random for demo
  const fillRandomAnswers = () => {
    const p1 = CLIENT_PROFILES.profileA;
    const p2 = CLIENT_PROFILES.profileB;
    setFormData({
      personalityStyle: "empathetic",
      coreValues: "Integrity, Family, Excellence",
      beliefs: "Financial planning should be simple and understandable for everyone",
      moneyPhilosophy: "Money is a tool for freedom, not a score. Protection comes before growth.",
      originStory: "Used to be in F&B, slogging 14 hours a day. Joined insurance for the money. Only earned $1k/month for first two years. One day received a gratitude text from a client and shifted focus to genuine impact.",
      purpose: "My parents' financial stress during 2008 shaped my desire to help others avoid similar situations",
      mission: "I empower working fathers to build passive income streams so they can spend more time with family",
      vision: "Build a practice serving 100 families with comprehensive financial planning by 2030",
      yearsInIndustry: "3-5", claimsCount: "12",
      memorableStories: "Helped a young family save $50k for their first home down payment in 18 months",
      investmentExperience: "Portfolio management across market cycles, focus on low-cost diversified strategies",
      certifications: "CFP, Life & Health License",
      companyTransitions: "Started at large firm, moved to independent practice for better client focus",
      careerGoals: "Build a practice serving 100 families", careerInspiration: "Seeing clients transform from financial anxiety to confidence",
      pastJobs: "Marketing coordinator, restaurant server", education: "Bachelor's in Business Administration, NUS",
      schoolLife: "", activitiesEnjoy: "Reading, hiking, cooking, board games with family", activitiesDislike: "",
      strengths: "Active listening, problem-solving, explaining complex concepts simply", strengthsWhy: "",
      weaknesses: "Sometimes too perfectionist with planning details", weaknessesWhy: "",
      personalGoals: "Financial independence by 45, travel with family", goalInspiration: "",
      moment1: "Parents' financial stress during 2008 crisis", moment2: "First client success story",
      moment3: "Leaving corporate to go independent", moment4: "", moment5: "",
      momentsWhy: "", momentsFeel: "", momentsMind: "", momentsImpact: "Shaped my desire to help others avoid financial stress",
      audience1Age: "30-48", audience1Gender: "Male", audience1Occupation: "Auditor / Accountant",
      audience1Income: p1.income, audience1MaritalStatus: "Married", audience1Kids: "At least 1",
      audience1Citizenship: "Singapore Citizen", audience1Demographics: p1.demographics,
      audience1Challenges: p1.challenges, audience1KeepsAwake: p1.keepsAwake, audience1HoldsBack: p1.holdsBack,
      audience1Fears: p1.fears, audience1Environment: p1.environment, audience1Entertainment: p1.entertainment,
      audience1MoneyRelationship: p1.moneyRelationship, audience1DesiredState: p1.desiredState,
      audience1SecretDesires: p1.secretDesires, audience1Communication: p1.communication,
      audience1Mistakes: p1.mistakes, audience1Objections: p1.objections, audience1GroupDescription: p1.groupDescription,
      audience1AdvisorFear1: p1.advisorFears[0], audience1AdvisorFear2: p1.advisorFears[1],
      audience1AdvisorFear3: p1.advisorFears[2], audience1AdvisorFear4: "", audience1AdvisorFear5: "",
      audience2Age: "21-30", audience2Gender: "Male / Female", audience2Occupation: "Any",
      audience2Income: p2.income, audience2MaritalStatus: "Single", audience2Kids: "0",
      audience2Citizenship: "Singapore Citizen", audience2Demographics: p2.demographics,
      audience2Challenges: p2.challenges, audience2KeepsAwake: p2.keepsAwake, audience2HoldsBack: p2.holdsBack,
      audience2Fears: p2.fears, audience2Environment: p2.environment, audience2Entertainment: p2.entertainment,
      audience2MoneyRelationship: p2.moneyRelationship, audience2DesiredState: p2.desiredState,
      audience2SecretDesires: p2.secretDesires, audience2Communication: p2.communication,
      audience2Mistakes: p2.mistakes, audience2Objections: p2.objections, audience2GroupDescription: p2.groupDescription,
      audience2AdvisorFear1: p2.advisorFears[0], audience2AdvisorFear2: p2.advisorFears[1],
      audience2AdvisorFear3: p2.advisorFears[2], audience2AdvisorFear4: p2.advisorFears[3], audience2AdvisorFear5: "",
      audience1Problems: p1.problems, audience1TangibleSolutions: p1.tangibleSolutions,
      audience1IntangibleProblems: "Anxiety about market drops, guilt about not being present for family",
      audience1IntangibleSolutions: p1.intangibleSolutions, audience1Differentiators: p1.differentiators,
      audience2Problems: p2.problems, audience2TangibleSolutions: p2.tangibleSolutions,
      audience2IntangibleProblems: "Social comparison pressure, fear of adulting, overwhelm",
      audience2IntangibleSolutions: p2.intangibleSolutions, audience2Differentiators: p2.differentiators,
      missionStatement: "I empower working fathers to build passive income streams so they can spend more time with family",
      processStatement: "I believe in guiding busy professionals through systematic planning and education",
      selectedFramework: "fat", customFramework: "",
      endResultStatement: "I help busy working fathers achieve financial freedom and peace of mind through my F.A.T. Method",
    });
    toast.success("Filled with sample answers");
  };

  // Build the brand brief JSON for AI/content strategist
  const buildBrandBrief = () => {
    const fw = formData.selectedFramework ? FRAMEWORKS[formData.selectedFramework as keyof typeof FRAMEWORKS] : null;
    const style = PERSONALITY_STYLES.find(s => s.value === formData.personalityStyle);
    return {
      advisor: {
        personalityStyle: style?.label || formData.personalityStyle,
        coreValues: formData.coreValues,
        beliefs: formData.beliefs,
        moneyPhilosophy: formData.moneyPhilosophy,
        originStory: formData.originStory,
        purpose: formData.purpose,
        mission: formData.mission,
        vision: formData.vision,
        yearsInIndustry: formData.yearsInIndustry,
        certifications: formData.certifications,
        strengths: formData.strengths,
        definingMoments: [formData.moment1, formData.moment2, formData.moment3, formData.moment4, formData.moment5].filter(Boolean),
        hobbies: formData.activitiesEnjoy,
      },
      audiences: [
        {
          label: "Primary Audience",
          demographics: { age: formData.audience1Age, gender: formData.audience1Gender, occupation: formData.audience1Occupation, income: formData.audience1Income },
          challenges: formData.audience1Challenges,
          fears: formData.audience1Fears,
          keepsAwake: formData.audience1KeepsAwake,
          desiredState: formData.audience1DesiredState,
          secretDesires: formData.audience1SecretDesires,
          mistakes: formData.audience1Mistakes,
          objections: formData.audience1Objections,
          advisorFears: [formData.audience1AdvisorFear1, formData.audience1AdvisorFear2, formData.audience1AdvisorFear3].filter(Boolean),
          communication: formData.audience1Communication,
        },
        {
          label: "Secondary Audience",
          demographics: { age: formData.audience2Age, gender: formData.audience2Gender, occupation: formData.audience2Occupation, income: formData.audience2Income },
          challenges: formData.audience2Challenges,
          fears: formData.audience2Fears,
          keepsAwake: formData.audience2KeepsAwake,
          desiredState: formData.audience2DesiredState,
          secretDesires: formData.audience2SecretDesires,
          mistakes: formData.audience2Mistakes,
          objections: formData.audience2Objections,
          advisorFears: [formData.audience2AdvisorFear1, formData.audience2AdvisorFear2, formData.audience2AdvisorFear3].filter(Boolean),
          communication: formData.audience2Communication,
        }
      ],
      solutions: {
        audience1: { tangibleProblems: formData.audience1Problems, tangibleSolutions: formData.audience1TangibleSolutions, intangibleProblems: formData.audience1IntangibleProblems, intangibleSolutions: formData.audience1IntangibleSolutions, differentiators: formData.audience1Differentiators },
        audience2: { tangibleProblems: formData.audience2Problems, tangibleSolutions: formData.audience2TangibleSolutions, intangibleProblems: formData.audience2IntangibleProblems, intangibleSolutions: formData.audience2IntangibleSolutions, differentiators: formData.audience2Differentiators },
      },
      delivery: {
        missionStatement: formData.missionStatement,
        process: formData.processStatement,
        framework: fw ? { name: fw.name, steps: fw.steps } : formData.customFramework,
        endResult: formData.endResultStatement,
      },
      contentDirections: {
        pillars: [
          `Education: Teach ${formData.audience1Occupation || "your audience"} about financial planning in simple terms`,
          `Authority: Share ${formData.yearsInIndustry || "your"} years of experience and ${formData.certifications || "certifications"}`,
          `Relatability: Connect through your origin story and defining moments`,
          `Trust: Address their fear that "${formData.audience1AdvisorFear1 || "advisors put interests first"}"`,
          `Aspiration: Paint the picture of "${formData.audience1DesiredState || "their desired future"}"`,
        ],
        toneOfVoice: style?.desc || "Professional yet approachable",
        contentTypes: ["Educational carousels", "Client story testimonials", "Behind-the-scenes of your process", "Myth-busting common objections", "Before/after transformation stories"],
      }
    };
  };

  // ============ MARKETING KIT BUILDERS ============
  // Each asset returns: { id, name, channel, icon, description, requiredFields, body, missing }
  // The `body` is a deterministic draft built from formData with [fallbacks]
  // for missing fields, so an FC always gets something usable to copy/edit.

  const truncate = (s: string, max: number) => s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…";
  const splitList = (s: string) => (s || "").split(/[,\n;]/).map(x => x.trim()).filter(Boolean);
  const fb = (v: string | undefined, fallback: string) => (v && v.trim()) ? v.trim() : fallback;

  type MarketingAsset = {
    id: string;
    name: string;
    channel: string;
    icon: React.ElementType;
    description: string;
    requiredFields: (keyof FormData)[];
    body: string;
    missing: (keyof FormData)[];
  };

  const buildMarketingAssets = (): MarketingAsset[] => {
    const style = PERSONALITY_STYLES.find(s => s.value === formData.personalityStyle);
    const fw = formData.selectedFramework ? FRAMEWORKS[formData.selectedFramework as keyof typeof FRAMEWORKS] : null;
    const aud1 = fb(formData.audience1Occupation, "[your audience]");
    const aud1Want = fb(formData.audience1DesiredState, "[their desired outcome]").toLowerCase().replace(/\.$/, "");
    const aud1Pain = fb(formData.audience1Problems || formData.audience1Challenges, "[their core problem]");
    const aud1IntPain = fb(formData.audience1IntangibleProblems || formData.audience1Fears, "[the emotional weight they carry]");
    const aud1Sol = fb(formData.audience1TangibleSolutions, "[what you concretely solve]");
    const aud1Diff = fb(formData.audience1Differentiators, "[your specific edge]");
    const endResult = fb(formData.endResultStatement, `I help ${aud1} achieve ${aud1Want}${fw ? ` through my ${fw.name}` : ""}`);
    const mission = fb(formData.mission, "[your mission]");
    const purpose = fb(formData.purpose, "[your purpose]");
    const beliefs = fb(formData.beliefs || formData.moneyPhilosophy, "financial planning should be simple, honest, and personal");
    const originFirst = formData.originStory ? (formData.originStory.split(".")[0] + ".") : "[one-sentence version of your origin story]";
    const moments = [formData.moment1, formData.moment2, formData.moment3].filter(Boolean);
    const objections = splitList(formData.audience1Objections);
    const advisorFears = [formData.audience1AdvisorFear1, formData.audience1AdvisorFear2, formData.audience1AdvisorFear3].filter(Boolean);
    const certs = fb(formData.certifications, "Licensed financial consultant");
    const years = fb(formData.yearsInIndustry, "");

    const fieldsMissing = (req: (keyof FormData)[]) => req.filter(f => !formData[f]?.trim());

    const assets: MarketingAsset[] = [];

    // 1. Social bios — 3 lengths
    assets.push({
      id: "social-bio",
      name: "Social Media Bios (3 lengths)",
      channel: "LinkedIn • Instagram • X",
      icon: User,
      description: "Drop-in bios sized for each platform's character limit.",
      requiredFields: ["endResultStatement", "audience1Occupation", "personalityStyle"],
      missing: fieldsMissing(["endResultStatement", "audience1Occupation", "personalityStyle"]),
      body: [
        `--- 160 chars (X / Twitter / IG headline) ---`,
        truncate(`${certs}. Helping ${aud1} ${aud1Want}${fw ? ` via ${fw.name}` : ""}.`, 160),
        ``,
        `--- 220 chars (Instagram bio) ---`,
        truncate(`${endResult}.\n${style?.label ? style.label + ". " : ""}DM "${fw ? fw.name.split(".")[0].toLowerCase() : "start"}" to begin.`, 220),
        ``,
        `--- ~500 chars (LinkedIn About hook) ---`,
        `${originFirst} I believed ${beliefs}.\n\nToday I work with ${aud1}. ${aud1Pain}. ${fw ? `Through my ${fw.name} — ${fw.description} — ` : ""}I help them ${aud1Want}.\n\nIf this is you, message me. No pitch, just a conversation.`,
      ].join("\n"),
    });

    // 2. WhatsApp tagline / display name
    assets.push({
      id: "wa-tagline",
      name: "WhatsApp Display Tagline",
      channel: "WhatsApp profile",
      icon: MessageCircle,
      description: "One-line tag for your WhatsApp About / display name.",
      requiredFields: ["endResultStatement"],
      missing: fieldsMissing(["endResultStatement"]),
      body: truncate(`${certs} • ${aud1Want} for ${aud1}`, 139),
    });

    // 3. Origin story post (long-form)
    assets.push({
      id: "origin-story-post",
      name: "Origin Story Post (long-form)",
      channel: "LinkedIn • Facebook",
      icon: FileText,
      description: "Your 'why I'm in this industry' story, ready to post.",
      requiredFields: ["originStory", "momentsImpact", "purpose"],
      missing: fieldsMissing(["originStory", "momentsImpact", "purpose"]),
      body: [
        `${fb(formData.originStory.split(".")[0] + ".", "I didn't start out in financial planning.")}`,
        ``,
        `${fb(formData.originStory, "[paragraph: what you did before, what shifted, the moment that changed your trajectory]")}`,
        ``,
        `What that taught me: ${fb(formData.momentsImpact, "[the lesson from those defining moments]")}`,
        ``,
        `So now I do this work because ${fb(purpose, "[your purpose in one line]").toLowerCase().replace(/\.$/, "")}.`,
        ``,
        `If you're a ${aud1.toLowerCase()} and any of this resonates — comment or DM. I'm not selling anything in the inbox.`,
      ].join("\n"),
    });

    // 4. 5-slide "Who I help" carousel
    assets.push({
      id: "who-i-help-carousel",
      name: "5-Slide 'Who I Help' Carousel",
      channel: "Instagram • LinkedIn",
      icon: Layout,
      description: "Slide-by-slide script for an audience-recognition carousel.",
      requiredFields: ["audience1Occupation", "audience1Problems", "audience1TangibleSolutions"],
      missing: fieldsMissing(["audience1Occupation", "audience1Problems", "audience1TangibleSolutions"]),
      body: [
        `[SLIDE 1 — HOOK]`,
        `If you're a ${aud1.toLowerCase()}, this is for you.`,
        ``,
        `[SLIDE 2 — THE PROBLEM YOU SEE]`,
        `Most ${aud1.toLowerCase()}s I meet: ${aud1Pain}.`,
        ``,
        `[SLIDE 3 — THE DEEPER PROBLEM]`,
        `But the bigger weight underneath is — ${aud1IntPain}.`,
        ``,
        `[SLIDE 4 — WHAT'S POSSIBLE]`,
        `Imagine instead: ${aud1Want}.`,
        ``,
        `[SLIDE 5 — HOW]`,
        `${fw ? `My ${fw.name}: ${fw.steps.map((s, i) => `(${i + 1}) ${s.split(":")[0]}`).join("  ")}` : "My approach: 3 steps from where you are to where you want to be."}`,
        ``,
        `[SLIDE 6 — CTA]`,
        `Comment "${(fw?.name || "start").toLowerCase().replace(/\./g, "")}" and I'll send you the breakdown.`,
      ].join("\n"),
    });

    // 5. Lead magnet outline
    assets.push({
      id: "lead-magnet",
      name: "Lead Magnet Outline",
      channel: "PDF / email opt-in",
      icon: GraduationCap,
      description: "A free download you can offer to attract your audience.",
      requiredFields: ["audience1Occupation", "audience1Problems"],
      missing: fieldsMissing(["audience1Occupation", "audience1Problems"]),
      body: [
        `TITLE: The ${aud1}'s 5-Step ${fw ? fw.name.split(".")[0] : "Foundation"} Plan`,
        `SUBTITLE: A one-page roadmap to ${aud1Want} — no jargon, no sales call required.`,
        ``,
        `OUTLINE (5 sections, ~1 page each):`,
        `1. Where you are now — quick self-audit (the gaps most ${aud1.toLowerCase()}s miss)`,
        `2. The cashflow / protection floor (the non-negotiable base)`,
        `3. The growth engine (how to make money work without micro-managing it)`,
        `4. The blind spots — top 3 mistakes ${aud1.toLowerCase()}s make: ${fb(formData.audience1Mistakes, "[their top 3 mistakes]")}`,
        `5. Your 30-day starter plan — 3 actions to take this week`,
        ``,
        `CTA inside: "Want a 30-min walkthrough of your own version? Reply to this email."`,
      ].join("\n"),
    });

    // 6. 60s intro reel script
    assets.push({
      id: "intro-reel",
      name: "60-Second Intro Reel Script",
      channel: "TikTok • IG Reels • LinkedIn video",
      icon: Mic,
      description: "Beat-by-beat script for a short intro video.",
      requiredFields: ["personalityStyle", "mission", "audience1Occupation"],
      missing: fieldsMissing(["personalityStyle", "mission", "audience1Occupation"]),
      body: [
        `[0–3s — HOOK]`,
        `"If you're a ${aud1.toLowerCase()} and you've been told to 'just invest more', this is for you."`,
        ``,
        `[3–15s — WHO I AM + WHY]`,
        `"I'm [your name]. ${certs}${years ? `, ${years} years` : ""}. ${fb(originFirst, "I joined this industry because of something specific I saw growing up.")}"`,
        ``,
        `[15–40s — WHAT I'VE SEEN]`,
        `"Most ${aud1.toLowerCase()}s I meet — they're working hard, but underneath: ${aud1IntPain}. The standard advice doesn't fit their reality."`,
        ``,
        `[40–55s — WHAT I DO DIFFERENTLY]`,
        `"${fw ? `My ${fw.name} works in ${fw.steps.length} steps. ${fw.steps[0].split(":")[0]} first, before anything else.` : "My approach starts with what's actually true for you — not a generic plan."}"`,
        ``,
        `[55–60s — CTA]`,
        `"If that sounds like you, DM me '${(fw?.name || "start").toLowerCase().replace(/\./g, "")}'. No pitch."`,
      ].join("\n"),
    });

    // 7. Story bank
    assets.push({
      id: "story-bank",
      name: "Story Bank (3 retell-ready stories)",
      channel: "All channels • appointments",
      icon: Quote,
      description: "Your most-tellable client / defining moment stories.",
      requiredFields: ["moment1", "moment2", "moment3"],
      missing: fieldsMissing(["moment1", "moment2", "moment3"]),
      body: (moments.length ? moments : ["[Moment 1]", "[Moment 2]", "[Moment 3]"]).map((m, i) => [
        `--- STORY ${i + 1} ---`,
        `SITUATION: ${m}`,
        `WHAT I DID / SAW: [1–2 lines]`,
        `LESSON / PUNCHLINE: [the one thing this story teaches your audience]`,
        `USE WHEN: ${i === 0 ? "opening an appointment" : i === 1 ? "addressing trust / 'why you'" : "closing — what's possible"}`,
        ``,
      ].join("\n")).join("\n"),
    });

    // 8. Objection responses
    const objSource = objections.length ? objections : (advisorFears.length ? advisorFears : ["[their top objection]", "[their second objection]", "[their third objection]"]);
    assets.push({
      id: "objection-bank",
      name: "Top Objection Responses",
      channel: "Appointments • DMs",
      icon: AlertCircle,
      description: "Pre-written responses to the objections your audience actually raises.",
      requiredFields: ["audience1Objections"],
      missing: fieldsMissing(["audience1Objections"]),
      body: objSource.slice(0, 5).map((o, i) => [
        `${i + 1}. "${o}"`,
        `   → ACKNOWLEDGE: That's a fair concern, and most ${aud1.toLowerCase()}s I meet say the same.`,
        `   → REFRAME: Here's what I usually find under that — [reframe in their terms]`,
        `   → OFFER: What if we [smallest next step that doesn't require commitment]?`,
        ``,
      ].join("\n")).join("\n"),
    });

    // 9. Referral ask
    assets.push({
      id: "referral-ask",
      name: "Referral Ask Script",
      channel: "WhatsApp + face-to-face",
      icon: Share2,
      description: "Two versions of the referral ask — text and spoken.",
      requiredFields: ["mission", "endResultStatement"],
      missing: fieldsMissing(["mission", "endResultStatement"]),
      body: [
        `--- WHATSAPP VERSION ---`,
        `"Hey [name], one quick thing — I'm currently growing my practice in a specific direction: ${aud1.toLowerCase()}s who want ${aud1Want}. If anyone in your circle comes to mind, would you mind making a quick intro? No pressure if no one fits — I'll always handle it the same way I've handled yours."`,
        ``,
        `--- FACE-TO-FACE VERSION ---`,
        `"Before we wrap up — can I share who I'm really trying to help right now? ${aud1.toLowerCase()}s dealing with ${aud1Pain.toLowerCase()}. If anyone you know fits that description, I'd love an intro. And I want you to know: I'd handle them the same way I've handled you."`,
      ].join("\n"),
    });

    // 10. Email signature
    assets.push({
      id: "email-signature",
      name: "Email Signature (HTML)",
      channel: "Email",
      icon: Mail,
      description: "Drop-in HTML signature block with your tagline + cert.",
      requiredFields: ["endResultStatement", "certifications"],
      missing: fieldsMissing(["endResultStatement", "certifications"]),
      body: [
        `<table style="font-family: -apple-system, Helvetica, Arial, sans-serif; font-size: 13px; color: #333;">`,
        `  <tr><td style="padding-bottom: 4px;"><strong>[Your Name]</strong></td></tr>`,
        `  <tr><td style="padding-bottom: 4px; color: #666;">${certs}</td></tr>`,
        `  <tr><td style="padding-bottom: 8px; font-style: italic;">${truncate(endResult, 140)}</td></tr>`,
        `  <tr><td style="padding-bottom: 4px;">+65 [your number] • [your.email]</td></tr>`,
        `  <tr><td style="font-size: 11px; color: #999; padding-top: 6px;">This message and any attachments are confidential. Information is for general guidance only — not financial advice; suitability depends on your circumstances.</td></tr>`,
        `</table>`,
      ].join("\n"),
    });

    return assets;
  };

  // ============ FIRST-APPOINTMENT DECK BUILDER ============

  type ApptSlide = {
    id: string;
    number: number;
    title: string;
    icon: React.ElementType;
    purpose: string;
    body: string;
    speakerNote?: string;
  };

  const buildFirstApptDeck = (): ApptSlide[] => {
    const style = PERSONALITY_STYLES.find(s => s.value === formData.personalityStyle);
    const fw = formData.selectedFramework ? FRAMEWORKS[formData.selectedFramework as keyof typeof FRAMEWORKS] : null;
    const aud1 = fb(formData.audience1Occupation, "[your audience]");
    const aud1Want = fb(formData.audience1DesiredState, "[the desired outcome]");
    const aud1Pain = fb(formData.audience1Problems || formData.audience1Challenges, "[their core problem]");
    const aud1IntPain = fb(formData.audience1IntangibleProblems || formData.audience1Fears, "[the emotional weight]");

    return [
      {
        id: "why-im-here",
        number: 1,
        title: "Why I'm here",
        icon: Heart,
        purpose: "Open with your origin — shift the room from 'sales meeting' to 'real conversation'.",
        body: `${fb(formData.originStory, "[your origin in 2–3 lines]")}\n\nThat shaped me into someone who: ${fb(formData.momentsImpact, "[the way those moments changed your approach]")}`,
        speakerNote: "Tell, don't read. 60-90 seconds. Look up after.",
      },
      {
        id: "who-i-serve",
        number: 2,
        title: "Who I serve",
        icon: Users,
        purpose: "Let the prospect self-identify. If they're not your audience, this surfaces it now.",
        body: `I work primarily with ${aud1.toLowerCase()}s.\n\nTypical profile: ${fb(formData.audience1Demographics, "[age, family stage, income range]")}.\n\nWhat they care about: ${aud1Want}.`,
        speakerNote: "Pause. Ask: 'Does any of that sound like where you're at?'",
      },
      {
        id: "what-ive-seen",
        number: 3,
        title: "What I've seen people struggle with",
        icon: AlertCircle,
        purpose: "Show you understand their world — name the problem before they have to.",
        body: `On the surface: ${aud1Pain}.\n\nBut underneath, almost always: ${aud1IntPain}.\n\nMost ${aud1.toLowerCase()}s have been told to 'just save more' or 'invest in this product' — that doesn't address either layer.`,
        speakerNote: "Eye contact. Slow down. They should feel seen here.",
      },
      {
        id: "how-we-work",
        number: 4,
        title: "How we'll work together",
        icon: ListChecks,
        purpose: "Show the framework — not as a sales pitch, as a how-this-will-go.",
        body: fw
          ? `My ${fw.name} — ${fw.description}\n\n${fw.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`
          : "[Walk through your 3–5 step process here]",
        speakerNote: `Style cue: ${fb(style?.desc, "warm + clear")}. Don't speed through this — it's the spine of your value.`,
      },
      {
        id: "what-done-looks-like",
        number: 5,
        title: "What 'done' looks like for you",
        icon: Target,
        purpose: "Paint the destination in their words. Future-pace.",
        body: `${aud1Want}.\n\nMore specifically: ${fb(formData.audience1SecretDesires, "[their secret wants — the unspoken version]")}.\n\nThat's what success looks like 12–24 months from now.`,
        speakerNote: "Ask: 'When you picture that, what's the first thing that changes day-to-day?'",
      },
      {
        id: "how-i-work",
        number: 6,
        title: "How I work — cadence + expectations",
        icon: Briefcase,
        purpose: "Pre-empt 'will this advisor disappear after the sale?' fears.",
        body: `${fb(formData.processStatement, "[your process statement — your service cadence, review frequency, what they can expect from you]")}\n\nMy differentiator: ${fb(formData.audience1Differentiators, "[what you uniquely do that other advisors don't]")}`,
        speakerNote: `Address the fear directly if relevant: "${fb(formData.audience1AdvisorFear1, "[their advisor fear]")}" — name it, then explain how you handle it.`,
      },
      {
        id: "next-step",
        number: 7,
        title: "Today's next step",
        icon: ChevronRight,
        purpose: "Soft close into the next action — no pressure, clear path.",
        body: `Two options from here:\n\n1. Full fact-find — we go deeper on your numbers, goals, and gaps. ~45 min. You walk away with a one-page summary either way.\n\n2. Take a week. Sit with what we covered. Message me with any questions, and we book the fact-find when you're ready.\n\nEither is fine with me — what feels right?`,
        speakerNote: "Genuinely give them the choice. Don't push option 1. Trust the framework.",
      },
    ];
  };

  // Generate brand template via the `generate-brand-template` edge function
  // (calls OpenAI server-side using the project's API key). Falls back to a
  // local structured JSON brief if the edge function is unavailable so the
  // learner is never blocked.
  const generateBrandTemplate = async () => {
    setIsGenerating(true);
    try {
      const brief = buildBrandBrief();
      const { data, error } = await supabase.functions.invoke("generate-brand-template", {
        body: { ...formData, brandBrief: brief },
      });
      if (error) throw error;
      if (data?.brandTemplate) {
        setGeneratedTemplate(data.brandTemplate);
        setShowTemplateModal(true);
        toast.success("Brand template generated.");
        return;
      }
      throw new Error("No brandTemplate in response");
    } catch (err) {
      console.warn("FADS tool: AI generation failed, falling back to local JSON brief", err);
      try {
        const brief = buildBrandBrief();
        const md = `# Your Brand — Brand Brief (offline fallback)\n\n` +
          `AI polish is unavailable right now. Below is the structured brief you built. Paste it into any LLM with the prompt: "Polish this into 3 LinkedIn posts and 1 LinkedIn About section."\n\n` +
          "```json\n" + JSON.stringify(brief, null, 2) + "\n```\n";
        setGeneratedTemplate(md);
        setShowTemplateModal(true);
        toast.message("Showing offline brief — AI polish failed.");
      } catch (e) {
        console.warn("FADS tool: buildBrandBrief failed", e);
        toast.error("Failed to build brand brief.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Polish a single asset / slide / brochure blurb via the generate-collateral edge function.
  // Stores the result in `aiPolish` keyed by `${kind}:${id}` so the UI can swap drafts.
  const polishCollateral = async (
    kind: "asset" | "slide" | "brochure-blurb",
    target: { id: string; name: string; channelOrPurpose?: string; draft: string },
  ) => {
    const key = `${kind}:${target.id}`;
    setPolishingId(key);
    try {
      const brief = buildBrandBrief();
      const { data, error } = await supabase.functions.invoke("generate-collateral", {
        body: {
          brandBrief: brief,
          target: {
            kind,
            id: target.id,
            name: target.name,
            channelOrPurpose: target.channelOrPurpose ?? "",
            draft: target.draft,
          },
        },
      });
      if (error) throw error;
      const polished = (data as { polished?: string } | null)?.polished?.trim();
      if (!polished) throw new Error("Empty response");
      setAiPolish((prev) => ({ ...prev, [key]: polished }));
      toast.success("AI-polished version ready.");
    } catch (err) {
      console.warn("polishCollateral failed", err);
      toast.error("AI polish failed — the template draft is still available.");
    } finally {
      setPolishingId(null);
    }
  };

  // Submit the brand brief to the assignment_submissions table so admin can review.
  const submitToMentor = async () => {
    if (!user) {
      toast.error("You need to be signed in to submit.");
      return;
    }
    setIsSubmittingToMentor(true);
    try {
      const brief = buildBrandBrief();
      const summary = [
        `Audience & Differentiation Worksheet submission`,
        ``,
        `MISSION: ${formData.mission || "(not provided)"}`,
        `END RESULT: ${formData.endResultStatement || "(not provided)"}`,
        `PERSONALITY: ${formData.personalityStyle || "(not provided)"}`,
        `FRAMEWORK: ${formData.selectedFramework || "(not provided)"}`,
        `AUDIENCE #1: ${formData.audience1Occupation || "(not provided)"}`,
        `AUDIENCE #2: ${formData.audience2Occupation || "(not provided)"}`,
        ``,
        `--- FULL BRAND BRIEF (JSON) ---`,
        JSON.stringify(brief, null, 2),
      ].join("\n");

      const { error } = await (supabase.from as any)("assignment_submissions").insert({
        user_id: user.id,
        product_id: "first-60-days-assignments",
        item_id: "assignment-08",
        submission_text: summary,
        file_url: null,
        file_name: null,
      });
      if (error) throw error;
      setHasSubmitted(true);
      toast.success("Submitted to your mentor.");
    } catch (err: any) {
      console.warn("submitToMentor failed", err);
      toast.error(err?.message ?? "Submission failed.");
    } finally {
      setIsSubmittingToMentor(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Insecure context or permission denied — surface, don't show fake success.
      toast.error("Couldn't copy — your browser blocked clipboard access");
    }
  };

  // ============ RENDER HELPERS ============

  const renderField = (field: keyof FormData, label: string, placeholder: string, rows = 3) => (
    <div>
      <Label htmlFor={field}>{label}</Label>
      {rows <= 1 ? (
        <Input
          id={field}
          value={formData[field]}
          onChange={(e) => updateFormData(field, e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <Textarea
          id={field}
          value={formData[field]}
          onChange={(e) => updateFormData(field, e.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
      )}
    </div>
  );

  const renderAudienceCard = (num: 1 | 2) => {
    const pre = num === 1 ? "audience1" : "audience2";
    const color = num === 1 ? "text-primary" : "text-orange-500";
    return (
      <Card>
        <CardHeader>
          <CardTitle className={color}>
            {num === 1 ? "Primary" : "Secondary"} Audience #{num}
          </CardTitle>
          <CardDescription>Deep profile of your {num === 1 ? "ideal" : "secondary"} client</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-lg mb-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">DEMOGRAPHICS</p>
            <div className="grid grid-cols-2 gap-3">
              {renderField(`${pre}Age` as keyof FormData, "Age Range", "e.g. 30-48", 1)}
              {renderField(`${pre}Gender` as keyof FormData, "Gender", "e.g. Male", 1)}
              {renderField(`${pre}Occupation` as keyof FormData, "Occupation", "e.g. Auditor", 1)}
              {renderField(`${pre}Income` as keyof FormData, "Income Range", "e.g. Middle income", 1)}
              {renderField(`${pre}MaritalStatus` as keyof FormData, "Marital Status", "e.g. Married", 1)}
              {renderField(`${pre}Kids` as keyof FormData, "Kids", "e.g. 1+", 1)}
              {renderField(`${pre}Citizenship` as keyof FormData, "Citizenship", "e.g. SG Citizen", 1)}
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground">PSYCHOGRAPHICS</p>
          {renderField(`${pre}Challenges` as keyof FormData, "Current Challenges & Roadblocks", "What tangible and intangible barriers do they face?", 3)}
          {renderField(`${pre}KeepsAwake` as keyof FormData, "What Keeps Them Up at Night?", "Their biggest worries and anxieties", 2)}
          {renderField(`${pre}HoldsBack` as keyof FormData, "What Holds Them Back?", "What stops them from achieving their desired state on their own?", 2)}
          {renderField(`${pre}Fears` as keyof FormData, "Primary Fears (Shame / Survival / Social / Self-Actualization)", "Financial fears, social anxieties, survival concerns", 2)}
          {renderField(`${pre}Environment` as keyof FormData, "Environment & Lifestyle", "What kind of environment is this audience in?", 2)}
          {renderField(`${pre}Entertainment` as keyof FormData, "Entertainment", "What do they do for entertainment?", 1)}
          {renderField(`${pre}MoneyRelationship` as keyof FormData, "Relationship with Money", "What's their relationship with money?", 2)}
          {renderField(`${pre}DesiredState` as keyof FormData, "Desired State vs Current State", "Where do they want to be vs where they are now?", 3)}
          {renderField(`${pre}SecretDesires` as keyof FormData, "Secret Desires", "What do they secretly want most?", 2)}
          {renderField(`${pre}Communication` as keyof FormData, "Preferred Communication", "e.g. Telegram (casual), WhatsApp (work)", 1)}
          {renderField(`${pre}Mistakes` as keyof FormData, "Top 3 Mistakes They Are Making", "Common financial mistakes related to the problem you solve", 2)}
          {renderField(`${pre}Objections` as keyof FormData, "Common Objections", "What objections do they usually give?", 2)}
          {renderField(`${pre}GroupDescription` as keyof FormData, "How Else Would You Describe This Group?", "General traits, mindset, personality", 2)}
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-2">5 FEARS ABOUT WORKING WITH ADVISORS</p>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <Input
                  key={i}
                  value={(formData as any)[`${pre}AdvisorFear${i}`]}
                  onChange={(e) => updateFormData(`${pre}AdvisorFear${i}` as keyof FormData, e.target.value)}
                  placeholder={`Fear ${i}`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ============ RENDER ============

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Back */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/?tab=business')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Business Tools
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">F.A.D.S.</h1>
          <p className="text-xl text-muted-foreground mb-2">Financial Advisor Differentiation Stack</p>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            Build your unique personal brand. Define your purpose, understand your audience,
            and craft compelling messaging that sets you apart. Your completed profile generates
            a brand brief for content strategists and AI agents.
          </p>

          {/* Overall Progress */}
          <div className="mt-6 max-w-lg mx-auto">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Overall Progress</span>
              <span className={overallProgress === 100 ? "text-green-500 font-semibold" : ""}>{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {/* Per-section mini progress */}
          <div className="mt-4 max-w-lg mx-auto space-y-1">
            {Object.entries(TAB_FIELDS).map(([tabId, fields]) => (
              <SectionProgress key={tabId} label={TABS.find(t => t.id === tabId)?.label || tabId} fields={fields} formData={formData} />
            ))}
          </div>

          {/* Demo fill */}
          <div className="mt-6">
            <Button onClick={fillRandomAnswers} variant="outline" size="lg"
              className="bg-gradient-to-r from-accent/10 to-primary/10 hover:from-accent/20 hover:to-primary/20">
              <Lightbulb className="h-4 w-4 mr-2" /> Fill with Sample Answers
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} className="w-full">
          <div className="relative mb-8">
            <TabsList className="flex w-full overflow-x-auto sm:grid sm:grid-cols-7">
              {TABS.map((t) => {
                const Icon = t.icon;
                const pct = tabProgress[t.id] ?? 0;
                return (
                  <Link
                    key={t.id}
                    to={`${BASE_PATH}/${t.id}`}
                    className={`flex flex-col items-center gap-1 py-3 rounded-md px-3 text-sm font-medium transition-all relative shrink-0 min-w-[76px] sm:min-w-0 sm:shrink ${activeTab === t.id ? 'bg-background text-foreground shadow-sm' : ''}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] sm:text-xs">{t.label}</span>
                    {pct > 0 && pct < 100 && t.id !== "output" && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                    {pct === 100 && t.id !== "output" && (
                      <CheckCircle2 className="absolute top-1 right-1 h-3 w-3 text-green-500" />
                    )}
                  </Link>
                );
              })}
            </TabsList>
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent sm:hidden"
            />
          </div>

          {/* ===== PERSONALITY TAB ===== */}
          <TabsContent value="personality" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5" /> Personality & Identity</CardTitle>
                <CardDescription>Who you are shapes how you serve. This is the foundation of your personal brand.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Personality Style</Label>
                  <p className="text-xs text-muted-foreground mb-2">Which best describes how you naturally work with clients?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PERSONALITY_STYLES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => updateFormData("personalityStyle", s.value)}
                        className={`p-3 rounded-lg border text-left transition-all ${formData.personalityStyle === s.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                      >
                        <p className="font-medium text-sm">{s.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Core Values (Pick 3-5)</Label>
                  <p className="text-xs text-muted-foreground mb-2">What principles guide your advisory practice?</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {CORE_VALUES_OPTIONS.map(v => {
                      const selected = formData.coreValues.includes(v);
                      return (
                        <button
                          key={v}
                          onClick={() => {
                            const current = formData.coreValues ? formData.coreValues.split(", ").filter(Boolean) : [];
                            const next = selected ? current.filter(c => c !== v) : [...current, v];
                            updateFormData("coreValues", next.join(", "));
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border hover:border-primary/50'}`}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                  <Input value={formData.coreValues} onChange={e => updateFormData("coreValues", e.target.value)} placeholder="Or type your own values" />
                </div>

                {renderField("beliefs", "Core Beliefs About Money & Financial Planning", "What do you fundamentally believe about money, wealth, and financial security?")}
                {renderField("moneyPhilosophy", "Your Money Philosophy", "What is your personal relationship with money? How does it shape your advice?")}
              </CardContent>
            </Card>

            {/* Conviction builder */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg"><Trophy className="h-5 w-5 text-primary" /> Why This Matters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ConvictionCard icon={Star} title="Stand Out From 30,000+ Advisors in Singapore" text="Most advisors sell the same products. Your personality IS your differentiator. Clients buy from people they connect with." />
                <ConvictionCard icon={Shield} title="Build Trust Before The First Meeting" text="When your values, beliefs, and style are clear, prospects self-qualify. The right clients come to you." />
                <ConvictionCard icon={Zap} title="Fuel Your Content Strategy" text="Every answer here becomes content. Your beliefs become posts. Your values become brand pillars. Your story becomes your most powerful asset." />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== PURPOSE TAB ===== */}
          <TabsContent value="purpose" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5" /> Purpose & Mission</CardTitle>
                <CardDescription>Your origin story and driving force. This is what makes people remember you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderField("originStory", "Your Origin Story", "Why did you join this industry? What got you started? How did you feel? What was the turning point?\n\nExample: Used to be a F&B waiter, slogging 14 hours a day. Joined insurance for the money. Only earned $1k/month for first two years. Had to borrow from girlfriend for roadshows. One day received a gratitude text from a client and shifted focus to genuine impact.", 6)}
                {renderField("purpose", "Purpose Statement", "What personal experience or motivation led you to become a financial advisor?", 3)}
                <div>
                  <Label>Mission Statement</Label>
                  <p className="text-xs text-muted-foreground mb-2">Template: "I [ACTION] [TARGET AUDIENCE] to [OUTCOME]"</p>
                  <Textarea
                    value={formData.mission}
                    onChange={e => updateFormData("mission", e.target.value)}
                    placeholder='Example: "I empower working fathers to build passive income streams so they can spend more time with family"'
                    rows={2}
                  />
                </div>
                {renderField("vision", "Vision for Your Future", "Where do you see yourself and your practice in 5-10 years?", 3)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== EXPERIENCE TAB ===== */}
          <TabsContent value="experience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                  <CardDescription>Your professional journey and expertise</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Years in Industry</Label>
                    <Select value={formData.yearsInIndustry} onValueChange={v => updateFormData("yearsInIndustry", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["0-2", "3-5", "6-10", "11-15", "16+"].map(v => <SelectItem key={v} value={v}>{v} years</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {renderField("claimsCount", "Number of Claims Handled", "e.g. 12", 1)}
                  {renderField("memorableStories", "Most Memorable Client/Claim Story", "Share 1-2 impactful client success stories", 3)}
                  {renderField("investmentExperience", "Investment & Returns Experience", "Notable investment results or strategies", 2)}
                  {renderField("certifications", "Certifications & Achievements", "CFP, ChFC, CFA, etc.", 1)}
                  {renderField("companyTransitions", "Company/Agency Transitions", "Have you switched? Why or why not?", 2)}
                  {renderField("careerGoals", "Career Vision/Goal", "What is your long-term career goal?", 2)}
                  {renderField("careerInspiration", "What Inspired This Goal?", "What motivated you to have this vision?", 2)}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Personal Experience</CardTitle>
                  <CardDescription>Your background beyond financial services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderField("pastJobs", "Past Jobs/Industries", "e.g. Teaching, Engineering, F&B", 1)}
                  {renderField("education", "Highest Education", "Degree, school, notable achievements", 1)}
                  {renderField("schoolLife", "School Life & Grades", "How was your school experience?", 2)}
                  {renderField("activitiesEnjoy", "Activities You Enjoy", "What do you enjoy doing outside work?", 1)}
                  {renderField("activitiesDislike", "Activities You Don't Enjoy", "What don't you enjoy doing?", 1)}
                  {renderField("strengths", "Top 3 Strengths", "What are you naturally good at?", 2)}
                  {renderField("strengthsWhy", "Why These Strengths?", "Why did you put these as your top 3?", 2)}
                  {renderField("weaknesses", "Top 3 Areas for Growth", "What areas are you working to improve?", 2)}
                  {renderField("weaknessesWhy", "Why These Weaknesses?", "Why did you put these as your top 3?", 2)}
                  {renderField("personalGoals", "Personal Goals", "What drives you personally?", 2)}
                  {renderField("goalInspiration", "What Inspired This Dream?", "Where did this aspiration come from?", 2)}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Defining Moments</CardTitle>
                <CardDescription>Top 5 emotionally intense moments from the past 20 years that shaped your outlook</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5].map(i => renderField(`moment${i}` as keyof FormData, `Moment ${i}`, `Describe a key moment that impacted your outlook`, 2))}
                </div>
                {renderField("momentsWhy", "Why These Moments?", "Why did you list these as the most emotionally intense?", 3)}
                {renderField("momentsFeel", "How Did You Feel?", "What emotions did you experience during these moments?", 2)}
                {renderField("momentsMind", "What Was Going Through Your Mind?", "What thoughts were running through your head?", 2)}
                {renderField("momentsImpact", "How Did They Change You?", "How did these moments impact you as a person and change your outlook on life?", 3)}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== AUDIENCE TAB ===== */}
          <TabsContent value="audience" className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-semibold mb-2">Define Your Core Audiences</h3>
              <p className="text-muted-foreground text-sm">Deeply understand the two primary groups you serve best</p>
            </div>

            {/* Quick Start */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5" /> Quick Start Profiles</CardTitle>
                <CardDescription>Choose a common client profile to get started, then customize</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(CLIENT_PROFILES).map(([key, profile]) => (
                    <div key={key} className="border rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold text-sm">{profile.name}</h4>
                      <p className="text-xs text-muted-foreground">{profile.demographics}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => applyProfilePrefill(key as keyof typeof CLIENT_PROFILES, 1)} className="text-xs flex-1">
                          Fill #1
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => applyProfilePrefill(key as keyof typeof CLIENT_PROFILES, 2)} className="text-xs flex-1">
                          Fill #2
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderAudienceCard(1)}
              {renderAudienceCard(2)}
            </div>
          </TabsContent>

          {/* ===== SOLUTIONS TAB ===== */}
          <TabsContent value="solutions" className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-semibold mb-2">Problem to Solution Mapping</h3>
              <p className="text-muted-foreground text-sm">Map each audience's specific problems to YOUR unique solutions</p>
            </div>

            {/* Mindset shift */}
            <Card className="border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex gap-2">
                    <Target className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Don't sell products</p>
                      <p className="text-muted-foreground text-xs">Sell the TRANSFORMATION. Show the before and after.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Heart className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Tangible + Intangible</p>
                      <p className="text-muted-foreground text-xs">Products solve tangible problems. YOU solve the intangible ones (fear, confusion, overwhelm).</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Star className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Your Differentiator</p>
                      <p className="text-muted-foreground text-xs">What makes YOUR approach unique? This is what clients remember and refer.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Audience 1 Solutions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-primary">Solutions for Audience #1</CardTitle>
                  <CardDescription>
                    {formData.audience1Occupation ? `${formData.audience1Occupation} (${formData.audience1Age})` : "Define your primary audience first"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderField("audience1Problems", "Tangible Problems", "What specific, measurable problems does this audience face?\nExample: Working 60-70h weeks, no energy to review investments, $30-50k idle in low-yield accounts", 3)}
                  {renderField("audience1TangibleSolutions", "Tangible Solutions You Provide", "Concrete services, products, strategies you offer\nExample: Passive income roadmap; automate DCA; comprehensive protection audit", 3)}
                  {renderField("audience1IntangibleProblems", "Intangible Problems (Emotional Burdens)", "What emotional/psychological weight do they carry?\nExample: Anxiety about market drops, guilt about not being present for family", 3)}
                  {renderField("audience1IntangibleSolutions", "Intangible Solutions You Provide", "Peace of mind, confidence, clarity you deliver\nExample: Sleep-well portfolio design; weekly updates; on-call reassurance during volatility", 3)}

                  <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg border border-primary/10">
                    <Label htmlFor="audience1Differentiators" className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" /> Your Unique Differentiators
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">What makes YOUR approach different from every other advisor for this audience?</p>
                    <Textarea
                      id="audience1Differentiators"
                      value={formData.audience1Differentiators}
                      onChange={e => updateFormData("audience1Differentiators", e.target.value)}
                      placeholder="Example: Quarterly one-page plan with decision log, proactive check-ins after major life events (new baby, job change, market crash)"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Audience 2 Solutions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-500">Solutions for Audience #2</CardTitle>
                  <CardDescription>
                    {formData.audience2Occupation ? `${formData.audience2Occupation} (${formData.audience2Age})` : "Define your secondary audience first"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {renderField("audience2Problems", "Tangible Problems", "What specific, measurable problems does this audience face?\nExample: Low discipline, procrastination, competing priorities, no savings habit", 3)}
                  {renderField("audience2TangibleSolutions", "Tangible Solutions You Provide", "Concrete services, products, strategies you offer\nExample: Starter safety stack (ED fund + term/PA), $X/mo DCA", 3)}
                  {renderField("audience2IntangibleProblems", "Intangible Problems (Emotional Burdens)", "What emotional/psychological weight do they carry?\nExample: Social comparison pressure, fear of adulting, overwhelm", 3)}
                  {renderField("audience2IntangibleSolutions", "Intangible Solutions You Provide", "Peace of mind, confidence, clarity you deliver\nExample: Adulting roadmap, 1-1 coaching, bite-size learning content", 3)}

                  <div className="bg-gradient-to-r from-orange-500/5 to-transparent p-4 rounded-lg border border-orange-500/10">
                    <Label htmlFor="audience2Differentiators" className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-orange-500" /> Your Unique Differentiators
                    </Label>
                    <p className="text-xs text-muted-foreground mb-2">What makes YOUR approach different from every other advisor for this audience?</p>
                    <Textarea
                      id="audience2Differentiators"
                      value={formData.audience2Differentiators}
                      onChange={e => updateFormData("audience2Differentiators", e.target.value)}
                      placeholder="Example: 90-day setup program: budget autopilot, risk basics, starter portfolio with weekly check-ins"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ===== MESSAGING/DELIVERY TAB ===== */}
          <TabsContent value="messaging" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Choose Your Signature Framework</CardTitle>
                <CardDescription>Select a proven framework or create your own</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {Object.entries(FRAMEWORKS).map(([key, fw]) => (
                    <button
                      key={key}
                      onClick={() => applyFrameworkTemplate(key as keyof typeof FRAMEWORKS)}
                      className={`border rounded-lg p-4 text-left transition-all ${formData.selectedFramework === key ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                    >
                      <h4 className="font-semibold">{fw.name}</h4>
                      <p className="text-sm text-muted-foreground">{fw.description}</p>
                      <ul className="text-xs space-y-1 mt-2">
                        {fw.steps.map((step, i) => <li key={i}>* {step}</li>)}
                      </ul>
                    </button>
                  ))}
                </div>
                {renderField("customFramework", "Or Create Your Own Framework", "Name your own method: _._._._. Method", 1)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Delivery & Messaging</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Mission Statement</Label>
                  <p className="text-xs text-muted-foreground mb-2">Template: "I [ACTION] [TARGET AUDIENCE] to [OUTCOME]"</p>
                  <Textarea value={formData.missionStatement} onChange={e => updateFormData("missionStatement", e.target.value)}
                    placeholder='Example: "I empower working fathers to build passive income so they can spend more time with family"' rows={2} />
                </div>
                <div>
                  <Label>Process (How)</Label>
                  <p className="text-xs text-muted-foreground mb-2">Template: "I believe in [ACTION] [AUDIENCE] to [OUTCOME] by [PROCESS]"</p>
                  <Textarea value={formData.processStatement} onChange={e => updateFormData("processStatement", e.target.value)}
                    placeholder='Example: "...through safe investing strategies and simple, effective financial planning tools"' rows={2} />
                </div>
                <div>
                  <Label>End Result Statement</Label>
                  <p className="text-xs text-muted-foreground mb-2">Template: "I help [AUDIENCE] achieve [OUTCOME] through my [METHOD]"</p>
                  <Textarea value={formData.endResultStatement} onChange={e => updateFormData("endResultStatement", e.target.value)}
                    placeholder='Example: "I help busy working fathers achieve financial freedom through my F.A.T. Method"' rows={2} />
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Compliance Guidelines</h4>
                  <div className="text-sm space-y-2">
                    <p><span className="font-medium text-amber-700 dark:text-amber-300">Use:</span> <span className="text-amber-600 dark:text-amber-400">"historical," "illustrative," "estimated," "subject to market risk"</span></p>
                    <p><span className="font-medium text-amber-700 dark:text-amber-300">Avoid:</span> <span className="text-amber-600 dark:text-amber-400">"guaranteed," "risk-free," "will return," "beat the market"</span></p>
                    <p><span className="font-medium text-amber-700 dark:text-amber-300">Include:</span> <span className="text-amber-600 dark:text-amber-400">"This is not financial advice; suitability depends on your circumstances."</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== BRAND OUTPUT TAB — MARKETING KIT ===== */}
          <TabsContent value="output" className="space-y-8">
            <div className="text-center mb-2">
              <h3 className="text-2xl font-semibold mb-2">Your Marketing Kit</h3>
              <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
                Everything you've answered above gets turned into the actual assets you'll use:
                social bios, story posts, your first-appointment deck, and your 1-page leave-behind brochure.
                {overallProgress < 50 && " The more you fill in, the more specific each asset gets."}
              </p>
            </div>

            {/* Progress gate */}
            {overallProgress < 20 ? (
              <Card className="border-amber-500/20">
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-lg mb-2">Complete at least 20% to unlock your marketing kit</h4>
                  <p className="text-muted-foreground text-sm mb-4">Current progress: {overallProgress}%</p>
                  <Button onClick={() => { setActiveTab("personality"); navigate(`${BASE_PATH}/personality`); }}>
                    Start with Personality
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* ----- BRAND AT A GLANCE ----- */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" /> Brand at a Glance
                    </CardTitle>
                    <CardDescription>The five things every asset below pulls from</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.mission && (
                      <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
                        <p className="text-xs font-medium text-primary mb-1">MISSION</p>
                        <p className="font-semibold">{formData.mission}</p>
                      </div>
                    )}
                    {formData.endResultStatement && (
                      <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20">
                        <p className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">END RESULT</p>
                        <p className="font-semibold">{formData.endResultStatement}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.personalityStyle && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs font-medium text-muted-foreground">PERSONALITY</p>
                          <p className="text-sm font-medium">{PERSONALITY_STYLES.find(s => s.value === formData.personalityStyle)?.label}</p>
                        </div>
                      )}
                      {formData.coreValues && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs font-medium text-muted-foreground">VALUES</p>
                          <p className="text-sm font-medium">{formData.coreValues}</p>
                        </div>
                      )}
                      {formData.audience1Occupation && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs font-medium text-muted-foreground">AUDIENCE #1</p>
                          <p className="text-sm font-medium">{formData.audience1Occupation} ({formData.audience1Age})</p>
                        </div>
                      )}
                      {formData.audience2Occupation && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-xs font-medium text-muted-foreground">AUDIENCE #2</p>
                          <p className="text-sm font-medium">{formData.audience2Occupation} ({formData.audience2Age})</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* ----- SUBMIT TO MENTOR ----- */}
                <Card className={hasSubmitted ? "border-green-500/30 bg-green-500/5" : "border-primary/30"}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm flex items-center gap-2">
                          {hasSubmitted ? (
                            <><CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" /> Submitted to your mentor</>
                          ) : (
                            <><FileText className="h-4 w-4 text-primary" /> Submit this worksheet to your mentor</>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {hasSubmitted
                            ? "Your mentor can see this in the admin panel. You can re-submit anytime — every save creates a new version."
                            : "Sends your full brand brief to your mentor so they can review and give feedback."}
                        </p>
                      </div>
                      <Button
                        onClick={submitToMentor}
                        disabled={isSubmittingToMentor}
                        variant={hasSubmitted ? "outline" : "default"}
                        className="shrink-0"
                      >
                        {isSubmittingToMentor ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                        ) : hasSubmitted ? (
                          "Re-submit"
                        ) : (
                          "Submit to mentor"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* ----- LAYER 1 — PERSONAL BRANDING ASSET KIT ----- */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-xl font-semibold flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-primary" /> Personal Branding Asset Kit
                      </h4>
                      <p className="text-sm text-muted-foreground">10 ready-to-customise assets pulled from your answers above.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {buildMarketingAssets().map((a) => {
                      const Icon = a.icon;
                      const ready = a.missing.length === 0;
                      const polishKey = `asset:${a.id}`;
                      const polished = aiPolish[polishKey];
                      const isThisPolishing = polishingId === polishKey;
                      const displayBody = polished ?? a.body;
                      return (
                        <Card key={a.id} className={ready ? "border-primary/20" : "border-amber-500/20"}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg ${ready ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-600"} shrink-0`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <CardTitle className="text-base">{a.name}</CardTitle>
                                  <CardDescription className="text-xs mt-0.5">{a.channel}</CardDescription>
                                </div>
                              </div>
                              {polished ? (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">AI</span>
                              ) : ready ? (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 font-medium shrink-0">Ready</span>
                              ) : (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-medium shrink-0">{a.missing.length} gap{a.missing.length > 1 ? "s" : ""}</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">{a.description}</p>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {!ready && (
                              <div className="mb-3 p-2 rounded bg-amber-500/5 border border-amber-500/20 text-xs">
                                <p className="font-medium text-amber-700 dark:text-amber-300 mb-1">For a sharper draft, fill in:</p>
                                <ul className="text-amber-600 dark:text-amber-400 list-disc pl-4 space-y-0.5">
                                  {a.missing.map(m => <li key={m}>{String(m).replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase())}</li>)}
                                </ul>
                              </div>
                            )}
                            <details className="group">
                              <summary className="cursor-pointer text-xs font-medium text-primary hover:underline list-none flex items-center gap-1">
                                <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
                                {polished ? "Preview AI-polished draft" : "Preview draft"}
                              </summary>
                              <div className="mt-3 bg-muted/50 p-3 rounded text-xs whitespace-pre-wrap font-mono max-h-64 overflow-y-auto border">
                                {displayBody}
                              </div>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant={polished ? "outline" : "default"}
                                  onClick={() =>
                                    polishCollateral("asset", {
                                      id: a.id,
                                      name: a.name,
                                      channelOrPurpose: a.channel,
                                      draft: a.body,
                                    })
                                  }
                                  disabled={isThisPolishing}
                                  className="gap-1 h-7 text-xs"
                                >
                                  {isThisPolishing ? (
                                    <><Loader2 className="h-3 w-3 animate-spin" /> Polishing...</>
                                  ) : polished ? (
                                    <><Sparkles className="h-3 w-3" /> Re-polish</>
                                  ) : (
                                    <><Sparkles className="h-3 w-3" /> AI polish</>
                                  )}
                                </Button>
                                {polished && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setAiPolish((prev) => { const n = { ...prev }; delete n[polishKey]; return n; })}
                                    className="gap-1 h-7 text-xs"
                                  >
                                    Revert to template
                                  </Button>
                                )}
                                <Button size="sm" variant="outline" onClick={() => copyToClipboard(displayBody)} className="gap-1 h-7 text-xs">
                                  <Copy className="h-3 w-3" /> Copy
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => {
                                  const blob = new Blob([displayBody], { type: "text/plain" });
                                  const url = URL.createObjectURL(blob);
                                  const el = document.createElement("a");
                                  el.href = url; el.download = `${a.id}.txt`; el.click();
                                  URL.revokeObjectURL(url);
                                  toast.success(`Downloaded ${a.id}.txt`);
                                }} className="gap-1 h-7 text-xs">
                                  <Download className="h-3 w-3" /> Download
                                </Button>
                              </div>
                            </details>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* ----- LAYER 2 — FIRST-APPOINTMENT DECK ----- */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-xl font-semibold flex items-center gap-2">
                        <Presentation className="h-5 w-5 text-primary" /> First-Appointment Deck
                      </h4>
                      <p className="text-sm text-muted-foreground">7 slides to walk a prospect through in your first sit-down. Each slide auto-fills from your answers.</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {
                      const md = buildFirstApptDeck().map(s => [
                        `# Slide ${s.number} — ${s.title}`,
                        `> ${s.purpose}`,
                        ``,
                        aiPolish[`slide:${s.id}`] ?? s.body,
                        ``,
                        s.speakerNote ? `**Speaker note:** ${s.speakerNote}` : "",
                        ``,
                        `---`,
                        ``,
                      ].filter(Boolean).join("\n")).join("\n");
                      const blob = new Blob([md], { type: "text/markdown" });
                      const url = URL.createObjectURL(blob);
                      const el = document.createElement("a");
                      el.href = url; el.download = "first-appointment-deck.md"; el.click();
                      URL.revokeObjectURL(url);
                      toast.success("Downloaded first-appointment-deck.md");
                    }} className="gap-2 shrink-0">
                      <Download className="h-4 w-4" /> Download all slides (.md)
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {buildFirstApptDeck().map((s) => {
                      const Icon = s.icon;
                      const polishKey = `slide:${s.id}`;
                      const polished = aiPolish[polishKey];
                      const isThisPolishing = polishingId === polishKey;
                      const displayBody = polished ?? s.body;
                      return (
                        <Card key={s.id} className="overflow-hidden">
                          <details className="group">
                            <summary className="cursor-pointer list-none">
                              <div className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3 shrink-0">
                                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">{s.number}</span>
                                  <Icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm">{s.title}</p>
                                  <p className="text-xs text-muted-foreground truncate">{s.purpose}</p>
                                </div>
                                {polished && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">AI</span>}
                                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90 shrink-0" />
                              </div>
                            </summary>
                            <div className="px-4 pb-4 border-t bg-muted/20">
                              <div className="pt-3 space-y-3">
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{polished ? "AI-polished slide content" : "Slide content"}</p>
                                  <div className="bg-background p-3 rounded border whitespace-pre-wrap text-sm">{displayBody}</div>
                                </div>
                                {s.speakerNote && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Speaker note</p>
                                    <p className="text-xs italic text-muted-foreground bg-amber-500/5 border border-amber-500/20 p-2 rounded">{s.speakerNote}</p>
                                  </div>
                                )}
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    size="sm"
                                    variant={polished ? "outline" : "default"}
                                    onClick={() =>
                                      polishCollateral("slide", {
                                        id: s.id,
                                        name: s.title,
                                        channelOrPurpose: s.purpose,
                                        draft: s.body,
                                      })
                                    }
                                    disabled={isThisPolishing}
                                    className="gap-1 h-8 text-xs"
                                  >
                                    {isThisPolishing ? (
                                      <><Loader2 className="h-3 w-3 animate-spin" /> Polishing...</>
                                    ) : polished ? (
                                      <><Sparkles className="h-3 w-3" /> Re-polish</>
                                    ) : (
                                      <><Sparkles className="h-3 w-3" /> AI polish</>
                                    )}
                                  </Button>
                                  {polished && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setAiPolish((prev) => { const n = { ...prev }; delete n[polishKey]; return n; })}
                                      className="gap-1 h-8 text-xs"
                                    >
                                      Revert to template
                                    </Button>
                                  )}
                                  <Button size="sm" variant="outline" onClick={() => copyToClipboard(`${s.title}\n\n${displayBody}${s.speakerNote ? `\n\nSpeaker note: ${s.speakerNote}` : ""}`)} className="gap-2 h-8 text-xs">
                                    <Copy className="h-3 w-3" /> Copy slide content
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </details>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* ----- LAYER 3 — 1-PAGE BROCHURE ----- */}
                <BrochureBuilderCard
                  brandBrief={buildBrandBrief()}
                  formData={formData}
                  framework={formData.selectedFramework ? FRAMEWORKS[formData.selectedFramework as keyof typeof FRAMEWORKS] : null}
                />

                {/* ----- AI POLISH (existing) ----- */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" /> Polish Everything with AI
                    </CardTitle>
                    <CardDescription>Send your whole brand brief to an AI assistant for a polished narrative + content calendar.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={generateBrandTemplate} disabled={isGenerating} className="w-full" size="lg">
                      {isGenerating ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles className="h-4 w-4 mr-2" /> Generate Full Brand Template</>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* ----- ADVANCED — JSON for AI agents / strategists ----- */}
                <details className="group">
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-center gap-2 p-3 rounded border border-dashed text-sm text-muted-foreground hover:bg-muted/30 transition-colors">
                      <Code2 className="h-4 w-4" />
                      <span className="font-medium">Advanced: raw brand brief JSON</span>
                      <span className="text-xs">— for feeding into AI agents or your own content team</span>
                      <ChevronRight className="h-4 w-4 ml-auto transition-transform group-open:rotate-90" />
                    </div>
                  </summary>
                  <div className="mt-3">
                    <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto border">
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {JSON.stringify(buildBrandBrief(), null, 2)}
                      </pre>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(buildBrandBrief(), null, 2))} className="gap-2">
                        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Copied" : "Copy JSON"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        const blob = new Blob([JSON.stringify(buildBrandBrief(), null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url; a.download = "brand-brief.json"; a.click();
                        URL.revokeObjectURL(url);
                        toast.success("Downloaded brand-brief.json");
                      }} className="gap-2">
                        <Download className="h-4 w-4" /> Download JSON
                      </Button>
                    </div>
                  </div>
                </details>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button variant="outline" onClick={goToPrevTab} disabled={getTabIndex(activeTab) === 0}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {getTabIndex(activeTab) + 1} / {TABS.length}
          </span>
          <Button onClick={goToNextTab} disabled={getTabIndex(activeTab) === TABS.length - 1}>
            Next <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Brand Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-full sm:max-w-2xl md:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your Personal Brand Template</DialogTitle>
            <DialogDescription>Your comprehensive brand template based on your FADS responses.</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="bg-muted p-6 rounded-lg">
              <div className="whitespace-pre-wrap font-mono text-sm">{generatedTemplate}</div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => copyToClipboard(generatedTemplate)}>
                {copied ? "Copied" : "Copy to Clipboard"}
              </Button>
              <Button onClick={() => setShowTemplateModal(false)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
