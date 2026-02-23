INSERT INTO scripts (stage, category, target_audience, script_role, tags, versions, sort_order)
VALUES (
  'Telemarketer — Mass Affluent Working Adults (Golden Year Partners)',
  'cold-calling',
  'working-adult',
  'telemarketer',
  ARRAY['cold-call', 'text-message', 'cpf', 'passive-income', 'retirement', 'mass-affluent'],
  '[{"author": "Template", "content": "Hi, is this (name)?\n\nI''m [name], from Golden Year Partners. We might have called you before but you were busy. Very quickly, we specialise in helping Singaporeans create a simple and secure passive income, and we''ve helped many individuals discover ways to maximize their CPF and other assets, ensuring they''re on track to meet their retirement goals.\n\nSo if you would like a personalised retirement plan, can my consultant give you a callback later at around [XX] timing to share more about it?\n\nOkay great, after this call, my manager will send you a text message, and all you have to do, is to reply and acknowledge, is that okay?\n\nAlright great. So just one last thing, this session is just for you to learn more about growing a simple and secure passive income, and as long as you learn something, then that''s good enough!\n\n---\n\n**If asked what''s this about:**\nRetirement planning consultation, we will share more details in the WhatsApp and my consultant will also give you a call later. You can also read https://consult.goldenyearpartners.com/ if needed for more information."}]'::jsonb,
  24
);