import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { auth, currentUser } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

import { getWorkoutsForUser, computeWorkoutStats } from "@/data/workouts";
import { Navbar } from "@/components/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function WorkoutStatus({
  workouts,
}: {
  workouts: Awaited<ReturnType<typeof getWorkoutsForUser>>;
}) {
  const latest = workouts[0];

  if (!latest) return <CardDescription>Not workouts yet</CardDescription>;
  if (!latest.completedAt)
    return <Badge variant="secondary">Workout in progress</Badge>;
  return (
    <CardDescription>
      Last workout: {format(latest.startedAt, "do MMM yyyy")}
    </CardDescription>
  );
}

function WorkoutStatsSummary({
  stats,
  workouts,
}: {
  stats: ReturnType<typeof computeWorkoutStats>;
  workouts: Awaited<ReturnType<typeof getWorkoutsForUser>>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 text-sm">
        <Stat label="days this week" value={stats.daysThisWeek} />
        <Separator orientation="vertical" className="h-8" />
        <Stat label="days this month" value={stats.daysThisMonth} />
      </div>
      {stats.topExercise && (
        <CardDescription>
          Most trained: {stats.topExercise.name} (
          {stats.topExercise.percent}% of workouts)
        </CardDescription>
      )}
      <WorkoutStatus workouts={workouts} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="font-heading text-lg font-semibold leading-none">
        {value}
      </div>
      <div className="text-[11px] whitespace-nowrap text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <Navbar />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-6">
        {userId ? (
          <SignedInHero userId={userId} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
            <h1 className="max-w-md text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              Track every lift. See every gain.
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              LiftingDiary is a simple way to log your workouts, sets, and reps
              so you can watch your strength grow over time.
            </p>
            <div className="flex gap-3">
              <SignUpButton>
                <Button size="lg">Get started</Button>
              </SignUpButton>
              <SignInButton>
                <Button variant="outline" size="lg">
                  Sign in
                </Button>
              </SignInButton>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

async function SignedInHero({ userId }: { userId: string }) {
  const [user, workouts] = await Promise.all([
    currentUser(),
    getWorkoutsForUser(userId),
  ]);
  const stats = computeWorkoutStats(workouts);

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <Card className="lg:sticky lg:top-6">
        <CardContent className="flex flex-col items-center gap-4">
          <Avatar className="h-[80%] w-[80%]">
            <AvatarImage src={user?.imageUrl} alt={user?.firstName ?? "You"} />
            <AvatarFallback className="text-2xl">
              {user?.firstName?.[0] ?? "?"}
            </AvatarFallback>
          </Avatar>
          <Button
            className="w-full"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            Go to dashboard
          </Button>
        </CardContent>
      </Card>

      <aside className="flex min-w-0 flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Your status</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkoutStatsSummary stats={stats} workouts={workouts} />
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
