INSERT INTO scripts (stage, category, target_audience, script_role, tags, versions, sort_order)
VALUES (
  'Telemarketer — Freebie Voucher Leads (Short Call)',
  'cold-calling',
  'young-adult',
  'telemarketer',
  ARRAY['voucher', 'cold-call', 'text-message', 'zoom'],
  '[{"author": "Template", "content": "Hi, is this (name)?\n\nI''ll just keep this call short less than 1 minute!\n\nUnderstand that you''re currently studying or serving your national service?\n\nI''m [name] from themoneybees!\n\nThis is a courtesy call to inform you that we have received your interest in redeeming some [name of vouchers] vouchers recently!\n\nSo I believe we have texted you previously about it! In order to redeem it, we will need to schedule a short 20minute zoom session, whereby one of our consultants will share more about growing your money and investing. After the call, you will get an investing guidebook and also the vouchers.\n\nWould you prefer to call weekends or weekdays?\n\n*[wait for reply]*\n\nAlright great, so I will schedule the session tentatively for this saturday 10am and after this call, my manager will send you a text message, and all you have to do, is to reply and acknowledge, is that okay?\n\nAlright great. so just one last thing, this session is just for you to learn more about growing your money, and as long as you learn something, then that''s good enough!"}]'::jsonb,
  19
);