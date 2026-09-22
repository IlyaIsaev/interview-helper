# Frontend

General style, semicolons, one-line guards, immutability, domain naming, and kebab-case come from user-level `~/.cursor/AGENTS.md`. Parent `AGENTS.md` adds `es-toolkit/fp` pipelines and `es-toolkit/types`. This file adds architecture, React, Reatom, UI, and unit-test conventions.

## Architecture

Use [Feature-Sliced Design (FSD)](https://fsd.how). Official docs for LLMs: https://fsd.how/llms.txt  
Local skill: `.agents/skills/feature-sliced-design/SKILL.md` — follow it when placing, moving, or reviewing code.

### Import rules

A module may import only from layers strictly below it (`app` → `pages` → `features` → `entities` → `shared`). Do not import a slice's internals (`ui/`, `model/`). Consume `features/` and `entities/` through their public `index.ts`. Pages are the exception: see **Pages and routes**.

Same-layer internals are forbidden. Features that must share UI or a schema import the owning slice's public `index.ts`. `@x` is entities-only (see **Domain folders**).

### When to extract slices

Not all layers are required. Start with `app/`, `pages/`, and `shared/`. Extract to `features/` or `entities/` only when the same code is used in more than one place. Do not adopt `widgets/`. When in doubt, keep code in the page.

Do not create empty `features/` or `entities/` folders.

### Domain folders

Group `features/` and `entities/` slices by **business domain**, not by technical role.

- When a slice clearly belongs to one domain, put it in a domain folder: `features/questions/create-question`.
- The domain folder is only for navigation. It is not a slice: no `index.ts`, no `model/` / `ui/` / `api/` on the folder itself, and no shared files inside it. Import the slice: `@/features/questions/create-question`.
- Slices on the same layer must not import each other's internals, including siblings in a domain folder. If two feature slices must share UI or a schema, export it from the owning slice's `index.ts`. Prefer merging slices, moving shared domain code to `entities/`, or composing from `pages/` / `app/` first.
- `@x` is for the entities layer only, and only as a last resort when entity boundaries cannot be merged (e.g. `import { Question } from '@/entities/questions/question/@x/answer'`). Document why merge does not apply. Never use `@x` on features.
- If the domain is unclear or the slice spans several domains (`theme-switcher`), keep it at the top of `features/` or `entities/`.

### Current layout

```text
app/                 ← entrypoint, Reatom logger, routes, composition
                         protectedRoute: app shell (guests + signed-in; no page folder)
pages/questions/     ← questions route group (under protectedRoute)
  layout/            ← questionsRoute chrome + list loader (header + questions dialog)
  index/             ← questions list / empty state (/questions)
  question/
    index/           ← question detail; composes RandomQuestion (/questions/:id)
pages/theory/
  index/             ← accordion list / empty state (/theory, open item is ?id=)
pages/profile/
  index/             ← signed-in profile (no sidebar; user from route loader)
pages/sign-in/
  index/             ← login + cookie consent
pages/sign-up/
  index/             ← empty custom sign-up form
features/questions/create-question/ ← dialog form to create a question + answer
features/questions/delete-question/ ← confirm dialog to delete a question
features/questions/publish-questions/ ← header button to snapshot questions for guests
features/questions/search-questions/ ← search field in the questions dialog
features/questions/update-question/ ← dialog form to update a question + answer
features/theme-switcher/ ← icon toggle for light/dark theme
features/user/user-menu/ ← header menu: Questions, Theory, profile, log out
features/user/change-password/ ← profile form: new password + confirmation (deleteUser slot)
features/user/delete-user/ ← confirm dialog to delete the signed-in account
entities/questions/question/ ← questions list query, opened question computed, openedQuestionId, questionFieldsSchema, QuestionFields, QuestionList, RandomQuestion
shared/auth/         ← Better Auth client + session
shared/api/          ← clientApi facade over wrap-aware Hono RPC
shared/ui/           ← SMUI / shadcn primitives
shared/lib/          ← cn() and other UI infrastructure
shared/config/       ← path constants
shared/theme/        ← light/dark theme atom + document class sync
```

## Pages and routes

Define routes in `src/app/routes.tsx`. Path strings for route `path` options live in `@/shared/config`. Pages, features, and entity UI link with `route.path()` and navigate with `route.go()`. Entity **model** modules do not import `@/app/routes`. `src/app/routes.tsx` imports entity model files directly, not the public barrel, so UI that imports routes does not cycle.

### Folder layout

- Nest page folders to match `reatomRoute` parent/child inheritance in `src/app/routes.tsx`.
- A route folder is a group: it may contain child route folders, but not `ui/` or `model/`. The route’s own slice lives in `layout/` if the route has `layout: true`, otherwise in `index/` (`ui/`, `model/` when present).
- Page `ui/` files have only a default export (`export default QuestionsPage`). Do not add a slice `index.ts`.
- Import pages in `src/app/routes.tsx` directly from those UI files, e.g. `@/pages/questions/index/ui/questions-page`.
- Load pages with `React.lazy(() => import('@/pages/questions/index/ui/questions-page'))`. Do not statically import page screens in `app/`.
- Route screens through `render` on `reatomRoute`, not `if (!route.match())` in components.

### Loaders and queries

Route reads are one async computed. Do not copy the same payload into a second atom with `init*`.

The questions list is `computed(async () => …).extend(withAsyncData())` in the question entity. It waits until `session.ready()`, debounces a non-empty search inside that computed, and sorts the payload. `questionsRoute` and `theoryRoute` loaders `await wrap(questions())`. They do not call `clientApi.loadQuestions`. UI reads `questions.data()`, `questions.ready()`, and `questions.error()`, and retries with `questions.retry()`. Optimistic edits write `questions.data`, then retry.

`questionRoute` validates `:id` with Valibot and loads that question. `theoryOpenedRoute` is a search-only child of `theoryRoute` with optional `id`. Its loader loads the open theory item. Changing `?id=` does not refetch the list. `opened-question.ts` reads whichever of those loaders is active. Routes do not import that file.

Detail fetches that are not the shared list stay on the route loader (`clientApi.loadQuestion`). Mutations may still call `clientApi` from features.

```ts
export const questions = computed(async () => {
  const signedInUserId = session.data()?.user?.id ?? null;

  if (!session.ready()) await wrap(new Promise<never>(() => {}));

  const query = activeQuestionsQuery();

  if (query.length > 0) await wrap(sleep(300));

  if ((session.data()?.user?.id ?? null) !== signedInUserId) return null;

  const { questions: nextQuestions } = await wrap(clientApi.loadQuestions(query));

  return sortedQuestions(nextQuestions);
}, 'questions').extend(withAsyncData({ initState: null }));

async loader() {
  if (!session.ready()) return;

  await wrap(questions());
}
```

Do not fetch the same list from a feature action, and do not map the payload in the loader.

### Side effects and redirects on `reatomRoute`

Put matching rules and redirects in `params()`. Put data and scoped work in `loader()`. Do not redirect from `render` or from a free-floating `effect` when `params()` or `loader` can decide.

| Kind of side effect                            | Where                                     |
| ---------------------------------------------- | ----------------------------------------- |
| Auth / role / “this URL is invalid”            | `params()` → `return null` + `.go()`      |
| Redirect after fetch (404, forbidden resource) | `loader`                                  |
| Per-visit models (form, poll, websocket)       | `effect` **inside** `loader`              |
| Analytics, document title, scroll-to-top       | top-level `effect` on `urlAtom` / route   |
| UI-only “don’t render yet”                     | `render` / component — not for navigation |

`params()` runs as part of matching. Returning `null` blocks the route and its children, so loaders and `render` do not run. Call `.go()` there for auth and landing. Use `route.go(params, true)` when the blocked URL must not stay in history.

```ts
const protectedRoute = layoutRoute.reatomRoute(
  {
    layout: true,
    params() {
      const { pathname } = urlAtom();
      const onAuthPage = pathname === SIGN_IN_PATH || pathname === SIGN_UP_PATH;

      if (!session.ready() && onAuthPage) return null;

      if (!session.ready()) return {};

      const user = session.data()?.user;
      const userId = user?.id ?? null;

      if (lastQuestionsUserId() !== userId) {
        const previousUserId = lastQuestionsUserId();

        lastQuestionsUserId.set(userId);

        if (previousUserId !== undefined && questions.data() !== null) {
          resetQuestions();

          if (pathname === THEORY_PATH) theoryOpenedRoute.go({}, true);
        }
      }

      if (!user && onAuthPage) return null;

      if (pathname === HOME_PATH || (user && onAuthPage)) {
        questionsRoute.go(undefined, true);

        return null;
      }

      return { userId };
    },
    render(self) {
      if (!session.ready()) return <PageFallback />;

      return <>{self.outlet()}</>;
    },
  },
  'protectedRoute',
);
```

Use `loader` when the decision needs fetched data (missing resource, API 403/404). Loaders abort on navigation and param change. Effects created inside a loader abort when the route is left — use that for polling, subscriptions, and per-visit forms.

```ts
async loader({ id }) {
  const question = await wrap(clientApi.loadQuestion(id));

  if (!question) {
    questionsRoute.go(undefined, true);

    return;
  }

  initQuestion(question);
}
```

A standalone `effect()` that watches `adminRoute()` and calls `.go()` is a last resort: the route already matched, loaders may start, and the UI can flash. Prefer `params()`.

## React

- Declare with `function`, never arrow functions. This is the exception to the parent “prefer arrow functions” rule.
- Always extract props into a separate `type` named `[ComponentName]Props`.
- Keep components mostly pure: derive values, avoid unnecessary local mutation.

```ts
type FormProps = {
  id: string;
};

function Form({ id }: FormProps) {
  // ...
}

// Forbidden
function Form({ id }: { id: string }) {}
```

## Reatom

Use [Reatom v1001](https://v1001.reatom.dev) for:

- **State** — `atom`, `computed`, `action`, `effect` from `@reatom/core`
- **Routing** — `reatomRoute` / `urlAtom` (do not add React Router)
- **Forms** — `reatomForm` / `reatomField` for state, Valibot schemas via `schema` (Standard Schema), shadcn `Form` / `FormField` / `FormItem` / `FormLabel` / `FormControl` / `FormMessage` from `@/shared/ui` for markup. Do not add React Hook Form or Zod.
- **Async** — `computed` + `withAsyncData` for queries, `action` + `withAsync` for mutations, `clientApi` from `@/shared/api`. Do not add TanStack Query.

Official docs: https://v1001.reatom.dev  
Local skills: `.agents/skills/reatom/SKILL.md`, `.agents/skills/reatom-async/SKILL.md`

### Defaults

- Import `src/app/setup.ts` before any other app module (already done in `main.tsx`).
- Name every atom, action, computed, effect, form, and route.
- Read with `atom()`; write with `atom.set(...)`.
- After `await` or in external callbacks, use `wrap(...)`.
- UI that reads atoms is a `reatomComponent(() => { ... }, 'Name')`. Keep it as dumb/declarative as possible. Never put multi-step side effects directly in JSX.
- Put logic in a dedicated `action` when several operations belong together. Actions may call other actions freely — this is the primary composition technique.
- Prefer extracting a named local handler (`const handleClose = wrap(...)`) so JSX stays clean. That local binding is not an action name; actions still use verb + domain object.
- Form submit lives in `reatomForm({ onSubmit })`. Validate with a Valibot `schema`. Use field `validate` only for cross-field or async checks. Render every form with the shadcn form components in `@/shared/ui`.
- Update data optimistically: show existing `.data()` / `initState` immediately, then load the same resource from the backend (`retry()`) and replace it. Do not blank the UI or hide it behind a spinner while that refetch runs.

```ts
export const QuestionDialog = reatomComponent(({ questionId }: { questionId: string }) => {
  // ...
}, 'QuestionDialog');

// Preferred — logic lives in the model
const closeCreateQuestionDialog = action((questionId: string) => {
  createQuestionDialogOpen.setFalse();

  createQuestionForm.reset();
}, 'closeCreateQuestionDialog');

// In component — no extra values needed
onClick={wrap(closeCreateQuestionDialog)}

// In component — pass a prop value
const handleClose = wrap(() => closeCreateQuestionDialog(questionId));

return (
  <button onClick={handleClose}>
    Close
  </button>
);

// Avoid — inline side effects in JSX
onClick={wrap(() => {
  createQuestionDialogOpen.setFalse();

  createQuestionForm.reset();
})}
```

## Validation

Form schemas use Valibot via `reatomForm` `schema` (Standard Schema). Do not add Zod or React Hook Form.

## API client

- Frontend API calls go through `clientApi` from `@/shared/api` (`clientApi.loadQuestions()`, `clientApi.createQuestion()`, …), not raw RPC. Hono RPC (`hc<AppType>`) is an implementation detail of that slice.
- The questions list is the entity `questions` computed. Route loaders await that same computed. `questionRoute` and `theoryOpenedRoute` load one question with `clientApi.loadQuestion`. Mutations may still use `clientApi` in features or pages. See **Pages and routes**.
- Mutations and data that is not route-loaded may still use `clientApi` in features or pages.
- Keep the auth client (`authClient`) separate from that facade.
- Do not import `worker/` at runtime. The only allowed `src/` → `worker/` import is `import type { AppType } from '../../../worker'` in `@/shared/api`.

## UI

This project uses [SMUI](https://smui.statico.io) (shadcn/ui, duskbox-day / duskbox-dusk palettes) with Tailwind CSS v4.

- For any visual UI, shadcn primitives and SMUI patterns are the first priority. Use existing components in `src/shared/ui`, follow `.agents/skills/smui/SKILL.md`, and add missing widgets with the shadcn CLI (`components.json` already points at `shared/ui`).
- Write custom styles only when the desired appearance cannot be reached with shadcn and SMUI.
- Class names go through `cn` from `@/shared/lib`.
- Zero border radius. JetBrains Mono only. No emoji — use `lucide-react`.
- Labels, card titles, and status text are uppercase with wide tracking.
- Theme is the Reatom `theme` atom (`src/shared/theme`) plus the `.dark` class. Do not add `next-themes`.

## Auth

- Client: `authClient` in `@/shared/auth`. Session is a Reatom `computed` + `withAsyncData`. `isSignedIn` is `Boolean(session.data()?.user)`. Do not use `useSession`.
- Sign-in forms use `reatomForm`. After success, `session.retry()`.
- On `/sign-in`, the form is empty. Sign in uses `authClient.signIn.email`; if that account is gone, stay on `/sign-in` and toast that the user doesn't exist anymore. There is a link to `/sign-up`.
- On `/sign-up`, the form is empty. Create account calls `authClient.signUp.email`, then `session.retry()`. Toast Better Auth errors (duplicate email, rate limit). After success, `protectedRoute` sends the signed-in user to questions.
- Auth gates live in `protectedRoute` `params()` (see **Side effects and redirects on `reatomRoute`**):
  - Guests can open `/`, `/questions`, `/questions/:id`, and `/theory`. `/` replaces to questions. Loaders wait for `session.ready()` then fetch; with no session the worker returns the published snapshot.
  - Guests on `/sign-in` or `/sign-up` stay. Guests never auto-navigate to `/sign-up`.
  - Guests on `/profile` go to `/sign-in` (`profileRoute.params()`).
  - Signed-in users on `/` or auth URLs go to `questionsRoute`. Empty stays on `/questions`, otherwise a random `/questions/:id` unless already on a question page. Guests with a non-empty catalog follow the same landing.
  - `/theory` loads the same questions list and does not follow question landing. An open accordion item is `?id=`.
  - `/profile` is signed-in only; it does not load questions or follow question landing.
- Header `UserMenu` is the avatar menu when signed in. Guests see a Sign in link in that slot (no Theory header item).
- Header `Publish` is signed-in only. It opens a confirmation dialog, then while the snapshot is saving it shows a spinner and `Publishing...`. `POST /api/questions/publish` deletes every `published_question` row and inserts the signed-in user's current questions (an empty list clears the catalog). Last publisher wins. Later edits stay private until Publish is confirmed again.
- Create, update, and delete question submits are disabled for guests, with a hover tooltip. The worker still requires a session for POST/PUT/DELETE.
- Sign-out returns to `/sign-in` with an empty form (`signInRoute.go()` after `session.retry()`).
- Change password on `/profile` is new password + confirmation (no current password). Submit is on the right; Delete account is passed into the form as a `deleteUser` slot on the left. Success toasts, resets the form, and stays on `/profile`.
- Delete account on `/profile` removes the signed-in user and their questions, then `/sign-in` with an empty form.
- Cookie-consent UI lives in `pages/sign-in` and is only on `/sign-in`.
- Server auth and account APIs are in `worker/AGENTS.md`.

## Unit tests

- Vitest Browser Mode (`pnpm test`). Tests under `src/` live in a `tests/` folder next to the code they cover (`ui/tests/foo.test.tsx`, not `ui/foo.test.tsx`). Run in Chromium.
- Screenshots and visual snapshots for those tests live in the same `tests/` folder (including Vitest `__screenshots__/`). Do not put `__screenshots__/` next to production source.
- React components: `await render(...)` from `vitest-browser-react`, query with locators (`getByRole`, `getByText`), assert with `await expect.element(...).toBeVisible()`.
- Do not use `createRoot`, `flushSync`, jsdom, Cypress, or Testing Library-in-Node.
- Do not put Playwright specs in `src/` — those belong in `e2e/`.

## Naming

- Components: `PascalCase` + domain phrase (`UserEligibilityCard`, `ActiveSessionsTable`)
- Hooks: `use` + clear purpose (`useFilteredActiveUsers`, `useOnboardingModalVisibility`)
- Prefer full words in props (`user`, `config`, `options` — not `usr`, `cfg`, `opts`)
- Atoms/actions: **domain noun** (state) or **verb + domain object** (action). Do not encode Reatom in the name.

| Instead of (weak / technical) | Prefer (business) |
| ----------------------------- | ----------------- |
| `handleClickSubmit`           | `submitOrder`     |
| `userDataAtom`                | `user`            |
| `onChangeEmailInput`          | `changeEmail`     |

```ts
// Values — business intent
export const cartItems = atom<ReadonlyArray<CartItem>>([], 'cartItems');
export const user = atom<User | null>(null, 'user');
export const checkout = action(async () => { ... }, 'checkout');
export const applyDiscount = action((code: string) => { ... }, 'applyDiscount');
export const isCheckoutReady = computed(() => ..., 'isCheckoutReady');

// Values — technical noise
export const cartItemsArrayAtom = atom([], 'cartItemsArrayAtom');
export const handleCheckoutButtonClick = action(async () => { ... }, 'handleCheckoutButtonClick');
export const discountCodeProcessorFn = action((code: string) => { ... }, 'discountCodeProcessorFn');
export const userDataAtom = atom(null, 'userDataAtom');
```
