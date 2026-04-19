---
week: 6
day: 31
title: "Present Value & Discounting"
primary_source: internal-reference
primary_slides: "n/a"
supporting_sources: []
duration_minutes: 20
tags: [first-60-days, week-6, knowledge]
---

# Day 31 — Present Value & Discounting

> **The one idea for today:** Future Value asks "where will this money end up?" Present Value asks "how much do I need today to get there?" Clients almost always need the second question answered — and most advisors struggle to do it.

## What you'll walk away with

By the end of today you should be able to:

1. **Solve** for Present Value using the financial calculator.
2. **Apply** discounting to convert a future goal into a today's-dollar requirement.
3. **Compare** a lump-sum investment to a regular savings plan — and explain which is better for a given client.

---

## 1. The two directions of TVM

Time Value of Money problems run in two directions:

**Forward (Future Value):**
> "I invest $X today for Y years at Z% — what do I end up with?"
- Input: PV, n, i
- Output: FV

**Backward (Present Value):**
> "I want $X in Y years at Z% — how much do I need today?"
- Input: FV, n, i
- Output: PV

Most retirement and education planning runs **backward.** Clients know the target (retirement income, college tuition), and need to know **what to do today.**

## 2. Present Value — worked example

**Scenario:**
Nancy, age 25, wants to have **$250,000 at age 60.** She's considering a **single premium investment plan** projected at **9% p.a.** How much does she need to invest today (lump sum)?

**Setup:**
- FV = $250,000
- n = 35 years
- i = 9%
- PMT = 0 (single premium, no regular payments)
- **Solve for PV**

**Answer:** PV ≈ **−$12,247**

(Negative because the money flows *out* of Nancy today. The calculator returns the sign consistent with cash flow convention.)

**Reading:** "If Nancy has $12,247 today and invests at a projected 9% p.a., she could reach $250,000 by age 60."

### The insight

A **single $12,247 lump sum** does the job of **$3,264/year × 35 years = $114,240** in yearly contributions at 4%.

The lump sum approach works if:
- Client has capital sitting in a bank account.
- Client can tolerate the return assumption being non-guaranteed.
- Client won't touch the money for 35 years.

For a client with both cash and discipline, a lump sum can dramatically reduce total outlay — because the money compounds for longer on the larger starting base.

## 3. Lump sum vs regular premium — the comparison

Most clients have a choice: pay a large lump sum once, or pay smaller regular premiums. Let's compare using Nancy's target.

| Approach | Rate | n | Required input | Total outlay | Capital at 60 |
|---|---:|---:|---:|---:|---:|
| Lump sum | 9% | 35 | $12,247 (PV) | $12,247 | $250,000 |
| Annual premium | 4% | 35 | $3,264/year (PMT, BGN) | $114,240 | $250,000 |
| Annual premium | 6% | 35 | $2,017/year (PMT, BGN) | $70,595 | $250,000 |
| Annual premium | 9% | 35 | $958/year (PMT, BGN) | $33,530 | $250,000 |

**Observations:**

1. **Higher rate = less required capital.** The rate assumption matters enormously.
2. **Lump sum beats regular at the same rate.** A $12,247 lump sum at 9% produces the same result as $33,530 in annual premiums at 9%. The difference is compounding time on the full amount.
3. **Regular premium is more accessible.** Most 25-year-olds don't have $12,247 sitting unused.

**Your job:** help the client pick the option that **fits their reality** — not the one that looks mathematically optimal on paper.

## 4. Discounting — the concept

**Discounting** is the reverse of compounding. It converts a future dollar amount into its **today's-dollar equivalent**, using a discount rate.

**Formula:**
> **PV = FV / (1 + i)^n**

**Example:** $100,000 needed in 10 years, at 6% discount rate:
> PV = $100,000 / (1.06)^10 ≈ **$55,840**

**Meaning:** $55,840 today, invested at 6%, becomes $100,000 in 10 years.

### When discounting matters for clients

1. **Goal planning:** "$500K for my kid's education in 18 years" → discount back to know the required contribution today.
2. **Comparing options:** "Take $500K lump sum at retirement, or $30K/year for 20 years?" → discount both to today's dollars and compare.
3. **Business valuation:** the reason most businesses are valued using DCF (discounted cash flow).
4. **Insurance payouts:** a $500K death benefit in 30 years has a PV of only ~$175K today at 4%. Important when comparing term vs permanent insurance.

## 5. A client conversation using PV

**Scenario:** A 40-year-old client wants $1M for retirement at 65. He asks: "Can I really get there?"

