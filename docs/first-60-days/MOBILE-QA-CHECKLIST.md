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

Tick each day after verifying **all tabs** (Lesson · Reflection · Quiz · Assignment if present) pass the 4 criteria above. Days marked ✱ are known to contain wide tables — verify these first.

#### Week 1 (Day 1–7)

- [ ] Day 1 — Lesson · Reflection · Quiz
- [ ] Day 2 — Lesson · Reflection · Quiz
- [ ] Day 3 ✱ — Lesson · Reflection · Quiz (RING table)
- [ ] Day 4 — Lesson · Reflection · Quiz
- [ ] Day 5 — Lesson · Reflection · Quiz
- [ ] Day 6 ✱ — Lesson · Reflection · Quiz (lecture-notes timestamps)
- [ ] Day 7 — Lesson · Reflection · Quiz

#### Week 2 (Day 8–14)

- [ ] Day 8 — Lesson · Reflection · Quiz
- [ ] Day 9 — Lesson · Reflection · Quiz
- [ ] Day 10 ✱ — Lesson · Reflection · Quiz (warm-market funnel)
- [ ] Day 11 — Lesson · Reflection · Quiz
- [ ] Day 12 ✱ — Lesson · Reflection · Quiz · Assignment (assignment grid)
- [ ] Day 13 — Lesson · Reflection · Quiz
- [ ] Day 14 — Lesson · Reflection · Quiz

#### Week 3 (Day 15–21)

- [ ] Day 15 — Lesson · Reflection · Quiz
- [ ] Day 16 — Lesson · Reflection · Quiz
- [ ] Day 17 — Lesson · Reflection · Quiz
- [ ] Day 18 — Lesson · Reflection · Quiz
- [ ] Day 19 — Lesson · Reflection · Quiz
- [ ] Day 20 ✱ — Lesson · Reflection · Quiz (objection matrix)
- [ ] Day 21 ✱ — Lesson · Reflection · Quiz (objection matrix)

#### Week 4 (Day 22–28)

- [ ] Day 22 — Lesson · Reflection · Quiz
- [ ] Day 23 ✱ — Lesson · Reflection · Quiz (product comparison)
- [ ] Day 24 — Lesson · Reflection · Quiz
- [ ] Day 25 ✱ — Lesson · Reflection · Quiz (CPF table)
- [ ] Day 26 — Lesson · Reflection · Quiz
- [ ] Day 27 ✱ — Lesson · Reflection · Quiz (CPF table)
- [ ] Day 28 — Lesson · Reflection · Quiz

#### Week 5 (Day 29–35)

- [ ] Day 29 — Lesson · Reflection · Quiz
- [ ] Day 30 — Lesson · Reflection · Quiz
- [ ] Day 31 ✱ — Lesson · Reflection · Quiz
- [ ] Day 32 ✱ — Lesson · Reflection · Quiz
- [ ] Day 33 ✱ — Lesson · Reflection · Quiz
- [ ] Day 34 — Lesson · Reflection · Quiz
- [ ] Day 35 — Lesson · Reflection · Quiz

#### Week 6 (Day 36–42)

- [ ] Day 36 ✱ — Lesson · Reflection · Quiz
- [ ] Day 37 — Lesson · Reflection · Quiz
- [ ] Day 38 — Lesson · Reflection · Quiz
- [ ] Day 39 — Lesson · Reflection · Quiz
- [ ] Day 40 ✱ — Lesson · Reflection · Quiz
- [ ] Day 41 ✱ — Lesson · Reflection · Quiz
- [ ] Day 42 — Lesson · Reflection · Quiz

#### Week 7 (Day 43–49)

- [ ] Day 43 — Lesson · Reflection · Quiz
- [ ] Day 44 — Lesson · Reflection · Quiz
- [ ] Day 45 — Lesson · Reflection · Quiz
- [ ] Day 46 — Lesson · Reflection · Quiz
- [ ] Day 47 — Lesson · Reflection · Quiz
- [ ] Day 48 — Lesson · Reflection · Quiz
- [ ] Day 49 — Lesson · Reflection · Quiz

#### Week 8 (Day 50–56)

- [ ] Day 50 — Lesson · Reflection · Quiz
- [ ] Day 51 — Lesson · Reflection · Quiz
- [ ] Day 52 — Lesson · Reflection · Quiz
- [ ] Day 53 — Lesson · Reflection · Quiz
- [ ] Day 54 — Lesson · Reflection · Quiz
- [ ] Day 55 — Lesson · Reflection · Quiz
- [ ] Day 56 — Lesson · Reflection · Quiz

#### Week 9–10 (Day 57–60)

- [ ] Day 57 — Lesson · Reflection · Quiz
- [ ] Day 58 — Lesson · Reflection · Quiz
- [ ] Day 59 — Lesson · Reflection · Quiz
- [ ] Day 60 — Lesson · Reflection · Quiz

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
