---
name: typescript
description: TypeScript code style and optimization guidelines. Use when writing TypeScript code (.ts, .tsx, .mts files), reviewing code quality, or implementing type-safe patterns. Triggers on TypeScript development, type safety questions, or code style discussions.
---

# TypeScript Code Style Guide

## Types and Type Safety

- Avoid explicit type annotations when TypeScript can infer
- Avoid implicitly `any`; explicitly type when necessary
- Use accurate types: prefer `Record<PropertyKey, unknown>` over `object` or `any`
- Prefer `interface` for object shapes (e.g., React props); use `type` for unions/intersections
- Prefer `as const satisfies XyzInterface` over plain `as const`
- Prefer `@ts-expect-error` over `@ts-ignore` over `as any`
- Avoid meaningless null/undefined parameters; design strict function contracts

## Async Patterns

- Prefer `async`/`await` over callbacks or `.then()` chains
- Use promise-based variants where available
- Use `Promise.all`, `Promise.race` for concurrent operations where safe

## Code Structure

- Prefer object destructuring
- Use consistent, descriptive naming; avoid obscure abbreviations
- Replace magic numbers/strings with well-named constants
- Defer formatting to tooling

## UI and Theming

- Use shadcn/ui and Radix UI primitives for components
- Use Tailwind CSS utility classes for styling
- Use `cn()` from `@/lib/utils` for conditional class merging
- Design for mobile responsiveness
- Use CSS variables and Tailwind theme tokens instead of hard-coded colors

## Performance

- Prefer `for...of` loops over index-based `for` loops
- Reuse existing utils and installed npm packages
- Query only required columns from database

## Time Consistency

- Assign `Date.now()` to a constant once and reuse for consistency

## Logging

- Never log user private information (API keys, etc.)
- Use `console.error` in catch blocks
