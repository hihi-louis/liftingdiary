"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { createWorkoutForUser, type LoggedSet } from "@/data/workouts"

const setSchema = z.object({
  reps: z.number().int().positive(),
  weight: z.number().min(0).nullable(),
})

const logWorkoutSchema = z.object({
  date: z.date(),
  title: z.string().trim().max(255).nullable(),
  exerciseName: z.string().trim().min(1, "Please choose or enter an exercise."),
  sets: z.array(setSchema).min(1, "Add at least one set."),
})

export type LogWorkoutInput = {
  date: Date
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

  const { date, title, exerciseName, sets } = parsed.data

  await createWorkoutForUser(userId, { date, title, exerciseName, sets })

  revalidatePath("/dashboard")
  return {}
}
