---
title: "Curriculum changes applied — from Appointment Setting module"
status: applied
date: 2026-05-17
type: curriculum-changelog
source: "/product/appointment-setting (ingested at _source-supplementary/appointment-setting-product/)"
tags: [first-60-days, next-60-days, curriculum, changelog, appointment-setting]
---

# Curriculum changes applied — from Appointment Setting module

**Status:** Applied across First 60 Days and Next 60 Days on 2026-05-17.

**What changed:** Ingested 28 essay sections (~97 KB) from `/product/appointment-setting` into `_source-supplementary/appointment-setting-product/`. No duplicates against existing first-60-days sources — the warm-market sources covered warm only; this module is the cold-call + prospecting-mindset companion.

## Applied edits

### First 60 Days

| Day | Section(s) added | Sources cited |
|---|---|---|
| [Day 19](../../week-4/day-19.md) | 30-Day Rule of pipeline gravity (callout in §7); §10 "Where prospecting sits in the five-pillar business" | §5, §9 |
| [Day 27](../../week-5/day-27.md) | §7 QO × ASR × SUR × CR × LTV pipeline math; §8 Skills × Traits × Beliefs bottleneck diagnostic; §9 Remuneration math (FYC, EPS, commission rates, Y1 $90K model) | §7, §16, §19 |
| [Day 39](../../week-7/day-39.md) | §10 Touchpoint timeline — 4 intake questions, NSF milestone map, worked timeline, Google Calendar SOP, working-adult adaptations | §27 |
| [Day 40](../../week-7/day-40.md) | §9 The 5 silent questions every cold prospect asks, scoring rubric, content-brief application | §23, §24 |
| [Day 44](../../week-8/day-44.md) | Top-of-page internal-stance callout — scarcity vs abundance stance, 149-rejections-per-close math | §11 |

### Next 60 Days

| Day | Section(s) added | Sources cited |
|---|---|---|
| [Day 22](../../../next-60-days/week-4/day-22.md) | DNC screening SOP; 30-second cold-call opener structure (3 beats); kill-list of script anti-patterns | §13, §20, §26 |
| [Day 23](../../../next-60-days/week-4/day-23.md) | Cold-call KPI ratio table (dials/hr, pickup, set, show, close); 1 closed case = ~900 dials math; week-block implications | §7, §14 |

## What was intentionally NOT applied

Pre-licensing scope kept the following cold-call mechanics out of First 60 Days. They live only in Next 60 Days:

- §13 (45 Min Telemarketing Overview) — full cold telephony framing
- §14 (KPIs for Cold Calling) — quantitative ratios
- §20 (Cold Calling Training) — opening / relevance / ask structure + objection scripts
- §26 (DNC Check workflow) — operational regulatory
- §0–3 (Compulsory ops tasks: phone number, CRM access) — operational; covered in Next 60 Days Day 22 §"Team operations"

Below: the 7 highest-leverage curriculum changes, each citing the specific source section.

---

## 1. Day 19 — Add the 5 Pillars and the 30-Day Rule

**[[../week-4/day-19|Day 19 — Prospecting: The Lifeblood of Your Business]]** already nails the 30-90 day income lag. Two adds:

