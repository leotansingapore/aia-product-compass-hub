# Claude Code Skills

Skills extend Claude's capabilities with domain-specific knowledge. They activate automatically when Claude Code runs in this project.

## Available Skills

| Skill | Purpose |
|-------|---------|
| **typescript** | TypeScript code style and optimization guidelines |
| **build-check** | Build and lint validation before pushes |
| **frontend-design** | Guides UI creation toward distinctive, memorable aesthetics |
| **lovable-handoff** | Describes DB changes for Lovable to implement as migrations |
| **skill-lookup** | Discovers and installs reusable Agent Skills |

## How Skills Work

- Skills are loaded automatically from this directory
- No need to mention them in prompts - they're always active
- Each skill has a `SKILL.md` file with instructions Claude follows

## Adding More Skills

Copy skill folders from [agent-lib](file:///C:/Users/Jilian/OneDrive/Desktop/agent-lib/skills) into this directory.

Available in agent-lib:
- `frontend-testing` - Vitest + React Testing Library patterns
- `seo-review` - SEO audit methodology
- `component-refactoring` - React component splitting patterns
