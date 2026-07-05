import {
  pgTable,
  integer,
  varchar,
  timestamp,
  numeric,
  index,
} from "drizzle-orm/pg-core";

export const exercisesTable = pgTable("exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const workoutsTable = pgTable(
  "workouts",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    userId: varchar("user_id", { length: 255 }).notNull(), // Clerk user id
    name: varchar({ length: 255 }),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("workouts_user_id_idx").on(table.userId)],
);

export const workoutExercisesTable = pgTable(
  "workout_exercises",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    workoutId: integer("workout_id")
      .notNull()
      .references(() => workoutsTable.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id")
      .notNull()
      .references(() => exercisesTable.id, { onDelete: "restrict" }),
    order: integer().notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("workout_exercises_workout_id_idx").on(table.workoutId)],
);

export const setsTable = pgTable(
  "sets",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    workoutExerciseId: integer("workout_exercise_id")
      .notNull()
      .references(() => workoutExercisesTable.id, { onDelete: "cascade" }),
    setNumber: integer("set_number").notNull(),
    reps: integer().notNull(),
    weight: numeric({ precision: 6, scale: 2 }), // nullable: bodyweight sets
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("sets_workout_exercise_id_idx").on(table.workoutExerciseId),
  ],
);
