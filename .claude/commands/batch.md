Run autonomous batch mode. Read TASKS.md and execute unchecked tasks following the tag pipeline defined in CLAUDE.md:

## Task Execution Order
1. Start with **Bugs** section (top priority)
2. Then **Critical** items
3. Then **Features / Improvements**
4. Then remaining sections by priority

## Tag Pipeline (fully automated, no user approval needed)

### `[PLAN]` tasks — Research first
1. Spawn 2-3 **Explore agents** in parallel to investigate relevant code paths
2. Synthesize findings into a plan (root cause, files to change, approach)
3. Spawn a **Plan agent** as reviewer — it must approve the plan or send back with feedback (max 2 revision rounds)
4. Once approved > implement

### `[TEST]` tasks — Verify after implementing
1. `npm run build` must pass
2. Open page in **Playwright MCP** browser > verify the fix/feature works visually
3. Spawn a **QA review agent** — pass it the diff + Playwright results. It must approve or reject (max 2 rounds)
4. Only mark done after all 3 gates pass

### `[PLAN] [TEST]` tasks (most common) — Full pipeline
Research agents > Plan review > Implement > Build > Playwright > QA review > Done

## Per-task workflow
1. Pick next unchecked task by priority order above
2. Follow tag pipeline
3. `git add -A && git commit && git push` IMMEDIATELY after task passes all gates
4. Brief status update
5. Move to next task

## Stop conditions
- Build error that can't be self-fixed after 2 attempts
- Task needs DB changes (`[AUTO-DB]`) — skip and notify user
- Auth/payment/security logic — skip and notify user
- New dependencies needed — skip and notify user
