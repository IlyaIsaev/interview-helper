---
name: playwright-cli
description: Debug a paused Chromium Playwright e2e run with playwright-cli attach tw-*. Do not use this skill to browse the app, open Chrome, or attach over CDP. Agent browsing uses the lightpanda skill.
allowed-tools: Bash(playwright-cli:*) Bash(npx:*) Bash(pnpm:*)
---

# Debug Chromium e2e with playwright-cli

Use this skill only when a Playwright **test** is already running with `--debug=cli`. Agent verification of the live app uses Lightpanda MCP (`.agents/skills/lightpanda/SKILL.md`).

Do not:

- `playwright-cli open` (launches Chrome)
- `playwright-cli attach --cdp=...`
- Playwright MCP or Chrome DevTools MCP

## Run and attach

```bash
PLAYWRIGHT_HTML_OPEN=never pnpm test:e2e --debug=cli
```

Run that in the background until debugging instructions print a session name, then:

```bash
playwright-cli attach tw-abcdef
```

Keep the test process running while you snapshot, click, and copy generated Playwright TypeScript into the spec. Stop the test process when finished. Rerun `pnpm test:e2e` to confirm.

See [references/playwright-tests.md](references/playwright-tests.md). Test generation that needs a live page must attach to that `tw-*` Chromium session, not open a new browser: [references/test-generation.md](references/test-generation.md).
