"use client"

import * as React from "react"
import { format } from "date-fns"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Exercise } from "@/data/exercises"
import { logWorkout } from "./actions"
import {
  CUSTOM_EXERCISE_VALUE,
  WorkoutFormFields,
  combineDateAndTime,
  type SetInput,
} from "./workout-form-fields"

export function LogWorkoutDialog({
  date,
  exercises,
}: {
  date: Date
  exercises: Exercise[]
}) {
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [workoutDate, setWorkoutDate] = React.useState<Date>(date)
  const [startTime, setStartTime] = React.useState("")
  const [endTime, setEndTime] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [exerciseValue, setExerciseValue] = React.useState<string>("")
  const [customExercise, setCustomExercise] = React.useState("")
  const [sets, setSets] = React.useState<SetInput[]>([
    { reps: "", weight: "" },
  ])

  function resetForm() {
    setWorkoutDate(date)
    setStartTime("")
    setEndTime("")
    setTitle("")
    setExerciseValue("")
    setCustomExercise("")
    setSets([{ reps: "", weight: "" }])
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const exerciseName =
      exerciseValue === CUSTOM_EXERCISE_VALUE ? customExercise : exerciseValue

    const startedAt = combineDateAndTime(workoutDate, startTime)
    if (!startedAt) {
      setError("Please enter a start time.")
      setPending(false)
      return
    }
    const endedAt = combineDateAndTime(workoutDate, endTime)

    const result = await logWorkout({
      startedAt,
      endedAt,
      title: title.trim() || null,
      exerciseName,
      sets: sets.map((set) => ({
        reps: Number(set.reps),
        weight: set.weight === "" ? null : Number(set.weight),
      })),
    })

    setPending(false)
    if (result.error) {
      setError(result.error)
      return
    }

    resetForm()
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (nextOpen) setWorkoutDate(date)
        if (!nextOpen) resetForm()
      }}
    >
      <DialogTrigger
        render={
          <Button className="gap-2">
            <PlusIcon className="size-4" />
            Create workout
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log workout</DialogTitle>
          <DialogDescription>
            Add an exercise for {format(workoutDate, "do MMM yyyy")}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <WorkoutFormFields
            title={title}
            onTitleChange={setTitle}
            workoutDate={workoutDate}
            onWorkoutDateChange={setWorkoutDate}
            startTime={startTime}
            onStartTimeChange={setStartTime}
            endTime={endTime}
            onEndTimeChange={setEndTime}
            exerciseValue={exerciseValue}
            onExerciseValueChange={setExerciseValue}
            customExercise={customExercise}
            onCustomExerciseChange={setCustomExercise}
            sets={sets}
            onSetsChange={setSets}
            exercises={exercises}
          />

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save workout"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
