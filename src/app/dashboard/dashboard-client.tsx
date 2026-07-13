"use client";

import * as React from "react";
import { format, isSameDay, isToday } from "date-fns";
import { Dumbbell, Flame, ListChecks, Weight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { WorkoutWithExercises } from "@/data/workouts";
import type { Exercise } from "@/data/exercises";
import { EditWorkoutDialog } from "./edit-workout-dialog";
import { LogWorkoutDialog } from "./log-workout-dialog";

export function DashboardClient({
  workouts,
  exercises,
}: {
  workouts: WorkoutWithExercises[];
  exercises: Exercise[];
}) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  const workoutsForDate = workouts.filter((w) =>
    isSameDay(w.startedAt, selectedDate),
  );

  const exerciseCount = workoutsForDate.reduce(
    (sum, w) => sum + w.workoutExercises.length,
    0,
  );
  const setCount = workoutsForDate.reduce(
    (sum, w) =>
      sum + w.workoutExercises.reduce((s, we) => s + we.sets.length, 0),
    0,
  );
  const totalVolume = workoutsForDate.reduce(
    (sum, w) =>
      sum +
      w.workoutExercises.reduce(
        (s, we) =>
          s +
          we.sets.reduce(
            (v, set) => v + set.reps * (set.weight ? Number(set.weight) : 0),
            0,
          ),
        0,
      ),
    0,
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Track and log workouts for any day.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Calendar</CardTitle>
              {/* <LogWorkoutDialog date={selectedDate} exercises={exercises} /> */}
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) setSelectedDate(date);
              }}
              className="w-full [--cell-size:--spacing(9)]"
              classNames={{
                month: "w-full",
                month_grid: "w-full",
              }}
            />
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 ring-1 ring-foreground/5">
            <div className="w-28 shrink-0">
              <p className="font-heading text-lg font-semibold leading-none whitespace-nowrap">
                {isToday(selectedDate) ? "Today" : format(selectedDate, "EEEE")}
              </p>
              <p className="mt-1 text-xs whitespace-nowrap text-muted-foreground">
                {format(selectedDate, "do MMM yyyy")}
              </p>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <Stat
                icon={<Dumbbell className="size-3.5" />}
                label="exercises"
                value={exerciseCount}
              />
              <Separator orientation="vertical" className="h-8" />
              <Stat
                icon={<ListChecks className="size-3.5" />}
                label="sets"
                value={setCount}
              />
              <Separator orientation="vertical" className="h-8" />
              <Stat
                icon={<Weight className="size-3.5" />}
                label="volume (kg)"
                value={totalVolume.toLocaleString()}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {workoutsForDate.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <Dumbbell className="size-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">No workouts logged</p>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    Nothing logged for {format(selectedDate, "do MMM yyyy")}.
                    Use &ldquo;Log workout&rdquo; to add one.
                  </p>
                </CardContent>
              </Card>
            ) : (
              workoutsForDate.map((workout) => (
                <Card key={workout.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Flame className="size-4 text-muted-foreground" />
                        {workout.name ?? "Workout"}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {workout.workoutExercises.length} exercise
                          {workout.workoutExercises.length === 1 ? "" : "s"}
                        </Badge>
                        <EditWorkoutDialog
                          workout={workout}
                          exercises={exercises}
                        />
                      </div>
                    </div>
                    <CardDescription>
                      {format(workout.startedAt, "do MMM yyyy · h:mm a")}
                      {workout.completedAt &&
                        ` – ${format(workout.completedAt, "h:mm a")}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="flex flex-col divide-y divide-border">
                      {workout.workoutExercises.map((workoutExercise) => (
                        <li
                          key={workoutExercise.id}
                          className="py-3 first:pt-0 last:pb-0"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {workoutExercise.exercise.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {workoutExercise.sets.length} set
                              {workoutExercise.sets.length === 1 ? "" : "s"}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {workoutExercise.sets.map((set) => {
                              const weight = set.weight
                                ? Number(set.weight)
                                : 0;
                              return (
                                <Badge
                                  key={set.id}
                                  variant="outline"
                                  className="font-normal text-muted-foreground"
                                >
                                  {set.reps} reps
                                  {weight > 0 ? ` - ${weight}kg` : ""}
                                </Badge>
                              );
                            })}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <LogWorkoutDialog date={selectedDate} exercises={exercises} />
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex w-16 flex-col items-center gap-0.5">
      <div className="flex items-center gap-1 font-heading text-base font-semibold leading-none">
        {value}
      </div>
      <div className="flex items-center gap-1 text-[11px] whitespace-nowrap text-muted-foreground">
        {icon}
        {label}
      </div>
    </div>
  );
}
