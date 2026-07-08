# Auth Standard

## Clerk is the only auth provider

**This app uses Clerk (`@clerk/nextjs`) for all authentication. This is incredibly important — no exceptions.**

- Do NOT introduce another auth library or a hand-rolled session/cookie scheme.
- Do NOT read/verify cookies or JWTs manually — always go through Clerk's APIs.
- Sign-in and sign-up pages are Clerk's hosted components, mounted at `src/app/sign-in/[[...sign-in]]/page.tsx` and `src/app/sign-up/[[...sign-up]]/page.tsx`.

## Route protection happens in `src/proxy.ts` via `clerkMiddleware`

- `src/proxy.ts` defines the public route matcher (`createRouteMatcher`) and calls `auth.protect()` for every non-public route inside `clerkMiddleware`.
- Any new public route (marketing pages, webhooks that verify Clerk signatures themselves, etc.) must be added to the `isPublicRoute` matcher explicitly — routes are protected by default.
- Do not rely on client-side redirects or component-level checks as the only gate; the middleware is the source of truth for whether a request needs a session.

## Every Server Component and Server Action re-checks auth with `auth.protect()`

Middleware protects the route, but Server Components/Actions must still assert the session themselves — do not assume the middleware guarantee is enough on its own:

```ts
// src/app/dashboard/page.tsx (Server Component)
import { auth } from "@clerk/nextjs/server"

export default async function DashboardPage() {
  const { userId } = await auth.protect()
  // ...
}
```

```ts
// src/app/dashboard/actions.ts (Server Action)
"use server"

import { auth } from "@clerk/nextjs/server"

export async function logWorkout(/* typed args */) {
  const { userId } = await auth.protect()
  // ...
}
```

- Always import `auth` from `@clerk/nextjs/server` (not `@clerk/nextjs`) in Server Components and Server Actions.
- Use `await auth.protect()`, not `await auth()` — `auth.protect()` throws/redirects when there is no session, so `userId` is guaranteed non-null afterward. Don't manually null-check `userId` as a substitute.
- The returned `userId` is the only valid source of the current user's identity. Pass it into `/data` helpers (see `data-fetching.md` / `data-mutation.md`) to scope every query and mutation — never trust a `userId` supplied by the client.

## Client Components use Clerk's client APIs, never server auth helpers

- Client Components (`"use client"`) needing to know sign-in state or render user info use Clerk's client components/hooks: `<Show when="signed-in">` / `<Show when="signed-out">`, `<SignInButton>`, `<SignUpButton>`, `<UserButton>`, or hooks like `useUser()`/`useAuth()`.
- Never import `@clerk/nextjs/server` in a Client Component.
- Client Components must not decide access control themselves (e.g. hiding a button is not a security boundary) — the real check is the middleware plus `auth.protect()` in the Server Component/Action that actually reads or writes data.

## `ClerkProvider` wraps the whole app

- `src/app/layout.tsx` wraps `{children}` in `<ClerkProvider>` at the root. Do not add a second/nested `ClerkProvider`, and do not scope it to a subtree.
