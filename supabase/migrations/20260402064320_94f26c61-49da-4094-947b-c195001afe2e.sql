INSERT INTO public.scripts (stage, category, target_audience, script_role, tags, versions, sort_order)
VALUES (
  'Monopoly Gift Set 2025 Jan',
  'servicing',
  'clients',
  'consultant',
  ARRAY['monopoly', 'gift-set', 'aia-plus', 'client-outreach', 'texting-campaign', 'whatsapp', 'telegram', 'financial-review', 'sg60', 'redemption'],
  '[
    {
      "author": "Official",
      "title": "V1 — Client Texting Template",
      "content": "Hello [name],\n\nHope you''re doing well! Just wanted to share that you can claim a free monopoly set from AIA if you redeem it by 31st of march which is quite soon (and just need to have a quick online financial review with me too)\n\nCan click on this link and login with your AIA+ app to follow the steps here :)\n\nhttps://aiaplus.aia.com.sg/app-link/rewards/campaign?target=crm-sg60-faststart&fscId=25203&challenge_id=0&challenge_type=0!\n\nThere is also a lucky draw as part of SG60! From 290,000 KrisFlyer miles hotel stays and more!\n\nLet''s catch up soon :)"
    },
    {
      "author": "Official",
      "title": "V2 — Setting Call Script",
      "content": "Hey [client],\n\nThanks for signing up for the monopoly set recently with AIA!\n\nFor the redemption process, AIA requires us to have a quick financial health review with you to run through! Then afterwards, you will get a financial report which can be quite useful as it consolidates all your policies from everywhere in to one place :)\n\nI would like to schedule a zoom call with you, prolly around 30 minutes! Will trigger the redemption process for the monopoly set afterwards.\n\nAs I am overseas these few weeks for holiday, can we schedule some time in [insert date insert time?]"
    },
    {
      "author": "Official",
      "title": "V3 — VA Instructions & SOP",
      "content": "## Instructions to VA\n\nFor those who signed up, please indicate their interest in my base under the column **\"Texting Campaigns Interest\"** as **\"Monopoly Campaign Jan 2025\"**, so that we can follow up properly with them.\n\nPlease check the GIF here of me creating a column on it. I have also organised the base to be more optimised for a texting campaign.\n\nPlease also indicate where to text them, either **WhatsApp** or **Telegram 1/2**.\n\n> ⚠️ This is an entirely different thing from my gifting campaigns."
    }
  ]'::jsonb,
  962
);