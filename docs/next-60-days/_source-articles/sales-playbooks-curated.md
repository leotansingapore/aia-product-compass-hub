---
title: "Sales Playbooks — Curated Playbooks & Flows"
topic: "3 curated playbook compilations + useful call/text flow diagrams (Cold Lead to Meeting, NSF Outreach, No-Reply Recovery, Post-Meeting Nurture)."
source: "Product Compass DB — script_playbooks (3) + script_playbook_items (29) + script_flows (12, dedup). Exported 2026-04-21."
ingested: 2026-04-21
status: inbox
course: your-next-60-days
suggested_placement:
  - "Module hub — bundles scripts into role-based playbooks"
  - "Young Adults playbook is directly usable; Derek's Playbook and First Test are sample/template"
tags: [inbox, curated-playbooks, flows, sales, next-60-days]
---

# Sales Playbooks — Curated Playbooks & Flows

## Curated Playbooks

### Young Adults

1. **Cold Calling — Freebie Lead from Facebook ($20 Voucher)** — `cold-calling` / `young-adult` → see [sales-playbooks-scripts.md](sales-playbooks-scripts.md)
2. **Phrasing Tips — What to Avoid & What to Say Instead** — `tips` / `general` → see [sales-playbooks-scripts.md](sales-playbooks-scripts.md)
3. **Post-Call Text — Young Adults (All Angles)** — `post-call-text` / `young-adult` → see [sales-playbooks-scripts.md](sales-playbooks-scripts.md)
4. **Appointment Reminder Texts — Young Adults (D-7 / D-1 / Day Of)** — `confirmation` / `young-adult` → see [sales-playbooks-scripts.md](sales-playbooks-scripts.md)
5. **Graceful Close — Not Interested / End of Conversation** — `follow-up` / `general` → see [sales-playbooks-scripts.md](sales-playbooks-scripts.md)
6. **Warm Market — Introduction Text (New Consultant)** — `cold-calling` / `warm-market` → see [sales-playbooks-scripts.md](sales-playbooks-scripts.md)

### Derek's Playbook

1. **Initial Text — Facebook Voucher Lead (Just Opted In)** — `initial-text` / `young-adult` → see [sales-playbooks-scripts.md](sales-playbooks-scripts.md)
2. **Meeting Confirmation Text — Pre-Retiree (All Versions)** — `confirmation` / `pre-retiree` → see [sales-playbooks-scripts.md](sales-playbooks-scripts.md)
3. **Post-Call Text — Facebook Ad CPF Lead** — `post-call-text` / `pre-retiree` → see [sales-playbooks-scripts.md](sales-playbooks-scripts.md)
4. **Follow-Up Nudge — FB Lead (Pre-Retiree, Called Multiple Times)** — `follow-up` / `pre-retiree` → see [sales-playbooks-scripts.md](sales-playbooks-scripts.md)
5. **Objection Handling — Cost of Delay (Time vs Money) - Pre-Retirees** — `objection-handling` / `working-adult` → see [sales-playbooks-scripts.md](sales-playbooks-scripts.md)
6. **Meeting Opening — Intent and Value Statement** — `sales-scripts` / `general` → see [sales-playbooks-scripts.md](sales-playbooks-scripts.md)
7. **Rescheduling Text — Pre-Retiree (Missed Session)** — `follow-up` / `pre-retiree` → see [sales-playbooks-scripts.md](sales-playbooks-scripts.md)

### First Test

1. **Zoom Appointment Reminder Confirmation** — `confirmation` / `general` → see [sales-playbooks-scripts.md](sales-playbooks-scripts.md)


---

## Useful Flows

Of the 12 script_flow rows in the DB, 6 are unique and 4 are non-trivial (>3 nodes). Node/edge structure preserved below in JSON for anyone rebuilding them.

### Cold Lead → Meeting

**8 nodes, 7 edges.** Visual node-based call/text flow.

**Nodes:**
- `start` Send Initial Text
- `script` Make Cold Call
- `decision` Did They Answer?
- `script` Post-Call Text (Interested)
- `script` Post-Call Text (Not Interested)
- `script` Follow-Up Day 2
- `end` Meeting Booked ✓
- `end` Mark as Cold

**Edges:**
- n1 → n2 *(Next day)*
- n2 → n3
- n3 → n4 *(Yes)*
- n3 → n5 *(No)*
- n4 → n6 *(No reply)*
- n6 → n7 *(Confirmed)*
- n5 → n8

---

### NSF Outreach Flow

**8 nodes, 8 edges.** Visual node-based call/text flow.

**Nodes:**
- `start` Cold Call (NSF Angle)
- `decision` Serving NS?
- `script` Offer Adulting Guidebook
- `script` Offer General Guidebook
- `decision` Interested?
- `script` Send WhatsApp Details
- `end` Thank & Close
- `end` Book Meetup

**Edges:**
- n1 → n2
- n2 → n3 *(Yes (NSF))*
- n2 → n4 *(No)*
- n3 → n5
- n4 → n5
- n5 → n6 *(Yes)*
- n5 → n7 *(No)*
- n6 → n8

---

### No-Reply Recovery

**9 nodes, 9 edges.** Visual node-based call/text flow.

**Nodes:**
- `start` Initial Message Sent
- `action` Wait 2 Days
- `script` 1st Follow-Up
- `decision` Got Reply?
- `end` Book Meeting
- `script` 2nd Follow-Up
- `decision` Got Reply?
- `script` 3rd Follow-Up (Final)
- `end` Mark as No Reply in CRM

**Edges:**
- n1 → n2
- n2 → n3
- n3 → n4
- n4 → n5 *(Yes)*
- n4 → n6 *(No Reply)*
- n6 → n7
- n7 → n5 *(Yes)*
- n7 → n8 *(No Reply)*
- n8 → n9

---

### Post-Meeting Nurture

**7 nodes, 6 edges.** Visual node-based call/text flow.

**Nodes:**
- `start` Send Post-Meeting Text
- `script` Share Resources & Links
- `action` Wait 2 Days
- `script` Ask for Referral
- `decision` Got Referral?
- `script` Follow Up with Referral
- `end` Schedule Check-In

**Edges:**
- n1 → n2
- n2 → n3
- n3 → n4
- n4 → n5
- n5 → n6 *(Yes)*
- n5 → n7 *(No)*

---
