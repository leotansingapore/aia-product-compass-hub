import { useState, useMemo } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { BrandedPageHeader } from "@/components/layout/BrandedPageHeader";
import { EnhancedSearchBar } from "@/components/EnhancedSearchBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Phone, MessageSquare, HelpCircle, Copy, Check, UserPlus, CalendarCheck, Lightbulb, Megaphone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ScriptEntry {
  id: string;
  stage: string;
  category: string;
  versions: { author: string; content: string }[];
}

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

const SCRIPTS_DATA: ScriptEntry[] = [
  // ===== COLD CALLING =====
  {
    id: "cold-calling-original",
    stage: "Cold Calling — Original Script",
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
    id: "cold-calling-multi",
    stage: "Cold Calling — Multi-Version (All Consultants)",
    category: "cold-calling",
    versions: [
      {
        author: "Gabriel's Version",
        content: `Hello, is this [name]?
This is Clarisse/Gabriel from themoneybees academy.

We are currently having a financial literacy campaign and we are giving away a free adulting guidebook specially for young adults because we don't learn this kind of thing like budgeting and CPF in school.

Can I send you more details on whatsapp?

*Yes*
Alright awesome, I'll send you a text later on, and we can chat there.`,
      },
      {
        author: "Justin's Version",
        content: `Hello, is this [name]?
I'm Justin from themoneybees. (Do you have a minute to share why I called)

Moneybees is currently running a financial literacy campaign, and we will be offering a free adulting guidebook intended specifically for young adults.

Alternatively, we are also offering a free guide to investing that includes 100 tips for first-time investors.

If either or both books piqued your interest, might I send you more information via WhatsApp?

Great, I'll drop you a text later on, and we can continue to chat there.`,
      },
      {
        author: "Jamie's Revised Script",
        content: `Hi, is this xxx?
Hi, this is Jamie from TheMoneyBees Academy!

Have I caught you at a bad time? (Yes/No)

**Yes:** Ok when is a better time for me to call you back?

**No:** Great thank you! We are a financial education platform and we are currently running a financial literacy campaign where we are giving away a free adulting guidebook that covers key personal finance topics most of us never learned in school, like budgeting, investing and retirement planning.

Would you mind me sending you more details about it on WhatsApp? That way you can review everything at your convenience.

**If they ask about the consultation:**
The consultation is our way of ensuring you get maximum value from the guidebook by personalising the information to your specific situation. There are no obligations beyond the consultation.`,
      },
      {
        author: "FINternship Script",
        content: `Hi, This is Xenia from The Money Bees, I'll keep this call short less than a minute.

We just launched a financial internship, its a self study course, currently its completely free for young adults below 30 years old.

Just to check, are you below 30 years old?

Okay great, I'll be sending you more information about it over whatsapp right after this call. My consultant Leo will then give you a quick call later at XXX pm to share with you more about it, is that okay?`,
      },
    ],
  },
  {
    id: "cold-calling-rachagen",
    stage: "Cold Calling — Rachagen Leads (Return Contacts)",
    category: "cold-calling",
    versions: [
      {
        author: "Jamie's Script",
        content: `**During working hours:**

Hi, is this xxx?
Hi this is Jamie from TheMoneyBees Academy!
Have I caught you at a bad time? (Yes/No)

**No:** Great! The reason I am calling is because you previously expressed interest in one of our ads about our giveaway of our financial planning guidebook, so I just wanted to have a quick follow up with you on whether you are still keen to receive it?

So we are a financial education platform and right now as part of our ongoing financial literacy campaign, we are pairing the guidebook with a quick free consultation to make it more personalised.

Would mind me sending you more details about it on WhatsApp? That way you can review everything at your convenience.

**After working hours (6.30pm onwards):**

Hi, is this xxx?
Hi, This is Jamie from TheMoneyBees Academy!
Would it be a bad time for a 30-second chat?

**No:** Great thanks! The reason I am calling is because you previously expressed interest on a call with us sometime ago about our free adulting guidebook that covers essential topics like budgeting and investing to retirement planning.

And right now as part of our ongoing financial literacy campaign, we're pairing the guidebook with a quick free consultation to make it more personalised.

Would mind me sending you more details about it on WhatsApp?

**How did you get my number?:**
You might have done a survey with us previously a few years ago. As we're reaching out specifically to young professionals now, we're connecting with people who could benefit most from financial education.`,
      },
    ],
  },

  // ===== AD CAMPAIGN / LEAD GEN =====
  {
    id: "ad-campaign-calling",
    stage: "Ad Campaign Lead Gen — Calling Script",
    category: "ad-campaign",
    versions: [
      {
        author: "Jamie's Script",
        content: `Follow up call.

Hi xxx!
This is Jamie from themoneybees academy!
Have I caught you at a bad time? (Yes/No) / Do you have a quick moment?

**Yes (bad time):** When is a better time for me to call you back? (Get specific timing)

**No (available):**
The reason I'm calling is because you recently expressed interest in one of our ads about our giveaway of our financial planning guidebook, so I just wanted to have a quick follow up with you on whether you are still keen to receive it?

**Version 2:**
I'm calling because you recently expressed interest in our free financial planning guidebook through our Facebook ad, and I wanted to confirm if you're still interested in receiving this guidebook?

That's great! We really appreciate people like you who want to learn more about financial planning. To help kickstart your financial planning journey, we'd like to offer you a bit of a bonus. We'll not only send you the guidebook but also put together a personalised financial report just for you.

To make sure we tailor this report specifically to your needs, we'd like to schedule a brief 20-minute Zoom consultation.

Does this sound like something you'd be interested in?

**If they ask "what's the catch":**
We actually pair the guidebook with a complimentary 20-minute zoom consultation. This allows us to tailor the information to your financial situation and goals. The guidebook and report will be sent to you right after our session.`,
      },
    ],
  },
  {
    id: "ad-campaign-1st-text",
    stage: "Ad Campaign Lead Gen — 1st Text (After Call)",
    category: "ad-campaign",
    versions: [
      {
        author: "Original",
        content: `Hello XXX!
Cynthia here, from the @moneybeesacademy!
https://www.instagram.com/moneybeesacademy

I think you might have seen our Instagram Ads recently regarding our financial literacy campaign.

Are you working or studying now?

The reason I started this campaign was because I didn't come from a privileged background, and the education system didn't teach anything about personal finance.

After being a stewardess for 7 years and serving Singaporeans from all walks of life, I realised that there was a gap in financial education, especially amongst young adults.

I wanted to empower more young people with financial knowledge, hence I entered the financial services industry, and wrote this book.

I'll pass you a copy after a quick 20 minute financial consultation, here's how it looks like :)

Would this Saturday 3.30pm or this Sunday 11am work for you?`,
      },
      {
        author: "Jamie's NSF Version",
        content: `Hi xxx,
This is Jamie from TheMoneyBees Academy 🐝.

Thank you for your interest in our free adulting guidebook!

At Moneybees, we believe that financial literacy should be accessible to all. Our goal is to empower more people, particularly young adults like yourself, to take that first step and take control of their (financial) lives 💪!

_When we are young and able to work, the best time to start building a strong foundation for your financial goals and future was yesterday, the next best time is now._

As part of our campaign, we'd like to invite you to a quick 20-min Zoom session where we'll:
1. Discuss essential financial concepts of financial planning for NSFs like yourself
2. Do a quick financial health check to make sure you're on track
3. Answer any questions you have
4. Send you the book after our chat

Would sometime next Sat/Sun at 12 or 1pm work for you?

Looking forward to speaking with you and helping you embark on your financial planning journey 😊!`,
      },
    ],
  },
  {
    id: "ad-campaign-2nd-text",
    stage: "Ad Campaign Lead Gen — 2nd Follow-Up",
    category: "ad-campaign",
    versions: [
      {
        author: "Original",
        content: `Would this Sunday 9am or at 8pm be a good time?
Will just be a quick 20 minute zoom call, or a physical session will be great too!

If you prefer another day and time, please let me know too :)

Anyway, feel free to join my telegram channel, https://t.me/themoneybeesacademy
I post financial insights once in a while!`,
      },
      {
        author: "Jamie's Script",
        content: `Hi xxx, hope you had a great weekend!

Please let me know if you are keen to have a session with us, to receive our adulting guidebook!

We truly appreciate individuals like yourself who take the initiative and want to upgrade their financial knowledge. That's why we don't just want to give out free books – we want to provide real, tangible value. The zoom consultation will allow us to understand your financial situation, needs, concerns, and goals.

By the way, did you know we also have a telegram channel?
We post financial insights on the latest global financial news: http://t.me/themoneybeesacademy

Have a great day and hope to hear from you soon! 😊`,
      },
    ],
  },

  // ===== LEO CAMPAIGN =====
  {
    id: "leo-campaign-1st",
    stage: "Leo Campaign — 1st Message",
    category: "ad-campaign",
    versions: [
      {
        author: "Leo's Script",
        content: `Hello XXX!
Leo here, from the @moneybeesacademy!
https://www.instagram.com/moneybeesacademy

I think you might have seen our Instagram Ads recently regarding our financial literacy campaign for NSFs/Young Adults.

Are you in NS now, studying or working?

I didn't grow up from a privileged background, and the education system didn't really teach anything about personal finance. I wanted to empower myself and others, and hence I entered the finance industry, and wrote this book.

I'll pass you a copy after a quick 20 minute financial consultation, here's how it looks like :)

I will be sending you a customised financial report after our short 20 min zoom call, where I will touch more points about savings and investments.

We can do a physical meetup too!

Would this Sunday at 9am or at 8pm work well for you?`,
      },
      {
        author: "Jamie's Script (For Leo)",
        content: `Hello XXX :)
Leo here, from the @moneybeesacademy!
https://www.instagram.com/moneybeesacademy

I'm reaching out to you as part of our financial literacy campaign.

The reason I started this campaign was because I didn't come from a privileged background, and despite going through the education system, I feel that important life skills like personal finance were not taught enough in our schools.

After speaking to many young adults, students and NSFs, I realised there was a big gap in financial education. It's easy to be overwhelmed when you don't have a clear guide on where to begin.

I wrote this book to condense all the financial knowledge to empower as many young people as we can.

I'll pass you a copy after a quick 10-minute financial consultation over zoom :)

Would this Saturday 3pm or Sunday 3pm work for you?

And just checking, you're in NS/studying/working now?

**If working:** Many young working adults found our sessions very useful to find out where they are now, where they want to be, and how they can get there.

**If student/NSF:** Many students/NSFs found our sessions very useful...

Just so I can make our session more beneficial — could you share what motivated you to click on our ad? Then I can share more on the topic you're most curious about.`,
      },
    ],
  },

  // ===== FOLLOW-UP MESSAGES =====
  {
    id: "follow-up-1st",
    stage: "1st Follow-Up Message (After Call)",
    category: "follow-up",
    versions: [
      {
        author: "Script A",
        content: `Hello XXX!

XXXX here, from the @moneybeesacademy! https://www.instagram.com/moneybeesacademy

Spoke to you just now, about how we help young adults, including NSFs save and grow their money faster!

The reason why I'm doing this is that I have gone through the entire education system in Singapore and they actually didn't really teach anything much about personal finance.

I wanted to empower and educate more youths about investing and financial literacy!

Would sometime this *saturday 10am or 2pm* work for you? And where is your nearest MRT? Will pass you the book over a short *30 min meetup* and give you a personalised financial report afterwards!`,
      },
      {
        author: "Jamie's Script",
        content: `Hello, [name]!

This is Jamie from themoneybeesacademy! (http://www.instagram.com/moneybeesacademy)

We spoke on the phone earlier about our financial literacy campaign. Our goal is to help young adults & NSFs develop a greater understanding of financial literacy, that's why we are giving away this free adulting guidebook.

To express our appreciation for your interest, we would like to invite you for a *free 20 min zoom consultation* to send you the guidebook, and take you through some important financial concepts within it.

We will also do a quick financial health check for you to kickstart your journey towards your financial independence and freedom!

Would sometime [date] at 11am or 1pm work for you? ◡̈`,
      },
      {
        author: "Jamie's Script (NSFs)",
        content: `Hi xxx!
Jamie here from TheMoneyBees Academy 🐝
https://www.instagram.com/moneybeesacademy

Thanks for chatting earlier with me! At MoneyBees, we believe everyone deserves access to quality financial education. That's why we created our free Adulting Guidebook.

As part of our financial literacy campaign, we're offering a complimentary 20-minute Zoom session:
1. Understand your current situation and priorities
2. Go over key concepts that are most relevant to you
3. Share some simple, practical steps you can take now
4. Answer any questions you have along the way

There's no obligation beyond this consultation — it's all about helping you build a stronger financial foundation.

Would next Saturday at 2:30 PM or Sunday at 12 PM work for you?

Looking forward to helping you feel more confident about your finances! ✨`,
      },
    ],
  },
  {
    id: "follow-up-2nd",
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

Hope you had a wonderful weekend!

At themoneybees, we want to ensure financial education is accessible to all, so that everyone is able to achieve their financial goals, and eventually, their financial freedom.

We are dedicated to helping NSFs like yourself who are interested in taking their first steps towards learning more about the world of finance!

Are you available this/next Sat/Sun at xxam/xxpm for a quick meetup/zoom call?

If you are unavailable, let me know your preferred date and time/location, and I will schedule you in.

Have a great day/weekend! ◡̈`,
      },
      {
        author: "Jamie's Revised Script",
        content: `Good afternoon, xxx! Just checking in about our 20 min complimentary zoom session I mentioned the other day. 😊

Financial literacy is a game-changer when it comes to achieving long-term wealth and security, and we'd love to help you take that first step!

Young adults who improve their financial literacy are more likely to build wealth early and avoid unnecessary debt. In just 20 minutes on Zoom, we'll explore tailored insights and actionable strategies to help you start saving smarter, investing wisely, and moving confidently toward your goals.

Think of this as an investment in you. A small time commitment now could yield financial clarity and security for years to come. 💡

Our weekend slots (Sat 10:30am / Sun 2:30pm) are still open. Let me know what works best!

Have a wonderful day! 🌟`,
      },
    ],
  },
  {
    id: "follow-up-3rd",
    stage: "3rd Follow-Up Message",
    category: "follow-up",
    versions: [
      {
        author: "Script A",
        content: `Hello XXX! I hope you're doing well. I wanted to check in and see if you had a chance to review my previous message. I'm still available this Saturday at either 10am or 2pm. Please let me know if either of those times work for you. Looking forward to providing valuable insights tailored to your financial needs.`,
      },
      {
        author: "Jamie's Script",
        content: `Hi xxx, hope you're doing well!

I understand that your current schedule may be hectic, but I am hoping that you will give me an opportunity to provide valuable insights on any financial questions or goals you may have.

It can be anything from budgeting, saving, investing, or even just organising and allocating your resources.

Are you available this/next Sat/Sun for a quick meetup/zoom call?

Let me know if that sounds good to you, or if you prefer a different timing/date.

Hope to hear from you soon! ◡̈`,
      },
      {
        author: "Jamie's Revised Script",
        content: `Good afternoon xxx, I hope you're having a great day! 🌿

I just wanted to follow up about our free 20-minute Zoom consultation and adulting guidebook.

Your early career years are your greatest financial asset — starting smart now can multiply your options later.

In our session, we'll:
1. Assess your current financial health
2. Discuss money habits aligned with your goals
3. Share practical tips you can apply right away
4. Provide you with our free adulting guidebook

We have 2 weekend time-slots left this week, does Saturday at 10.30 or Sunday at 2.30pm work?

No pressure at all — we simply want to ensure you have access to these resources when you're ready.

Looking forward to hearing from you! 💬`,
      },
    ],
  },
  {
    id: "follow-up-4th",
    stage: "4th (Final) Follow-Up Message",
    category: "follow-up",
    versions: [
      {
        author: "Script A",
        content: `Hi XXX, just wanted to follow up on my previous message. I understand you're busy, but I truly believe I can offer valuable insights that could benefit you. I still have availability this Saturday at either 10am or 2pm. Let me know if either of those times work for you. Your financial well-being is important, and I'm here to help.`,
      },
      {
        author: "Jamie's Script",
        content: `Good morning/afternoon xxx!

Hope you are having a great week!

I know how busy NS life can be, so I'll be brief.

I was wondering if you have given some thought to my previous message on learning more about managing your personal finances.

I am certain that our financial literacy session and our free adulting guidebook will benefit you immensely.

Are you available this/next Sat/Sun for a quick meetup/zoom call?

Awaiting your response at your earliest convenience.

Have a great day/weekend! ◡̈`,
      },
      {
        author: "Jamie's Final Text",
        content: `Good afternoon [Name],
Hope you're having a great week! 😊

Just a quick note to let you know that our free adulting guidebook and consultation are still available whenever you're ready! 🌱

If now's not the right time, I wanted to share something helpful — our Telegram community: http://t.me/themoneybeesacademy

We regularly post bite-sized financial tips and updates.

Feel free to reach out if you'd like to schedule the Zoom session when the time is right. We're always here to help!

Wishing you a great week ahead! ✨`,
      },
    ],
  },

  // ===== APPOINTMENT CONFIRMATION =====
  {
    id: "confirmation-sequence",
    stage: "Appointment Confirmation Sequence",
    category: "confirmation",
    versions: [
      {
        author: "Original",
        content: `**Confirmation:**
Thank you for confirming our zoom session/F2F meeting at XXX. I have placed our appointment on my calendar!
I will be reminding you on the nearest days! / I will be sending you the zoom link on Friday or Saturday morning! See you!

If you wish to reschedule to another day and time, do let me know too :)

**Day of Session:**
Please join the zoom 5 minutes before the start time, and let me know once you're in!`,
      },
      {
        author: "Jamie's Script",
        content: `**Confirmation:**
Thanks for confirming our zoom consult on [Date, Time]!
Should you need to reschedule, please let me know. ◡̈

**2-3 days before session:**
Good morning xxx, hope you had a great weekend!
This is a gentle reminder that our zoom session will be on [Date, Time].
I will send you the zoom link on [day before meeting], see you then! ◡̈

**1 day before session:**
Good morning xxx, here is the zoom link for our session tomorrow! See you there! 😊
Join Zoom Meeting: https://us06web.zoom.us/j/5600197204?pwd=RWZVYlBaVHhsb01DRi9oRVhJWUlrdz09

**Day of Session:**
Good morning xxx!
Please join the zoom 5 minutes before the start time, and let me know once you're in.
Thank you, see you soon! ◡̈`,
      },
    ],
  },

  // ===== POST-MEETING =====
  {
    id: "post-meeting",
    stage: "Post-Meeting Follow-Up",
    category: "post-meeting",
    versions: [
      {
        author: "Default Script",
        content: `Hey XXXX!

Good chat just now! [insert summary of meeting, quick one]

Congrats on your [upcoming milestone], hope you do well in your [current thing, insert something funny maybe], talk to you soon again on [insert date!]

Btw do check out my telegram channel https://t.me/themoneybeesacademy

And save my number too ☺️ and we can drop each other a follow on IG [insert IG] 🙌

Great chat today and talk again soon!`,
      },
    ],
  },

  // ===== REFERRAL SCRIPTS =====
  {
    id: "referral-intro-text",
    stage: "Text from Referrer (Send to Client Before You Text Their Friend)",
    category: "referral",
    versions: [
      {
        author: "Default Script",
        content: `Hey guys, you can do this quiz - See what budgeting profile you are :)
https://www.cynthiatanfinance.com/`,
      },
      {
        author: "Template for Client to Send",
        content: `https://leotanfinancial.sg/the-ultimate-guide-to-adulting/

Here are more info of guidebooks that you can pass to your friends!

This is the template message, do send to your friends before I text them!

---

Hey bro!
Btw I told my financial consultant to pass you the above guidebooks! Read it and found it quite useful. He also conducts some workshops and courses once in a while. Gave me quite a clear overview of my finances without selling.

He has a telegram channel https://t.me/themoneybeesacademy`,
      },
    ],
  },
  {
    id: "referral-call",
    stage: "Referral — Call to Referred Contact",
    category: "referral",
    versions: [
      {
        author: "Cynthia's Script",
        content: `Hey XXX, got your number from [Referrer Name], my husband spoke with [Referrer] recently about this financial health quiz.

Have you read the book or the financial quiz already? If not its okay, I will pass you the book and the quiz to do after this call, is that okay?`,
      },
    ],
  },
  {
    id: "referral-text",
    stage: "Referral — Text to Referred Contact",
    category: "referral",
    versions: [
      {
        author: "Cynthia's Script",
        content: `Hey XXX, here's the financial quiz: https://www.cynthiatanfinance.com/

And here's a copy of how the book looks like.

Can I arrange a quick zoom call or meetup with you, how we can help you to free up some cashflow for your daily expenses and long term goals?`,
      },
      {
        author: "Professional Version",
        content: `Hi [Recipient's Name],

I hope you're doing well!

I'm reaching out from @moneybeesacademy because one of your friends, [Friend's Name], recently had a fantastic experience with us during a financial planning session. They found our advice on investing, early retirement, and money management incredibly valuable, so much so that they thought you might benefit from it too!

We understand how frustrating it can be to navigate the world of personal finance, especially since these crucial skills aren't taught in school. That's why we're on a mission to empower young adults like you with the knowledge and tools to achieve financial freedom.

To kickstart your journey, I'd love to invite you to a free 20-minute Zoom consultation where we'll cover essential topics like savings strategies, investment options, and planning for early retirement. Plus, you'll receive a personalized financial report!

As a bonus, you'll receive these books as well!

Feel free to reply to this message, and we'll set up a time that works best for you. I'm looking forward to helping you achieve your financial goals!`,
      },
    ],
  },

  // ===== FAQ / OBJECTIONS =====
  {
    id: "faq-number",
    stage: "If they ask how you got their number",
    category: "faq",
    versions: [
      {
        author: "Jamie's Script",
        content: `"You did a survey with us at Pasir Ris bus interchange a few weeks ago."`,
      },
      {
        author: "Alternative",
        content: `"You might have done a survey with us previously a few years ago. As we're reaching out specifically to young professionals now, we're connecting with people who could benefit most from financial education."`,
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
      {
        author: "Alternative",
        content: `Never say AIA, or whatever insurance company. "Actually I just started this job a while back, I'm just helping my friend, not sure which company he's from actually."`,
      },
    ],
  },
  {
    id: "faq-nasty",
    stage: "When customers turn nasty",
    category: "faq",
    versions: [
      {
        author: "Default Script",
        content: `Just say "Sorry to bother you" and end the call. "Have a nice day."

Do not argue. Remain professional and move on.`,
      },
    ],
  },
  {
    id: "faq-whats-the-catch",
    stage: "What's the catch? / Do I have to do anything?",
    category: "faq",
    versions: [
      {
        author: "Jamie's Script",
        content: `"That's great that you're interested in our financial planning guidebook!

We actually pair the guidebook with a complimentary 20-minute zoom consultation. This allows us to tailor the information to your financial situation and goals.

We will just go over some key concepts from the guide and generate a personalised financial report for you. This way, you'll get much more value than just reading the book on your own.

The guidebook and report will be sent to you right after our session. Does that sound good to you?"`,
      },
    ],
  },

  // ===== TIPS & BEST PRACTICES =====
  {
    id: "tips-calling",
    stage: "Calling Tips & Best Practices",
    category: "tips",
    versions: [
      {
        author: "Team Guide",
        content: `**Key emphasis:** Giving away FREE adulting book + share more details on WhatsApp to gain permission to send them more details.

**Why WhatsApp first?** These are super cold leads — they don't know where we are from. It's hard to set appointments on call. By sending details and link to our Instagram they will be able to see we are professional and have credibility, making it easier to set appointments.

**Call duration:** Good to call 1-2hrs a day. You may try 3hrs but it generally gets mentally draining after 2hrs. Can build up mental resilience. Usually about 40-50 dials an hour.

**End of Day Report Template:**
EOD
[Date]
X Hours Dialled
XX Calls Dialled
XX Not Interested Conversations
X Needs Call Back
X Yes to more details on WA
X Appointment Sets

**After getting "Yes to WA":** Follow up to try and set appointment using the message templates.

**Calendar management:** After setting an appointment, set on your own calendar and invite Leo to the event. Check Leo's calendar for availability (usually Sat and Sun). Give buffer for church or physical meetings due to travel time.`,
      },
    ],
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

function ScriptCard({ script }: { script: ScriptEntry }) {
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
                  <Badge variant="secondary" className={`mt-1 text-[10px] ${cat.color}`}>
                    {cat.label}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
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

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: SCRIPTS_DATA.length };
    Object.keys(categoryLabels).forEach((key) => {
      c[key] = SCRIPTS_DATA.filter((s) => s.category === key).length;
    });
    return c;
  }, []);

  const activeCategoriesWithData = useMemo(() => 
    (Object.keys(categoryLabels) as CategoryKey[]).filter(key => counts[key] > 0),
    [counts]
  );

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
        {/* Search */}
        <div className="mb-6">
          <EnhancedSearchBar onSearch={setSearchQuery} placeholder="Search scripts..." />
        </div>

        {/* Category filter tabs */}
        <div className="mb-6 overflow-x-auto">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="all" className="text-xs">All ({counts.all})</TabsTrigger>
              {activeCategoriesWithData.map((key) => {
                const cat = categoryLabels[key];
                return (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    <cat.icon className="h-3 w-3 mr-1" /> {cat.label} ({counts[key]})
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

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
