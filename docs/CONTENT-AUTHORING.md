# Content authoring rules (learning-track day lessons)

Day lessons (`docs/<track>/week-*/day-*.md`) render through ReactMarkdown +
`remark-gfm` + `rehype-sanitize` (see `src/lib/markdown-sanitize.ts` and
`src/components/first-60-days/dayMarkdownComponents.tsx`). That pipeline behaves
differently from Obsidian. Follow these rules or content renders broken for
students. The build enforces them via `npm run check:content` (wired into
`prebuild`).

## Hard rules (build fails otherwise)

1. **No inline `style=""`.** The sanitizer strips every style attribute, so any
   `<div style="...">` "designer" block (funnels, stat grids, timelines, cards)
   renders as garbled unstyled stacked text. Use markdown instead:
   - comparison / grid  -> a markdown **table** (keep it to 2-3 columns)
   - callout / pull-quote  -> a markdown **blockquote** (`>`)
   - stat / big number  -> a **bold line** or a small table
   - ordered flow / funnel / pipeline  -> a **mermaid** diagram (see rule 2)

2. **Mermaid: vertical only.** Use ` ```mermaid ` with `flowchart TD`, never
   `flowchart LR` — horizontal diagrams shrink to an illegible sketch on a
   390px phone. Keep node labels short; use `<br/>` for a second line; put
   edge labels in quotes: `A["Step 1"] -->|"+1 wk"| B["Step 2"]`.

3. **No leaked CMS metadata.** Trim `_Source:_` lines to a clean attribution —
   no `audience=...`, `category=...` field dumps.

## Soft rules (readability — not build-enforced)

- **Blank lines matter.** There is no `remark-breaks` plugin, so consecutive
  single-newline lines collapse into one run-on paragraph. Separate distinct
  lines with a blank line, or use a list.
- **Tables wrap, so keep them narrow.** Day tables wrap to fit mobile; 4+
  columns of prose get cramped. Drop redundant index (`#`) columns.
- **Break up walls of text.** A paragraph over ~5 sentences, or an inline
  comma-series of 4+ items, reads better split or bulleted.
- **No literal placeholders** (`$X`, `{name}`) in student-facing prose.
- **Avoid mid-sentence `->`** — it renders as raw characters. Use a comma or
  "then"; reserve arrows for deliberate compact sequences or mermaid edges.

## The Quiz section is parsed, not free-form

Everything from `## Quick quiz` onward is pulled into the Quiz tab and removed
from the Read tab. So:
- Keep student-facing content **before** `## Quick quiz`.
- Don't reformat quiz items — the parser is strict:
  `N. **question**`, then `- A) option`, the correct one marked `(correct)`,
  then `**Why:** explanation`.
