import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

const relations = defineRelations(schema, (r) => ({
  workoutsTable: {
    workoutExercises: r.many.workoutExercisesTable(),
  },
  exercisesTable: {
    workoutExercises: r.many.workoutExercisesTable(),
  },
  workoutExercisesTable: {
    workout: r.one.workoutsTable({
      from: r.workoutExercisesTable.workoutId,
      to: r.workoutsTable.id,
      optional: false,
    }),
    exercise: r.one.exercisesTable({
      from: r.workoutExercisesTable.exerciseId,
      to: r.exercisesTable.id,
      optional: false,
    }),
    sets: r.many.setsTable(),
  },
  setsTable: {
    workoutExercise: r.one.workoutExercisesTable({
      from: r.setsTable.workoutExerciseId,
      to: r.workoutExercisesTable.id,
      optional: false,
    }),
  },
}));

export default relations;