# Data Fetching Standard

## Server components only

**All data fetching in this app must be done via React Server Components. This is incredibly important — no exceptions.**

- Do NOT fetch data in Route Handlers (`route.ts`).
- Do NOT fetch data in Client Components (`"use client"`).
- Do NOT fetch data any other way (middleware, edge functions, third-party client-side data libraries, etc.).
- If a client component needs data, the parent server component must fetch it and pass it down as props.

## Data access: helper functions in `/data` only

- Every database query must go through a helper function defined in the `/data` directory (e.g. `src/data/workouts.ts`, `src/data/exercises.ts`).
- Server components call these helper functions — they must never construct or run a database query inline.
- Helper functions must be built with **Drizzle ORM**. **Raw SQL is not allowed** (no `sql\`...\``` template escapes for whole queries, no raw driver queries).

## Data isolation is mandatory

**A user must never be able to read, list, or mutate another user's data.** Every helper function in `/data` that touches user-owned tables must:

- Take the authenticated user's ID (from the current session) and scope every query with a `where` clause on that user ID (e.g. `eq(workouts.userId, userId)`).
- Never accept a caller-supplied user ID as the sole means of scoping a query — always derive the current user from the session/auth context inside the server component, not from client input.
- Never expose a helper that queries across all users unless it is explicitly an admin-only path with its own authorization check.

## Example

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

```tsx
// src/app/dashboard/page.tsx (Server Component)
import { getWorkoutsForUser } from "@/data/workouts";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const { userId } = await auth();
  const workouts = await getWorkoutsForUser(userId);

  return <WorkoutList workouts={workouts} />;
}
```
