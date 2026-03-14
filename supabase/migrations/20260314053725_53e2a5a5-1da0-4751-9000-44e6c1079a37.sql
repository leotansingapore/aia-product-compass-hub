CREATE TABLE public.concept_card_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id uuid NOT NULL REFERENCES public.concept_cards(id) ON DELETE CASCADE,
  ease_factor numeric NOT NULL DEFAULT 2.5,
  interval_days integer NOT NULL DEFAULT 1,
  due_date date NOT NULL DEFAULT CURRENT_DATE,
  last_grade text NOT NULL DEFAULT 'again',
  reviewed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, card_id)
);

ALTER TABLE public.concept_card_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own card reviews"
  ON public.concept_card_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own card reviews"
  ON public.concept_card_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own card reviews"
  ON public.concept_card_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own card reviews"
  ON public.concept_card_reviews FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_concept_card_reviews_user_due
  ON public.concept_card_reviews (user_id, due_date);