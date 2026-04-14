UPDATE public.products 
SET useful_links = '[
  {"title":"Product Brochure","type":"pdf","url":"https://www.aia.com.sg/content/dam/sg-wise/en/docs/our-products/en/aia-centurion-pa.pdf"},
  {"title":"AIA Website","type":"link","url":"https://www.aia.com.sg/en/our-products/accident-protection/aia-centurion-pa"},
  {"title":"Product Summary","type":"pdf","url":"https://www.aia.com.sg/content/dam/sg-wise/en/docs/aiaformlibrary/application-and-product-summary-booklet-aia-centurion-pa.pdf"},
  {"title":"Client Illustrator (Calculator)","type":"link","url":"https://present.financeillustrator.com/accident-plan-illustrator"}
]'::jsonb
WHERE id = 'centurion-pa';