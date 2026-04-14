-- Disable audit triggers to avoid FK violation on activity log
ALTER TABLE public.learning_track_items DISABLE TRIGGER lt_items_audit;

-- Backfill published_at
UPDATE public.learning_track_phases SET published_at = created_at WHERE published_at IS NULL;
UPDATE public.learning_track_items SET published_at = created_at WHERE published_at IS NULL;

-- Re-enable audit triggers
ALTER TABLE public.learning_track_items ENABLE TRIGGER lt_items_audit;