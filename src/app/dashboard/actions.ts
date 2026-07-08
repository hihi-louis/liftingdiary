"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

import { createWorkoutForUser, type LoggedSet } from "@/data/workouts"

export type LogWorkoutResult = { error: string } | { error?: undefined }

export async function logWorkout(formData: FormData): Promise<LogWorkoutResult> {
  const { userId } = await auth.protect()

  const dateValue = formData.get("date")
  const exerciseSelect = formData.get("exercise")
  const customExercise = formData.get("customExercise")

  const date = typeof dateValue === "string" ? new Date(dateValue) : null
  if (!date || Number.isNaN(date.getTime())) {
    return { error: "Please choose a valid date." }
  }

  const exerciseName =
    exerciseSelect === "__custom__"
      ? String(customExercise ?? "").trim()
      : String(exerciseSelect ?? "").trim()

  if (!exerciseName) {
    return { error: "Please choose or enter an exercise." }
  }

  const setCount = Number(formData.get("setCount") ?? 0)
  const sets: LoggedSet[] = []

  for (let i = 0; i < setCount; i++) {
    const reps = Number(formData.get(`sets[${i}].reps`))
    const weightRaw = formData.get(`sets[${i}].weight`)
    const weight =
      weightRaw === null || weightRaw === "" ? null : Number(weightRaw)

    if (!Number.isFinite(reps) || reps <= 0) {
      return { error: "Each set needs a valid number of reps." }
    }
    if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
      return { error: "Weight must be a valid positive number." }
    }

    sets.push({ reps, weight })
  }

  if (sets.length === 0) {
    return { error: "Add at least one set." }
  }

  await createWorkoutForUser(userId, { date, exerciseName, sets })

  revalidatePath("/dashboard")
  return {}
}
