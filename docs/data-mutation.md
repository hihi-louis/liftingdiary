# Data Mutation Standard

## Server actions only

**All data mutations in this app must be done via Server Actions. This is incredibly important — no exceptions.**

- Do NOT mutate data in Route Handlers (`route.ts`).
- Do NOT mutate data directly from Client Components (no client-side fetch to a custom API, no third-party client-side mutation libraries).
- Client Components trigger mutations by calling an imported server action.

## Server actions live in colocated `actions.ts` files

- Every server action must be defined in a file named `actions.ts`, colocated with the route/feature it belongs to (e.g. `src/app/dashboard/actions.ts`).
- Each file must start with `"use server"`.
- Do not define server actions inline inside component files.

## Data mutation: helper functions in `/data` only

- Every database mutation must go through a helper function defined in the `src/data` directory (e.g. `src/data/workouts.ts`, `src/data/exercises.ts`).
- Server actions call these helper functions — they must never construct or run a database mutation (insert/update/delete) inline.
- Helper functions must be built with **Drizzle ORM**. **Raw SQL is not allowed** (no `sql\`...\`` template escapes for whole queries, no raw driver queries).
- The same `/data` helper files used for fetching (see `data-fetching.md`) should also hold mutation helpers, scoped by domain (workouts, exercises, etc.), not by fetch-vs-mutate.

## Server action parameters must be typed — no `FormData`

- Server actions must accept explicitly typed parameters (primitives, objects, arrays with proper TypeScript types).
- Server actions must **NOT** accept a `FormData` parameter. Forms must be wired up so the client extracts typed values and calls the action with typed arguments (e.g. via `react-hook-form`, controlled state, or manually reading fields), not via the `action={serverAction}` form-native pattern with raw `FormData`.

## All server actions must validate arguments with Zod

- Every server action must define a Zod schema for its parameters and parse/validate the incoming arguments with it before doing anything else.
- If validation fails, the action must return a typed error result — never let an unvalidated value reach a `/data` helper.
- Never trust the TypeScript types alone as validation — types are erased at runtime, so Zod parsing is mandatory even when the caller is fully typed.

## Data isolation is mandatory

**A user must never be able to mutate another user's data.** Every mutation helper function in `/data` that touches user-owned tables must:

- Take the authenticated user's ID (from the current session) and scope every mutation with a `where` clause on that user ID (e.g. `eq(workouts.userId, userId)`).
- Never accept a caller-supplied user ID as the sole means of scoping a mutation — always derive the current user from the session/auth context inside the server action, not from client input.

## Example

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function createWorkoutForUser(userId: string, name: string) {
  return db.insert(workouts).values({ userId, name }).returning();
}

export async function deleteWorkoutForUser(userId: string, workoutId: string) {
  return db
    .delete(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
}
```

```ts
// src/app/dashboard/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { createWorkoutForUser, deleteWorkoutForUser } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function createWorkout(input: { name: string }) {
  const { userId } = await auth();
  const parsed = createWorkoutSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten() };
  }

  const [workout] = await createWorkoutForUser(userId, parsed.data.name);
  return { success: true as const, workout };
}

const deleteWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
});

export async function deleteWorkout(input: { workoutId: string }) {
  const { userId } = await auth();
  const parsed = deleteWorkoutSchema.safeParse(input);

  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten() };
  }

  await deleteWorkoutForUser(userId, parsed.data.workoutId);
  return { success: true as const };
}
```

```tsx
// src/app/dashboard/workout-form.tsx (Client Component)
"use client";

import { createWorkout } from "./actions";

export function WorkoutForm() {
  async function handleSubmit(name: string) {
    const result = await createWorkout({ name });
    if (!result.success) {
      // handle error
    }
  }

  // ...
}
```
