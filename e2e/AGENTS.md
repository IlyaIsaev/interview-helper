# End-to-end tests

Playwright specs for the app. TypeScript conventions come from the parent `AGENTS.md`. Unit tests live in `src/**/tests/` (see `src/AGENTS.md`).

- Specs live in this folder as `*.spec.ts` (`sign-in`, `home`, `questions`, `theory`).
- Titles describe the user flow (`signing in creates the demo user and lands on questions`). Do not rewrite them as Vitest `should ... when ...`.
- Run with `pnpm test:e2e` (Chromium).
- Do not put e2e specs in `src/`.
- Do not add Cypress.

In-session agent verification of the running app uses Playwright MCP or Chrome DevTools MCP.

Debugging a failing Chromium spec with `playwright test --debug=cli` uses `.agents/skills/playwright-cli/SKILL.md` (`attach tw-*` only).
