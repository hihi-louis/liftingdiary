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

type Workout = {
  id: string
  date: Date
  name: string
  exercises: { name: string; sets: number; reps: number; weight: number }[]
}

const mockWorkouts: Workout[] = [
  {
    id: "1",
    date: new Date(),
    name: "Push Day",
    exercises: [
      { name: "Bench Press", sets: 4, reps: 8, weight: 80 },
      { name: "Overhead Press", sets: 3, reps: 10, weight: 45 },
      { name: "Tricep Pushdown", sets: 3, reps: 12, weight: 25 },
    ],
  },
  {
    id: "2",
    date: new Date(),
    name: "Evening Mobility",
    exercises: [{ name: "Hip Flexor Stretch", sets: 2, reps: 30, weight: 0 }],
  },
]

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [popoverOpen, setPopoverOpen] = React.useState(false)

  const workoutsForDate = mockWorkouts.filter((w) =>
    isSameDay(w.date, selectedDate)
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
                  <CardTitle>{workout.name}</CardTitle>
                  <Badge variant="secondary">
                    {workout.exercises.length} exercise
                    {workout.exercises.length === 1 ? "" : "s"}
                  </Badge>
                </div>
                <CardDescription>
                  {format(workout.date, "do MMM yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="max-h-48">
                  <ul className="flex flex-col gap-2">
                    {workout.exercises.map((exercise, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm"
                      >
                        <span className="font-medium">{exercise.name}</span>
                        <span className="text-muted-foreground">
                          {exercise.sets} × {exercise.reps}
                          {exercise.weight > 0
                            ? ` @ ${exercise.weight}kg`
                            : ""}
                        </span>
                      </li>
                    ))}
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
