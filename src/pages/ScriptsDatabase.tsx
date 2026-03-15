import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { toScriptSlug, resolveScriptSlug } from "@/lib/scriptSlug";
import { useIsMobile } from "@/hooks/use-mobile";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { markdownComponents } from "@/lib/markdown-config";
import { ScriptsChatWidget } from "@/components/scripts/ScriptsChatWidget";
import { ScriptEditorDialog } from "@/components/scripts/ScriptEditorDialog";
import { MinimalRichEditor } from "@/components/MinimalRichEditor";
import { KnowledgeManagement } from "@/components/scripts/KnowledgeManagement";
import { useScriptUserVersions } from "@/hooks/useScriptUserVersions";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Phone, MessageSquare, HelpCircle, Copy, Check, UserPlus, CalendarCheck, Lightbulb, Megaphone, Users, Plus, Pencil, Trash2, Loader2, Filter, X, Download, Image as ImageIcon, Search, Heart, Share2, Link2, History, RotateCcw, GripVertical, GitMerge } from "lucide-react";
import { useMergeScripts } from "@/hooks/useMergeScripts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from "@/components/ui/context-menu";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useScripts, useScriptsMutations } from "@/hooks/useScripts";
import { usePlaybooks } from "@/hooks/usePlaybooks";
import { supabase } from "@/integrations/supabase/client";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import type { ScriptEntry, ScriptVersion, ScriptAttachment } from "@/hooks/useScripts";
import { useScriptFavourites } from "@/hooks/useScriptFavourites";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ObjectionHandlingDatabase } from "@/components/scripts/ObjectionHandlingDatabase";
import { ScriptsTabBar } from "@/components/scripts/ScriptsTabBar";

type CategoryKey = "cold-calling" | "initial-text" | "post-call-text" | "callback" | "follow-up" | "ad-campaign" | "referral" | "confirmation" | "faq" | "fact-finding" | "tips" | "servicing" | "sales-scripts";

