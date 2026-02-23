-- Move 4 initial-text scripts from follow-up to initial-text category
UPDATE scripts SET category = 'initial-text'
WHERE id IN (
  '00d64a23-61c4-4e60-90dd-a5772262f15f',
  '7fd5f0a0-d50e-4d6a-a0be-946d25bfdc49',
  '6c299eb0-da74-4712-bbec-8a2ba38114f3',
  '8433b860-7444-4a07-a2c2-c66bacb5b8d3'
);