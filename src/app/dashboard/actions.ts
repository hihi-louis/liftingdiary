"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  createWorkoutForUser,
  deleteWorkoutForUser,
  updateWorkoutForUser,
  type LoggedSet,
} from "@/data/workouts"

const setSchema = z.object({
  reps: z.number().int().positive(),
  weight: z.number().min(0).nullable(),
})

const logWorkoutSchema = z
  .object({
    startedAt: z.date(),
    endedAt: z.date().nullable(),
    title: z.string().trim().max(255).nullable(),
    exerciseName: z.string().trim().min(1, "Please choose or enter an exercise."),
    sets: z.array(setSchema).min(1, "Add at least one set."),
  })
  .refine((data) => data.endedAt === null || data.endedAt >= data.startedAt, {
    message: "End time must be after start time.",
    path: ["endedAt"],
  })

export type LogWorkoutInput = {
  startedAt: Date
  endedAt: Date | null
  title: string | null
  exerciseName: string
  sets: LoggedSet[]
}

export type LogWorkoutResult = { error: string } | { error?: undefined }

export async function logWorkout(
  input: LogWorkoutInput,
): Promise<LogWorkoutResult> {
  const { userId } = await auth.protect()

  const parsed = logWorkoutSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." }
  }

  const { startedAt, endedAt, title, exerciseName, sets } = parsed.data

  await createWorkoutForUser(userId, {
    startedAt,
    completedAt: endedAt,
    title,
    exerciseName,
    sets,
  })

  revalidatePath("/dashboard")
  return {}
}

const editWorkoutSchema = z
  .object({
    workoutId: z.number().int().positive(),
    startedAt: z.date(),
    endedAt: z.date().nullable(),
    title: z.string().trim().max(255).nullable(),
    exerciseName: z.string().trim().min(1, "Please choose or enter an exercise."),
    sets: z.array(setSchema).min(1, "Add at least one set."),
  })
  .refine((data) => data.endedAt === null || data.endedAt >= data.startedAt, {
    message: "End time must be after start time.",
    path: ["endedAt"],
  })

export type EditWorkoutInput = {
  workoutId: number
  startedAt: Date
  endedAt: Date | null
  title: string | null
  exerciseName: string
  sets: LoggedSet[]
}

export async function editWorkout(
  input: EditWorkoutInput,
): Promise<LogWorkoutResult> {
  const { userId } = await auth.protect()

  const parsed = editWorkoutSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." }
  }

  const { workoutId, startedAt, endedAt, title, exerciseName, sets } =
    parsed.data

  await updateWorkoutForUser(userId, workoutId, {
    startedAt,
    completedAt: endedAt,
    title,
    exerciseName,
    sets,
  })

  revalidatePath("/dashboard")
  return {}
}

const deleteWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
})

export type DeleteWorkoutInput = {
  workoutId: number
}

export async function deleteWorkout(
  input: DeleteWorkoutInput,
): Promise<LogWorkoutResult> {
  const { userId } = await auth.protect()

  const parsed = deleteWorkoutSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." }
  }

  await deleteWorkoutForUser(userId, parsed.data.workoutId)

  revalidatePath("/dashboard")
  return {}
}