const categoryLabels: Record<string, { label: string; icon: typeof Phone; color: string }> = {
  "cold-calling": { label: "Cold Calling", icon: Phone, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  "initial-text": { label: "Initial Texts", icon: MessageSquare, color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300" },
  "post-call-text": { label: "Post-Call Texts", icon: MessageSquare, color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" },
  "callback": { label: "Callback Scripts", icon: Phone, color: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300" },
  "follow-up": { label: "Follow-Up Messages", icon: MessageSquare, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  "ad-campaign": { label: "Ad Campaign / Lead Gen", icon: Megaphone, color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  "referral": { label: "Referral Scripts", icon: UserPlus, color: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300" },
  "confirmation": { label: "Appointment Confirmation", icon: CalendarCheck, color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300" },
  "faq": { label: "FAQ", icon: HelpCircle, color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  "fact-finding": { label: "Fact Finding", icon: Search, color: "bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300" },
  "tips": { label: "Tips & Best Practices", icon: Lightbulb, color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  "servicing": { label: "Servicing", icon: Users, color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
  "sales-scripts": { label: "Sales Scripts", icon: MessageSquare, color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300" },
};

function getCategoryInfo(key: string) {
  return categoryLabels[key] ?? {
    label: key.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
    icon: HelpCircle,
    color: "bg-muted text-muted-foreground",
  };
}

// Sub-type labels for Follow-Up grouping
const followUpSubTypeLabels: Record<string, { label: string; icon: string; description: string }> = {
  "initial-text": { label: "Initial Contact", icon: "📨", description: "First texts after lead opt-in" },
  "post-call": { label: "Post-Call Texts", icon: "📲", description: "Messages sent after a phone call" },
  "callback": { label: "Callback Scripts", icon: "📞", description: "Actual phone call scripts" },
  "reminder-sequence": { label: "Reminder Sequences", icon: "🔔", description: "Drip / nudge follow-ups" },
  "post-meeting": { label: "Post-Meeting", icon: "🤝", description: "After consultation resources & referrals" },
  "closing": { label: "Closing Scripts", icon: "🎯", description: "End-of-funnel & rescheduling" },
  "other": { label: "Other Follow-Ups", icon: "💬", description: "General follow-up messages" },
};

// Standard audience sort order
const audienceSortOrder: Record<string, number> = {
  "warm-market": 1,
  "nsf": 2,
  "young-adult": 3,
  "working-adult": 4,
  "pre-retiree": 5,
  "parent": 6,
  "cold-lead": 7,
  "recruitment": 8,
  "general": 9,
  "hnw": 10,
  "referral": 11,
  "clients": 12,
};

const audienceLabels: Record<string, string> = {
  "warm-market": "Warm Market / Friends & Family",
  general: "General",
  "young-adult": "Young Adults",
  nsf: "NSF / NS",
  "working-adult": "Working Adults",
  parent: "Parents",
  "pre-retiree": "Pre-Retirees (50-65)",
  hnw: "High Net Worth",
  referral: "Referrals",
  "cold-lead": "Cold Leads",
  recruitment: "Recruitment",
  clients: "Clients",
};

const roleLabels: Record<string, string> = {
  consultant: "Consultant",
  va: "VA",
  telemarketer: "Telemarketer",
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
    id: "cold-calling-fb-voucher-retiree",
    stage: "Cold Calling — Facebook Voucher Ad Opt-In (Pre-Retirees)",
    category: "cold-calling",
    target_audience: "pre-retiree",
    versions: [
      { author: "Golden Year Partners — Voucher Lead V1", content: "## 📞 Cold Calling Script — FB Voucher Leads (Pre-Retirees)\n\n### 🎥 Loom Walkthrough\n\n[▶️ Watch the Loom video](https://www.loom.com/share/9f8aa0fb23b64ed78e30986a4f31619b)\n\n---\n\n### Opening\n\n> Hi, is this **[Name]**?\n>\n> I'm **[Your Name]**, a Retirement Specialist from **Golden Year Partners**. This is a courtesy call to inform you that we have received your interest in redeeming some **[voucher name]** vouchers recently!\n\n---\n\n### Value Proposition\n\n> So I'll just keep this call short — I'm a retirement specialist and I help many people around your age to **retire earlier and faster**, by:\n>\n> ✅ Increasing your **passive income streams**\n> ✅ Reducing your **expenses**\n>\n> We specialise in helping Singaporeans create a **simple and secure passive income**, and discover ways to supplement their **CPF and other assets**, ensuring they're on track to meet their retirement goals.\n\n---\n\n### Policy Optimisation\n\n> And I believe you should have purchased many policies over the years, but these policies may not be effective for your retirement needs.\n>\n> So, we can help you **optimise some of them** and use these resources to create **additional streams of passive income**.\n\n---\n\n### Soft Close\n\n> The **worst case** is that this is an info session to get more clarity and insights about your situation — and the **best case** is that we can do something to actually **improve your situation**.\n>\n> Would sometime **this or next weekend** work better for you for a meetup/Zoom?\n\n---\n\n### Objection Handling\n\n| Objection | Response |\n|---|---|\n| **\"No time\"** | Perhaps we can have a chat over a phone call — would **[date/time]** work to run through this with you? |\n| **\"Not sure of schedule\"** | Can I set a tentative timing, perhaps at **[date/time]** to run through? Just to check — where is your nearest MRT? |\n\n---\n\n### Booking Confirmation\n\n> Alright, for now I'll tentatively place it on **[date/time]** at **[nearest mall/café]**, to run through your retirement planning.\n>\n> So just one last thing — this session is just for you to learn more about growing a **simple and secure passive income**, and as long as you learn something, then that's good enough!\n\n---\n\n### If Asked \"What's This About?\"\n\n> It's a **retirement planning consultation**. You can also read more here if needed:\n>\n> 🔗 https://consult.goldenyearpartners.com/" },
      { author: "Golden Year Partners — Voucher Lead V2 (Shoe Analogy)", content: "## 📞 Cold Calling Script V2 — FB Voucher Leads (Pre-Retirees)\n\n---\n\n### Opening\n\n> Hi, is this **[Name]**?\n>\n> I'm **[Your Name]**, a Retirement Specialist from **Golden Year Partners**. This is a courtesy call to inform you that we have received your interest in redeeming some **[voucher name]** vouchers recently! Is it a convenient time to speak now?\n\n---\n\n### Quick Intro\n\n> Maybe I'll just do a quick intro of myself — basically I work with many people around your age, to help them **increase their streams of passive income** during retirement, and also **reduce unnecessary expenses**.\n\n---\n\n### Relatable Example — Old Policies\n\n> For example, you might be paying for a lot of **old insurance policies** that you don't need, and some of these medical plans will get **more and more expensive** as you get older.\n>\n> So rather than paying thousands of dollars to the insurance company, we can **convert these expenses into assets**, and keep the money for yourself and your family.\n\n---\n\n### The Shoe Analogy\n\n> So it's like buying a shoe — before you actually purchase, you have to see for yourself first, window shop a bit first. So what we can do is to **share with you all the options**, before you make a decision.\n\n---\n\n### Soft Close\n\n> So **worst case**, it's just an info-sharing session, and **best case** is that we actually help you improve your situation — and you get the voucher as well.\n>\n> So, around where is your **nearest MRT**?\n>\n> *(→ Set a time tentatively)*\n\n---\n\n### Objection Handling\n\n| Objection | Response |\n|---|---|\n| **\"No time\"** | Perhaps we can have a chat over a phone call — would **[date/time]** work to run through this with you? |\n| **\"Not sure of schedule\"** | Can I set a tentative timing, perhaps at **[date/time]**? Just to check — where is your nearest MRT? |\n\n---\n\n### Booking Confirmation\n\n> Alright, for now I'll tentatively place it on **[date/time]** at **[nearest mall/café]**, to run through your retirement planning.\n>\n> So just one last thing — this session is just for you to learn more about growing a **simple and secure passive income**, and as long as you learn something, then that's good enough!\n\n---\n\n### If Asked \"What's This About?\"\n\n> It's a **retirement planning consultation**. You can also read more here:\n>\n> 🔗 https://consult.goldenyearpartners.com/" },
    ],
    sort_order: 3.5,
  },
  {
    id: "cold-calling-qualified-retiree",
    stage: "Cold Calling — Qualified Lead, Non-Voucher (Pre-Retirees)",
    category: "cold-calling",
    target_audience: "pre-retiree",
    versions: [
      { author: "Golden Year Partners — Qualified Lead + Custom Report", content: "## 📞 Cold Calling Script — Qualified Pre-Retiree Lead (Non-Voucher)\n\n*For more qualified leads who opted in for retirement planning resources (not voucher campaigns)*\n\n---\n\n### Opening\n\n> Hi, is this **[Name]**?\n>\n> I'm **[Your Name]**, from **Golden Year Partners**. This is a courtesy call to inform you that we have received your interest in our **retirement planning resources** recently.\n\n---\n\n### Value Proposition\n\n> What we do is that we specialise in helping Singaporeans and pre-retirees create a **simple and secure passive income**, and discover ways to **maximize their CPF and other assets**, ensuring that they're on track to meet their retirement goals.\n\n---\n\n### Soft Close\n\n> Would you be opposed to exploring how we can help you create a **personalised plan**? After the session, we will send over a **customised retirement report**.\n>\n> Would sometime **this or next weekend** work better for you?\n\n---\n\n### Objection Handling\n\n| Objection | Response |\n|---|---|\n| **\"No time\"** | Perhaps we can have a chat over a phone call — would **[date/time]** work to run through this with you? |\n| **\"Not sure of schedule\"** | Can I set a tentative timing, perhaps at **[date/time]**? Just to check — where is your nearest MRT? |\n\n---\n\n### Booking Confirmation\n\n> Alright, for now I'll tentatively place it on **[date/time]** at **[nearest mall/café]**, to run through your retirement planning.\n>\n> So just one last thing — this session is just for you to learn more about growing a **simple and secure passive income**, and as long as you learn something, then that's good enough!\n\n---\n\n### If Asked \"What's This About?\"\n\n> It's a **retirement planning consultation** — we will share more details in the WhatsApp. You can also read more here:\n>\n> 🔗 https://consult.goldenyearpartners.com/" },
    ],
    sort_order: 3.7,
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
    id: "faq-what-is-moneybees",
    stage: "What type of business is The Moneybees Academy?",
    category: "faq",
    target_audience: "general",
    versions: [
      { author: "Standard Answer", content: "**Q: What type of business is The Moneybees Academy? What does it do?**\n\n**A:** Moneybees Academy offers targeted financial education through courses and workshops on personal finance, investment strategies, and budgeting.\n\nOur goal is to boost financial literacy, empowering individuals and businesses to make informed decisions and achieve their financial objectives." },
    ],
    sort_order: 20.5,
  },
  {
    id: "faq-course-content",
    stage: "What's this course about?",
    category: "faq",
    target_audience: "general",
    versions: [
      { author: "Standard Answer", content: "**Q: What's this course about?**\n\n**A:** This is a non-exhaustive list of what the financial planning course covers:\n\n📌 **Budgeting** — Money and risk management fundamentals\n\n📈 **Investing** — How to pick stocks, unit trust investing, value investing\n\n🏠 **Housing** — Fundamentals about purchasing your first home in Singapore\n\n🎯 **Planning for Major Life Stages** — Critical illness, marriage, starting a family, and big-ticket purchases\n\nOf course, there are more sections and educational content to be unlocked, but the list above is just a small teaser into the value you will be getting from the course!" },
    ],
    sort_order: 20.6,
  },
  {
    id: "faq-is-it-free",
    stage: "Is this really free?",
    category: "faq",
    target_audience: "general",
    versions: [
      { author: "Standard Answer", content: "**Q: Is this really free? What's the catch?**\n\n**A:** Yes, it's 100% free! There's no catch and no obligation at all. We genuinely believe in empowering young adults with financial knowledge early on.\n\nThe free 20-minute Zoom consultation and access to our financial planning course are part of our mission to raise financial literacy among youths in Singapore. We've been doing this for over 10 years and have helped thousands of young adults get started on their financial journey.\n\nAll we ask is that you come with an open mind and a willingness to learn 😊" },
    ],
    sort_order: 20.7,
  },
  {
    id: "faq-how-long-course",
    stage: "How long is the course?",
    category: "faq",
    target_audience: "general",
    versions: [
      { author: "Standard Answer", content: "**Q: How long is the course?**\n\n**A:** The course is entirely **self-paced** — you can go through it at your own speed, whenever it's convenient for you.\n\nThe initial Zoom consultation is just **20–30 minutes**, where we'll walk you through the key highlights and personalise the content to your situation.\n\nAfter that, you'll have **unlimited access** to the full course on our Skool community platform, which includes hours of materials covering budgeting, investing, housing, and more. Most people complete it within a few weeks, but there's no deadline!" },
    ],
    sort_order: 20.8,
  },
  {
    id: "faq-do-i-need-money",
    stage: "Do I need a lot of money to start?",
    category: "faq",
    target_audience: "general",
    versions: [
      { author: "Standard Answer", content: "**Q: Do I need a lot of money to start investing or benefit from this?**\n\n**A:** Not at all! That's actually one of the biggest misconceptions we address in the course.\n\nMany of the strategies we teach are designed for people who are **just starting out** — whether you're a student, serving NS, or in your first job. You can begin with as little as **$100/month**.\n\nThe earlier you start, even with small amounts, the more powerful **compound interest** works in your favour. That's exactly why we focus on young adults — time is your biggest asset! 💪" },
    ],
    sort_order: 20.9,
  },
  {
    id: "faq-why-zoom",
    stage: "Why do I need a Zoom call? Can't I just take the course?",
    category: "faq",
    target_audience: "general",
    versions: [
      { author: "Standard Answer", content: "**Q: Why do I need a Zoom call? Can't I just take the course on my own?**\n\n**A:** Great question! The Zoom session is actually what makes this programme so much more valuable than just a regular online course.\n\nDuring the call, we'll:\n\n✅ Do a quick **financial health check** based on your current situation\n✅ **Personalise** the course content to your specific goals and life stage\n✅ Answer any questions you have about savings, investing, or financial planning\n\nThink of it as a **free consultation** with a financial planning professional — something that normally costs money elsewhere. The course on its own is great, but the Zoom session helps you apply it to *your* life specifically 😊" },
    ],
    sort_order: 21.0,
  },
  {
    id: "faq-are-you-selling",
    stage: "Are you going to sell me something?",
    category: "faq",
    target_audience: "general",
    versions: [
      { author: "Standard Answer", content: "**Q: Are you going to try to sell me insurance or something?**\n\n**A:** We totally understand the concern — and no, this isn't a sales pitch.\n\nOur primary goal is **education**. The Zoom session is a genuine financial literacy consultation where we help you understand your current financial position and what steps you can take.\n\nWe're a financial education platform first and foremost. If after the session you'd like to explore specific financial products, that's entirely up to you — but there's **zero pressure or obligation** to buy anything. Many of our participants just take the course, learn something new, and that's perfectly fine with us! 🙏" },
    ],
    sort_order: 21.1,
  },
  {
    id: "cold-calling-recruitment",
    stage: "Cold Calling — Recruitment (Telemarketer Script)",
    category: "cold-calling",
    target_audience: "recruitment",
    versions: [
      { author: "Catalyst Recruitment Script", content: "## 📞 Cold Calling Script — Recruitment\n\n**Opening:**\n\n> Hi, is this _____?\n>\n> Hello _____, my name is ____, I'm a recruitment officer from Catalyst Recruitment. I understand that you may be looking out for career or internship opportunities at the moment?\n\n*(If not looking, ask: \"How about opportunities in the future?\")*\n\n---\n\n**Fact-Finding:**\n\n> Are you currently studying at uni or working?\n\n*(Find out: what they're studying, which school, which year, or where they're working now)*\n\n---\n\n**The Pitch:**\n\n> Alright, I'll keep this call short. I'm calling because currently we have some job and internship opportunities for young adults that are **flexible and also work from home!**\n\n*(If already working: \"It's suitable for mid-career switchers also.\")*\n\n---\n\n**Booking the Interview:**\n\n> So if you're keen to find out more, we are currently conducting **group interviews**. Will either **Thursday 5:30pm**, **Friday 2pm**, or **Saturday 10am** work for you?\n>\n> There will be a total of 3 rounds of interviews, so this will just be the first round and it will take 30 mins.\n\n⚠️ *Always give them a choice of Yes or Yes — don't ask open-ended questions.*\n\n---\n\n**If they're unsure of their schedule:**\n\n> No worries! How about we tentatively set a time first on **[date and time]** — if you have any changes, you can update us on WhatsApp.\n>\n> So would **Thursday 5:30pm** work better for you?\n\n*(If they genuinely can't commit: \"No worries, we will call you back next time.\")*\n\n> How about **Friday 2pm** or **Saturday 10am**?\n\n*(Prompt one more time if no)*\n\n---\n\n**After agreeing on a time:**\n\n> Alright! What will happen next is that I'll drop you a **WhatsApp text**, and from there do acknowledge me through WhatsApp, OK?\n>\n> *(Pause 1 second)*\n>\n> And do make sure to come for this session where time slots are specially allocated for you — most uni students do find it beneficial for them after they have attended!\n>\n> Alright then, see you this coming **[date and time]**! 👋" },
    ],
    sort_order: 5.5,
  },
  {
    id: "faq-recruitment-objections",
    stage: "Objection Handling — Recruitment (Telemarketer)",
    category: "faq",
    target_audience: "recruitment",
    versions: [
      { author: "Catalyst Recruitment — All Objections", content: "## 🛡️ Recruitment Objection Handling\n\n**Available timings:** Thursday 5:30pm, Friday 2pm, or Saturday 10am\n\n---\n\n### 1️⃣ \"Not interested\"\n\n> I understand, but I think there's no harm going for the group interview, just to find out more! There are actually a total of 4 rounds of interviews, so the first round is just a briefing.\n>\n> Don't worry, it's just a short Zoom session to help you understand more about internship opportunities as well as your career options — and it's just a 20-min session out of your 24 hours a day.\n>\n> So would **[date and time]** work for you?\n\n---\n\n### 2️⃣ \"Is this compulsory?\"\n\n> No, however most young adults who have already attended this session found it to be very beneficial right after they attended. So it will be beneficial for you to attend now that you have finished NS.\n>\n> We can set a tentative date on say **[date and time]** — which is more convenient for you? Do try to attend as time slots are specially allocated for you.\n\n---\n\n### 3️⃣ \"What is the session about?\"\n\n> This would be a group briefing for you to learn more about the various job opportunities we currently have.\n>\n> So would **[date and time]** work better for you?\n\n---\n\n### 4️⃣ \"Is this a sharing session? 1:1? Do you have a link?\"\n\n> Yes, this will be a group session — it'll be quite an interactive session to go through some of the potential career options for you, of which many other young adults have found it to be really beneficial for them.\n>\n> So would **[date and time]** work better for you?\n\n---\n\n### 5️⃣ \"How did you get my number?\"\n\n> I'm not sure as it's in my system, but you might have placed your details on one of the job portals.\n\n---\n\n### 6️⃣ \"Which organisation are you calling from?\"\n\n> I'm actually calling from Catalyst Recruitment — we are a recruitment agency.\n\n---\n\n### 7️⃣ \"What is your name? I want to complain.\"\n\n⚠️ *At most give your first name. Do NOT give your contact or mobile number.*\n\n> Hi, my name is [First Name]. I understand your frustration, however this is just a service call to check if you are keen to understand how to better explore your internship and career options. I apologise for the inconvenience caused, if any.\n\n*Then **HANG UP** — the more you talk, the more they will try to find trouble.*" },
    ],
    sort_order: 5.6,
  },
  {
    id: "fb-ads-recruitment-masterclass",
    stage: "Facebook Ads Texting — Recruitment (Masterclass/Webinar)",
    category: "cold-calling",
    target_audience: "recruitment",
    versions: [
      { author: "FINternship Masterclass Script", content: "## 📱 Facebook Ads Texting Script — Masterclass/Webinar\n\n### Opening\n\n> Hi, is this **[First Name]**?\n>\n> Hi [First Name], I'm **[Your Name]** and have recently received your interest in our **Financial IQ Masterclass** to learn how you can earn $10k/month. Can I check if I got the right person?\n\n---\n\n### If Yes — Invite to Masterclass\n\n> Okay great! Our next Financial IQ Masterclass will be happening next month on the **21st of June**. Would you be keen/free to attend?\n\n---\n\n### ✅ If They Say YES\n\n> Great! I will send you our reservation link in a bit. Once you have registered, do drop me a text.\n>\n> Do take note that we also have an introduction course over Zoom on **Wednesdays 7pm**, **Fridays 2pm**, and **Saturdays 10am**. Do let me know if you'd be able to attend!\n\n**Send as text:**\n\n> Hi [Name], do go ahead to register here:\n>\n> 🔗 https://tinyurl.com/finternshipeventbrite\n>\n> Do let me know once it's done. The tickets are **fully refundable upon attendance**.\n>\n> 📅 **Date:** 21st June (Saturday)\n>\n> 🕜 **Time:** 1:30 PM (Registration starts)\n>\n> 📍 **Venue:** Singapore Shopping Centre, #02-20A, S239924\n>\n> 👉 Beside Dhoby Ghaut MRT — opposite The Cathay\n>\n> 👕 **Dress Code:** Smart Casual (no shorts)\n>\n> Just reply **\"YES\"** so I can send over important event info and reminders leading up to the masterclass.\n>\n> Best regards,\n>\n> **[Your Name]**\n>\n> FINternship\n\n---\n\n### ❌ If They Say NO\n\n> Okay no worries! We have alternatives — Zoom sessions available weekly on **Wednesdays at 7pm**, **Fridays at 2pm**, and **Saturdays at 10am**.\n>\n> I'll drop you the information via text. Do let me know which slot would be most convenient for you!\n\n---\n\n### 🔄 If Lead Isn't Qualified — Send After the Call\n\n> Hey [Name],\n>\n> No worries if you can't make it! Before our masterclass, we will conduct a **personalised Zoom financial strategy session** with our consultant **[Name]**, who has experience speaking to hundreds of young adults.\n>\n> This is what you will be getting:\n>\n> 🔥 Access to hours of materials from the world's best minds in our community\n>\n> 🧠 Learn the money language schools never teach\n>\n> 🌟 Strategies to fast-track your wealth, passively\n>\n> 📚 Bonus resources to kickstart your journey to earn your first **$200K pot of gold** a decade earlier than the rest\n>\n> Some bonus resources after the session!\n>\n> *[Insert the books]*\n>\n> I've scheduled your session for **[Confirmed Date & Time A]**, or **[Confirmed Date & Time B]** — will any of these timings work for you?\n>\n> Do reply **\"A\"** or **\"B\"** to indicate which time you prefer.\n\n⚠️ *Same SOP as before — remind 3 days before, 1 day before, and on the day itself.*\n\n---\n\n### ❓ \"What's it about?\"\n\n> This will be a powerful session designed to shift your mindset and results in 2025. Here's what you'll gain:\n>\n> 🌟 Strategies to fast-track your wealth, passively\n>\n> 🔥 Fast-track yourself to **$10K/month in 2025** — even from zero\n>\n> 🧠 Learn the money language schools never teach\n>\n> 🔥 Access to hours of materials from the world's best minds in our community\n>\n> 📅 **Date:** 21st June (Saturday)\n>\n> 🕜 **Time:** 1:30 PM (Registration starts)\n>\n> 📍 **Venue:** Singapore Shopping Centre, #02-20A, S239924\n>\n> 👉 Beside Dhoby Ghaut MRT — opposite The Cathay\n>\n> 👕 **Dress Code:** Smart Casual (no shorts)" },
      { author: "Germin Template — Webinar Sign-Up", content: "## 📱 Facebook Ads Texting — Germin Template\n\n### Opening\n\n> Hi, is this **[First Name]**?\n>\n> Hi [First Name], I'm **NAME** and have recently received your interest in our **Financial IQ Masterclass** to learn how you can earn $10k/month. Can I check if I got the right person?\n>\n> Yes!\n>\n> Okay great! Our next Financial IQ Masterclass will be happening next month on the **21st of June**. Would you be keen/free to attend?\n\n---\n\n### ✅ If YES\n\n> Great! I will send you our reservation link in a bit. Once you have registered, do drop me a text.\n>\n> Do take note that we also have an introduction course over Zoom on **Wednesdays 7pm**, **Fridays at 2pm**, and **Saturdays at 10am**. Do let me know if you'd be able to attend!\n\n**Send as text:**\n\n> Hi [Name], do go ahead to register here:\n>\n> 🔗 https://tinyurl.com/finternshipeventbrite\n>\n> Do let me know once it's done. The tickets are **fully refundable upon attendance**.\n>\n> 📅 **Date:** 21st June (Saturday)\n>\n> 🕜 **Time:** 1:30 PM (Registration starts)\n>\n> 📍 **Venue:** Singapore Shopping Centre, #02-20A, S239924\n>\n> 👉 Beside Dhoby Ghaut MRT — opposite The Cathay\n>\n> 👕 **Dress Code:** Smart Casual (no shorts)\n>\n> Just reply **\"YES\"** so I can send over important event info and reminders leading up to the masterclass.\n>\n> Best regards,\n>\n> **Germin**\n>\n> FINternship\n\n---\n\n### ❌ If NO\n\n> Okay no worries! We have alternatives for Zoom sessions available weekly on **Wednesdays at 7pm**, **Fridays at 2pm**, and **Saturdays at 10am**.\n>\n> I'll drop you the information via text. Do let me know which slot would be most convenient for you!\n\n---\n\n### 🔄 If Lead Isn't Qualified — Send After the Call\n\n> Hey **[Name]**,\n>\n> No worries if you can't make it! Before our masterclass, we will conduct a **personalised Zoom financial strategy session** with our consultant **[Name]**, who has experience speaking to hundreds of young adults.\n>\n> This is what you will be getting:\n>\n> 🔥 Access to hours of materials from the world's best minds in our community\n>\n> 🧠 Learn the money language schools never teach\n>\n> 🌟 Strategies to fast-track your wealth, passively\n>\n> 📚 Bonus resources to kickstart your journey to earn your first **$200K pot of gold** a decade earlier than the rest\n>\n> Some bonus resources after the session!\n>\n> *[Insert the books]*\n>\n> I've scheduled your session for **[Confirmed Date & Time A]**, or **[Confirmed Date & Time B]** — will any of these timings work for you?\n>\n> Do reply **\"A\"** or **\"B\"** to indicate which time you prefer.\n\n⚠️ *Same SOP as before — remind 3 days before, 1 day before, and on the day itself.*\n\n---\n\n### ❓ \"What's it about?\"\n\n> This will be a powerful session designed to shift your mindset and results in 2025. Here's what you'll gain:\n>\n> 🌟 Strategies to fast-track your wealth, passively\n>\n> 🔥 Fast-track yourself to **$10K/month in 2025** — even from zero\n>\n> 🧠 Learn the money language schools never teach\n>\n> 🔥 Access to hours of materials from the world's best minds in our community\n>\n> 📅 **Date:** 21st June (Saturday)\n>\n> 🕜 **Time:** 1:30 PM (Registration starts)\n>\n> 📍 **Venue:** Singapore Shopping Centre, #02-20A, S239924\n>\n> 👉 Beside Dhoby Ghaut MRT — opposite The Cathay\n>\n> 👕 **Dress Code:** Smart Casual (no shorts)" },
    ],
    sort_order: 5.7,
  },
  {
    id: "follow-up-recruitment-post-call",
    stage: "Post-Call Text — Recruitment Leads",
    category: "follow-up",
    target_audience: "recruitment",
    versions: [
      { author: "FINternship Post-Call Text", content: "## 📲 Post-Call Text — Recruitment Leads\n\n> Hey, is this **[Name]**? I think my assistant gave you a call just now. We are currently opening a new batch of applicants for our **financial internship and course**.\n>\n> Here are the details of it:\n>\n> 🔗 https://masterclass.finternship.com/apply\n>\n> Anyway, you should be quite young also right? I mostly speak to young adults about **self-improvement, entrepreneurship, and personal finance**.\n>\n> People who sign up are usually pretty motivated to learn about **financial literacy**, learning a **high-income skill**, or **entrepreneurship**. We only have a few slots left as registration will be closing soon.\n>\n> Will give you a call later at **5pm** to go through an overview of the program.\n\n---\n\n### 📎 Attach These Flyers\n\n![FINternship Masterclass Flyer](/scripts/finternship-masterclass.png)\n\n![Build Your Financial Sandwich](/scripts/financial-sandwich.png)\n\n![Build a Future That Pays You Back](/scripts/future-pays-back.png)\n\n![Earn While They Learn](/scripts/earn-while-learn.png)\n\n![Your Signature Could Be Here](/scripts/signature-cheque.png)\n\n![From Netflix to Net Worth](/scripts/netflix-to-networth.png)" },
    ],
    sort_order: 5.8,
  },
  {
    id: "follow-up-recruitment-reminder",
    stage: "Follow-Up Reminder Texts — Recruitment Leads",
    category: "follow-up",
    target_audience: "recruitment",
    versions: [
      { author: "1st Follow-Up (Day 2)", content: "## 📩 1st Follow-Up Text — Recruitment Leads\n\n⏰ **Send:** Day 2 after initial contact\n\n> Hey **[Name]**,\n>\n> I hope you're doing well! I completely understand that things can get busy, so I just wanted to follow up on my previous message.\n>\n> I'm really passionate about helping young adults like yourself gain financial knowledge, especially when it comes to important topics like **early retirement, savings, and investments**. I believe financial literacy is key to setting yourself up for success.\n>\n> I'd love to invite you to a quick interview-style meeting on Zoom next week, where we can dive into these topics. How does **Saturday at 11am or 2pm**, or **Sunday at 2pm** sound for a 20-minute chat? During our session, I'll also pass along a **free financial planning course** that I think you'll find really valuable.\n>\n> Looking forward to connecting with you soon!\n\n---\n\n⚠️ **SOP:** 1 follow-up every 2 days. After 2 follow-up texts with no reply → mark as **\"texting but no reply\"** in CRM." },
      { author: "2nd Follow-Up (Day 4)", content: "## 📩 2nd Follow-Up Text — Recruitment Leads\n\n⏰ **Send:** Day 4 after initial contact\n\n> Hey **[Name]**! Just wanted to reach out one more time to make sure you didn't miss my previous messages. I know life gets busy, but I'd love to connect and share some valuable financial insights that could really set you up for the future.\n>\n> This isn't just about completing a financial planning/literacy course — during our **free 20-minute Zoom session**, I'll help you look at your financial goals and provide **personalised advice** that's relevant to your current situation. Many young adults and NSFs have found it to be eye-opening and really helpful, and I think you'd benefit too! 💪\n>\n> Would you be available next **Saturday at either 10am or 2pm** or **Sunday at 2pm**? If another time works better, feel free to let me know!\n>\n> Looking forward to the chance to chat and empower you with some great financial tools 😊" },
      { author: "3rd Follow-Up (Day 6 — Final)", content: "## 📩 3rd Follow-Up Text — Recruitment Leads\n\n⏰ **Send:** Day 6 after initial contact (Final)\n\n> Hi **[Name]**, I hope you're doing well! 😊\n>\n> Just wanted to follow up one last time about our **free financial planning course and consultation**. I completely understand if you've been busy, but I didn't want you to miss out on this opportunity.\n>\n> This free Zoom session isn't just about finances — it's about helping young adults like you **take control of your future**. Whether it's learning how to save smarter, plan for early retirement, or start investing, we'll cover it all in just **20 minutes**.\n>\n> If you're interested, I have availability next **Saturday at 10am or 2pm** and **Sunday at 2pm**. If another time works better, let me know!\n>\n> Looking forward to helping you kick-start your financial journey 💪\n\n---\n\n⚠️ **After this:** If no reply, mark lead as **\"texting but no reply\"** in CRM." },
    ],
    sort_order: 5.9,
  },
  {
    id: "confirmation-recruitment-zoom",
    stage: "Pre-Zoom Confirmation Text — Recruitment Leads",
    category: "confirmation",
    target_audience: "recruitment",
    versions: [
      { author: "Pre-Zoom Confirmation + Fact-Finding", content: "## ✅ Pre-Zoom Confirmation Text — Recruitment Leads\n\n⏰ **Send:** After lead confirms a Zoom slot\n\n> Great! I'll see you next **[date and time]** for our short 20-min chat, after which you will get access to our **financial planning course**.\n>\n> Just to get a better idea of which stage of life you are currently in and for us to prepare for the upcoming meeting, may I ask:\n>\n> 1️⃣ Are you currently **25 years old or younger**?\n>\n> 2️⃣ Are you currently **working / at university / serving NS**?\n>\n> 3️⃣ Are you expecting any **significant milestones**, e.g., graduation, ORD, new job, marriage?\n>\n> Finally, please do **save my number** so that you know when it's me when I share new resources or any updates in the future. Thank you! ☺️" },
    ],
    sort_order: 6.0,
  },
  {
    id: "cold-calling-recruitment-nsf",
    stage: "Cold Calling — Recruitment NSF Leads (Telemarketer)",
    category: "cold-calling",
    target_audience: "recruitment",
    versions: [
      { author: "Catalyst Recruitment — NSF Script", content: "## 📞 Cold Calling Script — NSF Leads (Recruitment)\n\n### Opening\n\n> Hi, is this _____?\n>\n> Hello _____, my name is ____, I'm a recruitment officer from Catalyst Recruitment. I understand that you are going to **ORD this year**?\n\n---\n\n### The Pitch\n\n> Great — I'll keep this call short. I'm calling because we currently have **internship opportunities specifically for NSFs** after they complete their NS, and I wanted to check if this would be relevant for you.\n\n---\n\n### Fact-Finding\n\n> Just to confirm, are you planning to go to **university after NS**?\n\n*(If yes, continue below)*\n\n---\n\n### Booking the Session\n\n> Alright, what we usually do is arrange a short sharing session to walk you through the opportunities. This would be a **group briefing** for you to learn more about the various job opportunities we currently have.\n>\n> How about we tentatively set a time first, and you can update us later if anything changes via WhatsApp.\n>\n> Would **Thursday at 5:30pm** work better for you, or **Friday at 2:00pm**?\n\n---\n\n### Closing\n\n> What will happen next is that I'll send you a **WhatsApp message** shortly. Once you receive it, please acknowledge me on WhatsApp, okay?\n>\n> Also, do make sure to attend this session as **time slots are specially allocated**, and many university-bound students find it very beneficial after attending.\n>\n> Have a great day ahead! 👋" },
      { author: "Catalyst Recruitment — NSF Script V2 (Detailed)", content: "## 📞 Cold Calling Script — NSF Leads V2 (Recruitment)\n\n### Opening\n\n> Hi, is this _____?\n>\n> Hello _____, my name is ____, I'm a recruitment officer from Catalyst Recruitment. I understand that you are going to **ORD this year**?\n>\n> Great — I'll keep this call short.\n\n⚠️ *Always give them a choice of Yes or Yes — don't ask open-ended questions.*\n\n---\n\n### Fact-Finding\n\n> By the way, just to check — are you going to **university** after NS?\n\n⚠️ *If they are going to Poly or ITE → please drop the lead.*\n\n⚠️ *Insert whether they are going to Uni/Poly in the **Telemarketer Remarks** section.*\n\n---\n\n### If They're Unsure of Their Schedule\n\n> OK, how about we tentatively set a time first on **[date and time]** — if you have any changes, you can update us on WhatsApp.\n>\n> So would **Thursday 5:30pm** work better for you?\n\n*(If they genuinely can't commit: \"No worries, we will call you back next time.\")*\n\n> How about **Friday 2pm** or **Saturday 10am**?\n\n*(Prompt one more time if no)*\n\n---\n\n### After Agreeing on a Time\n\n> Alright! What will happen next is that I'll drop you a **WhatsApp text**, and from there do acknowledge me through WhatsApp, OK?\n>\n> *(Pause 1 second)*\n>\n> And do make sure to come for this session where time slots are specially allocated for you — most **uni students** do find it beneficial for them after they have attended!\n>\n> Alright then, see you this coming **[date and time]**! 👋" },
      { author: "NSF Script V3 — Free Course & Side Hustle", content: "## 📞 Cold Calling Script — NSF Leads V3 (Free Course Pitch)\n\n### Opening\n\n> Hi!\n>\n> Understand that you have **completed your national service** already?\n\n---\n\n### Quick Pitch\n\n> Okay, I'll just keep this call short — **less than one minute**.\n>\n> We currently have a **free online course** to help students and young adults learn more about **high income skills** and planning for their future.\n>\n> If you're interested in **growing your income** and exploring **side hustle opportunities**, I can send you more details to find out more — is that okay?\n\n---\n\n### Consultant Follow-Up\n\n> Also, my consultant will also be **calling you later at around 5pm** to share with you more details!\n\n---\n\n### Closing\n\n> Just to check, how do I address you?\n>\n> So just one last thing — as long as you **learn something new** from this, then that's good enough!\n>\n> Have a nice day! 👋" },
    ],
    sort_order: 6.1,
  },
  {
    id: "cold-calling-recruitment-job-portal",
    stage: "Cold Calling — Job Portal Leads (Recruitment)",
    category: "cold-calling",
    target_audience: "recruitment",
    versions: [
      { author: "Catalyst Recruitment — Job Portal Script", content: "## 📞 Cold Calling Script — Job Portal Leads (Recruitment)\n\n### Opening\n\n> Hi, is this _____?\n>\n> Hello _____, I'm calling from **Catalyst Recruitment**. Understand that you recently applied for a job on **[insert name of job portal]** for a **[insert name of job role]**.\n>\n> Just to inform you that you've been **shortlisted for an interview** — would you be available for a **group briefing** this or next week? There are a total of **4 rounds of interviews**, and this will be the first round.\n>\n> Will you be free this **Thursday 5pm**, **Friday 2pm**, or **Saturday 10am**? It's a short **30-minute Zoom call**.\n\n---\n\n### If Asked 'What's the Role About?'\n\n> It's a **WFH position** with **flexible working hours** in the **[name of role]**. More details will be shared in the job briefing, and this is just the first of 4 rounds.\n\n⚠️ *Always give them a choice of Yes or Yes — don't ask open-ended questions.*\n\n---\n\n### If They're Not Sure of Their Schedule\n\n> OK, how about we **tentatively set a time** first on **[date and time]** — if you have any changes, you can update us on WhatsApp?\n\n---\n\n### If They Want More Details\n\n> It's a position in a **[name of job role]**. If you're interested, would you like me to send over a text message and schedule a **group interview** for you?\n\n---\n\n### After Agreeing on a Time\n\n> Alright! What will happen next is that I'll drop you a **WhatsApp text**, and from there do acknowledge me through WhatsApp, OK?\n>\n> *(Pause 1 second)*\n\n---\n\n## 🛡️ Objection Handling\n\n### 1. 'Not interested'\n\n> I understand! No worries, as this is just a **group briefing** and there is a total of **4 rounds of interviews**. So there's no harm to go and find out more.\n\n---\n\n### 2. 'What is the session about?'\n\n> This would be a **group briefing** for you to learn more about the position you applied for.\n>\n> So would **[date and time]** work better for you?\n\n---\n\n### 3. 'Is this a sharing session? Or a 1:1 session? Do you have any link to your organisation?'\n\n> The job role is under **Catalyst Consultancy**.\n\n---\n\n### 4. 'How did you get my number?'\n\n> I'm not sure as it's in my system, but you might have placed your details on one of the **job portals**.\n\n---\n\n### 5. 'Which organisation are you calling from?'\n\n> I'm actually calling from **Catalyst Recruitment** — we are a recruitment agency.\n\n---\n\n### 6. 'What is your name, want to complain'\n\n⚠️ *At most give your **first name**. Do NOT give your contact or mobile number.*\n\n> Hi [Name], I understand your frustration. However, this is just a service call to check if you are keen to understand how to better explore your internship and career options. I apologise for the inconvenience caused, if any.\n\n⚠️ *Then **HANG UP** — the more you talk, the more they will try to find trouble.*\n\n---\n\n### 📅 Available Timings\n\n- **Thursday** — 5:00 PM\n- **Friday** — 2:00 PM\n- **Saturday** — 10:00 AM" },
    ],
    sort_order: 6.15,
  },
  {
    id: "cold-calling-recruitment-fb-webinar",
    stage: "Cold Calling — Facebook Leads (Recruitment Webinar)",
    category: "cold-calling",
    target_audience: "recruitment",
    versions: [
      { author: "Catalyst Recruitment — FB Leads Webinar Script", content: "## 📞 Cold Calling Script — Facebook Leads (Recruitment Webinar)\n\n### Opening\n\n> Hi, is this **[First Name]**?\n>\n> Hi **[First Name]**, I'm **[YOUR NAME]** from **Catalyst Recruitment**, and to keep this really quick — we have recently received your interest in attending our **free seminar**!\n\n---\n\n### The Pitch\n\n> It's about helping people learn how to **build additional income streams**.\n>\n> It's **not a motivational talk** — it's a **30-minute Zoom call** where we'll cover:\n>\n> - What is a **franchise business** about\n> - How the speaker personally built a **7-figure business as a fresh graduate**\n> - How to **get started** even with **limited time/capital**\n\n---\n\n### Booking\n\n> Will you be available on either this **Thursday 5pm**, **Friday 2pm**, or **Saturday 10am** for the Zoom session?\n>\n> There will be a total of **3 rounds of interviews** after the session if you're shortlisted after the first session.\n\n---\n\n### Closing & WhatsApp Confirmation\n\n> Alright, I'll send you a message on **WhatsApp** — please **acknowledge me** once you receive it, okay?\n\n---\n\n### 📅 Available Timings\n\n- **Thursday** — 5:00 PM\n- **Friday** — 2:00 PM\n- **Saturday** — 10:00 AM" },
    ],
    sort_order: 6.17,
  },
  {
    id: "follow-up-recruitment-fb-webinar-post-call",
    stage: "Post-Call Text — FB Webinar Leads (After Telemarketer Call)",
    category: "follow-up",
    target_audience: "recruitment",
    versions: [
      { author: "Text 1 — Post-Call WhatsApp", content: "## 📲 Post-Call Text — Facebook Webinar Leads\n\n*Send this after the telemarketer has called the lead who opted in from Facebook*\n\n---\n\n> Hey **[Name]**,\n>\n> As what my colleague mentioned just now over the call, this is about a **free seminar** where we teach motivated people how to **build additional income streams**.\n>\n> Rather than being a motivational talk, we want to also give the **\"what\"** and the **\"how\"** and help you do it with as little friction as possible. We also provide access to our **online learning platform**.\n>\n> The seminar is a **30-min Zoom call** where we'll cover:\n>\n> ✅ The opportunities of a **franchise business**\n>\n> ✅ **Success stories** → how the speaker personally built a **7-figure business as a fresh graduate**\n>\n> ✅ How to **get started** even with **limited time/capital**\n>\n> **No obligation** — just valuable info you can use right away.\n>\n> The Zoom session (**first of 4 rounds**) will be scheduled for **[date and time]**.\n>\n> Please **reply to acknowledge** so I can secure your slot 🙏" },
      { author: "Text 2 — Zoom Confirmation", content: "## 📲 Zoom Interview Confirmation — FB Webinar Leads\n\n*Send this after the lead acknowledges Text 1*\n\n---\n\n> **Subject: Zoom Interview Confirmation**\n>\n> Hey **[Name]**,\n>\n> Thank you for your confirmation! Below are the details for your scheduled Zoom call:\n>\n> **Date:** [insert date]\n>\n> **Time:** [insert time]\n>\n> **Zoom Link:** https://us06web.zoom.us/j/2516308666?pwd=SzdZUHF5M2hVRlM5NE95dngyUWsxdz09\n>\n> Do **turn on the camera**, and arrive at least **5 minutes before** the scheduled time slot.\n>\n> After the session, we will be sending you a **personality questionnaire**.\n>\n> All the best!\n>\n> Best regards,\n> **[Your Name]**" },
      { author: "NR 1 — First No-Reply Follow-Up", content: "## 📲 No-Reply Follow-Up 1 — FB Webinar Leads\n\n*Send if lead doesn't reply to the post-call text*\n\n---\n\n> Hey, just bumping this up!\n>\n> People whom we are looking for are usually pretty motivated to get an **additional income stream**, **improve themselves**, or even **build a business**. We only have a few slots left as registration will be **closing this week**, so let me know if you would like to register. You may ask your friends to join with you as well.\n>\n> Do let me know **Thursday 5pm**, **Friday 2pm**, or **Saturday 10am** works for a Zoom call? It will take at most **30 minutes**." },
      { author: "NR 2 — Second No-Reply Follow-Up", content: "## 📲 No-Reply Follow-Up 2 — FB Webinar Leads\n\n*Send if lead still doesn't reply after NR 1*\n\n---\n\n> Just following up! Understand life can get busy, but I sincerely believe this may be a **life-changing opportunity**!\n>\n> Just letting you know that there will be around **3–4 rounds of interviews** after the session. Do let me know **Thursday 5pm**, **Friday 2pm**, or **Saturday 10am** works for a Zoom call? It will take at most **30 minutes**.\n>\n> If not, I can give you a **call tomorrow around 9–10pm** to do a quick intro." },
      { author: "FAQ — \"What's This About?\"", content: "## ❓ FAQ — \"What's This About?\"\n\n*Use when lead asks what the seminar/session is about*\n\n---\n\n> Hey **[Name]**! Fair question 😊\n>\n> This is about a **free seminar** where we teach motivated people how to **build additional income streams**.\n>\n> And rather than motivating you or hyping you up, we want to also give the **\"what\"** and the **\"how\"** and help you do it with as little friction as possible. We also provide access to our **online learning platform**.\n>\n> The seminar is a **30-min Zoom call** where we'll cover:\n>\n> ✅ The opportunities of a **franchise business**\n>\n> ✅ **Success stories** → how I personally built a **7-figure business as a fresh graduate**\n>\n> ✅ How to **get started** even with **limited time/capital**\n>\n> **No obligation** — just valuable info you can use right away.\n>\n> Would **Thursday 5pm**, **Friday 2pm**, or **Saturday 10am** work for you?" },
    ],
    sort_order: 6.175,
  },
  {
    id: "follow-up-recruitment-fb-initial-text",
    stage: "Initial Text — Facebook Leads (Recruitment)",
    category: "follow-up",
    target_audience: "recruitment",
    versions: [
      { author: "Text 1 — Verification", content: "## 📲 Initial Text — Facebook Leads for Recruitment\n\n### First Text (Verification)\n\n> Hey **[Name]**, received your interest recently for our **free seminar** 🎉\n>\n> Just to check if I got the right person before I send more details?\n\n---\n\n### 📎 Attach These Flyers\n\n![Hit Your First $10K](/scripts/hit-first-10k.png)\n\n![Free Seminar — Sign Up Now](/scripts/free-seminar-signup.png)\n\n---\n\n### 💡 Notes\n\n- Send this as the **first touchpoint** before calling\n- Wait for them to confirm identity before sending full details\n- If they reply \"yes\" → follow up with **Text 2** (seminar details + Zoom booking)\n- If no reply after 24h → proceed with a **cold call**" },
      { author: "Text 2 — Seminar Details + Zoom Booking", content: "## 📲 Text 2 — Seminar Details & Zoom Booking\n\n*Send this after they confirm identity from Text 1*\n\n---\n\n> Hey **[Name]**,\n>\n> This is about a **free seminar** where we teach motivated people how to **build additional income streams**.\n>\n> Rather than being a motivational talk, we want to also give the **\"what\"** and the **\"how\"** and help you do it with as little friction as possible. We also provide access to our **online learning platform**.\n>\n> The seminar is a **30-min Zoom call** where we'll cover:\n>\n> ✅ The opportunities of a **franchise business**\n>\n> ✅ **Success stories** → how the speaker personally built a **7-figure business as a fresh graduate**\n>\n> ✅ How to **get started** even with **limited time/capital**\n>\n> **No obligation** — just valuable info you can use right away.\n>\n> Will you be available on either:\n>\n> **A)** This Thursday 5pm\n> **B)** This Friday 2pm\n> **C)** This Saturday 10am\n>\n> Just reply **A)**, **B)**, or **C)** to indicate which one works best for you!" },
      { author: "V2 — FINternship Programme (Leo's Personal Pitch)", content: "## 📲 Initial Text V2 — FINternship Programme Pitch\n\n*Alternative first text with personal story angle + Skool course link*\n\n---\n\n> Hey **[Name]**, received your interest in learning more about our **FINternship programme** :)\n>\n> Anyway Leo here, to introduce myself — I've been building a few businesses for over **10 years** and just wanted to share what I know with fellow young adults like yourself :)\n>\n> In school, we just learn how to be a better worker/employee, to work for others, but not to work for ourselves. I was quite frustrated about this, and hence wanted to do something different to others. And that's why I created a **course for you to access completely for free**.\n>\n> 🔗 https://www.skool.com/finternship/about\n>\n> Hopefully this can help you **not make the same mistakes I made**, and reduce the amount of effort/risk/time to get to where you want to be.\n>\n> Would any of these slots work for you for a **quick Zoom call** to go through it with you?\n>\n> **1)** Coming Thursday 2pm\n> **2)** Coming Friday 5pm\n> **3)** Coming Saturday 10am\n> **4)** Coming Sunday 10am / 5pm\n> **5)** Or the following week better?\n\n---\n\n### 📎 Attach This Brochure\n\n![FINternship Program Brochure](/scripts/finternship-program-brochure.png)" },
      { author: "Follow-Up 1 — Bump", content: "## 📲 Follow-Up Text 1 — Bump\n\n*Send if no reply to initial text*\n\n---\n\n> Hey **[Name]**\n>\n> Just bumping up my previous message in case you didn't see it! Let me know when is good, if not we can also try **next week** if that's better for you :)" },
      { author: "Follow-Up 2 — Re-pitch with Slots", content: "## 📲 Follow-Up Text 2 — Re-pitch with Slots\n\n*Send if still no reply after Follow-Up 1*\n\n---\n\n> Hey **[Name]**! 😊 Leo here!\n>\n> Hope the week hasn't been too busy for you! Was supposed to schedule a meeting with you but was unable to previously!\n>\n> Would any of these time slots work for you?\n>\n> **1)** Coming Thursday 2pm\n> **2)** Coming Friday 5pm\n> **3)** Coming Saturday 10:30am\n> **4)** Coming Sunday 10am / 5pm\n> **5)** Or the following week better?\n>\n> Just reply **1) to 5)** so I can arrange! If not a quick **5-min call tomorrow noon** is fine too.\n>\n> ~Leo" },
      { author: "Confirmation — After They Pick a Slot", content: "## 📲 Confirmation Text — After Lead Confirms Slot\n\n*Send after the lead picks a time slot*\n\n---\n\n> Awesome!\n>\n> I've marked my calendar for our meeting as per the following:\n>\n> **Date/Time:** [insert date/time]\n>\n> **Location:** [insert Zoom link / location]\n>\n> **Duration:** 30 min\n>\n> I've reserved the slot on my calendar, do kindly reply this message **\"OK\"** to acknowledge.\n>\n> Looking forward to our chat!\n>\n> 🔗 **Zoom Link:** https://us06web.zoom.us/j/2516308666?pwd=SzdZUHF5M2hVRlM5NE95dngyUWsxdz09" },
      { author: "Reminder — Day Before", content: "## 📲 Reminder Text — Before the Meeting\n\n*Send 1 day before the scheduled Zoom call*\n\n---\n\n> Hey **[Name]**,\n>\n> Gentle reminder of our meeting this **[date/time]** at **[location]**.\n>\n> Do kindly let me know if there are any changes, or let me know your **earliest and latest timing** so I can find a suitable time slot!\n>\n> It will take from **30 minutes**.\n>\n> Looking forward to our chat 😊" },
      { author: "Day-Of — Zoom Link Reminder", content: "## 📲 On the Day of the Interview\n\n*Send on the day of the Zoom session*\n\n---\n\n> See you later! Here's the Zoom link again:\n>\n> 🔗 https://us06web.zoom.us/j/2516308666?pwd=SzdZUHF5M2hVRlM5NE95dngyUWsxdz09" },
    ],
    sort_order: 6.18,
  },
  {
    id: "follow-up-recruitment-nsf-post-call",
    stage: "Post-Call Text — Recruitment NSF Leads (Zoom Confirmation)",
    category: "follow-up",
    target_audience: "recruitment",
    versions: [
      { author: "NSF Interview Zoom Confirmation", content: "## 📲 Post-Call Text — NSF Recruitment Leads\n\n**Subject: Interview Zoom Confirmation**\n\n> Hey **[Name]**,\n>\n> My assistant gave you a call just now! Understand that you're going to **ORD this year**, and I think this is a good chance for you to find out more about potential **internship/job opportunities after NS** :)\n>\n> As spoken, we will be conducting a **group interview session** this Saturday at 10am for you to find out more about post-NS job/internship opportunities.\n>\n> **Date/Time:** This Saturday 10am\n>\n> **Where:** Zoom — https://us06web.zoom.us/j/2516308666?pwd=SzdZUHF5M2hVRlM5NE95dngyUWsxdz09\n>\n> **Duration:** 30 minutes\n>\n> Do reply **\"OK\"** to confirm or suggest another time slot if you can't make it!\n>\n> This will be the **first of 4 rounds of interviews**. This will be suitable for you if you're self-motivated and want to increase your exposure in the **finance and business sector**!" },
    ],
    sort_order: 6.2,
  },
  {
    id: "follow-up-recruitment-job-portal-post-call",
    stage: "Post-Call Text — Job Portal Recruitment Leads",
    category: "follow-up",
    target_audience: "recruitment",
    versions: [
      { author: "Job Portal Post-Call Text + Zoom Confirmation", content: "## 📲 Post-Call Text — Job Portal Recruitment Leads\n\n### Text 1: Initial WhatsApp After Call\n\n> Hi **[Name]**, thanks for taking the call just now from my assistant! 😊\n>\n> This is **[Your Name]** from **Catalyst Recruitment** — as discussed, I've scheduled you for the career session on **[Day]**, **[Time]** via Zoom.\n>\n> Do acknowledge this message so I can secure your slot. See you then!\n>\n> 🔗 **Zoom Link:** https://us06web.zoom.us/j/2516308666?pwd=SzdZUHF5M2hVRlM5NE95dngyUWsxdz09\n\n---\n\n### Text 2: Zoom Interview Confirmation\n\n> **Subject: Zoom Interview Confirmation**\n>\n> Hey **[Name]**,\n>\n> Thank you for your confirmation! Below are the details for your scheduled Zoom interview:\n>\n> **Role:** [insert role]\n>\n> **Date:** [insert date, e.g. 23 May 2025, Friday]\n>\n> **Time:** [insert time, e.g. 2.00pm]\n>\n> **Zoom Link:** https://us06web.zoom.us/j/2516308666?pwd=SzdZUHF5M2hVRlM5NE95dngyUWsxdz09\n>\n> Looking forward to speaking with you soon! ☺\n>\n> Best regards,\n> **[Your Name]**" },
    ],
    sort_order: 6.25,
  },
  {
    id: "referral-recruitment-skool-community",
    stage: "Referral Text — Lead to Friends (Skool Community Sign-Up)",
    category: "referral",
    target_audience: "recruitment",
    versions: [
      { author: "Skool Community Referral Template", content: "## 🔗 Referral Text — For Leads to Send to Friends\n\n### Template Message (Copy & Send to Friends)\n\n> Hey guys!\n>\n> Just sharing with you something! I'm in this community. It has many online **personal growth resources**, **webinars**, and **events**. If you're keen you can also sign up here 👇\n>\n> 🔗 https://www.skool.com/finternship/about\n>\n> It's **free**!\n\n---\n\n### 📎 Attach This Flyer\n\n![Build Your Financial Sandwich](/scripts/financial-sandwich-referral.png)\n\n---\n\n### 💡 Instructions for the Referrer\n\n> You can send the above template message to your friends, and you'll get **$10 for each successful sign-up** under you." },
    ],
    sort_order: 6.3,
  },
  {
    id: "referral-consultant-to-referee",
    stage: "Consultant Text to Referee (Referral)",
    category: "referral",
    target_audience: "recruitment",
    versions: [
      { author: "Consultant → Referee WhatsApp Text", content: "## 📲 Consultant Text to Referee\n\n### Template Message\n\n> Hey **[Name]**, got your contact from **[Referrer Name]**. It's about the online course that your friend shared with you about.\n>\n> It's self study, at your own pace. You can sign up here:\n> 🔗 https://www.skool.com/finternship/about\n>\n> To find out more: 🔗 https://tinyurl.com/FINternshipSG\n>\n> Can I schedule a **quick Zoom call** with you to go through the overview and objectives of the courses — and will give you access afterwards!" },
      { author: "Referral Model — Full Process Flow & SOP", content: "## 📋 Referral Model for Recruitment + Sales — Process Flow\n\n### 🎯 Objective\n\nCreate an affiliate model for more **high-quality, organic referrals**, without needing too much time/effort on the consultant's part.\n\n---\n\n### ⚠️ Why Traditional Referrals Don't Work\n\n- Getting people to refer friends is hard unless they **trust us for years**\n- It is **unethical to pay people** to meet us for an appointment directly, then try to sell them something\n- Common excuses: *\"I'll check with them first\"*, *\"They already have an advisor\"*, *\"I'm not sure if they need this\"*\n- These are excuses for **not wanting to look bad** in front of their friends\n- Forcing them to give contacts is difficult + **PDPA concerns**\n- Paying in cash/vouchers attracts the **wrong kind of people** and lowers our standing\n\n---\n\n### ✅ The Solution: Value Stack + \"Good Lobang\" Mentality\n\nUse the **FINternship program** as a value stack and \"Grand Slam Offer\" to get referrals for both **sales and recruitment**.\n\nCreate a referral model where we **pay someone each time they sign up for the course**, which indirectly gives us recruitment leads and sales leads.\n\n---\n\n### 🔄 Process Flow to Get Referrals\n\n1. **After the appointment**, share that we have a **free course**\n2. Briefly run through the program: https://tinyurl.com/FINternshipSG and the course page: https://www.skool.com/finternship/about\n3. Share that they will get **$30 for each person who signs up**\n4. \"Successful sign-up\" = They sign up on the Skool link **+ agree to have an appointment** with the consultant\n5. Send the **Referral Template Script** for them to forward to friends\n6. When there is a sign-up, it will show up on the **Skool membership requests page**\n7. Check if they answered the membership question (\"What is your contact number?\")\n8. If they didn't answer → ask the referrer for their contact (they will usually agree)\n9. **Text the referee** to schedule a Zoom call **before unlocking** the course modules\n\n---\n\n### 💰 Rules & Incentives\n\n| Role | Incentive |\n|---|---|\n| **Referrer** | $30 cash per successful sign-up + appointment |\n| **Consultant** | Pays $30 to referrer; leads are \"consultant-generated leads\" under Commission Structure |\n| **Leo** | Pays $30 ad spend to consultant if lead is referred for recruitment appointment (must be close to ORD/already ORD/existing students) |\n| **Recruitment Close** | If lead becomes an agent → parked under consultant; **$1,000 cash incentive** upon joining |\n\n---\n\n### 📝 Key Notes\n\n- The consultant will fork **$30 cash** to pay the referrer\n- These leads are considered **\"consultant generated leads\"** under the Commission Structure for Sales\n- For recruitment leads, they need to be aware of the **FA job** and be close to ORD/already ORD/existing students\n- If recruited and becomes an agent → **parked under the consultant** if they decide to move up" },
    ],
    sort_order: 6.35,
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
    id: "tips-google-calendar",
    stage: "Google Calendar Tips — Scheduling Best Practices",
    category: "tips",
    target_audience: "general",
    versions: [
      { author: "Calendar SOP", content: "## 📅 Google Calendar Tips — Scheduling Best Practices\n\n### 1. Calendar Event Naming Convention\n\nUse this format for your Zoom calendar events:\n\n**Zoom/Location — Name — Number — Source of Leads**\n\nExample: `Zoom - +65 8313 5494 - Sky (Gab FB Leads)`\n\n![Google Calendar Example](/scripts/google-calendar-example.png)\n\n---\n\n### 2. Always Invite the Training Calendar\n\nAdd **meetingtrainingcalendar@gmail.com** as a guest to every meeting event so it shows up on the shared team calendar.\n\n---\n\n### 3. Check Team Availability\n\nAsk **Gabriel**, **Ben**, and **Leo** for access to their Google Calendar → so you know their availability before booking slots.\n\n---\n\n### 4. Create Customised Follow-Up Texts\n\nDon't just copy-paste — personalise your follow-up messages based on the lead's situation, source, and conversation.\n\n---\n\n### 5. Save as Quick Replies\n\nSave your customised follow-up texts as **WhatsApp Business Quick Replies** so you can send them instantly without retyping." },
    ],
    sort_order: 31,
  },
  {
    id: "tips-voucher-procedure",
    stage: "Physical Voucher Procedure & Lead Follow-Up",
    category: "tips",
    target_audience: "general",
    versions: [
      { author: "Voucher SOP + Follow-Up Rules", content: "## 🎫 Physical Voucher Procedure\n\n### Overview\n\nCollate all the people that actually need the vouchers at the **end of the 4 months / end of campaign** and post it to them.\n\n---\n\n### 📋 Procedure (e.g. Yakun Leads)\n\n> Regarding the Yakun leads — the vouchers will be **mailed out** to them. At the end of the 3 months, please collate all the people that you have met up with, then **mail out to them all at one shot**.\n\n- If you **meet up with them physically** → yes, you can just pass it to them directly\n- If they are **super not qualified** and there's no need for a physical meeting → tell them that after 3 months, we will collate all the vouchers and **send them out all at once** (saves time)\n\n---\n\n### 📞 Lead Follow-Up Rules\n\n| Scenario | Action |\n|---|---|\n| **Lead replies** | Give a **call immediately** to set an opening appointment **on the same day** |\n| **Lead does not reply** | Give a call after **2–3 days** to try and set an opening appointment |" },
    ],
    sort_order: 32,
  },
  {
    id: "tips-dual-phone",
    stage: "Double Your Calling Power — Two-Phone Strategy",
    category: "tips",
    target_audience: "general",
    versions: [
      { author: "Team Guide", content: "## 📱📱 Double Your Calling Power: The Two-Phone Strategy\n\nIf you're serious about cold calling, use **two phones simultaneously**. It's basic maths that gives you an unfair advantage.\n\n---\n\n### 🛠️ Setup (2 Minutes)\n\n- 2 phones (primary + a second device)\n- Lark on web mode on your computer\n- WhatsApp on web mode on your computer\n- Your prospect list ready to go\n\n---\n\n### ⚡ How It Works\n\n1. Dial **two numbers simultaneously** — one on each device\n2. See which prospect picks up first\n3. After 10 rings with no answer → cut both calls, move to next two numbers\n4. If one picks up → immediately cut the other call, take the conversation\n5. After the call → move to the next two rows on your list\n\n> ⚠️ **Important:** Don't redial the number that didn't pick up — keep moving forward\n\n---\n\n### 📊 The Maths (In Your Favour)\n\nWaiting time follows a Poisson distribution. Running two queues cuts waiting time by **30–40%**.\n\n| Metric | Impact |\n|---|---|\n| 1 hour dual-phone | = 2 hours single-phone |\n| Weekly savings | 5+ extra hours |\n| Monthly savings | 20+ extra hours |\n| Yearly savings | **240+ hours (6 work weeks!)** |\n\n---\n\n### 🔑 The One Rule That Matters\n\n**Always text AFTER your calling session ends — NOT after each individual call.**\n\nStopping to text after every call destroys your momentum. You're a machine during calling time. Texting comes later, in **batch mode**, after you've crushed your calling block.\n\n---\n\n### ❓ FAQ\n\n**Q: Won't I get confused?**\nA: You will for the first 10 minutes. Then it becomes automatic.\n\n**Q: What if both pick up?**\nA: Extremely rare. If it happens, cut one and take the other. Good problem to have.\n\n**Q: Isn't it disrespectful to cut off?**\nA: They never knew you called. You hung up before they answered. Zero impact.\n\n**Q: What about the person who didn't pick up?**\nA: Move on. Don't look back. Forward momentum beats second-guessing every time.\n\n---\n\n### 💡 Bottom Line\n\nEvery hour you call with one phone when you could be using two is an hour you're choosing to work at **50% capacity**.\n\nSet it up today. Your future self — the one with a calendar full of appointments — will thank you." },
    ],
    attachments: [
      { label: "Dual Phone Setup Example", url: "/scripts/dual-phone-setup.png", type: "image" },
    ],
    sort_order: 30.5,
  },
  {
    id: "tips-callback-checklist",
    stage: "Callback Checklist — Step-by-Step Guide",
    category: "tips",
    target_audience: "nsf",
    versions: [
      { author: "Team Guide", content: "## ✅ Checklist for Callbacks (Young Adults Under 25)\n\n---\n\n### 1️⃣ Initial Introduction\n\n- Start with the purpose: *\"Hi [Name], this is [Your Name]. My assistant may have called you earlier, and I'm following up personally about an opportunity for young adults under 25.\"*\n- Confirm age: *\"Just to confirm, are you under 25?\"*\n\n---\n\n### 2️⃣ Build Rapport\n\n- Ask about their life stage: *\"Great! Are you currently studying, serving NS, or working? What's your current focus right now?\"*\n- Gather key milestones: *\"When's your birthday? Do you have any major milestones coming up, like ORD, graduation, or starting a new job?\"*\n\n---\n\n### 3️⃣ Send Overview on WhatsApp\n\n- Inform them: *\"I'll be sending you an overview of what we'll be discussing via WhatsApp. Are you on WhatsApp now?\"*\n- Confirm receipt: *\"I've just sent it to you — can you check if you've received it?\"*\n- Guide them to save your number: *\"To make sure you receive all future resources, could you save my contact? Just scroll to the top of the message and click 'Save Contact.' Let me know once that's done!\"*\n\n---\n\n### 4️⃣ Share the Heart of the Programme\n\n- Explain the purpose: *\"The reason this programme was created is that these topics aren't typically taught in school.\"*\n- Highlight key topics:\n  - Personal finance\n  - Productivity and self-improvement\n  - Entrepreneurship and investing in yourself — not just your money\n- Share team credibility: *\"Our team has been doing this for over 10 years, and this year marks our 10th anniversary of helping young adults.\"*\n- Emphasise starting young: *\"The earlier you start, the greater the ripple effect. Learning these things at 20 or 25 is so much more impactful than starting at 65.\"*\n\n---\n\n### 5️⃣ Explain the Zoom Call + Free Consultation\n\n- Set expectations: *\"During the Zoom call, I'll explain the different ways you can start growing your money and investing. At the end of the session, you'll also get access to the course for free.\"*\n- Personalised consultation: *\"The Zoom call will also include a free personal financial consultation tailored to your current situation. I'll help you identify specific steps you can take based on your goals.\"*\n\n---\n\n### 6️⃣ Book the Appointment\n\n- Suggest a time: *\"Does next Saturday morning at 10am work for you? The call will only take about 30 minutes.\"*\n- Confirm: *\"Great! I'll send you the Zoom link closer to the date. Please feel free to reach out if you have any questions before then.\"*\n\n---\n\n### 7️⃣ Encourage Referrals\n\n- Ask for referrals: *\"If you know anyone else under 25 who might benefit from this, feel free to share this with them.\"*\n- Give them a ready-made script:\n  > *\"Hey, I came across a free financial consultation that helps young adults learn how to grow their money. They also provide access to a great course afterward. Let me know if you're interested!\"*\n- Offer to include friends: *\"If they're interested, they can join the Zoom call with you or book their own time.\"*\n\n---\n\n### 8️⃣ Close the Call\n\n- Recap: *\"To summarise, during the call we'll discuss ways to grow your money, go through a financial consultation, and give you access to the course for free.\"*\n- Thank them: *\"Thank you for your time, [Name]! I'll see you next Saturday at 10am on Zoom. Have a great day!\"*\n\n---\n\n## 🔑 Key Points to Remember\n\n- Keep the tone **conversational, relatable, and enthusiastic**\n- Focus on the **financial consultation as the primary benefit**, with the course as a valuable bonus\n- **Personalise** the call by referencing their life stage and milestones\n- Always confirm they've **saved your number** and received the WhatsApp overview\n- Be **clear and concise** when explaining the purpose and setting expectations" },
    ],
    sort_order: 30.6,
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
    id: "texting-fb-ebook-retiree",
    stage: "Texting Sequence — Facebook eBook Lead (Pre-Retirees)",
    category: "follow-up",
    target_audience: "pre-retiree",
    versions: [
      { author: "Derek's Script — Lead Entry (Day 0)", content: "## 📲 Lead Entry Text — eBook Request\n\n*Send immediately when the lead opts in from the Facebook eBook ad*\n\n---\n\n> Hi **[Name]**,\n>\n> Derek here from **Golden Year Partners**, I received your request for our ebook **\"Are You Truly Ready for Retirement?\"** from Facebook. May I check if I am texting the right person?\n>\n> Please reply with a **'yes'** in this chat to confirm. Thank you!" },
      { author: "Derek's Script — 1st Follow-Up (Day 2)", content: "## 📲 1st Follow-Up — No Reply After 2 Days\n\n---\n\n> Hi **[Name]**,\n>\n> Just following up in case my earlier message got missed. You recently requested for our retirement ebook **\"Are You Truly Ready for Retirement?\"** on Facebook. May I confirm if this is the right person?\n>\n> Just reply with a **'yes'** in this chat to confirm and I'll send it over. Thank you!" },
      { author: "Derek's Script — 2nd Follow-Up (Day 4, Called No Answer)", content: "## 📲 2nd Follow-Up — Called But No Answer\n\n---\n\n> Hi **[Name]**,\n>\n> I tried calling earlier but may have caught you at a busy time.\n>\n> Please reply with a **'yes'** in this chat to confirm, or let me know a suitable time and I'll arrange a quick call back. Thank you!" },
      { author: "Derek's Script — After Prospect Replies 'Yes'", content: "## 📲 After Prospect Confirms — Send eBook + Offer Zoom\n\n---\n\n> Hi **[Name]**,\n>\n> Thank you for your reply and confirmation. This is the copy of the ebook for your reading. Do feel free to drop me a text about anything should you have any questions pertaining to your retirement.\n>\n> I would also like to arrange a **quick Zoom call** to walk you through the key points of the book and share how these strategies can be applied to your retirement plans. Kindly let me know which of the following date and time slots works best for you:\n>\n> 1️⃣ **[XX] Feb 2026, [XX:XX]am**\n>\n> 2️⃣ **[XX] Feb 2026, [XX:XX]am**\n>\n> 3️⃣ **[XX] Feb 2026, [XX:XX]am**\n>\n> 4️⃣ These slots do not work for me, give me more slots\n>\n> You can just reply **1, 2, 3 or 4** to confirm your availability, thank you." },
      { author: "Derek's Script — After Prospect Agrees to Zoom (Post-Call)", content: "## 📲 Post-Call Confirmation — Zoom Booked\n\n*Send after the prospect agrees to a Zoom session during the call*\n\n---\n\n> Hi **[Name]**,\n>\n> Derek here, thank you for your time on the call earlier, it was nice talking to you. As mentioned, I have marked my calendar for our meeting as per the following:\n>\n> **Date/Time:** DD Feb 2026 (Day), HH:MM am/pm\n>\n> **Location:** Zoom\n>\n> **Duration:** 30–45 min\n>\n> We'll be going through the following:\n>\n> ✅ Reviewing existing insurance and retirement policies\n>\n> ✅ Ways to create additional streams of passive income for retirement\n>\n> ✅ Minimizing unnecessary costs that tend to creep up as we age\n>\n> Just respond to this message with a quick **'👍'** once you've seen this.\n>\n> Looking forward to our chat!" },
    ],
    sort_order: 4.5,
  },
  {
    id: "callback-pre-retiree-consultation",
    stage: "Callback Call — Pre-Retiree Consultation (Telemarketer Set)",
    category: "follow-up",
    target_audience: "pre-retiree",
    versions: [
      { author: "Consultant Callback Script — Shoe Analogy V1", content: "## 📞 Callback Script — Pre-Retiree Consultation\n\n*Use when the telemarketer has already set a callback appointment with the prospect*\n\n---\n\n**Opening:**\n\n> Hey, is this **[Name]**?\n>\n> Great. This is regarding the **retirement planning consultation**. I believe my assistant spoke with you yesterday to arrange this call. I tried giving you a ring earlier, but you might've been tied up, so let me just give a quick introduction.\n\n---\n\n**Value Proposition:**\n\n> I'm a **retirement specialist**, and I work closely with many pre-retirees to help them optimize their retirement setup — both on the **income side** and the **expense side**. For example:\n>\n> ✅ Creating additional streams of **passive income**\n>\n> ✅ Reviewing existing **insurance or retirement policies**\n>\n> ✅ Minimizing **unnecessary costs** that tend to creep up as we age\n\n---\n\n**Fact-Finding:**\n\n> Have you started any retirement planning so far?\n>\n> Are you currently working?\n>\n> Do you already have some existing investment policies that can help fund your retirement?\n\n---\n\n**Policy Optimisation Pitch:**\n\n> Many people I meet have **older insurance policies** they bought years ago that no longer match their needs. Hospital plans also get **more expensive with age** — sometimes hitting the 4- or even 5-figure range yearly.\n>\n> What we do is help you **optimize all of this**. In the right scenario, instead of paying hundreds of thousands to insurers over your lifetime, we can restructure things so these costs become an **asset for you** — potentially even getting you a hospital plan at **no additional cost** and creating **passive income** for retirement.\n\n---\n\n**Soft Close (Shoe Analogy):**\n\n> At the very least, it's an **information-sharing session**. Worst-case, you walk away with the Yakun voucher. Best-case, you get insights that meaningfully improve your retirement strategy.\n>\n> Think of it like **window-shopping** before you buy a pair of shoes — you just want to explore options, compare, and see what fits you best.\n>\n> That's what this consultation is about: showing you the different **options and variations** so you can see what's most suitable for your situation.\n\n---\n\n**Booking:**\n\n> For this kind of conversation, it works best to **meet in person**. Which area do you stay around?\n\n---\n\n💡 *Set the meeting at the nearest mall café and confirm via WhatsApp.*" },
      { author: "中文版 + 汉语拼音 (Chinese + Pinyin)", content: "## 📞 回电话脚本 — 退休规划咨询（中文 + 拼音）\n\n*电话推销员已安排回电后使用*\n\n---\n\n**开场白：**\n\n> 喂，您好，请问是 **[名字]** 吗？\n> *Wéi, nín hǎo, qǐngwèn shì [míngzi] ma?*\n>\n> 你好，我这通电话是关于**退休规划咨询**的。\n> *Nǐ hǎo, wǒ zhè tōng diànhuà shì guānyú tuìxiū guīhuà zīxún de.*\n>\n> 我助理昨天应该有先和您联系，安排今天的通话。\n> *Wǒ zhùlǐ zuótiān yīnggāi yǒu xiān hé nín liánxì, ānpái jīntiān de tōnghuà.*\n>\n> 我刚才也有试着给您打电话，可能您当时比较忙，所以我先做一个简单的自我介绍。\n> *Wǒ gāngcái yě yǒu shìzhe gěi nín dǎ diànhuà, kěnéng nín dāngshí bǐjiào máng, suǒyǐ wǒ xiān zuò yīgè jiǎndān de zìwǒ jièshào.*\n\n---\n\n**关于专业介绍：**\n\n> 我是退休规划的**专业顾问**，主要是协助即将退休或正在准备退休的客户，帮助他们优化整体的退休方案，包括：\n> *Wǒ shì tuìxiū guīhuà de zhuānyè gùwèn, zhǔyào shì xiézhù jíjiāng tuìxiū huò zhèngzài zhǔnbèi tuìxiū de kèhù, bāngzhù tāmen yōuhuà zhěngtǐ de tuìxiū fāng'àn, bāokuò:*\n>\n> ✅ 提升退休时期的**被动收入**\n> *Tíshēng tuìxiū shíqí de bèidòng shōurù*\n>\n> ✅ 检视现有的**保险或退休相关保单**\n> *Jiǎnshì xiànyǒu de bǎoxiǎn huò tuìxiū xiāngguān bǎodān*\n>\n> ✅ 减少随着年龄增长而不断上升的**不必要开销**\n> *Jiǎnshǎo suízhe niánlíng zēngzhǎng ér búduàn shàngshēng de bù bìyào kāixiāo*\n\n---\n\n**关于常见问题（保单优化）：**\n\n> 很多人之前买的旧保单，可能已经不太符合现在的需求了；医疗住院计划随着年龄增长也会越来越贵，有些人甚至每年要付到**四位数甚至五位数**的保费。\n> *Hěnduō rén zhīqián mǎi de jiù bǎodān, kěnéng yǐjīng bútài fúhé xiànzài de xūqiú le; yīliáo zhùyuàn jìhuà suízhe niánlíng zēngzhǎng yě huì yuèláiyuè guì, yǒuxiē rén shènzhì měinián yào fù dào sì wèi shù shènzhì wǔ wèi shù de bǎofèi.*\n>\n> 我们会协助您做**整体优化**。\n> *Wǒmen huì xiézhù nín zuò zhěngtǐ yōuhuà.*\n>\n> 在适合的情况下，原本可能要在一生中付给保险公司的几十万，我们可以帮您把它转换成属于您的**资产**，让您拥有**免费的住院计划**，同时还能为您的退休带来额外的**被动收入**。\n> *Zài shìhé de qíngkuàng xià, yuánběn kěnéng yào zài yīshēng zhōng fù gěi bǎoxiǎn gōngsī de jǐ shí wàn, wǒmen kěyǐ bāng nín bǎ tā zhuǎnhuàn chéng shǔyú nín de zīchǎn, ràng nín yōngyǒu miǎnfèi de zhùyuàn jìhuà, tóngshí hái néng wèi nín de tuìxiū dàilái éwài de bèidòng shōurù.*\n\n---\n\n**关于会面的目的（鞋子比喻）：**\n\n> 最差的情况，就是一次**资讯分享**；您也一样能拿到那张**亚坤礼券**。\n> *Zuì chà de qíngkuàng, jiù shì yīcì zīxùn fēnxiǎng; nín yě yíyàng néng ná dào nà zhāng Yàkūn lǐquàn.*\n>\n> 最好的情况，是您能获得真正对自己有帮助的资讯，**改善您的退休规划**。\n> *Zuì hǎo de qíngkuàng, shì nín néng huòdé zhēnzhèng duì zìjǐ yǒu bāngzhù de zīxùn, gǎishàn nín de tuìxiū guīhuà.*\n>\n> 就像买鞋子前会先逛一逛一样，看看哪一双最适合自己。\n> *Jiù xiàng mǎi xiézi qián huì xiān guàng yíguàng yíyàng, kànkan nǎ yīshuāng zuì shìhé zìjǐ.*\n>\n> 我们会把不同的方案和选择都摆出来，让您挑到**最适合您的那一套**。\n> *Wǒmen huì bǎ bùtóng de fāng'àn hé xuǎnzé dōu bǎi chūlái, ràng nín tiāo dào zuì shìhé nín de nà yī tào.*\n\n---\n\n**结尾问问题（预约）：**\n\n> 这种咨询**面对面**会比较清楚，所以想请问一下，您是住在**哪一带**呢？\n> *Zhè zhǒng zīxún miàn duì miàn huì bǐjiào qīngchǔ, suǒyǐ xiǎng qǐngwèn yíxià, nín shì zhù zài nǎ yí dài ne?*\n\n---\n\n💡 *在最近的商场咖啡厅安排会面，并通过 WhatsApp 确认。*" },
    ],
    sort_order: 4.7,
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
  {
    id: "follow-up-fb-cpf-info-only",
    stage: "Post-Call Text — FB Lead Wants Info Only (No Meeting)",
    category: "follow-up",
    target_audience: "pre-retiree",
    versions: [
      { author: "Golden Year Partners — Info Only (No Meeting Set)", content: "Hello (Lead Name)!\n\nCalled you earlier\n\nJust a brief overview of what we can go through:\n\n1) Ways to increase passive income during retirement\n\n2) Ways to reduce unnecessary expenses during retirement\n\n3) How to potentially optimise your CPF and existing resources\n\nWhich of these 1), 2), 3) are your retirement concerns?\n\nFor more info: http://consult.goldenyearpartners.com/\n\nWorst case is that you get more info and a yakun voucher, and the best case is that we can improve your current situation!" },
      { author: "Golden Year Partners — Called Multiple Times, Nudge to Meet", content: "Hello **[Name]**!\n\nCalled you earlier a few times but didn't manage to go through\n\nJust a brief overview of what we can go through:\n\n1️⃣ Ways to increase passive income during retirement\n\n2️⃣ Ways to reduce unnecessary expenses during retirement\n\n3️⃣ How to potentially optimise your CPF and existing resources\n\n**Which of these 1), 2), 3) are your retirement concerns?**\n\nFor more info: http://consult.goldenyearpartners.com/\n\nWorst case is that you get more info and a yakun voucher, and the best case is that we can improve your current situation!\n\nLet me know if we can schedule a meeting for **30–60 minutes** to go through the above" },
    ],
    sort_order: 6,
  },
  {
    id: "confirmation-fb-cpf-meeting-cn",
    stage: "Meeting Confirmation Text (Chinese) — Facebook Ad CPF Lead",
    category: "confirmation",
    target_audience: "pre-retiree",
    versions: [
      { author: "Golden Year Partners Script (中文)", content: "刚才的聊天很愉快，我这边已经为我们安排了会面时间：\n\n*日期/时间：*\n\n*地点：*\n\n*时长：*\n\n以下是我们将会讨论的内容简介：\n\n1) 如何在退休期间提升被动收入\n\n2) 如何减少退休后的不必要开支\n\n3) 如何更好地优化 CPF 及现有资源\n\n更多资讯可参考： http://consult.goldenyearpartners.com/\n\n最糟的情况是，你获得更多资讯和一张 Ya Kun 礼券；最好的情况是，我们能帮助你进一步改善目前的状况！\n\n我已经在行事历保留了这个时段，请回复\"ok\"以确认。\n\n期待与您的交流！" },
    ],
    sort_order: 7,
  },
  {
    id: "reschedule-pre-retiree",
    stage: "Rescheduling Text — Pre-Retiree (Missed Session)",
    category: "follow-up",
    target_audience: "pre-retiree",
    versions: [
      { author: "Leo's Script — Reschedule Nudge", content: "## 📲 Rescheduling Text — Missed Session\n\n*Use when the prospect didn't show up or the session couldn't be arranged*\n\n---\n\n> Hey **[Name]**, as we didn't manage to arrange a session with you, can we schedule another time slot at another time if you're not opposed to have more clarity on your retirement planning?\n>\n> There are recent changes in **CPF + Hospital plans** which will affect your retirement\n>\n> Just reply **\"ok\"** so that we can follow up further.\n>\n> ~Leo" },
    ],
    sort_order: 7.5,
  },
  {
    id: "confirmation-fb-cpf-meeting-v2",
    stage: "Meeting Confirmation Text V2 — Zoom Consultation",
    category: "confirmation",
    target_audience: "pre-retiree",
    versions: [
      { author: "Golden Year Partners Script V2", content: "Hi [name]\n\nI've scheduled your Retirement Planning Consultation session on\n\n**Time:** [date and time]\n**Location:** [insert location]\n\nHere's a brief overview of the meeting agenda for our discussion:\n\n• We'll be running you through our retirement readiness assessment to help you better ascertain your retirement readiness\n• We'll be covering how you could potentially optimise your CPF and resources to generate additional passive income streams for retirement, and\n• Address any questions you may have with regards to retirement planning.\n\nTo find out more: consult.goldenyearpartners.com and https://consult.goldenyearpartners.com/checklist\n\nA reminder will be sent to you 1 day before the session, and Zoom link will be sent to you on the date of the session itself 😊\n\nIf anything comes up and you need to reschedule, kindly let us know in advance so we can make the arrangement for you.\n\nLook forward to a productive session and wishing you a great day ahead!" },
    ],
    sort_order: 8,
  },
  {
    id: "confirmation-fb-cpf-meeting-v3-medical",
    stage: "Meeting Confirmation Text V3 — Medical Insurance Angle",
    category: "confirmation",
    target_audience: "pre-retiree",
    versions: [
      { author: "Golden Year Partners Script V3", content: "Hello (Lead Name)!\n\nGreat chat just now, and I've scheduled our meeting to be on:\n\n*Date/Time:*\n\n*Location:*\n\n*Duration:*\n\nJust a brief overview of what we will go through:\n\n• Go through the total expected impact of rising medical insurance premiums for your retirement\n\n• How to potentially optimise your CPF and resources to generate additional passive income streams to offset these rising costs\n\nFor more info: http://consult.goldenyearpartners.com/\n\nWorst case is that you can see how all these medical insurance premiums affect your retirement and best case is that we can help you offset these premiums during retirement!\n\nI've reserved the slot on my calendar, do kindly reply this message \"ok\" to acknowledge\n\nLooking forward to our chat!" },
    ],
    sort_order: 9,
  },
  {
    id: "confirmation-fb-cpf-meeting-v4-financial",
    stage: "Meeting Confirmation Text V4 — Financial Planning Angle",
    category: "confirmation",
    target_audience: "pre-retiree",
    versions: [
      { author: "Golden Year Partners Script V4", content: "Hello (Lead Name)!\n\nGreat chat just now, and I've scheduled our meeting to be on:\n\n*Date/Time:*\n\n*Location:*\n\n*Duration:*\n\nJust a brief overview of what we will go through:\n\n1) Changes in hospital plans and coverage\n\n2) How to potentially optimise your income and expenses to generate additional passive income streams\n\n3) Inefficiencies in your portfolio and potential risks that might derail your financial plans\n\nWorst case is that you get more clarity on your financial options and best case is that we can help to improve your situation :)\n\nI've reserved the slot on my calendar, do kindly reply this message \"ok\" to acknowledge\n\nLooking forward to our chat!" },
    ],
    sort_order: 10,
  },
  {
    id: "ad-campaign-fb-cpf-initial-text",
    stage: "Initial Text — Qualified Facebook Lead",
    category: "ad-campaign",
    target_audience: "pre-retiree",
    versions: [
      { author: "Golden Year Partners Script", content: "Hey [name],\n\nHi [name], I'm [your name] from Golden Year Partners. This is to let you know we've received your interest in our retirement planning resources.\n\nWe specialize in helping Singaporeans build simple and secure passive income and maximize their CPF and other assets to stay on track for retirement goals.\n\nFor more info on what are the topics we can discuss, you can refer here: https://consult.goldenyearpartners.com/ and https://consult.goldenyearpartners.com/checklist\n\nJust to check if I got the right person?\n\nCan I give you a quick callback around 6pm tonight to share more details?" },
    ],
    sort_order: 11,
  },
  {
    id: "cold-calling-young-adult-guidebook",
    stage: "Cold Calling — Financial Literacy Guidebook",
    category: "cold-calling",
    target_audience: "working-adult",
    versions: [
      { author: "Kenny's Script", content: "Hi XXX, I understand that you're currently studying or working now?\n\nOkay I'll just keep this call short, less than a minute.\n\nI'm Kenny from MoneyBees.\n\nWe are currently having a financial literacy campaign and we are giving away a free adulting guidebook specially for young adults, because we don't learn stuff like how to manage your money, budgeting and CPF in school.\n\nCan I send you more details on WhatsApp?\n\nAnd, on top of that, we can also do a quick zoom session with you this Saturday at 10am, and I'll be going through with you our adulting guidebook.\n\nOkay great, I'll send you a text after this call to confirm, and all you have to do is just to reply my WhatsApp, is that okay?\n\nSo just one last thing, this session is just for you to learn more, and as long as you learn something, then that's good enough.\n\nJust to check, how do I address you? (if no name).\n\n---\n\n## 📝 Notes\n\n- Please continually wish them all the best for their book in, book out, build rapport\n- Even after the call, you still need to text them, wish them, etc.\n- Also, our consultant will give a quick call later on to run through the materials. Will sometime later at 5/6pm be good?" },
      { author: "Short Script — Ebook + WhatsApp Permission", content: "Hello, is this [Name]?\n\nXXX here from TheMoneybees.\n\nWe are currently having a **financial literacy campaign** and we are giving away a **free adulting guidebook** specially for young adults.\n\nIs it possible if I send you more details through WhatsApp?\n\n---\n\n## 💡 Tips\n\n- **Important:** Emphasize giving away the **free adulting book** and sharing more details on WhatsApp so we can gain permission to send them more details.\n- These are **super cold leads** — they have never heard of us before. Because they don't know where we are from, it's hard to set appointments on the call.\n- By sending details and a **link to our Instagram**, they will be able to see that we are actually professional and have credibility, so it's **easier to set appointments from there**." },
      { author: "Telemarketer Script — Investing + Free Course", content: "Heyy this is [Name] from the MoneyBees, a financial education platform.\n\nI understand that you're currently studying or working now?\n\n*(Give them time to reply.)*\n\nOur team has been helping many young adults grow their money faster than the bank, and we've compiled everything into a **free online course**.\n\nAnd just to check, have you started investing already?\n\n---\n\n### If No:\n\n*(Relate to them and ask why)*\n\nAlright, so our consultant will share some insights on investments and how to **build up your wealth from scratch** even without a lot of money or time to do your own investments.\n\n### If Yes:\n\n*(Ask what they invest in and how it's going for them)*\n\nOur consultant will share some insights on **optimising your investments**.\n\n---\n\nWill sometime later at **5/6pm** be good for a quick callback by our consultant?\n\nOkay great, so as long as you learn something from this, then that's good enough.\n\nThank you so much for your time and have a great day!\n\n---\n\n## 📝 Notes\n\n- If they have no name: **\"By the way, how do I address you?\"** → then place their name in the CRM\n- If they ask **\"Where did you get my number?\"**: Reply: *\"You signed up for a campaign some time back, you probably forgot about it.\"*" },
    ],
    sort_order: 12,
  },
  {
    id: "cold-calling-working-adult-policy-review",
    stage: "Cold Calling — Policy Optimisation (Working Adults / Cold Leads)",
    category: "cold-calling",
    target_audience: "cold-lead",
    versions: [
      { author: "Gabriel's Script", content: "I'm [Name] from TheMoneyBees!\n\nI'll keep this call short, less than 1 minute! I understand that you have purchased some insurance or investment policies previously?\n\nThis is to inform you that we can help you **optimise your policies** from various companies — whether it's AIA, Great Eastern, Prudential, or Manulife — and send you a **financial report** after the session!\n\nAs most people attend, if they like the ideas, they will arrange a 2nd call. Anyway it's only a short meeting.\n\nWe have some slots still available for this — would weekdays or weekends work for you?\n\n---\n\n**After they reply:**\n\nAlright great, so I will schedule the session tentatively for this Saturday 10am. After this call, I will send you a text message, and all you have to do is to reply and acknowledge — is that okay?\n\nAlright great. So just one last thing, this session is just for you to find out more, and as long as you learn something, then that's good enough!\n\n---\n\n**If no name:**\n\nWhat is your name? / How do I address you?" },
    ],
    sort_order: 12.5,
  },
  {
    id: "cold-call-working-adult-existing-agent",
    stage: "Cold Call — Working Adults (Existing Agent / Follow-Up)",
    category: "cold-calling",
    target_audience: "cold-lead",
    versions: [
      { author: "MoneyBees Script", content: "Hi Sir/Mdm,\n\nI am doing a follow up call on behalf of my AIA consultant regarding financial planning. Previously he has called you and you were busy.\n\nI would like to help you schedule a short one-to-one Zoom call with my consultant on some new ideas on the topics of **saving and investment** which help people to achieve financial goals such as:\n\n- **Early retirement**\n- **Children's education**\n- **Holiday planning**\n\nHe has been in the industry for **10 years**.\n\nAs most people attend, if they like the ideas, they will arrange a 2nd call. Anyway it's only a short meeting.\n\n**Are you usually available on weekdays or weekends?**\n\n> *Proceed to lead prospect to a date and time.*" },
    ],
    sort_order: 12.6,
  },
  {
    id: "cold-call-working-adult-nasa",
    stage: "Cold Call — Working Adults (NASA / Campaign Version)",
    category: "cold-calling",
    target_audience: "working-adult",
    versions: [
      { author: "MoneyBees Script", content: "Hello! Is this [Name]?\n\nI'm [Name] from TheMoneybees!\n\nI'll keep this call short, less than 1 minute! Understand that you recently took part in a **[campaign]**?\n\nThis is a courtesy call to inform you that we have received your interest in participating in this campaign! To qualify, we will need to schedule a short **20–30 minute session**, where I will do a **financial health review** for you and send you a **report** afterwards.\n\nWould you prefer to meet on weekdays or weekends?\n\n---\n\n**After they reply:**\n\nAlright great, so I will schedule the session tentatively for this **Saturday 10am**. After this call, I will send you a text message, and all you have to do is to reply and acknowledge — is that okay?\n\nAlright great. So just one last thing, this session is just for you to find out more, and as long as you learn something, then that's good enough!" },
    ],
    sort_order: 12.7,
  },
  {
    id: "cold-calling-working-adult-fb-family",
    stage: "Cold Calling — Facebook Ad Lead (Working Adults / Parents)",
    category: "cold-calling",
    target_audience: "working-adult",
    versions: [
      { author: "Family Financial Planning Specialist V1", content: "## 📞 Cold Calling Script — FB Family Financial Planning Leads\n\n---\n\n### Opening\n\n> Hey, is this **[Name]**?\n>\n> We've received your interest via our **Facebook ad on family financial planning** — not sure if you recall that?\n>\n> Are you available now for a few mins quick chat?\n\n---\n\n### Personal Introduction + Value Proposition\n\n> I'm a **family financial planning specialist**, who is also a **mummy of two young kids**. I work very closely with many parents to help them optimize their **children's education fund** and **retirement setup** — both on the income side and the expense side. For example:\n>\n> ✅ Creating additional streams of **passive income** to fund their retirement or **children's education**\n>\n> ✅ Reviewing existing **insurance or retirement policies**\n>\n> ✅ Minimizing **unnecessary costs** that tend to creep up as we age\n\n---\n\n### Fact-Finding (Family & Education Fund)\n\n> Currently are you married and how many kids do you have? How old are they?\n>\n> Have you started saving for their **education fund**?\n>\n> - **If yes:** How are you saving it — via bank or investment?\n> - **If no:** What's holding you back from doing that?\n\n---\n\n### Insight Hook — Conservative Parents\n\n> Throughout our **20+ years of experience** in working with parents like yourself, we realized that many parents are afraid to lose money — hence have been very conservative when it comes to accumulating wealth.\n>\n> So we have curated some **insights and strategies** to help parents **reduce their investment risks** and at the same time **grow their money at a faster rate**.\n\n---\n\n### Zoom Session Pitch\n\n> Normally we do this over a **Zoom call**, where we show you different **options and variations** so you can see what's most suitable for your situation.\n>\n> At the very least, it's an **information-sharing session**. Worst-case, you walk away with the **NTUC voucher**. Best-case, you get insights that meaningfully improve your retirement strategy.\n>\n> Think of it like **window-shopping** before you buy a pair of shoes — you just want to explore options, compare, and see what fits you best.\n\n---\n\n### Booking\n\n> Not sure — would you prefer to have this Zoom call on a **weekday or weekend**? **Morning or afternoon**?\n\n---\n\n💡 *Confirm the time slot and send a WhatsApp message to lock in the appointment.*" },
    ],
    sort_order: 12.75,
  },
  {
    id: "cold-calling-working-adult-fb-voucher",
    stage: "Cold Calling — Facebook Voucher Ad Opt-In (Working Adults)",
    category: "cold-calling",
    target_audience: "working-adult",
    versions: [
      { author: "Golden Year Partners — Voucher Lead V1", content: "## 📞 Cold Calling Script — FB Voucher Leads (Working Adults)\n\n---\n\n### Opening\n\n> Hi, is this **[Name]**?\n>\n> I'm **[Your Name]**, a Retirement Specialist from **Golden Year Partners**. This is a courtesy call to inform you that we have received your interest in redeeming some **[voucher name]** vouchers recently! Is it a convenient time to speak now?\n\n---\n\n### Value Proposition\n\n> So I'll just keep this call short — I'm a retirement specialist and I help many people around your age to **retire earlier and faster**, by:\n>\n> ✅ Increasing your **passive income streams**\n> ✅ Reducing your **expenses**\n>\n> We specialise in helping Singaporeans create a **simple and secure passive income**, and discover ways to supplement their **CPF and other assets**, ensuring they're on track to meet their retirement goals.\n\n---\n\n### Policy Optimisation\n\n> And I believe you should have purchased many policies over the years, but these policies may not be effective for your retirement needs.\n>\n> So, we can help you **optimise some of them** and use these resources to create **additional streams of passive income**.\n\n---\n\n### Soft Close\n\n> The **worst case** is that this is an info session to get more clarity and insights about your situation — and the **best case** is that we can do something to actually **improve your situation**.\n>\n> Would sometime **this or next weekend** work better for you for a meetup?\n\n---\n\n### Objection Handling\n\n| Objection | Response |\n|---|---|\n| **\"No time\"** | Perhaps we can have a chat over a phone call — would **[date/time]** work to run through this with you? |\n| **\"Not sure of schedule\"** | Can I set a tentative timing, perhaps at **[date/time]**? Just to check — where is your nearest MRT? |\n\n---\n\n### Booking Confirmation\n\n> Alright, for now I'll tentatively place it on **[date/time]** at **[nearest mall/café]**, to run through your retirement planning.\n>\n> So just one last thing — this session is just for you to learn more about growing a **simple and secure passive income**, and as long as you learn something, then that's good enough!\n\n---\n\n### If Asked \"What's This About?\"\n\n> It's a **retirement planning consultation**. You can also read more here:\n>\n> 🔗 https://consult.goldenyearpartners.com/" },
    ],
    sort_order: 12.8,
  },
  {
    id: "callback-working-adult-parent",
    stage: "Callback Call — Working Adult / Parent Consultation (Telemarketer Set)",
    category: "follow-up",
    target_audience: "working-adult",
    versions: [
      { author: "Consultant Callback — Parent Angle + Shoe Analogy", content: "## 📞 Callback Script — Working Adult / Parent Consultation\n\n*Use when the telemarketer has already set a callback appointment with a working adult / parent prospect*\n\n---\n\n**Opening:**\n\n> Hey, is this **[Name]**?\n>\n> Great. This is regarding the **retirement planning consultation**. I believe my assistant spoke with you yesterday to arrange this call. I tried giving you a ring earlier, but you might've been tied up, so let me just give a quick introduction.\n\n---\n\n**Personal Introduction + Value Proposition:**\n\n> I'm a retirement specialist, who is also a **mummy of two young kids**, and I work very closely with many parents to help them optimize their retirement setup — both on the **income side** and the **expense side**. For example:\n>\n> ✅ Creating additional streams of **passive income** to fund their retirement or **children's education**\n>\n> ✅ Reviewing existing **insurance or retirement policies**\n>\n> ✅ Minimizing **unnecessary costs** that tend to creep up as we age\n\n---\n\n**Fact-Finding (Family):**\n\n> Are you married? How many kids do you have now? How old are they?\n>\n> Have you started planning for their **education fund**?\n\n---\n\n**Emotional Hook — Gift to Your Children:**\n\n> Many people know that retirement planning is important, but what many do not know is that **proper retirement planning is actually the greatest gift you can give to your children** — it helps ease their burden in supporting your future expenses when they need money the most.\n>\n> Imagine **10–20 years down the road**, your children will be getting married / BTO / forming their own family. That's the period where they need money the most, and if you do proper planning now, we can help you create an **asset** that generates a sum of money for you to help them with their expenses — or help yourself to **retire early**.\n\n---\n\n**Soft Close (Shoe Analogy):**\n\n> At the very least, it's an **information-sharing session**. Worst-case, you walk away with the **NTUC voucher**. Best-case, you get insights that meaningfully improve your retirement strategy.\n>\n> Think of it like **window-shopping** before you buy a pair of shoes — you just want to explore options, compare, and see what fits you best.\n>\n> That's what this consultation is about: showing you the different **options and variations** so you can see what's most suitable for your situation.\n\n---\n\n**Booking:**\n\n> For this kind of conversation, it works best to **meet in person**. Which area do you stay around?\n\n---\n\n💡 *Set the meeting at the nearest mall café and confirm via WhatsApp.*" },
    ],
    sort_order: 12.9,
  },
  {
    id: "confirmation-working-adult-consultation",
    stage: "Post-Call Text — Working Adult Consultation Confirmed",
    category: "confirmation",
    target_audience: "working-adult",
    versions: [
      { author: "Consultation Confirmation — Parent Angle V1", content: "Hey **[Name]**! 😊\n\nGreat chatting with you just now! I've marked my calendar for our meeting as per the following:\n\n📅 **Date/Time:** [Date/Time]\n\n📍 **Location:** [Location]\n\n⏱️ **Duration:** 30–60 min\n\n---\n\nWe'll be going through some of the following:\n\n✅ Creating additional streams of **passive income** to fund retirement or **children's education**\n\n✅ Reviewing existing **insurance or retirement policies**\n\n✅ Minimizing **unnecessary costs** that tend to creep up as we age\n\n---\n\nI've reserved the slot on my calendar — do kindly reply this message **\"ok\"** to acknowledge 🙏\n\nLooking forward to our chat!" },
    ],
    sort_order: 12.95,
  },
  {
    id: "cold-calling-ord-direct-agent",
    stage: "Cold Calling — ORD Personnel (Agent Direct Call)",
    category: "cold-calling",
    target_audience: "nsf",
    versions: [
      { author: "Agent Direct Script", content: "Hi, Is this _____?\n\nHello _____, My name is ____, and I'm a financial planner for many ORD-Personels, I understand you have completed your NS right?\n\n*(If Haven't Finished NS, check when and say we will call back in future)*\n\nAre you currently studying at UNI or working? *(Fact find a little — what are they studying, which school, which year, etc)*\n\nAlright, I'll keep this call short and let you know the purpose of the call. I'm calling because a few years ago, you indicated an interest in finding out more about ways to grow money faster than the bank. So, we currently have a free adulting and investing guidebook specially for ORD personnel. So if you're keen on receiving a copy of this book, there will be a fully online zoom session sometime this Saturday and Sunday 10am for us to go through, and afterwards we will be passing you a copy of the ebook.\n\n*[Always give them a choice of Yes or Yes, don't ask open-ended questions]*\n\n## If Not Sure of Schedule\n\nTell them: Ok, how about we tentatively set a time first on [date and time] — if you have any changes, you can update us on WhatsApp.\n\n**Example:** So would Wed 7pm work better for you?\n\n*(If they genuinely sound like they cannot set a time, tell them no worries, we will call them back next time.)*\n\nHow about Friday 2pm or Saturday 10am? *[prompt one more time if no]*\n\n## After Agreeing on Time\n\nAlright, what will happen next is that I'll drop you a WhatsApp text, and from there do acknowledge me through WhatsApp Ok? *(Pause 1 Second)*\n\nAnd do make sure to come for this session where time slots are specially allocated for you as most ORD Personnel do find it beneficial for them after they have attended!\n\nAlright then, see you this coming [date time]" },
    ],
    sort_order: 13,
  },
  {
    id: "cold-calling-young-adult-consultant",
    stage: "Cold Calling — Consultant Call (Young Adults)",
    category: "cold-calling",
    target_audience: "nsf",
    versions: [
      { author: "Gabriel's Script — Guidebook Angle", content: "Hello, is this [Name]?\n\nThis is Gabriel from TheMoneyBees Academy.\n\nWe are currently having a financial literacy campaign and we are giving away a free adulting guidebook specially for young adults, because we don't learn stuff like how to manage your money, budgeting and you know CPF in school.\n\nCan I send you more details on WhatsApp?\n\n---\n\n**If Yes:**\n\nAlright awesome, I'll send you a text later on, and we can chat there. 👍\n\n---\n\n**If Not Interested:**\n\nIt's a free adulting guidebook so there's no harm in finding out more. 😊" },
      { author: "Gabriel's Script — Free Course Angle", content: "Hello, is this [Name]?\n\nThis is Gabriel from TheMoneyBees Academy.\n\nWe just launched a free financial planning course and we created it because we don't learn about topics like budgeting and how to create wealth in school. It's a self-study course and currently it's completely free for young adults below 30 years old.\n\nJust to check, are you below 30?\n\n---\n\n**After they confirm:**\n\nOkay great, I'll be sending you more information about it over WhatsApp right after this call. Is that okay with you?\n\n---\n\n**If Yes:**\n\nAlright awesome, I'll send you a text later on, and we can chat there. 👍" },
    ],
    sort_order: 13.5,
  },
  {
    id: "cold-calling-young-adult-ads",
    stage: "Cold Calling — Instagram Ad Lead (Young Adults / NSF)",
    category: "cold-calling",
    target_audience: "nsf",
    versions: [
      { author: "Gabriel's Script — Ads V1 (Structured)", content: "Hey good evening, is this [Name]? How's your day today?\n\nThis is Gabriel from TheMoneyBees and I'm calling because you recently clicked on one of our Instagram ads about growing your money. Do you remember?\n\nThis call will only take 3 minutes of your time, can I check if that's okay for you? *(pause)*\n\n---\n\nOver the years, our team has helped many NSFs and regulars with their financial planning as well as investments — because these are things that you typically don't learn in school.\n\nI wanted to check on your availability sometime this week for a quick Zoom for me to share some insights regarding:\n\n• Proper financial planning\n• How to properly allocate your NS allowance\n• How to build up your wealth from scratch\n\nOf course I understand that army can be busy at times — that's why the sharing will be held over Zoom for about 30 minutes to make things more convenient for you!\n\nWould Saturday or Sunday at 7pm work for you?\n\n*(Alternative: How about Saturday/Sunday when you book out?)*" },
      { author: "Gabriel's Script — Ads V2 (Conversational)", content: "Heyy this is Gabriel from TheMoneyBees, recently you clicked on one of our Instagram ads about how to grow your money and investments. Do you remember?\n\nOkay, our team has been helping NSFs and regulars get more clarity on investments and being able to grow their money faster than the bank.\n\nHave you started investing already?\n\n---\n\n**If No:**\n\nAh okay, no worries — that's actually very common. Can I ask what's been holding you back? *(Relate to their situation, build rapport, understand their pain point)*\n\n**If Yes:**\n\nOh nice! What do you invest in? And how's it been going for you so far? *(Dig deeper — understand their experience, find gaps or frustrations to set your agenda)*\n\n---\n\n**Setting the appointment:**\n\nYou free next Sat 10am for me to share some insights on investments and how to build up your wealth from scratch — even without a lot of money?\n\nBecause there's a misconception that in order to become rich or build up your wealth, you need to earn like $10k a month — but you actually don't, if you have the right strategies.\n\n---\n\n**If Yes:** Great, let me set that on the calendar! 📅\n\n**If No:** No worries, when are you free then? Let me set it tentatively first.\n\n---\n\nOkay, I'll send you a WhatsApp message — then you just help me to reply to confirm, ah? 👍" },
    ],
    sort_order: 13.7,
  },
  {
    id: "cold-calling-young-adult-voucher",
    stage: "Cold Calling — Voucher Leads (Young Adults)",
    category: "cold-calling",
    target_audience: "nsf",
    versions: [
      { author: "Gabriel's Script — Voucher Leads", content: "## 📞 Cold Calling Script — Voucher Leads (Young Adults)\n\n### Opening\n\n> Heyy, is this _____?\n>\n> *(Wait for response)*\n>\n> Heyy, this is Gabriel from **TheMoneyBees**. Recently you clicked on one of our Instagram ads about **[voucher name]**.\n\n---\n\n### Value Prop\n\n> Okay, our team has been helping **[fresh grads / NSFs / regulars]** get more clarity on investments and being able to **grow their money faster than the bank**.\n\n---\n\n### Fact-Finding\n\n> Have you started investing already?\n\n**If No:**\n> Ah okay, no worries — that's actually very common. Can I ask what's been holding you back?\n>\n> *(Relate to them, build rapport, understand their pain point)*\n\n**If Yes:**\n> Oh nice! What do you invest in? And how's it been going for you so far?\n>\n> *(Dig deeper — find gaps or frustrations to set your agenda)*\n\n💡 *The goal here is to uncover their pain point to set your agenda for the appointment.*\n\n---\n\n### Setting the Appointment\n\n> You free next **Sat 10am** for me to share some insights on investments and how to **build up your wealth from scratch** — even without a lot of money?\n>\n> Because there's a misconception that in order to become rich or build up your wealth, you need to earn like **$10k a month** — but you actually don't, if you have the **right strategies**.\n\n**If Yes:** Great, let me set that on the calendar! 📅\n\n**If No:** No worries — check availability and **set tentatively**.\n\n---\n\n### Closing & WhatsApp Confirmation\n\n> Okay, I'll send you a **WhatsApp message** — then you just help me to reply to confirm, ah?\n>\n> See you, bye! 👋" },
      { author: "Kenny's Script — Yakun Voucher Leads", content: "## 📞 Cold Calling Script V2 — Yakun Voucher Leads\n\n### Opening\n\n> Hey **[Name]**!\n>\n> Hi, I'm **Kenny** from **Moneybees**. You've recently clicked onto our Instagram ads and done a survey to redeem some **Yakun vouchers** — do you remember?\n>\n> *(Wait for reply)*\n\n---\n\n### The Hook — Zoom + Guidebook\n\n> Hey great! I'll help you redeem it through a quick **20–30 min Zoom session** where I'll share more insights on **investments** and some ways where you can **grow your money faster than the bank**.\n>\n> After the session, I'll actually pass you our **investment guidebook** by our community. How would that sound?\n>\n> *(Wait for reply and adapt)*\n\n---\n\n### Fact-Finding\n\n> Have you started your own investing yourself already?\n>\n> *(Aim at their pain points — dig into why/why not, what they invest in, frustrations, goals)*\n\n---\n\n### Setting the Appointment\n\n> Would **Wed 3pm** or **Fri 5pm** be good for a Zoom session?\n\n---\n\n### Closing\n\n> Great! I'll just text you on **WhatsApp** with this number and you reply to me, okay? 👍" },
      { author: "MoneyBees — FB Voucher Opt-In Cold Call", content: "## 📞 Cold Calling Script — Facebook Voucher Opt-In (Young Adults)\n\n### Opening\n\n> Hi, is this **[Name]**?\n>\n> Hi this is **[Your Name]** from the **Moneybees**, an authorised representative of **AIA**! This is a courtesy call to inform you that we have received your interest in redeeming some **[name of vouchers]** vouchers recently! I believe we have texted you previously about it! Do you remember?\n>\n> *(Wait for reply)*\n\n---\n\n### The Hook — Zoom + Voucher + Guidebook\n\n> Great, in order to redeem it, you can attend a short **20-minute Zoom session**, whereby one of our consultants will share more about getting started on **growing your money and investing**.\n>\n> After the call, you will get the **vouchers** and an **investing and adulting guidebook** specially compiled by our organisation!\n\n---\n\n### Setting the Appointment\n\n> Would next **Saturday 9.30am** or **Sunday at 9.30am** be better for you for a quick call?\n>\n> *(Wait for reply)*\n\n**If both cannot make it:**\n> Ok, how about **next week** instead?\n\n**If still cannot:**\n> Ok we shall set it as **10am on Saturday** tentatively first, one of our consultants will drop you a text and follow up with your availability!\n\n---\n\n### Booking Confirmation\n\n> Alright great, so I will schedule the session tentatively for this **Saturday 10am** first, if this timing does not work for you anymore, you can just drop him a text and we can help you rearrange it!\n>\n> After this call, my manager will send you a text message, and all you have to do, is to **reply and acknowledge**, is that okay?\n>\n> *(Wait for reply)*\n\n---\n\n### No-Obligation Close\n\n> Alright great! So just one last thing, there is **no obligation** for you to start anything beyond this session, so long as you learn something, that's good enough for us!\n>\n> Ok thank you and have a nice day! 👋" },
      { author: "Casual Track — Quick Voucher Winner Call", content: "## 📞 Cold Calling Script — Voucher Winner (Casual Track)\n\n*For young adults who opted in from Facebook ads for vouchers. Replace **[Voucher Name]** with the relevant voucher.*\n\n---\n\n### Opening & Qualification\n\n> Hello, is this **[Name]**?\n>\n> I'll just keep this call short, less than a minute. Understand that you are studying or working now?\n>\n> I'm calling to inform you that you have qualified to win a **[Voucher Name]** from us, as you signed up for it recently.\n>\n> It might have been some time back, and you are one of the lucky winners.\n\n---\n\n### The Hook — Zoom + Guidebook\n\n> I know you're very busy, so to help you redeem the **[Voucher Name]**, all we have to do is just to conduct a **quick Zoom session** with you to share more about how we can help you **grow your money faster**.\n>\n> After the session, we will also pass you a copy of our **free investment guidebook**.\n\n---\n\n### Setting the Appointment\n\n> I'll just set the session tentatively this **Saturday morning at 10am** over Zoom, and we can always confirm closer to the date, is that okay?\n\n---\n\n### WhatsApp Confirmation\n\n> And after this call, I'll send you a **WhatsApp** to confirm, and you just need to help me to **reply the message** — is that okay?\n\n---\n\n### Name Check (If Unknown)\n\n> So just to check, how do I address you?\n>\n> *(Key it into the CRM)*\n\n---\n\n### No-Obligation Close\n\n> One last thing, as long as you **learn something** from the session, then that's good enough! So see you this **[date/time]**, and have a good day! 👋\n\n---\n\n### Objection: Where Are We From / How Did You Get My Number?\n\n> We are from **TheMoneybees**, we are a **financial education platform** for young adults. You might have clicked on an ad a while back." },
      { author: "Formal Track — Win Financial Group (Ya Kun Voucher)", content: "## 📞 Cold Calling Script — Ya Kun Voucher (Formal Track)\n\n*Professional phone-call track for young working adults who opted in for Ya Kun vouchers*\n\n---\n\n### Opening & Verification\n\n> **FSC:** Hi, may I speak with **[Prospect Name]** please?\n>\n> *(Pause for reply)*\n>\n> **Prospect:** Yes, who's this?\n>\n> **FSC:** Hi **[Prospect Name]**, this is **[Your Name]** from **Win Financial Group**. I'm calling about the **Ya Kun Kaya Toast voucher giveaway** for young working adults — do you recall registering for it?\n>\n> *(If calling same day they opted in, add \"earlier today\" at the end)*\n>\n> **Prospect:** Yes, I do.\n\n---\n\n### Congratulations & Verification\n\n> **FSC:** Great! Congratulations — you're among the **first 100 respondents**, so you qualify to receive the Ya Kun voucher.\n>\n> Before we proceed, I just need to verify a few details:\n>\n> - May I know your **age**?\n> - Are you currently **working**? *(build rapport)*\n\n---\n\n### Purpose Pitch\n\n> We're reaching out to young professionals like yourself to share practical tips on:\n>\n> - **Budget allocation**\n> - Setting clear **financial goals**\n> - Simple ways to **grow your savings** even at this early stage of your career\n>\n> We've spoken with many full-time national servicemen (NSFs) and regulars over the years, and we've found most appreciate some guidance to get started.\n\n---\n\n### Appointment Setup\n\n> Because of ongoing social-distancing guidelines, we can't meet in person. To pass you the voucher, we'd like to schedule a quick **30-minute video call** where we'll cover **\"Financial Planning for Young Working Adults\"** and show you how you can potentially make your savings work up to **60× harder** than standard bank rates.\n>\n> **FSC:** With that in mind, do you have a preferred date or any dates to avoid?\n>\n> *(Use these probes:)*\n> - Weekday or weekend — what suits you better?\n> - Are you working from home or the office?\n> - Would afternoon or evening be more convenient?\n\n---\n\n### Closing\n\n> One last thing — this session is **purely educational**. As long as you join, learn something useful, and walk away with fresh insights, we've done our job.\n>\n> Thank you, **[Prospect Name]**. I'll send you the video-call link shortly. Have a great week ahead! 👋\n\n---\n\n### ❗ Objection Handling\n\n**\"I'm not interested in financial planning.\"**\n\n> **FSC:** I understand — may I ask what makes you feel that way?\n>\n> *(Listen, empathise, and address the specific concern)*\n\n---\n\n**\"I already have my own plans and consultant.\"**\n\n> **FSC:** That's good to hear; most people we meet already have some coverage. You'd agree financial planning is important — that's why you set those plans up, right? *(wait for acknowledgement)*\n>\n> There'll be **no sales** during our session. If you're comfortable with the basics, we can focus on **wealth-building strategies** and options you might not have explored yet. No harm knowing what else is available, right?\n>\n> And as promised, we'll mail the Ya Kun voucher to you right after the session.\n>\n> With that in mind, when would be a convenient time for a short video call?\n\n---\n\n**\"Can I receive the voucher without the video call?\"**\n\n> **FSC:** The video call takes just about **20 minutes**, there's absolutely **no obligation** to sign up for anything, and you'll still receive the voucher afterwards.\n>\n> In fact, we often share **bonus resources and giveaways** during the session because we believe in adding value first." },
    ],
    sort_order: 13.75,
  },
  {
    id: "cold-calling-young-adult-non-voucher-fb",
    stage: "Cold Calling — Facebook Leads, Non-Voucher (Young Adults)",
    category: "cold-calling",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees — FB Non-Voucher Cold Call (NS Allowance)", content: "## 📞 Cold Calling Script — Facebook Leads, Non-Voucher (Young Adults)\n\n*For young adults who opted in from Facebook ads about growing their NS allowance / financial literacy (no free voucher)*\n\n---\n\n### Opening\n\n> Hi, is this **[Name]**?\n>\n> Hi, this is **[Your Name]** from the **Moneybees**, an authorised representative of **AIA**! This is a courtesy call to inform you that we have received your interest in learning about how to **grow your NS allowance** and I believe we have texted you previously about it! Do you remember?\n>\n> *(Wait for reply)*\n\n---\n\n### The Hook — Zoom + Guidebooks\n\n> Great, in order to redeem it, you can attend a short **20-minute Zoom session**, whereby one of our consultants will share more about getting started on **growing your money and investing**.\n>\n> After the call, you will get the **investing guidebook** and **adulting book** specially compiled by our organisation!\n\n---\n\n### Setting the Appointment\n\n> Would next **Saturday 9.30am** or **Sunday at 9.30am** be better for you for a quick call?\n>\n> *(Wait for reply)*\n\n**If both cannot make it:**\n> Ok, how about **next week** instead?\n\n**If still cannot:**\n> Ok we shall set it as **10am on Saturday** tentatively first, one of our consultants will drop you a text and follow up with your availability!\n\n---\n\n### Booking Confirmation\n\n> Alright great, so I will schedule the session tentatively for next **Saturday 10am** first, if this timing does not work for you anymore, you can just drop him a text and we can help you rearrange it!\n>\n> After this call, my manager will send you a text message, and all you have to do, is to **reply and acknowledge**, is that okay?\n>\n> *(Wait for reply)*\n\n---\n\n### No-Obligation Close\n\n> Alright great! So just one last thing, there is **no obligation** for you to start anything beyond this session, so long as you learn something, that's good enough for us!\n>\n> Ok thank you and have a nice day! 👋" },
    ],
    sort_order: 13.8,
  },
  {
    id: "faq-young-adult-objections",
    stage: "Objection Handling — Young Adults Cold Call",
    category: "faq",
    target_audience: "nsf",
    versions: [
      { author: "Team Objection Scripts", content: "## 1. \"Not interested\"\n\nI understand you may have some concerns. However, my main intention here is to just to help you get a financial headstart.\n\nDon't worry, it is just a short zoom session to help you understand more about financial literacy concepts and it is just a 20 mins session out of your 24 hours a day. So would [date and time] work?\n\n## 2. \"Is this compulsory?\"\n\nNo, however most ORD Personnel and Students who have already attended this session found it to be very beneficial right after they have attended. So it will be beneficial for you to attend now that you have finished NS. We can set a tentative date on say [date and time]. Which is more convenient for you? Do try to attend it as well as time slots are specially allocated for you.\n\n## 3. \"What is the session about?\"\n\nThis would be a session to learn more ways you can grow your money faster, so that you can gain a headstart in your career compared to your peers.\n\nSo would [date and time] work better for you?\n\n## 4. \"Is this a sharing session? Or a 1:1 session? Do you have any link?\"\n\nYes this will be a group session whereby it will be quite an interactive session to go through some of the potential career options for you, of which many other ORD Personnel or Students have found it to be really beneficial for them. So would [date and time] work better for you?\n\n## 5. \"How did you get my number?\"\n\nYou actually signed up for an interest form about 2 years back, either during your enlistment or nearing your ORD. Do you still recall?\n\n*If they say No:* Oh, many of the other guys do actually remember signing up for this, but no worries haha *(then go back to setting a time)*\n\n## 6. \"Which organisation are you calling from?\"\n\nI'm actually calling from AIA, it's one of the largest financial institutions in Singapore and Asia, where we have been in the financial services industry for almost 100 years.\n\n## 7. \"What is your name, want to complain\"\n\n*(At most give your first name — do NOT give your contact or mobile number)*\n\nHi Joshua XXX, I understand your frustration however this is just a service call to check if you are keen to understand how to better explore your internship and career options. I apologise for the inconvenience caused, if any.\n\n**Then HANG UP** — the more you talk the more they will try to find trouble." },
    ],
    sort_order: 14,
  },
  {
    id: "follow-up-fb-voucher-opt-in",
    stage: "Initial Text — Facebook Voucher Lead (Just Opted In)",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "McDonald's Voucher — Text 1 (Verification)", content: "## 📲 Text 1 — McDonald's Voucher FB Lead\n\n*Send immediately when the Facebook lead opts in*\n\n---\n\n> Hey! Just checking — is this **[Name]**? I'm checking regarding this **McDonald's campaign survey** you recently completed!\n\n---\n\n### 📎 Attach This Ad Flyer\n\n![McDonald's Voucher Ad](/scripts/mcdonalds-voucher-ad.png)" },
      { author: "McDonald's Voucher — Text 2 (Campaign Intro)", content: "## 📲 Text 2 — McDonald's Voucher Campaign Intro\n\n*Send after Text 1, or as a standalone intro*\n\n---\n\n> Hi! Gerald here, I am from **Moneybees Academy**. I just wanted to share with you more about what this campaign is about.\n>\n> Basically we're doing a **free investment sharing** and as a bonus you will be able to get a **free McDonald's voucher**!\n\n---\n\n### 📞 Follow-Up Rules\n\n| Scenario | Action |\n|---|---|\n| **Lead replies** | Give a **call immediately** to set an opening appointment **on the same day** |\n| **Lead does not reply** | Give a call after **2–3 days** to try and set an opening appointment |" },
      { author: "Yakun Voucher — Initial Text", content: "## 📲 Initial Text — Yakun Voucher FB Lead\n\n*Send immediately when the Facebook lead opts in*\n\n---\n\n> Hi **[Name]**,\n>\n> This is Gerald from **TheMoneyBees Academy**!\n>\n> You did a quick survey online for you to redeem **Yakun Vouchers**.\n>\n> Just want to check if I got the right person?" },
      { author: "Generic Freebie — Initial Text (With Verification)", content: "## 📲 Initial Text — Freebie FB Lead (Generic)\n\n*Send immediately when the Facebook lead opts in from any freebie ad*\n\n---\n\n> Hi **[Name]**,\n>\n> This is **[Your Name]** from **TheMoneyBees**! 😊\n>\n> You recently completed a short survey online to redeem your **[vouchers]**. I just wanted to confirm if I've reached the right person.\n>\n> From your details, I understand that you're **[age]** and expected to ORD in **[year]** — is that correct?" },
      { author: "Yakun Voucher — Initial Text (With Age/ORD Verification)", content: "## 📲 Initial Text — Yakun Voucher FB Lead (With Verification)\n\n*Send immediately when the Facebook lead opts in for Yakun Vouchers*\n\n---\n\n> Hi **[Name]**,\n>\n> This is **[Your Name]** from **TheMoneyBees**! 😊\n>\n> You recently completed a short survey online to redeem your **Yakun Vouchers**. I just wanted to confirm if I've reached the right person.\n>\n> From your details, I understand that you're **20 years old** and expected to **ORD in 2026** — is that correct?\n\n---\n\n*(Wait for reply before continuing)*\n\n### 📎 Attach This Ad Flyer\n\n![Ya Kun Voucher Ad](/scripts/yakun-voucher-ad.png)" },
    ],
    sort_order: 14.5,
  },
  {
    id: "post-call-reminders-voucher-lead-young-adult",
    stage: "Post-Call & Reminders — Voucher Lead Full Sequence (Young Adults)",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "Gerald's Voucher Lead Sequence — Post-Call + Reminders", content: "## 📲 Full Voucher Lead Texting Sequence — Post-Call & Reminders\n\n*For young adult freebie/voucher Facebook leads. Replace **[voucher name]** with the relevant voucher (Yakun, McDonald's, etc.)*\n\n---\n\n### 📞 Initial Text — After Lead Opts In\n\n> Hi **[Name]**,\n>\n> This is Gerald from **TheMoneyBees Academy**!\n>\n> You did a quick survey online for you to redeem **[Voucher Name]** Vouchers.\n>\n> Just want to check if I got the right person?\n\n---\n\n### 📋 Follow-Up Rules\n\n| Scenario | Action |\n|---|---|\n| **Lead replies** | Give a **call immediately** to set an opening appointment **on the same day** |\n| **Lead does not reply** | Give a call after **2–3 days** to try and set an opening appointment |\n\n---\n\n### 📲 Text 2 — Post-Call Acknowledgement\n\n*Send immediately after the cold call*\n\n> Hi **[Name]**, thank you for picking up the call with me just now, I have set our appointment for **[Date, Time]**. As mentioned, the call will take around **20–30 mins**. During the call, I will share with you some practical tips on how to **invest and grow your money** faster than if you left it in the bank.\n>\n> Additionally, I will share with you **2 resources** that my team has produced which will share with you what schools never taught you about money, and smart strategies to start investing and building wealth.\n>\n> Also, our team aims to help young adults with investments and teach them useful money tips!\n>\n> This is our website and Instagram! 😁😁\n>\n> 🔗 https://themoneybees.co/\n>\n> 📸 https://www.instagram.com/moneybeesacademy/?hl=en\n\n---\n\n### 📲 Text 3 — Reminder 1 (Week Before)\n\n> Hey **[Name]**! Just a quick reminder that our Zoom session is coming up next week on **[date, time]**. Super excited to meet you to share more about how to grow your wealth and help you redeem your **[voucher name]** voucher! 🙌\n>\n> Let me know if the time still works for you! 😊\n\n---\n\n### 📲 Text 4 — Reminder 2 (Day Before)\n\n> Hello **[Name]**! Just a reminder that our Zoom session is happening tomorrow at **[time]**! Looking forward to meeting you soon!\n>\n> Do let me know if you are unable to attend the meeting later and we can reschedule it if necessary!\n\n---\n\n### 📲 Text 5 — Reminder 3 (Few Hours Before)\n\n> Hey **[Name]**! Our meeting will be starting in a few hours! Can't wait to meet you and share with you more regarding **investments and growing your wealth**! Do inform me if you are no longer able to attend the meeting!\n>\n> See you soon! 👋" },
    ],
    sort_order: 14.55,
  },
  {
    id: "missed-call-fb-lead",
    stage: "Missed Call Text — Facebook Ad Lead (Didn't Pick Up)",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "V1 — Open-Ended Callback", content: "## 📲 Missed Call Text — FB Lead Didn't Pick Up\n\n*Send immediately after a missed call attempt*\n\n---\n\n> Hey! Just dropped you a call just now! I wanted to share with you more about this campaign and what we're doing! I would love to share more with you about what we are doing!\n>\n> Do let me know if I caught you at a bad time and if there is a better time to call back!" },
      { author: "V2 — Suggest Callback Time", content: "## 📲 Missed Call Text — FB Lead (With Suggested Time)\n\n*Send immediately after a missed call attempt — propose a specific callback time*\n\n---\n\n> Hey! Just dropped you a call just now! I wanted to share with you more about this campaign and what we're doing! I would love to share more with you about what we are doing!\n>\n> Do let me know if I caught you at a bad time! Could I also give you another call at **[time, date]**?" },
    ],
    sort_order: 14.6,
  },
  {
    id: "initial-text-young-adult-fb-qualified",
    stage: "Initial Text — Facebook Qualified Lead (Young Adults, Non-Voucher)",
    category: "ad-campaign",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees — Qualified FB Lead + A/B Scheduling", content: "## 📲 Initial Text — Qualified Young Adult FB Lead\n\n*Send when a young adult opts in from Facebook ads (non-voucher, qualified lead)*\n\n---\n\n> Hey **[Name]**! We're from the @moneybeesacademy! 👋\n> 🔗 https://www.instagram.com/moneybeesacademy\n>\n> Think you saw our ads just recently about helping young adults grow their money.\n>\n> We help young adults & NSFs develop a greater understanding of **financial literacy**, that's why we are giving away this **free adulting guidebook**, and also created an online community:\n> 🔗 https://www.skool.com/finternship/about\n>\n> We are offering a **free 20-minute Zoom consultation** alongside our guidebook.\n>\n> **This is what you will be getting after the 20min session:**\n>\n> 🔥 Clarity from doing a **comprehensive financial health check**\n>\n> 🧠 Walk you through the **key financial concepts** from the guidebook\n>\n> 🌟 Explore how these concepts directly apply to **your personal circumstances**\n>\n> Our goal is to ensure you leave the session empowered with **actionable knowledge** tailored to your needs.\n>\n> There's absolutely **no obligation** beyond this free consultation.\n>\n> Would you be free for a quick **30 min Zoom session**? Best to do it now rather than next time when things get even busier.\n>\n> I've scheduled your session for **[Confirmed Date & Time A]**, or **[Confirmed Date & Time B]** — will any of these timings work for you?\n>\n> Do reply **\"A\"** or **\"B\"** to indicate which time you prefer 😊\n>\n> I'll also pass you these books, I think you'll learn a lot from it 😊\n>\n> *[Insert the books]*" },
    ],
    attachments: [
      { label: "Free Ultimate Guide to Adulting", url: "/scripts/free-adulting-guide-ebook.png", type: "image" },
      { label: "Free Ultimate Guide to Investing", url: "/scripts/free-investing-guide-ebook.png", type: "image" },
      { label: "MoneyBees Crash Course Bundle", url: "/scripts/moneybees-crash-course-bundle.png", type: "image" },
    ],
    sort_order: 14.5,
  },
  {
    id: "follow-up-young-adult-post-call",
    stage: "Post-Call Text — Young Adults Cold Call",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script — V1 (Casual)", content: "Hey [name]! I think my assistant gave you a call earlier today. We are doing a financial literacy campaign for young adults and ORD personnel. You can find out more here and we will explain more about it during a quick 5min interview call. https://www.skool.com/finternship/about\n\nAnyways we are from the @moneybeesacademy! https://www.instagram.com/moneybeesacademy\n\nBased on the call we had with you earlier, you should be quite young also right? I mostly speak to young adults about financial literacy, money management, and self improvement. These are things not taught in school or commonly discussed.\n\nPeople who sign up are usually pretty motivated to learn about investing & financial literacy. Do let me know if the quick 5 minute call [INSERT DATE] as mentioned is fine with you later on!" },
      { author: "Gabriel's Script — V2 (Guidebook + Consultation)", content: "Hello, [Name]!\n\nThis is Gabriel from TheMoneyBeesAcademy!\n\nhttps://www.instagram.com/moneybeesacademy\n\nWe spoke on the phone earlier about our financial literacy campaign. Our goal is to help young adults develop a greater understanding of financial literacy, that's why we are giving away this free adulting guidebook and created a financial literacy community: https://www.skool.com/finternship\n\nWe want to raise awareness and educate more youths on the power of financial literacy, as well as empower them to take charge of their (financial) lives! 💪\n\n---\n\nAs part of our commitment to enhancing your financial literacy, we are offering a **free 20-minute Zoom consultation** alongside our guidebook. This personalised session allows us to adapt the insights from the guidebook to your unique financial situation and goals — providing far more value than reading the book on its own.\n\n**During your consultation, we will:**\n\n✅ Perform a comprehensive financial health check\n✅ Walk you through the key financial concepts from the guidebook\n✅ Explore how these concepts directly apply to your personal circumstances\n\nOur goal is to ensure you leave the session empowered with actionable knowledge tailored to your needs.\n\nThere's absolutely no obligation beyond this free consultation — it's simply our way of ensuring you get the most from our resources. Does that sound fair? 😁\n\n---\n\nHere are the resources you'll be receiving after the consultation!\n\nThis is our Instagram: https://www.instagram.com/moneybeesacademy/\nAnd website: https://themoneybees.co/" },
      { author: "Benjamin's Script — V3 (Detailed + Time Slots)", content: "Hi [Name]! 👋\n\nThis is Benjamin from MoneyBees Academy.\nhttps://www.instagram.com/moneybeesacademy\n\nWe spoke / My assistant spoke to you earlier about our financial literacy campaign, and I wanted to follow up with more details. Our goal is to help young adults and NSFs like you gain a stronger understanding of financial literacy. That's why we're giving away this free adulting guidebook as part of our mission.\n\n---\n\nAs part of this campaign, we also provide a **free 20-minute Zoom consultation** to personalise the insights from the course to your unique goals. Here's what we'll cover during the session:\n\n1️⃣ A comprehensive financial health check\n2️⃣ Key takeaways from the course, explained step-by-step\n3️⃣ Personalised advice tailored to your financial situation\n4️⃣ Answers to your questions about savings, investments, and more\n\n---\n\nHere are the resources you'll unlock after the consultation:\n\n*(Insert ebook)*\n\nThis is a great opportunity to gain actionable insights and begin a solid foundation for your financial future — all completely free 💪\n\nWe believe you'll find the session enlightening and directly relevant to your financial journey. It's completely free, with no obligations — it's simply our way of helping you get the most out of our resources. 😊\n\nWould next **Saturday at 10am or 2pm**, or **Sunday 2pm** work for you? If you prefer a different timing, do let me know too! Would love to know what timing suits you best!" },
      { author: "MoneyBees Script — V4 (Cold Lead + Interview Call)", content: "Hey [Name]! I think my assistant gave you a call earlier today. We help young adults learn more about financial planning, and have compiled a list of online resources for it, all in one place.\n\nYou can find out more here and we will explain more about it during a quick 5min interview call later at **[Date/Time]**:\nhttps://www.skool.com/finternship/about\n\nAnyways we are from the @moneybeesacademy!\nhttps://www.instagram.com/moneybeesacademy\n\nBased on the call we had with you earlier, you should be quite young also right? I mostly speak to young adults about financial literacy, money management, and self improvement. These are things not taught in school or commonly discussed.\n\nJust to check if I have the right person? 😊" },
    ],
    attachments: [
      { label: "Free Ultimate Guide to Adulting", url: "/scripts/adulting-guide.png", type: "image" },
      { label: "Free Ultimate Guide to Investing", url: "/scripts/investing-guide.png", type: "image" },
    ],
    sort_order: 15,
  },
  {
    id: "follow-up-young-adult-free-course",
    stage: "Post-Call Text — Free Course Angle (WhatsApp Follow-Up)",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "Gabriel's Script", content: "Hey [Name]! Thanks for taking my call just now 😊\n\nAs mentioned, we just launched a **free financial planning course** for young adults under 30 — it's completely self-study so you can go at your own pace.\n\n📚 **Here's your free access link:**\nhttps://www.skool.com/finternship/about\n\nInside the course you'll learn:\n• How to budget and manage your money properly\n• The basics of investing (even with small amounts)\n• How to make your CPF work harder for you\n• Wealth-building strategies that don't require a high salary\n\n---\n\nOn top of the course, I'd also love to do a quick **30-min Zoom session** with you to go through some personalised insights based on your situation.\n\nWould [DATE] at [TIME] work for you? Just reply \"Yes\" to confirm and I'll get it sorted! 👍\n\nIn the meantime, feel free to check out the course and our community — we're also on Instagram: https://www.instagram.com/moneybeesacademy\n\nChat soon!\n— Gabriel" },
    ],
    sort_order: 15.2,
  },
  {
    id: "nudge-young-adult-no-reply",
    stage: "No-Reply Nudge — Young Adults (After Post-Call Text)",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script — Day 1", content: "Hey [Name]! 👋\n\nJust following up on my earlier message — did you manage to check it out?\n\nNo pressure at all, just wanted to make sure you didn't miss it! We're running the free financial literacy session this week and I thought it'd be really useful for you.\n\nLet me know if you're keen and I'll sort out a time that works for you 😊" },
      { author: "MoneyBees Script — Day 3", content: "Hey [Name], just me again! 😄\n\nI know life gets busy (especially in camp 😅) so just a quick nudge — the free financial literacy session is still open for you.\n\nHonestly, most of the guys who attend tell me they wish they'd started learning about money earlier. It's only 30 mins on Zoom and you'll walk away with:\n\n• A clearer picture of how to grow your money\n• Access to our free course on investing & personal finance\n• A $20 voucher just for attending\n\nWorth a shot right? Just reply with a day/time that works and I'll lock it in for you 👍" },
      { author: "MoneyBees Script — Day 7 (Final)", content: "Hey [Name]! Last message from me, I promise 😂\n\nJust wanted to give you one last chance to grab a spot for our free financial literacy session before I move on to the next batch.\n\nNo strings attached — it's a 30-min Zoom session where I share how young adults can start building wealth even with a small amount. Plus you get free access to our course and a $20 voucher.\n\nIf you're interested, just drop me a \"Yes\" and I'll arrange everything. If not, totally cool too — all the best! 🙏" },
    ],
    sort_order: 15.5,
  },
  {
    id: "ad-campaign-mcd-young-adult-initial",
    stage: "Facebook Ad — McDonald's Campaign Initial Text (Young Adults)",
    category: "ad-campaign",
    target_audience: "nsf",
    versions: [
      { author: "Gerald's Script — Initial Text", content: "Hey! just checking is this **[Name]**? I'm checking regarding this McDonald's campaign survey you recently completed!" },
      { author: "Gerald's Script — Campaign Intro", content: "Hi! Gerald here, I am from Moneybees Academy. I just wanted to share with you more about what this campaign is about. Basically we're doing a **free investment sharing** and as a bonus you will be able to get a **free McDonald's voucher**!\n\n---\n\n### 📝 SOP\n\n- **If the lead replies** → Give a call to set an opening appointment **on the same day**\n- **If the lead does not reply** → Give a call after **2–3 days** to try and set an opening appointment" },
      { author: "Chris's Script — Full FB Ad Texting Sequence", content: "## 📱 Full Texting Sequence — McDonald's / Ya Kun FB Ad (Young Adults)\n\n---\n\n### Text 1 — Initial Check\n\n> Hi is this **[Name]**?\n>\n> This is Chris from the MoneyBees, an authorised representative of AIA 😊\n>\n> You recently indicated interest in our financial literacy campaign to redeem some free McDonald's vouchers. Where you can learn about investing and learn ways to grow your money faster than the bank.\n>\n> Just to confirm—is this the right person?\n\n---\n\n### Text 2\n\n*[Wait for reply]*\n\n---\n\n### Text 3 — Rapport Building\n\n> Hi **[Name]**, Nice to meet u! May I ask what u are doing in life rn?\n\n---\n\n### Text 4 — Personal Introduction\n\n> Ya so as for myself, I actually just ORDed last year, so I'm probably about the same age as you! I started working full-time with AIA as a financial advisor, and now I help NSFs & young Singaporeans like you figure out how to save, invest, and manage money smarter! My organisation, the MoneyBees aims to help young adults and teenagers with investments and teach them useful money tips!\n\n---\n\n### Text 5 — Credibility Links\n\n> This is our website and Instagram!\n>\n> https://themoneybees.co/\n>\n> https://www.instagram.com/moneybeesacademy/?hl=en\n\n---\n\n### Text 6 — Campaign Pitch\n\n> Ya haha so the ad u clicked is actually part of financial literacy campaign aimed to help young adults like yourself! You're eligible to redeem your Ya Kun voucher through a quick completely free 20-minute Zoom session where I'll share a quick introduction on how you can grow your money through investing!\n\n---\n\n### Text 7 — Booking\n\n> Would you be available for a short call next **Saturday at 9.30am** or **Sunday at 9.30am** to redeem it?\n\n---\n\n### Text 8 — Confirmation\n\n> Great see you then! If closer to the date, you need to reschedule just let me know! I will send out the meeting details closer to the date!\n\n---\n\n### Text 9 — E-Book Teaser (After Reminder)\n\n> During the call, you will also receive **2 free E-books** specially compiled by our company that we feel is greatly beneficial to help young Singaporeans out financially! 1 is about adulting and another is about investing!\n\n---\n\n### Text 10\n\n> **Adulting book:**\n> *(Attach adulting ebook image)*\n\n---\n\n### Text 11\n\n> **Investing book:**\n> *(Attach investing ebook image)*\n\n---\n\n### Text 12 — Warm Close\n\n> I am looking forward to chatting with you and sharing money tips to grow your wealth and the steps to redeem your free McDonald's voucher! Let me know if the time still works or if you need to shift it slightly!\n>\n> Hope to see you soon! Have a nice day! :)" },
    ],
    attachments: [
      { label: "McDonald's Voucher Ad", url: "/scripts/mcdonalds-voucher-ad.png", type: "image" },
      { label: "Free Ultimate Guide to Adulting", url: "/scripts/adulting-guide.png", type: "image" },
      { label: "Free Ultimate Guide to Investing", url: "/scripts/investing-guide.png", type: "image" },
    ],
    sort_order: 11.5,
  },
  {
    id: "follow-up-mcd-young-adult-post-call",
    stage: "McDonald's Campaign — Post-Call & No-Pickup Texts (Young Adults)",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "Acknowledgement Text (Mcd2) — After Pickup", content: "Hi **[Name]**, thank you for picking up the call with me just now, I have set our appointment for **[Date, Time]**. As mentioned, the call will take around 20-30mins. During the call, I will share with you some practical tips on how to invest and grow your money faster than if you left it in the bank.\n\nAdditionally, I will share with you 2 resources that my team has produced which will share with you what schools never taught you about money, and smart strategies to start investing and building wealth.\n\nAlso, our team aims to help young adults with investments and teach them useful money tips!\n\nThis is our website and Instagram! 😁😁\n\nhttps://themoneybees.co/\n\nhttps://www.instagram.com/moneybeesacademy/?hl=en" },
      { author: "No-Pickup Text — V1 (Open-Ended)", content: "Hey! Just dropped you a call just now! I wanted to share with you more about this campaign and what we're doing! I would love to share more with you about what we are doing! Do let me know if I caught you at a bad time and if there is a better time to call back!" },
      { author: "No-Pickup Text — V2 (Suggest Callback Time)", content: "Hey! Just dropped you a call just now! I wanted to share with you more about this campaign and what we're doing! I would love to share more with you about what we are doing! Do let me know if I caught you at a bad time! Could I also give you another call at **[time, date]**?" },
    ],
    sort_order: 15.3,
  },
  {
    id: "follow-up-mcd-young-adult-reminders-noreply",
    stage: "McDonald's Campaign — Reminders & No-Reply Texts (Young Adults)",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "Chris's Reminder 1 — Week Before", content: "Hey **[Name]**! Just a quick reminder that our Zoom session is coming up next week on **[date, time]**. Super excited to share money tips with you to grow your money and help you redeem your McDonald's voucher! 🙌\n\nLet me know if the time still works for you! 😊" },
      { author: "Chris's Reminder 2 — Day Before", content: "Hey **[Name]**! Just a reminder that our Zoom session is happening soon at **[time]**! Looking forward to chatting with you and sharing money tips to grow your wealth and the steps to redeem your free McDonald's voucher ✨\n\nLet me know if the time still works or if you need to shift it slightly!" },
      { author: "Chris's No-Reply 1 — NSF Angle", content: "Hey **[Name]**! Just wanted to follow up in case you missed my last message. Totally understand if you're busy!\n\nJust to let you know what it is that I do, I am a certified financial consultant with AIA who helps NSFs and young adults with growing their wealth faster than the bank!\n\nOver the years, my company has helped many NSFs kickstart their investment journey by growing their NS allowance after they ORD. So if u would like to explore more about investments and take this chance to redeem a free McDonald's voucher, we can schedule a zoom call sometime this weekend when u book out for you to find out more! 😊😊" },
      { author: "Chris's No-Reply 2 — Voucher Angle", content: "Hey **[Name]**! Just wanted to follow up in case you missed my last message. Totally understand if you're busy!\n\nI just didn't want you to miss this—you're eligible to win a McDonald's voucher, and all it takes is one short Zoom session.\n\nDuring the session, I'll share simple strategies on growing your money even if you're just getting started, and you'll get access to some free resources that have helped many others too.\n\nWould sometime next week work for a quick chat on Zoom? 😊" },
    ],
    sort_order: 15.35,
  },
  {
    id: "follow-up-young-adult-scheduled",
    stage: "Scheduled Follow-Up Texts — Young Adults (Every 2 Days)",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "1st Follow-Up (Day 2)", content: "Hey [Name]! Hope you're doing well. I understand things can get busy.\n\nJust wanted to follow up on my previous message about helping young adults like yourself with their finances. I truly believe in the importance of financial literacy, especially for individuals in your age group.\n\nI would love to meet with you on Zoom next week on **Saturday at 11am or 2pm** or **Sunday at 2pm** to touch on points like early retirement, savings, and investments. I'll pass you the free financial planning course during our short 20-minute consultation.\n\nI'm confident you'll learn something new 😊" },
      { author: "2nd Follow-Up (Day 4)", content: "Hey [Name]! Just wanted to reach out one more time to make sure you didn't miss my previous messages. I know life gets busy, but I'd love to connect and share some valuable financial insights that could really set you up for the future.\n\nThis isn't just about completing a financial planning/literacy course — during our **free 20-minute Zoom session**, I'll help you look at your financial goals and provide personalised advice that's relevant to your current situation. Many young adults and NSFs have found it to be eye-opening and really helpful, and I think you'd benefit too! 💪\n\nWould you be available next **Saturday at either 10am or 2pm** or **Sunday at 2pm**? If another time works better, feel free to let me know!\n\nLooking forward to the chance to chat and empower you with some great financial tools 😊" },
      { author: "3rd Follow-Up (Day 6 — Final)", content: "Hi [Name], I hope you're doing well! 😊\n\nJust wanted to follow up one last time about our free financial planning course and consultation. I completely understand if you've been busy, but I didn't want you to miss out on this opportunity.\n\nThis free Zoom session isn't just about finances — it's about helping young adults like you take control of your future. Whether it's learning how to save smarter, plan for early retirement, or start investing, we'll cover it all in just 20 minutes.\n\nIf you're interested, I have availability next **Saturday at 10am or 2pm** and **Sunday at 2pm**. If another time works better, let me know!\n\nLooking forward to helping you kick-start your financial journey 💪\n\n---\n\n*📝 After 2 follow-ups with no reply → mark lead as \"Texting but no reply\" in CRM.*" },
    ],
    sort_order: 15.7,
  },
  {
    id: "confirmation-young-adult-zoom",
    stage: "Post-Call Text — Young Adults Agreed to Zoom",
    category: "confirmation",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script — V1 (Bonus Resources)", content: "Hi [Name], this is [Your Name]\nThanks for taking the call just now with my assistant 😊\n\nAs spoken we're scheduled for a financial literacy zoom session.\n\n**Date:** [DATE]\n**Time:** [TIME]\n**Duration:** 30 minutes\n**Location:** Zoom\n\nHere's what you'll gain after the 30 minute zoom session:\n\n🔥 Access to hours of materials from the world's best minds in our community at https://www.skool.com/finternship/about\n\n🧠 Learn the money language schools never teach\n\n🌟 Strategies to fast-track your wealth, passively.\n\nJust reply \"Yes\" to confirm this timing and we're all set!\n\nLooking forward to chatting with you then! 👍\n\n---\n\nAs a bonus, you will also get these resources after the consultation. And you can even redeem a $20 voucher after the session!\n\n*(Attach the 3 promotional images below when sending this text)*" },
      { author: "MoneyBees Script — V2 (Fact-Finding)", content: "Great! I'll see you next **[DAY], [DATE]**, at **[TIME]** on Zoom, for our short 20-min chat after which you will get access to our financial planning course 📚\n\n---\n\nJust to get a better idea of which stage of life you are currently in and for us to prepare for the upcoming meeting, may I ask:\n\n1️⃣ Are you currently 25 years old or younger?\n\n2️⃣ Are you currently working / in university / serving NS?\n\n3️⃣ Are you expecting any significant milestones, e.g., graduation, ORD, new job, marriage?\n\n---\n\nFinally, please do save my number so that you know when it's me when I share new resources or any updates in the future. Thank you! ☺️" },
      { author: "MoneyBees Script — V3 (Short + Professional)", content: "Hi [Name], thank you for your time chatting with me earlier. I will see you on **[Date & Time]** for our scheduled Zoom call. I will send you the Zoom link closer to the date.\n\nPlease let me know if the timing still works for you or if any adjustments are needed.\n\nTake care and see you soon! 😊" },
    ],
    attachments: [
      { label: "Free Ultimate Guide to Adulting", url: "/scripts/adulting-guide.png", type: "image" },
      { label: "Free Ultimate Guide to Investing", url: "/scripts/investing-guide.png", type: "image" },
      { label: "MoneyBees Crash Course Bundle", url: "/scripts/moneybees-bundle.png", type: "image" },
    ],
    sort_order: 16,
  },
  {
    id: "confirmation-before-zoom",
    stage: "Before Zoom Call — Confirmation Text (Fact-Finding)",
    category: "confirmation",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script", content: "Great! I'll see you next **[Date and Time]** for our short 20-min chat after which you will get access to our financial planning course 📚\n\nJust to get a better idea of which stage of life you are currently in and for us to prepare for the upcoming meeting, may I ask:\n\n1️⃣ Are you currently 25 years old or younger?\n\n2️⃣ Are you currently working / at university / serving NS?\n\n3️⃣ Are you expecting any significant milestones, e.g., graduation, ORD, new job, marriage?\n\nFinally, please do save my number so that you know when it's me when I share new resources or any updates in the future. Thank you! ☺️" },
    ],
    sort_order: 16.5,
  },
  {
    id: "reminder-before-appointment",
    stage: "Appointment Reminder Texts — Young Adults (D-7 / D-1 / Day Of)",
    category: "confirmation",
    target_audience: "nsf",
    versions: [
      { author: "Reminder 1 — Week Before", content: "## 📲 Reminder — 1 Week Before Appointment\n\n---\n\n> Hey **[Name]**! Just a quick reminder that our Zoom session is coming up next week on **[date, time]**. Super excited to meet you to share more about how to grow your wealth and help you redeem your **McDonald's voucher**! 🙌\n>\n> Let me know if the time still works for you! 😊" },
      { author: "Reminder 2 — Day Before (D-1)", content: "## 📲 Reminder — Day Before Appointment\n\n---\n\n> Hello **[Name]**! Just a reminder that our Zoom session is happening **tomorrow at [time]**! Looking forward to meeting you soon!\n>\n> Do let me know if you are unable to attend the meeting later and we can reschedule it if necessary!" },
      { author: "Reminder 3 — Few Hours Before", content: "## 📲 Reminder — Few Hours Before Appointment\n\n---\n\n> Hey **[Name]**! Our meeting will be starting in a few hours! Can't wait to meet you and share with you more regarding investments and growing your wealth! Do inform me if you are no longer able to attend the meeting!\n>\n> See you soon!" },
    ],
    sort_order: 16.7,
  },
  {
    id: "callback-young-adult-consultant",
    stage: "Callback Script — Consultant Follow-Up Call (Young Adults)",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "Kenny's Script", content: "Hi [Name], this is Kenny. My assistant may have reached out to you yesterday. This is just a quick 5 mins call for me to personally follow up with a few details from you to ensure this opportunity can truly be of value to you. This opportunity is specifically for individuals under the age of 25, so just to confirm, are you below 25?\n\n---\n\n**After they confirm:**\n\nThat's great! Then this financial planning course would be incredibly useful for helping you take control of your finances and plan for the future. It's great that young people like you are starting to think about how they can better optimise their finances, and this is designed to guide you through that process.\n\n---\n\n**Fact-finding / rapport building:**\n\nTo gain a better knowledge of where you are right now, may I ask when's your birthday?\n\nAlso, what milestones which are important are coming up for you? Like your ORD? Or graduation or even bigger plans for the future?\n\n---\n\n**After they share milestones:**\n\nWow! That's exciting to hear and it's a great time to start thinking about how to plan financially for these milestones.\n\nI'll send you a quick overview of what we'll be discussing via WhatsApp. Are you on WhatsApp now? Great, I've just sent it to you — can you check if you've received it?\n\nAwesome! Could you also save my number so I can share additional resources with you later? Just scroll to the top and you should see a \"Save Contact\" button. Got it? Perfect!\n\n---\n\n**Sharing the heart of the program:**\n\nOne of the reasons I wanted to reach out is that most people don't learn how to grow or invest their money while they're young. Schools often focus on helping us to study hard, find a job, but they don't teach us how to build wealth or create financial freedom for ourselves.\n\nWhat I'll be sharing with you includes things like:\n\n• How to kickstart your investing journey even with a small amount of money\n• Ways to manage and make your money grow over time\n• And how investing in yourself and financial knowledge can set you up for life\n\n\"The earlier you start, the bigger the impact — what you learn and do at 20, 25 can compound over decades. Waiting until you're older, like 40 or 50, just doesn't give you the same head start. Time is one of the most powerful multipliers, and starting early lets you take full advantage of it.\"\n\n---\n\n**Pitching the Zoom consultation:**\n\nHere's what I'd like to do: We'll have a quick Zoom call where I'll share a personalised consultation to help you understand your financial options and how you can start growing your money right now. This will be a chance to talk about things like:\n\n• What goals do you have, whether it's saving for something big or just getting started with investing\n• The different options available to you for growing your money\n• And how to set yourself up financially for the future, even if you're just starting out\n\nAt the end of the consultation, I'll also give you free access to a course that covers personal finance, productivity, and self-improvement. It's an additional resource to help you build the right habits and mindset for long-term success." },
      { author: "Full Callback Script — V2 (Under 30 + Course Pitch)", content: "I believe my assistant gave you a call earlier. Alright, so just to clarify, this programme is actually only for people **below 30**. May I check — are you currently below 30?\n\n---\n\n### Qualifying & Rapport Building\n\nI see, that means you should be **[serving your National Service now / studying]**. Okay, great. In that case, I think this would actually be quite useful for you.\n\nThe reason is that we prefer to speak to young adults, as this programme is specifically designed to benefit people at your stage of life.\n\n**[So you're currently in NS, which means your ORD should be around 2026 / So you're currently in school, which means your graduation should be around 2026/2027]**. Got it.\n\nAnd you're 20 this year, right? Have you already turned 21? When's your birthday? Okay, understood.\n\n---\n\n### WhatsApp Resource Sharing\n\nI'll be sending you some resources over WhatsApp. Are you on WhatsApp right now? Alright, I've just sent you a few links that you can take a look at.\n\nI'll also be sending you more resources in the future. To make sure you receive them, just **save my number**. If you scroll to the top of WhatsApp, there should be a \"Save Contact\" button. Saving my number will allow me to share additional resources with you beyond this course.\n\n---\n\n### Why We Created This Programme\n\nBefore I go into the course details, I want to briefly share why we created this programme.\n\nThe things we teach here aren't commonly taught in schools. Schools generally train people to become better employees or workers. What we aim to share are concepts that most young adults never get exposed to — things like **productivity, self-improvement, entrepreneurship, and investing in yourself**. These are incredibly important life skills.\n\nOur team has been doing this for about **10 years now** — this is actually our 10th year — and our focus has shifted toward educating and coaching young adults. The reason is simple: **what you learn and practice when you're young creates a ripple effect throughout your entire life**. Something learned at 25 has far more impact than something learned at 65.\n\nThat's why this course was built. It's meant to be a **free, easy, self-study course** with no deadlines. Our hope is that it will genuinely be useful for you.\n\n---\n\n### Pitching the Zoom Session\n\nWhat I'll do next is walk you through the course in more detail over a **Zoom call**. After that, I'll give you **full access to the course at no cost**. Doing it over a Zoom call allows me to explain things clearly and tailor it better for you.\n\nWould next **Saturday morning** work for you? Great. Let's do next **Saturday at 10am** over Zoom. It'll be a short session where I'll walk you through the course and give you access immediately afterward.\n\nDuring the call, I'll also give you a **complimentary personal financial consultation**. This allows me to take a quick look at your situation and give you some personalised recommendations.\n\n---\n\n### Closing\n\nIf you have any friends who might be interested as well, feel free to share the links with them. They're welcome to join, and we can go through this together.\n\nThat's about it for now. I'll see you next Saturday at 10am on Zoom. Take care, and I'll speak to you soon. Bye-bye!" },
      { author: "Benjamin's Script — V3 (Structured + Referrals)", content: "### 1️⃣ Initial Introduction\n\nHi [Name], this is Benjamin. My assistant may have reached out yesterday. This is just a quick 5-min call in which I wanted to personally follow up with a few details and quick questions to ensure that this opportunity can truly be of value to you. This opportunity is specifically for individuals under the age of 25, so just to confirm, are you below 25?\n\n---\n\n### 2️⃣ Establishing Relevance\n\nThat's fantastic! Then this financial planning course would be incredibly useful for helping you take control of your finances and start planning for your future. It's great that young people like you are starting to think about how they can better optimise their finances (grow their money), and this is designed to guide you through that process.\n\n---\n\n### 3️⃣ Rapport Building\n\nTo get a better sense of where you are right now, when's your birthday? Also, what milestones are coming up for you — like ORD, graduation, or even big plans for the future?\n\n> *Use their response to add into your calendar and mark their current stage in the CRM.*\n\nThat's exciting! This is a great time to start thinking about how to plan financially for those milestones.\n\n---\n\n### 4️⃣ WhatsApp + Save Number\n\nI'll send you a quick overview of what we'll be discussing via WhatsApp. Are you on WhatsApp now? Great, I've just sent it to you — can you check if you've received it?\n\n*(Wait for confirmation. Send them a quick reply using your WhatsApp Business quick replies.)*\n\nAwesome! Could you also **save my number** so I can share additional resources with you later? Just scroll to the top of the message, and you should see a \"Save Contact\" button. Got it? Perfect!\n\n---\n\n### 5️⃣ Sharing the Heart of the Programme\n\n**Why This Exists:**\nOne of the reasons I wanted to reach out is that most people don't learn how to grow their money or invest while they're young. Schools often focus on helping us become good employees, but they don't teach us how to build wealth or create financial freedom for ourselves.\n\n**Core Topics:**\nWhat I'll be sharing with you includes things like:\n\n• How to get started with investing, even with a small amount of money\n• Ways to manage your money to make it grow over time\n• And how investing in yourself and your financial knowledge can set you up for life\n\n**The Ripple Effect:**\nThe earlier you start, the bigger the impact — what you learn and do at 20 or 25 can compound over decades. Waiting until you're older, like 40 or 50, just doesn't give you the same head start.\n\n---\n\n### 6️⃣ Positioning the Consultation\n\n**The Zoom Call:**\nHere's what I'd like to do: We'll have a quick Zoom call where I'll share a personalised consultation to help you understand your financial options and how you can start growing your money right now. This will be a chance to talk about things like:\n\n• What goals you have, whether it's saving for something big or just getting started with investing\n• The different options available to you for growing your wealth\n• And how to set yourself up financially for the future, even if you're just starting out\n\n**The Course as a Bonus:**\nAt the end of the consultation, I'll also give you **free access** to a course that covers personal finance, productivity, and self-improvement. It's an additional resource to help you build the right habits and mindset for long-term success.\n\n---\n\n### 7️⃣ Booking the Appointment\n\nLet's set up a quick Zoom call — it'll only take about **30 minutes**, and I promise you'll walk away with a clear plan for your next steps. Does next **Saturday morning at 10am** work for you?\n\n*(Wait for confirmation and adjust as needed.)*\n\nPerfect! I'll send you the Zoom link closer to the date, and we'll go through everything step by step.\n\n---\n\n### 8️⃣ Encouraging Referrals\n\nIf you know anyone else under 25 who might be interested in learning how to grow their money and invest, feel free to share this with them. Here's a quick script you can use:\n\n> *\"Hey, I came across this free financial consultation for young adults that teaches how to start investing and growing your money. It's super insightful, and you also get access to a free course afterward. Let me know if you're interested, and I'll share the details!\"*\n\nThey're welcome to join the call with you or book their own time.\n\n---\n\n### 9️⃣ Closing\n\nTo recap, during our Zoom call, we'll focus on understanding your financial goals, exploring different ways to grow your wealth, and building a personalised plan for you. And, as a bonus, you'll get access to a free course that dives deeper into these topics. Sound good?\n\nGreat! I'll see you next Saturday at 10am on Zoom. If you have any questions before then, just let me know. Take care, and I'll talk to you soon!" },
    ],
    sort_order: 17,
  },
  {
    id: "whatsapp-post-callback-consultant",
    stage: "Post-Callback WhatsApp — Consultant After Telemarketer Sets Appointment",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script — V1 (Warm Intro + Session Details)", content: "Hi [Name]! 😊\n\nThis is [Consultant Name] from MoneyBees Academy. My assistant spoke with you earlier and mentioned you'd be keen to learn more about growing your money — great to connect with you!\n\nhttps://www.instagram.com/moneybeesacademy\n\nAs mentioned, I'd love to do a quick **20-minute Zoom session** with you where we'll cover:\n\n💡 How to start investing even with small amounts\n📊 Simple strategies to grow your wealth faster than the bank\n🎯 Personalised tips based on your current situation\n\nI've scheduled our session for:\n\n🗓️ **Date:** [DATE]\n⏰ **Time:** [TIME]\n📍 **Location:** Zoom\n\nJust reply **\"Yes\"** to confirm this timing and we're all set! 👍\n\nYou'll also get **free access** to our financial literacy course after the session: https://www.skool.com/finternship/about\n\nLooking forward to chatting with you! Feel free to save my number so you know it's me when I reach out. 😊\n\n— [Consultant Name]" },
      { author: "MoneyBees Script — V2 (Short + Direct)", content: "Hey [Name]! 👋\n\nThis is [Consultant Name] — my colleague spoke with you earlier today about our free financial literacy session.\n\nJust wanted to personally reach out and confirm our quick Zoom chat:\n\n📅 **[DATE] at [TIME]**\n\nDuring the session, I'll share some practical insights on saving, investing, and making your money work harder — tailored to where you're at right now.\n\nNo obligations — just come, learn something useful, and you'll also get access to our **free online course** 📚\n\nJust reply **\"Confirmed\"** and I'll send you the Zoom link closer to the date!\n\nChat soon 😊" },
      { author: "MoneyBees Script — V3 (Appointment Confirm + Resources)", content: "## 📲 Post-Callback Text — Appointment Confirmation\n\n*Send via WhatsApp after the consultant callback*\n\n---\n\n> Hi **[Name]**, thank you for picking up the call with me just now, I have set our appointment for **[Date, Time]**.\n>\n> As mentioned, the call will take around **20–30 mins**. During the call, I will share with you some practical tips on how to **invest and grow your money faster** than if you left it in the bank.\n>\n> Additionally, I will share with you **2 resources** that my team has produced which will share with you what schools never taught you about money, and smart strategies to start investing and building wealth.\n>\n> Also, our team aims to help young adults with investments and teach them useful money tips!\n>\n> This is our website and Instagram! 😁😁\n>\n> https://themoneybees.co/\n>\n> https://www.instagram.com/moneybeesacademy/?hl=en" },
    ],
    sort_order: 17.3,
  },
  {
    id: "nudge-post-callback-no-reply",
    stage: "No-Reply Nudge — After Consultant Post-Callback WhatsApp",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script — Day 1", content: "Hey [Name]! 👋\n\nJust following up on my message earlier — wanted to make sure it came through!\n\nI've tentatively reserved a slot for you on **[DATE] at [TIME]** for our quick Zoom session. It's only 20 minutes and you'll walk away with some practical tips on growing your money + free access to our financial literacy course 📚\n\nJust reply **\"Yes\"** to lock in the timing and I'll send you the Zoom link! 😊" },
      { author: "MoneyBees Script — Day 3", content: "Hey [Name]! 😄\n\nI know things can get busy (especially with **[NS / school / work]**!) so just a quick nudge.\n\nThe free financial literacy session is still open for you — it's a short 20-min Zoom call where I'll share:\n\n💡 How to start investing even with small amounts\n📊 Strategies to grow your wealth faster than the bank\n🎯 A personalised look at your financial situation\n\nPlus you'll get **free course access** and a **$20 voucher** just for attending 🎁\n\nWould **[DATE] at [TIME]** work better for you? Just let me know and I'll adjust! 👍" },
      { author: "MoneyBees Script — Day 7 (Final)", content: "Hey [Name]! Last message from me, I promise 😂\n\nJust wanted to give you one last chance to grab a spot for our free session before I move on to the next batch.\n\nHonestly, most people who attend tell me they wish they'd started learning about money earlier. It's just a 20-min Zoom call — no obligations, no pressure.\n\n✅ Free financial consultation\n✅ Free course access\n✅ Walk away anytime if it's not for you\n\nIf you're keen, just drop me a **\"Yes\"** and I'll sort everything out. If not, totally cool too — all the best! 🙏\n\n— [Your Name]" },
    ],
    sort_order: 17.4,
  },
  {
    id: "whatsapp-callback-overview",
    stage: "WhatsApp Message — Sent During Callback Call (\"I've just sent it to you\")",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script", content: "Hey [Name]! 👋\n\nGreat speaking with you just now! As mentioned, here's a quick overview of what we'll be covering in our upcoming session:\n\n💡 **What You'll Learn:**\n\n1️⃣ **Personal Finance Basics** — How to manage your money smarter, even on a tight budget\n2️⃣ **Investing 101** — How to start growing your money with as little as $100/month\n3️⃣ **The Power of Compounding** — Why starting at 20–25 gives you a massive advantage over someone starting at 40\n4️⃣ **Goal Planning** — Whether it's your first car, travelling, or building long-term wealth\n\n📊 Here's a simple example:\nIf you invest just **$200/month** starting at age 21, by the time you're 55 you could have over **$500,000** — but if you start at 35, you'd only have around **$170,000** with the same amount. That's the power of starting early! 🚀\n\n---\n\n🗓️ I'll be setting up a short Zoom session where I'll walk you through everything in detail — personalised to your situation.\n\nIn the meantime, feel free to save my number so I can send you more resources! 😊\n\nTalk soon!\n— [Your Name]" },
    ],
    sort_order: 17.5,
  },
  {
    id: "post-zoom-young-adult-followup",
    stage: "Post-Zoom Follow-Up — Young Adults After Consultation",
    category: "post-meeting",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script", content: "Hey [Name]! 😊\n\nThanks so much for taking the time to join today's session — really great chatting with you!\n\nAs promised, here's what you'll be getting:\n\n📚 **Free access to the MoneyBees course**\nHere's your link to join: https://www.skool.com/finternship/about\n\nInside you'll find modules on:\n• Personal finance fundamentals\n• How to start investing with small amounts\n• Productivity & self-improvement strategies\n• And a community of like-minded young adults\n\n---\n\n**Quick recap of what we discussed today:**\n\n1️⃣ Your current financial situation and goals\n2️⃣ How to start building wealth early through the power of compounding\n3️⃣ The options available to help you grow your money\n\n---\n\n**Next steps:**\n\nI'll be putting together a personalised plan based on what we discussed. I'll share it with you by [DATE] so you can review it at your own pace.\n\nIn the meantime, feel free to explore the course materials — the earlier you start learning, the bigger the head start you'll have! 🚀\n\nIf you have any questions at all, just drop me a message here anytime. Happy to help!\n\nChat soon,\n[Your Name]" },
    ],
    sort_order: 18,
  },
  {
    id: "follow-up-nasa-lucky-draw",
    stage: "Post-Call Text — NASA Lucky Draw Lead",
    category: "follow-up",
    target_audience: "working-adult",
    versions: [
      { author: "MoneyBees Script", content: "Hi [Name], this is [Your Name]\nThanks for taking the call just now! 😊\n\nIn order to redeem your chance to win a **[insert campaign]**, we will need to schedule a short **15-minute session**, where we will go through your current financial policies from different companies and give you a **financial report** after the session.\n\nI've scheduled your session for **[Confirmed Date & Time]**.\nJust reply **\"Yes\"** to confirm this timing.\n\nLooking forward to chatting with you then! 👍\n\n---\n\nAs a bonus, you will also get these resources after the consultation!\n\n*(Attach relevant resources / guidebook images)*\n\n---\n\nWould sometime next **Saturday or Sunday at 10am or 2pm** work for you?" },
    ],
    sort_order: 18.5,
  },
  {
    id: "followup-next-steps-call",
    stage: "Next Steps — Schedule a Quick Call",
    category: "follow-up",
    target_audience: "general",
    versions: [
      { author: "MoneyBees Script", content: "Hi [Name]! 😊\n\nWould you be available tomorrow for a quick 5-min call to discuss the next steps? Let me know if that timing works, or feel free to suggest another time that's more convenient." },
    ],
    sort_order: 19,
  },
  {
    id: "closing-graceful-exit",
    stage: "Graceful Close — Not Interested / End of Conversation",
    category: "follow-up",
    target_audience: "general",
    versions: [
      { author: "MoneyBees Script", content: "No worries [Name]. If you have any questions regarding personal finance, feel free to reach out. All the best and take care. 🙏" },
    ],
    sort_order: 20,
  },
  {
    id: "referral-young-adult",
    stage: "Referral Request — Young Adults",
    category: "referral",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script", content: "Hi [Name]! 😊\n\nIf you know anyone under 25 who could benefit from learning how to save, invest, or plan their finances, feel free to share this with them. Here's a quick script you can use to introduce it to your friends:\n\n---\n\n*\"Hey, I found this free financial consultation that helps young adults like us learn to grow their money. They also provide access to a great ebook afterwards. Let me know if you're interested!\"*\n\n---\n\nIf they're keen, they can join your Zoom session or book their own time. Let me know if I can help set that up!" },
    ],
    sort_order: 21,
  },
  {
    id: "reminder-2nd-meeting",
    stage: "Reminder — 2nd Zoom Meeting",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script", content: "Hi [Name]! Just a quick reminder about our second Zoom meeting scheduled for [Day] at [Time]. 👌 Looking forward to continuing our discussion and building on the progress we've made! Let me know if any adjustments are needed." },
    ],
    sort_order: 22,
  },
  {
    id: "reminder-2nd-meeting-short",
    stage: "Reminder — 2nd Meeting (Short)",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script", content: "Please let me know if the time still works for you or if any adjustments are needed. 🙂 Just a quick reminder about our second meeting scheduled this [day and time] 👌 Looking forward to continuing our discussion!" },
    ],
    sort_order: 23,
  },
  {
    id: "reminder-gentle-followup",
    stage: "Reminder — Gentle Follow-Up",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script", content: "Hey [Name]! Hope you're doing well. I understand things can get busy.\n\nJust wanted to follow up on my previous message about helping young adults like yourself with their finances. I truly believe in the importance of financial literacy, especially for individuals in your age group.\n\nI would love to meet with you on Zoom next week on Saturday at 11am or 2pm or Sunday at 2pm to touch on points like early retirement, savings, and investments. I'll pass you the free financial planning course during our short 20-minute consultation. I'm confident you'll learn something new :)" },
    ],
    sort_order: 24,
  },
  {
    id: "reminder-persistent-followup",
    stage: "Reminder — Persistent Follow-Up",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script", content: "Hey [Name]! Just wanted to reach out one more time to make sure you didn't miss my previous messages. I know life gets busy, but I'd love to connect and share some valuable financial insights that could really set you up for the future.\n\nThis isn't just about completing a financial planning/literacy course—during our free 20-minute Zoom session, I'll help you look at your financial goals and provide personalized advice that's relevant to your current situation. Many young adults and NSFs have found it to be eye-opening and really helpful, and I think you'd benefit too! 💪\n\nWould you be available next Saturday at either 10am or 2pm or Sunday at 2pm? If another time works better, feel free to let me know!\n\nLooking forward to the chance to chat and empower you with some great financial tools." },
    ],
    sort_order: 25,
  },
  {
    id: "reminder-final-followup",
    stage: "Reminder — Final Follow-Up",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script", content: "Hi [Name], I hope you're doing well! 😊\n\nJust wanted to follow up one last time about our free financial planning course and consultation. I completely understand if you've been busy, but I didn't want you to miss out on this opportunity.\n\nThis free Zoom session isn't just about finances—it's about helping young adults like you take control of your future. Whether it's learning how to save smarter, plan for early retirement, or start investing, we'll cover it all in just 20 minutes.\n\nIf you're interested, I have availability next Saturday at 10am or 2pm and Sunday at 2pm. If another time works better, let me know!\n\nLooking forward to helping you kick-start your financial journey 💪" },
    ],
    sort_order: 26,
  },
  {
    id: "cold-call-nsf-direct",
    stage: "Cold Call — NSF Direct (In-Person Meet)",
    category: "cold-calling",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script — V1 (Direct Meet)", content: "Hello, understand that you're currently serving NS?\n\nI'll just keep this call short less than 1 minute.\n\nBasically we work with many NSFs to grow their savings **60 times faster** than the bank during NS. So if you're interested in growing your money faster than the bank during NS, we can have a meetup to go through more.\n\n**Where is your nearest MRT?**\n\nAlright, so I'll do a sharing session with you next Saturday 10am at [nearest mall], and after this call, I'll send you a WhatsApp, and all you have to do is to reply, is that okay?\n\nSo just one last thing, this session is just for you to learn more, and as long as you learn something beneficial for you, then that's good enough.\n\nHave a good day!" },
      { author: "MoneyBees Script — V2 (Campaign + Guidebook)", content: "Hello, is this [Name]?\n\nUnderstand that you're currently serving NS?\n\nXXX here from TheMoneybees. I'll just keep this call short, less than a minute. So currently we are doing a **financial literacy campaign**, and just launched an **adulting guidebook** specially for young adults and NSFs.\n\nIs it possible if I share with you more details through WhatsApp?\n\nBasically, it will be a 30-min meeting to help you strategize on how we can help you save money better during NS, and we've done this for more than a few thousand young adults in the past few years.\n\nAfter the session, we will also pass you a copy of our **free investment guidebook**.\n\nJust to check, when is your next bookout? Do you prefer this Saturday 10am or Saturday 3pm over Zoom?\n\nGreat, we can set it as [Date/Time] tentatively first, and you can tell me if you have any last-minute changes closer to the date.\n\nSo just one last thing, this session is just for you to learn more. As long as you learn something that's beneficial for you, then that's good enough! Just to check, how do I address you?\n\n---\n\n> **Note:** Please continually wish them all the best for their book-in, book-out, build rapport. Even after the call, you still need to text them, wish them, etc." },
      { author: "MoneyBees Script — V3 (60x + Mall Meet)", content: "Hello, is this [Name]?\n\nUnderstand that you're currently serving NS?\n\nXXX here from TheMoneybees. I'll just keep this call short, less than a minute. Basically we help young adults, including NSFs, save their money **60 times faster** than the bank during their national service, and we meet many of them over their weekends. So if you're interested to grow your savings faster, we can set a short session for you to find out more.\n\n**Just to check, around where do you stay?**\n\nOkay, we will set a meeting sometime this/next weekend at [XXX mall] at 10am, and you can reply after this call to confirm the meeting, is that okay?\n\nAlright so just one last thing, this session is just for you to learn more, so as long as you come down and learn something beneficial for you, then that's good enough!" },
    ],
    sort_order: 27,
  },
  {
    id: "cold-call-fb-ads-ebook",
    stage: "Cold Call — Facebook Ads (Ebook Angle)",
    category: "ad-campaign",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script", content: "Hello [Name]!\n\nWe're from the @moneybeesacademy! [www.instagram.com/moneybeesacademy](https://www.instagram.com/moneybeesacademy)\n\nI think you might have seen our Instagram Ads recently regarding the pre-launch of a financial book that we're giving away for the **first 100 young adults**.\n\nAnyway, you should be quite young right?\n\nI mostly speak to young adults about better financial planning and investing!\n\nThe reason why I'm doing this is that I have gone through the entire education system in Singapore and they actually didn't really teach anything much about personal finance, and hence I was pretty frustrated about this, and wrote a book:\n\n📘 [The Ultimate Guide to Adulting](https://leotanfinancial.sg/the-ultimate-guide-to-adulting/)\n\nIt aims to empower and educate more young people about investing and financial literacy! I conduct workshops too :)" },
    ],
    sort_order: 28,
  },
  {
    id: "cold-call-nsf-telemarketer-pamela",
    stage: "Cold Call — NSF Telemarketer (Zoom Meet)",
    category: "cold-calling",
    target_audience: "nsf",
    versions: [
      { author: "Pamela's Script — V1 (Zoom + WhatsApp)", content: "Hello (Name), I understand that you're currently serving NS? I'll just keep this call short, less than 1 minute.\n\nHi my name is Pamela from the Moneybees and we are a team of financial consultants who work with many NSFs to grow their NS allowance faster than the bank during NS. So if you're interested in learning how to grow your money and get started on investing, we can arrange for a consultant to have a meetup with you on Zoom to go through more and we can text you to let you know more.\n\n---\n\n**If they respond: \"Where did you get my number?\"**\n\nYou did an ad on Instagram a while back.\n\n> *Don't say what company you're from.*\n\n**If they still say they don't remember:**\n\nI am just a telemarketer for my manager. My manager reaches out to many people and some find his services very helpful and want to refer some of their friends to speak to us. I believe you are one of the contacts that he received, so I am calling in to check whether you would be keen to have a session with my manager.\n\n---\n\nWould you be available next Saturday at 2pm? Great, after this call, one of the consultants will send you a WhatsApp, and all you have to do is to reply, is that okay?\n\n---\n\n**If they respond: \"I'm not sure if I'm free on that day. Can you send me more details and I get back to you once I confirm my schedule?\"**\n\nNo worries. We can just set it the following weekend on [date] at 12pm on Zoom tentatively first. One of the consultants will send you some info through WhatsApp after this call, and you just help me to reply him to confirm the timing again okay?\n\n---\n\nAlright, so just one last thing, this session is just for you to learn more, and as long as you learn something beneficial for you, then that's good enough. Thank you and have a nice day!" },
      { author: "Pamela's Script — V2 (BMT / Savings Angle)", content: "Hello, is this (Name)? I'm Pamela from MoneyBees. Just checking you're currently serving NS, right? I'll make this call very quickly.\n\nWe are a team of Financial consultants who help NSFs like you to grow your NS allowance faster than the bank — so your savings don't just sit there. Basically, we show simple and safe ways to make your money work harder — instead of just sitting in your savings.\n\nIf that sounds interesting, we can do a quick Zoom session where one of our consultants will explain how it works. I can send you the details on WhatsApp — is that okay?\n\n---\n\n**If they ask: \"Where did you get my number?\"**\n\nOh! You actually interacted with an ad on Instagram a while back. I'm just a telemarketer helping my manager reach out to interested people. My manager speaks to a lot of NSFs, and many find the session really useful — some even refer their friends to join! I believe your contact came from one of those referrals or lists.\n\nSo I'm just calling to check if you'd be open to having a quick chat with him.\n\n---\n\nWould Saturday at 2 PM work for you? If not, I can ask my consultant to send you more info on WhatsApp so you can confirm your schedule later — is that okay?\n\nGreat! Thank you, [Name]. It's just a learning session, so even if you pick up one or two helpful tips, that's already a good win. Have a great day!" },
    ],
    sort_order: 27.5,
  },
  {
    id: "objection-not-interested",
    stage: "Objection — \"I'm Not Interested\"",
    category: "faq",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script", content: "**Q: I'm not interested.**\n\n**A:** That's the case with most people even before I call. Many NSFs we work with also feel the same way at first. But when they meet us they find our ideas very useful. Just so that you can give yourself a chance to decide — would tomorrow morning OR afternoon be better to meet you?" },
    ],
    sort_order: 30,
  },
  {
    id: "objection-compulsory",
    stage: "Objection — \"Is This Compulsory?\"",
    category: "faq",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script", content: "**Q: Is this compulsory?**\n\n**A:** You can opt out.\n\n> *If not keen, just end the call politely. If no objection, continue with your script as normal — \"Where do you stay?\" etc.*" },
    ],
    sort_order: 31,
  },
  {
    id: "objection-where-number",
    stage: "Objection — \"Where Did You Get My Number?\"",
    category: "faq",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script — V1 (Ad Response)", content: "**Q: Where did you get my number?**\n\n**A:** You did an ad on Instagram a while back.\n\n> *Don't say what company you're from.*" },
      { author: "MoneyBees Script — V2 (Telemarketer Angle)", content: "**Q: How did you get my number?**\n\n**A:** I am just a telemarketer for my manager. My manager reaches out to many people and some find his services very helpful and want to refer some of their friends to speak to us. I believe you are one of the contacts that he received, so I am calling in to check whether you would be keen to have a session with my manager.\n\n*If they press further:*\n\nI do not have access to the entire database so I am not too sure about that — maybe you can ask my manager when he contacts you." },
    ],
    sort_order: 32,
  },
  {
    id: "objection-not-sure-free",
    stage: "Objection — \"Not Sure If I'm Free\"",
    category: "faq",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script", content: "**Q: I'm not sure if I'm free on that day. Can you send me more details and I get back to you once I confirm my schedule?**\n\n**A:** No worries. I'll send you some info through WhatsApp after this call, and you just help me to confirm the timing again okay?\n\n*PAUSE.*\n\nSo one last thing… this session is just for you to learn more, and I'm just doing my job…\n\n> *Continue with the rest of your script.*" },
    ],
    sort_order: 33,
  },
  {
    id: "objection-send-details",
    stage: "Objection — \"Can You Send Me More Details First?\"",
    category: "faq",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script", content: "**Q: Can you send me more details first?**\n\n**A:** No worries. I'll send you some info through WhatsApp after this call. And you just help me to reply the WhatsApp to confirm, okay?\n\nAlright, so one last thing… this session is only for NSFs…\n\n> *Continue with the rest of your script.*" },
    ],
    sort_order: 34,
  },
  {
    id: "objection-not-free",
    stage: "Objection — \"I'm Not Free on That Day\"",
    category: "faq",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script", content: "**Q: I'm not free on that day.**\n\n**A:** No worries. I'll just put the slot 2 weeks from now then. I'll send you a WhatsApp to confirm the timing again, okay?\n\nAlright, so one last thing… this session is only for NSFs.\n\n> *Continue with the rest of your script.*" },
    ],
    sort_order: 35,
  },
  {
    id: "objection-hesitant",
    stage: "Objection — Hesitant / Unsure",
    category: "faq",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script", content: "**Q: If prospect is hesitant…**\n\n**A:** My manager has worked with many clients over the years and a lot of them found this sharing very helpful. There are no obligations, **BUT**, to set aside just 30 mins of your time. You can always walk away from the session at any time if you don't think it is suitable for you.\n\nThe takeaway is that as long as you can learn something beneficial from this session, then that is good enough for me. Is that fine?" },
    ],
    sort_order: 36,
  },
  {
    id: "objection-have-agent",
    stage: "Objection — \"I Already Have an Agent / Plan\"",
    category: "faq",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script", content: "**Q: I already have an agent / investment plan.**\n\n**A:** Would you like to have an alternative opinion? The reason why I ask is because many of our clients also have more than one financial agent — this allows them to have multiple opinions as well as giving them different perspectives of their financial situation.\n\nFurthermore, this will only take 30 mins of your time, and it's a free learning opportunity for yourself. You can walk away anytime with no obligation if you don't think the session helps you.\n\nThe takeaway is that as long as you can learn something beneficial from this session, then that is good enough for me. Will that be okay?" },
    ],
    sort_order: 37,
  },
  {
    id: "fact-find-current-situation",
    stage: "Fact-Finding — Current Situation Questions",
    category: "faq",
    target_audience: "general",
    versions: [
      { author: "Working Adults", content: "**Opening question:**\n\nCould I ask what you are currently doing / working as?\n\n---\n\n### If Working:\n\n- What are you working as currently? Which company are you working for?\n- How long have you been working for?\n- When did you graduate?\n- What did you study?\n\n### If Studying:\n\n- What and where are you studying?\n- When will you be graduating?\n\n### If Serving NS:\n\n- Which phase are you in now?\n- Which unit are you in now?\n- Do you plan to go for command school?" },
    ],
    sort_order: 38,
  },
  {
    id: "fact-find-insurance-status",
    stage: "Fact-Finding — Insurance Coverage Check",
    category: "faq",
    target_audience: "general",
    versions: [
      { author: "MoneyBees Script", content: "**Ask:** Do you currently have insurance to protect yourself?\n\n---\n\n### ✅ If Yes:\n\nThat's great! What kind of insurance do you currently have and what do they cover?\n\nIf you would allow me, I would love to help you **review your policies** to check if there are any overlapping policies or any gaps which you have missed out!\n\n### ❌ If No:\n\nI see, what is currently holding you back from getting insurance coverage to protect yourself?\n\nDo you think that it is important to have insurance to protect yourself and your loved ones?\n\n### 🤷 If Not Sure:\n\nNo worries! This is what this session is for — I could have a call with you and we can look through if you have any coverage currently and what they are covering!" },
    ],
    sort_order: 39,
  },
  {
    id: "fact-find-investing-status",
    stage: "Fact-Finding — Investment Status Check",
    category: "faq",
    target_audience: "general",
    versions: [
      { author: "MoneyBees Script", content: "**Ask:** Are you currently investing?\n\n---\n\n### ✅ If Yes:\n\nWhat do you invest in?\n\n### ❌ If No:\n\nWhat's holding you back?\n\nYep, I agree with your [pain point], especially as schools don't teach us about investing and how to grow our money." },
    ],
    sort_order: 40,
  },
  {
    id: "objection-not-interested-insurance",
    stage: "Objection — \"Not Interested in Insurance\"",
    category: "faq",
    target_audience: "general",
    versions: [
      { author: "MoneyBees Script — V1 (Redirect to Planning)", content: "**Q: I'm not interested in insurance.**\n\n**A:** I understand where you are coming from. Most people that I speak to have the same sentiment and do not want to delve into this matter until much later.\n\nHowever, most people also agree that financial planning is important and needs to be done regularly. This is why I would love to have a quick **30-minute Zoom call** for both of us to analyse this and see how we can plan for your success.\n\nIs **[date, time]** or **[date, time]** good for you?" },
      { author: "MoneyBees Script — V2 (Pivot to Investing)", content: "**Q: Not interested in insurance.**\n\nI see, do you do your own investment?\n\n**If Yes:** What do you invest in? What are some of the struggles or challenges you face currently?\n\n**If No:** Are you looking to learn more about investments?\n\n---\n\n**If still not interested:**\n\nI see, can I ask why you are no longer interested?\n\n> *Try to still add them into a nurturing machine — send resources, keep the relationship warm.*" },
    ],
    sort_order: 41,
  },
  {
    id: "tips-general-calling",
    stage: "General Calling Tips & Tonality",
    category: "tips",
    target_audience: "general",
    versions: [
      { author: "Team Guide", content: "## 🗣️ Tonality & Language Tips\n\n- **Don't use \"ads\"** — use words such as **\"campaigns\"** instead\n- Talk in a more **cheerful and friendly tone**\n- When giving dates or setting new dates for appointments, **take your own time** and try to make it sound like you're busy — this **creates scarcity**\n\n---\n\n## 📋 Objection Handling Reminder\n\n- If they say \"Not interested\", always ask: **\"May I ask why you will not be interested in the session?\"**\n- Try to still set the call, especially if they are **on the fence**\n- Even if they decline, try to **add them into a nurturing machine** — send resources, keep the relationship warm\n- Never give up on the first objection — most people need a gentle push\n\n---\n\n## 📞 Consultant Callback Tips\n\n- During rapport building, **add their birthday and milestones into your calendar** and mark their current stage in the CRM\n- Use **WhatsApp Business quick replies** when sending the resource overview during the callback call\n- Ask them to **save your number** so future resources get through — guide them to the \"Save Contact\" button at the top of WhatsApp\n- After the callback call, **change the lead stage** from \"Texting\" to **\"To Meet for Sales\"** so you know these are upcoming leads\n- Encourage **referrals** by giving them a ready-made script to share with friends under 25\n- Position the **Zoom consultation as the main value** and the free course as a **bonus** — not the other way around" },
    ],
    sort_order: 31,
  },
  {
    id: "tips-phrasing-dos-donts",
    stage: "Phrasing Tips — What to Avoid & What to Say Instead",
    category: "tips",
    target_audience: "general",
    versions: [
      { author: "Team Guide — Phrasing V1", content: "## 🚫 Try to Avoid\n\nThese phrases put the prospect in a position to say **no** or create awkwardness:\n\n| ❌ Don't Say |\n|---|\n| \"Do you still recall?\" |\n| \"Are you interested?\" |\n| \"Are you free at this time?\" |\n| \"Are you free to speak to?\" |\n| \"Is this a convenient time to speak now?\" |\n\n---\n\n## ✅ Try This Instead\n\nUse **assumptive and confident language** that keeps the conversation moving forward:\n\n| ✅ Say This Instead |\n|---|\n| \"I understand that you are…\" |\n| \"This is a courtesy call to inform you…\" |\n| \"I'll just keep this call short — less than a minute\" |\n| \"We'll just set a tentative time slot at **[date/time]**, then after this call, I'll give you a WhatsApp, and you just need to reply and confirm — is that alright? We can reconfirm closer to the date.\" |\n\n---\n\n💡 **Key Principle:** Avoid asking **permission-based questions** that invite rejection. Instead, use **assumptive statements** that guide the prospect naturally into the next step." },
    ],
    sort_order: 31.5,
  },
  {
    id: "tips-fyc-calling-math",
    stage: "FYC Formula — Calling Rate & Activity Math",
    category: "tips",
    target_audience: "general",
    versions: [
      { author: "Team Guide — Activity Math V1", content: "## 💰 FYC = How Many Cases You Close\n\n> Your **FYC** (First Year Commission) is in **direct proportion** to how many cases you close.\n\n---\n\n### The Chain Reaction\n\n| Step | Depends On |\n|---|---|\n| 💰 **FYC** | How many **cases you close** |\n| 📋 **Cases closed** | How many **appointments you set** |\n| 📞 **Appointments set** | Your **calling rate** and **calling duration** |\n\n---\n\n### 📊 The Numbers — Part-Time vs Full-Time\n\n| Metric | Part-Time | Full-Time |\n|---|---|---|\n| **Dials per hour** | 10 | 70 |\n| **Sessions per week** | 2 | 40 hrs (8h × 5 days) |\n| **Dials per week** | **20** | **2,500** |\n\n---\n\n💡 **The takeaway:** Activity is the #1 driver of results. If you want more FYC, increase your **calling rate** and **calling duration** — everything else follows." },
    ],
    sort_order: 31.7,
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

function highlightText(text: string, query: string): string {
  if (!query || query.trim().length < 2) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark class="bg-yellow-200 dark:bg-yellow-700/60 rounded-sm px-0.5">$1</mark>');
}

function HighlightedTitle({ text, query }: { text: string; query: string }) {
  if (!query || query.trim().length < 2) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-700/60 rounded-sm px-0.5">{part}</mark>
          : part
      )}
    </>
  );
}

