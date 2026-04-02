INSERT INTO public.scripts (stage, category, target_audience, script_role, tags, versions, sort_order)
VALUES (
  'Setting Catch Up Calls Script',
  'servicing',
  'clients',
  'consultant',
  ARRAY['catch-up-calls', 'client-outreach', 'reconnect', 'texting-campaign', 'whatsapp', 'follow-up'],
  '[
    {
      "author": "Official",
      "title": "V1 — Casual Check-In",
      "content": "Hey [Name]! It''s been a while—would you be up for a catch-up call sometime soon?"
    },
    {
      "author": "Official",
      "title": "V2 — Specific Day Proposal",
      "content": "Hi [Name]! I''d love to catch up. Would you be free for a call on [day/time]?"
    },
    {
      "author": "Official",
      "title": "V3 — Warm Reconnect",
      "content": "Hello [Client''s Name], I hope you''re doing well. I''d love to reconnect and hear how things are going. Let me know if you''d be open to a quick call or coffee sometime soon!"
    }
  ]'::jsonb,
  940
);