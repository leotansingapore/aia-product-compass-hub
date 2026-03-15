-- ============================================================
-- Cleanup: Merge and remove duplicate sales scripts
-- ============================================================
-- Duplicate Pair 1: Voucher Telemarketer Scripts (Young Adults)
--   KEEP:   "Telemarketer — Freebie Voucher Leads (Short Call)" (has tags, sort_order 19)
--   DELETE: "Cold Calling — Telemarketer Script for Voucher Leads (Young Adults / NSF)" (sort_order 16)
--   Reason: Word-for-word identical content
-- ============================================================

DELETE FROM scripts
WHERE stage = 'Cold Calling — Telemarketer Script for Voucher Leads (Young Adults / NSF)'
  AND category = 'cold-calling'
  AND target_audience = 'young-adult';

-- ============================================================
-- Duplicate Pair 2: Ebook / Financial Planning Guide (Working Adults)
--   KEEP:   "Telemarketer — Ebook Leads (Financial Planning Guide)" (has tags, sort_order 20)
--   MERGE:  Add the markdown-formatted version from the other script
--   DELETE: "Cold Calling — Telemarketer Script for Ebook Leads (Working Adults)" (sort_order 0)
--   Reason: Same script content; the deleted one has better formatting, so we merge it in
-- ============================================================

UPDATE scripts
SET versions = (
  SELECT jsonb_agg(v)
  FROM (
    -- Keep existing version(s) from the target script
    SELECT v FROM scripts s, jsonb_array_elements(s.versions) AS v
    WHERE s.stage = 'Telemarketer — Ebook Leads (Financial Planning Guide)'
      AND s.category = 'cold-calling'
      AND s.target_audience = 'working-adult'
    UNION ALL
    -- Add version(s) from the source script, annotating their origin
    SELECT jsonb_build_object(
      'author', COALESCE(v->>'author', 'Template') || ' (Markdown Version)',
      'content', v->>'content'
    )
    FROM scripts s, jsonb_array_elements(s.versions) AS v
    WHERE s.stage = 'Cold Calling — Telemarketer Script for Ebook Leads (Working Adults)'
      AND s.category = 'cold-calling'
      AND s.target_audience = 'working-adult'
  ) combined
),
tags = ARRAY['ebook', 'cold-call', 'text-message', 'cpf', 'passive-income', 'markdown']
WHERE stage = 'Telemarketer — Ebook Leads (Financial Planning Guide)'
  AND category = 'cold-calling'
  AND target_audience = 'working-adult';

DELETE FROM scripts
WHERE stage = 'Cold Calling — Telemarketer Script for Ebook Leads (Working Adults)'
  AND category = 'cold-calling'
  AND target_audience = 'working-adult';

-- ============================================================
-- Duplicate Pair 3: Post-Call Follow-Up Texts (Young Adults)
--   KEEP:   "Post-Call Text — Adulting Guidebook" (sort_order 20)
--   MERGE:  Add the course-angle version, rename to cover both
--   DELETE: "Post-Call Text — Financial Planning Course Angle" (sort_order 21)
--   Reason: 90%+ identical; only "guidebook" vs "course" wording differs
-- ============================================================

UPDATE scripts
SET
  stage = 'Post-Call Text — Guidebook / Course Follow-Up',
  versions = (
    SELECT jsonb_agg(v)
    FROM (
      -- Version 1: Adulting Guidebook angle (original)
      SELECT jsonb_build_object(
        'author', COALESCE(v->>'author', 'Gabriel'),
        'title', 'Adulting Guidebook Angle',
        'content', v->>'content'
      ) AS v
      FROM scripts s, jsonb_array_elements(s.versions) AS v
      WHERE s.stage = 'Post-Call Text — Adulting Guidebook'
        AND s.category = 'follow-up'
        AND s.target_audience = 'young-adult'
      UNION ALL
      -- Version 2: Financial Planning Course angle
      SELECT jsonb_build_object(
        'author', COALESCE(v->>'author', 'Gabriel / Benjamin'),
        'title', 'Financial Planning Course Angle',
        'content', v->>'content'
      ) AS v
      FROM scripts s, jsonb_array_elements(s.versions) AS v
      WHERE s.stage = 'Post-Call Text — Financial Planning Course Angle'
        AND s.category = 'follow-up'
        AND s.target_audience = 'young-adult'
    ) combined
  )
WHERE stage = 'Post-Call Text — Adulting Guidebook'
  AND category = 'follow-up'
  AND target_audience = 'young-adult';

DELETE FROM scripts
WHERE stage = 'Post-Call Text — Financial Planning Course Angle'
  AND category = 'follow-up'
  AND target_audience = 'young-adult';
