import "server-only";

import db from "@/db";

export async function getAllExercises() {
  return db.query.exercisesTable.findMany({
    orderBy: (exercises, { asc }) => [asc(exercises.name)],
  });
}

export type Exercise = Awaited<ReturnType<typeof getAllExercises>>[number];
