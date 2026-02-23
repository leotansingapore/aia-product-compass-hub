INSERT INTO scripts (stage, category, target_audience, script_role, tags, versions, sort_order)
VALUES (
  'Telemarketer — Ebook Leads (Financial Planning Guide)',
  'cold-calling',
  'working-adult',
  'telemarketer',
  ARRAY['ebook', 'cold-call', 'text-message', 'cpf', 'passive-income'],
  '[{"author": "Template", "content": "Hi, is this (name)?\n\nI''m [name], from The Money Bees. This is a courtesy call to inform you that we have received your interest in getting our ultimate guide to financial planning recently.\n\nWe might have called previously, but you were busy.\n\n............................................\n\nIn order to redeem it, we will need to schedule a meetup with one of our wealth specialists.\n\nWe specialise in helping Singaporeans create a simple and secure passive income, and we''ve helped many individuals discover ways to maximize their CPF and other assets, ensuring they''re on track to help them retire decades earlier than their peers.\n\nWould you be opposed in exploring how our expert advisors can help you create a personalized plan?\n\nCan my consultant give you a callback later at around [XX] timing to share more about it?\n\nOkay great, after this call, my manager will send you a text message, and all you have to do, is to reply and acknowledge, is that okay?\n\nAlright great. So just one last thing, this session is just for you to learn more about growing a simple and secure passive income, and as long as you learn something, then that''s good enough!"}]'::jsonb,
  20
);