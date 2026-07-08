import { auth } from "@clerk/nextjs/server"

import { getWorkoutsForUser } from "@/data/workouts"
import { getAllExercises } from "@/data/exercises"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const { userId } = await auth.protect()
  const [workouts, exercises] = await Promise.all([
    getWorkoutsForUser(userId),
    getAllExercises(),
  ])

  return <DashboardClient workouts={workouts} exercises={exercises} />
}
