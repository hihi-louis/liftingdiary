import "server-only";

import db from "@/db";

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
