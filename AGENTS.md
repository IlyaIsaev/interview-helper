# AGENTS

## Architecture

This project uses [Feature-Sliced Design (FSD)](https://fsd.how) for frontend architecture.

- Official docs for LLMs: https://fsd.how/llms.txt
- Local skill: `.agents/skills/feature-sliced-design/SKILL.md` — follow it when placing, moving, or reviewing code.

A module may import only from layers strictly below it (`app` → `pages` → `widgets` → `features` → `entities` → `shared`). Cross-imports between slices on the same layer are forbidden. Consume slices through their public `index.ts`.

Not all layers are required. Start with `app/`, `pages/`, and `shared/`. Extract to `features/` or `entities/` only when the same code is used in more than one place. Do not adopt `widgets/` by default. When in doubt, keep code in the page.

Current layout:

```text
src/
  app/                 ← entrypoint, Reatom logger/theme, routes, composition
  pages/home/          ← blank starting page
  shared/api/          ← wrap-aware JSON request helper
  shared/ui/           ← SMUI / shadcn primitives
  shared/lib/          ← cn() and other UI infrastructure
worker/                ← Hono API (not an FSD layer)
  db/                  ← Drizzle schema + D1 client
e2e/                   ← Playwright end-to-end tests
```

Do not create empty `features/`, `entities/`, or `widgets/` folders. Import pages through `@/pages/<slice>` (the slice `index.ts`). Do not import `worker/` from `src/`.

## Reatom

This project uses [Reatom v1001](https://v1001.reatom.dev) for:

- **State** — `atom`, `computed`, `action`, `effect` from `@reatom/core`
- **Routing** — `reatomRoute` / `urlAtom` (do not add React Router)
- **Forms** — `reatomForm` / `reatomField` and `bindField` from `@reatom/react` (do not add React Hook Form)
- **Backend** — `computed` + `withAsyncData` for queries, `action` + `withAsync` for mutations, `requestJson` from `@/shared/api` (do not add TanStack Query)

Official docs: https://v1001.reatom.dev  
Local skills: `.agents/skills/reatom/SKILL.md`, `.agents/skills/reatom-async/SKILL.md`

Defaults:

- Import `src/app/setup.ts` before any other app module (already done in `main.tsx`).
- Name every atom, action, computed, effect, form, and route.
- Read with `atom()`; write with `atom.set(...)`.
- After `await` or in external callbacks, use `wrap(...)`.
- UI that reads atoms is a `reatomComponent(() => { ... }, 'Name')`.
- Route screens through `render` on `reatomRoute`, not `if (!route.match())` in components.
- Form submit lives in `reatomForm({ onSubmit })`; field checks in `validate`.
- Define routes in `src/app/routes.tsx`. Pages export UI; they do not import from `app/`.

## UI

This project uses [SMUI](https://smui.statico.io) (a Nord-inspired shadcn/ui theme) with Tailwind CSS v4.

- Local skill: `.agents/skills/smui/SKILL.md`
- Primitives live in `src/shared/ui`. Class names go through `cn` from `@/shared/lib`.
- Zero border radius. JetBrains Mono only. No emoji — use `lucide-react`.
- Labels, card titles, and status text are uppercase with wide tracking.
- Theme is the Reatom `theme` atom (`src/app/theme.ts`) plus the `.dark` class. Do not add `next-themes`.
- Add new widgets with the shadcn CLI (`components.json` already points at `shared/ui`).

## Backend

The API is a [Hono](https://hono.dev) Cloudflare Worker in `worker/`.

- Only `/api/*` hits the Worker (`run_worker_first`). Everything else is the SPA.
- Bindings come from `wrangler types` (`Env`). Do not hand-write binding interfaces.
- Use `wrangler.jsonc`. Enable `nodejs_compat`. Do not store secrets in config.

## Database

Persistence is [Drizzle](https://orm.drizzle.team) on Cloudflare D1.

- Schema: `worker/db/schema.ts`. Client: `createDatabase(env.DB)` from `worker/db/client.ts`.
- Generate SQL with `pnpm db:generate`. Apply locally with `pnpm db:migrate`.
- Local `database_id` is a placeholder. Create a real D1 database before remote deploy (`wrangler d1 create interview-helper`).

## Testing

- **Unit / component:** Vitest Browser Mode (`pnpm test`). Tests live next to source as `*.test.ts(x)` and run in Chromium. Do not use jsdom.
- **End-to-end:** Playwright (`pnpm test:e2e`) in `e2e/`. Do not put e2e specs in `src/`.
- Do not add Cypress or Testing Library-in-Node.

## File & Folder Naming

- Use **kebab-case** for all file and folder names.
- Examples:
  - `app.tsx`
  - `create-documents.ts`
  - `components/`
  - `user-profile.tsx`
  - `api-client.ts`
- Do **not** use camelCase, PascalCase, or snake_case for file/folder names.
