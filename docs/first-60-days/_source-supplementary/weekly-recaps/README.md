---
type: index
title: "Weekly Recap Transcripts"
tags: [first-60-days, weekly-recaps, index]
---

# Weekly Recap Transcripts

Anonymised transcripts of the live weekly recap calls Leo runs with each new cohort. One file per week.

## Naming convention

- `week-1.md` — Week 1 (Days 1–6, foundation & identity shift)
- `week-2.md` — Week 2 (Days 7–12, industry context & freedom business)
- `week-3.md` — Week 3 (Days 13–18, ...)
- ...continuing for each week as the cohort progresses

## How to add a new week

1. Pull the transcript from Fireflies (or run `python3 tools/scrub_fireflies_speakers.py` if the recording is already in real-appointments format).
2. Anonymise trainee names — top speakers (by word count) become `Trainee 1`, `Trainee 2`, etc. Leo stays as Leo.
3. Save as `week-N.md` in this folder with the same frontmatter shape as `week-1.md`.
4. The trimmed video itself lives at `aia-product-compass-hub/public/videos/fastrack-training-N-preview.mp4`, embedded in the relevant Day page (Week 1 → Day 6, Week 2 → Day 12, etc.).

## Related

- App-side video player: `/learning-track/first-60-days/day/6` (Week 1)
- App-side digest with timestamps: same page, in the "Lecture notes" expandable section
