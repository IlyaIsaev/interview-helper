# Running Playwright Tests

To run Playwright tests, use `pnpm test:e2e`. To avoid opening the interactive html report, use `PLAYWRIGHT_HTML_OPEN=never`.

```bash
PLAYWRIGHT_HTML_OPEN=never pnpm test:e2e
```

# Debugging Playwright Tests

To debug a failing Playwright test, run it with `--debug=cli`. This pauses the test at the start and prints debugging instructions.

**IMPORTANT**: run the command in the background and check the output until "Debugging Instructions" is printed. Stop the command after you have finished.

Once a session name is printed, attach with `playwright-cli`. Do not `playwright-cli open` — that launches Chrome. Agent browsing of the live app is Lightpanda MCP, not this flow.

```bash
PLAYWRIGHT_HTML_OPEN=never pnpm test:e2e --debug=cli
# ... debugging instructions for "tw-abcdef" ...

playwright-cli attach tw-abcdef
```

Keep the test running in the background while you explore and look for a fix.
The test is paused at the start, so you should step over or pause at a particular location
where the problem is most likely to be.

Every action you perform with `playwright-cli` generates corresponding Playwright TypeScript code.
This code appears in the output and can be copied directly into the test. Most of the time, a specific locator or an expectation should be updated, but it could also be a bug in the app. Use your judgement.

After fixing the test, stop the background test run. Rerun to check that test passes.
