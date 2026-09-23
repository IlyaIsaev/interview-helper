# Backend

The API is a [Hono](https://hono.dev) Cloudflare Worker. Official docs for LLMs: https://hono.dev/llms.txt

TypeScript conventions live in the parent `AGENTS.md`. Frontend rules live in `src/AGENTS.md`.

```text
index.ts             ← mount auth, user, questions, health
auth/                ← Better Auth Hono app
user/                ← change password, delete signed-in user
questions/           ← questions Hono app
  utils/             ← question search matching
db/                  ← Drizzle schema + D1 client
```

## Validation

- Validate request bodies and params with Valibot via `@hono/valibot-validator` (`vValidator`). Do not add Zod.

## Hono

- Only `/api/*` hits the Worker (`run_worker_first`). Everything else is the SPA.
- Bindings come from `wrangler types` (`Env`). Do not hand-write binding interfaces.
- Use `wrangler.jsonc`. Enable `nodejs_compat`. Do not store production secrets in config. Local secrets go in `.dev.vars`.
- Dedicated Hono apps: `auth` at `/api/auth`, `user` at `/api/user`, `questions` at `/api/questions`. Mount more specific apps before `/api`.
- Chain Hono handlers (`.get().post()` / `.route()`) so `AppType` infers. The UI may import `AppType` as types only from `src/shared/api`; do not add runtime exports for the SPA.
- Default export is `{ fetch }`, not the Hono app. Keep `export type AppType = typeof app`.

## Auth

Authentication is [Better Auth](https://better-auth.com) with email and password.

- Server: `createAuth(env)` in `auth/` — create per request, never as a Worker singleton.
- Handler: dedicated Hono `auth` app in `auth/`, mounted at `/api/auth`. `GET`/`POST` `/api/auth/*`. Email sign-up (`POST /api/auth/sign-up/email`) is limited to `ALLOWED_SIGN_UP_EMAILS` in `auth/allowed-sign-up-emails.ts` (currently `CATALOG_OWNER_EMAIL` / `iaisaev@pm.me`). A local `BETTER_AUTH_URL` also allows `*@example.com` for e2e. Other addresses get 403 `{ message: 'This email is not allowed to register.' }`. Do not set Better Auth `emailAndPassword.disableSignUp`. Better Auth's default 3/10s cap on sign-up and sign-in is turned off (`rateLimit.customRules` `false` for both `/sign-up/email` and `/api/auth/sign-up/email`, same for sign-in); those POSTs are limited by `AUTH_RATE_LIMITER` instead.
- `POST /api/user/password` changes the signed-in user's password (session required; 8–128 characters). `DELETE /api/user` deletes the signed-in user (any email). Questions cascade. It expires Better Auth session cookies. POST `/api/user` (including `/password`) and POST `/api/auth/*` are rate-limited with a Workers rate-limit binding keyed by path and `CF-Connecting-IP`.
- Cookie consent is only on `/sign-in`: Accept sets the `cookieConsent=true` cookie; Decline redirects to `https://www.google.com` (do not delete the user).
- Copy `.dev.vars.example` to `.dev.vars`. Production: `wrangler secret put BETTER_AUTH_SECRET`.

Client session, forms, and redirects are in `src/AGENTS.md`.

## Database

Persistence is [Drizzle](https://orm.drizzle.team) on Cloudflare D1.

- Schema: `db/schema.ts`. Client: `createDatabase(env.DB)` from `db/client.ts`.
- `question` has a unique `id`, `question`, `answer`, and `userId` (FK to `user.id`, cascade on delete). With a session, list and mutate only that user's rows. `GET /api/questions` is alphabetical by visible question text (markdown stripped, case-insensitive) for both the owner catalog and the published snapshot. Unauthenticated `GET /api/questions` and `GET /api/questions/:id` return the published snapshot (`published_question`: `id`, `question`, `answer`; no `userId`). An empty snapshot yields `{ questions: [] }` / 404, not 401. `POST /api/questions/:id/publish` (session required) replaces that owned question's shared-catalog row completely (same id, current question and answer). Other published rows stay. A missing or unowned id returns 404. `DELETE /api/questions/:id` also deletes that `published_question` row. POST, PUT, and DELETE on `/api/questions` still require a session. `question` and `answer` are capped at 20_000 characters. A user may have at most 200 questions.
- Generate SQL with `pnpm db:generate`. Apply locally with `pnpm db:migrate`. Apply on production with `pnpm db:migrate:remote` (also run by `pnpm deploy`).
- Browse the local D1 file with `pnpm db:studio` (Drizzle Studio at `127.0.0.1:4983` / [local.drizzle.studio](https://local.drizzle.studio)).
- Local `database_id` is a placeholder. Create a real D1 database before remote deploy (`wrangler d1 create interview-helper`).
