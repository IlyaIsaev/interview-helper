# AGENTS

## Architecture

This project uses [Feature-Sliced Design (FSD)](https://fsd.how) for frontend architecture.

- Official docs for LLMs: https://fsd.how/llms.txt
- Local skill: `.agents/skills/feature-sliced-design/SKILL.md` — follow it when placing, moving, or reviewing code.

A module may import only from layers strictly below it (`app` → `pages` → `widgets` → `features` → `entities` → `shared`). Cross-imports between slices on the same layer are forbidden. Consume slices through their public `index.ts`.

Group `features/` and `entities/` slices by **business domain**, not by technical role.

- When a slice clearly belongs to one domain, put it in a domain folder: `features/questions/create-question`, `entities/questions/question`.
- The domain folder is only for navigation. It is not a slice: no `index.ts`, no `model/` / `ui/` / `api/` on the folder itself, and no shared files inside it. Import the slice: `@/features/questions/create-question`.
- Slices in the same domain folder may import each other **only as a last resort**, and only through an FSD cross-import (`@x`, e.g. `import { Question } from '@/entities/questions/question/@x/answer'`). Prefer merging slices, moving shared code down a layer, or composing from `pages/` / `app/` first.
- If the domain is unclear or the slice spans several domains (`cookie-consent`, `theme-switcher`, `user-menu`), keep it at the top of `features/` or `entities/`.

Not all layers are required. Start with `app/`, `pages/`, and `shared/`. Extract to `features/` or `entities/` only when the same code is used in more than one place. Do not adopt `widgets/` by default. When in doubt, keep code in the page.

Current layout:

```text
src/
  app/                 ← entrypoint, Reatom logger, routes, composition
  pages/home/          ← signed-in home route group
    layout/            ← homeRoute chrome (sidebar + header; HomePage when no child)
    questions/         ← questions route group
      index/           ← signed-in questions list (/questions)
      question/
        index/         ← signed-in question detail (/questions/:id)
  pages/profile/
    index/             ← signed-in profile (no sidebar; user from route loader)
  pages/sign-in/
    index/             ← prefilled demo login + cookie consent
  pages/sign-up/
    index/             ← email/password sign-up
  features/cookie-consent/ ← accept/decline cookies, banner
  features/questions/create-question/ ← dialog form to create a question + answer
  features/questions/toggle-sidebar/ ← open/close questions sidebar
  widgets/questions-sidebar/ ← wires question links + create button into the sidebar entity
  widgets/user-menu/   ← header menu: wires profile link + log out into user entity
  features/theme-switcher/ ← icon toggle for light/dark theme
  entities/questions/sidebar/ ← questions sidebar panel + list
  entities/user/       ← user data + presentational avatar menu
  shared/auth/         ← Better Auth client + session
  shared/api/          ← clientApi facade over wrap-aware Hono RPC
  shared/ui/           ← SMUI / shadcn primitives
  shared/lib/          ← cn() and other UI infrastructure
  shared/config/       ← path constants
  shared/theme/        ← light/dark theme atom + document class sync
worker/                ← Hono API (not an FSD layer)
  auth.ts              ← Better Auth Hono app
  demo-user.ts         ← generate demo credentials, create on sign-in, delete
  questions.ts         ← questions Hono app
  db/                  ← Drizzle schema + D1 client
e2e/                   ← Playwright end-to-end tests
```

Do not create empty `features/`, `entities/`, or `widgets/` folders. Nest page folders to match `reatomRoute` parent/child inheritance in `src/app/routes.tsx`. A route folder is a group: it may contain child route folders, but not `ui/` or `model/`. The route’s own slice lives in `layout/` if the route has `layout: true`, otherwise in `index/` (`ui/`, `model/` when present, public `index.ts`). Import pages through `@/pages/<route-tree>/layout` or `@/pages/<route-tree>/index`, e.g. `@/pages/home/questions/index`. Page `ui/` files have only a default export (`export default HomePage`). The slice `index.ts` re-exports that default (`export { default } from './ui/home-page'`). Load pages with `React.lazy(() => import('@/pages/home/questions/index'))`. Do not statically import page screens in `app/`. Do not import `worker/` from `src/` at runtime. A type-only `AppType` import for Hono RPC is allowed (see Backend).

## Reatom

This project uses [Reatom v1001](https://v1001.reatom.dev) for:

- **State** — `atom`, `computed`, `action`, `effect` from `@reatom/core`
- **Routing** — `reatomRoute` / `urlAtom` (do not add React Router)
- **Forms** — `reatomForm` / `reatomField` for state, Valibot schemas via `schema` (Standard Schema), shadcn `Form` / `FormField` / `FormItem` / `FormLabel` / `FormControl` / `FormMessage` from `@/shared/ui` for markup. Do not add React Hook Form or Zod.
- **Backend** — `computed` + `withAsyncData` for queries, `action` + `withAsync` for mutations, `clientApi` from `@/shared/api` (`clientApi.loadQuestions()`, …; do not add TanStack Query)

Official docs: https://v1001.reatom.dev  
Local skills: `.agents/skills/reatom/SKILL.md`, `.agents/skills/reatom-async/SKILL.md`

Defaults:

- Import `src/app/setup.ts` before any other app module (already done in `main.tsx`).
- Name every atom, action, computed, effect, form, and route.
- Read with `atom()`; write with `atom.set(...)`.
- After `await` or in external callbacks, use `wrap(...)`.
- Update data optimistically: show existing `.data()` / `initState` immediately, then load the same resource from the backend (`retry()`) and replace it. Do not blank the UI or hide it behind a spinner while that refetch runs. Use `computed` + `withAsyncData`; do not add TanStack Query.
- UI that reads atoms is a `reatomComponent(() => { ... }, 'Name')`.
- Route screens through `render` on `reatomRoute`, not `if (!route.match())` in components.
- Form submit lives in `reatomForm({ onSubmit })`. Validate with a Valibot `schema`. Use field `validate` only for cross-field or async checks. Render every form with the shadcn form components in `@/shared/ui`.
- Define routes in `src/app/routes.tsx`. Pages export UI; they do not import from `app/`.

## UI

This project uses [SMUI](https://smui.statico.io) (a Nord-inspired shadcn/ui theme) with Tailwind CSS v4.

- For any visual UI, shadcn primitives and SMUI patterns are the first priority. Use existing components in `src/shared/ui`, follow `.agents/skills/smui/SKILL.md`, and add missing widgets with the shadcn CLI (`components.json` already points at `shared/ui`).
- Write custom styles only when the desired appearance cannot be reached with shadcn and SMUI.
- Local skill: `.agents/skills/smui/SKILL.md`
- Primitives live in `src/shared/ui`. Class names go through `cn` from `@/shared/lib`.
- Zero border radius. JetBrains Mono only. No emoji — use `lucide-react`.
- Labels, card titles, and status text are uppercase with wide tracking.
- Theme is the Reatom `theme` atom (`src/shared/theme`) plus the `.dark` class. Do not add `next-themes`.

## Backend

The API is a [Hono](https://hono.dev) Cloudflare Worker in `worker/`.

- Official docs for LLMs: https://hono.dev/llms.txt
- Validate request bodies and params with Valibot via `@hono/valibot-validator` (`vValidator`). Do not add Zod.
- Frontend API calls use `clientApi` from `@/shared/api` (`clientApi.loadQuestions()`, `clientApi.createQuestion()`, …). Hono RPC (`hc<AppType>`) is an implementation detail of that slice. Better Auth stays on `authClient`.
- `import type { AppType } from '../../../worker'` in `@/shared/api` is the only allowed `src/` → `worker/` import (types only, no runtime). Chain Hono handlers (`.get().post()` / `.route()`) so `AppType` infers.
- Only `/api/*` hits the Worker (`run_worker_first`). Everything else is the SPA.
- Bindings come from `wrangler types` (`Env`). Do not hand-write binding interfaces.
- Use `wrangler.jsonc`. Enable `nodejs_compat`. Do not store production secrets in config. Local secrets go in `.dev.vars`.
- Dedicated Hono apps: `auth` at `/api/auth`, `demo-user` at `/api/demo-user`, `questions` at `/api/questions`. Mount more specific apps before `/api`.

## Auth

Authentication is [Better Auth](https://better-auth.com) with email and password.

- Server: `createAuth(env)` in `worker/auth.ts` — create per request, never as a Worker singleton.
- Handler: dedicated Hono `auth` app in `worker/auth.ts`, mounted at `/api/auth`. `GET`/`POST` `/api/auth/*`.
- Client: `authClient` in `@/shared/auth`. Session is a Reatom `computed` + `withAsyncData`. Do not use `useSession`.
- Sign-in/up forms use `reatomForm`. After success, `session.retry()` and `urlAtom.go(homePath)`.
- Guests opening `/` are redirected to `/sign-in`. Sign-in prefills from the `createdDemoUser` cookie, or from `GET /api/demo-user` (`demo-user-{8 hex}@demo.com` + generated password) if none exists. Do not create a user until Sign in (`POST /api/demo-user`). After create, store `{ email, password }` in `createdDemoUser`. Cookie consent is only on `/sign-in`: Accept sets the `cookieConsent=true` cookie and hides the banner (including after reload); Decline redirects to `https://www.google.com` (do not delete the user). After Sign in, go home. Sign-out returns to `/sign-in` with the same demo credentials.
- Path strings live in `@/shared/config`. Pages and features must not import route atoms from `app/`.
- Copy `.dev.vars.example` to `.dev.vars`. Production: `wrangler secret put BETTER_AUTH_SECRET`.

## Database

Persistence is [Drizzle](https://orm.drizzle.team) on Cloudflare D1.

- Schema: `worker/db/schema.ts`. Client: `createDatabase(env.DB)` from `worker/db/client.ts`.
- `question` has a unique `id`, `question`, and `answer`.
- Generate SQL with `pnpm db:generate`. Apply locally with `pnpm db:migrate`.
- Browse the local D1 file with `pnpm db:studio` (Drizzle Studio at `127.0.0.1:4983` / [local.drizzle.studio](https://local.drizzle.studio)).
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
