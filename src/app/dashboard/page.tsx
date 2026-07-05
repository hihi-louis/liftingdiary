import { auth } from "@clerk/nextjs/server"

import { getWorkoutsForUser } from "@/data/workouts"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const { userId } = await auth.protect()
  const workouts = await getWorkoutsForUser(userId)

  return <DashboardClient workouts={workouts} />
}
