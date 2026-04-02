INSERT INTO public.scripts (stage, category, target_audience, script_role, tags, versions, sort_order)
VALUES (
  'CNY Hamper Texting Campaign 2025 Jan',
  'servicing',
  'clients',
  'consultant',
  ARRAY['cny', 'chinese-new-year', 'lunar-new-year', 'festive-greetings', 'client-outreach', 'texting-campaign', 'whatsapp', 'hamper', 'delivery'],
  '[
    {
      "author": "Official",
      "title": "V1 — Client Hamper Text",
      "content": "Hey [NAME], happy CNY in advance! I''ve prepared a CNY hamper for you! This year marks my 10th year in AIA, and I am glad to be supported by clients like you. This year, my goal is to improve my connections with existing clients rather than focusing on new sales. Also, I am focusing on grooming and coaching new advisors in this business this year.\n\nThe hampers will be delivered to you to this address [insert address] later on. Is the address correct?\nThey should be delivered later [around this timing].\n\nI do hope this year will be a year of breakthroughs for you!"
    },
    {
      "author": "Official",
      "title": "V2 — Delivery SOP & Logistics",
      "content": "## How-To Guide\n\n🎥 [Watch Loom Tutorial](https://www.loom.com/share/dc3b87da569b4e22b5dfc45cacebb73f)\n\n## Delivery Logistics\n\n🚚 **Use Lalamove to send out:** [web.lalamove.com](https://web.lalamove.com/)\n\n### Batching Strategy\nSend in **3 batches** (3 different orders):\n1. **North**\n2. **Northeast + East**\n3. **West**"
    }
  ]'::jsonb,
  961
);