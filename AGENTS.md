# Interview helper

TypeScript in this repo follows the conventions below. Frontend architecture, Reatom, Hono, and Playwright stay in the scoped files.

Write TypeScript in a **functional style**. Readability beats clever or shorter form. React components are the exception: declare them with `function` (see `src/AGENTS.md`).

`pnpm lint` (oxlint) enforces the mechanical subset: `Array<T>` / `ReadonlyArray<T>`, `type` over `interface`, `import type`, no `any`, no `!`, `prefer-as-const`, and related rules.

For collections, object updates, and composition, use `es-toolkit/fp`. For type utilities TypeScript does not ship, use `es-toolkit/types`. Do not chain native `Array.prototype` methods when a pipeline can say the same thing.

Name files in kebab-case after the business domain (`question.ts`, `session.ts`), not a technical role (`types.ts`, `utils.ts`, `helpers.ts`).

`worker-configuration.d.ts` is generated. Do not edit it to satisfy these rules.

## Working rules

- Smallest change that solves the task. Read relevant files first. Do not refactor unrelated code.
- State intent briefly, then edit. Match existing style unless asked otherwise.
- Update docs when behavior changes.
- Do not delete data or run destructive commands unless asked. Ask before broad or risky changes.

## Style

Pure functions: same inputs → same output; no hidden I/O; no mutation of arguments. Small functions, one concern each. Compose them.

- Immutable data. Never mutate objects, arrays, `Map`, or `Set`. Update by copy (`{ ...user, name }`, `pipe(items, sortBy(byName))`). No `push`, `splice`, mutating `sort` / `reverse`, `delete obj.key`, `obj.x =`.
- `const` by default. `let` only when a local is clearer than another step. Never `var`.
- Named exports. One public idea per file when practical. ESM only. Default export only for page `ui/` screens, the Worker `fetch` / `scheduled` entry, and tool config files (`vite.config.ts`, …). No side-effect imports. Pure modules do not read `process.env`, `window`, or the filesystem at import time — pass config in.
- No `any`. No non-null `!` unless a one-line comment explains why. Do not use `as` except `as const` and documented interop. Prefer `@ts-expect-error` with a description over `@ts-ignore`.
- Side effects (I/O, DOM, storage, logging, `Date.now`, `Math.random`, `fetch`) live at the edges. Domain logic stays pure. Do not hide `fetch` inside a `map` over domain data.
- No `switch`. No `else`. No nested `if`. No nested ternaries. Each `if` states its full condition. Sibling branches are mutually exclusive (`shared && A`, then `shared && !A`), not a later looser `if (shared)`.
- One-level ternary for two outcomes. More than two → a sequence of `if`s; last path is a plain `return`. After the last `if` on a union, assign `never` if it must be exhaustive. Multi-line JSX `return`s keep `{ }`.
- A guard that only `return`s or `throw`s is one line. No `{ }` around that body.
- Semicolon on every statement. No ASI.
- Blank line before a standalone `return`. Blank line between distinct units (guard, derivation, side effect, I/O). One blank is enough. Do not blank inside an expression, between same-kind imports, or between a comment and the line it documents. Stack only one thought: extract + reject; locals that finish one derivation; a short pipeline.
- Function declarations or `const` + arrow. Explicit return types on exported functions (React components do not need `JSX.Element`). Object argument past two or three similar parameters. Obvious positional args (`isDemoUserEmail(email)`) stay positional. Prefer required arguments; split the function instead of accumulating optionals. No classes or prototype methods for new domain logic.
- Files and folders: kebab-case (`user-profile.tsx`).

```ts
async loader() {
  if (!session.data()?.user) return;

  const { questions: nextQuestions } = await wrap(
    clientApi.loadQuestions(questionsQuery()),
  );

  initQuestions(nextQuestions);

  openSignedInDestination();
}

export const label = (n: number): string => {
  if (n > 0) return 'positive';

  if (n < 0) return 'negative';

  return 'zero';
};
```

Guard, fetch, init, and navigation are four units. Do not stack two side effects.

## Naming

The name should make the business value obvious without reading the RHS. Then drop filler.

If a function works on a context (store, collection, session, query), put that context in the name — reasonably, not every noun in the body. Match the binding.

Name the binding after what it holds: `questions`, not `questionList`. `List` / `Arr` / `Map` are structure, not the domain.

Do not repeat the item noun when the context already names it. Verb + collection is enough: `removeFromQuestions`, not `removeQuestionFromQuestions`. Keep a result word that is not the item: `getNamesFromUsers`.

```ts
const users: ReadonlyArray<User> = [];

const addToUsers = (user: User): ReadonlyArray<User> => [...users, user];

const getNamesFromUsers = (): ReadonlyArray<string> =>
  pipe(users, map((user) => user.name));
```

- **Functions:** domain action if it holds business logic (`submitOrder`); operation if it does not (`questionPath`). Reatom actions stay **verb + domain object** (`submitOrder`, not `handleClickSubmit`).
- **Bindings:** the domain value (`isQuestionOpened`, not `isActive`). Do not narrate provenance (`deleting`, `listed`, `fetched`). Frozen config: `SCREAMING_SNAKE_CASE`. Locals: `camelCase`.
- **Types:** domain noun, `PascalCase` (`User`). No `I`, `Type`, `Interface`, `DTO`, `Enum` suffixes. Components: `PascalCase`. Props types: `[ComponentName]Props`.
- **Booleans:** `is`, `has`, `should`, `can`, `will`, `did`.
- **Collections:** what they contain (`activeUsers`).
- DOM callback props: `on*`. Local DOM handlers: `handle*` (see `src/AGENTS.md`).
- Acronyms are words: `FaqList`, `generateUserUrl`.
- Generic type parameters start with `T` and a descriptive name (`TQuestion`, not `T` or `Question`).
- Single-letter names only for short-scope loop counters (`i`, `j`, `k`).
- Do not encode types, layers, or libraries (`UserDTO`, `fetchUserApiCall`).
- Comments explain why, not what. Prefer names over comments.

