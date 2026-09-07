# Coding standards

Write TypeScript in a **functional style**. User-level `~/.cursor/AGENTS.md` is the default (including semicolons and one-line `return` / `throw` guards). This file adds project overrides.

## Overrides

For collections, object updates, and composition, use `es-toolkit/fp`. For type utilities TypeScript does not ship, use `es-toolkit/types`. Do not chain native `Array.prototype` methods when a pipeline can say the same thing.

## Scoped rules

- Frontend (FSD, React, Reatom, SMUI, Vitest): `src/AGENTS.md`
- Backend (Hono, wrangler, D1): `worker/AGENTS.md`
- End-to-end tests: `e2e/AGENTS.md`
- Agent in-session browsing: `.agents/skills/lightpanda/SKILL.md` (Lightpanda MCP only; Chromium stays for `pnpm test` / `pnpm test:e2e`)
