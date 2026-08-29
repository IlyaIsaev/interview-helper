# Frontend

General style, immutability, domain naming, and kebab-case come from the parent `AGENTS.md`. This file adds architecture, React, Reatom, UI, and unit-test conventions.

## Architecture

Use [Feature-Sliced Design (FSD)](https://fsd.how). Official docs for LLMs: https://fsd.how/llms.txt  
Local skill: `.agents/skills/feature-sliced-design/SKILL.md` — follow it when placing, moving, or reviewing code.

A module may import only from layers strictly below it (`app` → `pages` → `widgets` → `features` → `entities` → `shared`). Cross-imports between slices on the same layer are forbidden. Consume `features/`, `entities/`, and `widgets/` slices through their public `index.ts`. Pages are the exception: see **Pages and routes**.

Group `features/` and `entities/` slices by **business domain**, not by technical role.

- When a slice clearly belongs to one domain, put it in a domain folder: `features/questions/create-question`, `entities/questions/question`.
- The domain folder is only for navigation. It is not a slice: no `index.ts`, no `model/` / `ui/` / `api/` on the folder itself, and no shared files inside it. Import the slice: `@/features/questions/create-question`.
- Slices in the same domain folder may import each other **only as a last resort**, and only through an FSD cross-import (`@x`, e.g. `import { Question } from '@/entities/questions/question/@x/answer'`). Prefer merging slices, moving shared code down a layer, or composing from `pages/` / `app/` first.
- If the domain is unclear or the slice spans several domains (`cookie-consent`, `theme-switcher`, `user-menu`), keep it at the top of `features/` or `entities/`.

Not all layers are required. Start with `app/`, `pages/`, and `shared/`. Extract to `features/` or `entities/` only when the same code is used in more than one place. Do not adopt `widgets/` by default. When in doubt, keep code in the page.

Do not create empty `features/`, `entities/`, or `widgets/` folders.

Current layout:

```text
app/                 ← entrypoint, Reatom logger, routes, composition
                         protectedRoute: signed-in gate + landing (no page folder)
pages/home/          ← signed-in home route group (under protectedRoute)
  layout/            ← homeRoute chrome (sidebar + header; HomePage when no child)
  questions/         ← questions route group
    index/           ← questions list / empty state (/questions)
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
features/questions/show-answer/ ← reveal the answer on the question page
features/questions/toggle-sidebar/ ← open/close questions sidebar
features/questions/update-question/ ← dialog form to update a question + answer
widgets/questions-sidebar/ ← wires question links + create/update buttons into the sidebar entity
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
```

## Pages and routes

- Nest page folders to match `reatomRoute` parent/child inheritance in `src/app/routes.tsx`.
- A route folder is a group: it may contain child route folders, but not `ui/` or `model/`. The route’s own slice lives in `layout/` if the route has `layout: true`, otherwise in `index/` (`ui/`, `model/` when present).
- Page `ui/` files have only a default export (`export default HomePage`). Do not add a slice `index.ts`.
- Import pages in `src/app/routes.tsx` directly from those UI files, e.g. `@/pages/home/questions/index/ui/questions-page`.
- Load pages with `React.lazy(() => import('@/pages/home/questions/index/ui/questions-page'))`. Do not statically import page screens in `app/`.
- Pages export UI; they do not import from `app/`.
- If a resource is loaded for a route, fetch it in the `reatomRoute` `loader` in `src/app/routes.tsx`. Do not call `clientApi` for that resource from `entities/` or `features/`.
- The loader passes the API payload to an `init*` action (`init` + domain object: `initQuestionList`, `initQuestion`) on the entity or feature. Do not set the atom from the loader.
- The `init*` action performs **all** mapping and derivation that slice needs, then writes the atom. It does not fetch. Keep `.map`, field picking, and domain defaults out of the loader.
- UI reads the atom, not `route.loader.data()` from inside entities or features. Mutations and data that is not route-loaded may still use `clientApi` in features or pages.

```ts
export const questionList = atom<Array<QuestionListItem>>([], 'questionList')

export const initQuestionList = action((questions: Array<Question>) => {
  questionList.set(
    questions.map(({ id, question }) => ({ id, question })),
  )
}, 'initQuestionList')

async loader() {
  const { questions } = await wrap(clientApi.loadQuestions())

  initQuestionList(questions)
}

// Forbidden — entity/feature fetches a route-level resource
export const loadQuestionList = action(async () => {
  const { questions } = await wrap(clientApi.loadQuestions())
  questionList.set(questions)
}, 'loadQuestionList')

// Forbidden — loader maps into the entity/feature shape
async loader() {
  const { questions } = await wrap(clientApi.loadQuestions())

  initQuestionList(questions.map(({ id, question }) => ({ id, question })))
}
```

## React

- Declare with `function`, never arrow functions. This is the exception to the parent “prefer arrow functions” rule.
- Always extract props into a separate `type`.
- Keep components mostly pure: derive values, avoid unnecessary local mutation.

```ts
type FormProps = {
  id: string
}

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

Defaults:

- Import `src/app/setup.ts` before any other app module (already done in `main.tsx`).
- Name every atom, action, computed, effect, form, and route.
- Read with `atom()`; write with `atom.set(...)`.
- After `await` or in external callbacks, use `wrap(...)`.
- UI that reads atoms is a `reatomComponent(() => { ... }, 'Name')`. Keep it as dumb/declarative as possible. Never put multi-step side effects directly in JSX.
- Put logic in a dedicated `action` when several operations belong together. Actions may call other actions freely — this is the primary composition technique.
- Prefer extracting a named local handler (`const handleClose = wrap(...)`) so JSX stays clean. That local binding is not an action name; actions still use verb + domain object.
- Route screens through `render` on `reatomRoute`, not `if (!route.match())` in components.
- Form submit lives in `reatomForm({ onSubmit })`. Validate with a Valibot `schema`. Use field `validate` only for cross-field or async checks. Render every form with the shadcn form components in `@/shared/ui`.
- Update data optimistically: show existing `.data()` / `initState` immediately, then load the same resource from the backend (`retry()`) and replace it. Do not blank the UI or hide it behind a spinner while that refetch runs.
- Define routes in `src/app/routes.tsx`. Pages do not import from `app/`.

```ts
export const QuestionDialog = reatomComponent(({ questionId }: { questionId: string }) => {
  // ...
}, 'QuestionDialog')

// Preferred — logic lives in the model
const closeCreateQuestionDialog = action((questionId: string) => {
  createQuestionDialogOpen.setFalse()
  createQuestionForm.reset()
}, 'closeCreateQuestionDialog')

// In component — no extra values needed
onClick={wrap(closeCreateQuestionDialog)}

// In component — pass a prop value
const handleClose = wrap(() => closeCreateQuestionDialog(questionId))

return (
  <button onClick={handleClose}>
    Close
  </button>
)

// Avoid — inline side effects in JSX
onClick={wrap(() => {
  createQuestionDialogOpen.setFalse()
  createQuestionForm.reset()
})}
```

## Validation

- Form schemas use Valibot via `reatomForm` `schema` (Standard Schema). Do not add Zod or React Hook Form.

## API client

- Frontend API calls go through `clientApi` from `@/shared/api` (`clientApi.loadQuestions()`, `clientApi.createQuestion()`, …), not raw RPC. Hono RPC (`hc<AppType>`) is an implementation detail of that slice.
- Route-level resources: call `clientApi` in the route `loader`, then `init*` on the entity or feature. Do not call `clientApi` for that resource inside `entities/` or `features/`. See **Pages and routes**.
- Mutations and data that is not route-loaded may still use `clientApi` in features or pages.
- Keep the auth client (`authClient`) separate from that facade.
- Do not import `worker/` at runtime. The only allowed `src/` → `worker/` import is `import type { AppType } from '../../../worker'` in `@/shared/api`.

## UI

This project uses [SMUI](https://smui.statico.io) (a Nord-inspired shadcn/ui theme) with Tailwind CSS v4.

- For any visual UI, shadcn primitives and SMUI patterns are the first priority. Use existing components in `src/shared/ui`, follow `.agents/skills/smui/SKILL.md`, and add missing widgets with the shadcn CLI (`components.json` already points at `shared/ui`).
- Write custom styles only when the desired appearance cannot be reached with shadcn and SMUI.
- Class names go through `cn` from `@/shared/lib`.
- Zero border radius. JetBrains Mono only. No emoji — use `lucide-react`.
- Labels, card titles, and status text are uppercase with wide tracking.
- Theme is the Reatom `theme` atom (`src/shared/theme`) plus the `.dark` class. Do not add `next-themes`.

## Auth

- Client: `authClient` in `@/shared/auth`. Session is a Reatom `computed` + `withAsyncData`. Do not use `useSession`.
- Sign-in/up forms use `reatomForm`. After success, `session.retry()`. `protectedRoute` lands the user: empty list → `/questions`, otherwise a random `/questions/:id` unless already on a question page.
- Guests opening protected URLs are redirected to `/sign-in`. Guests on `/sign-in` or `/sign-up` stay. Signed-in users on auth URLs follow the same landing as `/`.
- `/profile` is behind `protectedRoute` for auth only; it does not follow question landing.
- Sign-out returns to `/sign-in` with the same demo credentials.
- Cookie-consent UI lives in `features/cookie-consent` and is only on `/sign-in`.
- Path strings live in `@/shared/config`. Pages and features must not import route atoms from `app/`.
- Server auth, demo-user creation, and cookie names are in `worker/AGENTS.md`.

## Unit tests

- Vitest Browser Mode (`pnpm test`). Tests live next to source as `*.test.ts(x)` and run in Chromium.
- Do not use jsdom, Cypress, or Testing Library-in-Node.
- Do not put Playwright specs in `src/` — those belong in `e2e/`.

## Naming

- Components: `PascalCase` + domain phrase (`UserEligibilityCard`, `ActiveSessionsTable`)
- Hooks: `use` + clear purpose (`useFilteredActiveUsers`, `useOnboardingModalVisibility`)
- Prefer full words in props (`user`, `config`, `options` — not `usr`, `cfg`, `opts`)
- Atoms/actions: **domain noun** (state) or **verb + domain object** (action). Do not encode Reatom in the name.

| Instead of (weak / technical) | Prefer (business) |
|-------------------------------|-------------------|
| `handleClickSubmit` | `submitOrder` |
| `userDataAtom` | `user` / `currentUser` |
| `onChangeEmailInput` | `changeEmail` |

```ts
// Values — business intent
export const cartItems = atom<CartItem[]>([], 'cartItems')
export const currentUser = atom<User | null>(null, 'currentUser')
export const checkout = action(async () => { ... }, 'checkout')
export const applyDiscount = action((code: string) => { ... }, 'applyDiscount')
export const isCheckoutReady = computed(() => ..., 'isCheckoutReady')

// Values — technical noise
export const cartItemsArrayAtom = atom([], 'cartItemsArrayAtom')
export const handleCheckoutButtonClick = action(async () => { ... }, 'handleCheckoutButtonClick')
export const discountCodeProcessorFn = action((code: string) => { ... }, 'discountCodeProcessorFn')
export const userDataAtom = atom(null, 'userDataAtom')
```