- **Sidebar: The 5 Essential Daily Activities** — pull from [[../_source-supplementary/appointment-setting-product/05-prospecting--5-essential-daily-activities-in-financialadvisory|Section 5]]. The clean Lead-Gen → Nurture → Sales → Service → Retention pyramid. Currently day 19 frames *what prospecting is* but not *where prospecting sits inside the larger business*. The 5 pillars give that map.
- **Box: The 30-Day Rule** — pull from [[../_source-supplementary/appointment-setting-product/09-prospecting--obey-the-30-day-rule|Section 9]] (Jeb Blount's 30-Day Rule). Day 19 already says "income is set 30-60 days in advance"; the rule extends that to: *miss a day → bite you in 30 days; miss a week → tank your check; miss a month → 90-day slump*. This is the consistency forcing function the day currently lacks.

**Sources to add to frontmatter `supporting_sources`:**
```yaml
- _source-supplementary/appointment-setting-product/05-prospecting--5-essential-daily-activities-in-financialadvisory.md
- _source-supplementary/appointment-setting-product/09-prospecting--obey-the-30-day-rule.md
```

---

## 2. Day 27 — Cross-link the QO × ASR × SUR × CR × LTV pipeline math

**[[../week-5/day-27|Day 27 — Your Personal Activity Scorecard]]** uses **Activities × Skills × Knowledge = FYC** (Hopkins-style personal-development frame). That works for diagnosing *which capacity* to build. It does NOT tell you *where in the pipeline* the leak is.

Add a "Diagnostic deep-dive" section that introduces the pipeline math from [[../_source-supplementary/appointment-setting-product/07-prospecting--important-levers-in-raising-your-sales-outcomes|Section 7]]:

> **Quantity of Outreach × Appointment Set Rate × Show Up Rate × Close Rate × Lifetime Value = Income**

The two formulas operate on different layers:
- Activities × Skills × Knowledge tells you *what to build in yourself*.
- QO × ASR × SUR × CR × LTV tells you *what to fix in your funnel this week*.

Pair with the Skills/Traits/Beliefs bottleneck frame from [[../_source-supplementary/appointment-setting-product/16-prospecting--identifying-bottlenecks-in-your-pipeline|Section 16]] — *"a clogged pipeline doesn't need more water pressure, it needs a clear path."*

**Specific add:** A new sub-section between current §2 ("the three factors") and §3, titled **"§2b — Where in the funnel are you losing them?"** with the 5-lever formula table, a worked example (200 calls × 5% × 30% × 30% × $5K LTV = $5K/week), and a one-line diagnostic ("set rate low → outreach quality; show rate low → reminder discipline; close rate low → skills/conviction; LTV low → service & retention").

---

## 3. NEW Day 25.5 (or Day 27 sidebar) — Remuneration Calculations

**The biggest single gap.** No existing day in first-60-days teaches new FCs how AIA commissions are actually calculated. [[../_source-supplementary/appointment-setting-product/19-prospecting--remuneration-calculations|Section 19]] has the full math — FYC vs EPS, commission rates per product (APA 35% Y1 → 1.5% perpetual; GPP 40% Y1 → 1.5% perpetual; PA 30% perpetual stacking), Year-1 conservative target ($36K FYC → ~$90K total income).

**Recommendation:** Insert as a half-day box on **[[../week-5/day-25|Day 25 — Weekly Team Rhythms]]** or new **Day 25.5**. Reasoning: new FCs hit the productivity / scorecard discipline (Days 25-27) without a clear picture of what commissions they're actually working toward. Adding the remuneration math here closes the loop.

Alternative placement: as **Assignment 03** ("Model your Year-1 income at 3 activity levels"). Currently asgn-03 is unspecified — see [[../assignments/]] folder.

---

## 4. Day 39 / Day 40-41 — Add Social-Media-Branding's 5 Questions

**[[../week-7/day-39|Day 39 — Building the Prospect List]]** covers list-building. **[[../week-7/day-40|Day 40]]** and **[[../week-7/day-41|Day 41]]** cover digital presence (Spartans 24/27 decks). They cover *what to post*; they do not currently frame *the trust-questions the prospect is silently asking*.

[[../_source-supplementary/appointment-setting-product/24-social-media--5-questions-to-answer-on-social-media|Section 24]] gives the 5 questions every cold prospect subconsciously asks before DMing:

1. Can I trust that others value your work? → testimonials (pre-during-post format)
2. Do you actually know your stuff? → expertise vs jargon
3. Why are you doing this? → personal "why" stories
4. Will we get along? → personality, interests, quirks
5. How can I approach you without feeling awkward? → low-friction CTA / offer posts

This is a much cleaner *content-audit framework* than the Spartans deck's "post regularly" advice. Add as Day 40 §2 or Day 41 §2 — "Audit your bio + last 10 posts against the 5 questions. Which scores zero?"

Pair with [[../_source-supplementary/appointment-setting-product/23-social-media--cold-prospecting-on-social-media|Section 23]] (Cold Prospecting on Social Media) — full DM-flow vs the bio/post-level frame.

---

## 5. Day 44 — Add "Loving Rejections" as the rejection-resilience reading

**[[../week-8/day-44|Day 44 — Handling Resistance & Objections]]** comes from MAP 3 deck (tactical objection-handling). It does not have a mindset essay on rejection itself.

Add [[../_source-supplementary/appointment-setting-product/11-prospecting--loving-rejections|Section 11 — Loving Rejections]] (4.7 KB) as supporting source — the "rejection is the pricing of activity" essay. This pairs with the [[../../../New project/.claude/projects/-Users-leo-Documents-New-project/memory/project_next_60_days_ratios|100+ rejections per sale ratio]] in next-60-days. New FCs need both the *script* (Day 44 main content) and the *internal stance* (Section 11) to actually execute the script when it hurts.

---

## 6. Week 7 OR new Week 9.5 — Touch Points cadence

**The hidden gold.** [[../_source-supplementary/appointment-setting-product/27-resources--resource-touch-points|Section 27]] (7.5 KB) is the most concrete piece in the whole module: a full NSF touchpoint map (Enlistment → First Book-Out → POP → Posting Results → SCS/OCS → ORD → Uni Start → Each Semester → Graduation), with exact dates/durations (BMT=2mo, SCS=6mo, OCS=9mo, Uni=4y May→Aug), the exact 4 onboarding questions ("when's your POP? when's your ORD?") that let you extrapolate the entire timeline, and the per-touchpoint message templates.

**Current curriculum gap:** Nothing teaches new FCs how to **stay top-of-mind for 4-10 years** between first conversation and first sale. Day 19 alludes to it ("be the person they already know on the day life shifts") but doesn't equip the FC with a cadence.

**Two placement options:**

- **A. Append to Day 39 (Project 100):** Add §6 "After the first conversation: building the touchpoint timeline." Cite the 4 questions, the milestone map, the recurring-event setup.
- **B. New Day in Week 5 or Week 9** (less disruptive: maybe Day 30 capstone "Building a 5-year nurture machine"). NSF cadence + working-adult adaptations (job anniversary, birthday, policy review window).

Recommendation: **A** (Day 39 §6) because Project 100 is exactly where the FC sits down to populate names and dates. Touch-point planning belongs in the same sitting.

---

## 7. Cross-reference: Pipeline bottleneck diagnosis as Week 5 capstone

**[[../week-5/day-27|Day 27]]** ends with the Activities × Skills × Knowledge formula. Currently no day file teaches the **Skills × Traits × Beliefs** bottleneck-fixing model from [[../_source-supplementary/appointment-setting-product/16-prospecting--identifying-bottlenecks-in-your-pipeline|Section 16]].

The two are complementary:
- **Activities × Skills × Knowledge** is the *output formula* (what you produce).
- **Skills × Traits × Beliefs** is the *bottleneck-fixing trio* (where to invest to lift the production).

If Day 27 is the **scorecard** (what to measure), there's room for a Day 30-end "where to invest" reflection prompt that walks the new FC through Section 16's diagnostic:
1. Where are people dropping off? (pipeline diagnostic — uses §2's QO×ASR×SUR×CR×LTV from improvement #2)
2. Is the bottleneck a **skill issue** (need reps + coaching), a **trait issue** (need systems forcing consistency), or a **belief issue** (need reframe)?
3. What's your one-week intervention to fix it?

Could be a Day 30 reflection worksheet add, or rolled into the existing recap.

---

## Summary table

| # | Day(s) | Add | Source section | Effort |
|---|---|---|---|---|
| 1 | Day 19 | 5 Pillars sidebar + 30-Day Rule box | §5, §9 | S |
| 2 | Day 27 | QO×ASR×SUR×CR×LTV pipeline math | §7 (27 KB — pick highlights) | M |
| 3 | Day 25 or new Day 25.5 | Remuneration calculations | §19 | M |
| 4 | Days 40-41 | 5 trust questions for social bio/feed audit | §24 + §23 | S |
| 5 | Day 44 | "Loving Rejections" essay link | §11 | S |
| 6 | Day 39 §6 | NSF touchpoint cadence + 4-question intake | §27 | M |
| 7 | Day 27 / Day 30 | Skills × Traits × Beliefs bottleneck diagnostic | §16 | S |

**Effort key:** S = ~1 hour insert/cross-link. M = ~2-3 hours new content distillation.

---

## What was intentionally NOT proposed for first-60-days

Pre-licensing scope means cold-call mechanics are out of scope:

- **§13 (45 Min Overview of Telemarketing)** and **§14 (KPIs to Hit for Cold Calling)** — belongs in [[../../next-60-days/week-4/day-22|Next 60 Days Day 22]]. Add there, not here.
- **§20 (Cold Calling Training)** — full cold script. Same; Next 60 Days.
- **§26 (DNC Check workflow)** — operational, post-licensing. Next 60 Days.
- **§0-3 (Compulsory ops tasks: phone number, CRM)** — too specific to post-licensing onboarding. Optional add to a Next 60 Days Day 1 ops checklist.

---

## Next step

Pick which of the 7 to land first. Smallest blast radius / highest leverage: **#1, #4, #5** (all marked S). Highest single-day improvement: **#3 (Remuneration)** because it fills a structural gap, not just adds polish.
