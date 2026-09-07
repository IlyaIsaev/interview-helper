---
name: lightpanda
description: Drive this app in-session with Lightpanda MCP only. Use when verifying UI, clicking through flows, reading the page, filling forms, or otherwise browsing http://127.0.0.1:5173 as an agent. Do not use Playwright MCP, Chrome DevTools MCP, or playwright-cli open.
---

# Lightpanda MCP

Cursor agents browse this app only through Lightpanda MCP. Chromium is for `pnpm test` / `pnpm test:e2e` and the human Integrated Browser Tab.

If Lightpanda tools are missing, tell the user to enable the `lightpanda` server in `.cursor/mcp.json` and disable Playwright MCP and Chrome DevTools MCP in Cursor settings. Do not fall back to those MCPs or to `playwright-cli open`.

App origin: `http://127.0.0.1:5173`. Start `pnpm dev` if the app is not already running.

## Loop

1. `goto` with `url` (optional `waitUntil`: prefer `domcontentloaded` plus `waitForSelector` on slow pages).
2. `tree` or `markdown` to read the page. Scope with `selector` / `backendNodeId` when the full page is large.
3. `findElement` (role and/or accessible name) or `interactiveElements` to locate controls.
4. `click` / `fill` / `press` / `setChecked`. Prefer `selector`; `backendNodeId` comes from `tree` / `findElement`.
5. `getUrl`, `tree`, or `markdown` to confirm the result.

Read tools that accept `url` navigate first, so a separate `goto` is optional.

Do not screenshot. Lightpanda does not paint real pixels. Prefer roles and names over hover-only CSS.

## Tools

**Navigation:** `goto`, `search` (do not use search for this app).

**Read:** `markdown`, `html`, `tree`, `links`, `nodeDetails`, `findElement`, `interactiveElements`, `detectForms`, `structuredData`.

**Act:** `click`, `fill`, `scroll`, `hover`, `press`, `selectOption`, `setChecked`.

**Wait:** `waitForSelector`, `waitForScript`, `waitForState` (`load`, `domcontentloaded`, `networkalmostidle`, `networkidle`, `done`). After `goto`, late XHR content may still be missing — use `waitForState` with `networkidle` and re-read.

**State:** `getUrl`, `getCookies`, `consoleLogs`.

## Forbidden

- Playwright MCP (`browser_*` tools)
- Chrome DevTools MCP
- `playwright-cli open`, `playwright-cli attach --cdp`, headed Chrome

`playwright-cli attach tw-*` is allowed only when debugging a Chromium e2e run started with `playwright test --debug=cli`.
