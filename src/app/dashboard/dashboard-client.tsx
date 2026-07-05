"use client"

import * as React from "react"
import { format, isSameDay } from "date-fns"
import { CalendarIcon, Dumbbell } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { WorkoutWithExercises } from "@/data/workouts"

export function DashboardClient({
  workouts,
}: {
  workouts: WorkoutWithExercises[]
}) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [popoverOpen, setPopoverOpen] = React.useState(false)

  const workoutsForDate = workouts.filter((w) =>
    isSameDay(w.startedAt, selectedDate)
  )

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Workouts logged for the selected date.
          </p>
        </div>

        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger
            render={
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="size-4" />
                {format(selectedDate, "do MMM yyyy")}
              </Button>
            }
          />
          <PopoverContent align="end" className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date)
                  setPopoverOpen(false)
                }
              }}
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        {workoutsForDate.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
              <Dumbbell className="size-8 text-muted-foreground" />
              <p className="text-sm font-medium">No workouts logged</p>
              <p className="text-sm text-muted-foreground">
                Nothing logged for {format(selectedDate, "do MMM yyyy")}.
              </p>
            </CardContent>
          </Card>
        ) : (
          workoutsForDate.map((workout) => (
            <Card key={workout.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{workout.name ?? "Workout"}</CardTitle>
                  <Badge variant="secondary">
                    {workout.workoutExercises.length} exercise
                    {workout.workoutExercises.length === 1 ? "" : "s"}
                  </Badge>
                </div>
                <CardDescription>
                  {format(workout.startedAt, "do MMM yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-48">
                  <ul className="flex flex-col gap-2">
                    {workout.workoutExercises.map((workoutExercise) => {
                      const firstSet = workoutExercise.sets[0]
                      const weight = firstSet?.weight
                        ? Number(firstSet.weight)
                        : 0

                      return (
                        <li
                          key={workoutExercise.id}
                          className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
                        >
                          <span className="font-medium">
                            {workoutExercise.exercise.name}
                          </span>
                          <span className="text-muted-foreground">
                            {workoutExercise.sets.length} ×{" "}
                            {firstSet?.reps ?? 0}
                            {weight > 0 ? ` @ ${weight}kg` : ""}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
