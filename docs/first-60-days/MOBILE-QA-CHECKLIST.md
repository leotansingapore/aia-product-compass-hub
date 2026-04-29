# Mobile QA Checklist — First 60 Days Markdown Tables

Use this checklist to verify that every markdown table across the First 60 Days
curriculum renders correctly on mobile (viewport ≤ 440px wide). All tables flow
through `markdownComponents.table` in `src/lib/markdown-config.tsx`, which wraps
them in a horizontally scrollable container with a `min-w-[640px]` table inside.

---

## How to test

1. Open Chrome/Safari DevTools → device toolbar.
2. Set viewport to **iPhone 12 / 390×844** (or any width ≤ 440px).
3. For each route below, scroll through every tab (Lesson, Reflection, Quiz, etc.)
   and confirm the **Pass criteria** for any tables that appear.
4. If a table fails, note the day + table heading in the Issues section.

> Tip: you can also use the Lovable preview's mobile icon above the preview
> window instead of DevTools.

---

## Pass criteria (every table must satisfy all 4)

- [ ] **Horizontal scroll works** — swipe left/right on the table reveals hidden
      columns; the rest of the page does **not** scroll horizontally.
- [ ] **Headers stay on one line per word** — column headers like `DAY`, `RING`,
      `ASSIGNMENT` are not broken into one-letter-per-line stacks.
- [ ] **Cell text wraps naturally** — long sentences wrap inside the cell instead
      of forcing a 1-character column.
- [ ] **Container has a visible border + rounded corners** — confirms the
      scrollable wrapper rendered (not the raw `<table>`).

Bonus checks:

- [ ] First column is readable without scrolling (acts as the row label).
- [ ] Tapping a link inside a cell still works after scrolling horizontally.
- [ ] No layout shift when the table loads (e.g. tabs don't jump).

---

## Routes to verify

### Day pages (1–60)

Visit `/learning-track/first-60-days/day/<N>` for each day below. Days marked
with ✱ are known to contain wide tables — verify these first.

| Range | Notes |
|-------|-------|
| Day 1–7 (Week 1) | ✱ Day 3 (RING table), ✱ Day 6 (lecture-notes timestamps) |
| Day 8–14 (Week 2) | ✱ Day 10 (warm-market funnel), ✱ Day 12 (assignment grid) |
| Day 15–21 (Week 3) | ✱ Day 20, Day 21 (objection matrices) |
| Day 22–28 (Week 4) | ✱ Day 23 (product comparison) |
| Day 29–35 (Week 5) | ✱ Day 25, Day 27 (CPF tables) |
| Day 36–42 (Week 6) | ✱ Day 31, Day 32, Day 33, Day 36 |
| Day 43–49 (Week 7) | ✱ Day 40, Day 41 |
| Day 50–56 (Week 8) | — |
| Day 57–60 (Week 9–10) | — |

For each day, check **all tabs**: Lesson · Reflection · Quiz · (Assignment if present).

### Week wrap-ups

Visit each `README.md`-style wrap-up rendered in-app:

- [ ] Week 1 wrap-up
- [ ] Week 2 wrap-up
- [ ] Week 3 wrap-up
- [ ] Week 4 wrap-up
- [ ] Week 5 wrap-up
- [ ] Week 6 wrap-up
- [ ] Week 7 wrap-up
- [ ] Week 8 wrap-up
- [ ] Week 9 wrap-up
- [ ] Week 10 wrap-up

### Assignments

Visit each assignment page (`/learning-track/first-60-days/assignment/<N>`):

- [ ] Assignment 03
- [ ] Assignment 04
- [ ] Assignment 05
- [ ] Assignment 06
- [ ] Assignment 07
- [ ] Assignment 08

---

## Regression smoke test (5 min)

If you only have 5 minutes, hit these 5 high-risk pages — they cover every
table style used in the curriculum:

1. Day 3 — RING table (4-column matrix)
2. Day 10 — warm-market funnel (long row labels)
3. Day 23 — product comparison (5+ columns)
4. Week 4 wrap-up — assignment grid
5. Assignment 06 — submission rubric

If all 5 pass, the global `markdownComponents.table` config is healthy.

---

## Issues found

Log failures here with: route, table heading, viewport width, and what broke.

| Date | Route | Table | Viewport | Issue |
|------|-------|-------|----------|-------|
|      |       |       |          |       |

---

## Where the fix lives

If any table fails the criteria, the fix is almost always in:

- `src/lib/markdown-config.tsx` → `markdownComponents.table` / `th` / `td`
- `src/components/first-60-days/dayMarkdownComponents.tsx` (extends the global
  config — should not override `table`/`th`/`td`)

Do **not** add per-day inline table styling. Fix it once in the global config so
all 60 days + assignments + wrap-ups stay consistent.
