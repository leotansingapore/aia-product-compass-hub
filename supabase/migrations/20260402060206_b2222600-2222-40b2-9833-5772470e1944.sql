INSERT INTO public.scripts (stage, category, target_audience, script_role, tags, versions, sort_order)
VALUES (
  'Restructuring Campaign for SRS',
  'servicing',
  'clients',
  'consultant',
  ARRAY['srs', 'smart-rewards-saver', 'restructuring', 'client-outreach', 'texting-campaign', 'whatsapp', 'follow-up', 'portfolio-review'],
  '[
    {
      "author": "Official",
      "title": "V1 — Client Outreach Text",
      "content": "Hey [name],\n\nJust wanted to arrange a call regarding your Smart Rewards Saver policy that you purchased from AIA on [INSERT DATE] which you are paying [INSERT PREMIUM]. I would like to suggest some options to improve the returns of your portfolio further.\n\nWould sometime this week be good?"
    },
    {
      "author": "Official",
      "title": "V2 — Campaign Requirements & SOP",
      "content": "## Requirements\n\n- Client has **not spoken with me in the past 6 months**\n- Smart Rewards Saver policy is **still active**\n- Check my base for their last meeting date with me on Agency CRM (please ensure you''ve updated the record on my base)\n\n## How to Get the Smart Rewards Saver Clients\n\n🎥 [Watch Loom Tutorial](https://www.loom.com/share/9c576c2f59fa41b08b2942ae96edeb64)\n\n> I should have **200+** of these clients"
    }
  ]'::jsonb,
  950
);