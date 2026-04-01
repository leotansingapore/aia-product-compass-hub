INSERT INTO public.scripts (stage, category, target_audience, script_role, tags, versions, sort_order)
VALUES (
  'Announcing GoalsMapper Texting Campaign',
  'servicing',
  'clients',
  'consultant',
  ARRAY['goalsmapper', 'client-outreach', 'texting-campaign', 'whatsapp', 'financial-planning', 'follow-up', 'referrals'],
  '[
    {
      "author": "Official",
      "title": "V1 — Personal Intro + Group Chat",
      "content": "Thanks so much! 😍 I really appreciate it! 🤗\n\nOn another note, I''ve got some more exciting updates to share!\n\nAs Cynthia and I have been discussing on how we can further add value to you, we would like to share with you some important upgrades in our financial planning toolkit.\n\nShe''ll be using some really great tools like GoalsMapper to make financial planning more personalized and tailored to your needs.\n\nPlus, she''s putting together some exclusive resources for young professionals, so we''ve got all stages of your financial journey covered. I''m going to create a chat group with her soon, and she''ll be reaching out to you soon to introduce herself and schedule a quick catch-up to discuss how we can continue supporting your financial goals with these new tools.\n\nI''m really excited for you to meet her and for the value she''ll bring! 🤩\n\nThanks again for your support—looking forward to catching up soon!\n\n---\n\n**📩 SEND THIS IN GROUP CHAT**\n\nJust want to introduce you to my wife Cynthia!\n\nActually right now we just got back from our honeymoon from Europe! And baack to work!\n\nAnyway, if you know anyone who wants the wedding ebook, feel free to send to them too just by completing this relationship quiz -> https://www.cynthiatanfinance.com/relationship-quiz :P\n\nAnyways, being workaholics we were actually just brainstorming on how we can value add to you more, soo my wife and I have something brand new and exciting for you (as a long term client of ours) that I want you to check out before Q4 starts.\n\n🎥 **Financial Planning Upgrade Introduction**\nhttps://www.loom.com/share/6d21b149a7bc494fb4b126fafe621a6c\n\nWe think you''ll really like what we have planned for you, and it could make a huge impact on your 2025 financial planning goals and beyond!\n\nCan you watch the quick 5min video I made ONLY for our selected clients, then just reply a quick thumbs up once you''re done!"
    },
    {
      "author": "Official",
      "title": "V2 — Cynthia Follow-Up (Day After)",
      "content": "**Send from Cynthia''s number, one day later:**\n\nHey XXX! Hope you''re doing well! As mentioned, Leo and I have been discussing on how we can further value add to you, and hence we''d like to share with you an important upgrade in our financial planning toolkit:\n\nIts fully complimentary to our selected clients, and helps forecast important financial data like your net worth, cashflow, and help us budget for important milestones.\n\nActually we''ve already filled up your profile with your existing policies, but its still lacking some financial info.\n\nCan I give you a quick call (perhaps 10min or less), to just introduce myself + run through how it works? Perhaps tmr or the day after?"
    }
  ]'::jsonb,
  920
);