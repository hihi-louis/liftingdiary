# LiftingDiary

A workout logging app. Sign in, pick a date on the dashboard calendar, and log exercises/sets for that day.

## Stack

- [Next.js](https://nextjs.org) (App Router, Turbopack, React Compiler enabled)
- [Clerk](https://clerk.com) for authentication
- [Neon](https://neon.tech) (Postgres) + [Drizzle ORM](https://orm.drizzle.team) for data
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) for UI

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env` and fill in the required values:

   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — from your [Clerk dashboard](https://dashboard.clerk.com)
   - `DATABASE_URL` — a Postgres connection string (e.g. from [Neon](https://neon.tech))

3. Push the database schema:

   ```bash
   npx drizzle-kit push
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint

## Project structure

- `src/app/dashboard/` — the authenticated app; every feature route is nested under here
- `src/app/sign-in/`, `src/app/sign-up/` — Clerk's hosted auth pages
- `src/data/` — Drizzle query helpers; all database access goes through this layer, scoped to the current user
- `src/db/` — Drizzle schema and client
- `src/components/ui/` — shadcn/ui primitives
- `src/proxy.ts` — Clerk middleware; protects everything except `/`, `/sign-in`, `/sign-up`

## Conventions

Coding conventions for this repo are documented in `/docs` (UI, data fetching, data mutation, auth, routing) and are enforced for any AI-assisted changes via `AGENTS.md` / `CLAUDE.md`. Read those before adding new routes, data helpers, or UI.

Note: this project pins a Next.js version with some API/convention differences from the version most tooling and docs assume (e.g. middleware lives in `src/proxy.ts`, not `middleware.ts`). See `node_modules/next/dist/docs/` for the version-specific docs.
