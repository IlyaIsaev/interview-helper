# End-to-end tests

Playwright specs for the app. General style and naming come from the parent `AGENTS.md`. Unit tests live in `src/` (see `src/AGENTS.md`).

Local skill: `.agents/skills/playwright-cli/SKILL.md`

- Specs live in this folder as `*.spec.ts` (`sign-in`, `home`, `questions`).
- Run with `pnpm test:e2e`.
- Do not put e2e specs in `src/`.
- Do not add Cypress.
