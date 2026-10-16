# Deep links

Any state a learner would come back to, send to someone, or be sent to by a job lives in the URL. Jobs that post academy links (Lark, Telegram, email) build them from this file. When a job and the app disagree, this file is the contract.

Rules every page follows:

- Defaults stay out of the URL. `/product/training-meetings` and `?tab=course-content` open the same screen.
- Unknown or stale values are ignored and the page falls back to its default. Old links never error.
- Filters, tabs and search replace the history entry. Changing lesson replaces too, so Back leaves the course.
- Param names never change once shipped. To rename one, keep reading the old name.

## Product courses

`https://academy.finternship.com/product/<product>/<lesson>`

| Part | Values | Default | Example |
|---|---|---|---|
| `<product>` | product slug | | `training-meetings` |
| `<lesson>` | lesson slug: the title lowercased, punctuation dropped, spaces as hyphens | first lesson in the list | `7th-oct-cold-call-structure-for-retirement-planning-appointments` |
| `?tab=` | `course-content`, `resources`, `my-notes`, or a product's extra tab (`sales-info`) | `course-content` | `?tab=resources` |
| `?q=` | lesson search text, matched against lesson titles | none | `?q=cpf` |

Changing lesson keeps `?tab=` and `?q=`. An unknown lesson slug opens the first lesson.

Training Meetings lists the newest training first, so the bare product URL opens the latest call.

Examples:

- Latest team training: `https://academy.finternship.com/product/training-meetings`
- One call, on its resources: `https://academy.finternship.com/product/training-meetings/7th-oct-cold-call-structure-for-retirement-planning-appointments?tab=resources`
- Every call about CPF: `https://academy.finternship.com/product/training-meetings?q=cpf`

## Other pages that read the URL

Found by the deep-links audit on 2026-10-16. Values are whatever the page code accepts; read the page before building a link to it.

| Page | Path | Query params |
|---|---|---|
| Admin dashboard | `/admin` | `tab` |
| CMFAS exams | `/cmfas-exams/:workspaceMode/:slideSlug` | `mode` |
| Case vault | `/case-vault` | `case` |
| Concept cards | `/concept-cards` | `q` |
| Library | `/library` | `tab` |
| Review all | `/review-all` | `product`, `bank`, `category`, `q` |
| Roleplay | `/roleplay` | `tab` |
| Scripts course | `/scripts/course` | `lesson` |
| Scripts and objections | `/scripts/:scriptId`, `/objections` | `v`, `q`, `category`, `audience`, `role`, `tag` |
| Servicing | `/servicing/:scriptId` | `q`, `category`, `audience`, `role`, `tag` |
| First 14 Days | `/learning-track/first-14-days/day/:dayNumber` | `edit` (admins) |
| Worksheets | `/learning-track/pre-rnf/worksheets/:slug` | `user` |
| AIA training directory | `/learning-track/post-rnf/aia-training/:view/:itemId` | `section`, `day`, `month`, plus the courses filters `q`, `stage`, `sort`, `mandatory`, `essential`, `new`, `upcoming` |
