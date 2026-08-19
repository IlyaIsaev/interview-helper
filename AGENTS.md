# Coding standards

Prefer a **functional style** by default: pure functions, expressions over statements, immutability, composition, and declarative data transformations. Names should express **business meaning**, not technical mechanics.

Write **pure functions** whenever possible (same inputs → same output, no side effects). Push side effects (I/O, state updates) to the edges. Prefer small focused functions composed together over large imperative blocks.

Scoped rules:

- Frontend (FSD, React, Reatom, SMUI, Vitest): `src/AGENTS.md`
- Backend (Hono, wrangler, D1): `worker/AGENTS.md`
- End-to-end tests: `e2e/AGENTS.md`

## Style

- Use `const` by default. Never use `let` unless reassignment is truly unavoidable.
- One blank line before every `return`.
- Blank line between consecutive top-level statements and between exports.

```ts
export const a = 1

export const b = 2
```

## Functions and control flow

- Prefer arrow functions. Keep them small and focused on a single responsibility.
- Prefer ternaries and expressions when they stay readable: `condition ? a : b`.
- Use `&&` / `||` only inside `if` conditions or ternaries — never as standalone statements.
- Always use curly braces with `if`.
- Prefer independent `if` statements (early returns) over nested `if-else` chains. Extract predicates when conditionals get complex.

```ts
const sum = (a: number, b: number) => a + b

// Preferred
const value = condition ? a : b

if (condition && another) {
  doSomething()
}

if (!isValid) {
  return
}

// Forbidden
condition && doSomething()
if (condition) return
```

## Immutability and data

- Never mutate objects or arrays in place. Never create an empty object/array and then mutate it.
- Prefer object/array spread, `map`, `filter`, `flatMap`, `reduce`, and other non-mutating methods.
- Use `for...of` only when the imperative form is clearly more readable or necessary for control flow.
- Chain transformations declaratively when it improves clarity.
- Prefer object spread with conditional properties.

```ts
// Preferred
const next = {
  ...prev,
  count: prev.count + 1,
}
const items = list.map((item) => ({ ...item, active: true }))
const activeNames = users
  .filter((user) => user.active)
  .map((user) => user.name)

;(search: Record<string, unknown>): SignInSearch => ({
  ...(typeof search.redirect === 'string' && { redirect: search.redirect }),
})

// Forbidden
const next = prev
next.count += 1

const result = {}
result.a = 1

const activeNames = []
for (const user of users) {
  if (user.active) {
    activeNames.push(user.name)
  }
}
```

## Naming

Prefer **concise, intention-revealing names that express business meaning**, not technical mechanics. A good name makes the code understandable even if the implementation is hidden. Prefer domain language over framework/API jargon.

1. Name after **what the business cares about**, not how it is implemented.
2. Keep names short enough to scan, but precise enough to be unambiguous.
3. Functions: **verb + domain object** (or clear domain phrase).
4. Constants: **domain noun** (state) or **domain phrase** (config/flag). True config literals may use `SCREAMING_SNAKE_CASE` when the meaning is the value itself (`SECONDS_IN_A_DAY`).
5. Types: **domain noun** in `PascalCase`. Prefer `User` over `IUser`, `UserType`, `UserInterface`, `UserDTO`.
6. Booleans: start with `is`, `has`, `should`, `can`, `will`, or `did`.
7. Do not encode types, layers, or libraries in the name (`UserDTO`, `fetchUserApiCall`).
8. Collections should describe what they contain (`activeUsers`, not `users` or `filtered` when more precision helps).
9. Single-letter names only for classic short-scope loop counters (`i`, `j`, `k`).

Avoid filler and generic names unless they add real meaning:

- `data`, `info`, `value`, `item`, `element`, `obj`, `temp`, `tmp`
- `result`, `res`, `ret`, `output`
- `handle`, `process`, `do`, `run`, `exec`, `perform` (as function names)
- `util`, `helper`, `utils`, `helpers`, `misc`, `manager`
- `flag`, `status`, `state` (without more context)
- `arr`, `list`, `map`, `dict` (use domain meaning instead)
- `Type`, `Interface` suffixes

| Instead of (weak / technical) | Prefer (business) |
|-------------------------------|-------------------|
| `getUserFromApi` | `loadUser` / `fetchUser` |
| `handleClickSubmit` | `submitOrder` |
| `isLoadingUserFlag` | `isUserLoading` |
| `validateFormValues` | `validateLogin` |
| `processPaymentResponse` | `confirmPayment` |
| `TEMP_MAX_RETRY_COUNT` | `maxPaymentRetries` |
| `IUser`, `UserType`, `UserDTO` | `User` |
| `OrderStatusEnum` | `OrderStatus` |
| `CartItemType` | `CartItem` |
| `data`, `info`, `result`, `res` | domain-specific name |
| `process`, `handle`, `doSomething` | verb + domain object |
| `verified`, `active`, `show` (booleans) | `isEmailVerified`, `hasActiveSubscription`, `shouldShowWarning` |

```ts
// Types — domain nouns
type User = {
  id: string
  email: string
}

type OrderStatus = 'draft' | 'paid' | 'shipped'

type CartItem = {
  productId: string
  quantity: number
}

// Types — technical noise
type IUser = { ... }
type UserType = { ... }
type UserDTO = { ... }
type UserApiResponseData = { ... }
type OrderStatusEnum = 'draft' | 'paid' | 'shipped'
type CartItemType = { ... }

// Weak
const d = 86400
const flag = true

const process = (u) => {
  const arr = u.filter((x) => x.v)
  return arr
}

// Strong
const SECONDS_IN_A_DAY = 86400
const isFeatureEnabled = true

const getVerifiedActiveUsers = (users: User[]) => {
  return users.filter((user) => user.isVerified)
}
```

## Checklist

After writing any non-trivial code:

1. Would a product person understand this name without reading the body?
2. Does it say *why this exists in the product*, not *how the code works*?
3. For types: is it the domain concept (`User`, `Order`) rather than a wrapper (`UserDTO`, `IUser`)?
4. Can it be shorter without losing meaning — or longer without becoming noise?
5. Rename anything still generic (`data`, `result`, `process`, `handleX` without domain context).
6. No in-place mutation, no `let` unless required, blank line before every `return`.

When generating or refactoring code, rewrite mechanical names into domain names using this policy.

## File and folder naming

- Use **kebab-case** for all file and folder names (`user-profile.tsx`, `api-client.ts`, `create-documents.ts`).
- Do not use camelCase, PascalCase, or snake_case for file or folder names.
