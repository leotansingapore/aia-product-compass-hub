CREATE TABLE public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_settings_read"
  ON public.platform_settings
  FOR SELECT
  USING (true);

CREATE POLICY "platform_settings_admin_write"
  ON public.platform_settings
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master_admin')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'master_admin')
  );

INSERT INTO public.platform_settings (key, value)
VALUES ('animated_tour_reset_at', to_jsonb(now()::text))
ON CONFLICT (key) DO NOTHING;