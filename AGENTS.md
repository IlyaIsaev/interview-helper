# Interview helper

TypeScript in this repo follows the conventions below. Frontend architecture, Reatom, Hono, and Playwright stay in the scoped files.

## TypeScript

`pnpm lint` (oxlint) enforces the mechanical subset: `Array<T>` / `ReadonlyArray<T>`, `type` over `interface`, `import type`, no `any`, no `!`, `prefer-as-const`, and related rules.

Write TypeScript in a **functional style**. Prefer arrow functions for logic. React components are the exception: declare them with `function` (see `src/AGENTS.md`).

For collections, object updates, and composition, use `es-toolkit/fp`. For type utilities TypeScript does not ship, use `es-toolkit/types`. Do not chain native `Array.prototype` methods when a pipeline can say the same thing.

Name files in kebab-case after the business domain (`question.ts`, `session.ts`), not a technical role (`types.ts`, `utils.ts`, `helpers.ts`).

### Types

- Let inference work. Add an annotation only when it narrows the type.
- Define types with `type`, not `interface` (declaration merging is the exception).
- Write arrays as `Array<T>` / `ReadonlyArray<T>`, not `T[]`.
- Prefer `ReadonlyArray` / `DeepReadonly` for data that callers must not mutate.
- Separate type imports: `import type { Foo } from '...'`.
- Never use `any`. Narrow `unknown` before use.
- Do not use `as` or `!` except at a trust boundary (JSON, a third-party type mismatch) with a one-line why.
- Prefer `@ts-expect-error` with a description over `@ts-ignore`.
- Use `as const` / `as const satisfies` for object and array constants.
- Do not add enums (`erasableSyntaxOnly` already forbids them). Use a literal union, or a const object when you need runtime values.
- Generic type parameters start with `T` and a descriptive name (`TQuestion`, not `T` or `Question`).
- Generate types from contracts where they exist (Hono `AppType`, Valibot `InferOutput`, Drizzle, `wrangler types`). Do not hand-write those shapes.

### Discriminated unions

When variants are mutually exclusive and each variant needs different data, model them as a discriminated union. Keep properties optional only when they may independently be absent. Prefer a literal union when only the value changes, not the shape.

### Functions

- One responsibility. Make dependencies arguments. Return a value when the function calculates something.
- Isolate side effects from pure logic.
- Several related parameters: one object argument. Obvious positional args (`isDemoUserEmail(email)`) stay positional.
- Prefer required arguments. Split the function instead of accumulating optionals.
- Export explicit return types from modules. Infer inside the function. React components do not need an explicit `JSX.Element` return type.

### Naming

- Named exports. Default export only for page `ui/` screens, the Worker `fetch`/`scheduled` entry, and tool config files (`vite.config.ts`, …).
- Locals: camelCase. Booleans: `is` / `has` / `should` / `can`. Constants: `SCREAMING_SNAKE_CASE`. Types: PascalCase. Components: PascalCase. Props types: `[ComponentName]Props`.
- DOM callback props: `on*`. Local DOM handlers: `handle*`. Reatom actions stay **verb + domain object** (`submitOrder`, not `handleClickSubmit`).
- Acronyms are words: `FaqList`, `generateUserUrl`.
- Comments explain why, not what. Prefer names over comments.

### Absence

- `null`: explicitly empty (no user, failed lookup).
- `undefined`: omitted optional field.

`worker-configuration.d.ts` is generated. Do not edit it to satisfy these rules.

## Scoped rules

- Frontend (FSD, React, Reatom, SMUI, Vitest): [`src/AGENTS.md`](./src/AGENTS.md)
- Backend (Hono, wrangler, D1): [`worker/AGENTS.md`](./worker/AGENTS.md)
- End-to-end tests: [`e2e/AGENTS.md`](./e2e/AGENTS.md)
- Agent in-session browsing: `.agents/skills/lightpanda/SKILL.md` (Lightpanda MCP only; Chromium stays for `pnpm test` / `pnpm test:e2e`)
