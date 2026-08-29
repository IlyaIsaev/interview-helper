# Coding standards

Prefer a **functional style** by default: pure functions, expressions over statements, immutability, composition, and declarative data transformations. Names should express **business meaning**, not technical mechanics.

Write **pure functions** whenever possible (same inputs → same output, no side effects). Push side effects (I/O, state updates) to the edges. Prefer small focused functions composed together over large imperative blocks.

Scoped rules:

- Frontend (FSD, React, Reatom, SMUI, Vitest): `src/AGENTS.md`
- Backend (Hono, wrangler, D1): `worker/AGENTS.md`
- End-to-end tests: `e2e/AGENTS.md`
