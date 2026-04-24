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
import { ArrowLeft, ArrowRight, Download, User, Briefcase, Users, Target, MessageSquare, Lightbulb, BookOpen, Loader2, Sparkles, Copy, CheckCircle2, Trophy, Flame, Heart, Star, Shield, Zap } from "lucide-react";
import { toast } from "sonner";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { supabase } from "@/integrations/supabase/client";

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

  const [activeTab, setActiveTab] = useState(tab || "personality");
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState("");
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [copied, setCopied] = useState(false);
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
    } catch (e) {
      console.warn("FADS tool: failed to hydrate from localStorage", e);
    } finally {
      hasHydrated.current = true;
    }
  }, [storageKey]);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
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
          <TabsList className="grid w-full grid-cols-7 mb-8">
            {TABS.map((t) => {
              const Icon = t.icon;
              const pct = tabProgress[t.id] ?? 0;
              return (
                <Link
                  key={t.id}
                  to={`${BASE_PATH}/${t.id}`}
                  className={`flex flex-col items-center gap-1 py-3 rounded-md px-2 text-sm font-medium transition-all relative ${activeTab === t.id ? 'bg-background text-foreground shadow-sm' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] sm:text-xs hidden sm:block">{t.label}</span>
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

          {/* ===== BRAND OUTPUT TAB ===== */}
          <TabsContent value="output" className="space-y-6">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-semibold mb-2">Your Brand Output</h3>
              <p className="text-muted-foreground text-sm">
                Export your brand brief for content strategists, AI agents, or your own reference.
                {overallProgress < 50 && " Complete more sections above to get a richer output."}
              </p>
            </div>

            {/* Progress gate */}
            {overallProgress < 30 ? (
              <Card className="border-amber-500/20">
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-12 w-12 text-amber-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-lg mb-2">Complete at least 30% to unlock your brand output</h4>
                  <p className="text-muted-foreground text-sm mb-4">Current progress: {overallProgress}%</p>
                  <Button onClick={() => { setActiveTab("personality"); navigate(`${BASE_PATH}/personality`); }}>
                    Start with Personality
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Brand Brief Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" /> Brand Brief (for Content Strategists & AI Agents)
                    </CardTitle>
                    <CardDescription>Copy this JSON to feed into any content AI or share with your content team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {JSON.stringify(buildBrandBrief(), null, 2)}
                      </pre>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" onClick={() => copyToClipboard(JSON.stringify(buildBrandBrief(), null, 2))} className="gap-2">
                        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? "Copied" : "Copy JSON"}
                      </Button>
                      <Button variant="outline" onClick={() => {
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
                  </CardContent>
                </Card>

                {/* Human-readable summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Brand at a Glance</CardTitle>
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

                    {/* Content pillars from the brief */}
                    {formData.mission && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">SUGGESTED CONTENT PILLARS</p>
                        <div className="space-y-2">
                          {buildBrandBrief().contentDirections.pillars.map((p, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0">{i + 1}</span>
                              <span>{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Generate */}
                <Card>
                  <CardHeader>
                    <CardTitle>Generate Full Brand Template with AI</CardTitle>
                    <CardDescription>Create a comprehensive brand narrative, content calendar prompts, and social media strategy</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={generateBrandTemplate} disabled={isGenerating} className="w-full" size="lg">
                      {isGenerating ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles className="h-4 w-4 mr-2" /> Generate Brand Template</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
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
