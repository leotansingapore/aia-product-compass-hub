UPDATE public.scripts 
SET 
  versions = '[
    {"title": "Monthly Investment Insights", "author": "Admin", "content": "Hey [Xxx], hope you''re doing well. :)\n\nI''ve prepared investment insights for [month], which include some important updates on our strategies and market outlook. You can check it out here! Chat again soon and let me know if you wish to review your policies anytime\n\n[pdf attached]"},
    {"title": "Dec 2024 Broadcast V1", "author": "Official", "content": "Hey [Xxx], hope you''re doing well. :)\n\nI''ve prepared investment insights for December 2024, which include some important updates on our strategies and market outlook. You can check it out here! Chat again soon and let me know if you wish to review your policies anytime."},
    {"title": "Dec 2024 Broadcast V2", "author": "Official", "content": "Hey XX\nHope you''re doing well :)\nI''ve prepared the investment insights for July, which include some important updates on our strategies and market outlook.🤓\n\nYou can find the detailed report attached. 📑\n\nIf you have any questions or would like to discuss your portfolio, please drop me a text!"}
  ]'::jsonb,
  tags = ARRAY['investment', 'monthly-update', 'market-outlook', 'policy-review', 'whatsapp', 'ilp', 'pdf-attachment', 'texting-campaign']
WHERE id = '76287e69-3d35-4297-bae9-8abfb9e1f193';