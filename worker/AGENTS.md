# Backend

The API is a [Hono](https://hono.dev) Cloudflare Worker. Official docs for LLMs: https://hono.dev/llms.txt

General style, naming, and kebab-case come from the parent `AGENTS.md`. Frontend rules live in `src/AGENTS.md`.

```text
index.ts             ← mount auth, demo-user, questions, health
auth/                ← Better Auth Hono app
demo-user/           ← generate or reuse demo credentials, create on Sign in, delete
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
- Dedicated Hono apps: `auth` at `/api/auth`, `demo-user` at `/api/demo-user`, `questions` at `/api/questions`. Mount more specific apps before `/api`.
- Chain Hono handlers (`.get().post()` / `.route()`) so `AppType` infers. The UI may import `AppType` as types only from `src/shared/api`; do not add runtime exports for the SPA.

## Auth

Authentication is [Better Auth](https://better-auth.com) with email and password.

- Server: `createAuth(env)` in `auth/` — create per request, never as a Worker singleton.
- Handler: dedicated Hono `auth` app in `auth/`, mounted at `/api/auth`. `GET`/`POST` `/api/auth/*`.
- `GET /api/demo-user` reads the HttpOnly `createdDemoUser` cookie when it holds a valid demo email and password; otherwise it invents `demo-user-{8 hex}@demo.com` credentials and sets that cookie (`HttpOnly`, `SameSite=Lax`, ~7-day `maxAge`, `Secure` on HTTPS). It does not insert a row. Called from `/sign-in`, not `/sign-up`. The JSON body still includes the password so the sign-in form can prefill; the client must not persist it in `document.cookie`. Responses use `Cache-Control: private, no-store`. `POST /api/demo-user` creates the account (or signs in if it already exists), sets session cookies, and refreshes the HttpOnly demo cookie. POST `/api/demo-user` and POST `/api/auth/*` are rate-limited with a Workers rate-limit binding keyed by path and `CF-Connecting-IP`.
- `DELETE /api/demo-user` deletes the signed-in user (any email). Questions cascade. It expires `createdDemoUser` and Better Auth session cookies so the next `GET` invents new demo credentials.
- Cookie consent is only on `/sign-in`: Accept sets the `cookieConsent=true` cookie; Decline redirects to `https://www.google.com` (do not delete the user).
- Copy `.dev.vars.example` to `.dev.vars`. Production: `wrangler secret put BETTER_AUTH_SECRET`.

Client session, forms, and redirects are in `src/AGENTS.md`.

## Database

Persistence is [Drizzle](https://orm.drizzle.team) on Cloudflare D1.

- Schema: `db/schema.ts`. Client: `createDatabase(env.DB)` from `db/client.ts`.
- `question` has a unique `id`, `question`, `answer`, and `userId` (FK to `user.id`, cascade on delete). List and mutate only that user's rows. `question` and `answer` are capped at 20_000 characters; a user may have at most 200 questions.
- Generate SQL with `pnpm db:generate`. Apply locally with `pnpm db:migrate`.
- Browse the local D1 file with `pnpm db:studio` (Drizzle Studio at `127.0.0.1:4983` / [local.drizzle.studio](https://local.drizzle.studio)).
- Local `database_id` is a placeholder. Create a real D1 database before remote deploy (`wrangler d1 create interview-helper`).
