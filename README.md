# Interview helper

A signed-in app for storing interview questions and answers as Markdown, searching the list, and practicing from a question page. Guests land on demo sign-in. Public email sign-up is currently closed. Demo accounts expire after 24 hours.

## Technologies

- React 19, TypeScript, Vite
- Reatom (state, routing, forms)
- Tailwind CSS v4, shadcn/ui, SMUI (duskbox)
- Hono on Cloudflare Workers
- Better Auth (email/password)
- Drizzle ORM on Cloudflare D1
- Valibot
- Vitest Browser (unit), Playwright (e2e)

## Architecture

- SPA in `src/` (Feature-Sliced Design: `app` → `pages` → `features` → `entities` → `shared`). No widgets layer.
- Worker in `worker/` (`/api/auth`, `/api/demo-user`, `/api/questions`). Vite Cloudflare plugin; only `/api/*` hits the Worker.
- Persistence: D1 via Drizzle. Hourly cron deletes expired demo users.

```text
src/       SPA (FSD)
worker/    Hono API on Cloudflare Workers
```
