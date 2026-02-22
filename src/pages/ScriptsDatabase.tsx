import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "@/lib/markdown-config";
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
import { ChevronDown, Phone, MessageSquare, HelpCircle, Copy, Check, UserPlus, CalendarCheck, Lightbulb, Megaphone, Users, Plus, Pencil, Trash2, Loader2, Filter, X, Download, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useScripts, useScriptsMutations } from "@/hooks/useScripts";
import type { ScriptEntry, ScriptVersion, ScriptAttachment } from "@/hooks/useScripts";
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
  recruitment: "Recruitment",
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
    ],
    sort_order: 5.7,
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
      { author: "Golden Year Partners Script", content: "Hello (Lead Name)!\n\nCalled you earlier\n\nJust a brief overview of what we can go through:\n\n1) Ways to increase passive income during retirement\n\n2) Ways to reduce unnecessary expenses during retirement\n\n3) How to potentially optimise your CPF and existing resources\n\nWhich of these 1), 2), 3) are your retirement concerns?\n\nFor more info: http://consult.goldenyearpartners.com/\n\nWorst case is that you get more info and a yakun voucher, and the best case is that we can improve your current situation!" },
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
                    <div className="bg-muted/50 rounded-lg p-4 text-sm leading-relaxed border prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{v.content}</ReactMarkdown>
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
                <div className="bg-muted/50 rounded-lg p-4 text-sm leading-relaxed border prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{script.versions[0]?.content || ""}</ReactMarkdown>
                </div>
              </>
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
