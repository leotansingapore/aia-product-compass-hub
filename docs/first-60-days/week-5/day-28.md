---
week: 5
day: 28
title: "Time Value of Money — The Core Concept"
primary_source: internal-reference
primary_slides: "n/a"
supporting_sources:
  - internal-reference
duration_minutes: 20
tags: [first-60-days, week-5, knowledge]
---

# Day 28 — Time Value of Money: The Core Concept

> **The one idea for today:** A dollar today is worth more than a dollar tomorrow. Not because of inflation — because today's dollar can start working. Every client conversation you'll have for the rest of your career sits on top of this one idea.

## What you'll walk away with

By the end of today you should be able to:

1. **Explain** TVM to a non-financial person in 60 seconds.
2. **Identify** the 5 variables (n, i, PV, PMT, FV) and what each one represents.
3. **Use** a financial calculator (or app) to solve a basic TVM problem.

---

## 1. The concept in plain language

Suppose a friend says: "I'll give you $10,000 today, **or** $10,000 in 10 years. Which do you want?"

Most people say "today" instinctively. Good instinct. But **why**?

Three reasons:

1. **Uncertainty.** A lot can happen in 10 years — they could change their mind, die, or disappear.
2. **Inflation.** $10,000 in 10 years probably buys less than $10,000 today.
3. **Opportunity cost.** $10,000 today can be invested and grow. If you earn 6% p.a., $10,000 today becomes ~$17,908 in 10 years. You'd need **$17,908** in 10 years to be equivalent to $10,000 today.

**Time Value of Money** is this last insight formalised: **money has a time dimension.** A dollar in hand now is not just a dollar — it's a dollar × (1 + growth)^years.

## 2. Why this matters for every client

Every financial product you'll ever sell is solving a TVM problem.

| Client situation | TVM question |
|---|---|
| "I want to retire at 65" | "What's the FV of my current savings + future contributions?" |
| "I need $500K for my kid's education in 18 years" | "What PV / PMT do I need to start now?" |
| "My AIA plan projects $120K at age 60" | "What's the implied interest rate (i)?" |
| "Inflation is 2% — what does that mean for me?" | "What's the real (inflation-adjusted) rate of return?" |
| "Should I take the monthly annuity or the lump sum?" | "Compare their present values." |

If you can't run these calculations, you can't have meaningful client conversations. You're stuck with marketing language.

## 3. The 5 variables

Every TVM problem has 5 variables. You solve for 1 when you know the other 4.

| Variable | What it means | Typical unit |
|---|---|---|
| **n** | Number of periods (years, months) | Integer |
| **i** | Interest rate per period | % per period |
| **PV** | Present Value (value today) | $ |
| **PMT** | Periodic payment (regular contribution) | $/period |
| **FV** | Future Value (value at end) | $ |

**Sign convention (critical):**
- Money flowing **out** of you (payments, premiums) = **negative**.
- Money flowing **in** to you (withdrawals, payouts) = **positive**.

Getting signs wrong is the #1 cause of TVM errors. Treat it strictly.

## 4. Financial calculators — the tool

You need one. The standard options for Singapore FCs:

- **Casio FC-100V** (hardware) — industry default.
- **Sharp EL-735** or **EL-733A** — also common.
- **iOS app:** Financial Calculator V.2.0 by BiShi Team.
- **Android app:** Financial Calculators by Bishinews.

**Buy the app tonight if you don't have a physical calculator.** Cost: a few dollars. Learning it is 30 minutes.

### The five keys you'll use 95% of the time

```
 n i PV PMT FV
```

Plus two modes:
- **END mode** — payments at the end of each period (common for loans, investments).
- **BGN mode** — payments at the beginning of each period. **Most insurance policies use BGN mode.** Get used to it.

## 5. A worked example — the "Life Plus" scenario

Here's a classic insurance TVM question from the AIA sample curriculum.

**Scenario:**
Susan, age 26, buys a Life Plus policy. Annual premium: **$807**. At age 60, she gets back **$53,257**.

**Question:** What's the projected interest rate she's earning?

**Setup:**
- **n** = 34 years (age 26 to age 60).
- **PMT** = −$807 (she pays this yearly; money out = negative).
- **FV** = $53,257 (she receives this; money in = positive).
- **PV** = 0 (she's not starting with a lump sum).
- **Mode:** BGN (insurance premiums usually begin-of-year).
- **Solve for:** i

**Answer:** i ≈ **3.52% p.a.**

**The advisor insight:**
When a client asks "what's the real return on this plan?", you can answer in 30 seconds with your calculator. That's the difference between sounding knowledgeable and sounding like a salesperson.

## 6. Another example — planning backwards from retirement

**Scenario:**
Nancy, age 25, wants a retirement fund of **$250,000** at age 60. She likes a plan projecting **4% p.a.** return. What annual premium does she need?

**Setup:**
- **n** = 35 (age 25 to 60).
- **i** = 4% p.a.
- **FV** = $250,000.
- **PV** = 0.
- **Mode:** BGN.
- **Solve for:** PMT.

**Answer:** PMT ≈ **−$3,264/year** (negative because she pays it out).

**Reframe for the client:** "To have $250,000 at 60, you need to set aside about $272/month, starting today. Every year you delay, that monthly amount goes up by roughly 10%."

## 7. Inflation-adjusted returns

Clients will ask: "If my plan returns 4% and inflation is 2%, what's my real return?"

### Simplified formula
> **Real rate ≈ Nominal rate − Inflation rate** = 4% − 2% = **2%**

### Actual formula (more accurate)
> **Real rate = (1 + nominal)/(1 + inflation) − 1** = (1.04/1.02) − 1 ≈ **1.96%**

For most client conversations, the simplified version is fine. For technical work, use the actual formula.

**The rule of thumb for Singapore clients:** assume 2% inflation on living expenses. Anything returning less than 2% real is losing purchasing power.

## 8. What TVM is not

A warning:

TVM is a **calculation tool**, not an investment philosophy.

- It assumes a stable rate of return. Real markets are volatile (that's why DCA exists — Day 30).
- It doesn't account for tax drag, fees, or behaviour.
- It doesn't guarantee the illustrated rate on any product.

Use TVM to **project scenarios** and **compare options.** Don't use it to promise outcomes.

---

## Reflection worksheet

**1. Install a financial calculator app tonight. Solve the Susan example to confirm it works.**
> If you can't replicate i ≈ 3.52%, something's off. Check BGN mode, signs, and input order.

**2. Write your own TVM scenario using your own numbers.**
> Your age, target retirement fund, plausible interest rate. Calculate the annual premium needed.

**3. Explain TVM to a non-financial friend in 60 seconds (aloud).**
> If they look confused, simplify. If they say "oh I get it," you've got the level right.

---

## Quick quiz

1. **What are the five TVM variables?**
 - A) n, i, PV, PMT, FV ✓
 - B) PV, FV, inflation, rate, term
 - C) Principal, Interest, Payment, Return, Term
 - D) Now, Interest, Present, Payment, Forecast

2. **Sign convention: money flowing OUT of you is:**
 - A) Positive
 - B) Negative ✓
 - C) Doesn't matter
 - D) Zero

3. **What mode do most insurance policies use?**
 - A) END (payments at end of period)
 - B) BGN (payments at beginning of period) ✓
 - C) No mode needed
 - D) Simple interest mode

---

## Related

- Previous: [[day-27|Day 27 — Your Personal Activity Scorecard]]
- Next: [[day-29|Day 29 — Compounding: The 8th Wonder]]