Drop unless it adds meaning: `data`, `info`, `value`, `item`, `obj`, `temp`, `result` / `res`, `handle` / `process` / `do` / `run`, `util` / `helper` / `manager`, bare `flag` / `status` / `state`, `arr` / `list` / `map`, type-in-the-name (`questionIdString`).

Keep a qualifier only when two bindings of the same noun collide, when it _is_ the business distinction (`sourceQuestionId` vs `targetQuestionId`), or when it is the context the function works on.

| Weak | Prefer |
| --- | --- |
| `questionList`, `userList` | `questions`, `users` |
| `addUser`, `addQuestionToList`, `addQuestionToQuestions` | `addToUsers`, `addToQuestions` |
| `removeQuestionFromQuestions`, `updateQuestionInQuestions`, `restoreQuestionToQuestions` | `removeFromQuestions`, `updateInQuestions`, `restoreToQuestions` |
| `initQuestionList`, `resetList`, `questionListQuery` | `initQuestions`, `resetQuestions`, `questionsQuery` |
| `getUserFromApi`, `handleClickSubmit` | `loadUser`, `submitOrder` |
| `isActive`, `isLoadingUserFlag` | `isQuestionOpened`, `isUserLoading` |
| `homePath`, `pathName` | `HOME_PATH`, `openedQuestionPath` |
| `IUser`, `UserDTO`, `OrderStatusEnum` | `User`, `OrderStatus` |
| `listedQuestions`, `currentlyDeletingQuestionIdentifier`, `qId` | `questions`, `questionId` |

## Compose small functions

Smallest named pure steps, then assemble. Split a function that both filters and formats. Do not extract a one-off wrapper that does not name a domain action. If point-free is harder to read, name the steps.

```ts
import { filter, map, pipe } from 'es-toolkit/fp';

const isAdult = (user: { age: number }): boolean => user.age >= 18;
const userName = (user: { name: string }): string => user.name;

export const adultNames = (
  users: ReadonlyArray<{ name: string; age: number }>,
): ReadonlyArray<string> => pipe(users, filter(isAdult), map(userName));
```

Prefer `pipe` + `map` / `filter` / `flatMap` / `find` / `some` / `every` from `es-toolkit/fp` over `for`. `for...of` only when no helper exists and inputs stay unmutated. Do not `reduce` a second program into existence when `filter`, `map`, `Object.groupBy`, or a named helper covers it.

## Absence, types, async

Missing values are `T | null` or `T | undefined`. `null`: explicitly empty (no user, failed lookup). `undefined`: omitted optional field. Domain functions return data, not wrappers. No `Option`, `Either`, `Result`, `ok` / `err`. Callers check `null` / `undefined`. Throw only at process / framework boundaries. Narrow with `typeof`, `in`, equality, optional chaining, or a type predicate.

```ts
export const firstAdult = (
  users: ReadonlyArray<{ age: number }>,
): { age: number } | undefined => pipe(users, find(isAdult));

export const divide = (a: number, b: number): number | null =>
  b === 0 ? null : a / b;
```

- Let inference work. Add an annotation only when it narrows the type.
- Define types with `type`, not `interface` (declaration merging is the exception). Write arrays as `Array<T>` / `ReadonlyArray<T>`, not `T[]`. Prefer `ReadonlyArray` / `DeepReadonly` for data that callers must not mutate. Separate type imports: `import type { Foo } from '...'`.
- Discriminated unions over booleans-plus-optional-fields that allow illegal states. Keep properties optional only when they may independently be absent. Prefer a literal union when only the value changes, not the shape.
- `satisfies` and `as const` / `as const satisfies` over widening. No enums — string-literal unions, or a const object when you need runtime values.
- Generate types from contracts where they exist (Hono `AppType`, Valibot `InferOutput`, Drizzle, `wrangler types`). Do not hand-write those shapes.

```ts
export const Status = {
  idle: 'idle',
  loading: 'loading',
  ready: 'ready',
} as const;

export type Status = (typeof Status)[keyof typeof Status];
```

`async` / `await` at the edge. `Promise.all` for independent work. No mutable accumulators across awaits.

```ts
export const loadJson = async (url: string): Promise<unknown> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  return response.json();
};
```

## Before you finish

1. Easy to read. Drop anything that is only clever.
2. Names: product action vs operation vs business value. Collections are `questions`, not `questionList`. Context in the name, no repeated item (`removeFromQuestions`). Frozen config is `SCREAMING_SNAKE_CASE`. Types are domain nouns, not wrappers.
3. Small pure functions, composed. No mutation, no extra `let`. I/O stays out of mappers. Collections go through `es-toolkit/fp`.
4. Semicolons. One-line `if` for `return` / `throw`. Blank line before a standalone `return` and between distinct units. No nested `if`, `switch`, or `else`.
5. No unnamed one-off helper. Rename leftover generics (`data`, `result`, `process`, `handleX`).
6. Exhaustive unions. Return types on exports. kebab-case files.

## Scoped rules

- Frontend (FSD, React, Reatom, SMUI, Vitest): [`src/AGENTS.md`](./src/AGENTS.md)
- Backend (Hono, wrangler, D1): [`worker/AGENTS.md`](./worker/AGENTS.md)
- End-to-end tests: [`e2e/AGENTS.md`](./e2e/AGENTS.md)
- Agent in-session browsing: `.agents/skills/lightpanda/SKILL.md` (Lightpanda MCP only; Chromium stays for `pnpm test` / `pnpm test:e2e`)
