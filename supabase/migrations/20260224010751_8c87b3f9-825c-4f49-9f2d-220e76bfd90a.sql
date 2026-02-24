-- Add a column to link related scripts (e.g. follow-up nudge → parent post-call)
ALTER TABLE public.scripts ADD COLUMN related_script_id uuid REFERENCES public.scripts(id) ON DELETE SET NULL;

-- Populate known relationships from the split operation:

-- Follow-Up Nudge — Young Adults → Post-Call Text — Young Adults
UPDATE public.scripts SET related_script_id = '86033920-417c-4611-82ed-ff778621bacf'
WHERE id = '7695d605-017b-40d3-828e-691710927dc1';

-- Follow-Up Nudge — FB Webinar Leads → Post-Call Text — FB Webinar Leads
UPDATE public.scripts SET related_script_id = 'da69b2e6-dee5-4e30-b388-6f95e686b6db'
WHERE id = 'f5b3a9e9-6131-4491-a571-75a9b47f5e08';

-- Follow-Up Nudge — FB Lead Pre-Retiree → Post-Call Text — FB Lead Wants Info Only
UPDATE public.scripts SET related_script_id = '059a1192-459f-4d01-be8d-19346483c663'
WHERE id = '2a53bd9a-c6b5-4aa3-ac7a-7cbafe149420';

CREATE INDEX idx_scripts_related ON public.scripts(related_script_id) WHERE related_script_id IS NOT NULL;