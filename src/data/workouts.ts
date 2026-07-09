import "server-only";

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
    date,
    title,
    exerciseName,
    sets,
  }: {
    date: Date;
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
    .values({ userId, name: title, startedAt: date, completedAt: date })
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
