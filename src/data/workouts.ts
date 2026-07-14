import "server-only";

import { and, eq } from "drizzle-orm";
import { format, isSameWeek, isSameMonth } from "date-fns";

import db from "@/db";
import {
  exercisesTable,
  workoutExercisesTable,
  workoutsTable,
  setsTable,
} from "@/db/schema";

export async function getWorkoutsForUser(userId: string) {
  return db.query.workoutsTable.findMany({
    where: { userId },
    with: {
      workoutExercises: {
        orderBy: (workoutExercises, { asc }) => [asc(workoutExercises.order)],
        with: {
          exercise: true,
          sets: {
            orderBy: (sets, { asc }) => [asc(sets.setNumber)],
          },
        },
      },
    },
    orderBy: (workouts, { desc }) => [desc(workouts.startedAt)],
  });
}

export type WorkoutWithExercises = Awaited<
  ReturnType<typeof getWorkoutsForUser>
>[number];

export type LoggedSet = {
  reps: number;
  weight: number | null;
};

export async function createWorkoutForUser(
  userId: string,
  {
    startedAt,
    completedAt,
    title,
    exerciseName,
    sets,
  }: {
    startedAt: Date;
    completedAt: Date | null;
    title: string | null;
    exerciseName: string;
    sets: LoggedSet[];
  },
) {
  const trimmedName = exerciseName.trim();
  if (!trimmedName) throw new Error("Exercise name is required");
  if (sets.length === 0) throw new Error("At least one set is required");

  // The neon-http driver has no transaction support, so this runs as
  // sequential statements rather than an atomic transaction.
  let exercise = await db.query.exercisesTable.findFirst({
    where: { name: trimmedName },
  });

  if (!exercise) {
    [exercise] = await db
      .insert(exercisesTable)
      .values({ name: trimmedName })
      .onConflictDoUpdate({
        target: exercisesTable.name,
        set: { updatedAt: new Date() },
      })
      .returning();
  }

  const [workout] = await db
    .insert(workoutsTable)
    .values({ userId, name: title, startedAt, completedAt })
    .returning();

  const [workoutExercise] = await db
    .insert(workoutExercisesTable)
    .values({ workoutId: workout.id, exerciseId: exercise.id, order: 0 })
    .returning();

  await db.insert(setsTable).values(
    sets.map((set, index) => ({
      workoutExerciseId: workoutExercise.id,
      setNumber: index + 1,
      reps: set.reps,
      weight: set.weight !== null ? set.weight.toString() : null,
    })),
  );

  return workout;
}

export async function updateWorkoutForUser(
  userId: string,
  workoutId: number,
  {
    startedAt,
    completedAt,
    title,
    exerciseName,
    sets,
  }: {
    startedAt: Date;
    completedAt: Date | null;
    title: string | null;
    exerciseName: string;
    sets: LoggedSet[];
  },
) {
  const trimmedName = exerciseName.trim();
  if (!trimmedName) throw new Error("Exercise name is required");
  if (sets.length === 0) throw new Error("At least one set is required");

  // The neon-http driver has no transaction support, so this runs as
  // sequential statements rather than an atomic transaction.
  const [workout] = await db
    .update(workoutsTable)
    .set({ name: title, startedAt, completedAt })
    .where(
      and(eq(workoutsTable.id, workoutId), eq(workoutsTable.userId, userId)),
    )
    .returning();

  if (!workout) throw new Error("Workout not found");

  let exercise = await db.query.exercisesTable.findFirst({
    where: { name: trimmedName },
  });

  if (!exercise) {
    [exercise] = await db
      .insert(exercisesTable)
      .values({ name: trimmedName })
      .onConflictDoUpdate({
        target: exercisesTable.name,
        set: { updatedAt: new Date() },
      })
      .returning();
  }

  const existingWorkoutExercise = await db.query.workoutExercisesTable.findFirst(
    { where: { workoutId: workout.id } },
  );

  let workoutExerciseId: number;
  if (existingWorkoutExercise) {
    workoutExerciseId = existingWorkoutExercise.id;
    await db
      .update(workoutExercisesTable)
      .set({ exerciseId: exercise.id })
      .where(eq(workoutExercisesTable.id, workoutExerciseId));
    await db
      .delete(setsTable)
      .where(eq(setsTable.workoutExerciseId, workoutExerciseId));
  } else {
    const [workoutExercise] = await db
      .insert(workoutExercisesTable)
      .values({ workoutId: workout.id, exerciseId: exercise.id, order: 0 })
      .returning();
    workoutExerciseId = workoutExercise.id;
  }

  await db.insert(setsTable).values(
    sets.map((set, index) => ({
      workoutExerciseId,
      setNumber: index + 1,
      reps: set.reps,
      weight: set.weight !== null ? set.weight.toString() : null,
    })),
  );

  return workout;
}

export type WorkoutStats = {
  daysThisWeek: number;
  daysThisMonth: number;
  topExercise: { name: string; percent: number } | null;
};


export function computeWorkoutStats(
  workouts: WorkoutWithExercises[],
): WorkoutStats {
  const now = new Date();

  const daysThisWeek = new Set(
    workouts
      .filter((w) => isSameWeek(w.startedAt, now, { weekStartsOn: 1 }))
      .map((w) => format(w.startedAt, "yyyy-MM-dd")),
  ).size;

  const daysThisMonth = new Set(
    workouts
      .filter((w) => isSameMonth(w.startedAt, now))
      .map((w) => format(w.startedAt, "yyyy-MM-dd")),
  ).size;

  let topExercise: WorkoutStats["topExercise"] = null;
  if (workouts.length > 0) {
    const counts = new Map<string, number>();
    for (const workout of workouts) {
      const name = workout.workoutExercises[0]?.exercise.name;
      if (!name) continue;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    let topName: string | null = null;
    let topCount = 0;
    for (const [name, count] of counts) {
      if (count > topCount) {
        topName = name;
        topCount = count;
      }
    }

    if (topName) {
      topExercise = {
        name: topName,
        percent: Math.round((topCount / workouts.length) * 100),
      };
    }
  }

  return { daysThisWeek, daysThisMonth, topExercise };
}

export async function deleteWorkoutForUser(userId: string, workoutId: number) {
  const [deleted] = await db
    .delete(workoutsTable)
    .where(
      and(eq(workoutsTable.id, workoutId), eq(workoutsTable.userId, userId)),
    )
    .returning();

  if (!deleted) throw new Error("Workout not found");

  return deleted;
}
