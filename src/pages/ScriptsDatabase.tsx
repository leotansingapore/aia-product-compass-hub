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
    ],
    sort_order: 12,
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
      { author: "MoneyBees Script", content: "Hey [name]! I think my assistant gave you a call earlier today. We are doing a financial literacy campaign for young adults and ORD personnel. You can find out more here and we will explain more about it during a quick 5min interview call. https://www.skool.com/finternship/about\n\nAnyways we are from the @moneybeesacademy! https://www.instagram.com/moneybeesacademy\n\nBased on the call we had with you earlier, you should be quite young also right? I mostly speak to young adults about financial literacy, money management, and self improvement. These are things not taught in school or commonly discussed.\n\nPeople who sign up are usually pretty motivated to learn about investing & financial literacy. Do let me know if the quick 5 minute call [INSERT DATE] as mentioned is fine with you later on!" },
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
    id: "confirmation-young-adult-zoom",
    stage: "Post-Call Text — Young Adults Agreed to Zoom",
    category: "confirmation",
    target_audience: "nsf",
    versions: [
      { author: "MoneyBees Script", content: "Hi [Name], this is [Your Name]\nThanks for taking the call just now with my assistant 😊\n\nAs spoken we're scheduled for a financial literacy zoom session.\n\n**Date:** [DATE]\n**Time:** [TIME]\n**Duration:** 30 minutes\n**Location:** Zoom\n\nHere's what you'll gain after the 30 minute zoom session:\n\n🔥 Access to hours of materials from the world's best minds in our community at https://www.skool.com/finternship/about\n\n🧠 Learn the money language schools never teach\n\n🌟 Strategies to fast-track your wealth, passively.\n\nJust reply \"Yes\" to confirm this timing and we're all set!\n\nLooking forward to chatting with you then! 👍\n\n---\n\nAs a bonus, you will also get these resources after the consultation. And you can even redeem a $20 voucher after the session!\n\n*(Attach the 3 promotional images below when sending this text)*" },
    ],
    attachments: [
      { label: "Free Ultimate Guide to Adulting", url: "/scripts/adulting-guide.png", type: "image" },
      { label: "Free Ultimate Guide to Investing", url: "/scripts/investing-guide.png", type: "image" },
      { label: "MoneyBees Crash Course Bundle", url: "/scripts/moneybees-bundle.png", type: "image" },
    ],
    sort_order: 16,
  },
  {
    id: "callback-young-adult-consultant",
    stage: "Callback Script — Consultant Follow-Up Call (Young Adults)",
    category: "follow-up",
    target_audience: "nsf",
    versions: [
      { author: "Kenny's Script", content: "Hi [Name], this is Kenny. My assistant may have reached out to you yesterday. This is just a quick 5 mins call for me to personally follow up with a few details from you to ensure this opportunity can truly be of value to you. This opportunity is specifically for individuals under the age of 25, so just to confirm, are you below 25?\n\n---\n\n**After they confirm:**\n\nThat's great! Then this financial planning course would be incredibly useful for helping you take control of your finances and plan for the future. It's great that young people like you are starting to think about how they can better optimise their finances, and this is designed to guide you through that process.\n\n---\n\n**Fact-finding / rapport building:**\n\nTo gain a better knowledge of where you are right now, may I ask when's your birthday?\n\nAlso, what milestones which are important are coming up for you? Like your ORD? Or graduation or even bigger plans for the future?\n\n---\n\n**After they share milestones:**\n\nWow! That's exciting to hear and it's a great time to start thinking about how to plan financially for these milestones.\n\nI'll send you a quick overview of what we'll be discussing via WhatsApp. Are you on WhatsApp now? Great, I've just sent it to you — can you check if you've received it?\n\nAwesome! Could you also save my number so I can share additional resources with you later? Just scroll to the top and you should see a \"Save Contact\" button. Got it? Perfect!\n\n---\n\n**Sharing the heart of the program:**\n\nOne of the reasons I wanted to reach out is that most people don't learn how to grow or invest their money while they're young. Schools often focus on helping us to study hard, find a job, but they don't teach us how to build wealth or create financial freedom for ourselves.\n\nWhat I'll be sharing with you includes things like:\n\n• How to kickstart your investing journey even with a small amount of money\n• Ways to manage and make your money grow over time\n• And how investing in yourself and financial knowledge can set you up for life\n\n\"The earlier you start, the bigger the impact — what you learn and do at 20, 25 can compound over decades. Waiting until you're older, like 40 or 50, just doesn't give you the same head start. Time is one of the most powerful multipliers, and starting early lets you take full advantage of it.\"\n\n---\n\n**Pitching the Zoom consultation:**\n\nHere's what I'd like to do: We'll have a quick Zoom call where I'll share a personalised consultation to help you understand your financial options and how you can start growing your money right now. This will be a chance to talk about things like:\n\n• What goals do you have, whether it's saving for something big or just getting started with investing\n• The different options available to you for growing your money\n• And how to set yourself up financially for the future, even if you're just starting out\n\nAt the end of the consultation, I'll also give you free access to a course that covers personal finance, productivity, and self-improvement. It's an additional resource to help you build the right habits and mindset for long-term success." },
    ],
    sort_order: 17,
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