Without a financial calculator, you'd be stuck saying "let's see" or "yes probably."

With 60 seconds on the calculator:
- FV = $1,000,000
- n = 25
- i = 6%
- **Solve for PMT (BGN):** ≈ **−$1,518/month**

**Your answer:**
> "At a 6% projected return, you'd need to set aside about $1,520 a month, starting now, for 25 years. If you can manage that, yes — you get there. If not, we either adjust the target, extend the timeline, or look at higher-return vehicles (with more risk). Which would you like to explore?"

This is **instant credibility.** You're not guessing. You're showing him the math.

## 6. The multiple-goal client

Real clients don't have one goal. They have three or four:

| Goal | FV | Years away | Discount rate | PV / monthly PMT |
|---|---:|---:|---:|---|
| Retirement | $1M | 25 | 6% | $1,518/mo |
| Kids' tertiary education | $200K | 12 | 5% | $1,150/mo |
| House downpayment | $150K | 5 | 3% | $2,322/mo |
| Parents' medical fund | $80K | 10 | 4% | $550/mo |

**Total required:** ~$5,540/month across all goals. Client's disposable savings capacity: $3,000/month.

**The math surfaces the trade-off.** The client can't hit all four without either:
- Extending timelines,
- Accepting lower return estimates,
- Reducing target amounts,
- Or finding more income.

Without the math, you have a feelings conversation. With the math, you have a **decision conversation.**

## 7. The common mistake — ignoring the time horizon

New FCs sometimes quote aggressive rates (e.g., 8% for all scenarios). This creates two problems:

1. **Short horizons (< 5 years)** — markets can be volatile, and using 8% is wildly optimistic.
2. **Risk tolerance mismatch** — the rate assumes the client can stomach volatility, which they often can't at older ages.

**Rule of thumb (rough):**

| Timeline | Reasonable rate assumption |
|---|---|
| Under 3 years | 1–3% (stay conservative; cash/bonds) |
| 3–7 years | 3–5% (balanced) |
| 7–15 years | 4–6% (growth-oriented) |
| 15+ years | 5–7% (equity-heavy) |

Adjust for client risk tolerance. When in doubt, **illustrate multiple scenarios** (conservative, moderate, aggressive).


## Quick quiz

1. **Present Value answers the question:**
 - A) What will this money be worth in the future?
 - B) How much do I need today to reach a future target? ✓
 - C) What's the historical return?
 - D) What's the inflation-adjusted return?

2. **A lump sum and a regular premium with the same rate and target differ because:**
 - A) Regular premiums are taxed differently
 - B) The lump sum compounds for longer on the full amount ✓
 - C) Regular premiums are always cheaper
 - D) Lump sums are riskier

3. **For a 3-year goal, which rate assumption is most reasonable?**
 - A) 8% (aggressive equity)
 - B) 1–3% (cash/bonds) ✓
 - C) 6% (balanced)
 - D) Inflation-matching

4. **Nancy needs $250,000 at age 60, is currently 25, and the plan projects 9% p.a. Using PV discounting, the lump sum required today is closest to:**
 - A) $25,000
 - B) $12,247 ✓
 - C) $50,000
 - D) $114,240

5. **A 40-year-old client wants $1M at 65 and asks "Can I get there?" You run the calculator at 6% over 25 years. The most useful output to show first is:**
 - A) The final FV confirmation of $1M
 - B) The required monthly PMT so they can judge affordability ✓
 - C) The discount rate needed to reach $1M with no effort
 - D) The historical equity market return

6. **A client has four financial goals totalling $5,540/month but only $3,000/month in savings capacity. The best advisor response is to:**
 - A) Tell the client to invest more aggressively to close the gap with higher returns
 - B) Ignore the lower-priority goals and focus on retirement only
 - C) Use the math to surface the trade-off and discuss extending timelines, reducing targets, or increasing income ✓
 - D) Recommend a lump-sum investment to replace all regular savings

7. **Why does a lump-sum investment at 9% outperform annual premiums at 9% targeting the same final amount?**
 - A) Lump sums attract lower fees
 - B) The full lump-sum amount compounds from day one, whereas regular premiums are still being built up over time ✓
 - C) Annual premiums carry insurance risk that reduces net returns
 - D) The calculator uses END mode for lump sums, which inflates the result

---

## Related

- Previous: [[../week-5/day-30|Day 30 — Dollar Cost Averaging]]
- Next: [[day-32|Day 32 — Rule of 72 Applied]]
