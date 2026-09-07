# End-to-end tests

Playwright specs for the app. General style and naming come from the parent `AGENTS.md`. Unit tests live in `src/**/tests/` (see `src/AGENTS.md`).

- Specs live in this folder as `*.spec.ts` (`sign-in`, `home`, `questions`).
- Run with `pnpm test:e2e` (Chromium).
- Do not put e2e specs in `src/`.
- Do not add Cypress.

In-session agent verification of the running app uses Lightpanda MCP, not Playwright MCP or Chrome DevTools MCP. Skill: `.agents/skills/lightpanda/SKILL.md`.

Debugging a failing Chromium spec with `playwright test --debug=cli` uses `.agents/skills/playwright-cli/SKILL.md` (`attach tw-*` only).
