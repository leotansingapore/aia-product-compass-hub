---
name: build-check
description: Run build and lint validation for AIA Product Compass Hub. Use after implementing features, fixes, or autonomous batch tasks. Activates when the user says "check", "build", "validate", "lint", or before any git push. Also use proactively after completing code changes.
---

# Build Check

Run build and lint checks to catch issues before pushing to main. Since this project has no CI/CD, this is the only safety net.

## When to Run

- After implementing any feature or fix
- Before every `git push`
- When autonomous mode tasks complete
- When the user says "check", "validate", or "build check"

## Commands

### Quick Check (lint only)
```bash
npm run lint
```

### Full Check (lint + production build)
```bash
npm run build
```

### Dev Build (faster, less strict)
```bash
npm run build:dev
```

## Interpreting Failures

### TypeScript Errors
- Check import paths use `@/` alias (not relative `../`)
- Check types match `src/integrations/supabase/types.ts` (auto-generated, don't modify)

### Common Build Failures
1. **Missing imports** — component moved/renamed but consumers not updated
2. **Type mismatch** — Supabase types regenerated after migration, local types stale
3. **Unused imports** — ESLint won't catch these (rule disabled), but TypeScript will on strict
4. **Module not found** — file deleted but still imported somewhere

### What NOT to Do
- Don't modify `src/components/ui/*` (shadcn, Lovable-managed)
- Don't modify `src/integrations/supabase/*` (auto-generated)
- Don't modify config files (`vite.config.ts`, `tailwind.config.ts`, `tsconfig*.json`)

## After Fixing

Once build passes:
1. Stage changes: `git add -A` (TASKS.md and BUGS.md are gitignored — no exclude syntax needed)
2. Commit with outcome-focused message (no Co-Authored-By trailers)
3. Push immediately: `git push origin main`
