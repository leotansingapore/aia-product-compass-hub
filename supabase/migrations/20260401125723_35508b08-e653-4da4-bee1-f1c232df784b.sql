INSERT INTO public.scripts (stage, category, target_audience, script_role, tags, versions, sort_order)
VALUES (
  'Christmas Hamper 2024 Dec Campaign',
  'servicing',
  'clients',
  'consultant',
  ARRAY['christmas', 'festive-greetings', 'gift', 'client-appreciation', 'texting-campaign', 'whatsapp'],
  '[{"author": "Official", "content": "Hi [NAME]!\n\nHope things are going great! I''ll be sending you a Christmas Hamper for you and your family, and also to thank you for your support thus far.\n\nJust to confirm, is this your correct address? [INSERT ADDRESS] Will be sending them sometime around Christmas Eve!\n\n---\n\n**📋 Client List (Total: 12)**\n\n1. Gabriel Kow\n2. Benjamin Gnoh\n3. Choo Yen Ping\n4. Yaoyun\n5. Ian Lee Song Qi\n6. Tan Jit Jing Shearer\n7. Teo Jun Hao, Aldric\n8. Donnelius Yeo Hao Jie\n9. Liew Hoe Yin Darius Dylan\n10. Shawn Lee Choon Wee\n11. Qian Yuhao\n12. Quek Shun Hong", "title": "Christmas Hamper Text"}]'::jsonb,
  910
);