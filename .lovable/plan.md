
## Current state
The Concept Cards Focus Mode already has:
- Binary "Know it / Review later" rating (2 options)
- Session-only progress (in-memory, resets on close)
- Keyboard shortcuts
- Dot navigation + progress bar

What Anki does that this doesn't:
1. **Spaced Repetition Scheduling** — cards due today based on last review + performance
2. **Multi-grade rating** — Again / Hard / Good / Easy (4 grades, not 2)
3. **Persistent progress** — reviews saved across sessions
4. **Due card queue** — "X cards due today"
5. **Streak / session stats** — reviewed today, daily target
6. **Shuffle mode** — randomise card order

---

## What I'd recommend building (prioritised)

### Option A — Lightweight (no DB changes)
**Persistent ratings + Shuffle mode**
- Save `knownIds` / `reviewIds` per user in `localStorage` (persist across sessions)
- Add a **Shuffle** button on the cards page
- This gives 80% of the benefit with zero backend work

### Option B — Full Anki-style Spaced Repetition (recommended)
1. **New DB table**: `concept_card_reviews` — stores per-user, per-card: `ease_factor`, `interval_days`, `due_date`, `last_grade`
2. **4-grade rating** in Focus Mode: `Again` / `Hard` / `Good` / `Easy` — replaces the current binary buttons
3. **SM-2 algorithm** — compute next interval from grade + ease factor (standard Anki algorithm)
4. **Due card queue** — "Study Due Cards" button on the main page showing N cards due today
5. **Daily stats** — small badge showing "5 due · 3 reviewed today"

---

## Plan: Full Spaced Repetition

### Database
New migration: `concept_card_reviews` table
```text
id            uuid PK
user_id       uuid → auth.users
card_id       uuid → concept_cards
ease_factor   float  (default 2.5, Anki standard)
interval_days int    (days until next review, starts at 1)
due_date      date   (next review date)
last_grade    text   (again | hard | good | easy)
reviewed_at   timestamptz
```
RLS: users can only read/write their own rows.

### Algorithm (SM-2 simplified)
```text
Again → interval = 1,    ease -= 0.2
Hard  → interval = max(1, interval * 1.2),  ease -= 0.15
Good  → interval = interval * ease
Easy  → interval = interval * ease * 1.3,   ease += 0.15

ease clamped to [1.3 – 2.5]
due_date = today + interval
```

### New hook: `useSpacedRepetition(cards)`
- Loads review rows for current user + these cards
- Exposes: `dueCards`, `allReviews`, `gradeCard(cardId, grade)`, `isDue(cardId)`, `reviewStats`
- `gradeCard` upserts into `concept_card_reviews`

### Focus Mode changes
- Replace "Review later / Know it" buttons with 4 coloured buttons:
  - 🔴 **Again** · 🟠 **Hard** · 🟢 **Good** · 🔵 **Easy**
- Show interval preview under each button ("1d · 3d · 6d · 10d")
- Keyboard: `1/2/3/4` for grades, `Space` still flips
- After grading, auto-advance to next card

### Main page changes
- Add **"📅 Study Due (N)"** button next to Quiz Mode — filters to only due cards
- Small stats row: "Due today: 5 · Reviewed today: 12 · Streak: 3 days 🔥"

### Files to create/edit
1. `supabase/migrations/` — new table + RLS
2. `src/hooks/useSpacedRepetition.ts` — new hook
3. `src/components/concept-cards/ConceptCardFocusMode.tsx` — 4-grade buttons + interval hints
4. `src/pages/ConceptCards.tsx` — due card queue button + stats strip