function getSearchSnippet(versions: ScriptVersion[], query: string): string | null {
  if (!query || query.trim().length < 2) return null;
  const q = query.toLowerCase();
  for (const v of versions) {
    // Strip markdown syntax for a cleaner snippet
    const plain = v.content.replace(/[#*_~`>\[\]()!|]/g, '').replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
    const idx = plain.toLowerCase().indexOf(q);
    if (idx === -1) continue;

    // Find word boundaries around the match for a natural-feeling snippet
    // Go back ~6 words before the match
    let start = idx;
    let wordsBefore = 0;
    while (start > 0 && wordsBefore < 6) {
      start--;
      if (plain[start] === ' ') wordsBefore++;
    }
    if (start > 0) start++; // skip the space we landed on

    // Go forward ~6 words after the match
    let end = idx + query.length;
    let wordsAfter = 0;
    while (end < plain.length && wordsAfter < 6) {
      end++;
      if (plain[end] === ' ') wordsAfter++;
    }

    const before = start > 0 ? '…' : '';
    const after = end < plain.length ? '…' : '';
    return before + plain.slice(start, end).trim() + after;
  }
  return null;
}
function MobileVersionSelector({
  versions,
  searchQuery,
  isAuthenticated,
  onInlineSave,
  scriptId,
}: {
  versions: ScriptVersion[];
  searchQuery: string;
  isAuthenticated?: boolean;
  onInlineSave?: (id: string, versions: ScriptVersion[]) => Promise<void>;
  scriptId?: string;
}) {
  const [activeVersion, setActiveVersion] = useState("0");
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const idx = parseInt(activeVersion);
  const v = versions[idx] || versions[0];

  const startEdit = () => {
    setEditContent(v.content);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditContent("");
  };

  const saveEdit = async () => {
    if (!onInlineSave || !scriptId) return;
    setIsSaving(true);
    const updated = versions.map((ver, i) => i === idx ? { ...ver, content: editContent } : ver);
    await onInlineSave(scriptId, updated);
    setIsSaving(false);
    setEditing(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-3">
        {versions.length > 1 ? (
          <Select value={activeVersion} onValueChange={(val) => { setActiveVersion(val); setEditing(false); }}>
            <SelectTrigger className="h-8 text-xs bg-background flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {versions.map((ver, i) => (
                <SelectItem key={i} value={String(i)} className="text-xs">
                  {ver.title || ver.author}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-xs text-muted-foreground font-medium flex-1">{v.title || v.author}</span>
        )}
        <div className="flex items-center gap-1 shrink-0">
          {isAuthenticated && onInlineSave && !editing && (
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={startEdit}>
              <Pencil className="h-3 w-3" /> Edit
            </Button>
          )}
          {!editing && <CopyButton text={v.content} />}
        </div>
      </div>

      {editing ? (
        <div className="space-y-2">
          <div className="border rounded-lg overflow-hidden">
            <MinimalRichEditor
              value={editContent}
              onChange={setEditContent}
              onSave={saveEdit}
              onCancel={cancelEdit}
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={isSaving}>Cancel</Button>
            <Button size="sm" onClick={saveEdit} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-muted/50 rounded-lg p-3 text-sm leading-relaxed border prose prose-sm dark:prose-invert max-w-none overflow-x-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>{highlightText(v.content, searchQuery)}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

function ScriptVersionHistory({ scriptId, onRollback }: { scriptId: string; onRollback: (versions: ScriptVersion[]) => Promise<void> }) {
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [rollingBack, setRollingBack] = useState(false);

  const loadHistory = async () => {
    if (showHistory) { setShowHistory(false); return; }
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from('script_version_history' as any)
      .select('*')
      .eq('script_id', scriptId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (!error) setHistory(data || []);
    setLoadingHistory(false);
    setShowHistory(true);
  };

  const handleRollback = async (entry: any) => {
    if (!confirm('Are you sure you want to rollback to this version? The current content will be saved to history first.')) return;
    setRollingBack(true);
    const versions = (entry.versions as unknown as ScriptVersion[]) || [];
    await onRollback(versions);
    // Reload history
    const { data } = await supabase
      .from('script_version_history' as any)
      .select('*')
      .eq('script_id', scriptId)
      .order('created_at', { ascending: false })
      .limit(20);
    setHistory(data || []);
    setRollingBack(false);
  };

  return (
    <div className="mt-4 pt-4 border-t">
      <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground" onClick={loadHistory} disabled={loadingHistory}>
        <History className="h-3.5 w-3.5" />
        {loadingHistory ? 'Loading...' : showHistory ? 'Hide History' : 'Version History'}
      </Button>
      {showHistory && history.length > 0 && (
        <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto">
          {history.map((entry: any) => (
            <div key={entry.id} className="flex items-center justify-between gap-2 p-2 rounded-md border bg-muted/30 text-xs">
              <div className="min-w-0">
                <span className="font-medium">{entry.editor_name}</span>
                <span className="text-muted-foreground ml-2">
                  {new Date(entry.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-6 gap-1 text-[10px] shrink-0"
                onClick={() => handleRollback(entry)}
                disabled={rollingBack}
              >
                <RotateCcw className="h-3 w-3" />
                Rollback
              </Button>
            </div>
          ))}
        </div>
      )}
      {showHistory && history.length === 0 && (
        <p className="text-xs text-muted-foreground mt-2 italic">No edit history yet.</p>
      )}
    </div>
  );
}

function PlaybookDropdown({ myPlaybooks, scriptId, onAddToPlaybook, onCreatePlaybookAndAdd }: {
  myPlaybooks: { id: string; title: string }[];
  scriptId: string;
  onAddToPlaybook?: (playbookId: string, scriptId: string) => void;
  onCreatePlaybookAndAdd?: (title: string, scriptId: string) => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleCreate = () => {
    if (!newTitle.trim() || !onCreatePlaybookAndAdd) return;
    onCreatePlaybookAndAdd(newTitle.trim(), scriptId);
    setNewTitle("");
    setIsCreating(false);
    setMenuOpen(false);
  };

  return (
    <DropdownMenu open={menuOpen} onOpenChange={(open) => { setMenuOpen(open); if (!open) { setIsCreating(false); setNewTitle(""); } }}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 sm:h-7 gap-1.5 text-xs font-medium" onClick={(e) => e.stopPropagation()}>
          <Plus className="h-3 w-3" /> Playbook
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px]" onClick={(e) => e.stopPropagation()}>
        {myPlaybooks.map(pb => (
          <DropdownMenuItem key={pb.id} onClick={() => { onAddToPlaybook?.(pb.id, scriptId); setMenuOpen(false); }}>
            {pb.title}
          </DropdownMenuItem>
        ))}
        {isCreating ? (
          <div className="p-2 space-y-2" onClick={(e) => e.stopPropagation()}>
            <Input
              placeholder="Playbook name"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") { setIsCreating(false); setNewTitle(""); } }}
              autoFocus
              className="h-8 text-sm"
            />
            <div className="flex gap-1.5">
              <Button size="sm" className="h-7 text-xs flex-1" onClick={handleCreate} disabled={!newTitle.trim()}>
                Create & Add
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => { setIsCreating(false); setNewTitle(""); }}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <DropdownMenuItem onClick={(e) => { e.preventDefault(); setIsCreating(true); }} className="text-primary font-medium">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> New Playbook
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ScriptCard({ script, isAdmin, onEdit, onDelete, isOpenByUrl, onToggle, searchQuery = "", myPlaybooks, onAddToPlaybook, onCreatePlaybookAndAdd, isAuthenticated, userDisplayName, isFavourite, onToggleFavourite, isMobile, allScripts, onInlineSave, onMetadataSave, mergeSourceId, mergeOverId, tapSelectMode, onMergeDragStart, onMergeDragEnd, onMergeOver, onMergeLeave, onMergeDrop, onTapSelect, onTapTarget }: { script: ScriptEntry; isAdmin: boolean; onEdit: () => void; onDelete: () => void; isOpenByUrl: boolean; onToggle: (open: boolean) => void; searchQuery?: string; myPlaybooks?: { id: string; title: string }[]; onAddToPlaybook?: (playbookId: string, scriptId: string) => void; onCreatePlaybookAndAdd?: (title: string, scriptId: string) => void; isAuthenticated?: boolean; userDisplayName?: string; isFavourite?: boolean; onToggleFavourite?: () => void; isMobile?: boolean; allScripts?: ScriptEntry[]; onInlineSave?: (scriptId: string, versions: ScriptVersion[]) => Promise<void>; onMetadataSave?: (scriptId: string, updates: Partial<ScriptEntry>) => Promise<void>; mergeSourceId?: string | null; mergeOverId?: string | null; tapSelectMode?: boolean; onMergeDragStart?: (id: string) => void; onMergeDragEnd?: () => void; onMergeOver?: (id: string) => void; onMergeLeave?: () => void; onMergeDrop?: (targetId: string) => void; onTapSelect?: (id: string) => void; onTapTarget?: (id: string) => void; }) {
  const [open, setOpen] = useState(isOpenByUrl);
  const [editingVersionIdx, setEditingVersionIdx] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const cat = getCategoryInfo(script.category);
  const snippet = useMemo(() => getSearchSnippet(script.versions, searchQuery), [script.versions, searchQuery]);

  // Inline metadata editing state (admin only)
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(script.stage);
  const [editingCategory, setEditingCategory] = useState(false);
  const [editingAudience, setEditingAudience] = useState(false);
  const [editingVersionTitle, setEditingVersionTitle] = useState<number | null>(null);
  const [versionTitleDraft, setVersionTitleDraft] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [tagDraft, setTagDraft] = useState("");

  // User versions (all users can add their own versions)
  const { userVersions, addVersion: addUserVersion, updateVersion: updateUserVersion, deleteVersion: deleteUserVersion, userId: currentUserId } = useScriptUserVersions(script.id);
  const [showNewVersionForm, setShowNewVersionForm] = useState(false);
  const [newVersionName, setNewVersionName] = useState("");
  const [newVersionContent, setNewVersionContent] = useState("");
  const [editingUserVersionId, setEditingUserVersionId] = useState<string | null>(null);
  const [editUserVersionName, setEditUserVersionName] = useState("");
  // Read initial version tab from URL if this card is the one in the URL
  const urlVersionParam = useMemo(() => {
    // The URL may contain a slug (e.g. "warm-market-intro-8f42b1c3") — just rely on isOpenByUrl
    if (isOpenByUrl) {
      return searchParams.get("v") || null;
    }
    return null;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [activeVersionTab, setActiveVersionTabState] = useState(urlVersionParam || "0");
  // Tracks whether the user manually pinned a tab — prevents search effect from overriding it
  const manualTabRef = useRef<string | null>(urlVersionParam); // pre-pin the URL tab
  // Tracks whether we've applied the deep-linked user version tab (needs userVersions to load first)
  const urlVersionAppliedRef = useRef(!urlVersionParam || !urlVersionParam.startsWith("uv-"));
  // Ensures the deep-link toast fires only once
  const deepLinkToastFiredRef = useRef(false);

  // When version tab changes, update the URL ?v= param if this card is open by URL
  const setActiveVersionTab = useCallback((tab: string) => {
    setActiveVersionTabState(tab);
    if (isOpenByUrl) {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set("v", tab);
        return next;
      }, { replace: true });
    }
  }, [isOpenByUrl, setSearchParams]);

  // Toast for official version deep links (e.g. ?v=0, ?v=1) — fires once on mount
  useEffect(() => {
    if (!urlVersionParam || urlVersionParam.startsWith("uv-")) return;
    if (deepLinkToastFiredRef.current) return;
    const versionIdx = parseInt(urlVersionParam, 10);
    const versionName = script.versions[versionIdx]?.title || script.versions[versionIdx]?.author || `Version ${versionIdx + 1}`;
    deepLinkToastFiredRef.current = true;
    toast(`Viewing version: ${versionName}`, { duration: 3000 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply deep-linked user version tab once userVersions load, then toast
  useEffect(() => {
    if (urlVersionAppliedRef.current) return;
    if (!urlVersionParam || !urlVersionParam.startsWith("uv-")) return;
    const targetId = urlVersionParam.replace("uv-", "");
    const found = userVersions?.find(uv => uv.id === targetId);
    if (found) {
      urlVersionAppliedRef.current = true;
      setActiveVersionTabState(urlVersionParam);
      if (!deepLinkToastFiredRef.current) {
        deepLinkToastFiredRef.current = true;
        toast(`Viewing version: ${found.author_name || "User version"}`, { duration: 3000 });
      }
    }
  }, [userVersions, urlVersionParam]);

  // Auto-switch to the matching version tab when search query changes (unless user just manually set it)
  useEffect(() => {
    // Don't override while a uv- deep link is still pending (userVersions not loaded yet)
    if (!urlVersionAppliedRef.current) return;

    if (manualTabRef.current !== null) {
      // Clear the manual lock after one cycle so future search changes work normally
      manualTabRef.current = null;
      return;
    }
    if (!searchQuery?.trim()) {
      setActiveVersionTab("0");
      return;
    }
    const q = searchQuery.toLowerCase();
    const matchingIdx = script.versions.findIndex(v =>
      v.content?.toLowerCase().includes(q) || v.author?.toLowerCase().includes(q)
    );
    if (matchingIdx !== -1) {
      setActiveVersionTab(String(matchingIdx));
      return;
    }
    const matchingUv = userVersions.find(uv =>
      uv.content?.toLowerCase().includes(q) || uv.author_name?.toLowerCase().includes(q)
    );
    if (matchingUv) {
      setActiveVersionTab(`uv-${matchingUv.id}`);
      return;
    }
    setActiveVersionTab("0");
  }, [searchQuery, script.versions, userVersions]);


  const saveMetaField = async (updates: Partial<ScriptEntry>) => {
    if (!onMetadataSave) return;
    setIsSaving(true);
    await onMetadataSave(script.id, updates);
    setIsSaving(false);
  };

  const startInlineEdit = (versionIdx: number) => {
    setEditingVersionIdx(versionIdx);
    setEditContent(script.versions[versionIdx]?.content || "");
  };

  const cancelInlineEdit = () => {
    setEditingVersionIdx(null);
    setEditContent("");
  };

  const saveInlineEdit = async () => {
    if (editingVersionIdx === null || !onInlineSave) return;
    setIsSaving(true);
    const updatedVersions = script.versions.map((v, i) =>
      i === editingVersionIdx ? { ...v, content: editContent } : v
    );
    await onInlineSave(script.id, updatedVersions);
    setEditingVersionIdx(null);
    setEditContent("");
    setIsSaving(false);
  };

  const handleEditorBlur = () => {
    if (editingVersionIdx !== null) {
      saveInlineEdit();
    }
  };

  useEffect(() => {
    if (isOpenByUrl) {
      setOpen(true);
      setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [isOpenByUrl]);

  const handleToggle = (newOpen: boolean) => {
    setOpen(newOpen);
    onToggle(newOpen);
  };

  return (
    <div ref={cardRef} id={`script-${script.id}`}>
    <Collapsible open={open} onOpenChange={handleToggle}>
      <Card
        className={`overflow-hidden transition-all duration-200 ${isOpenByUrl ? "ring-2 ring-primary/50" : ""} ${
          mergeSourceId === script.id ? "ring-2 ring-primary/60 shadow-md" : ""
        } ${
          mergeSourceId && mergeSourceId !== script.id && mergeOverId === script.id ? "ring-2 ring-primary shadow-lg scale-[1.01]" : ""
        } ${
          tapSelectMode && mergeSourceId && mergeSourceId !== script.id ? "cursor-pointer ring-1 ring-primary/30 hover:ring-primary/60" : ""
        } ${
          mergeSourceId && mergeSourceId !== script.id && !tapSelectMode ? "cursor-copy" : ""
        }`}
        onDragOver={(e) => { if (mergeSourceId && mergeSourceId !== script.id) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; onMergeOver?.(script.id); } }}
        onDragLeave={onMergeLeave}
        onDrop={(e) => { e.preventDefault(); if (mergeSourceId && mergeSourceId !== script.id) onMergeDrop?.(script.id); }}
        onClick={() => { if (tapSelectMode && mergeSourceId && mergeSourceId !== script.id) onTapTarget?.(script.id); }}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 px-3 sm:py-4 sm:px-6">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              {onMergeDragStart && (
                <div
                  draggable
                  className={`group shrink-0 mt-0.5 sm:mt-0 flex flex-col items-center gap-0.5 px-1 py-1 rounded transition-colors ${
                    mergeSourceId === script.id && tapSelectMode
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground/40 hover:text-primary hover:bg-primary/5"
                  } cursor-grab active:cursor-grabbing`}
                  title="Drag onto another card to merge scripts (desktop) · Tap to select for merge (mobile)"
                  onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.effectAllowed = "move"; const ghost = document.createElement('div'); ghost.style.cssText = 'position:fixed;top:-1000px;width:1px;height:1px;opacity:0;'; document.body.appendChild(ghost); e.dataTransfer.setDragImage(ghost, 0, 0); setTimeout(() => document.body.removeChild(ghost), 0); onMergeDragStart?.(script.id); }}
                  onDragEnd={(e) => { e.stopPropagation(); onMergeDragEnd?.(); }}
                  onClick={(e) => { e.stopPropagation(); onTapSelect?.(script.id); }}
                >
                  <GripVertical className="h-4 w-4" />
                  <span className="text-[9px] font-medium leading-none opacity-0 group-hover:opacity-100 transition-opacity">merge</span>
                </div>
              )}
              <cat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  {editingTitle && isAdmin ? (
                    <div className="flex items-center gap-1.5 flex-1" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={titleDraft}
                        onChange={(e) => setTitleDraft(e.target.value)}
                        className="h-7 text-sm font-semibold"
                        autoFocus
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            await saveMetaField({ stage: titleDraft });
                            setEditingTitle(false);
                          } else if (e.key === 'Escape') {
                            setTitleDraft(script.stage);
                            setEditingTitle(false);
                          }
                        }}
                        onBlur={async () => {
                          if (titleDraft !== script.stage) await saveMetaField({ stage: titleDraft });
                          setEditingTitle(false);
                        }}
                      />
                    </div>
                  ) : (
                    <CardTitle
                      className={`text-sm sm:text-base leading-snug ${isAdmin && onMetadataSave ? 'cursor-text hover:underline decoration-dashed decoration-muted-foreground/40 underline-offset-4' : ''}`}
                      onDoubleClick={(e) => {
                        if (isAdmin && onMetadataSave) {
                          e.stopPropagation();
                          setTitleDraft(script.stage);
                          setEditingTitle(true);
                        }
                      }}
                      title={isAdmin && onMetadataSave ? "Double-click to rename" : undefined}
                    >
                      <HighlightedTitle text={script.stage} query={searchQuery} />
                    </CardTitle>
                  )}
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-0.5 ${open ? "rotate-180" : ""}`} />
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 flex-wrap">
                  {/* Editable category badge */}
                  {editingCategory && isAdmin ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={script.category}
                        onValueChange={async (val) => {
                          await saveMetaField({ category: val });
                          setEditingCategory(false);
                        }}
                        open={true}
                        onOpenChange={(o) => { if (!o) setEditingCategory(false); }}
                      >
                        <SelectTrigger className="h-5 text-[10px] w-auto min-w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(categoryLabels).map((key) => (
                            <SelectItem key={key} value={key} className="text-xs">{getCategoryInfo(key).label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <Badge
                      variant="secondary"
                      className={`text-[10px] ${cat.color} ${isAdmin && onMetadataSave ? 'cursor-pointer hover:ring-1 ring-primary/40' : ''}`}
                      onClick={(e) => {
                        if (isAdmin && onMetadataSave) {
                          e.stopPropagation();
                          setEditingCategory(true);
                        }
                      }}
                    >
                      {cat.label}
                    </Badge>
                  )}
                  {/* Editable audience badge */}
                  {editingAudience && isAdmin ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={script.target_audience || "general"}
                        onValueChange={async (val) => {
                          await saveMetaField({ target_audience: val });
                          setEditingAudience(false);
                        }}
                        open={true}
                        onOpenChange={(o) => { if (!o) setEditingAudience(false); }}
                      >
                        <SelectTrigger className="h-5 text-[10px] w-auto min-w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(audienceLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key} className="text-xs">{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${isAdmin && onMetadataSave ? 'cursor-pointer hover:ring-1 ring-primary/40' : ''}`}
                      onClick={(e) => {
                        if (isAdmin && onMetadataSave) {
                          e.stopPropagation();
                          setEditingAudience(true);
                        }
                      }}
                    >
                      {audienceLabels[script.target_audience || "general"] || script.target_audience || "General"}
                    </Badge>
                  )}
                  {script.script_role && script.script_role !== "consultant" && (
                    <Badge variant="outline" className="text-[10px] border-dashed">
                      {roleLabels[script.script_role] || script.script_role}
                    </Badge>
                  )}
                  {/* Tags — removable by admin inline, hidden on mobile */}
                  <span className="hidden sm:contents">
                    {(script.tags || []).map((tag) => (
                      <Badge key={tag} variant="outline" className={`text-[10px] bg-accent/30 gap-1 ${isAdmin && onMetadataSave ? 'pr-0.5' : ''}`}>
                        {tag}
                        {isAdmin && onMetadataSave && (
                          <button
                            style={{ cursor: 'pointer' }}
                            className="ml-0.5 hover:text-destructive transition-colors"
                            onClick={async (e) => { e.stopPropagation(); await saveMetaField({ tags: (script.tags || []).filter(t => t !== tag) }); }}
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    {isAdmin && onMetadataSave && (
                      addingTag ? (
                        <div onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={tagDraft}
                            onChange={(e) => setTagDraft(e.target.value)}
                            placeholder="new tag…"
                            className="h-5 text-[10px] w-20 px-1.5 py-0"
                            autoFocus
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter' && tagDraft.trim()) {
                                e.preventDefault();
                                await saveMetaField({ tags: [...(script.tags || []), tagDraft.trim().toLowerCase()] });
                                setTagDraft(""); setAddingTag(false);
                              } else if (e.key === 'Escape') { setTagDraft(""); setAddingTag(false); }
                            }}
                            onBlur={() => { setTagDraft(""); setAddingTag(false); }}
                          />
                        </div>
                      ) : (
                        <button
                          style={{ cursor: 'pointer' }}
                          className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors border border-dashed border-muted-foreground/30 rounded px-1 py-0.5"
                          onClick={(e) => { e.stopPropagation(); setAddingTag(true); }}
                          title="Add tag"
                        >
                          <Plus className="h-2.5 w-2.5" /> tag
                        </button>
                      )
                    )}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {script.versions.length} version{script.versions.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                {/* Search snippet preview when collapsed */}
                {!open && snippet && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                    <HighlightedTitle text={snippet} query={searchQuery} />
                  </p>
                )}
                {/* Mobile-friendly action row */}
                <div className="flex items-center gap-0.5 mt-2 -ml-1" onClick={(e) => e.stopPropagation()}>
                  {onToggleFavourite && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`h-7 px-2 gap-1 text-xs ${isFavourite ? 'text-red-500' : 'text-muted-foreground'}`}
                      onClick={(e) => { e.stopPropagation(); onToggleFavourite(); }}
                      title={isFavourite ? "Remove from favourites" : "Add to favourites"}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isFavourite ? 'fill-red-500' : ''}`} />
                      <span className="hidden sm:inline">{isFavourite ? 'Saved' : 'Save'}</span>
                    </Button>
                  )}
                  {isAuthenticated && (onAddToPlaybook || onCreatePlaybookAndAdd) && (
                    <PlaybookDropdown
                      myPlaybooks={myPlaybooks || []}
                      scriptId={script.id}
                      onAddToPlaybook={onAddToPlaybook}
                      onCreatePlaybookAndAdd={onCreatePlaybookAndAdd}
                    />
                  )}
                  {isAdmin && (
                    <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-xs text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete script">
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-3 sm:px-6">
            {script.versions.length > 1 ? (
              isMobile ? (
                /* Mobile: dropdown version selector */
                <MobileVersionSelector
                  versions={script.versions}
                  searchQuery={searchQuery}
                  isAuthenticated={isAuthenticated}
                  onInlineSave={onInlineSave}
                  scriptId={script.id}
                />
              ) : (
                <Tabs value={activeVersionTab} onValueChange={setActiveVersionTab}>
                  {/* Version switcher header */}
                  <div className="flex items-center gap-2 flex-wrap mb-3 pb-3 border-b border-border/60">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-medium text-muted-foreground">Versions</span>
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                        {script.versions.length + userVersions.length}
                      </span>
                      {isAuthenticated && <span className="text-[10px] text-muted-foreground/50 hidden sm:inline">· right-click a tab for options</span>}
                    </div>
                    {/* Inline rename inputs — rendered outside TabsList to avoid styling conflicts */}
                    {editingVersionTitle !== null && isAdmin && (
                      <div className="flex items-center gap-2 mb-2 px-0.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          value={versionTitleDraft}
                          onChange={(e) => setVersionTitleDraft(e.target.value)}
                          autoFocus
                          placeholder="Version name…"
                          className="h-7 text-xs px-2 rounded-full border border-primary bg-background text-foreground outline-none ring-1 ring-primary w-40"
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const newVersions = script.versions.map((ver, idx) =>
                                idx === editingVersionTitle ? { ...ver, author: versionTitleDraft, title: versionTitleDraft } : ver
                              );
                              if (onInlineSave) await onInlineSave(script.id, newVersions);
                              setEditingVersionTitle(null);
                            } else if (e.key === 'Escape') {
                              setEditingVersionTitle(null);
                            }
                          }}
                          onBlur={async () => {
                            const v = script.versions[editingVersionTitle];
                            if (v && versionTitleDraft !== (v.title || v.author)) {
                              const newVersions = script.versions.map((ver, idx) =>
                                idx === editingVersionTitle ? { ...ver, author: versionTitleDraft, title: versionTitleDraft } : ver
                              );
                              if (onInlineSave) await onInlineSave(script.id, newVersions);
                            }
                            setEditingVersionTitle(null);
                          }}
                        />
                        <span className="text-[11px] text-muted-foreground">Press Enter to save · Esc to cancel</span>
                      </div>
                    )}
                    {editingUserVersionId !== null && (
                      <div className="flex items-center gap-2 mb-2 px-0.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          value={editUserVersionName}
                          onChange={(e) => setEditUserVersionName(e.target.value)}
                          autoFocus
                          placeholder="Version name…"
                          className="h-7 text-xs px-2 rounded-full border border-primary bg-background text-foreground outline-none ring-1 ring-primary w-40"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); const uv = userVersions.find(u => u.id === editingUserVersionId); if (uv) updateUserVersion.mutate({ id: uv.id, content: uv.content, authorName: editUserVersionName || uv.author_name }); setEditingUserVersionId(null); }
                            else if (e.key === 'Escape') setEditingUserVersionId(null);
                          }}
                          onBlur={() => { const uv = userVersions.find(u => u.id === editingUserVersionId); if (uv && editUserVersionName !== uv.author_name) updateUserVersion.mutate({ id: uv.id, content: uv.content, authorName: editUserVersionName || uv.author_name }); setEditingUserVersionId(null); }}
                        />
                        <span className="text-[11px] text-muted-foreground">Press Enter to save · Esc to cancel</span>
                      </div>
                    )}
                    <TabsList className="bg-transparent p-0 h-auto gap-1.5 flex-wrap justify-start">
                      {script.versions.map((v, i) => (
                        <ContextMenu key={i}>
                          <ContextMenuTrigger asChild>
                            <TabsTrigger value={String(i)} style={{ cursor: 'pointer' }}
                              className="text-xs px-3 py-1 h-auto rounded-full border border-border bg-muted/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-sm hover:bg-muted transition-colors"
                              onDoubleClick={(e) => {
                                if (isAdmin && onMetadataSave) {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setVersionTitleDraft(v.title || v.author || `Version ${i + 1}`);
                                  setEditingVersionTitle(i);
                                }
                              }}>
                              <span title="Right-click to duplicate · Double-click to rename (admin)">
                                {v.title || v.author || `Version ${i + 1}`}
                              </span>
                            </TabsTrigger>
                          </ContextMenuTrigger>
                          <ContextMenuContent className="w-44">
                            {isAuthenticated && (
                              <ContextMenuItem
                                onClick={() => {
                                  const sourceName = v.title || v.author || `Version ${i + 1}`;
                                  addUserVersion.mutate(
                                    { content: v.content, authorName: `Copy of ${sourceName}` },
                                    { onSuccess: (newVersion) => {
                                      setShowNewVersionForm(false);
                                      setTimeout(() => {
                                        setActiveVersionTab(`uv-${newVersion.id}`);
                                        setNewVersionName(`Copy of ${sourceName}`);
                                      }, 50);
                                    }}
                                  );
                                }}
                              >
                                <Copy className="h-3.5 w-3.5 mr-2" />
                                Duplicate to my version
                              </ContextMenuItem>
                            )}
                          </ContextMenuContent>
                        </ContextMenu>
                      ))}
                      {/* User version tabs */}
                      {userVersions.map((uv) => (
                        <ContextMenu key={`uv-${uv.id}`}>
                          <ContextMenuTrigger asChild>
                            <TabsTrigger value={`uv-${uv.id}`} style={{ cursor: 'pointer' }}
                              className="text-xs px-3 py-1 h-auto rounded-full border border-border bg-muted/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-sm hover:bg-muted transition-colors"
                              onDoubleClick={(e) => {
                                if (currentUserId === uv.user_id) {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setEditUserVersionName(uv.author_name);
                                  setEditingUserVersionId(uv.id);
                                }
                              }}>
                              <span title={currentUserId === uv.user_id ? "Right-click to duplicate or rename · Double-click to rename" : "Right-click to duplicate"}>
                                {uv.author_name}
                              </span>
                            </TabsTrigger>
                          </ContextMenuTrigger>
                          <ContextMenuContent className="w-44">
                            {isAuthenticated && (
                              <ContextMenuItem
                                onClick={() => {
                                  addUserVersion.mutate(
                                    { content: uv.content, authorName: `Copy of ${uv.author_name}` },
                                    { onSuccess: (newVersion) => {
                                      setTimeout(() => setActiveVersionTab(`uv-${newVersion.id}`), 50);
                                    }}
                                  );
                                }}
                              >
                                <Copy className="h-3.5 w-3.5 mr-2" />
                                Duplicate to my version
                              </ContextMenuItem>
                            )}
                            {currentUserId === uv.user_id && (
                              <>
                                <ContextMenuSeparator />
                                <ContextMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditUserVersionName(uv.author_name);
                                    setEditingUserVersionId(uv.id);
                                  }}
                                >
                                  <Pencil className="h-3.5 w-3.5 mr-2" />
                                  Rename
                                </ContextMenuItem>
                              </>
                            )}
                          </ContextMenuContent>
                        </ContextMenu>
                      ))}
                      {/* Add version button */}
                      {isAuthenticated && (
                        <button
                          style={{ cursor: 'pointer' }}
                          className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                          title="Add your version"
                          onClick={(e) => { e.stopPropagation(); setShowNewVersionForm(true); }}
                        >
                          <Plus className="h-3 w-3" /> Add version
                        </button>
                      )}
                    </TabsList>
                  </div>
                  {/* New version form */}
                  {showNewVersionForm && (
                    <div className="mb-3 border rounded-lg p-3 bg-muted/20 space-y-2">
                      <Input
                        value={newVersionName}
                        onChange={(e) => setNewVersionName(e.target.value)}
                        placeholder="Version name (e.g. 'My Style')"
                        className="text-sm"
                        autoFocus
                      />
                      <MinimalRichEditor
                        value={newVersionContent}
                        onChange={setNewVersionContent}
                        placeholder="Write your version… (supports markdown)"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setShowNewVersionForm(false); setNewVersionContent(""); setNewVersionName(""); }}>
                          <X className="h-3.5 w-3.5 mr-1" /> Cancel
                        </Button>
                        <Button size="sm" disabled={!newVersionContent.trim() || addUserVersion.isPending} onClick={() => {
                          addUserVersion.mutate(
                            { content: newVersionContent.trim(), authorName: newVersionName.trim() || "My Version" },
                            { onSuccess: (newVersion) => {
                                setShowNewVersionForm(false);
                                setNewVersionContent("");
                                setNewVersionName("");
                                if (newVersion?.id) {
                                  const tabId = `uv-${newVersion.id}`;
                                  manualTabRef.current = tabId;
                                  setActiveVersionTab(tabId);
                                  // Wait for query refetch + DOM update before scrolling
                                  setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 400);
                                }
                              }
                            }
                          );
                        }}>
                          {addUserVersion.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />Adding…</> : "Add Version"}
                        </Button>
                      </div>
                    </div>
                  )}
                  {/* Official version tab contents */}
                  {script.versions.map((v, i) => (
                    <TabsContent key={i} value={String(i)}>
                      {editingVersionIdx === i ? (
                        <div className="space-y-2" onBlur={handleEditorBlur}>
                          <div className="border rounded-lg overflow-hidden">
                            <MinimalRichEditor
                              value={editContent}
                              onChange={setEditContent}
                              autoFocus
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                             {isAuthenticated && (
                               <>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   className="h-7 text-xs gap-1"
                                   title="Duplicate this version as your own copy"
                                   onMouseDown={(e) => e.preventDefault()}
                                   onClick={() => {
                                     const sourceName = v.title || v.author || `Version ${i + 1}`;
                                     addUserVersion.mutate(
                                       { content: editContent, authorName: `Copy of ${sourceName}` },
                                       { onSuccess: (newVersion) => {
                                           if (newVersion?.id) {
                                             const tabId = `uv-${newVersion.id}`;
                                             manualTabRef.current = tabId;
                                             setActiveVersionTab(tabId);
                                             setEditUserVersionName(`Copy of ${sourceName}`);
                                             setEditingUserVersionId(newVersion.id);
                                             cancelInlineEdit();
                                             setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 400);
                                           }
                                         }
                                       }
                                     );
                                   }}
                                 >
                                   <Copy className="h-3 w-3" /> Duplicate
                                 </Button>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   className="h-7 text-xs gap-1"
                                   title="Add a new blank version"
                                   onMouseDown={(e) => e.preventDefault()}
                                   onClick={() => {
                                     addUserVersion.mutate(
                                       { content: "", authorName: userDisplayName || "My Version" },
                                       { onSuccess: (newVersion) => {
                                           if (newVersion?.id) {
                                             const tabId = `uv-${newVersion.id}`;
                                             manualTabRef.current = tabId;
                                             setActiveVersionTab(tabId);
                                             setEditUserVersionName(userDisplayName || "My Version");
                                             setEditingUserVersionId(newVersion.id);
                                             cancelInlineEdit();
                                             setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 400);
                                           }
                                         }
                                       }
                                     );
                                   }}
                                 >
                                   <Plus className="h-3 w-3" /> Add version
                                 </Button>
                               </>
                             )}
                             <span className="text-[10px] text-muted-foreground italic ml-auto">auto-saves on click away</span>
                           </div>
                        </div>
                      ) : (
                        <>
                          <div
                            className={`bg-muted/50 rounded-lg p-3 sm:p-4 text-sm leading-relaxed border prose prose-sm dark:prose-invert max-w-none overflow-x-auto ${isAuthenticated && onInlineSave ? 'cursor-text hover:border-primary/40 transition-colors' : ''}`}
                            onDoubleClick={() => { if (isAuthenticated && onInlineSave) startInlineEdit(i); }}
                            title={isAuthenticated && onInlineSave ? "Double-click to edit" : undefined}
                          >
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>{highlightText(v.content, searchQuery)}</ReactMarkdown>
                          </div>
                          <div className="flex items-center gap-1 mt-2 flex-wrap">
                             <CopyButton text={v.content} />
                             <button
                               className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded border border-transparent hover:border-border"
                               title="Copy link to this version"
                               onClick={() => {
                                 const url = new URL(window.location.href);
                                 url.pathname = `/scripts/${script.id}`;
                                 url.searchParams.set("v", String(i));
                                 navigator.clipboard.writeText(url.toString());
                                 toast.success("Version link copied!");
                               }}
                             >
                               <Link2 className="h-3 w-3" /> Copy link
                             </button>
                             {isAuthenticated && (
                               <button
                                 className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors rounded border border-transparent hover:border-primary/20"
                                 title="Duplicate this version to edit as your own"
                                 onClick={() => {
                                   const sourceName = v.title || v.author || `Version ${i + 1}`;
                                   addUserVersion.mutate(
                                     { content: v.content, authorName: `Copy of ${sourceName}` },
                                     { onSuccess: (newVersion) => {
                                         if (newVersion?.id) {
                                           const tabId = `uv-${newVersion.id}`;
                                           manualTabRef.current = tabId;
                                           setActiveVersionTab(tabId);
                                           setEditUserVersionName(`Copy of ${sourceName}`);
                                           setEditingUserVersionId(newVersion.id);
                                           setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 400);
                                         }
                                       }
                                     }
                                   );
                                 }}
                               >
                                 <Copy className="h-3 w-3" /> Duplicate
                               </button>
                             )}
                             {isAuthenticated && onInlineSave && (
                               <span className="text-[10px] text-muted-foreground/60 italic ml-1">double-click to edit</span>
                             )}
                             {isAdmin && onInlineSave && script.versions.length > 1 && (
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 className="h-6 text-xs text-destructive hover:text-destructive px-2 ml-auto"
                                 onClick={async () => {
                                   const newVersions = script.versions.filter((_, idx) => idx !== i);
                                   await onInlineSave(script.id, newVersions);
                                   setActiveVersionTab("0");
                                 }}
                               >
                                 <Trash2 className="h-3 w-3 mr-1" /> Delete version
                               </Button>
                             )}
                           </div>
                        </>
                      )}
                    </TabsContent>
                  ))}
                  {/* User version tab contents */}
                  {userVersions.map((uv) => (
                     <TabsContent key={`uv-${uv.id}`} value={`uv-${uv.id}`}>
                       <div
                         className={`bg-muted/50 rounded-lg p-3 sm:p-4 text-sm leading-relaxed border prose prose-sm dark:prose-invert max-w-none overflow-x-auto ${currentUserId === uv.user_id ? 'cursor-text hover:border-primary/40 transition-colors' : ''}`}
                         onDoubleClick={() => { /* user versions are not inline-editable here, use the edit button */ }}
                         title={currentUserId === uv.user_id ? "Double-click to rename • Use duplicate to branch" : undefined}
                       >
                         <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>{uv.content}</ReactMarkdown>
                       </div>
                       <div className="flex items-center gap-1 mt-2 flex-wrap">
                         <CopyButton text={uv.content} />
                         <button
                           className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded border border-transparent hover:border-border"
                           title="Copy link to this version"
                           onClick={() => {
                             const url = new URL(window.location.href);
                             url.pathname = `/scripts/${script.id}`;
                             url.searchParams.set("v", `uv-${uv.id}`);
                             navigator.clipboard.writeText(url.toString());
                             toast.success("Version link copied!");
                           }}
                         >
                           <Link2 className="h-3 w-3" /> Copy link
                         </button>
                         {isAuthenticated && (
                           <button
                             className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors rounded border border-transparent hover:border-primary/20"
                             title="Duplicate this version to edit as your own"
                             onClick={() => {
                               addUserVersion.mutate(
                                 { content: uv.content, authorName: `Copy of ${uv.author_name}` },
                                 { onSuccess: (newVersion) => {
                                     if (newVersion?.id) {
                                       const tabId = `uv-${newVersion.id}`;
                                       manualTabRef.current = tabId;
                                       setActiveVersionTab(tabId);
                                       setEditUserVersionName(`Copy of ${uv.author_name}`);
                                       setEditingUserVersionId(newVersion.id);
                                       setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 400);
                                     }
                                   }
                                 }
                               );
                             }}
                           >
                             <Copy className="h-3 w-3" /> Duplicate
                           </button>
                         )}
                         {(currentUserId === uv.user_id || isAdmin) && (
                           <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                             onClick={() => deleteUserVersion.mutate(uv.id)}>
                             <Trash2 className="h-3 w-3 mr-1" /> Delete version
                           </Button>
                         )}
                       </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )
            ) : (
              editingVersionIdx === 0 ? (
                <div className="space-y-2" onBlur={handleEditorBlur}>
                  <div className="border rounded-lg overflow-hidden">
                    <MinimalRichEditor
                      value={editContent}
                      onChange={setEditContent}
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    {isAuthenticated && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          title="Duplicate this version as your own copy"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            const sourceName = script.versions[0]?.title || script.versions[0]?.author || "Version 1";
                            addUserVersion.mutate(
                              { content: editContent, authorName: `Copy of ${sourceName}` },
                              { onSuccess: (newVersion) => {
                                  if (newVersion?.id) {
                                    const tabId = `uv-${newVersion.id}`;
                                    manualTabRef.current = tabId;
                                    setActiveVersionTab(tabId);
                                    setEditUserVersionName(`Copy of ${sourceName}`);
                                    setEditingUserVersionId(newVersion.id);
                                    cancelInlineEdit();
                                    setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 400);
                                  }
                                }
                              }
                            );
                          }}
                        >
                          <Copy className="h-3 w-3" /> Duplicate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          title="Add a new blank version"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            addUserVersion.mutate(
                              { content: "", authorName: userDisplayName || "My Version" },
                              { onSuccess: (newVersion) => {
                                  if (newVersion?.id) {
                                    const tabId = `uv-${newVersion.id}`;
                                    manualTabRef.current = tabId;
                                    setActiveVersionTab(tabId);
                                    setEditUserVersionName(userDisplayName || "My Version");
                                    setEditingUserVersionId(newVersion.id);
                                    cancelInlineEdit();
                                    setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 400);
                                  }
                                }
                              }
                            );
                          }}
                        >
                          <Plus className="h-3 w-3" /> Add version
                        </Button>
                      </>
                    )}
                    <span className="text-[10px] text-muted-foreground italic ml-auto">auto-saves on click away</span>
                  </div>
                </div>
              ) : (
                <>
                   {/* Version header row — matches multi-version style */}
                  <div className="flex items-center gap-2 flex-wrap mb-3 pb-3 border-b border-border/60">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[11px] font-medium text-muted-foreground">Versions</span>
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                        {script.versions.length + userVersions.length}
                      </span>
                    </div>
                    {script.versions.length > 0 && (
                      <span className="inline-flex items-center text-xs px-3 py-1 rounded-full border border-border bg-muted/40 text-foreground font-medium">
                        {script.versions[0].title || script.versions[0].author || "Version 1"}
                      </span>
                    )}
                    {/* User version tabs in single-version mode */}
                    {userVersions.map((uv) => (
                      <button
                        key={uv.id}
                        className="inline-flex items-center text-xs px-3 py-1 rounded-full border border-border bg-primary text-primary-foreground font-medium"
                        onClick={() => {/* no-op, single version mode shows inline */}}
                      >
                        {uv.author_name}
                      </button>
                    ))}
                    {isAuthenticated && (
                      <button
                        className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                        onClick={(e) => { e.stopPropagation(); setShowNewVersionForm(true); }}
                      >
                        <Plus className="h-3 w-3" /> Add version
                      </button>
                    )}
                  </div>
                  {/* New version form */}
                  {showNewVersionForm && (
                    <div className="mb-3 border rounded-lg p-3 bg-muted/20 space-y-2">
                      <Input
                        value={newVersionName}
                        onChange={(e) => setNewVersionName(e.target.value)}
                        placeholder="Version name (e.g. 'My Style')"
                        className="text-sm"
                        autoFocus
                      />
                      <MinimalRichEditor
                        value={newVersionContent}
                        onChange={setNewVersionContent}
                        placeholder="Write your version… (supports markdown)"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setShowNewVersionForm(false); setNewVersionContent(""); setNewVersionName(""); }}>
                          <X className="h-3.5 w-3.5 mr-1" /> Cancel
                        </Button>
                        <Button size="sm" disabled={!newVersionContent.trim() || addUserVersion.isPending} onClick={() => {
                          addUserVersion.mutate(
                            { content: newVersionContent.trim(), authorName: newVersionName.trim() || "My Version" },
                            { onSuccess: () => {
                                setShowNewVersionForm(false);
                                setNewVersionContent("");
                                setNewVersionName("");
                              }
                            }
                          );
                        }}>
                          {addUserVersion.isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />Adding…</> : "Add Version"}
                        </Button>
                      </div>
                    </div>
                  )}
                  {script.versions.length === 0 ? (
                    <div className="text-sm text-muted-foreground italic py-2">No content yet.</div>
                  ) : (
                    <>
                      {script.versions[0]?.author && (
                        <span className="text-xs text-muted-foreground font-medium block mb-2">{script.versions[0].author}</span>
                      )}
                      <div
                        className={`bg-muted/50 rounded-lg p-3 sm:p-4 text-sm leading-relaxed border prose prose-sm dark:prose-invert max-w-none overflow-x-auto ${isAuthenticated && onInlineSave ? 'cursor-text hover:border-primary/40 transition-colors' : ''}`}
                        onDoubleClick={() => { if (isAuthenticated && onInlineSave) startInlineEdit(0); }}
                        title={isAuthenticated && onInlineSave ? "Double-click to edit" : undefined}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={markdownComponents}>{highlightText(script.versions[0]?.content || "", searchQuery)}</ReactMarkdown>
                      </div>
                       <div className="flex items-center gap-1 mt-2 flex-wrap">
                        <CopyButton text={script.versions[0]?.content || ""} />
                        <button
                          className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors rounded border border-transparent hover:border-primary/20"
                          title="Duplicate this version to edit as your own"
                          onClick={() => {
                            const sourceName = script.versions[0]?.title || script.versions[0]?.author || "Version 1";
                            addUserVersion.mutate(
                              { content: script.versions[0]?.content || "", authorName: `Copy of ${sourceName}` },
                              { onSuccess: (newVersion) => {
                                  if (newVersion?.id) {
                                    const tabId = `uv-${newVersion.id}`;
                                    manualTabRef.current = tabId;
                                    setActiveVersionTab(tabId);
                                    setEditUserVersionName(`Copy of ${sourceName}`);
                                    setEditingUserVersionId(newVersion.id);
                                    setTimeout(() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 400);
                                  }
                                }
                              }
                            );
                          }}
                        >
                          <Copy className="h-3 w-3" /> Duplicate
                        </button>
                        {isAuthenticated && onInlineSave && (
                          <span className="text-[10px] text-muted-foreground/60 italic ml-1">double-click to edit</span>
                        )}
                      </div>
                    </>
                  )}
                </>
              )
            )}

            {/* Image Attachments Gallery */}
            {script.attachments && script.attachments.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Attachments to send with this message</span>
                  <Badge variant="secondary" className="text-[10px]">{script.attachments.length}</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {script.attachments.map((att, i) => (
                    <div key={i} className="group relative border rounded-lg overflow-hidden bg-background">
                      {att.type === 'image' && (
                        <img
                          src={att.url}
                          alt={att.label}
                          className="w-full h-40 object-cover"
                          loading="lazy"
                        />
                      )}
                      <div className="p-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-medium truncate">{att.label}</span>
                        <a
                          href={att.url}
                          download={att.label + (att.url.match(/\.\w+$/)?.[0] || '')}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Force download via fetch for same-origin files
                            e.preventDefault();
                            fetch(att.url)
                              .then(res => res.blob())
                              .then(blob => {
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = att.label + (att.url.match(/\.\w+$/)?.[0] || '');
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                                toast.success(`Downloaded ${att.label}`);
                              })
                              .catch(() => toast.error('Download failed'));
                          }}
                        >
                          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" title="Download">
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Script Link */}
            {script.related_script_id && allScripts && (() => {
              const related = allScripts.find(s => s.id === script.related_script_id);
              if (!related) return null;
              const relCat = getCategoryInfo(related.category);
              return (
                <div className="mt-4 pt-3 border-t">
                  <button
                    onClick={() => navigate(`/scripts/${related.id}`)}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group w-full text-left"
                  >
                    <Link2 className="h-3.5 w-3.5 shrink-0 text-primary/60 group-hover:text-primary" />
                    <span>Related:</span>
                    <span className="font-medium text-foreground group-hover:text-primary truncate">{related.stage}</span>
                    <Badge variant="secondary" className={`text-[9px] shrink-0 ${relCat.color}`}>{relCat.label}</Badge>
                  </button>
                </div>
              );
            })()}

            {/* Reverse related: show scripts that link TO this script */}
            {allScripts && (() => {
              const children = allScripts.filter(s => s.related_script_id === script.id);
              if (children.length === 0) return null;
              return (
                <div className="mt-4 pt-3 border-t">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Link2 className="h-3 w-3" /> Follow-up scripts
                  </p>
                  <div className="space-y-1">
                    {children.map(child => {
                      const childCat = getCategoryInfo(child.category);
                      return (
                        <button
                          key={child.id}
                          onClick={() => navigate(`/scripts/${child.id}`)}
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors group w-full text-left"
                        >
                          <span className="font-medium text-foreground group-hover:text-primary truncate">{child.stage}</span>
                          <Badge variant="secondary" className={`text-[9px] shrink-0 ${childCat.color}`}>{childCat.label}</Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Version History (Admin Only) */}
            {isAdmin && (
              <ScriptVersionHistory scriptId={script.id} onRollback={async (versions) => {
                if (onInlineSave) {
                  await onInlineSave(script.id, versions);
                  toast.success('Script rolled back to selected version');
                }
              }} />
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
    </div>
  );
}

function FollowUpSubGroup({ subType, config, scripts, isAdmin, scriptId, searchQuery, myPlaybooks, handleAddToPlaybook, handleCreatePlaybookAndAdd, user, favouriteIds, toggleFavourite, isMobile, setEditingScript, setEditorOpen, setDeleteTarget, navigate, onScriptNavigate, allScripts, onInlineSave, onMetadataSave }: {
  subType: string;
  config: { label: string; icon: string; description: string };
  scripts: ScriptEntry[];
  isAdmin: boolean;
  scriptId?: string;
  searchQuery: string;
  myPlaybooks?: { id: string; title: string }[];
  handleAddToPlaybook: (playbookId: string, scriptId: string) => void;
  handleCreatePlaybookAndAdd?: (title: string, scriptId: string) => void;
  user: any;
  favouriteIds: Set<string>;
  toggleFavourite: { mutate: (id: string) => void };
  isMobile: boolean;
  setEditingScript: (s: ScriptEntry) => void;
  setEditorOpen: (open: boolean) => void;
  setDeleteTarget: (s: ScriptEntry) => void;
  navigate: (path: string, opts?: { replace?: boolean }) => void;
  onScriptNavigate: (id: string) => void;
  allScripts?: ScriptEntry[];
  onInlineSave?: (scriptId: string, versions: ScriptVersion[]) => Promise<void>;
  onMetadataSave?: (scriptId: string, updates: Partial<ScriptEntry>) => Promise<void>;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="border rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors text-left">
            <div className="flex items-center gap-2.5">
              <span className="text-base">{config.icon}</span>
              <div>
                <span className="font-semibold text-sm text-foreground">{config.label}</span>
                <span className="text-xs text-muted-foreground ml-2">{config.description}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="secondary" className="text-xs font-medium">{scripts.length}</Badge>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-2 p-2">
            {scripts.map((script) => (
              <ScriptCard
                key={script.id}
                script={script}
                isAdmin={isAdmin}
                isOpenByUrl={scriptId === script.id}
                searchQuery={searchQuery}
                myPlaybooks={myPlaybooks}
                onAddToPlaybook={handleAddToPlaybook}
                onCreatePlaybookAndAdd={handleCreatePlaybookAndAdd}
                isAuthenticated={!!user}
                userDisplayName={user?.user_metadata?.display_name || user?.email?.split('@')[0] || ''}
                isFavourite={favouriteIds.has(script.id)}
                onToggleFavourite={() => toggleFavourite.mutate(script.id)}
                isMobile={isMobile}
                allScripts={allScripts}
                onEdit={() => { setEditingScript(script); setEditorOpen(true); }}
                onDelete={() => setDeleteTarget(script)}
                onInlineSave={onInlineSave}
                onMetadataSave={onMetadataSave}
                onToggle={(open) => {
                  if (open) onScriptNavigate(script.id);
                  else if (scriptId === script.id) navigate('/scripts', { replace: true });
                }}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export default function ScriptsDatabase() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { scriptId } = useParams();
  const internalNavRef = useRef(false);

  const isObjectionsRoute = location.pathname.startsWith('/objections');
  const [activeTab, setActiveTabState] = useState<string>(isObjectionsRoute ? "objections" : "scripts");

  // Keep tab in sync with route
  useEffect(() => {
    const shouldBeObjections = location.pathname.startsWith('/objections');
    setActiveTabState(shouldBeObjections ? "objections" : "scripts");
  }, [location.pathname]);

  // Navigate when tab changes
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    if (tab === "objections") {
      navigate('/objections', { replace: true });
    } else {
      navigate('/scripts', { replace: true });
    }
  };

  const getInitialValue = (paramKey: string, storageKey: string, defaultVal: string) => {
    const fromUrl = searchParams.get(paramKey);
    if (fromUrl) return fromUrl;
    try {
      const stored = localStorage.getItem(`scripts_filter_${storageKey}`);
      if (stored) return stored;
    } catch {}
    return defaultVal;
  };
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  // Restore filters from URL params first, then localStorage, then default
  const getInitialFilter = (paramKey: string, storageKey: string) => {
    const fromUrl = searchParams.get(paramKey);
    if (fromUrl) return fromUrl;
    try {
      const stored = localStorage.getItem(`scripts_filter_${storageKey}`);
      if (stored) return stored;
    } catch {}
    return "all";
  };
  const [activeCategory, setActiveCategory] = useState<string>(getInitialFilter("category", "category"));
  const [activeAudience, setActiveAudience] = useState<string>(getInitialFilter("audience", "audience"));
  const [activeRole, setActiveRole] = useState<string>(getInitialFilter("role", "role"));
  const [activeTag, setActiveTag] = useState<string>(getInitialFilter("tag", "tag"));
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);
  const [showMobileExtraFilters, setShowMobileExtraFilters] = useState(false);

  // Ref so navigateToScriptInternal can access scripts without declaration order issues
  const dbScriptsRef = useRef<typeof dbScripts>([]);

  // Helper for in-page card toggle navigation (preserves filters including query params)
  const navigateToScriptInternal = useCallback((id: string) => {
    internalNavRef.current = true;
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (activeAudience !== "all") params.set("audience", activeAudience);
    if (activeRole !== "all") params.set("role", activeRole);
    if (activeTag !== "all") params.set("tag", activeTag);
    if (searchQuery) params.set("q", searchQuery);
    const qs = params.toString();
    const slug = toScriptSlug(dbScriptsRef.current.find(s => s.id === id)?.stage || id, id);
    navigate(`/scripts/${slug}${qs ? `?${qs}` : ''}`, { replace: true });
  }, [navigate, activeCategory, activeAudience, activeRole, activeTag, searchQuery]);

  // Persist filters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('scripts_filter_tab', activeTab);
      localStorage.setItem('scripts_filter_category', activeCategory);
      localStorage.setItem('scripts_filter_audience', activeAudience);
      localStorage.setItem('scripts_filter_role', activeRole);
      localStorage.setItem('scripts_filter_tag', activeTag);
    } catch {}
  }, [activeTab, activeCategory, activeAudience, activeRole, activeTag]);

  // Sync filter state to URL search params — preserve ?v= param if present
  useEffect(() => {
    setSearchParams(prev => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (activeCategory !== "all") params.set("category", activeCategory);
      if (activeAudience !== "all") params.set("audience", activeAudience);
      if (activeRole !== "all") params.set("role", activeRole);
      if (activeTag !== "all") params.set("tag", activeTag);
      // preserve the version param if it was in the URL
      const v = prev.get("v");
      if (v) params.set("v", v);
      return params;
    }, { replace: true });
  }, [searchQuery, activeCategory, activeAudience, activeRole, activeTag, setSearchParams]);

  // When navigating to a specific script via URL (external), apply URL params if present, else reset
  // Skip reset for in-page card toggles (internal navigation)
  useEffect(() => {
    if (scriptId) {
      if (internalNavRef.current) {
        internalNavRef.current = false;
        return;
      }
      // Read filters from URL params — if present, apply them; otherwise reset to "all"
      const urlCategory = searchParams.get("category");
      const urlAudience = searchParams.get("audience");
      const urlRole = searchParams.get("role");
      const urlTag = searchParams.get("tag");
      const urlQ = searchParams.get("q");
      setActiveCategory(urlCategory || "all");
      setActiveAudience(urlAudience || "all");
      setActiveRole(urlRole || "all");
      setActiveTag(urlTag || "all");
      setShowFavouritesOnly(false);
      setSearchQuery(urlQ || "");
      setSearchInput(urlQ || "");
    }
  }, [scriptId]);
  
  const { scripts: dbScripts, loading, refetch } = useScripts();
  const { createScript, updateScript, deleteScript, isAdmin } = useScriptsMutations();
  const { user } = useSimplifiedAuth();

  // Resolve slug-based scriptId (e.g. "warm-market-intro-8f42b1c3") → real UUID
  const scriptsForSlug = dbScripts.length > 0 ? dbScripts : [];
  // Keep ref in sync so navigateToScriptInternal (declared above) can use latest scripts
  dbScriptsRef.current = dbScripts;
  const resolvedScriptId = useMemo(
    () => scriptId ? (resolveScriptSlug(scriptId, scriptsForSlug) ?? scriptId) : undefined,
    [scriptId, scriptsForSlug]
  );

  // Auto-scroll to a newly created or deep-linked script once it renders
  useEffect(() => {
    if (!resolvedScriptId || loading) return;
    const el = document.getElementById(`script-${resolvedScriptId}`);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [resolvedScriptId, loading]);

  // Playbook integration
  const { myPlaybooks, createPlaybook } = usePlaybooks();
  const { favouriteIds, toggleFavourite } = useScriptFavourites();
  const handleAddToPlaybook = useCallback(async (playbookId: string, scriptId: string) => {
    const maxOrder = 999;
    const { error } = await supabase
      .from('script_playbook_items')
      .insert({ playbook_id: playbookId, script_id: scriptId, sort_order: maxOrder, item_type: 'script' } as any);
    if (error) {
      if (error.code === '23505') {
        toast.error('Script already in this playbook');
      } else {
        toast.error('Failed to add script');
      }
    } else {
      toast.success('Script added to playbook');
    }
  }, []);

  const handleCreatePlaybookAndAdd = useCallback(async (title: string, scriptId: string) => {
    createPlaybook.mutate({ title }, {
      onSuccess: async (data: any) => {
        if (data?.id) {
          const { error } = await supabase
            .from('script_playbook_items')
            .insert({ playbook_id: data.id, script_id: scriptId, sort_order: 0, item_type: 'script' } as any);
          if (error) {
            toast.error('Playbook created but failed to add script');
          } else {
            toast.success(`Created "${title}" and added script`);
          }
        }
      }
    });
  }, [createPlaybook]);
  
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<ScriptEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ScriptEntry | null>(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<string | null>(null);
  const [deletedCategories, setDeletedCategories] = useState<Set<string>>(new Set());

  // Auto-seed DB when empty
  const [seeding, setSeeding] = useState(false);
  useEffect(() => {
    if (!loading && dbScripts.length === 0 && !seeding) {
      setSeeding(true);
      const seedScripts = async () => {
        try {
          const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/seed-scripts`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ scripts: FALLBACK_SCRIPTS }),
          });
          const result = await resp.json();
          if (result.count > 0) {
            toast.success(`Seeded ${result.count} scripts to database`);
            refetch();
          }
        } catch (e) {
          console.error("Failed to seed scripts:", e);
        } finally {
          setSeeding(false);
        }
      };
      seedScripts();
    }
  }, [loading, dbScripts.length, seeding, refetch]);

  // Use DB scripts if available, otherwise fallback
  const scriptsData = dbScripts.length > 0 ? dbScripts : FALLBACK_SCRIPTS;

  // Strict substring match: only matches if query words appear as substrings
  const strictMatch = useCallback((target: string, query: string): { match: boolean; score: number } => {
    const t = target.toLowerCase();
    const q = query.toLowerCase();
    if (t.includes(q)) return { match: true, score: 2 };
    // Multi-word: all words must appear
    const words = q.split(/\s+/).filter(w => w.length > 0);
    if (words.length > 1 && words.every(w => t.includes(w))) {
      return { match: true, score: 1.5 };
    }
    return { match: false, score: 0 };
  }, []);

  const strictIncludes = useCallback((target: string, query: string): boolean => {
    return strictMatch(target, query).match;
  }, [strictMatch]);

  const filteredScripts = useMemo(() => {
    // Exclude servicing scripts from the main Scripts tab (they have their own tab)
    let result = scriptsData.filter((s) => s.category !== "servicing");
    if (activeCategory !== "all") {
      result = result.filter((s) => s.category === activeCategory);
    }
    if (activeAudience !== "all") {
      result = result.filter((s) => s.target_audience === activeAudience);
    }
    if (activeRole !== "all") {
      result = result.filter((s) => (s.script_role || "consultant") === activeRole);
    }
    if (activeTag !== "all") {
      result = result.filter((s) => (s.tags || []).includes(activeTag));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => {
        if (strictIncludes(s.stage, q)) return true;
        if (s.versions.some((v) => strictIncludes(v.content, q) || strictIncludes(v.author, q))) return true;
        if ((s.tags || []).some((t: string) => strictIncludes(t, q))) return true;
        const catLabel = getCategoryInfo(s.category).label;
        if (strictIncludes(s.category, q) || strictIncludes(catLabel, q)) return true;
        const audLabel = audienceLabels[s.target_audience || ""] || s.target_audience || "";
        if (strictIncludes(audLabel, q)) return true;
        const rlLabel = roleLabels[s.script_role || "consultant"] || s.script_role || "";
        if (strictIncludes(rlLabel, q)) return true;
        return false;
      });
    }
    if (showFavouritesOnly) {
      result = result.filter((s) => favouriteIds.has(s.id));
    }
    return result;
  }, [searchQuery, activeCategory, activeAudience, activeRole, activeTag, showFavouritesOnly, favouriteIds, scriptsData, strictIncludes]);

  // Script search suggestions
  const suggestions = useMemo(() => {
    if (!searchInput.trim() || searchInput.length < 2) return [];
    const q = searchInput.toLowerCase();
    const titleMatches = scriptsData
      .map(s => ({ s, fm: strictMatch(s.stage, q) }))
      .filter(({ fm }) => fm.match)
      .sort((a, b) => b.fm.score - a.fm.score)
      .map(({ s }) => ({ type: "script" as const, label: s.stage, id: s.id }));
    const categoryMatches = Object.entries(categoryLabels)
      .filter(([, val]) => strictIncludes(val.label, q))
      .map(([key, val]) => ({ type: "category" as const, label: val.label, id: key }));
    const audienceMatches = Object.entries(audienceLabels)
      .filter(([, val]) => strictIncludes(val, q))
      .map(([key, val]) => ({ type: "audience" as const, label: val, id: key }));
    const roleMatches = Object.entries(roleLabels)
      .filter(([, val]) => strictIncludes(val, q))
      .map(([key, val]) => ({ type: "role" as const, label: val, id: key }));
    const authorMatches = scriptsData
      .flatMap(s => s.versions.map(v => ({ author: v.author, scriptId: s.id, scriptTitle: s.stage })))
      .filter(v => strictIncludes(v.author, q))
      .slice(0, 3)
      .map(v => ({ type: "version" as const, label: v.author, id: v.scriptId }));
    const tagMatches = Array.from(new Set(scriptsData.flatMap(s => s.tags || [])))
      .filter(t => strictIncludes(t, q))
      .slice(0, 3)
      .map(t => ({ type: "script" as const, label: `🏷️ ${t}`, id: t }));
    return [...categoryMatches, ...audienceMatches, ...roleMatches, ...tagMatches, ...titleMatches.slice(0, 5), ...authorMatches].slice(0, 8);
  }, [searchInput, scriptsData, strictMatch, strictIncludes]);

  const handleSearchSelect = useCallback((suggestion: typeof suggestions[0]) => {
    if (suggestion.type === "category") {
      setActiveCategory(suggestion.id);
      setSearchInput("");
      setSearchQuery("");
    } else if (suggestion.type === "audience") {
      setActiveAudience(suggestion.id);
      setSearchInput("");
      setSearchQuery("");
    } else if (suggestion.type === "role") {
      setActiveRole(suggestion.id);
      setSearchInput("");
      setSearchQuery("");
    } else {
      // Reset all filters so the target script is guaranteed to be visible
      setActiveCategory("all");
      setActiveAudience("all");
      setActiveRole("all");
      setActiveTag("all");
      setShowFavouritesOnly(false);
      setSearchInput("");
      setSearchQuery("");
      const slug = toScriptSlug(dbScripts.find(s => s.id === suggestion.id)?.stage || suggestion.label?.replace(/^🏷️\s*/, '') || suggestion.id, suggestion.id);
      navigate(`/scripts/${slug}`, { replace: true });
      // If already on this script's URL, force scroll into view
      setTimeout(() => {
        const el = document.getElementById(`script-${suggestion.id}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          // Find and open the collapsible by clicking the trigger if not already open
          const trigger = el.querySelector('[data-state="closed"]');
          if (trigger instanceof HTMLElement) trigger.click();
        }
      }, 200);
    }
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
  }, [navigate]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestion(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
        handleSearchSelect(suggestions[selectedSuggestion]);
      } else {
        setSearchQuery(searchInput);
        setShowSuggestions(false);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }, [suggestions, selectedSuggestion, searchInput, handleSearchSelect]);

  // Helper: apply all filters EXCEPT a given dimension
  const filterExcluding = useCallback((exclude: 'category' | 'audience' | 'role' | 'tag') => {
    // Always exclude servicing scripts — they live on their own page
    let result = scriptsData.filter((s) => s.category !== "servicing");
    if (exclude !== 'category' && activeCategory !== "all") {
      result = result.filter((s) => s.category === activeCategory);
    }
    if (exclude !== 'audience' && activeAudience !== "all") {
      result = result.filter((s) => s.target_audience === activeAudience);
    }
    if (exclude !== 'role' && activeRole !== "all") {
      result = result.filter((s) => (s.script_role || "consultant") === activeRole);
    }
    if (exclude !== 'tag' && activeTag !== "all") {
      result = result.filter((s) => (s.tags || []).includes(activeTag));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          strictIncludes(s.stage, q) ||
          s.versions.some((v) => strictIncludes(v.content, q) || strictIncludes(v.author, q))
      );
    }
    return result;
  }, [scriptsData, activeCategory, activeAudience, activeRole, activeTag, searchQuery, strictIncludes]);

  const counts = useMemo(() => {
    const base = filterExcluding('category');
    const c: Record<string, number> = { all: base.length };
    Object.keys(categoryLabels).forEach((key) => {
      c[key] = base.filter((s) => s.category === key).length;
    });
    return c;
  }, [filterExcluding]);

  const audienceCounts = useMemo(() => {
    const base = filterExcluding('audience');
    const c: Record<string, number> = { all: base.length };
    Object.keys(audienceLabels).forEach((key) => {
      c[key] = base.filter((s) => s.target_audience === key).length;
    });
    return c;
  }, [filterExcluding]);

  const roleCounts = useMemo(() => {
    const base = filterExcluding('role');
    const c: Record<string, number> = { all: base.length };
    Object.keys(roleLabels).forEach((key) => {
      c[key] = base.filter((s) => (s.script_role || 'consultant') === key).length;
    });
    return c;
  }, [filterExcluding]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    scriptsData.forEach(s => (s.tags || []).forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [scriptsData]);

  const tagCounts = useMemo(() => {
    const base = filterExcluding('tag');
    const c: Record<string, number> = {};
    allTags.forEach(tag => {
      c[tag] = base.filter(s => (s.tags || []).includes(tag)).length;
    });
    return c;
  }, [filterExcluding, allTags]);

  const activeCategoriesWithData = useMemo(() => 
    (Object.keys(categoryLabels) as CategoryKey[]).filter(key => counts[key] > 0),
    [counts]
  );

  const handleMergeUndo = useCallback(async (targetId: string, previousVersions: ScriptVersion[], targetName: string) => {
    toast.success(`Merged into "${targetName}"`, {
      description: "Versions were appended successfully.",
      duration: 8000,
      action: {
        label: "Undo",
        onClick: async () => {
          await updateScript(targetId, { versions: previousVersions });
          refetch();
          toast.success("Merge undone");
        },
      },
    });
  }, [updateScript, refetch]);

  const { mergeState, pendingMerge, startDrag, endDrag, onDragOver, onDragLeave, onDrop, tapSelect, tapTarget, cancelTapSelect, confirmMerge, cancelMerge } = useMergeScripts(
    dbScripts,
    async (scriptId, versions) => { await updateScript(scriptId, { versions }); refetch(); },
    handleMergeUndo,
  );

  const handleInlineSave = useCallback(async (scriptId: string, versions: ScriptVersion[]) => {
    // Save a snapshot of the current versions before updating
    const currentScript = dbScripts.find(s => s.id === scriptId);
    if (currentScript && user) {
      try {
        await supabase
          .from('script_version_history' as any)
          .insert({
            script_id: scriptId,
            versions: JSON.parse(JSON.stringify(currentScript.versions)),
            edited_by: user.id,
            editor_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Unknown',
          } as any);
      } catch (e) {
        console.error('Failed to save version history:', e);
      }
    }
    await updateScript(scriptId, { versions });
    refetch();
  }, [updateScript, refetch, dbScripts, user]);

  const handleMetadataSave = useCallback(async (scriptId: string, updates: Partial<ScriptEntry>) => {
    await updateScript(scriptId, updates);
    refetch();
  }, [updateScript, refetch]);

  const handleSave = async (data: { stage: string; category: string; target_audience: string; script_role: string; tags: string[]; versions: ScriptVersion[]; sort_order: number; related_script_id?: string | null }) => {
    if (editingScript) {
      await updateScript(editingScript.id, data);
      refetch();
    } else {
      const created = await createScript(data);
      await refetch();
      if (created?.id) {
        // Navigate to the new script with its category baked into the URL so
        // the filter useEffect reads it and keeps the category selected.
        const targetCategory = data.category || "all";
        const params = new URLSearchParams();
        if (targetCategory !== "all") params.set("category", targetCategory);
        const qs = params.toString();
        const slug = toScriptSlug(data.stage || created.id, created.id);
        navigate(`/scripts/${slug}${qs ? `?${qs}` : ''}`, { replace: true });
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteScript(deleteTarget.id);
    setDeleteTarget(null);
    refetch();
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryTarget) return;
    const slug = deleteCategoryTarget;
    // Reassign all scripts in this category to "uncategorized"
    const { error } = await supabase
      .from('scripts')
      .update({ category: 'uncategorized' } as any)
      .eq('category', slug);
    if (error) {
      toast.error('Failed to delete category');
    } else {
      setDeletedCategories(prev => new Set([...prev, slug]));
      if (activeCategory === slug) setActiveCategory('all');
      toast.success(`Category "${getCategoryInfo(slug).label}" deleted — scripts moved to Uncategorized`);
      refetch();
    }
    setDeleteCategoryTarget(null);
  };

  // All visible categories: built-in + any from DB that aren't deleted
  const allCategoriesWithData = useMemo(() => {
    const dbCats = new Set(dbScripts.map(s => s.category).filter(Boolean));
    const combined = new Set([...Object.keys(categoryLabels), ...dbCats]);
    return Array.from(combined).filter(k => !deletedCategories.has(k) && counts[k] > 0);
  }, [dbScripts, deletedCategories, counts]);

  return (
    <PageLayout
      title="Scripts Database - FINternship"
      description="Reference scripts for cold calling, follow-up messages, referrals, appointment confirmations, and handling common objections."
    >
      <BrandedPageHeader
        title="📝 Scripts & Objections"
        subtitle="Reference scripts, objection handling, and team knowledge base"
        showBackButton
        onBack={() => navigate("/")}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Scripts & Objections" }]}
        className="hidden sm:block"
      />

      <div className="mx-auto px-3 md:px-6 py-3 md:py-8 max-w-4xl">
        <div className="hidden md:block"><ScriptsTabBar /></div>

        {activeTab === "objections" ? (
          <ObjectionHandlingDatabase />
        ) : (
        <>
        {/* Search + Add button */}
        <div className="mb-4 sm:mb-6 flex gap-2 sm:gap-3 items-start">
          <div className="flex-1 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search scripts..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                  setSelectedSuggestion(-1);
                }}
                onFocus={() => setShowSuggestions(searchInput.length >= 2)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={handleSearchKeyDown}
                className="pl-10 pr-10 h-10 text-sm border-2 focus:border-primary transition-colors"
              />
              {searchInput && (
                <button
                  onClick={() => { setSearchInput(""); setSearchQuery(""); setShowSuggestions(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={`${s.type}-${s.id}-${i}`}
                    onMouseDown={() => handleSearchSelect(s)}
                    className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                      i === selectedSuggestion ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <Badge variant="outline" className="text-[10px] shrink-0 font-normal">
                      {s.type === "category" ? "Category" : s.type === "audience" ? "Audience" : s.type === "role" ? "Role" : s.type === "version" ? "Version" : "Script"}
                    </Badge>
                    <span className="truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3 shrink-0 gap-1.5 text-xs hidden sm:flex"
            title="Copy link to current view"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied to clipboard");
            }}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 sm:hidden"
            title="Copy link to current view"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied to clipboard");
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button onClick={() => { setEditingScript(null); setEditorOpen(true); }} size="sm" className="gap-1.5 shrink-0 h-10">
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add Script</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
          {/* Clear all button */}
          {(activeCategory !== "all" || activeAudience !== "all" || activeRole !== "all" || activeTag !== "all") && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] text-muted-foreground" onClick={() => { setActiveCategory("all"); setActiveAudience("all"); setActiveRole("all"); setActiveTag("all"); setShowFavouritesOnly(false); }}>
                <X className="h-3 w-3 mr-0.5" /> Clear all filters
              </Button>
            </div>
          )}

          {isMobile ? (
            /* ===== MOBILE: Category + Audience always visible; Role + Tag behind toggle ===== */
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {/* Category dropdown */}
                <div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">
                    <Filter className="h-3 w-3 inline mr-1" />Category
                  </span>
                  <Select value={activeCategory} onValueChange={setActiveCategory}>
                    <SelectTrigger className="h-9 text-xs bg-background">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="all">All ({counts.all})</SelectItem>
                      {allCategoriesWithData.map((key) => (
                        <div key={key} className="flex items-center">
                          <SelectItem value={key} className="flex-1">
                            {getCategoryInfo(key).label} ({counts[key] ?? 0})
                          </SelectItem>
                          {isAdmin && (
                            <button
                              type="button"
                              className="pr-2 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                              onClick={(e) => { e.stopPropagation(); setDeleteCategoryTarget(key); }}
                              title={`Delete category "${getCategoryInfo(key).label}"`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Audience dropdown */}
                <div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Audience</span>
                  <Select value={activeAudience} onValueChange={setActiveAudience}>
                    <SelectTrigger className="h-9 text-xs bg-background">
                      <SelectValue placeholder="All audiences" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="all">All</SelectItem>
                      {Object.entries(audienceLabels).filter(([key]) =>
                        scriptsData.some(s => s.target_audience === key)
                      ).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label} ({audienceCounts[key]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* More filters toggle */}
              <button
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowMobileExtraFilters(v => !v)}
              >
                <Filter className="h-3 w-3" />
                {showMobileExtraFilters ? "Hide" : "More"} filters
                {(activeRole !== "all" || activeTag !== "all") && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full text-[9px] px-1.5 py-0.5 font-medium">
                    {(activeRole !== "all" ? 1 : 0) + (activeTag !== "all" ? 1 : 0)}
                  </span>
                )}
              </button>

              {showMobileExtraFilters && (
                <div className="grid grid-cols-2 gap-2">
                  {/* Role dropdown */}
                  <div>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Role</span>
                    <Select value={activeRole} onValueChange={setActiveRole}>
                      <SelectTrigger className="h-9 text-xs bg-background">
                        <SelectValue placeholder="All roles" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="all">All</SelectItem>
                        {Object.entries(roleLabels).filter(([key]) =>
                          scriptsData.some(s => (s.script_role || 'consultant') === key)
                        ).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label} ({roleCounts[key]})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tags dropdown */}
                  {allTags.length > 0 && (
                    <div>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Tag</span>
                      <Select value={activeTag} onValueChange={setActiveTag}>
                        <SelectTrigger className="h-9 text-xs bg-background">
                          <SelectValue placeholder="All tags" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover z-50 max-h-60">
                          <SelectItem value="all">All</SelectItem>
                          {allTags.map((tag) => (
                            <SelectItem key={tag} value={tag}>
                              {tag} ({tagCounts[tag]})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ===== DESKTOP: Compact dropdown filters (same pattern as mobile) ===== */
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              {/* Category dropdown */}
              <div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Category</span>
                <Select value={activeCategory} onValueChange={setActiveCategory}>
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">All ({counts.all})</SelectItem>
                    {allCategoriesWithData.map((key) => (
                      <div key={key} className="flex items-center">
                        <SelectItem value={key} className="flex-1">
                          {getCategoryInfo(key).label} ({counts[key] ?? 0})
                        </SelectItem>
                        {isAdmin && (
                          <button
                            type="button"
                            className="pr-2 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                            onClick={(e) => { e.stopPropagation(); setDeleteCategoryTarget(key); }}
                            title={`Delete category "${getCategoryInfo(key).label}"`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Audience dropdown */}
              <div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Audience</span>
                <Select value={activeAudience} onValueChange={setActiveAudience}>
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder="All audiences" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">All</SelectItem>
                    {Object.entries(audienceLabels).filter(([key]) =>
                      scriptsData.some(s => s.target_audience === key)
                    ).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label} ({audienceCounts[key]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Role dropdown */}
              <div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Role</span>
                <Select value={activeRole} onValueChange={setActiveRole}>
                  <SelectTrigger className="h-9 text-xs bg-background">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">All</SelectItem>
                    {Object.entries(roleLabels).filter(([key]) =>
                      scriptsData.some(s => (s.script_role || 'consultant') === key)
                    ).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label} ({roleCounts[key]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags dropdown */}
              {allTags.length > 0 && (
                <div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Tag</span>
                  <Select value={activeTag} onValueChange={setActiveTag}>
                    <SelectTrigger className="h-9 text-xs bg-background">
                      <SelectValue placeholder="All tags" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50 max-h-60">
                      <SelectItem value="all">All</SelectItem>
                      {allTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag} ({tagCounts[tag]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active filter breadcrumbs */}
        {(activeCategory !== "all" || activeAudience !== "all" || activeRole !== "all" || activeTag !== "all" || searchQuery || showFavouritesOnly) && (
          <div className="mb-3 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-muted-foreground mr-0.5">Filters:</span>
            {showFavouritesOnly && (
              <Badge variant="secondary" className="text-[10px] gap-1 pl-2 pr-1 py-0.5 h-5">
                ❤️ Favourites
                <button onClick={() => setShowFavouritesOnly(false)} className="ml-0.5 hover:text-foreground"><X className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="text-[10px] gap-1 pl-2 pr-1 py-0.5 h-5">
                Search: "{searchQuery}"
                <button onClick={() => { setSearchInput(""); setSearchQuery(""); }} className="ml-0.5 hover:text-foreground"><X className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
            {activeCategory !== "all" && (
              <Badge variant="secondary" className="text-[10px] gap-1 pl-2 pr-1 py-0.5 h-5">
                {getCategoryInfo(activeCategory).label}
                <button onClick={() => setActiveCategory("all")} className="ml-0.5 hover:text-foreground"><X className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
            {activeAudience !== "all" && (
              <Badge variant="secondary" className="text-[10px] gap-1 pl-2 pr-1 py-0.5 h-5">
                {audienceLabels[activeAudience] || activeAudience}
                <button onClick={() => setActiveAudience("all")} className="ml-0.5 hover:text-foreground"><X className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
            {activeRole !== "all" && (
              <Badge variant="secondary" className="text-[10px] gap-1 pl-2 pr-1 py-0.5 h-5">
                {roleLabels[activeRole] || activeRole}
                <button onClick={() => setActiveRole("all")} className="ml-0.5 hover:text-foreground"><X className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
            {activeTag !== "all" && (
              <Badge variant="secondary" className="text-[10px] gap-1 pl-2 pr-1 py-0.5 h-5">
                #{activeTag}
                <button onClick={() => setActiveTag("all")} className="ml-0.5 hover:text-foreground"><X className="h-2.5 w-2.5" /></button>
              </Badge>
            )}
            <button
              onClick={() => { setActiveCategory("all"); setActiveAudience("all"); setActiveRole("all"); setActiveTag("all"); setSearchInput(""); setSearchQuery(""); setShowFavouritesOnly(false); }}
              className="text-[10px] text-muted-foreground hover:text-foreground underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Results count + audience flow indicator */}
        <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">
              {filteredScripts.length} script{filteredScripts.length !== 1 ? "s" : ""} found
            </div>
            {user && (
              <Button
                variant={showFavouritesOnly ? "default" : "outline"}
                size="sm"
                className="h-6 px-2 text-[11px] gap-1"
                onClick={() => setShowFavouritesOnly(prev => !prev)}
              >
                <Heart className={`h-3 w-3 ${showFavouritesOnly ? "fill-current" : ""}`} />
                Favourites{showFavouritesOnly ? ` (${filteredScripts.length})` : ""}
              </Button>
            )}
          </div>
          
          {/* Audience flow indicator — shown when viewing a single category */}
          {activeCategory !== "all" && (
            <div className="flex items-center gap-1 flex-wrap">
              {(["nsf", "young-adult", "working-adult", "pre-retiree", "parent", "recruitment", "general"] as const)
                .filter(aud => filteredScripts.some(s => s.target_audience === aud))
                .map((aud, idx, arr) => {
                  const count = filteredScripts.filter(s => s.target_audience === aud).length;
                  return (
                    <span key={aud} className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveAudience(aud)}
                        className={`text-[10px] px-1.5 py-0.5 rounded-full border transition-colors ${
                          activeAudience === aud
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                        }`}
                      >
                        {audienceLabels[aud] || aud} <span className="opacity-70">({count})</span>
                      </button>
                      {idx < arr.length - 1 && <span className="text-muted-foreground/40 text-[10px]">→</span>}
                    </span>
                  );
                })}
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Onboarding prompt — shown when no filters are selected and no search */}
        {!loading && activeCategory === "all" && activeAudience === "all" && !searchQuery && !showFavouritesOnly && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 mb-2">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-2xl">🎯</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground mb-0.5">Start by choosing your target audience</p>
                <p className="text-xs text-muted-foreground mb-3">Pick a category or audience below to find the right scripts faster. You're currently seeing all {filteredScripts.length} scripts.</p>
                <div className="flex flex-wrap gap-2">
                  {(["nsf", "young-adult", "working-adult", "pre-retiree", "parent", "warm-market", "cold-lead"] as const)
                    .filter(aud => filteredScripts.some(s => s.target_audience === aud))
                    .map(aud => (
                      <button
                        key={aud}
                        onClick={() => setActiveAudience(aud)}
                        className="text-xs px-3 py-1.5 rounded-full border border-primary/30 bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors font-medium"
                      >
                        {audienceLabels[aud] ?? aud}
                      </button>
                    ))}
                  <button
                    onClick={() => setActiveCategory("cold-calling")}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-accent transition-colors font-medium text-muted-foreground"
                  >
                    📞 Cold Calling
                  </button>
                  <button
                    onClick={() => setActiveCategory("follow-up")}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-accent transition-colors font-medium text-muted-foreground"
                  >
                    💬 Follow-Ups
                  </button>
                  <button
                    onClick={() => setActiveCategory("initial-text")}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-background hover:bg-accent transition-colors font-medium text-muted-foreground"
                  >
                    💬 Initial Texts
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scripts list */}
        {!loading && (
          <div className="space-y-3">
            {filteredScripts.length > 0 ? (
              (() => {
                // If viewing Follow-Up category specifically (no other category filter mixing things), show sub-grouped view
                const isFollowUpView = activeCategory === "follow-up" || (activeCategory === "all" && filteredScripts.every(s => s.category === "follow-up"));
                const hasFollowUpScripts = filteredScripts.some(s => s.category === "follow-up");
                const showSubGroups = (activeCategory === "follow-up") && !searchQuery && activeAudience === "all" && activeRole === "all" && activeTag === "all";

                if (showSubGroups) {
                  // Group follow-up scripts by their stage_type tag
                  const subTypeOrder = ["initial-text", "post-call", "callback", "reminder-sequence", "closing", "post-meeting", "other"];
                  const grouped: Record<string, ScriptEntry[]> = {};
                  filteredScripts.forEach(script => {
                    const tags = script.tags || [];
                    const subType = subTypeOrder.find(st => tags.includes(st)) || "other";
                    if (!grouped[subType]) grouped[subType] = [];
                    grouped[subType].push(script);
                  });

                  return (
                    <div className="space-y-4">
                      {subTypeOrder.filter(st => grouped[st]?.length > 0).map(subType => {
                        const config = followUpSubTypeLabels[subType];
                        return (
                          <FollowUpSubGroup
                            key={subType}
                            subType={subType}
                            config={config}
                            scripts={grouped[subType]}
                            isAdmin={isAdmin}
                            scriptId={resolvedScriptId}
                            searchQuery={searchQuery}
                            myPlaybooks={myPlaybooks}
                            handleAddToPlaybook={handleAddToPlaybook}
                            handleCreatePlaybookAndAdd={handleCreatePlaybookAndAdd}
                            user={user}
                            favouriteIds={favouriteIds}
                            toggleFavourite={toggleFavourite}
                            isMobile={isMobile}
                            setEditingScript={setEditingScript}
                            setEditorOpen={setEditorOpen}
                            setDeleteTarget={setDeleteTarget}
                            navigate={navigate}
                            onScriptNavigate={navigateToScriptInternal}
                            allScripts={dbScripts}
                            onInlineSave={handleInlineSave}
                            onMetadataSave={handleMetadataSave}
                          />
                        );
                      })}
                    </div>
                  );
                }

                return (
                  <>
                    {/* Tap-to-merge banner (mobile) */}
                    {mergeState.tapSelectMode && mergeState.sourceId && (
                      <div className="flex items-center justify-between gap-2 bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 text-sm">
                        <span className="text-primary font-medium">
                          Tap another script to merge into it
                        </span>
                        <button onClick={cancelTapSelect} className="text-muted-foreground hover:text-foreground text-xs underline">
                          Cancel
                        </button>
                      </div>
                    )}
                      {filteredScripts.map((script) => (
                       <div key={script.id} id={`script-${script.id}`}>
                       <ScriptCard
                         script={script}
                         isAdmin={isAdmin}
                         isOpenByUrl={resolvedScriptId === script.id}
                        searchQuery={searchQuery}
                        myPlaybooks={myPlaybooks}
                        onAddToPlaybook={handleAddToPlaybook}
                        onCreatePlaybookAndAdd={handleCreatePlaybookAndAdd}
                        isAuthenticated={!!user}
                        userDisplayName={user?.user_metadata?.display_name || user?.email?.split('@')[0] || ''}
                        isFavourite={favouriteIds.has(script.id)}
                        onToggleFavourite={() => toggleFavourite.mutate(script.id)}
                        isMobile={isMobile}
                        allScripts={dbScripts}
                        onEdit={() => { setEditingScript(script); setEditorOpen(true); }}
                        onDelete={() => setDeleteTarget(script)}
                        onInlineSave={handleInlineSave}
                        onMetadataSave={handleMetadataSave}
                        mergeSourceId={mergeState.sourceId}
                        mergeOverId={mergeState.dragOverId}
                        tapSelectMode={mergeState.tapSelectMode}
                        onMergeDragStart={startDrag}
                        onMergeDragEnd={endDrag}
                        onMergeOver={onDragOver}
                        onMergeLeave={onDragLeave}
                        onMergeDrop={onDrop}
                        onTapSelect={tapSelect}
                        onTapTarget={tapTarget}
                        onToggle={(open) => {
                          if (open) {
                            navigateToScriptInternal(script.id);
                          } else if (resolvedScriptId === script.id) {
                            navigate('/scripts', { replace: true });
                          }
                        }}
                       />
                       </div>
                     ))}
                  </>
                );
              })()
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
      </>
        )}
      </div>

      {/* Editor Dialog */}
      <ScriptEditorDialog
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setEditingScript(null); }}
        onSave={handleSave}
        script={editingScript}
      />

      {/* Merge confirmation dialog */}
      <AlertDialog open={!!pendingMerge} onOpenChange={(open) => !open && cancelMerge()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <GitMerge className="h-5 w-5 text-primary" />
              Merge versions?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-1">
              <span className="block">Add all versions from <strong>"{pendingMerge?.source.stage}"</strong> into <strong>"{pendingMerge?.target.stage}"</strong>?</span>
              <span className="block text-xs text-muted-foreground">
                {pendingMerge?.source.versions.length} version{pendingMerge?.source.versions.length !== 1 ? "s" : ""} will be appended. The source script will remain unchanged.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmMerge} className="gap-1.5">
              <GitMerge className="h-4 w-4" /> Merge versions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
      <ScriptsChatWidget initialMode={activeTab === "objections" ? "objections" : "scripts"} />

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!deleteCategoryTarget} onOpenChange={(o) => !o && setDeleteCategoryTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the <strong>{deleteCategoryTarget ? getCategoryInfo(deleteCategoryTarget).label : ''}</strong> category?
              {deleteCategoryTarget && counts[deleteCategoryTarget] > 0 && (
                <span className="block mt-2 text-amber-600 dark:text-amber-400 font-medium">
                  ⚠️ {counts[deleteCategoryTarget]} script{counts[deleteCategoryTarget] !== 1 ? 's' : ''} will be moved to "Uncategorized".
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
