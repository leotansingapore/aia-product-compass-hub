-- Move objection-handling scripts out of 'faq' into new 'objection-handling' category
UPDATE scripts
SET category = 'objection-handling'
WHERE id IN (
  'ab882473-a932-4e80-948d-f7316ad07c36', -- "Already Have an Advisor" — Objection Script
  'a7d2c12d-11e3-40f0-bc1a-8bfa0f6d6c8e', -- Fact-Finding — Current Situation Questions
  'c60f577e-cace-4b67-8864-86966d2e9677', -- Fact-Finding — Insurance Coverage Check
  '78f081ae-9488-4d8e-945d-366f0cfd0c17', -- Fact-Finding — Investment Status Check
  '7b4ff6b1-c019-44d1-888b-7c5505ca2e54', -- Handling Video-Off Objections (Zoom)
  '5d66a91b-d0e0-4ef9-8904-018360feb073', -- Objection — "Not Interested in Insurance"
  '2833e586-02cc-4fd5-8a71-1f17c9d71b73', -- Objection Handling -- NSF (All Objections)
  'ca7f4832-ce18-4bf6-8e09-d3d099e826a5', -- Objection Handling -- Young Adults (All Objections)
  '0d7bdc5c-3933-4d4d-9f14-486653ebc295', -- Objection Handling — Cost of Delay (Time vs Money)
  'c0598441-903a-4dd1-a733-6884b43889b0', -- Objection Handling — Recruitment (Telemarketer)
  'af86c2b2-72ac-4c55-857a-87541d91ff36'  -- Texting EQ — 4-Step Objection Handling Framework
);