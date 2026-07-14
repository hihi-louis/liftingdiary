# Routing Standard

## All app routes live under `/dashboard`

- Every feature route in this app is a sub-route of `/dashboard` (e.g. `/dashboard`, `/dashboard/settings`, `/dashboard/workouts/[id]`).
- Do NOT add top-level feature routes outside `/dashboard` (e.g. no `src/app/settings/page.tsx`) — nest them under `src/app/dashboard/`.
- `/`, `/sign-in`, `/sign-up` are the only routes that exist outside `/dashboard`, and they exist solely to support the signed-out flow (landing + Clerk's hosted auth pages).

## Route protection is done via Next.js middleware (`src/proxy.ts`), not `middleware.ts`

**This Next.js version renames the middleware file convention to `proxy.ts` — do not create a `middleware.ts`, it will not run.**

- Route protection is implemented once, in `src/proxy.ts`, using `clerkMiddleware` + `createRouteMatcher`. See `auth.md` for the full auth contract.
- `/dashboard` and all of its sub-routes must NOT be listed in the `isPublicRoute` matcher in `src/proxy.ts` — they are protected by default because the matcher denylists only `/`, `/sign-in(.*)`, `/sign-up(.*)`.
- Do not add a second middleware/proxy file, and do not attempt route protection via a root `layout.tsx` check, a `redirect()` in individual pages, or client-side gating — `src/proxy.ts` is the single source of truth for whether a request under `/dashboard` requires a session.
- Every Server Component/Action under `/dashboard` must still re-check auth with `auth.protect()` per `auth.md` — the proxy is not a substitute for that.

## Adding a new page under `/dashboard`

1. Create the route as `src/app/dashboard/<segment>/page.tsx` (or a nested segment thereof).
2. Do not add the new segment to `isPublicRoute` in `src/proxy.ts` — leaving it out is what makes it protected.
3. Follow `data-fetching.md` / `data-mutation.md` for how the page loads and mutates data, and `ui.md` for component conventions.
