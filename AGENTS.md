# Coding standards

Write TypeScript in a **functional style**. User-level `~/.cursor/AGENTS.md` is the default (including semicolons and one-line `return` / `throw` guards). This file adds project overrides.

## Overrides

For collections, object updates, and composition, use `es-toolkit/fp`. For type utilities TypeScript does not ship, use `es-toolkit/types`. Do not chain native `Array.prototype` methods when a pipeline can say the same thing.

Write arrays as `Array<T>` / `ReadonlyArray<T>`, not `T[]`. Prefer `ReadonlyArray` / `DeepReadonly` for data that callers must not mutate. Define types with `type`, not `interface` (declaration merging is the exception).

## Scoped rules

- Frontend (FSD, React, Reatom, SMUI, Vitest): `src/AGENTS.md`
- Backend (Hono, wrangler, D1): `worker/AGENTS.md`
- End-to-end tests: `e2e/AGENTS.md`
- Check UI and user-flow work with the Playwright-cli skill (`.agents/skills/playwright-cli/SKILL.md`) before treating the task as done. Chromium stays for `pnpm test` / `pnpm test:e2e`.
